import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  contactCount: number;
  onClose: () => void;
  onSendBroadcast: (text: string) => void;
}

export const BroadcastModal: React.FC<Props> = ({
  isOpen,
  contactCount,
  onClose,
  onSendBroadcast,
}) => {
  const [text, setText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    setErrorMsg('');
    const trimmed = text.trim();
    if (!trimmed) {
      setErrorMsg('Tulis isi pesan siaran!');
      return;
    }
    if (contactCount === 0) {
      setErrorMsg('Kamu belum memiliki kontak untuk dikirimi pesan siaran!');
      return;
    }
    onSendBroadcast(trimmed);
    setText('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xs p-4 shadow-2xl border border-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white text-xs">
            <i className="fa-solid fa-tower-broadcast"></i>
          </div>
          <h3 className="font-bold text-sm text-slate-800">Pesan Siaran (BC)</h3>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Kirim pesan siaran massal sekaligus ke seluruh <b>{contactCount}</b> kontakmu.
        </p>
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] p-2 rounded-xl mb-2 font-medium">
            {errorMsg}
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Tulis pesan siaran (misal: Ping me! atau info penting)..."
          maxLength={160}
          className="w-full inset-panel p-2.5 rounded-xl text-xs outline-none mb-3 resize-none font-sans"
        />

        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
          >
            Batal
          </button>
          <button
            onClick={handleSend}
            className="flex-1 btn-purple-jelly py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-bullhorn text-[10px]"></i>
            <span>Kirim BC</span>
          </button>
        </div>
      </div>
    </div>
  );
};
