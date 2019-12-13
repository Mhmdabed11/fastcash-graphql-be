import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { APP_SECRET, getUserId } from "../../../utils";

const Mutation = {
  signup: async (root, args, context, info) => {
    if (args.password !== args.confirmPassword) {
      throw new Error("passwords do not match");
    }
    const argsWithoutConfirmPassword = { ...args };
    delete argsWithoutConfirmPassword.confirmPassword;
    const password = await bcrypt.hash(args.password, 10);
    const user = await context.prisma.createUser({
      ...argsWithoutConfirmPassword,
      password
    });
    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    return {
      token,
      user
    };
  },
  login: async (root, args, context, info) => {
    const user = await context.prisma.user({ email: args.email });
    if (!user) {
      throw new Error("invalid username or password");
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
    const user = await context.prisma.user({ id });
    if (!user) {
      throw new Error("user not found");
    }
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
    await context.prisma.deleteManyPosts({
      author: {
        id: user.id
      }
    });
    if (!user) {
      throw new Error("user not found");
    }
    await context.prisma.deleteUser({ id: args.id });
    return "the user has been deleted";
  }
};
export default Mutation;
