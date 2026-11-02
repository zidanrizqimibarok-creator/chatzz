import React from 'react';

interface Props {
  pin: string;
  onCopyPin: () => void;
  onOpenQr: () => void;
  onOpenBroadcast: () => void;
  onOpenGlobal: () => void;
  onOpenStory: () => void;
  onOpenTools: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<Props> = ({
  pin,
  onCopyPin,
  onOpenQr,
  onOpenBroadcast,
  onOpenGlobal,
  onOpenStory,
  onOpenTools,
  onOpenProfile,
}) => {
  return (
    <div className="jelly-header p-2.5 flex items-center justify-between text-white shadow-md relative z-20">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-300 to-blue-600 border-2 border-white/80 flex items-center justify-center font-black text-xs shadow-md">
          zZ
        </div>
        <div>
          <h2 className="font-bold text-xs leading-none tracking-wide text-white drop-shadow">
            Chatzz Messenger
          </h2>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <button
              onClick={onCopyPin}
              className="text-[9px] text-yellow-300 font-mono font-bold cursor-pointer hover:underline block text-left"
              title="Klik untuk Salin PIN"
            >
              PIN: {pin || '--------'}
            </button>
            <button
              onClick={onOpenQr}
              className="text-[8px] bg-white/20 hover:bg-white/30 text-white px-1.5 py-0.2 rounded font-sans border border-white/30 flex items-center gap-0.5"
              title="Buka Barcode QR PIN"
            >
              <i className="fa-solid fa-qrcode text-[8px]"></i>
              <span>QR</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={onOpenBroadcast}
          className="btn-purple-jelly px-2 py-1 rounded-lg text-xs flex items-center gap-1 shadow"
          title="Kirim Pesan Siaran (BC)"
        >
          <i className="fa-solid fa-tower-broadcast text-[9px]"></i>
          <span className="text-[9px] font-bold">BC</span>
        </button>
        <button
          onClick={onOpenGlobal}
          className="btn-jelly px-2 py-1 rounded-lg text-xs flex items-center gap-1 shadow"
          title="Obrolan Global Publik"
        >
          <i className="fa-solid fa-earth-asia text-[9px]"></i>
          <span className="text-[9px] font-bold">Global</span>
        </button>
        <button
          onClick={onOpenStory}
          className="btn-jelly px-2 py-1 rounded-lg text-xs flex items-center gap-1 shadow"
          title="Status 23 Jam"
        >
          <i className="fa-solid fa-clock-rotate-left text-[9px]"></i>
          <span className="text-[9px] font-bold">Status</span>
        </button>
        <button
          onClick={onOpenTools}
          className="btn-jelly px-2 py-1 rounded-lg text-xs flex items-center gap-1 shadow"
          title="Tools & Pengaturan"
        >
          <i className="fa-solid fa-toolbox text-[9px]"></i>
          <span className="text-[9px] font-bold">Tools</span>
        </button>
        <button
          onClick={onOpenProfile}
          className="w-7 h-7 rounded-lg bg-blue-700/80 hover:bg-blue-600 border border-white/50 flex items-center justify-center shadow"
          title="Profil"
        >
          <i className="fa-solid fa-user-gear text-[10px]"></i>
        </button>
      </div>
    </div>
  );
};
