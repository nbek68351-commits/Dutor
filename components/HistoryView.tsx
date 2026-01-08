
import React from 'react';
import { HistoryItem, Translations } from '../types';

interface HistoryViewProps {
  history: HistoryItem[];
  t: Translations;
  onClear: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, t, onClear }) => {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 max-h-[400px] overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-800 py-2">
        <h2 className="text-xl font-bold text-blue-400">
          <i className="fas fa-history mr-2"></i>{t.history}
        </h2>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase font-bold"
          >
            {t.clearHistory}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <i className="fas fa-microphone-slash text-4xl mb-3 block"></i>
          {t.noHistory}
        </div>
      ) : (
        <div className="space-y-3">
          {[...history].reverse().map((item, index) => (
            <div 
              key={item.timestamp + index} 
              className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg border border-slate-600/50 animate-fadeIn"
            >
              <div>
                <span className="font-bold text-white text-lg">{item.note}</span>
                <span className="ml-2 text-slate-400 text-sm">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className="text-blue-400 font-mono">
                {item.frequency.toFixed(1)} Hz
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
