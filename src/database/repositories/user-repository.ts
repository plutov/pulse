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

export type UserNoSensitive = Omit<Users, "password_hash">;

export class UserRepository {
  private db: Knex;
  private tableName = "users";
  private saltRounds = 12;

  constructor(database?: Knex) {
    this.db = database || getDb();
  }

  async findById(id: string): Promise<UserNoSensitive | undefined> {
    const user = await this.db(this.tableName)
      .select("id", "username", "created_at", "updated_at")
      .where({ id })
      .first<Users>();

    return user;
  }

  async findByUsername(username: string): Promise<Users | undefined> {
    return this.db(this.tableName).where({ username }).first<Users>();
  }

  async create(data: CreateUserData): Promise<UserNoSensitive> {
    const password_hash = await bcrypt.hash(data.password, this.saltRounds);

    const userWithId: UsersInitializer = {
      id: data.id,
      username: data.username,
      password_hash: password_hash,
    };

    const [user] = await this.db(this.tableName)
      .insert(userWithId)
      .returning<
        UserNoSensitive[]
      >(["id", "username", "created_at", "updated_at"]);

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.db(this.tableName).where({ id }).del();
    return deletedCount > 0;
  }

  async verifyPassword(
    username: string,
    password: string,
  ): Promise<UserNoSensitive | null> {
    const user = await this.findByUsername(username);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return null;
    }

    return user as UserNoSensitive;
  }
}
