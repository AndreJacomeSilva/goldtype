import { cookies, headers } from "next/headers";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { sha256 } from "./crypto";
import { eq, and, gt, isNull } from "drizzle-orm";

const COOKIE_NAME = "session";
const THIRTY_DAYS = 30 * 24 * 60 * 60; // segundos

export async function createSession(userId: string, rawToken: string, maxAgeSec = THIRTY_DAYS) {
  const tokenHash = sha256(rawToken);
  const h = await headers();
  const ua = h.get("user-agent") || null;
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

  const expiresAt = new Date(Date.now() + maxAgeSec * 1000);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    userAgent: ua,
    ip,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: rawToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSec,
    path: "/"
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = sha256(token);
  const now = new Date();

  const result = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, now)
      )
    )
    .limit(1);

  return result[0] ?? null;
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = sha256(token);
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.tokenHash, tokenHash));
    
    cookieStore.delete(COOKIE_NAME);
  }
}
