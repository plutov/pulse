const { recase } = require("@kristiandupont/recase");

const toPascalCase = recase("snake", "pascal");

module.exports = {
  connection: {
    host: process.env["DB_HOST"],
    port: parseInt(process.env["DB_PORT"]),
    user: process.env["DB_USER"],
    password: process.env["DB_PASSWORD"],
    database: process.env["DB_NAME"],
    ssl: process.env["DB_SSL"] === "true",
  },
  outputPath: "./src/models/types",
  customTypeMap: {
    "pg_catalog.uuid": "string",
  },
  // Use strings for UUIDs
  generateIdentifierType: (c, d) => {
    const name = toPascalCase(c.name);
    return {
      declarationType: "typeDeclaration",
      name,
      exportAs: "named",
      typeDefinition: [`string`],
      comment: [`Identifier type for ${d.name}`],
    };
  },
};
