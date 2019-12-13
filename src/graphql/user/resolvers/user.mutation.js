import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { APP_SECRET, getUserId } from "../../../utils";
const sgMail = require("@sendgrid/mail");
const MailGen = require("mailgen");
const SENDGRID_API_KEY =
  "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";
sgMail.setApiKey(SENDGRID_API_KEY);

const mailGenerator = new MailGen({
  theme: "salted",
  product: {
    name: "Awesome App",
    link: "http://example.com"
    // logo: your app logo url
  }
});

const email = {
  body: {
    name: "Jon Doe",
    intro: "Welcome to email verification",
    action: {
      instructions: "Please click the button below to verify your account",
      button: {
        color: "#33b5e5",
        text: "Verify account",
        link: "http://example.com/verify_account"
      }
    }
  }
};

const emailTemplate = mailGenerator.generate(email);
require("fs").writeFileSync("preview.html", emailTemplate, "utf8");

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
    const msg = {
      to: args.email,
      from: "mabed4297@gmail.com",
      subject: "Sending with Twilio SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: emailTemplate
    };
    sgMail.send(msg);
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
