import { Knex } from "knex";
import db from "../connection";
import type Repos from "../../types/database/public/Repos";
import type { ReposInitializer } from "../../types/database/public/Repos";

export type RepoRow = Repos;
export type CreateRepoData = Pick<ReposInitializer, "name" | "description">;
export type UpdateRepoData = Partial<Pick<ReposInitializer, "name" | "description">>;

export class RepoRepository {
  private db: Knex;
  private tableName = "repos";

  constructor(database: Knex = db) {
    this.db = database;
  }

  async findAll(): Promise<RepoRow[]> {
    return this.db(this.tableName).select("*").orderBy("created_at", "desc");
  }

  async findById(id: number): Promise<RepoRow | undefined> {
    return this.db(this.tableName).where({ id }).first<RepoRow>();
  }

  async findByName(name: string): Promise<RepoRow | undefined> {
    return this.db(this.tableName).where({ name }).first<RepoRow>();
  }

  async create(data: CreateRepoData): Promise<RepoRow> {
    const [repo] = await this.db(this.tableName)
      .insert(data)
      .returning<RepoRow[]>("*");
    
    if (!repo) {
      throw new Error("Failed to create repository");
    }
    
    return repo;
  }

  async update(id: number, data: UpdateRepoData): Promise<RepoRow | undefined> {
    const [repo] = await this.db(this.tableName)
      .where({ id })
      .update(data)
      .returning<RepoRow[]>("*");
    return repo;
  }

  async delete(id: number): Promise<boolean> {
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