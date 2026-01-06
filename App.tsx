
import React, { useState, useCallback } from 'react';
import { GameState, GameStatus, GuessRecord } from './types';
import { getAiComment } from './services/geminiService';
import GameBoard from './components/GameBoard';
import History from './components/History';
import AiFeedback from './components/AiFeedback';
import confetti from 'canvas-confetti';

const generateRandomNumber = () => Math.floor(Math.random() * 100) + 1;

const playVictorySound = () => {
  const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
  if (!AudioContextClass) return;
  
  const ctx = new AudioContextClass();
  const playNote = (freq: number, start: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.1, start);
    gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
  };

  const now = ctx.currentTime;
  playNote(523.25, now, 0.2);       
  playNote(659.25, now + 0.15, 0.2); 
  playNote(783.99, now + 0.3, 0.2);  
  playNote(1046.50, now + 0.45, 0.5); 
};

const triggerFirework = () => {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
};

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    targetNumber: generateRandomNumber(),
    attempts: 0,
    history: [],
    status: GameStatus.PLAYING,
    aiComment: '',
    isLoadingAi: false,
  });

  const handleGuess = useCallback(async (value: number) => {
    if (state.status !== GameStatus.PLAYING) return;

    let result: 'high' | 'low' | 'correct';
    if (value === state.targetNumber) {
      result = 'correct';
      playVictorySound();
      triggerFirework();
    } else if (value > state.targetNumber) {
      result = 'high';
    } else {
      result = 'low';
    }

    const newAttempts = state.attempts + 1;
    const newRecord: GuessRecord = {
      value,
      result,
      timestamp: Date.now(),
    };

    const newStatus = result === 'correct' ? GameStatus.WON : GameStatus.PLAYING;

    setState(prev => ({
      ...prev,
      attempts: newAttempts,
      history: [...prev.history, newRecord],
      status: newStatus,
      isLoadingAi: true,
    }));

    const comment = await getAiComment(state.targetNumber, value, result, newAttempts);
    
    setState(prev => ({
      ...prev,
      aiComment: comment,
      isLoadingAi: false,
    }));
  }, [state.targetNumber, state.attempts, state.status]);

  const handleReset = useCallback(() => {
    setState({
      targetNumber: generateRandomNumber(),
      attempts: 0,
      history: [],
      status: GameStatus.PLAYING,
      aiComment: '다시 시작이군. 이번엔 좀 잘해봐.',
      isLoadingAi: false,
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-8 px-4 lg:px-8 overflow-y-auto relative overflow-x-hidden">
      <header className="mb-8 text-center relative z-10 w-full max-w-6xl border-b border-slate-900 pb-6">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent mb-1 drop-shadow-sm tracking-tighter">
          NUMBER MASTER
        </h1>
        <p className="text-slate-500 text-sm font-medium">Gemini AI가 당신의 모든 움직임을 지켜보고 있습니다.</p>
      </header>

      <main className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 relative z-10 items-start">
        {/* Left Section: Game Content */}
        <div className="flex-1 w-full flex flex-col items-center">
          <div className="w-full max-w-md">
            <AiFeedback 
              comment={state.aiComment} 
              loading={state.isLoadingAi} 
            />
            
            <GameBoard 
              onGuess={handleGuess} 
              onReset={handleReset} 
              status={state.status} 
              disabled={state.isLoadingAi} 
            />

            <div className="mt-8 text-center bg-slate-900/50 py-3 rounded-full border border-slate-800">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">현재 시도 횟수</span>
              <span className="text-blue-400 font-black text-2xl ml-3">{state.attempts}</span>
            </div>
          </div>
        </div>

        {/* Right Section: History Sidebar */}
        <div className="w-full lg:w-80 shrink-0 sticky top-8">
          <History history={state.history} />
        </div>
      </main>

      <footer className="mt-12 pt-8 text-slate-700 text-[10px] text-center relative z-10 w-full max-w-6xl border-t border-slate-900">
        &copy; 2024 Gemini Number Master - Powered by Gemini-3-Flash
      </footer>
    </div>
  );
};

export default App;
