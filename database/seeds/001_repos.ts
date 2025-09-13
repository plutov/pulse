import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("repos").del();

  await knex("repos").insert([
    {
      name: "sample-repo-1",
      description: "First sample repository"
    },
    {
      name: "sample-repo-2",
      description: "Second sample repository"
    }
  ]);
}