import { Knex } from "knex";
import { getDb } from "../connection";
import * as bcrypt from "bcrypt";
import Users, { UsersInitializer } from "../types/public/Users";

export type CreateUserData = Omit<
  UsersInitializer & {
    password: string;
  },
  "password_hash"
>;

export class UserRepository {
  private db: Knex;
  private tableName = "users";
  private saltRounds = 12;

  constructor(database?: Knex) {
    this.db = database || getDb();
  }

  async findById(id: string): Promise<Users | undefined> {
    const user = await this.db(this.tableName)
      .select("id", "username", "created_at", "updated_at")
      .where({ id })
      .first<Users>();
    return user;
  }

  async findByUsername(username: string): Promise<Users | undefined> {
    return this.db(this.tableName).where({ username }).first<Users>();
  }

  async create(data: CreateUserData): Promise<Users> {
    const passwordHash = await bcrypt.hash(data.password, this.saltRounds);

    const userWithId = {
      id: data.id,
      username: data.username,
      password_hash: passwordHash,
    };

    const [user] = await this.db(this.tableName)
      .insert(userWithId)
      .returning<Users[]>(["id", "username", "created_at", "updated_at"]);

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user as Users;
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.db(this.tableName).where({ id }).del();
    return deletedCount > 0;
  }

  async verifyPassword(
    username: string,
    password: string,
  ): Promise<Users | null> {
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
      password_hash: "",
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
