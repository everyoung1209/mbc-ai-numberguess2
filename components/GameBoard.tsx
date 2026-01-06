
import React, { useState } from 'react';
import { GameStatus } from '../types';

interface GameBoardProps {
  onGuess: (value: number) => void;
  onReset: () => void;
  status: GameStatus;
  disabled: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ onGuess, onReset, status, disabled }) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputValue);
    if (isNaN(num) || num < 1 || num > 100) {
      alert('1에서 100 사이의 유효한 숫자를 입력해주세요.');
      return;
    }
    onGuess(num);
    setInputValue('');
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {status === GameStatus.WON ? '🎉 승리했습니다!' : '숫자를 맞춰보세요 (1-100)'}
      </h2>

      {status === GameStatus.PLAYING ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            min="1"
            max="100"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={disabled}
            placeholder="입력..."
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-2xl text-center focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            autoFocus
          />
          <button
            type="submit"
            disabled={disabled || !inputValue}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
          >
            {disabled ? '생각 중...' : '확인'}
          </button>
        </form>
      ) : (
        <button
          onClick={onReset}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
        >
          다시 시작하기
        </button>
      )}
    </div>
  );
};

export default GameBoard;
