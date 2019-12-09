import { APP_SECRET, getUserId } from "../../../utils";
const Query = {
  post: async (root, args, context, info) => {
    const post = await context.prisma.post({ id });
    return post;
  }
};

export default Query;
