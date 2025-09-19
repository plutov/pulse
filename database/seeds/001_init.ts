import type { Knex } from "knex";
import { randomUUID } from "crypto";

export async function seed(knex: Knex): Promise<void> {
  await knex("monitors").del();

  await knex("monitors").insert([
    {
      id: randomUUID(),
      name: "sample-monitor-1",
      description: "description-1",
    },
    {
      id: randomUUID(),
      name: "sample-monitor-2",
      description: "description-2",
    },
  ]);
}
