import { Knex } from "knex";
import { getDb } from "../connection";
import Monitors, { MonitorsInitializer } from "../types/public/Monitors";
import { CreateMonitorPayload, HttpConfig, Monitor } from "@pulse/shared";

export interface MonitorWithAuthor extends Monitors {
  author_username: string;
}

export interface ListMonitorsOptions {
  active?: boolean;
}

export class MonitorRepository {
  private db: Knex;
  private tableName = "monitors";

  constructor(database?: Knex) {
    this.db = database || getDb();
  }

  async findAll(options: ListMonitorsOptions): Promise<MonitorWithAuthor[]> {
    const q = this.db(this.tableName)
      .select("monitors.*", "users.username as author_username")
      .join("users", "monitors.author", "users.id");

    if (options.active) {
      q.where("monitors.status", "active");
    }
    q.orderBy("monitors.created_at", "desc");
    return q;
  }

  async findById(id: string): Promise<MonitorWithAuthor | undefined> {
    return this.db(this.tableName)
      .select("monitors.*", "users.username as author_username")
      .join("users", "monitors.author", "users.id")
      .where("monitors.id", id)
      .first<MonitorWithAuthor>();
  }

  async findByName(name: string): Promise<Monitors | undefined> {
    return this.db(this.tableName).where({ name }).first<Monitors>();
  }

  async create(data: MonitorsInitializer): Promise<Monitors> {
    const [monitor] = await this.db(this.tableName)
      .insert(data)
      .returning<Monitors[]>("*");

    if (!monitor) {
      throw new Error("Failed to create monitor");
    }

    return monitor;
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.db(this.tableName).where({ id }).del();
    return deletedCount > 0;
  }

  async deleteByAuthor(author: string): Promise<boolean> {
    const deletedCount = await this.db(this.tableName).where({ author }).del();
    return deletedCount > 0;
  }
}

export function convertMonitorRowToApi(row: MonitorWithAuthor): Monitor {
  const res: Monitor = {
    id: row.id,
    name: row.name,
    monitorType: row.monitor_type,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    author: {
      id: row.author,
      username: row.author_username,
    },
    schedule: row.schedule,
    status: row.status,
    config: row.config as HttpConfig,
  };
  return res;
}

export function convertMonitorRowsToApi(rows: MonitorWithAuthor[]): Monitor[] {
  return rows.map(convertMonitorRowToApi);
}

export function convertCreateMonitorPayloadToDb(
  payload: CreateMonitorPayload,
  authorId: string,
  id: string,
): MonitorsInitializer {
  return {
    id,
    author: authorId,
    monitor_type: payload.monitorType,
    name: payload.name,
    schedule: payload.schedule,
    status: payload.status,
    config: payload.config,
  };
}
