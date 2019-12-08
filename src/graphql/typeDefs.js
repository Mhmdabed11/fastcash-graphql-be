import path from "path";
const mergeGraphqlSchemas = require("merge-graphql-schemas");
const fileLoader = mergeGraphqlSchemas.fileLoader;
const mergeTypes = mergeGraphqlSchemas.mergeTypes;
const typesArray = fileLoader(`${__dirname}/**/types/*.graphql`);

export default mergeTypes(typesArray);
