import { mergeResolvers } from "merge-graphql-schemas";
import userResolver from "./user/resolvers";
import postResolver from "./post/resolvers";
const resolvers = [userResolver, postResolver];
export default mergeResolvers(resolvers);
