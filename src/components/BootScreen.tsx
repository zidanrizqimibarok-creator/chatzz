import React, { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
  statusText?: string;
}

const BOOT_STEPS = [
  'Menyiapkan ruang obrolan aman...',
  'Memuat profil & preferensi...',
  'Menyinkronkan kontak Chatzz...',
  'Siap terhubung!',
];

export const BootScreen: React.FC<Props> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 20;
        if (next >= 100) {
          clearInterval(interval);
          setStepIndex(BOOT_STEPS.length - 1);
          setTimeout(() => {
            setIsFading(true);
            setTimeout(onComplete, 450);
          }, 200);
          return 100;
        }

        const calculatedIndex = Math.min(
          Math.floor((next / 100) * BOOT_STEPS.length),
          BOOT_STEPS.length - 1
        );
        setStepIndex(calculatedIndex);
        return next;
      });
    }, 130);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 z-50 flex flex-col items-center justify-center p-8 text-white transition-opacity duration-500 select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Distinctive Modern Chatzz Emblem */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-[2px] shadow-2xl shadow-blue-500/30 animate-pulse">
          <div className="w-full h-full bg-slate-950/80 backdrop-blur-md rounded-[22px] flex items-center justify-center relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute -top-6 -left-6 w-16 h-16 bg-sky-400/30 rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-indigo-500/30 rounded-full blur-xl pointer-events-none"></div>
            
            {/* Custom Modern Double-Z Emblem */}
            <div className="flex items-center space-x-0.5">
              <span className="text-3xl font-black italic tracking-tighter bg-gradient-to-br from-white via-sky-200 to-blue-400 bg-clip-text text-transparent drop-shadow">
                z
              </span>
              <span className="text-3xl font-black italic tracking-tighter bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-300 bg-clip-text text-transparent drop-shadow">
                Z
              </span>
            </div>
          </div>
        </div>

        {/* Small sparkling indicator dot */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500 border-2 border-slate-950"></span>
        </span>
      </div>

      {/* App Branding */}
      <h1 className="text-2xl font-black tracking-tight text-white mb-1 flex items-center gap-1.5">
        Chatzz <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-400/30">v2.0</span>
      </h1>
      <p className="text-xs text-slate-400 mb-6 font-medium">Private, Modern & Fast Messenger</p>

      {/* Progress Bar */}
      <div className="w-56 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 mb-3 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-full transition-all duration-200 shadow-sm shadow-sky-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Status Text */}
      <div className="text-[11px] text-sky-300/90 font-medium tracking-wide flex items-center gap-1.5">
        <i className="fa-solid fa-shield-halved text-[10px] text-sky-400 animate-spin"></i>
        <span>{BOOT_STEPS[stepIndex]}</span>
      </div>
    </div>
  );
};
