import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { APP_SECRET, getUserId } from "../../../utils";

const Mutation = {
  signup: async (root, args, context, info) => {
    const password = await bcrypt.hash(args.password, 10);
    const user = await context.prisma.createUser({ ...args, password });
    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    return {
      token,
      user
    };
  },
  login: async (root, args, context, info) => {
    const user = await context.prisma.user({ email: args.email });
    if (!user) {
      throw new Error("user not found");
    }
    const valid = await bcrypt.compare(args.password, user.password);
    if (!valid) {
      throw new Error("invalid username or password");
    }
    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    return {
      token,
      user
    };
  },
  updateUser: async (root, args, context, info) => {
    const id = getUserId(context);
    const updateUser = await context.prisma.updateUser({
      where: { id },
      data: args
    });
    return updateUser;
  },
  deleteUser: async (root, args, context, info) => {
    const id = getUserId(context);
    if (id !== args.id) {
      throw new Error("you cannot delete the profile of another user");
    }
    const user = await context.prisma.user({ id: args.id });
    if (!user) {
      throw new Error("user not found");
    }
    await context.prisma.deleteUser({ id: args.id });
    return "the user has been deleted";
  }
};
export default Mutation;
