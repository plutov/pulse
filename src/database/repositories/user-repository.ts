import { Knex } from "knex";
import { getDb } from "../connection";
import { randomUUID } from "crypto";
import * as bcrypt from "bcrypt";

export interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  created_at: Date | null;
  updated_at: Date | null;
}

export type CreateUserData = Pick<UserRow, "username"> & {
  password: string;
};

export type UpdateUserData = Partial<Pick<UserRow, "username">> & {
  password?: string;
};

export type UserResponse = Omit<UserRow, "password_hash">;

export class UserRepository {
  private db: Knex;
  private tableName = "users";
  private saltRounds = 12;

  constructor(database?: Knex) {
    this.db = database || getDb();
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.db(this.tableName)
      .select("id", "username", "created_at", "updated_at")
      .orderBy("created_at", "desc");
    return users;
  }

  async findById(id: string): Promise<UserResponse | undefined> {
    const user = await this.db(this.tableName)
      .select("id", "username", "created_at", "updated_at")
      .where({ id })
      .first<UserResponse>();
    return user;
  }

  async findByUsername(username: string): Promise<UserRow | undefined> {
    return this.db(this.tableName).where({ username }).first<UserRow>();
  }

  async findByEmail(email: string): Promise<UserRow | undefined> {
    return this.db(this.tableName).where({ email }).first<UserRow>();
  }

  async create(data: CreateUserData): Promise<UserResponse> {
    const passwordHash = await bcrypt.hash(data.password, this.saltRounds);

    const userWithId = {
      id: randomUUID(),
      username: data.username,
      password_hash: passwordHash,
    };

    const [user] = await this.db(this.tableName)
      .insert(userWithId)
      .returning<UserRow[]>(["id", "username", "created_at", "updated_at"]);

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user as UserResponse;
  }

  async update(
    id: string,
    data: UpdateUserData,
  ): Promise<UserResponse | undefined> {
    const updateData: Partial<UserRow> = {};

    if (data.username !== undefined) {
      updateData.username = data.username;
    }
    if (data.password) {
      updateData.password_hash = await bcrypt.hash(
        data.password,
        this.saltRounds,
      );
    }

    const [user] = await this.db(this.tableName)
      .where({ id })
      .update(updateData)
      .returning<UserRow[]>(["id", "username", "created_at", "updated_at"]);

    return user as UserResponse;
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.db(this.tableName).where({ id }).del();
    return deletedCount > 0;
  }

  async verifyPassword(
    username: string,
    password: string,
  ): Promise<UserResponse | null> {
    const user = await this.findByUsername(username);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async exists(username: string): Promise<boolean> {
    const user = await this.db(this.tableName)
      .where({ username })
      .first<UserRow>();
    return !!user;
  }
}
