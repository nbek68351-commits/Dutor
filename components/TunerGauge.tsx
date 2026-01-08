
import React from 'react';
import { Note, Translations } from '../types';

interface TunerGaugeProps {
  detectedFreq: number;
  targetNote: Note | null;
  t: Translations;
  isCorrect: boolean;
}

const TunerGauge: React.FC<TunerGaugeProps> = ({ detectedFreq, targetNote, t, isCorrect }) => {
  // Calculate offset if we have a target note
  const offset = targetNote ? detectedFreq - targetNote.freq : 0;
  const maxRange = 20; // Max Hz offset for visual movement
  const percentage = Math.max(-100, Math.min(100, (offset / maxRange) * 100));

  return (
    <div className="relative flex flex-col items-center py-10 px-4 bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
      {/* Background Pulse Effect on Correct */}
      {isCorrect && (
        <div className="absolute inset-0 bg-green-500/10 animate-pulse pointer-events-none"></div>
      )}

      <div className="mb-2 text-slate-400 text-sm uppercase tracking-widest font-bold">
        {targetNote ? t.detected : t.title}
      </div>

      <div className={`text-7xl font-black mb-6 transition-all duration-300 ${isCorrect ? 'text-green-400 scale-110 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'text-blue-400'}`}>
        {targetNote ? targetNote.name : '--'}
      </div>

      {isCorrect && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce shadow-lg">
          {t.correct.toUpperCase()}!
        </div>
      )}

      {/* The Meter */}
      <div className="w-full max-w-xs h-4 bg-slate-900 rounded-full relative overflow-hidden border border-slate-700 mt-4">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/20 z-10"></div>
        
        {/* Pointer */}
        {targetNote && (
          <div 
            className={`absolute top-0 bottom-0 w-2 transition-all duration-100 ease-out z-20 ${isCorrect ? 'bg-green-400' : 'bg-blue-500'}`}
            style={{ left: `calc(50% + ${percentage / 2}%)`, transform: 'translateX(-50%)' }}
          ></div>
        )}
      </div>

      <div className="flex justify-between w-full max-w-xs mt-2 text-[10px] text-slate-500 font-mono uppercase">
        <span>Low</span>
        <span>Perfect</span>
        <span>High</span>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <div className="text-4xl font-mono text-slate-200">
          {detectedFreq > 0 ? detectedFreq.toFixed(1) : '0.0'}
          <span className="text-xl text-slate-500 ml-1">Hz</span>
        </div>
      </div>
    </div>
  );
};

export default TunerGauge;
