import React, { useState, useRef, useEffect } from 'react';

interface Props {
  pin: string;
  isOnline?: boolean;
  onCopyPin: () => void;
  onOpenQr: () => void;
  onOpenBroadcast: () => void;
  onOpenGlobal: () => void;
  onOpenStory: () => void;
  onOpenRandomChat?: () => void;
  onOpenTools: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<Props> = ({
  pin,
  isOnline = true,
  onCopyPin,
  onOpenQr,
  onOpenBroadcast,
  onOpenGlobal,
  onOpenStory,
  onOpenRandomChat,
  onOpenTools,
  onOpenProfile,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="h-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/60 px-3 sm:px-4 flex items-center justify-between text-white shadow-sm relative z-30 select-none">
      {/* Brand & User PIN */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md ring-1 ring-white/20">
            <span className="italic tracking-tighter">zZ</span>
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
              isOnline ? 'bg-emerald-400' : 'bg-slate-400'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-sm tracking-tight text-white leading-none">
              Chatzz
            </h1>
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <button
              onClick={onCopyPin}
              className="text-[11px] font-mono text-slate-300 hover:text-white transition flex items-center gap-1 group cursor-pointer truncate max-w-[130px] sm:max-w-none"
              title="Salin Chatzz ID / PIN"
            >
              <span className="text-slate-400 text-[10px]">ID:</span>
              <span className="font-semibold text-sky-300 group-hover:underline">{pin || '--------'}</span>
              <i className="fa-regular fa-copy text-[9px] text-slate-400 group-hover:text-sky-300"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Clean Uncluttered Action Bar */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
        {/* Random Match Shortcut */}
        {onOpenRandomChat && (
          <button
            onClick={onOpenRandomChat}
            className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 hover:text-white border border-purple-400/30 transition flex items-center gap-1 text-xs font-semibold cursor-pointer shadow-xs"
            title="Temu Teman Random (Anonymous Chat)"
          >
            <i className="fa-solid fa-shuffle text-amber-400 text-xs"></i>
            <span className="hidden sm:inline text-xs">Random</span>
          </button>
        )}

        {/* Public Global Room */}
        <button
          onClick={onOpenGlobal}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition flex items-center gap-1 text-xs"
          title="Ruang Obrolan Publik Global"
        >
          <i className="fa-solid fa-earth-asia text-emerald-400 text-sm"></i>
          <span className="hidden md:inline text-xs font-medium">Publik</span>
        </button>

        {/* Dropdown Menu for More Actions (prevents crowded overlapping buttons) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition flex items-center justify-center text-xs ${
              isMenuOpen ? 'bg-slate-700 text-white' : ''
            }`}
            title="Menu Fitur Lainnya"
          >
            <i className="fa-solid fa-ellipsis-vertical text-sm"></i>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-1.5 z-50 text-slate-200 animate-fade-in select-none">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenStory();
                }}
                className="w-full px-3.5 py-2.5 text-left text-xs font-medium hover:bg-slate-800 flex items-center gap-2.5 text-slate-200 hover:text-white transition"
              >
                <i className="fa-solid fa-circle-notch text-pink-400 text-xs w-4"></i>
                <span>Status Cerita (24 Jam)</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenQr();
                }}
                className="w-full px-3.5 py-2.5 text-left text-xs font-medium hover:bg-slate-800 flex items-center gap-2.5 text-slate-200 hover:text-white transition"
              >
                <i className="fa-solid fa-qrcode text-sky-400 text-xs w-4"></i>
                <span>Kode QR & Undangan</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenBroadcast();
                }}
                className="w-full px-3.5 py-2.5 text-left text-xs font-medium hover:bg-slate-800 flex items-center gap-2.5 text-slate-200 hover:text-white transition"
              >
                <i className="fa-solid fa-tower-broadcast text-purple-400 text-xs w-4"></i>
                <span>Kirim Siaran (Broadcast)</span>
              </button>

              <div className="my-1 border-t border-slate-800"></div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenTools();
                }}
                className="w-full px-3.5 py-2.5 text-left text-xs font-medium hover:bg-slate-800 flex items-center gap-2.5 text-slate-200 hover:text-white transition"
              >
                <i className="fa-solid fa-gear text-slate-400 text-xs w-4"></i>
                <span>Pengaturan & Alat</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Avatar Button */}
        <button
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 flex items-center justify-center text-slate-200 hover:text-white transition shadow-sm ml-0.5"
          title="Profil Saya"
        >
          <i className="fa-solid fa-user text-xs"></i>
        </button>
      </div>
    </header>
  );
};
