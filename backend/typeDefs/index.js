import { mergeTypeDefs } from "@graphql-tools/merge";
import userTypeDef from "../typeDefs/user.typeDef.js";
import transactionTypeDef from "../typeDefs/transaction.typeDef.js";

const mergedTypeDefs = mergeTypeDefs([userTypeDef, transactionTypeDef]);

export default mergedTypeDefs;
