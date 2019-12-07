import { GraphQLServer } from "graphql-yoga";
import typeDefs from "./graphql";
const resolvers = {};
const server = new GraphQLServer({
  typeDefs,
  resolvers: () => true
});

server.start(() =>
  console.log("Server is now up and running on http://localhost:4000")
);
