import * as jwt from "jsonwebtoken";
import { getTestDb } from "../setup/database";
import { UserRepository } from "../../src/database/repositories/user-repository";
import { UsersId } from "../../src/database/types/public/Users";

export const TEST_USER_PASSWORD = "admin123";

export function generateTestJWT(payload: jwt.JwtPayload): string {
  const secret = process.env["JWT_SECRET"]!;
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

export function getAuthHeaders(userId: string): Record<string, string> {
  const authToken = generateTestJWT({ id: userId });
  return {
    authorization: `Bearer ${authToken}`,
  };
}

export async function createTestUser(
  id: string,
  username: string,
  password = TEST_USER_PASSWORD,
): Promise<{ id: string; username: string }> {
  const db = getTestDb();
  const userRepository = new UserRepository(db);

  await userRepository.create({ id: id as UsersId, username, password });

  return { id, username };
}
