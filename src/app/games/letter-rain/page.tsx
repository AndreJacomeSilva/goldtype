'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';

// Word pools by difficulty
const EASY_WORDS = ['solar', 'grid', 'volt', 'watt', 'power', 'energy', 'light', 'spark', 'charge', 'green'];
const MEDIUM_WORDS = ['electric', 'voltaic', 'battery', 'circuit', 'current', 'turbine', 'thermal', 'nuclear', 'fusion'];
const HARD_WORDS = ['efficiency', 'renewable', 'sustainable', 'photovoltaic', 'transformer', 'generator', 'conductor'];

// Power-up words
const POWER_UPS = {
  FREEZE: { word: 'freeze', color: '#3B82F6', icon: '❄️' },
  BOMB: { word: 'bomb', color: '#EF4444', icon: '💣' },
  LIFE: { word: 'life', color: '#10B981', icon: '❤️' }
};

interface FallingWord {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
  isPowerUp?: string;
  color?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number; // 1 -> 0
  color: string;
}

export default function LetterRainPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const fallingWordsRef = useRef<FallingWord[]>([]); // keeps in-sync copy for animation loop without retriggering effect
  const inputRef = useRef<HTMLInputElement | null>(null);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [currentInput, setCurrentInput] = useState('');
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [baseSpeed, setBaseSpeed] = useState(1);
  const [spawnRate, setSpawnRate] = useState(2000);
  const [freezeActive, setFreezeActive] = useState(false);
  const [screenFlash, setScreenFlash] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  // Derived matching state for highlighting
  const matchExact = currentInput.length > 0 && fallingWordsRef.current.some(w => w.text === currentInput);
  const matchPrefix = !matchExact && currentInput.length > 0 && fallingWordsRef.current.some(w => w.text.startsWith(currentInput));
  
  // Calculate difficulty based on score
  useEffect(() => {
    if (gameState === 'playing') {
      // Speed increases by 5% every 2000 points
      const speedMultiplier = 1 + Math.floor(score / 2000) * 0.05;
      setBaseSpeed(Math.min(speedMultiplier, 3)); // Cap at 3x speed
      
      // Spawn rate decreases by 100ms every 1000 points
      const newSpawnRate = Math.max(2000 - Math.floor(score / 1000) * 100, 800);
      setSpawnRate(newSpawnRate);
    }
  }, [score, gameState]);
  
  // Update multiplier based on combo
  useEffect(() => {
    if (combo < 5) setMultiplier(1);
    else if (combo < 10) setMultiplier(1.5);
    else if (combo < 15) setMultiplier(2);
    else if (combo < 20) setMultiplier(2.5);
    else setMultiplier(3);
  }, [combo]);
  
  // Get word pool based on score
  const getWordPool = useCallback(() => {
    if (score < 3000) return EASY_WORDS;
    if (score < 8000) return [...EASY_WORDS, ...MEDIUM_WORDS];
    return [...EASY_WORDS, ...MEDIUM_WORDS, ...HARD_WORDS];
  }, [score]);
  
  // Spawn new word
  const spawnWord = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const wordPool = getWordPool();
    
    // 5% chance for power-up
    const isPowerUp = Math.random() < 0.05;
    let word: string;
    let powerUpType: string | undefined;
    let color: string | undefined;
    
    if (isPowerUp) {
      const powerUpKeys = Object.keys(POWER_UPS);
      // Make life power-up rarer
      const weights = [0.4, 0.4, 0.2]; // freeze, bomb, life
      const random = Math.random();
      let weightSum = 0;
      let selectedIndex = 0;
      
      for (let i = 0; i < weights.length; i++) {
        weightSum += weights[i];
        if (random <= weightSum) {
          selectedIndex = i;
          break;
        }
      }
      
      powerUpType = powerUpKeys[selectedIndex];
      const powerUp = POWER_UPS[powerUpType as keyof typeof POWER_UPS];
      word = powerUp.word;
      color = powerUp.color;
    } else {
      word = wordPool[Math.floor(Math.random() * wordPool.length)];
    }
    
    const newWord: FallingWord = {
      id: Date.now() + Math.random(),
      text: word,
      x: Math.random() * (canvas.width - 100) + 50,
      y: -30,
      speed: baseSpeed * (0.8 + Math.random() * 0.4),
      isPowerUp: powerUpType,
      color
    };
    
    setFallingWords(prev => {
      const next = [...prev, newWord];
      fallingWordsRef.current = next;
      return next;
    });
  }, [baseSpeed, getWordPool]);
  
  // Create particle explosion
  const createExplosion = (x: number, y: number, color: string = '#10B981') => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  };
  
  // Handle typing
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => {
    const input = e.target.value.toLowerCase();
    setCurrentInput(input);
    
    // Check if input matches any falling word
  const matchedWord = fallingWordsRef.current.find(w => w.text === input);
    if (matchedWord) {
      // Handle power-ups
      if (matchedWord.isPowerUp) {
        switch (matchedWord.isPowerUp) {
          case 'FREEZE':
            setFreezeActive(true);
            setTimeout(() => setFreezeActive(false), 5000);
            setScreenFlash('freeze');
            break;
          case 'BOMB':
            // Destroy all words on screen
            const wordsToDestroy = fallingWordsRef.current.filter(w => w.id !== matchedWord.id);
            wordsToDestroy.forEach(w => {
              createExplosion(w.x, w.y, '#EF4444');
              const wordScore = (100 + w.text.length * 10) * multiplier;
              setScore(prev => prev + wordScore);
            });
            setFallingWords(() => {
              fallingWordsRef.current = [];
              return [];
            });
            setScreenFlash('bomb');
            break;
          case 'LIFE':
            setLives(prev => Math.min(prev + 1, 5));
            setScreenFlash('life');
            break;
        }
      }
      
      // Calculate score
      const wordScore = Math.floor((100 + matchedWord.text.length * 10) * multiplier);
      setScore(prev => prev + wordScore);
      setCombo(prev => prev + 1);
      
      // Remove word and create explosion
      createExplosion(matchedWord.x, matchedWord.y, matchedWord.color || '#10B981');
      floatingTextsRef.current.push({
        x: matchedWord.x,
        y: matchedWord.y,
        text: `+${wordScore}`,
        life: 1,
        color: '#34D399'
      });
      setFallingWords(prev => {
        const next = prev.filter(w => w.id !== matchedWord.id);
        fallingWordsRef.current = next;
        return next;
      });
      setCurrentInput('');
      
      // Clear screen flash
      if (screenFlash) {
        setTimeout(() => setScreenFlash(''), 300);
      }
    }
  }, [multiplier, screenFlash]);
  
  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let lastTime = 0;
    
    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
  // Clear base background (always dark)
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Spawn new words
      if (timestamp - lastSpawnRef.current > spawnRate) {
        spawnWord();
        lastSpawnRef.current = timestamp;
      }
      
      // Update and draw falling words
      const speedModifier = freezeActive ? 0.5 : 1;
      
      // Update falling words via ref to avoid rerender thrash
      if (fallingWordsRef.current.length) {
        let updated = fallingWordsRef.current.map(word => ({
          ...word,
            y: word.y + word.speed * speedModifier * (deltaTime / 16)
        }));
        const hitBottom = updated.filter(w => w.y > canvas.height - 50);
        if (hitBottom.length > 0 && !hitBottom.some(w => w.isPowerUp)) {
          setLives(l => l - hitBottom.length);
          setCombo(0);
          setScreenFlash('damage');
          setTimeout(() => setScreenFlash(''), 300);
        }
        updated = updated.filter(w => w.y <= canvas.height - 50);
        fallingWordsRef.current = updated;
        // trigger light state sync occasionally for React (score overlay etc.)
        if (Math.random() < 0.05) {
          setFallingWords(updated);
        }
      }
      
      // Update/draw particles FIRST (so words appear on top)
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // gravity
        particle.life -= 0.02;
        ctx.globalAlpha = Math.max(particle.life, 0);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
      });
      ctx.globalAlpha = 1;

      // Draw words (always on top of particles)
      fallingWordsRef.current.forEach(word => {
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = word.color || '#FFFFFF';
        if (freezeActive && !word.isPowerUp) ctx.fillStyle = '#93C5FD';
        ctx.fillText(word.text, word.x, word.y);
        if (word.isPowerUp) {
          const powerUp = POWER_UPS[word.isPowerUp as keyof typeof POWER_UPS];
          ctx.font = '20px sans-serif';
          ctx.fillText(powerUp.icon, word.x - 25, word.y);
        }
      });

      // Overlay flashes (translucent so we never hide words)
      if (screenFlash) {
        ctx.globalAlpha = 0.25;
        const flashColor = screenFlash === 'freeze' ? '#1E3A8A' : screenFlash === 'bomb' || screenFlash === 'damage' ? '#7F1D1D' : screenFlash === 'life' ? '#064E3B' : '#10B981';
        ctx.fillStyle = flashColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      }
      
      // Floating score texts
      floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.life > 0);
      floatingTextsRef.current.forEach(ft => {
        ft.y -= 0.5; // rise
        ft.life -= 0.02;
        ctx.globalAlpha = ft.life;
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
      });
      ctx.globalAlpha = 1;
      
      // Draw UI
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Score: ${score}`, 20, 40);
      
      // Draw lives
      ctx.fillText('Lives: ', canvas.width - 180, 40);
      for (let i = 0; i < 5; i++) {
        ctx.fillText(i < lives ? '❤️' : '🤍', canvas.width - 100 + i * 25, 40);
      }
      
      // Draw combo
      if (combo >= 5) {
        ctx.fillStyle = '#FCD34D';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`x${multiplier.toFixed(1)} COMBO!`, canvas.width / 2, 40);
        ctx.textAlign = 'left';
      }
      
  // Draw current input with partial match highlighting
  let inputColor = '#10B981'; // default green (empty)
  if (matchExact) inputColor = '#34D399'; // emerald
  else if (matchPrefix) inputColor = '#FBBF24'; // amber for valid prefix
  else if (currentInput.length > 0) inputColor = '#EF4444'; // red invalid
  ctx.fillStyle = inputColor;
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(currentInput + '_', canvas.width / 2, canvas.height - 20);
  ctx.textAlign = 'left';
      
      // Check game over
      if (lives <= 0) {
        setGameState('gameover');
        return;
      }

      // Debug overlay
      if (debugMode) {
        ctx.font = '12px monospace';
        ctx.fillStyle = '#9CA3AF';
        ctx.textAlign = 'left';
        ctx.fillText(`Words: ${fallingWordsRef.current.length}`, 20, 60);
        ctx.fillText(`SpawnRate: ${(spawnRate/1000).toFixed(2)}s`, 20, 75);
        ctx.fillText(`BaseSpeed: ${baseSpeed.toFixed(2)}`, 20, 90);
        ctx.fillText(`Freeze: ${freezeActive ? 'ON' : 'off'}`, 20, 105);
      }
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, score, lives, combo, multiplier, currentInput, freezeActive, screenFlash, spawnRate, spawnWord, debugMode, baseSpeed, matchExact, matchPrefix]);
  
  // Start game
  const startGame = () => {
    setScore(0);
    setLives(5);
    setCombo(0);
    setMultiplier(1);
    setCurrentInput('');
  setFallingWords([]);
  fallingWordsRef.current = [];
    setBaseSpeed(1);
    setSpawnRate(2000);
    setFreezeActive(false);
    setScreenFlash('');
  particlesRef.current = [];
  lastSpawnRef.current = 0;
  setGameState('playing');
  // focus input for typing
  setTimeout(() => inputRef.current?.focus(), 50);
  };
  
  // Resize canvas (larger playfield); re-run when entering playing state
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const width = Math.min(Math.round(window.innerWidth * 0.9), 1600);
        const height = Math.min(Math.max(Math.round(window.innerHeight * 0.75), 720), 960);
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        // Explicit style sizing so it's visually applied immediately on mount
        canvasRef.current.style.width = width + 'px';
        canvasRef.current.style.height = height + 'px';
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gameState]);

  // When we switch to playing, ensure an immediate first spawn so user sees a word quickly
  useEffect(() => {
    if (gameState === 'playing') {
      spawnWord();
      lastSpawnRef.current = performance.now();
    }
  }, [gameState, spawnWord]);

  // Keep fallingWordsRef synced when state changes externally
  useEffect(() => { fallingWordsRef.current = fallingWords; }, [fallingWords]);

  // Global key handler (optional for when input loses focus)
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'Escape') {
        setGameState('paused');
        return;
      }
      // Avoid duplicate characters when the input element has focus; let onChange handle it
      if (inputRef.current && document.activeElement === inputRef.current) return;
      if (e.key === 'Backspace') {
        setCurrentInput(prev => prev.slice(0, -1));
        return;
      }
      if (/^[a-zA-Z]$/.test(e.key)) {
        const next = (currentInput + e.key.toLowerCase()).slice(-20);
        handleInput({ target: { value: next } });
      }
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [gameState, currentInput, handleInput]);
  
  return (
    <div className="w-full px-4 py-8 flex flex-col items-center">
      {gameState === 'menu' && (
        <>
          <h1 className="text-4xl font-bold text-center mb-2">Wordfall Velocity ⚡</h1>
          <h2 className="text-xl text-center text-gray-500 mb-10">Energia e velocidade nas tuas mãos!</h2>
          
          <div className="max-w-md text-center mb-8">
            <h3 className="text-lg font-semibold mb-4">Como Jogar:</h3>
            <ul className="text-left space-y-2 mb-6">
              <li>• Escreve as palavras antes que caiam</li>
              <li>• Mantém o combo para multiplicar pontos</li>
              <li>• Palavras especiais dão power-ups:</li>
              <li className="ml-4 text-blue-400">❄️ Freeze - Abranda o tempo</li>
              <li className="ml-4 text-red-400">💣 Bomb - Destrói tudo</li>
              <li className="ml-4 text-green-400">❤️ Life - Recupera uma vida</li>
            </ul>
          </div>
          
          <button onClick={startGame} className="btn btn-primary mb-4">
            Começar Jogo
          </button>
          
          <Link href="/games">
            <button className="btn btn-secondary">Voltar aos Jogos</button>
          </Link>
        </>
      )}
      
      {gameState === 'playing' && (
        <div className={`w-full flex flex-col items-center ${debugMode ? 'border-4 border-pink-500' : ''}`}>
          <div className={`relative mx-auto w-full flex justify-center ${debugMode ? 'border-4 border-yellow-500' : ''}`}>
            <canvas
              ref={canvasRef}
              className={`rounded-lg shadow-lg block bg-gray-900 ${debugMode ? 'border-4 border-blue-500' : 'border-2 border-gray-700'}`}
            />
            {debugMode && (
              <div className="absolute top-2 right-2 text-xs bg-black/60 text-gray-200 px-2 py-1 rounded">
                <p>Words: {fallingWordsRef.current.length}</p>
                <p>Spawn: {(spawnRate/1000).toFixed(2)}s</p>
                <p>BaseSpd: {baseSpeed.toFixed(2)}</p>
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInput}
            className={`mt-6 mx-auto w-full max-w-xl input input-bordered bg-base-200 text-center tracking-wider font-mono transition-colors
              ${matchExact ? 'border-green-500 focus:border-green-400' : matchPrefix ? 'border-amber-400 focus:border-amber-300' : currentInput ? 'border-red-500 focus:border-red-400' : ''}
              ${debugMode ? 'border-2' : ''}`}
            placeholder="Escreve aqui... (ou usa o teclado direto)"
            autoFocus
            onBlur={() => gameState === 'playing' && inputRef.current?.focus()}
          />
          <div className="text-center mt-4 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setGameState('paused')}
              className="btn btn-secondary"
            >
              Pausar
            </button>
            <button
              onClick={() => setDebugMode(d => !d)}
              className="btn btn-ghost"
            >
              {debugMode ? 'Debug Off' : 'Debug On'}
            </button>
            <button
              onClick={startGame}
              className="btn btn-outline"
            >
              Reiniciar
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="btn"
            >
              Menu
            </button>
          </div>
        </div>
      )}

      {gameState === 'paused' && (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Jogo Pausado</h2>
          <p className="mb-6 text-gray-400">Pressiona ESC ou usa os botões abaixo.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setGameState('playing')}
              className="btn btn-primary"
            >
              Continuar
            </button>
            <button
              onClick={startGame}
              className="btn btn-outline"
            >
              Reiniciar
            </button>
            <button
              onClick={() => setDebugMode(d => !d)}
              className="btn btn-ghost"
            >
              {debugMode ? 'Debug Off' : 'Debug On'}
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="btn btn-secondary"
            >
              Menu Principal
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
          <p className="text-2xl mb-8">Pontuação Final: {score}</p>
          
          <button
            onClick={startGame}
            className="btn btn-primary mb-4"
          >
            Jogar Novamente
          </button>
          <br />
          <button
            onClick={() => setGameState('menu')}
            className="btn btn-secondary"
          >
            Menu Principal
          </button>
        </div>
      )}
    </div>
  );
}
