import * as jwt from "jsonwebtoken";

export function generateTestJWT(
  payload: jwt.JwtPayload = { sub: "test-user" },
): string {
  const secret = process.env["JWT_SECRET"] || "test-secret";
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

export function getAuthHeaders(token?: string): Record<string, string> {
  const authToken = token || generateTestJWT();
  return {
    authorization: `Bearer ${authToken}`,
  };
}
