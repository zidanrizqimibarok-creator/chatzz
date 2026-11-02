import React from 'react';

interface Props {
  isOpen: boolean;
}

export const MaintenanceOverlay: React.FC<Props> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl border border-blue-400 mb-5 animate-spin">
        <i className="fa-solid fa-spinner text-2xl text-white"></i>
      </div>
      <h2 className="text-sm font-bold text-blue-300 mb-2 font-sans tracking-wide">
        MOHON TUNGGU SAMPAI ADA PEMBERITAHUAN DARI PUSAT
      </h2>
      <p className="text-xs text-slate-400 max-w-xs">
        Sistem sedang disinkronisasi ulang oleh server utama.
      </p>
    </div>
  );
};
