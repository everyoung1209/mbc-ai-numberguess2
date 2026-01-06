
import React from 'react';
import { GuessRecord } from '../types';

interface HistoryProps {
  history: GuessRecord[];
}

const History: React.FC<HistoryProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <h3 className="text-slate-400 text-sm font-semibold mb-3 uppercase tracking-wider">최근 기록</h3>
      <div className="grid grid-cols-2 gap-2">
        {history.slice().reverse().map((record) => (
          <div 
            key={record.timestamp}
            className={`p-3 rounded-lg border flex items-center justify-between ${
              record.result === 'correct' 
                ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' 
                : record.result === 'high'
                ? 'bg-red-900/20 border-red-800 text-red-400'
                : 'bg-blue-900/20 border-blue-800 text-blue-400'
            }`}
          >
            <span className="font-bold text-lg">{record.value}</span>
            <span className="text-xs font-medium">
              {record.result === 'high' ? 'High' : record.result === 'low' ? 'Low' : 'Correct'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
