import jwt from "jsonwebtoken";
import { APP_SECRET, getUserId } from "../../../utils";
import { request } from "../../../helpers/request";

const FacebookGraphAPI = request("https://graph.facebook.com/v6.0/");

const { ForbiddenError, ApolloError } = require("apollo-server-core");

const Mutation = {
  login: async (root, args, context, info) => {
    try {
      let firstName, lastName, userEmail, profilePicture;
      if (args.authType === "fb") {
        const {
          first_name,
          last_name,
          email,
          picture
        } = await FacebookGraphAPI.get("/me", {
          fields: "id,first_name,last_name,email,picture",
          access_token: args.accessToken
        });
        firstName = first_name;
        lastName = last_name;
        userEmail = email;
        profilePicture = picture.data.url;
      }
      const user = await context.prisma.user({ email: userEmail });
      if (!user) {
        const newUser = await context.prisma.createUser({
          firstName,
          lastName,
          email: userEmail,
          profilePicture
        });
        const token = jwt.sign({ userId: newUser.id }, APP_SECRET);
        return {
          token,
          user: newUser
        };
      }
      const token = jwt.sign({ userId: user.id }, APP_SECRET);
      return {
        token,
        user
      };
    } catch (err) {
      return new ApolloError(err, 500);
    }
  },
  updateUser: async (root, args, context, info) => {
    try {
      const id = getUserId(context);
      const user = await context.prisma.user({ id });
      if (!user) {
        return new Error("User not found");
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
      return new ApolloError(err, 500);
    }
  },
  deleteUser: async (root, args, context, info) => {
    try {
      const id = getUserId(context);
      if (id !== args.id) {
        return new ForbiddenError(
          "You cannot delete the profile of another user"
        );
      }
      const user = await context.prisma.user({ id: args.id });
      if (!user) {
        return new Error("User not found");
      }
      await context.prisma.deleteManyPosts({
        author: {
          id: user.id
        }
      });
      await context.prisma.deleteUser({ id: args.id });
      return "The user has been deleted";
    } catch (err) {
      return new ApolloError(err, 500);
    }
  }
};

export default Mutation;
