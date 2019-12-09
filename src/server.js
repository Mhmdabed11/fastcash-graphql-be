import { GraphQLServer } from "graphql-yoga";
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import { prisma } from "../prisma/generated/prisma-client";
import jwt from "jsonwebtoken";
import { APP_SECRET } from "./utils";
import { rule, shield, not } from "graphql-shield";

const isAuthenticated = rule({ cache: "contextual" })(
  async (parent, args, context, info) => {
    try {
      const Authorization = context.request.get("Authorization");
      if (!Authorization || Authorization.includes("Bearer ") === false) {
        return false;
      }

      const token = Authorization.replace("Bearer ", "");
      const valid = jwt.verify(token, APP_SECRET);
      if (!valid) {
        return false;
      }
      const { userId } = valid;
      const user = await context.prisma.user({ id: userId });
      if (!user) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }
);

const permissions = shield({
  Query: {
    user: isAuthenticated,
    post: isAuthenticated
  },
  Mutation: {
    signup: not(isAuthenticated),
    login: not(isAuthenticated),
    updateUser: isAuthenticated,
    deleteUser: isAuthenticated,
    createPost: isAuthenticated
  }
});

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: request => ({ ...request, prisma }),
  middlewares: [permissions]
});

server.start(() => {
  console.log("Server is now up and running on http://localhost:4000");
});
