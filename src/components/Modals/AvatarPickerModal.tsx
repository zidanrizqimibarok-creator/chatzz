import React from 'react';

interface Props {
  isOpen: boolean;
  currentAvatar: string;
  onClose: () => void;
  onSelect: (avatarUrl: string) => void;
}

const RETRO_AVATARS = [
  { id: 'robot', icon: 'fa-robot', bg: 'from-blue-600 to-indigo-600', label: '8-Bit Bot' },
  { id: 'cat', icon: 'fa-cat', bg: 'from-pink-500 to-rose-600', label: 'Pixel Cat' },
  { id: 'gamepad', icon: 'fa-gamepad', bg: 'from-purple-600 to-violet-700', label: 'Retro Gamer' },
  { id: 'user-ninja', icon: 'fa-user-ninja', bg: 'from-slate-700 to-slate-900', label: 'Cyber Ninja' },
  { id: 'rocket', icon: 'fa-rocket', bg: 'from-amber-500 to-orange-600', label: 'Apollo Rocket' },
  { id: 'skull', icon: 'fa-skull', bg: 'from-emerald-600 to-teal-800', label: 'Neon Skull' },
  { id: 'headphones', icon: 'fa-headphones', bg: 'from-cyan-500 to-blue-500', label: 'Music DJ' },
  { id: 'ghost', icon: 'fa-ghost', bg: 'from-fuchsia-500 to-purple-600', label: 'Retro Ghost' },
];

export const AvatarPickerModal: React.FC<Props> = ({
  isOpen,
  currentAvatar,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xs p-4 shadow-2xl border border-white">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shadow">
              <i className="fa-solid fa-image-portrait"></i>
            </div>
            <h3 className="font-bold text-xs text-slate-800">Pilih Avatar Retro Chatzz</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {RETRO_AVATARS.map((av) => (
            <button
              key={av.id}
              onClick={() => {
                onSelect(av.id);
                onClose();
              }}
              className={`flex flex-col items-center p-2 rounded-2xl border transition hover:scale-105 ${
                currentAvatar === av.id
                  ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-400'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-tr ${av.bg} flex items-center justify-center text-white text-base shadow mb-1`}
              >
                <i className={`fa-solid ${av.icon}`}></i>
              </div>
              <span className="text-[8px] font-bold text-slate-600 truncate max-w-full">
                {av.label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
