import knex, { Knex } from "knex";
import config from "../../knexfile";

let db: Knex | null = null;

export function getDb(): Knex {
  if (!db) {
    db = knex(config);
  }
  return db;
}

export function resetDb(): void {
  if (db) {
    db.destroy();
    db = null;
  }
}

export default getDb();
