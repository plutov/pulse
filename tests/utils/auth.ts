import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { getTestDb } from "../setup/database";

export const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";
export const TEST_USER_USERNAME = "admin";
export const TEST_USER_PASSWORD = "admin123";

export function generateTestJWT(
  payload: jwt.JwtPayload = { id: TEST_USER_ID },
): string {
  const secret = process.env["JWT_SECRET"]!;
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

export function getAuthHeaders(token?: string): Record<string, string> {
  const authToken = token || generateTestJWT();
  return {
    authorization: `Bearer ${authToken}`,
  };
}

export async function createTestUser(
  username = TEST_USER_USERNAME,
  password = TEST_USER_PASSWORD,
  id = TEST_USER_ID,
): Promise<{ id: string; username: string }> {
  const db = getTestDb();
  const passwordHash = await bcrypt.hash(password, 12);

  await db("users")
    .insert({
      id,
      username,
      password_hash: passwordHash,
    })
    .onConflict("id")
    .ignore();

  return { id, username };
}
