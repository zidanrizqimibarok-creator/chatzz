import React from 'react';

interface Props {
  isOpen: boolean;
  isMyMessage: boolean;
  messageText: string;
  onClose: () => void;
  onDeleteForEveryone: () => void;
  onDeleteForMe: () => void;
}

export const DeleteMessageModal: React.FC<Props> = ({
  isOpen,
  isMyMessage,
  messageText,
  onClose,
  onDeleteForEveryone,
  onDeleteForMe,
}) => {
  if (!isOpen) return null;

  const displaySnippet = messageText.startsWith('[AUDIO]:')
    ? 'Pesan Suara'
    : messageText.startsWith('[IMAGE]:')
    ? 'Foto'
    : messageText.length > 40
    ? messageText.substring(0, 40) + '...'
    : messageText;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xs p-4 shadow-2xl border border-white text-center">
        <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-lg mx-auto mb-2 shadow-inner">
          <i className="fa-solid fa-trash-can"></i>
        </div>

        <h3 className="font-bold text-sm text-slate-800 mb-1">Hapus Pesan</h3>
        <p className="text-xs text-slate-500 mb-3 font-sans">
          &quot;{displaySnippet}&quot;
        </p>

        <div className="space-y-2 mb-3">
          {isMyMessage && (
            <button
              onClick={() => {
                onDeleteForEveryone();
                onClose();
              }}
              className="w-full btn-danger-jelly py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
            >
              <i className="fa-solid fa-ban text-[10px]"></i>
              <span>Tarik untuk Semua Orang (Unsend)</span>
            </button>
          )}

          <button
            onClick={() => {
              onDeleteForMe();
              onClose();
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-300 transition"
          >
            <i className="fa-solid fa-trash text-[10px]"></i>
            <span>Hapus untuk Saya Sendiri</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600"
        >
          Batal
        </button>
      </div>
    </div>
  );
};
