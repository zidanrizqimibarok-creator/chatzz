import React, { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  pin: string;
  currentNickname: string;
  onClose: () => void;
  onSave: (pin: string, newNickname: string) => void;
}

export const NicknameModal: React.FC<Props> = ({
  isOpen,
  pin,
  currentNickname,
  onClose,
  onSave,
}) => {
  const [nickname, setNickname] = useState(currentNickname);

  useEffect(() => {
    setNickname(currentNickname);
  }, [currentNickname, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(pin, nickname.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xs p-4 shadow-2xl border border-white">
        <h3 className="font-bold text-sm text-slate-800 mb-1">Ubah Nama Panggilan</h3>
        <p className="text-xs text-slate-500 mb-3">
          Nama alias khusus untuk kontak PIN <span className="font-mono font-bold text-blue-600">{pin}</span>
        </p>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Nama panggilan baru..."
          maxLength={24}
          className="w-full inset-panel px-3 py-2 text-xs outline-none rounded-xl mb-3 font-sans"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
        />
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 btn-jelly py-2 rounded-xl text-xs font-bold"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
