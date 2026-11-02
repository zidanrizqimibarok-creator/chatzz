import React from 'react';
import { Story } from '../../types';

interface Props {
  story: Story | null;
  onClose: () => void;
}

export const StoryViewModal: React.FC<Props> = ({ story, onClose }) => {
  if (!story) return null;

  const timeAgo = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 60000);
    if (diff < 1) return 'Baru saja';
    if (diff < 60) return `${diff} menit lalu`;
    const hours = Math.floor(diff / 60);
    return `${hours} jam lalu`;
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl w-full max-w-xs p-5 shadow-2xl border-2 border-blue-400/50 flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white text-lg font-bold w-7 h-7 flex items-center justify-center rounded-full bg-white/10"
        >
          &times;
        </button>

        {/* Sender Info */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border border-white flex items-center justify-center font-black text-sm shadow">
            {story.senderName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-xs text-white leading-tight">{story.senderName}</h4>
            <div className="flex items-center gap-1.5 text-[10px] text-cyan-300 font-mono mt-0.5">
              <span>PIN: {story.sender}</span>
              <span>•</span>
              <span className="text-slate-400">{timeAgo(story.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Story Text Box */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 my-2 min-h-[90px] flex items-center justify-center text-center">
          <p className="text-sm font-medium text-white italic drop-shadow-sm leading-relaxed">
            &ldquo;{story.text}&rdquo;
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-3 border-t border-white/10 font-mono">
          <span>
            <i className="fa-solid fa-clock mr-1 text-cyan-400"></i>Aktif 23 Jam
          </span>
          <button
            onClick={onClose}
            className="btn-jelly px-3 py-1 rounded-lg text-[10px] font-bold text-white shadow"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
