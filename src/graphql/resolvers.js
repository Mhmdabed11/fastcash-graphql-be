import { mergeResolvers } from "merge-graphql-schemas";
import userResolver from "./user/resolvers";
const resolvers = [userResolver];
export default mergeResolvers(resolvers);
