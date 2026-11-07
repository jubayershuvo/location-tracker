import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

const JWT_SECRET: string = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET in .env");
}

export type TokenPayload = {
  userId: string;
  email: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
}

export function verifyTokenFromCookie(
  token: string | undefined
): TokenPayload | null {
  if (!token) return null;

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Read the session token from a NextRequest and return the decoded payload.
 * Returns null when there is no valid session.
 */
export function authenticateRequest(
  request: NextRequest
): TokenPayload | null {
  const token = request.cookies.get("token")?.value;
  return verifyTokenFromCookie(token);
}

export function authCookieOptions(token?: string) {
  return {
    name: "token",
    value: token ?? "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: token ? 60 * 60 * 24 * 7 : 0,
  };
}
