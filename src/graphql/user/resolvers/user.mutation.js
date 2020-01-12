import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { APP_SECRET, getUserId } from "../../../utils";
import { sendVerificationEmail } from "../../../helpers/sendVerificationEmail";
const {
  ForbiddenError,
  UserInputError,
  ApolloError,
  AuthenticationError
} = require("apollo-server-core");

const Mutation = {
  signup: async (root, args, context, info) => {
    try {
      if (args.password !== args.confirmPassword) {
        throw new UserInputError("Passwords do not match", 400);
      }
      const argsWithoutConfirmPassword = { ...args };
      delete argsWithoutConfirmPassword.confirmPassword;
      const password = await bcrypt.hash(args.password, 10);

      // check if user exists and throw error if it does
      const user = await context.prisma.user({ email: args.email });
      if (user) {
        throw new ForbiddenError("User already exists", 403);
      }
      const newUser = await context.prisma.createUser({
        ...argsWithoutConfirmPassword,
        password
      });
      bcrypt.hash(newUser.email, 10, async function(err, hash) {
        if (err) {
          throw new ApolloError(err, 500);
        }
        const newHash = hash.replace(/\//g, "slash");
        await context.prisma.createEmailVerificationHash({
          hash: newHash
        });
        sendVerificationEmail(args.email, newHash);
      });
      const token = jwt.sign({ userId: newUser.id }, APP_SECRET);

      return {
        token,
        user: newUser
      };
    } catch (err) {
      throw new ApolloError(err, 500);
    }
  },

  login: async (root, args, context, info) => {
    try {
      const user = await context.prisma.user({ email: args.email });
      if (!user) {
        throw new AuthenticationError("Invalid username or password", 401);
      }
      if (!user.active) {
        throw new AuthenticationError(
          "Please activate your account before logging in",
          401
        );
      }
      const valid = await bcrypt.compare(args.password, user.password);
      if (!valid) {
        throw new AuthenticationError("Invalid username or password", 401);
      }
      const token = jwt.sign({ userId: user.id }, APP_SECRET);

      return {
        token,
        user
      };
    } catch (err) {
      throw new ApolloError(err, 500);
    }
  },
  updateUser: async (root, args, context, info) => {
    try {
      const id = getUserId(context);
      const user = await context.prisma.user({ id });
      if (!user) {
        throw new Error("User not found", 404);
      }
      const updatedUser = await context.prisma.updateUser({
        where: { id },
        data: {
          ...args,
          skills: { set: args.skills }
        }
      });
      return updatedUser;
    } catch (err) {
      throw new ApolloError(err, 500);
    }
  },
  deleteUser: async (root, args, context, info) => {
    try {
      const id = getUserId(context);
      if (id !== args.id) {
        throw new ForbiddenError(
          "You cannot delete the profile of another user",
          403
        );
      }
      const user = await context.prisma.user({ id: args.id });
      if (!user) {
        throw new Error("User not found", 404);
      }
      await context.prisma.deleteManyPosts({
        author: {
          id: user.id
        }
      });
      await context.prisma.deleteUser({ id: args.id });
      return "The user has been deleted";
    } catch (err) {
      throw new ApolloError(err, 500);
    }
  },
  sendActivationEmail: async (root, args, context, info) => {
    try {
      const user = await context.prisma.user({ email: args.email });
      if (!user) {
        throw new Error("User not found", 404);
      }
      if (user.active === true) {
        throw new Error(
          "The account that belongs to this user is already active",
          400
        );
      }
      bcrypt.hash(args.email, 10, async function(err, hash) {
        if (err) {
          throw new ApolloError(err, 500);
        }

        const newHash = hash.replace(/\//g, "slash");
        await context.prisma.createEmailVerificationHash({
          hash: newHash
        });
        sendVerificationEmail(args.email, newHash);
      });

      return "Email Sent";
    } catch (err) {
      throw new ApolloError(err, 500);
    }
  },
  activateAccount: async (root, args, context, info) => {
    try {
      const user = await context.prisma.user({ email: args.email });
      if (!user) {
        throw new Error("User not found", 404);
      }
      const hashObject = await context.prisma.emailVerificationHash({
        hash: args.hash
      });
      if (hashObject) {
        let { hash } = hashObject;
        hash = hash.replace(/slash/g, "/");

        const match = await bcrypt.compare(args.email, hash);
        if (match) {
          const updatedUser = await context.prisma.updateUser({
            where: { email: args.email },
            data: { active: true }
          });
          await context.prisma.deleteEmailVerificationHash({
            id: hashObject.id
          });
          return updatedUser;
        }
      }
      throw new Error("Couldn't activate account");
    } catch (err) {
      throw new ApolloError(err, 500);
    }
  }
};

export default Mutation;
