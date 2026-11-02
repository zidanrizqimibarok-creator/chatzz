import React from 'react';

export interface WallpaperOption {
  id: string;
  name: string;
  category: string;
  style: React.CSSProperties;
  description: string;
}

export const WALLPAPER_PRESETS: WallpaperOption[] = [
  {
    id: 'classic',
    name: 'Aero Blue (Default)',
    category: 'Gradien Klasik',
    style: {
      background: 'linear-gradient(180deg, #e3eeff 0%, #d8e6fa 100%)',
    },
    description: 'Tampilan biru lembut khas BlackBerry & Windows Live Messenger',
  },
  {
    id: 'bbm-stripes',
    name: 'BBM Pinstripes',
    category: 'Tekstur Retro',
    style: {
      backgroundColor: '#e6effc',
      backgroundImage:
        'repeating-linear-gradient(45deg, rgba(20,90,210,0.06), rgba(20,90,210,0.06) 12px, transparent 12px, transparent 24px)',
    },
    description: 'Garis diagonal halus khas era BBM v5/v6',
  },
  {
    id: 'cyber-grid',
    name: '90s Cyber Grid',
    category: 'Tekstur Retro',
    style: {
      backgroundColor: '#0a1324',
      backgroundImage:
        'linear-gradient(rgba(56,189,248,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.15) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    },
    description: 'Kisi-kisi digital retro futuristik ala neon cyberpunk',
  },
  {
    id: 'bbm-carbon',
    name: 'BlackBerry Carbon',
    category: 'Pola Gelap',
    style: {
      backgroundColor: '#111827',
      backgroundImage:
        'radial-gradient(#1f2937 15%, transparent 16%), radial-gradient(#1f2937 15%, transparent 16%)',
      backgroundSize: '16px 16px',
      backgroundPosition: '0 0, 8px 8px',
    },
    description: 'Tekstur carbon weave casing BlackBerry Bold legendaris',
  },
  {
    id: 'retro-bubbles',
    name: 'Aqua Water Bubbles',
    category: 'Tekstur Retro',
    style: {
      background: 'radial-gradient(circle at 50% 50%, #cce3fe 0%, #a8cffa 100%)',
      backgroundImage:
        'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.7) 4%, transparent 5%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.5) 6%, transparent 7%)',
      backgroundSize: '80px 80px',
    },
    description: 'Efek gelembung air segar ala era Aqua Mac OS & Windows Vista',
  },
  {
    id: 'matrix-terminal',
    name: 'Matrix Code Dark',
    category: 'Pola Gelap',
    style: {
      backgroundColor: '#03140b',
      backgroundImage:
        'linear-gradient(rgba(34,197,94,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.06) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    },
    description: 'Terminal hacker hijau Matrix klasik',
  },
  {
    id: 'vintage-paper',
    name: 'Kertas Vintage Nostalgia',
    category: 'Kertas & Cat',
    style: {
      backgroundColor: '#fbf7ee',
      backgroundImage:
        'radial-gradient(#e6ded0 10%, transparent 11%), radial-gradient(#efe7da 10%, transparent 11%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px',
    },
    description: 'Serat kertas surat nostalgia yang hangat dan nyaman di mata',
  },
  {
    id: 'sakura-blush',
    name: 'Pastel Y2K Pink',
    category: 'Gradien Klasik',
    style: {
      background: 'linear-gradient(180deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
    },
    description: 'Gradasi pastel lembut era MSN Messenger',
  },
];

interface Props {
  isOpen: boolean;
  activeWallpaperId: string;
  onClose: () => void;
  onSelectWallpaper: (wallpaperId: string) => void;
}

export const WallpaperModal: React.FC<Props> = ({
  isOpen,
  activeWallpaperId,
  onClose,
  onSelectWallpaper,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl border border-white flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shadow">
              <i className="fa-solid fa-paintbrush"></i>
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-800">Wallpaper Obrolan (Chat Background)</h3>
              <p className="text-[9px] text-slate-400">Pilih tekstur & pola latar belakang chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            Tutup &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 my-1">
          {WALLPAPER_PRESETS.map((wp) => {
            const isSelected = activeWallpaperId === wp.id;
            return (
              <div
                key={wp.id}
                onClick={() => {
                  onSelectWallpaper(wp.id);
                  onClose();
                }}
                className={`p-2 rounded-2xl border flex items-center justify-between cursor-pointer transition hover:scale-[1.01] ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-400'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate flex-1">
                  {/* Thumbnail Preview */}
                  <div
                    className="w-12 h-12 rounded-xl border border-slate-300 shadow-inner shrink-0 overflow-hidden relative"
                    style={wp.style}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <i className="fa-solid fa-comment-dots text-xs"></i>
                    </div>
                  </div>

                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{wp.name}</span>
                      {isSelected && (
                        <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">
                          Aktif
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5">
                      {wp.description}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-2 ${
                    isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                  }`}
                >
                  <i className="fa-solid fa-check"></i>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full btn-jelly py-2 rounded-xl text-xs font-bold mt-2 shadow"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};
