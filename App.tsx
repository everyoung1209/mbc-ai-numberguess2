
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GameStatus, GuessRecord } from './types';
import { getAiComment } from './services/geminiService';
import GameBoard from './components/GameBoard';
import History from './components/History';
import AiFeedback from './components/AiFeedback';

const generateRandomNumber = () => Math.floor(Math.random() * 100) + 1;

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

    // Fetch AI comment
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12 px-4 overflow-y-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent mb-2">
          NUMBER MASTER
        </h1>
        <p className="text-slate-500 font-medium">Gemini AI가 당신의 모든 움직임을 지켜보고 있습니다.</p>
      </header>

      <main className="w-full flex flex-col items-center">
        <div className="w-full max-w-lg">
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

          <div className="mt-8 text-center text-slate-400 text-sm">
            현재 시도 횟수: <span className="text-blue-400 font-bold text-lg ml-1">{state.attempts}</span>
          </div>

          <History history={state.history} />
        </div>
      </main>

      <footer className="mt-auto pt-12 text-slate-600 text-[10px] text-center">
        &copy; 2024 Gemini Number Master - Powered by Gemini-3-Flash
      </footer>
    </div>
  );
};

export default App;
