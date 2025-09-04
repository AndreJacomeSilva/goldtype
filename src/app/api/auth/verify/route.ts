import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, loginCodes } from "@/db/schema";
import { sha256, genToken } from "@/lib/crypto";
import { createSession } from "@/lib/session";
import { eq, and, gt, isNull, desc, sql } from "drizzle-orm";

const MAX_ATTEMPTS = 5;
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 dias em segundos

export async function POST(req: Request) {
  try {
  const { email, code, token, displayName, department } = await req.json().catch(() => ({}));
    if (!email || (typeof code !== "string" && typeof token !== "string")) {
      return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await db
      .select({ id: users.id, displayName: users.displayName, department: users.department })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user[0]) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const userData = user[0];
    const presented = code ?? token;
    const codeHash = sha256(presented);
    const now = new Date();

    // encontra um código válido e não consumido
    const loginCode = await db
      .select({ id: loginCodes.id, attemptCount: loginCodes.attemptCount })
      .from(loginCodes)
      .where(
        and(
          eq(loginCodes.codeHash, codeHash),
          eq(loginCodes.userId, userData.id),
          isNull(loginCodes.consumedAt),
          gt(loginCodes.expiresAt, now)
        )
      )
      .orderBy(desc(loginCodes.id))
      .limit(1);

    if (!loginCode[0]) {
      // incrementa tentativas nos últimos códigos do utilizador para rudimentar rate-limit
      await db
        .update(loginCodes)
        .set({ attemptCount: sql`${loginCodes.attemptCount} + 1` })
        .where(
          and(
            eq(loginCodes.userId, userData.id),
            isNull(loginCodes.consumedAt),
            gt(loginCodes.expiresAt, now)
          )
        );
      return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 400 });
    }

    const lc = loginCode[0];
    if (lc.attemptCount >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Muitas tentativas. Pede um novo código." }, { status: 429 });
    }

    // consome o código (single-use)
    await db
      .update(loginCodes)
      .set({ consumedAt: now })
      .where(eq(loginCodes.id, lc.id));

    // prime login: guarda display_name se fornecido e ainda vazio
    const updates: Record<string, string> = {};
    if (!userData.displayName && displayName && typeof displayName === "string" && displayName.trim().length) {
      updates.displayName = displayName.trim();
    }
    if (!userData.department && typeof department === "string" && department.trim().length) {
      updates.department = department.trim();
    }
    if (Object.keys(updates).length > 0) {
      await db.update(users).set(updates).where(eq(users.id, userData.id));
    }

    // cria sessão de 30 dias
    const rawSession = genToken(32);
    await createSession(userData.id, rawSession, SESSION_MAX_AGE);

  return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in auth verify:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
