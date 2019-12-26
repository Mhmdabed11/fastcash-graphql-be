const { ApolloError } = require("apollo-server-core");
const Query = {
  user: async (root, args, context, info) => {
    try {
      const user = await context.prisma.user({ id: args.id });
      if (!user) {
        throw new Error("User not found", 404);
      }
      return user;
    } catch (err) {
      throw new ApolloError(err, 500);
    }
  }
};

export default Query;
