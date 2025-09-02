"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaPlay, FaStop } from 'react-icons/fa';
import { evaluateTranscription, EvaluationResult } from '@/lib/evaluator';

type TrainingAudio = {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  durationSeconds?: number;
  transcript?: string;
  language?: string;
};

interface WPMStats {
  elapsedSeconds: number;
  wpm: number;
  words: number;
}

const SPEED_OPTIONS_SLOW = Array.from({ length: 5 }, (_, i) => 0.5 + i * 0.1); // 0.5 -> 0.9
const SPEED_OPTIONS_FAST = [1.0, 1.1, 1.2, 1.5, 2, 3, 4];
const SPEED_OPTIONS = [...SPEED_OPTIONS_SLOW, ...SPEED_OPTIONS_FAST];

export default function TrainPage() {
  // Data
  const [audios, setAudios] = useState<TrainingAudio[]>([]);
  const [loadingAudios, setLoadingAudios] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');

  // Player / typing state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [typedText, setTypedText] = useState('');
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const [frozenWpm, setFrozenWpm] = useState<number | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Interval ref
  const intervalRef = useRef<number | null>(null);

  // Fetch audios once (client-side)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/trainingAudios/trainingAudios.json');
        if (!res.ok) throw new Error('Falha ao carregar áudios');
        const data: TrainingAudio[] = await res.json();
        if (!cancelled) {
          setAudios(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoadingAudios(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const selectedAudio = useMemo(
    () => audios.find(a => a.id === selectedId) || null,
    [audios, selectedId]
  );

  // Compute WPM
  const stats: WPMStats = useMemo(() => {
    if (!startTimestamp) return { elapsedSeconds: 0, wpm: 0, words: 0 };
    const words = typedText.trim().length === 0 ? 0 : typedText.trim().split(/\s+/).length;
    const minutes = elapsedSeconds / 60;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
    return { elapsedSeconds, wpm, words };
  }, [typedText, elapsedSeconds, startTimestamp]);

  // Timer management
  const startTimer = useCallback(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback((reset: boolean) => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (reset) {
      setElapsedSeconds(0);
      setStartTimestamp(null);
    }
  }, []);

  // Play handler
  const handlePlay = useCallback(() => {
    if (!selectedAudio || !audioRef.current) return;
    try {
      audioRef.current.play();
      audioRef.current.playbackRate = speed;
      setIsPlaying(true);
      setHasEnded(false);
      const now = Date.now();
      setStartTimestamp(now);
      setElapsedSeconds(0);
      startTimer();
    } catch (e) {
      console.error('Erro ao reproduzir', e);
    }
  }, [selectedAudio, speed, startTimer]);

  // Stop -> reset completo
  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopTimer(true);
    setIsPlaying(false);
    setTypedText('');
    setHasEnded(false);
  }, [stopTimer]);

  // When audio ends
  const onEnded = useCallback(() => {
    stopTimer(false); // don't reset elapsed to show final time
    setIsPlaying(false);
    setHasEnded(true);
    // Congela WPM final
    setFrozenWpm(stats.wpm);
  }, [stopTimer, stats.wpm]);

  // Speed change
  const handleSpeedChange = (v: number) => {
    setSpeed(v);
    if (audioRef.current) audioRef.current.playbackRate = v;
  };

  // Switching audio resets everything
  const handleAudioSelect = (id: string) => {
    setSelectedId(id);
    // Reset completo
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopTimer(true);
    setTypedText('');
    setIsPlaying(false);
  setHasEnded(false);
  setFrozenWpm(null);
  setEvaluation(null);
  };

  // Cleanup on unmount
  useEffect(() => () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-4xl font-bold text-center">Treino de Transcrição</h1>
      <p className="text-center text-base opacity-80">Escolhe o áudio e põe-te a escrever certinho, que isto não se faz sozinho!</p>

      {/* Seleção de Áudio */}
      <div className="card bg-base-200 shadow-md">
        <div className="card-body grid gap-4 md:grid-cols-3">
          <div className="form-control md:col-span-1">
            <label className="label font-semibold">Seleciona o áudio</label>
            {loadingAudios ? (
              <span className="loading loading-spinner loading-md" aria-label="A carregar áudios" />
            ) : (
              <select
                className="select select-bordered"
                value={selectedId}
                onChange={e => handleAudioSelect(e.target.value)}
              >
                <option value="" disabled>-- Escolhe --</option>
                {audios.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            )}
          </div>

          <div className="md:col-span-2 space-y-3">
            {selectedAudio ? (
              <>
                <h2 className="text-xl font-semibold">{selectedAudio.title}</h2>
                {selectedAudio.description && (
                  <p className="text-sm opacity-80 whitespace-pre-line">{selectedAudio.description}</p>
                )}
                <div className="flex flex-col gap-2">
                  <audio
                    ref={audioRef}
                    src={selectedAudio ? `/trainingAudios/${selectedAudio.fileUrl}` : undefined}
                    onEnded={onEnded}
                    preload="metadata"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handlePlay}
                      disabled={!selectedAudio || isPlaying}
                    >
                      <FaPlay className="mr-1" /> Reproduzir
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleStop}
                      disabled={!selectedAudio || (!isPlaying && !startTimestamp)}
                    >
                      <FaStop className="mr-1" /> Parar
                    </button>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Velocidade:</label>
                      <select
                        className="select select-bordered select-sm"
                        value={speed}
                        onChange={e => handleSpeedChange(parseFloat(e.target.value))}
                        disabled={!selectedAudio}
                      >
                        {SPEED_OPTIONS.map(v => (
                          <option key={v} value={v}>{v.toFixed(1)}x</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="italic opacity-70">Escolhe um áudio para começares o treino.</p>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal: textarea + stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="label font-semibold">Transcreve aqui</label>
          <textarea
            className="textarea textarea-bordered w-full h-96 font-mono tracking-wide leading-relaxed"
            placeholder={selectedAudio ? 'Começa a escrever depois de carregar em Reproduzir...' : 'Escolhe primeiro um áudio.'}
            value={typedText}
            disabled={!isPlaying}
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
                <li><span className="font-semibold">Estado:</span> {hasEnded ? 'Concluído' : isPlaying ? 'A reproduzir' : selectedAudio ? 'Pronto' : 'Sem áudio'}</li>
              </ul>
            </div>
          </div>
          <button
            className="btn btn-accent w-full"
            disabled={!hasEnded || !selectedAudio || !selectedAudio.transcript}
            onClick={() => {
              if (!selectedAudio || !selectedAudio.transcript || frozenWpm === null) return;
              const result = evaluateTranscription({
                reference: selectedAudio.transcript,
                typed: typedText,
                wpm: frozenWpm,
              });
              setEvaluation(result);
            }}
            title={!selectedAudio?.transcript ? 'Sem transcript disponível' : !hasEnded ? 'Só fica disponível após o fim do áudio' : 'Avaliar'}
          >
            Avaliar
          </button>
          {selectedAudio && !selectedAudio.transcript && (
            <p className="text-xs text-warning">Este áudio ainda não tem transcript para avaliação.</p>
          )}
        </div>
      </div>

      {/* Resultados da Avaliação */}
      {evaluation && (
        <div className="card bg-base-200 shadow-md border border-base-300">
          <div className="card-body space-y-4">
            <div className="flex flex-wrap gap-6 items-center">
              <div>
                <h3 className="font-semibold text-lg">Resultados</h3>
                <p className="text-sm opacity-80">Análise da tua transcrição — isto é só o começo, continua a praticar.</p>
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
