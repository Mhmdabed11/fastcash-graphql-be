const User = {
  posts: (parent, args, context) => {
    return context.prisma.user({ id: parent.id }).posts();
  }
};

export default User;
