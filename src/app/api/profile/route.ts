import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const { displayName, department } = await req.json().catch(() => ({}));

    const updates: Record<string, string | null> = {};
    if (typeof displayName === 'string' || displayName === null) updates.displayName = displayName?.trim() || null;
    if (typeof department === 'string' || department === null) updates.department = department?.trim() || null;

    if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true });

    await db.update(users).set(updates).where(eq(users.id, me.id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('profile update error', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
