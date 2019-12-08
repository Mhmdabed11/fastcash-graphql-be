export const APP_SECRET = "1123456789!@#$%^&*(";
import jwt from "jsonwebtoken";
export const getUserId = context => {
  const Authorization = context.request.get("Authorization");
  if (Authorization) {
    const token = Authorization.replace("Bearer ", "");
    const { userId } = jwt.verify(token, APP_SECRET);
    return userId;
  }
  throw new Error("user not authenticated");
};
