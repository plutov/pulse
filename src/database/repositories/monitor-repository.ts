import { Knex } from "knex";
import { getDb } from "../connection";
import { randomUUID } from "crypto";
import Monitors from "../types/public/Monitors";

export class MonitorRepository {
  private db: Knex;
  private tableName = "monitors";

  constructor(database?: Knex) {
    this.db = database || getDb();
  }

  async findAll(): Promise<Monitors[]> {
    return this.db(this.tableName).select("*").orderBy("created_at", "desc");
  }

  async findById(id: string): Promise<Monitors | undefined> {
    return this.db(this.tableName).where({ id }).first<Monitors>();
  }

  async findByName(name: string): Promise<Monitors | undefined> {
    return this.db(this.tableName).where({ name }).first<Monitors>();
  }

  async create(data: Monitors): Promise<Monitors> {
    const monitorWithId = {
      ...data,
      id: randomUUID(),
    };

    const [monitor] = await this.db(this.tableName)
      .insert(monitorWithId)
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
}
