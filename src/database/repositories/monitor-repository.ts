import { Knex } from "knex";
import { getDb } from "../connection";
import { randomUUID } from "crypto";

export interface MonitorRow {
  id: string;
  name: string;
  description: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export type CreateMonitorData = Pick<MonitorRow, "name"> & {
  description?: string | null;
};
export type UpdateMonitorData = Partial<
  Pick<MonitorRow, "name" | "description">
>;

export class MonitorRepository {
  private db: Knex;
  private tableName = "monitors";

  constructor(database?: Knex) {
    this.db = database || getDb();
  }

  async findAll(): Promise<MonitorRow[]> {
    return this.db(this.tableName).select("*").orderBy("created_at", "desc");
  }

  async findById(id: string): Promise<MonitorRow | undefined> {
    return this.db(this.tableName).where({ id }).first<MonitorRow>();
  }

  async findByName(name: string): Promise<MonitorRow | undefined> {
    return this.db(this.tableName).where({ name }).first<MonitorRow>();
  }

  async create(data: CreateMonitorData): Promise<MonitorRow> {
    const monitorWithId = {
      ...data,
      id: randomUUID(),
    };

    const [monitor] = await this.db(this.tableName)
      .insert(monitorWithId)
      .returning<MonitorRow[]>("*");

    if (!monitor) {
      throw new Error("Failed to create monitor");
    }

    return monitor;
  }

  async update(
    id: string,
    data: UpdateMonitorData,
  ): Promise<MonitorRow | undefined> {
    const [monitor] = await this.db(this.tableName)
      .where({ id })
      .update(data)
      .returning<MonitorRow[]>("*");
    return monitor;
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.db(this.tableName).where({ id }).del();
    return deletedCount > 0;
  }

  async exists(name: string): Promise<boolean> {
    const monitor = await this.db(this.tableName)
      .where({ name })
      .first<MonitorRow>();
    return !!monitor;
  }
}
