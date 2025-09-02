"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaPlay } from 'react-icons/fa';
import { evaluateTranscription, EvaluationResult } from '@/lib/evaluator';

type TournamentAudio = {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  durationSeconds?: number;
  transcript?: string;
  language?: string;
};

interface WPMStats { elapsedSeconds: number; wpm: number; words: number; }

function formatDateTime(dt: string | Date) {
  const d = typeof dt === 'string' ? new Date(dt) : dt;
  return d.toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
}

function startOfWeek(d: Date): Date { // segunda
  const date = new Date(d);
  const day = date.getDay(); // 0 domingo
  const diff = (day === 0 ? -6 : 1 - day);
  date.setDate(date.getDate() + diff);
  date.setHours(0,0,0,0);
  return date;
}

export default function TournamentPage() {
  // Áudio & estado
  const [audio, setAudio] = useState<TournamentAudio | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const [frozenWpm, setFrozenWpm] = useState<number | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estado da semana
  interface LastResult { createdAt: string; score: number; }
  const [lastResult, setLastResult] = useState<LastResult | null>(null);
  const [alreadyThisWeek, setAlreadyThisWeek] = useState(false);

  const intervalRef = useRef<number | null>(null);

  // Carregar áudio random & estado
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/tournamentAudios/tournamentAudios.json');
        if (!res.ok) throw new Error('Falha a carregar áudio do torneio');
        const data: TournamentAudio[] = await res.json();
        if (data.length === 0) throw new Error('Sem áudios disponíveis');
        const choice = data[Math.floor(Math.random() * data.length)];
        if (!cancelled) setAudio(choice);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erro a carregar áudio');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Carregar último resultado
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/tournament/status', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
            if (!cancelled) {
              setLastResult(json.last);
              if (json.last) {
                const sow = startOfWeek(new Date());
                if (new Date(json.last.createdAt) >= sow) setAlreadyThisWeek(true);
              }
            }
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const stats: WPMStats = useMemo(() => {
    if (!startTimestamp) return { elapsedSeconds: 0, wpm: 0, words: 0 };
    const words = typedText.trim() ? typedText.trim().split(/\s+/).length : 0;
    const minutes = elapsedSeconds / 60;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
    return { elapsedSeconds, wpm, words };
  }, [typedText, elapsedSeconds, startTimestamp]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => setElapsedSeconds(p => p + 1), 1000);
  }, []);
  const stopTimer = useCallback(() => {
    if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const handlePlay = useCallback(() => {
    if (!audio || alreadyThisWeek || !audioRef.current) return;
    setError(null);
    try {
      audioRef.current.play();
      setIsPlaying(true);
      const now = Date.now();
      setStartTimestamp(now);
      setElapsedSeconds(0);
      setHasEnded(false);
      setFrozenWpm(null);
      setEvaluation(null);
      startTimer();
      } catch {
        setError('Não consegui começar o áudio. Tenta outra vez.');
    }
  }, [audio, alreadyThisWeek, startTimer]);

  const onEnded = useCallback(() => {
    stopTimer();
    setIsPlaying(false);
    setHasEnded(true);
    setFrozenWpm(stats.wpm);
  }, [stats.wpm, stopTimer]);

  // Avaliação automática quando termina
  useEffect(() => {
    if (hasEnded && audio && audio.transcript && frozenWpm !== null && !evaluation) {
      const result = evaluateTranscription({ reference: audio.transcript, typed: typedText, wpm: frozenWpm });
      setEvaluation(result);
    }
  }, [hasEnded, audio, frozenWpm, typedText, evaluation]);

  // Submeter automaticamente quando avaliação pronta
  useEffect(() => {
    if (!evaluation || !audio || submitting || successMsg || alreadyThisWeek) return;
    (async () => {
      try {
        setSubmitting(true);
        const res = await fetch('/api/tournament/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioId: audio.id,
            wpm: evaluation.wpm,
            precisionPercent: evaluation.precisionPercent,
          })
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || 'Falha ao registar resultado');
        } else {
          setSuccessMsg('Resultado registado ✅');
          setAlreadyThisWeek(true);
        }
      } catch {
        setError('Falhou a submissão. O diabo anda solto.');
      } finally {
        setSubmitting(false);
      }
    })();
  }, [evaluation, audio, submitting, successMsg, alreadyThisWeek]);

  useEffect(() => () => { if (intervalRef.current) window.clearInterval(intervalRef.current); }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const scoreValue = useMemo(() => {
    if (!evaluation) return null;
    return Math.round(evaluation.precisionPercent * Math.log(1 + evaluation.wpm));
  }, [evaluation]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-4xl font-bold text-center">Prova Semanal ⚔️</h1>
      <div className="alert shadow bg-base-200">
        <div>
          <span className="font-semibold">Regra d&apos;ouro:</span> só podes fazer <strong>uma</strong> prova por semana. Agarra-te a ela como quem agarra um pastel de Chaves quentinho.
          {lastResult && (
            <span className="block text-sm mt-1">Última prova: {formatDateTime(lastResult.createdAt)} (score {lastResult.score})</span>
          )}
          {alreadyThisWeek ? (
            <span className="block text-sm text-warning">Esta semana já deste ao dedo. Volta na próxima segunda 😉</span>
          ) : (
            <span className="block text-sm text-success">Ainda não fizeste a prova desta semana. Bora lá mostrar serviço!</span>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error"><span>{error}</span></div>}
      {successMsg && <div className="alert alert-success"><span>{successMsg}</span></div>}

      <div className="card bg-base-200 shadow-md">
        <div className="card-body space-y-4">
          <h2 className="text-2xl font-semibold">{audio ? audio.title : 'A carregar...'}</h2>
          <p className="text-sm opacity-80 whitespace-pre-line">{audio?.description}</p>
          <audio ref={audioRef} src={audio ? `/tournamentAudios/${audio.fileUrl}` : undefined} onEnded={onEnded} preload="metadata" />
          <div className="flex flex-wrap gap-3 items-center">
            <button className="btn btn-primary" disabled={!audio || isPlaying || alreadyThisWeek} onClick={handlePlay}>
              <FaPlay className="mr-1" /> Começar Prova
            </button>
            {alreadyThisWeek && <span className="text-sm text-warning">Bloqueado até à próxima semana.</span>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="label font-semibold">Escreve aqui (sem medos)</label>
          <textarea
            className="textarea textarea-bordered w-full h-96 font-mono tracking-wide leading-relaxed"
            placeholder={audio ? (alreadyThisWeek ? 'Já não dá para esta semana.' : 'Carrega em Começar Prova e começa a escrever...') : 'A preparar áudio...'}
            value={typedText}
            disabled={!isPlaying || alreadyThisWeek}
            onChange={e => setTypedText(e.target.value)}
          />
        </div>
        <div className="md:col-span-1 space-y-4">
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body p-4">
              <h3 className="card-title text-base">Estatísticas</h3>
              <ul className="text-sm space-y-1">
                <li><span className="font-semibold">Tempo:</span> {formatTime(stats.elapsedSeconds)}</li>
                <li><span className="font-semibold">Palavras:</span> {stats.words}</li>
                <li><span className="font-semibold">WPM:</span> {hasEnded && frozenWpm !== null ? frozenWpm : stats.wpm}</li>
                <li><span className="font-semibold">Estado:</span> {hasEnded ? 'Concluído' : isPlaying ? 'A decorrer' : alreadyThisWeek ? 'Bloqueado' : 'Pronto'}</li>
              </ul>
            </div>
          </div>
          {evaluation && scoreValue !== null && (
            <div className="card bg-base-200 shadow-sm border border-primary/30">
              <div className="card-body p-4 space-y-2">
                <h3 className="card-title text-base">Score desta Prova</h3>
                <p className="text-3xl font-bold text-primary">{scoreValue}</p>
                <p className="text-xs opacity-70">Fórmula: precisão (%) × ln(1 + WPM)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {evaluation && (
        <div className="card bg-base-200 shadow-md border border-base-300">
          <div className="card-body space-y-4">
            <div className="flex flex-wrap gap-6 items-center">
              <div>
                <h3 className="font-semibold text-lg">Resultados</h3>
                <p className="text-sm opacity-80">Ficaste com {evaluation.precisionPercent.toFixed(1)}% de precisão. Nada mau, hã?</p>
              </div>
              <div className="stats stats-vertical lg:stats-horizontal shadow">
                <div className="stat">
                  <div className="stat-title">Precisão (%)</div>
                  <div className="stat-value text-success">{evaluation.precisionPercent.toFixed(1)}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">WER</div>
                  <div className="stat-value">{(evaluation.wer * 100).toFixed(1)}%</div>
                  <div className="stat-desc text-xs">S:{evaluation.substitutions} I:{evaluation.insertions} D:{evaluation.deletions}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">WPM</div>
                  <div className="stat-value">{evaluation.wpm}</div>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Referência</h4>
                <div className="p-3 rounded bg-base-300/40 text-sm leading-relaxed max-h-80 overflow-auto">
                  {evaluation.alignment.map((a, idx) => (
                    <span key={idx} className={
                      a.op === 'correct' ? 'text-success' :
                      a.op === 'sub' ? 'text-error' :
                      a.op === 'del' ? 'bg-error/20 text-error px-1 rounded' :
                      'text-warning'
                    }>
                      {a.refWord ?? '∅'}{' '}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">O teu texto</h4>
                <div className="p-3 rounded bg-base-300/40 text-sm leading-relaxed max-h-80 overflow-auto">
                  {evaluation.alignment.map((a, idx) => (
                    <span key={idx} className={
                      a.op === 'correct' ? 'text-success' :
                      a.op === 'sub' ? 'text-error underline decoration-error' :
                      a.op === 'ins' ? 'bg-warning/30 text-warning px-1 rounded' :
                      'text-error line-through'
                    }>
                      {a.typedWord ?? '∅'}{' '}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-xs opacity-70 flex flex-wrap gap-4">
              <span><span className="text-success font-semibold">Verde</span>: correto</span>
              <span><span className="text-error font-semibold">Vermelho</span>: substituição / palavra errada</span>
              <span><span className="text-warning font-semibold">Amarelo</span>: inserção extra</span>
              <span><span className="font-semibold">∅</span>: omissão</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
