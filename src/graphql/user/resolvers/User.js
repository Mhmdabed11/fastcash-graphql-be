const User = {
  posts: async (parent, args, context) => {
    return await context.prisma.user({ id: parent.id }).posts();
  }
};

export default User;
