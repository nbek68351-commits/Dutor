
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, HistoryItem, Note } from './types';
import { DUTOR_NOTES, TRANSLATIONS } from './constants';
import { autoCorrelate } from './services/audioService';
import TunerGauge from './components/TunerGauge';
import HistoryView from './components/HistoryView';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('uz');
  const [isTuning, setIsTuning] = useState(false);
  const [detectedFreq, setDetectedFreq] = useState(0);
  const [targetNote, setTargetNote] = useState<Note | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const historyIntervalRef = useRef<number | null>(null);

  const t = TRANSLATIONS[lang];

  // Logic to find the closest note from the DUTOR_NOTES list
  const findClosestNote = (freq: number): Note | null => {
    if (freq <= 0) return null;
    let closest = DUTOR_NOTES[0];
    let minDiff = Math.abs(freq - DUTOR_NOTES[0].freq);

    for (let i = 1; i < DUTOR_NOTES.length; i++) {
      const diff = Math.abs(freq - DUTOR_NOTES[i].freq);
      if (diff < minDiff) {
        minDiff = diff;
        closest = DUTOR_NOTES[i];
      }
    }
    
    // Only return if it's reasonably close to a note (within 25Hz)
    return minDiff < 25 ? closest : null;
  };

  const speakCorrect = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(t.correct);
    utterance.lang = lang === 'uz' ? 'uz-UZ' : lang === 'kk' ? 'kk-KZ' : 'ru-RU';
    window.speechSynthesis.speak(utterance);
  }, [t.correct, lang]);

  const updateTuning = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const buffer = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(buffer);
    const freq = autoCorrelate(buffer, audioContextRef.current.sampleRate);

    if (freq > 0) {
      setDetectedFreq(freq);
      const note = findClosestNote(freq);
      setTargetNote(note);

      // "Correct" detection: within 2 Hz tolerance
      if (note && Math.abs(freq - note.freq) < 2) {
        if (!isCorrect) {
          setIsCorrect(true);
          speakCorrect();
        }
      } else {
        setIsCorrect(false);
      }
    }

    animationFrameRef.current = requestAnimationFrame(updateTuning);
  }, [isCorrect, speakCorrect]);

  const startTuning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      setIsTuning(true);

      updateTuning();

      // Start history recording every 3 seconds
      historyIntervalRef.current = window.setInterval(() => {
        setDetectedFreq((currentFreq) => {
          if (currentFreq > 0) {
            const currentNote = findClosestNote(currentFreq);
            if (currentNote) {
              setHistory(prev => {
                const newItem: HistoryItem = {
                  timestamp: Date.now(),
                  note: currentNote.name,
                  frequency: currentFreq
                };
                // Keep only last 50 items
                return [...prev, newItem].slice(-50);
              });
            }
          }
          return currentFreq;
        });
      }, 3000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert(t.micPermission);
    }
  };

  const stopTuning = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (historyIntervalRef.current) clearInterval(historyIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) audioContextRef.current.close();
    
    setIsTuning(false);
    setDetectedFreq(0);
    setTargetNote(null);
    setIsCorrect(false);
  };

  useEffect(() => {
    return () => {
      stopTuning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-900/50">
            <i className="fas fa-music text-2xl"></i>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">
            Dutor <span className="text-blue-500">Tuner</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
            {(['uz', 'kk', 'ru'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-md text-sm font-bold uppercase transition-all ${lang === l ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300"
          >
            <i className={`fas ${showMenu ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Tuner Section */}
        <div className="space-y-6">
          <TunerGauge 
            detectedFreq={detectedFreq} 
            targetNote={targetNote} 
            t={t} 
            isCorrect={isCorrect} 
          />

          <div className="flex flex-col gap-4">
            <button
              onClick={isTuning ? stopTuning : startTuning}
              className={`w-full py-5 rounded-2xl text-xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 ${
                isTuning 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-900/20' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'
              }`}
            >
              <i className={`fas ${isTuning ? 'fa-stop-circle' : 'fa-play-circle'}`}></i>
              {isTuning ? t.stopTuning : t.startTuning}
            </button>
          </div>
        </div>

        {/* History Section */}
        <HistoryView 
          history={history} 
          t={t} 
          onClear={() => setHistory([])} 
        />
      </div>

      {/* Side/Mobile Menu */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 h-full shadow-2xl border-l border-slate-700 p-8 flex flex-col animate-slideInRight">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold uppercase tracking-widest">{t.menu}</h2>
              <button onClick={() => setShowMenu(false)} className="text-slate-400 hover:text-white">
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            <div className="space-y-6">
              <div className="md:hidden">
                <p className="text-slate-500 mb-2 uppercase text-xs font-bold tracking-widest">Language</p>
                <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
                  {(['uz', 'kk', 'ru'] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-bold uppercase transition-all ${lang === l ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-slate-500 mb-4 uppercase text-xs font-bold tracking-widest">{t.tuner}</p>
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                   <p className="text-sm text-slate-300 leading-relaxed">
                     This professional Dutor tuner provides high-precision frequency analysis for musicians and students. 
                     Align your strings with the specified frequencies for the best sound.
                   </p>
                </div>
              </div>

              <div className="mt-auto">
                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-code"></i>
                  </div>
                  <div>
                    <p className="text-xs text-blue-400 uppercase font-bold tracking-wider">Dev Team</p>
                    <p className="text-sm font-bold text-white">Jubatkhanov Nurlan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Credits */}
      <footer className="mt-auto pt-10 border-t border-slate-800 flex flex-col items-center gap-4">
        <p className="text-slate-500 text-sm font-medium">
          {t.programmer}
        </p>
        <div className="flex gap-6 text-slate-600">
           <i className="fab fa-github hover:text-blue-400 transition-colors cursor-pointer"></i>
           <i className="fab fa-linkedin hover:text-blue-400 transition-colors cursor-pointer"></i>
           <i className="fab fa-telegram hover:text-blue-400 transition-colors cursor-pointer"></i>
        </div>
      </footer>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
