import type { Knex } from "knex";

const config: Knex.Config = {
  client: "postgresql",
  connection: {
    host: process.env["DB_HOST"]!,
    port: parseInt(process.env["DB_PORT"]!),
    user: process.env["DB_USER"]!,
    password: process.env["DB_PASSWORD"]!,
    database: process.env["DB_NAME"]!,
    ssl: process.env["DB_SSL"] === "true",
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "./database/migrations",
  },
  seeds: {
    directory: "./database/seeds",
  },
};

export default config;

