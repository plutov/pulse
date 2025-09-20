import type { Knex } from "knex";
import { randomUUID } from "crypto";
import * as bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
  await knex("monitors").del();
  await knex("users").del();

  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const userId = randomUUID();

  await knex("users").insert([
    {
      id: userId,
      username: "admin",
      password_hash: adminPasswordHash,
    },
  ]);

  await knex("monitors").insert([
    {
      id: randomUUID(),
      author: userId,
      name: "sample-monitor-1",
      description: "description-1",
      monitor_type: "http",
    },
    {
      id: randomUUID(),
      author: userId,
      name: "sample-monitor-2",
      description: "description-2",
      monitor_type: "http",
    },
  ]);
}
