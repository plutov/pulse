import type { Knex } from "knex";
import { randomUUID } from "crypto";
import * as bcrypt from "bcrypt";
import { TEST_USER_ID } from "../../tests/utils/auth";

export async function seed(knex: Knex): Promise<void> {
  await knex("monitors").del();
  await knex("users").del();

  const adminPasswordHash = await bcrypt.hash("admin123", 12);

  await knex("users").insert([
    {
      id: TEST_USER_ID,
      username: "admin",
      password_hash: adminPasswordHash,
    },
  ]);

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
