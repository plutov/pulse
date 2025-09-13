import knex, { Knex } from "knex";
import config from "../../knexfile";

const environment = process.env["NODE_ENV"] || "development";
const knexConfig = config[environment];

if (!knexConfig) {
  throw new Error(`No database configuration found for environment: ${environment}`);
}

export const db: Knex = knex(knexConfig);

export default db;