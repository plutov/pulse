import knex, { Knex } from "knex";
import config from "../../knexfile";
import { createTestUser } from "../utils/auth";

let knexInstance: Knex;

export function getTestDb(): Knex {
  knexInstance = knexInstance || knex(config);
  return knexInstance;
}

export async function resetTestDb(): Promise<void> {
  const db = getTestDb();
  await db.raw("TRUNCATE TABLE monitors RESTART IDENTITY CASCADE");
  await db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
  await createTestUser();
}

export async function closeTestDb(): Promise<void> {
  await knexInstance.destroy();
}
