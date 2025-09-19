module.exports = {
  connection: {
    host: process.env["DB_HOST"],
    port: parseInt(process.env["DB_PORT"]),
    user: process.env["DB_USER"],
    password: process.env["DB_PASSWORD"],
    database: process.env["DB_NAME"],
    ssl: process.env["DB_SSL"] === "true",
  },
  outputPath: "./src/types/database",
  customTypeMap: {},
};
