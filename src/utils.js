export const APP_SECRET = "1123456789!@#$%^&*(";
import jwt from "jsonwebtoken";
import { rule } from "graphql-shield";
export const getUserId = context => {
  const Authorization = context.request.get("Authorization");
  if (Authorization) {
    const token = Authorization.replace("Bearer ", "");
    const { userId } = jwt.verify(token, APP_SECRET);
    return userId;
  }
  throw new Error("user not authenticated");
};

export const isAuthenticated = rule({ cache: "contextual" })(
  async (parent, args, context, info) => {
    try {
      const Authorization = context.request.get("Authorization");
      if (!Authorization || Authorization.includes("Bearer ") === false) {
        return false;
      }

      const token = Authorization.replace("Bearer ", "");
      const valid = jwt.verify(token, APP_SECRET);
      if (!valid) {
        return false;
      }
      const { userId } = valid;
      const user = await context.prisma.user({ id: userId });
      if (!user) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }
);
