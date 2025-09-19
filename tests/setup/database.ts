import knex, { Knex } from "knex";
import config from "../../knexfile";

let knexInstance: Knex;

export function getTestDb(): Knex {
  knexInstance = knexInstance || knex(config);
  return knexInstance;
}

export async function closeTestDb(): Promise<void> {
  await knexInstance.destroy();
}
