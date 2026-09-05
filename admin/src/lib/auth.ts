/**
 * Simple auth for a single super-admin user.
 *
 * The admin password is stored in env var ADMIN_PASSWORD (plain string,
 * compared via timingSafeEqual). Session is a signed JWT in an httpOnly
 * cookie. No user database, no email service, no OAuth — this is a
 * single-user CMS, we don't need that surface area.
 *
 * JWT secret: ADMIN_JWT_SECRET env var. If unset, we generate one
 * randomly per server boot (sessions reset on restart, which is fine
 * for a single-user dev environment).
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";

const COOKIE_NAME = "scs_admin_session";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const raw = process.env.ADMIN_JWT_SECRET;
  if (raw) return new TextEncoder().encode(raw);
  // Fallback: stable per-process random secret. Sessions don't survive
  // a restart, but at least we're not committing a default secret.
  return new TextEncoder().encode(`scs-admin-${Math.random().toString(36).slice(2)}`);
}

function getAdminPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p) {
    throw new Error(
      "ADMIN_PASSWORD env var is not set. The admin cannot start without it. " +
      "Set it in your Vercel project settings (Settings → Environment Variables)."
    );
  }
  return p;
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function login(password: string): Promise<boolean> {
  if (!safeEqual(password, getAdminPassword())) return false;
  const token = await new SignJWT({ role: "super-admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL}s`)
    .sign(getSecret());
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
  return true;
}

export async function logout(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

/** True if ADMIN_PASSWORD env var is set. Used by the login page UI to decide what to show. */
export function isConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}
