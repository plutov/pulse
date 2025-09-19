import knex, { Knex } from "knex";
import config from "../../knexfile";

let knexInstance: Knex;

export function getTestDb(): Knex {
  knexInstance = knexInstance || knex(config);
  return knexInstance;
}

export async function cleanupTestDb(): Promise<void> {
  const db = getTestDb();
  await db.raw("TRUNCATE TABLE monitors RESTART IDENTITY CASCADE");
}

export async function closeTestDb(): Promise<void> {
  if (knexInstance) {
    await knexInstance.destroy();
  }
}
