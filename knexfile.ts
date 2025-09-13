import type { Knex } from "knex";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: {
      host: process.env["DB_HOST"] || "localhost",
      port: parseInt(process.env["DB_PORT"] || "5432"),
      user: process.env["DB_USER"] || "postgres",
      password: process.env["DB_PASSWORD"] || "postgres",
      database: process.env["DB_NAME"] || "tsar_dev",
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
  },

  production: {
    client: "postgresql",
    connection: {
      host: process.env["DB_HOST"] || "localhost",
      port: parseInt(process.env["DB_PORT"] || "5432"),
      user: process.env["DB_USER"] || "postgres",
      password: process.env["DB_PASSWORD"] || "postgres",
      database: process.env["DB_NAME"] || "tsar_prod",
      ssl: process.env["DB_SSL"] ? { rejectUnauthorized: false } : false,
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
  },
};

export default config;