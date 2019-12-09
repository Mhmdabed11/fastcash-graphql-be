const Mutation = {
  createPost: async (root, args, context, info) => {
    console.log(args);
    const post = await context.prisma.createPost({
      ...args,
      skillsRequired: { set: args.skillsRequired }
    });
    return post;
  }
};

export default Mutation;
