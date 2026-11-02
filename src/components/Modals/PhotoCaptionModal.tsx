import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSend: (imageSrc: string, caption: string) => void;
}

export const PhotoCaptionModal: React.FC<Props> = ({
  isOpen,
  imageSrc,
  onClose,
  onSend,
}) => {
  const [caption, setCaption] = useState('');

  if (!isOpen || !imageSrc) return null;

  const handleSend = () => {
    onSend(imageSrc, caption.trim());
    setCaption('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xs p-4 shadow-2xl text-white flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-300">
            <i className="fa-solid fa-image text-emerald-400 mr-1"></i> Kirim Foto dengan Keterangan
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-bold"
          >
            &times;
          </button>
        </div>

        <div className="relative w-full max-h-56 bg-black rounded-2xl overflow-hidden mb-3 border border-slate-800 flex items-center justify-center">
          <img
            src={imageSrc}
            alt="Upload preview"
            className="max-h-56 object-contain"
          />
        </div>

        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Tulis keterangan foto (opsional)..."
          maxLength={100}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 outline-none mb-3"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />

        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            onClick={handleSend}
            className="flex-1 btn-success-jelly py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
          >
            <i className="fa-solid fa-paper-plane"></i>
            <span>Kirim Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
