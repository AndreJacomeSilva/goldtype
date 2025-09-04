import { db } from '@/db';
import { competitionResults, users } from '@/db/schema';
import { desc, eq, gte } from 'drizzle-orm';
import React from 'react';
import DepartmentFilter from '@/components/DepartmentFilter';

export const dynamic = 'force-dynamic';

interface AllTimeRow {
  userId: string;
  displayName: string | null;
  email: string;
  department: string | null;
  bestScore: number;
  bestWpm: number;
  bestPrecision: number;
  lastDate: Date;
}

interface WeeklyRow {
  userId: string;
  displayName: string | null;
  email: string;
  department: string | null;
  score: number;
  wpm: number;
  precision: number;
  createdAt: Date;
}

function startOfISOWeek(d: Date) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay(); // 0=Dom
  const diff = (day === 0 ? -6 : 1 - day);
  date.setUTCDate(date.getUTCDate() + diff);
  date.setUTCHours(0,0,0,0);
  return date;
}

function weekKey(date: Date) {
  const sow = startOfISOWeek(date);
  return sow.toISOString();
}

function formatWeekLabel(iso: string) {
  const start = new Date(iso);
  const end = new Date(start); end.setUTCDate(end.getUTCDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  // ISO week number (approx) - use Thursday trick
  const temp = new Date(start); temp.setUTCDate(temp.getUTCDate() + 3);
  const jan4 = new Date(Date.UTC(temp.getUTCFullYear(),0,4));
  const weekNo = Math.floor(1 + ( ( (temp.getTime() - jan4.getTime()) / 86400000) - ( (jan4.getUTCDay()+6)%7 ) ) / 7);
  return `Semana ${weekNo} (${fmt(start)} – ${fmt(end)})`;
}

async function fetchAllTime(): Promise<AllTimeRow[]> {
  // Buscar todos e depois agregar em memória (dataset pequeno esperado). Poderíamos usar subqueries para performance se crescer.
  const rows = await db.select({
    userId: competitionResults.userId,
    score: competitionResults.score,
    wpm: competitionResults.wpm,
    precision: competitionResults.precisionPercent,
    createdAt: competitionResults.createdAt,
    email: users.email,
    displayName: users.displayName,
  department: users.department,
  }).from(competitionResults).innerJoin(users, eq(users.id, competitionResults.userId));

  const map = new Map<string, AllTimeRow>();
  for (const r of rows) {
    const existing = map.get(r.userId);
    if (!existing || r.score > existing.bestScore) {
      map.set(r.userId, {
        userId: r.userId,
        displayName: r.displayName,
        email: r.email,
        department: r.department,
        bestScore: r.score,
        bestWpm: r.wpm,
        bestPrecision: r.precision,
        lastDate: r.createdAt,
      });
    } else if (existing && r.createdAt > existing.lastDate) {
      existing.lastDate = r.createdAt; // atualizar data mais recente (não mexe no best)
    }
  }
  const list = Array.from(map.values()).sort((a,b) => b.bestScore - a.bestScore).slice(0, 100);
  return list;
}

async function fetchWeekly(): Promise<Record<string, WeeklyRow[]>> {
  const now = new Date();
  const currentWeekStart = startOfISOWeek(now);
  const earliest = new Date(currentWeekStart); earliest.setUTCDate(earliest.getUTCDate() - 7*5); // 6 semanas (0..5 atrás)
  const rows = await db.select({
    userId: competitionResults.userId,
    score: competitionResults.score,
    wpm: competitionResults.wpm,
    precision: competitionResults.precisionPercent,
    createdAt: competitionResults.createdAt,
    email: users.email,
    displayName: users.displayName,
  department: users.department,
  }).from(competitionResults)
    .innerJoin(users, eq(users.id, competitionResults.userId))
    .where(gte(competitionResults.createdAt, earliest))
    .orderBy(desc(competitionResults.createdAt));

  // Uma tentativa por semana por user, logo podemos agrupar diretamente
  const buckets: Record<string, WeeklyRow[]> = {};
  for (const r of rows) {
    const key = weekKey(r.createdAt);
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push({
      userId: r.userId,
      displayName: r.displayName,
      email: r.email,
  department: r.department,
      score: r.score,
      wpm: r.wpm,
      precision: r.precision,
      createdAt: r.createdAt,
    });
  }
  // Ordenar cada bucket por score
  for (const k of Object.keys(buckets)) {
    buckets[k].sort((a,b) => b.score - a.score);
  }
  return buckets;
}

export default async function LeaderboardPage({ searchParams }: { searchParams?: Promise<{ dept?: string }> }) {
  const [allTime, weeklyBuckets] = await Promise.all([
    fetchAllTime(),
    fetchWeekly(),
  ]);

  const weekKeys = Object.keys(weeklyBuckets).sort((a,b) => new Date(b).getTime() - new Date(a).getTime()).slice(0,6);

  const sp = (await searchParams) ?? {};
  const selectedDept = (sp.dept ?? 'Todos');
  const normDept = selectedDept === 'Sem departamento' ? null : (selectedDept === 'Todos' ? undefined : selectedDept);
  const allDeptsSet = new Set<string>(['Todos', 'Sem departamento']);
  for (const r of allTime) {
    allDeptsSet.add(r.department || 'Sem departamento');
  }
  const allDepts = Array.from(allDeptsSet);

  const filteredAllTime = typeof normDept === 'undefined'
    ? allTime
    : allTime.filter(r => (normDept === null ? !r.department : r.department === normDept));

  // Top 5 departamentos por melhor score all-time (max por departamento)
  const deptBest: Record<string, number> = {};
  for (const r of allTime) {
    const key = r.department || 'Sem departamento';
    if (deptBest[key] == null || r.bestScore > deptBest[key]) {
      deptBest[key] = r.bestScore;
    }
  }
  const top5Departments = Object.entries(deptBest)
    .sort((a,b) => b[1] - a[1])
    .slice(0,5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <header className="space-y-3 text-center">
        <h1 className="text-4xl font-bold">Leaderboard 🏆</h1>
        <p className="opacity-80 text-sm">Ranking geral (melhor score de sempre) e as últimas semanas. Vê se apareces, ou então toca a treinar, que isto não é só pastéis de Chaves.</p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-2xl font-semibold flex items-center gap-2">Ranking Geral <span className="badge badge-primary">Top {filteredAllTime.length}</span></h2>
          <DepartmentFilter selectedDept={selectedDept} allDepts={allDepts} />
        </div>
        {allTime.length === 0 ? (
          <p className="italic opacity-60">Ainda não há dados. Bora lá inaugurar isto!</p>
        ) : (
          <div className="overflow-x-auto rounded border border-base-300">
            <table className="table table-zebra text-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Colaborador</th>
                  <th>Departamento</th>
                  <th>Score</th>
                  <th>Precisão %</th>
                  <th>WPM</th>
                  <th>Data Última</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllTime.map((r, idx) => (
                  <tr key={r.userId} className={idx===0 ? 'bg-primary/20' : idx===1 ? 'bg-primary/10' : idx===2 ? 'bg-primary/5' : ''}>
                    <td>{idx+1}</td>
                    <td>{r.displayName || r.email.split('@')[0]}</td>
                    <td>{r.department || '—'}</td>
                    <td className="font-semibold">{r.bestScore}</td>
                    <td>{r.bestPrecision}</td>
                    <td>{r.bestWpm}</td>
                    <td>{r.lastDate.toLocaleDateString('pt-PT')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Top 5 Departamentos (melhor score all-time)</h2>
        {top5Departments.length === 0 ? (
          <p className="italic opacity-60">Ainda não há dados por departamento.</p>
        ) : (
          <div className="overflow-x-auto rounded border border-base-300">
            <table className="table table-zebra text-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Departamento</th>
                  <th>Melhor Score</th>
                </tr>
              </thead>
              <tbody>
                {top5Departments.map(([dept, score], idx) => (
                  <tr key={dept}>
                    <td>{idx+1}</td>
                    <td>{dept}</td>
                    <td className="font-semibold">{score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Ranking Semanal (últimas 6 semanas)</h2>
        {weekKeys.length === 0 && <p className="italic opacity-60">Ainda nada para mostrar. Faz a primeira prova e isto ganha vida.</p>}
        <div className="grid md:grid-cols-2 gap-6">
          {weekKeys.map(week => {
            const rows = weeklyBuckets[week];
            return (
              <div key={week} className="card bg-base-200 shadow-sm border border-base-300">
                <div className="card-body p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{formatWeekLabel(week)}</h3>
                    <span className="badge">{rows.length} jogadores</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table table-xs">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Nome</th>
                          <th>Score</th>
                          <th>%</th>
                          <th>WPM</th>
                          <th>Dept</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows
                          .filter(r => typeof normDept === 'undefined' ? true : (normDept === null ? !r.department : r.department === normDept))
                          .map((r, idx) => (
                          <tr key={r.userId} className={idx===0 ? 'text-primary font-semibold' : ''}>
                            <td>{idx+1}</td>
                            <td>{r.displayName || r.email.split('@')[0]}</td>
                            <td>{r.score}</td>
                            <td>{r.precision}</td>
                            <td>{r.wpm}</td>
                            <td>{r.department || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Ideias & Melhorias Futuras 💡</h2>
        <ul className="list-disc ml-5 text-sm space-y-1">
          <li>Badge de consistência para quem não falha nenhuma semana.</li>
          <li>Histórico pessoal: gráfico da evolução do score.</li>
          <li>Filtro por equipa / departamento (se houver metadados no futuro).</li>
          <li>Ranking por média das últimas 4 semanas (tira vantagens antigas).</li>
          <li>Exportar CSV para análise interna.</li>
          <li>Notificação quando alguém ultrapassa o teu score (web push / email interno).</li>
        </ul>
      </section>
    </div>
  );
}
