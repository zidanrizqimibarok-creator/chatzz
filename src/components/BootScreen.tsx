import React, { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
  statusText?: string;
}

export const BootScreen: React.FC<Props> = ({ onComplete, statusText = 'Menghubungkan MQTT WSS Port 8084...' }) => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsFading(true);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`absolute inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-8 text-white transition-opacity duration-500 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-xl border border-white/40 mb-3 animate-pulse">
        <span className="text-2xl font-black italic tracking-tighter text-white">zZ</span>
      </div>
      <h1 className="text-xl font-black tracking-widest text-blue-300 mb-2 font-sans">CHATZZ MESSENGER</h1>
      <div className="w-48 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 mb-3">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-[10px] text-cyan-400 font-mono">{statusText}</div>
    </div>
  );
};
