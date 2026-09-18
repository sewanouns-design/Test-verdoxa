import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE_NAME = "admin_token";

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
  return new TextEncoder().encode(value);
}

export async function createAdminToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

export async function verifyAdminToken(token: string | undefined) {
  if (!token || !secret().length) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
