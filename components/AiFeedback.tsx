
import React from 'react';

interface AiFeedbackProps {
  comment: string;
  loading: boolean;
}

const AiFeedback: React.FC<AiFeedbackProps> = ({ comment, loading }) => {
  return (
    <div className="w-full max-w-md mx-auto my-8 min-h-[100px] flex items-center justify-center relative">
      <div className="absolute -top-6 left-4 bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tighter">
        AI Game Master
      </div>
      <div className="w-full p-5 bg-slate-900/80 border-l-4 border-blue-500 rounded-r-xl shadow-inner">
        {loading ? (
          <div className="flex space-x-1 items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        ) : (
          <p className="text-slate-200 text-lg italic leading-relaxed">
            "{comment || '게임을 시작하려면 숫자를 입력해 보세요.'}"
          </p>
        )}
      </div>
    </div>
  );
};

export default AiFeedback;
