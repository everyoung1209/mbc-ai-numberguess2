
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GameStatus, GuessRecord } from './types';
import { getAiComment, testConnection } from './services/geminiService';
import GameBoard from './components/GameBoard';
import History from './components/History';
import AiFeedback from './components/AiFeedback';
import SettingsModal from './components/SettingsModal';
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
    aiComment: '준비됐나? 숫자를 골라봐.',
    isLoadingAi: false,
  });

  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'not-set' | 'error'>('checking');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check initial API connection status
  const checkApiConnection = useCallback(async () => {
    setApiStatus('checking');
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setApiStatus('not-set');
        setIsModalOpen(true);
        return;
      }
      const isOk = await testConnection();
      if (isOk) {
        setApiStatus('connected');
        setIsModalOpen(false);
      } else {
        setApiStatus('error');
        setIsModalOpen(true);
      }
    } catch (e) {
      setApiStatus('error');
      setIsModalOpen(true);
    }
  }, []);

  useEffect(() => {
    checkApiConnection();
  }, [checkApiConnection]);

  // Open the platform's key selection dialog
  const handleOpenKeySettings = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      // Assume success to proceed to the app immediately per guidelines to avoid race conditions
      setApiStatus('connected');
      setIsModalOpen(false);
      // Background verification
      testConnection().then(ok => setApiStatus(ok ? 'connected' : 'error'));
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  const handleGuess = useCallback(async (value: number) => {
    if (state.status !== GameStatus.PLAYING) return;
    if (apiStatus !== 'connected') {
      setIsModalOpen(true);
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

    try {
      // Get AI comment for the current guess
      const comment = await getAiComment(state.targetNumber, value, result, newAttempts);
      setState(prev => ({ ...prev, aiComment: comment, isLoadingAi: false }));
    } catch (err) {
      console.error("AI Feedback error:", err);
      setState(prev => ({ ...prev, isLoadingAi: false }));
    }
  }, [state.status, state.targetNumber, state.attempts, apiStatus]);

  const handleReset = useCallback(() => {
    setState({
      targetNumber: generateRandomNumber(),
      attempts: 0,
      history: [],
      status: GameStatus.PLAYING,
      aiComment: '다시 해볼까? 이번엔 맞출 수 있겠어?',
      isLoadingAi: false,
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic">G</div>
          <h1 className="text-xl font-black tracking-tighter uppercase">Guess AI</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-2 hover:bg-slate-900 rounded-full transition-colors relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {apiStatus === 'not-set' && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 flex flex-col items-center">
          <AiFeedback comment={state.aiComment} loading={state.isLoadingAi} />
          <GameBoard 
            onGuess={handleGuess} 
            onReset={handleReset} 
            status={state.status} 
            disabled={state.isLoadingAi || apiStatus !== 'connected'} 
          />
        </div>

        <div className="lg:col-span-5">
          <History history={state.history} />
        </div>
      </main>

      <SettingsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apiStatus={apiStatus}
        onSelectKey={handleOpenKeySettings}
        onTestConnection={async () => {
           const ok = await testConnection();
           setApiStatus(ok ? 'connected' : 'error');
        }}
      />
    </div>
  );
};

export default App;
