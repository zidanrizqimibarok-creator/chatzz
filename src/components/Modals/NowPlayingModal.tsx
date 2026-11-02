import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  currentSong: string;
  onClose: () => void;
  onSave: (song: string) => void;
}

const PRESET_SONGS = [
  'Linkin Park - In The End',
  'Avril Lavigne - Complicated',
  'Sheila On 7 - Dan',
  'Green Day - Boulevard of Broken Dreams',
  'Coldplay - The Scientist',
  'Dewa 19 - Kangen',
  'Evanescence - Bring Me To Life',
  'Peterpan - Ada Apa Denganmu',
];

export const NowPlayingModal: React.FC<Props> = ({
  isOpen,
  currentSong,
  onClose,
  onSave,
}) => {
  const [song, setSong] = useState(currentSong);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xs p-4 shadow-2xl border border-white">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white text-xs shadow-md">
            <i className="fa-solid fa-music"></i>
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-800">Status Musik (Now Playing)</h3>
            <p className="text-[9px] text-slate-400">Tampilkan lagu yang sedang kamu dengar</p>
          </div>
        </div>

        <div className="mb-3">
          <label className="text-[10px] font-bold text-slate-500 block mb-1">
            JUDUL LAGU & ARTIS
          </label>
          <input
            type="text"
            value={song}
            onChange={(e) => setSong(e.target.value)}
            placeholder="Contoh: Dewa 19 - Kangen"
            maxLength={40}
            className="w-full inset-panel px-3 py-1.5 text-xs outline-none rounded-xl font-sans"
          />
        </div>

        <span className="text-[9px] font-bold text-slate-400 block mb-1.5">
          PILIHAN LAGU NOSTALGIA:
        </span>
        <div className="space-y-1 max-h-36 overflow-y-auto mb-3">
          {PRESET_SONGS.map((preset) => (
            <button
              key={preset}
              onClick={() => setSong(preset)}
              className="w-full text-left text-[10px] p-1.5 rounded-lg bg-slate-50 hover:bg-pink-50 hover:text-pink-700 transition flex items-center gap-1.5 border border-slate-100"
            >
              <i className="fa-solid fa-headphones text-[8px] text-pink-500"></i>
              <span className="truncate">{preset}</span>
            </button>
          ))}
        </div>

        <div className="flex space-x-2">
          {currentSong && (
            <button
              onClick={() => {
                onSave('');
                onClose();
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
              title="Hapus Status Musik"
            >
              Hapus
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onSave(song.trim());
              onClose();
            }}
            className="flex-1 btn-jelly py-2 rounded-xl text-xs font-bold shadow"
          >
            Pasang Status
          </button>
        </div>
      </div>
    </div>
  );
};
