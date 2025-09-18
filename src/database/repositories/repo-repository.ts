import { Knex } from "knex";
import db from "../connection";
import { randomUUID } from "crypto";

export interface RepoRow {
  id: string;
  name: string;
  description: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export type CreateRepoData = Pick<RepoRow, "name"> & { description?: string | null };
export type UpdateRepoData = Partial<Pick<RepoRow, "name" | "description">>;

export class RepoRepository {
  private db: Knex;
  private tableName = "repos";

  constructor(database: Knex = db) {
    this.db = database;
  }

  async findAll(): Promise<RepoRow[]> {
    return this.db(this.tableName).select("*").orderBy("created_at", "desc");
  }

  async findById(id: string): Promise<RepoRow | undefined> {
    return this.db(this.tableName).where({ id }).first<RepoRow>();
  }

  async findByName(name: string): Promise<RepoRow | undefined> {
    return this.db(this.tableName).where({ name }).first<RepoRow>();
  }

  async create(data: CreateRepoData): Promise<RepoRow> {
    const repoWithId = {
      ...data,
      id: randomUUID(),
    };
    
    const [repo] = await this.db(this.tableName)
      .insert(repoWithId)
      .returning<RepoRow[]>("*");
    
    if (!repo) {
      throw new Error("Failed to create repository");
    }
    
    return repo;
  }

  async update(id: string, data: UpdateRepoData): Promise<RepoRow | undefined> {
    const [repo] = await this.db(this.tableName)
      .where({ id })
      .update(data)
      .returning<RepoRow[]>("*");
    return repo;
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.db(this.tableName)
      .where({ id })
      .del();
    return deletedCount > 0;
  }

  async exists(name: string): Promise<boolean> {
    const repo = await this.db(this.tableName)
      .where({ name })
      .first<RepoRow>();
    return !!repo;
  }
}