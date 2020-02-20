const Post = {
  author: async (root, args, context, info) => {
    return await context.prisma.post({ id: root.id }).author();
  }
};

export default Post;
