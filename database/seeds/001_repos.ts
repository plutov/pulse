import type { Knex } from "knex";
import { randomUUID } from "crypto";

export async function seed(knex: Knex): Promise<void> {
  await knex("repos").del();

  await knex("repos").insert([
    {
      id: randomUUID(),
      name: "sample-repo-1",
      description: "First sample repository",
    },
    {
      id: randomUUID(),
      name: "sample-repo-2",
      description: "Second sample repository",
    },
  ]);
}
