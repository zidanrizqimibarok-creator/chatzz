import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPublishStory: (text: string) => void;
}

export const StoryModal: React.FC<Props> = ({ isOpen, onClose, onPublishStory }) => {
  const [text, setText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePublish = () => {
    setErrorMsg('');
    const trimmed = text.trim();
    if (!trimmed) {
      setErrorMsg('Tulis status terlebih dahulu!');
      return;
    }
    onPublishStory(trimmed);
    setText('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xs p-4 shadow-2xl border border-white">
        <h3 className="font-bold text-sm text-slate-800 mb-1">Buat Status Baru</h3>
        <p className="text-xs text-slate-500 mb-2">Status hilang otomatis setelah 23 jam.</p>
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] p-2 rounded-xl mb-2 font-medium">
            {errorMsg}
          </div>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Tulis status atau aktivitasmu..."
          maxLength={120}
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
            onClick={handlePublish}
            className="flex-1 btn-jelly py-2 rounded-xl text-xs font-bold"
          >
            Posting
          </button>
        </div>
      </div>
    </div>
  );
};
