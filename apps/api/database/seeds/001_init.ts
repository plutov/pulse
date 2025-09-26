import type { Knex } from "knex";
import { randomUUID } from "crypto";
import * as bcrypt from "bcrypt";
import MonitorType from "../../src/models/types/public/MonitorType";
import MonitorStatus from "../../src/models/types/public/MonitorStatus";

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
      name: "pliutau.com",
      description: "",
      monitor_type: MonitorType.http,
      status: MonitorStatus.active,
      schedule: "* * * * *",
      config: {
        url: "https://pliutau.com",
        method: "GET",
      },
    },
    {
      id: randomUUID(),
      author: userId,
      name: "gitprint.me",
      description: "",
      monitor_type: MonitorType.http,
      status: MonitorStatus.active,
      schedule: "* * * * *",
      config: {
        url: "https://gitprint.me",
        method: "GET",
      },
    },
    {
      id: randomUUID(),
      author: userId,
      name: "packagemain.tech",
      description: "",
      monitor_type: MonitorType.http,
      status: MonitorStatus.active,
      schedule: "* * * * *",
      config: {
        url: "https://packagemain.tech",
        method: "GET",
      },
    },
    {
      id: randomUUID(),
      author: userId,
      name: "ls -la",
      description: "",
      monitor_type: MonitorType.shell,
      status: MonitorStatus.active,
      schedule: "* * * * *",
      config: {
        command: "ls -la",
      },
    },
  ]);
}
