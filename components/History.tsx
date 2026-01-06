
import React from 'react';
import { GuessRecord } from '../types';

interface HistoryProps {
  history: GuessRecord[];
}

const History: React.FC<HistoryProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-slate-400 text-xs font-bold mb-4 uppercase tracking-[0.2em] border-b border-slate-800 pb-2">
        시도 이력 ({history.length})
      </h3>
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
        {history.slice().reverse().map((record, index) => (
          <div 
            key={record.timestamp}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 animate-in fade-in slide-in-from-right-4 ${
              index === 0 ? 'ring-2 ring-blue-500/50 scale-[1.02] shadow-lg shadow-blue-500/10' : ''
            } ${
              record.result === 'correct' 
                ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' 
                : record.result === 'high'
                ? 'bg-red-900/20 border-red-800/50 text-red-400'
                : 'bg-blue-900/20 border-blue-800/50 text-blue-400'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-2xl font-black">{record.value}</span>
              <span className="text-[10px] opacity-60">
                {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-xs font-black px-2 py-1 rounded uppercase tracking-tighter ${
                record.result === 'correct' ? 'bg-emerald-500 text-emerald-950' : 
                record.result === 'high' ? 'bg-red-500 text-red-950' : 'bg-blue-500 text-blue-950'
              }`}>
                {record.result === 'high' ? '너무 높음' : record.result === 'low' ? '너무 낮음' : '정답!'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default History;
