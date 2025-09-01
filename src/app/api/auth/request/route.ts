import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, loginCodes } from "@/db/schema";
import { genNumericCode, sha256, genToken } from "@/lib/crypto";
import { sendMail } from "@/lib/email";
import { generateLoginEmailHtml, generateLoginEmailSubject } from "@/templates/login-email";
import { eq, and, gt, desc } from "drizzle-orm";

const CODE_TTL_MIN = 10;         // expira em 10 minutos
const RESEND_COOLDOWN_SEC = 60;  // 1 pedido por minuto por utilizador

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({}));
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // cria ou obtém utilizador
    const [user] = await db
      .insert(users)
      .values({ email: normalizedEmail })
      .onConflictDoUpdate({
        target: users.email,
        set: { email: normalizedEmail }
      })
      .returning({ id: users.id });

    const userId = user.id;

    // evita spam: só permite novo código passado 1 min
    const recent = await db
      .select({ id: loginCodes.id })
      .from(loginCodes)
      .where(
        and(
          eq(loginCodes.userId, userId),
          gt(loginCodes.createdAt, new Date(Date.now() - RESEND_COOLDOWN_SEC * 1000))
        )
      )
      .orderBy(desc(loginCodes.id))
      .limit(1);

    if (recent.length > 0) {
      return NextResponse.json({ ok: true, throttled: true });
    }

    const code = genNumericCode(6);
    const codeHash = sha256(code);
    const expiresAt = new Date(Date.now() + CODE_TTL_MIN * 60 * 1000);

    await db.insert(loginCodes).values({
      userId,
      codeHash,
      expiresAt,
    });

    // opcional: link mágico além do código
    const linkToken = genToken(24); // 48 chars
    const linkHash = sha256(linkToken);
    await db.insert(loginCodes).values({
      userId,
      codeHash: linkHash,
      expiresAt,
    });

    const loginUrl = `${process.env.APP_BASE_URL}/login?email=${encodeURIComponent(normalizedEmail)}&t=${linkToken}`;

    const emailHtml = generateLoginEmailHtml({
      code,
      loginUrl,
      validMinutes: CODE_TTL_MIN,
    });

    const subject = generateLoginEmailSubject();

    await sendMail(normalizedEmail, subject, emailHtml);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in auth request:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
