const Query = {
  post: async (root, args, context, info) => {
    const { id } = args;
    const post = await context.prisma.post({ id });
    return post;
  },
  posts: async (root, args, context, info) => {
    const posts = await context.prisma.posts({
      skip: args.skip,
      first: args.first
    });
    return posts;
  }
};

export default Query;
