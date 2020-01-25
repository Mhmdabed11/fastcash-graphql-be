const Query = {
  post: async (root, args, context, info) => {
    const { id } = args;
    const post = await context.prisma.post({ id });
    return post;
  },
  posts: async (root, args, context, info) => {
    let partialFilter = {};
    if (args.filter) {
      partialFilter.title_contains = args.filter;
    }
    if (args.location) {
      partialFilter.location = args.location;
    }
    if (args.category) {
      partialFilter.category_contains = args.category;
    }
    const where = partialFilter;
    const posts = await context.prisma.posts({
      skip: args.skip,
      first: args.first,
      last: args.last,
      where
    });
    return posts;
  }
};

export default Query;
