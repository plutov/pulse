import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { getTestDb } from "../setup/database";

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
