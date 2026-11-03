import React from 'react';

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
  return (
    <header className="h-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/60 px-4 flex items-center justify-between text-white shadow-sm relative z-30 select-none">
      {/* Brand & User PIN */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-sm ring-2 ring-white/10">
            zZ
          </div>
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
              isOnline ? 'bg-emerald-400' : 'bg-slate-400'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-sm tracking-tight text-white leading-none">
              Chatzz
            </h1>
            <span className="text-[10px] text-sky-400 font-medium">Messenger</span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <button
              onClick={onCopyPin}
              className="text-[11px] font-mono text-slate-300 hover:text-white transition flex items-center gap-1 group cursor-pointer"
              title="Salin Chatzz ID / PIN"
            >
              <span className="text-slate-400 text-[10px]">ID:</span>
              <span className="font-semibold text-sky-300 group-hover:underline">{pin || '--------'}</span>
              <i className="fa-regular fa-copy text-[9px] text-slate-400 group-hover:text-sky-300"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Top Actions */}
      <div className="flex items-center space-x-1 sm:space-x-1.5">
        {/* QR Code */}
        <button
          onClick={onOpenQr}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition flex items-center gap-1 text-xs"
          title="Kode QR Kontak & Undangan"
        >
          <i className="fa-solid fa-qrcode text-sm"></i>
          <span className="hidden md:inline text-xs font-medium">QR</span>
        </button>

        {/* Stories / Status */}
        <button
          onClick={onOpenStory}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition flex items-center gap-1 text-xs relative"
          title="Status Cerita (24 Jam)"
        >
          <i className="fa-solid fa-circle-notch text-sm text-sky-400"></i>
          <span className="hidden md:inline text-xs font-medium">Status</span>
        </button>

        {/* Broadcast */}
        <button
          onClick={onOpenBroadcast}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition flex items-center gap-1 text-xs"
          title="Pesan Siaran (Broadcast)"
        >
          <i className="fa-solid fa-tower-broadcast text-sm text-purple-400"></i>
          <span className="hidden md:inline text-xs font-medium">Siaran</span>
        </button>

        {/* Random Anonymous Match */}
        {onOpenRandomChat && (
          <button
            onClick={onOpenRandomChat}
            className="p-2 rounded-xl text-amber-300 hover:text-white hover:bg-slate-700/50 transition flex items-center gap-1 text-xs"
            title="Temu Teman Random (Anonymous Chat)"
          >
            <i className="fa-solid fa-shuffle text-sm text-amber-400"></i>
            <span className="hidden lg:inline text-xs font-medium">Random</span>
          </button>
        )}

        {/* Public Global Room */}
        <button
          onClick={onOpenGlobal}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition flex items-center gap-1 text-xs"
          title="Ruang Obrolan Publik"
        >
          <i className="fa-solid fa-earth-asia text-sm text-emerald-400"></i>
          <span className="hidden md:inline text-xs font-medium">Publik</span>
        </button>

        {/* Tools & Settings */}
        <button
          onClick={onOpenTools}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition flex items-center gap-1 text-xs"
          title="Pengaturan & Fitur"
        >
          <i className="fa-solid fa-gear text-sm"></i>
        </button>

        {/* Profile */}
        <button
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 flex items-center justify-center text-slate-200 hover:text-white transition shadow-sm"
          title="Profil Saya"
        >
          <i className="fa-solid fa-user text-xs"></i>
        </button>
      </div>
    </header>
  );
};
