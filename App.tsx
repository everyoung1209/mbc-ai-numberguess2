
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GameStatus, GuessRecord } from './types';
import { getAiComment, testConnection } from './services/geminiService';
import GameBoard from './components/GameBoard';
import History from './components/History';
import AiFeedback from './components/AiFeedback';
import confetti from 'canvas-confetti';

const generateRandomNumber = () => Math.floor(Math.random() * 100) + 1;

// The aistudio interface and window.aistudio are already defined globally by the platform.
// Removing manual declarations to avoid type conflicts and modifier mismatches.

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
    if (timeLeft <= 0) return clearInterval(interval);
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

  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'not-set' | 'error'>('checking');

  // Helper to check API key selection status
  const checkApiConnection = useCallback(async () => {
    setApiStatus('checking');
    try {
      // Accessing aistudio from window with cast to avoid strict TS definition issues
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setApiStatus('not-set');
        return;
      }
      const isOk = await testConnection();
      setApiStatus(isOk ? 'connected' : 'error');
    } catch (e) {
      setApiStatus('error');
    }
  }, []);

  useEffect(() => {
    checkApiConnection();
  }, [checkApiConnection]);

  // Handle opening the key selection dialog and assume success as per instructions
  const handleOpenKeySettings = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      // MUST assume the key selection was successful to mitigate race condition
      setApiStatus('connected');
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  const handleGuess = useCallback(async (value: number) => {
    if (state.status !== GameStatus.PLAYING) return;
    if (apiStatus !== 'connected') {
      alert("먼저 API 키를 설정해주세요.");
      handleOpenKeySettings();
      return;
    }

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
  }, [state.targetNumber, state.attempts, state.status, apiStatus]);

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
      {/* Dynamic Background Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <header className="mb-8 text-center relative z-10 w-full max-w-6xl flex flex-col items-center border-b border-slate-900 pb-6">
        <div className="w-full flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              apiStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 
              apiStatus === 'checking' ? 'bg-blue-500 animate-pulse' : 
              'bg-red-500 shadow-[0_0_10px_#ef4444]'
            }`}></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              {apiStatus === 'connected' ? 'API Online' : apiStatus === 'checking' ? 'Testing...' : 'API Offline'}
            </span>
          </div>
          <button 
            onClick={handleOpenKeySettings}
            className="group flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 rounded-full transition-all text-xs font-bold text-slate-300 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            API 설정
          </button>
        </div>

        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent mb-1 drop-shadow-sm tracking-tighter">
          NUMBER MASTER
        </h1>
        <p className="text-slate-500 text-sm font-medium">Gemini AI가 당신의 모든 움직임을 지켜보고 있습니다.</p>
      </header>

      <main className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 relative z-10 items-start">
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
              disabled={state.isLoadingAi || apiStatus === 'checking'} 
            />

            <div className="mt-8 text-center bg-slate-900/50 py-3 rounded-xl border border-slate-800 backdrop-blur-sm">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block mb-1">현재 시도 횟수</span>
              <span className="text-blue-400 font-black text-3xl">{state.attempts}</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0 sticky top-8">
          <History history={state.history} />
        </div>
      </main>

      <footer className="mt-12 pt-8 text-slate-700 text-[10px] text-center relative z-10 w-full max-w-6xl border-t border-slate-900">
        &copy; 2024 Gemini Number Master - Powered by Gemini-3-Flash
        <br/>
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hover:text-blue-500 transition-colors">Billing Documentation</a>
      </footer>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default App;
