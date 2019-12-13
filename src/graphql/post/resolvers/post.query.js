const Query = {
  post: async (root, args, context, info) => {
    const { id } = args;
    const post = await context.prisma.post({ id });
    return post;
  }
};

export default Query;
