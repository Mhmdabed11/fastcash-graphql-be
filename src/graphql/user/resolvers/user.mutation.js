import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { APP_SECRET, getUserId } from "../../../utils";
const {
  ForbiddenError,
  UserInputError,
  ApolloError,
  AuthenticationError
} = require("apollo-server-core");
const sgMail = require("@sendgrid/mail");
const MailGen = require("mailgen");
const SENDGRID_API_KEY =
  "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";
sgMail.setApiKey(SENDGRID_API_KEY);

// const mailGenerator = new MailGen({
//   theme: "salted",
//   product: {
//     name: "Awesome App",
//     link: "http://example.com"
//     // logo: your app logo url
//   }
// });

// const email = {
//   body: {
//     name: "Jon Doe",
//     intro: "Welcome to email verification",
//     action: {
//       instructions: "Please click the button below to verify your account",
//       button: {
//         color: "#33b5e5",
//         text: "Verify account",
//         link: "http://example.com/verify_account"
//       }
//     }
//   }
// };

// const emailTemplate = mailGenerator.generate(email);
// require("fs").writeFileSync("preview.html", emailTemplate, "utf8");

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
        await context.prisma.createEmailVerificationHash({
          hash
        });
      });

      const token = jwt.sign({ userId: newUser.id }, APP_SECRET);

      // const msg = {
      //   to: args.email,
      //   from: "mabed4297@gmail.com",
      //   subject: "Sending with Twilio SendGrid is Fun",
      //   text: "and easy to do anywhere, even with Node.js",
      //   html: emailTemplate
      // };
      // sgMail.send(msg);
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
        data: args
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
  }
};
export default Mutation;
