import { GraphQLServer } from "graphql-yoga";
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import { prisma } from "../prisma/generated/prisma-client";
import jwt from "jsonwebtoken";
import { APP_SECRET, isAuthenticated } from "./utils";
import { rule, shield, not } from "graphql-shield";

const permissions = shield({
  Query: {
    // user: isAuthenticated,
    post: isAuthenticated
  },
  Mutation: {
    login: not(isAuthenticated),
    updateUser: isAuthenticated,
    deleteUser: isAuthenticated,
    createPost: isAuthenticated,
    updatePost: isAuthenticated,
    deletePost: isAuthenticated
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
