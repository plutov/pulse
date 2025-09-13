const config = {
  connection: {
    host: process.env["DB_HOST"] || "localhost",
    port: parseInt(process.env["DB_PORT"] || "5432"),
    user: process.env["DB_USER"] || "postgres",
    password: process.env["DB_PASSWORD"] || "postgres",
    database: process.env["DB_NAME"] || "tsar_dev",
  },
  outputPath: "./src/types/database",

  customTypeMap: {
    "pg_catalog.tsvector": "string",
    "pg_catalog.bpchar": "string",
  },
};

module.exports = config;