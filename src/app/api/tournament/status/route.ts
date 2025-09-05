import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/db';
import { competitionResults } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, private' } });

  const last = await db.select().from(competitionResults)
    .where(eq(competitionResults.userId, user.id))
    .orderBy(desc(competitionResults.createdAt))
    .limit(1);

  return NextResponse.json({ last: last[0] || null }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, private' } });
}
