import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/db';
import { competitionResults } from '@/db/schema';
import { and, eq, gte } from 'drizzle-orm';

// Semana começa à segunda (ISO week) - simplificação: 7 dias atrás conta como mesma semana para regra "1 por semana".
function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getUTCDay(); // 0=Domingo
  const diff = (day === 0 ? -6 : 1 - day); // ajustar para segunda
  date.setUTCDate(date.getUTCDate() + diff);
  date.setUTCHours(0,0,0,0);
  return date;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await req.json();
    const { audioId, wpm, precisionPercent } = body as { audioId?: string; wpm?: number; precisionPercent?: number; };
    if (!audioId || typeof wpm !== 'number' || typeof precisionPercent !== 'number') {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // Calcula score
    const score = Math.round(precisionPercent * Math.log(1 + Math.max(0, wpm)));

    // Verificar se já existe resultado na semana atual
    const sow = startOfWeek(new Date());
    const existing = await db.select().from(competitionResults)
      .where(and(
        eq(competitionResults.userId, user.id),
        gte(competitionResults.createdAt, sow)
      ))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Já fizeste a prova desta semana. Aguenta aí até para a próxima.' }, { status: 403 });
    }

    const inserted = await db.insert(competitionResults).values({
      userId: user.id,
      audioId,
      wpm: Math.round(wpm),
      precisionPercent: Math.round(precisionPercent),
      score,
    }).returning({ id: competitionResults.id, createdAt: competitionResults.createdAt, score: competitionResults.score });

    return NextResponse.json({ ok: true, result: inserted[0] });
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
