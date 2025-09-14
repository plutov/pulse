module.exports = {
  connection: {
    host: process.env["DB_HOST"],
    port: parseInt(process.env["DB_PORT"]),
    user: process.env["DB_USER"],
    password: process.env["DB_PASSWORD"],
    database: process.env["DB_NAME"],
    ssl: process.env["DB_SSL"] === "true" ? { rejectUnauthorized: false } : false
  },
  outputPath: "./src/types/database",
  customTypeMap: {
    "pg_catalog.tsvector": "string",
    "pg_catalog.bpchar": "string",
  },
};
