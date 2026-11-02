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
    id: 'whatsapp-doodle-light',
    name: 'WhatsApp Light Doodle',
    category: 'WhatsApp',
    style: {
      backgroundColor: '#efeae2',
      backgroundImage:
        'radial-gradient(#d3cbbe 10%, transparent 11%), radial-gradient(#d3cbbe 10%, transparent 11%)',
      backgroundSize: '24px 24px',
      backgroundPosition: '0 0, 12px 12px',
    },
    description: 'Latar pola hangat klasik khas WhatsApp Light',
  },
  {
    id: 'whatsapp-doodle-dark',
    name: 'WhatsApp Dark Mode',
    category: 'WhatsApp',
    style: {
      backgroundColor: '#0b141a',
      backgroundImage:
        'radial-gradient(#1f2c34 10%, transparent 11%), radial-gradient(#1f2c34 10%, transparent 11%)',
      backgroundSize: '24px 24px',
      backgroundPosition: '0 0, 12px 12px',
    },
    description: 'Latar gelap elegan khas WhatsApp Dark Mode',
  },
  {
    id: 'telegram-day',
    name: 'Telegram Cloud Blue',
    category: 'Telegram',
    style: {
      background: 'linear-gradient(180deg, #9bbad0 0%, #8ca9be 100%)',
    },
    description: 'Gradien langit lembut khas obrolan Telegram',
  },
  {
    id: 'telegram-night',
    name: 'Telegram Midnight',
    category: 'Telegram',
    style: {
      background: 'linear-gradient(180deg, #17212b 0%, #0e1621 100%)',
    },
    description: 'Mode malam mewah tema Telegram Desktop & Mobile',
  },
  {
    id: 'ios-minimal',
    name: 'Apple iMessage Clean',
    category: 'Modern',
    style: {
      backgroundColor: '#f2f2f7',
    },
    description: 'Minimalis abu-abu terang modern khas iOS Messages',
  },
  {
    id: 'emerald-serene',
    name: 'Emerald Forest',
    category: 'Modern',
    style: {
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    },
    description: 'Nuansa hijau sage sejuk dan menenangkan mata',
  },
  {
    id: 'sakura-blush',
    name: 'Lavender Pastel',
    category: 'Modern',
    style: {
      background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
    },
    description: 'Sentuhan pastel modern elegan dan bersih',
  },
  {
    id: 'classic',
    name: 'Clean Slate Neutral',
    category: 'Modern',
    style: {
      backgroundColor: '#f8fafc',
    },
    description: 'Latar putih netral kontemporer',
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

  const categories = Array.from(new Set(WALLPAPER_PRESETS.map((w) => w.category)));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold">
              <i className="fa-solid fa-image"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 leading-tight">
                Wallpaper Obrolan
              </h3>
              <p className="text-[11px] text-slate-500">
                Gaya tema WhatsApp, Telegram, dan modern
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold transition"
          >
            &times;
          </button>
        </div>

        {/* Wallpaper Grid */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {categories.map((cat) => (
            <div key={cat} className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                {cat}
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {WALLPAPER_PRESETS.filter((w) => w.category === cat).map((wp) => {
                  const isSelected = activeWallpaperId === wp.id;
                  return (
                    <button
                      key={wp.id}
                      onClick={() => {
                        onSelectWallpaper(wp.id);
                        onClose();
                      }}
                      className={`relative rounded-2xl overflow-hidden border-2 text-left transition-all p-2.5 flex flex-col justify-between h-28 group cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                      style={wp.style}
                    >
                      {/* Active Checkmark Pill */}
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm">
                          {wp.name}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shadow">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        )}
                      </div>

                      {/* Mock Mini Message Bubbles Preview */}
                      <div className="space-y-1 w-full pointer-events-none opacity-85 group-hover:opacity-100 transition">
                        <div className="bg-white text-[8px] font-medium text-slate-700 px-2 py-0.5 rounded-lg rounded-bl-xs w-3/4 shadow-sm truncate">
                          Halo bro! 👋
                        </div>
                        <div className="bg-emerald-100 text-[8px] font-medium text-emerald-900 px-2 py-0.5 rounded-lg rounded-br-xs w-3/4 ml-auto shadow-sm truncate text-right">
                          Siap, apa kabar?
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
