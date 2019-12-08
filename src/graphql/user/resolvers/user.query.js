const Query = {
  user: async (root, args, context, info) => {
    try {
      const user = await context.prisma.user({ id: args.id });
      if (!user) {
        throw new Error("user not found");
      }
      return user;
    } catch (err) {
      return err;
    }
  }
};

export default Query;
