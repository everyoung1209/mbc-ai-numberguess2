
import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiStatus: 'checking' | 'connected' | 'not-set' | 'error';
  onSelectKey: () => Promise<void>;
  onTestConnection: () => Promise<void>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  apiStatus, 
  onSelectKey, 
  onTestConnection 
}) => {
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    await onTestConnection();
    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">API 매니저</h2>
              <p className="text-slate-400 text-sm">외부 API 키 보안 및 연결 관리</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                apiStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 
                apiStatus === 'error' ? 'bg-red-500/10 text-red-500' :
                'bg-slate-800 text-slate-400'
              }`}>
                {apiStatus === 'connected' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">연결 상태</div>
                <div className="text-lg font-bold">
                  {apiStatus === 'connected' ? '보안 연결됨' : 
                   apiStatus === 'checking' ? '확인 중...' : 
                   apiStatus === 'error' ? '연결 오류' : '설정 필요'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid gap-3">
              <button 
                onClick={onSelectKey}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zM7 7a3 3 0 016 0v2H7V7z" />
                </svg>
                API 키 선택 및 동기화
              </button>
              
              <button 
                onClick={handleTest}
                disabled={isTesting || apiStatus === 'not-set'}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 border border-slate-700"
              >
                {isTesting ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                연결 테스트 수행
              </button>
            </div>

            {/* Help Links */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors text-sm text-slate-400"
              >
                <span>결제 및 할당량 문서</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <p className="text-[11px] text-slate-600 px-3">
                선택된 API 키는 브라우저 보안 세션에 의해 관리되며, 로컬 저장소에 암호화된 참조로 유지됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
