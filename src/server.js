import { GraphQLServer } from "graphql-yoga";

const server = new GraphQLServer({});

server.start(() =>
  console.log("Server is now up and running on http://localhost:4000")
);
