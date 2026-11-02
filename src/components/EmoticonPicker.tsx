import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoticon: string) => void;
}

const RETRO_EMOTICONS = [
  { label: 'Senyum', code: ':-)' },
  { label: 'Tertawa', code: ':-D' },
  { label: 'Kedip', code: ';-)' },
  { label: 'Julur Lidah', code: ':-P' },
  { label: 'Keren', code: '(H)' },
  { label: 'Malaikat', code: '(A)' },
  { label: 'Iblis', code: '(6)' },
  { label: 'Hati', code: '(L)' },
  { label: 'Patah Hati', code: '(U)' },
  { label: 'Jempol', code: '(Y)' },
  { label: 'Jempol Bawah', code: '(N)' },
  { label: 'Cium', code: ':-*' },
  { label: 'Kaget', code: ':-O' },
  { label: 'Kucing', code: '(=^.^=)' },
  { label: 'Bintang', code: '(*)' },
  { label: 'Kopi', code: '(C)' },
  { label: 'Musik', code: '(8)' },
  { label: 'Telepon', code: '(T)' },
  { label: 'Api', code: '(fire)' },
  { label: 'Rock On', code: '\\m/' },
];

const MODERN_EMOJIS = [
  '😀', '😂', '😎', '😍', '🤔', '🔥', '👍', '❤️', '🎉', '⚡', '☕', '🎵', '💯', '✨', '🚀', '👋'
];

export const EmoticonPicker: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-12 left-2 bg-white rounded-2xl shadow-2xl border border-slate-300 p-3 w-64 z-30">
      <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100">
        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
          <i className="fa-solid fa-face-smile text-amber-500"></i> Emoticon Retro & Emoji
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 text-xs font-bold"
        >
          &times;
        </button>
      </div>

      <div className="mb-2">
        <span className="text-[9px] font-bold text-slate-400 block mb-1">EMOJI</span>
        <div className="grid grid-cols-8 gap-1 text-base">
          {MODERN_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="hover:bg-slate-100 rounded p-1 text-center transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-[9px] font-bold text-slate-400 block mb-1">MSN / BBM KLASIK</span>
        <div className="grid grid-cols-4 gap-1 text-[11px] font-mono font-bold">
          {RETRO_EMOTICONS.map((emo) => (
            <button
              key={emo.code}
              onClick={() => onSelect(` ${emo.code} `)}
              className="bg-slate-50 hover:bg-blue-100 hover:text-blue-700 text-slate-700 rounded py-1 px-1 text-center border border-slate-200 transition text-[10px]"
              title={emo.label}
            >
              {emo.code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
