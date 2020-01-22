import { getUserId } from "../../../utils";

const Mutation = {
  createPost: async (root, args, context, info) => {
    const userId = getUserId(context);
    const post = await context.prisma.createPost({
      ...args,
      skills: { set: args.skills },
      author: { connect: { id: userId } }
    });
    return post;
  },
  updatePost: async (root, args, context, info) => {
    const id = args.id;
    const post = await context.prisma.post({ id });
    if (!post) {
      throw new Error("post not found");
    }
    const argsWithoutId = { ...args };
    delete argsWithoutId.id;
    const newPost = await context.prisma.updatePost({
      where: { id },
      data: {
        ...argsWithoutId,
        skills: { set: args.skills }
      }
    });
    return newPost;
  },
  deletePost: async (root, args, context, info) => {
    const id = args.id;
    const post = await context.prisma.post({ id });
    if (!post) {
      throw new Error("post not found");
    }
    await context.prisma.deletePost({ id: args.id });
    return "the post has been deleted";
  }
};

export default Mutation;
