import React, { useState } from 'react';
import { Contact } from '../../types';

interface Props {
  isOpen: boolean;
  contacts?: Contact[];
  onClose: () => void;
  onPublishStory: (text: string, excludedPins?: string[]) => void;
}

export const StoryModal: React.FC<Props> = ({
  isOpen,
  contacts = [],
  onClose,
  onPublishStory,
}) => {
  const [text, setText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [privacyMode, setPrivacyMode] = useState<'all' | 'custom'>('all');
  const [excludedPins, setExcludedPins] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleToggleExclude = (pin: string) => {
    setExcludedPins((prev) =>
      prev.includes(pin) ? prev.filter((p) => p !== pin) : [...prev, pin]
    );
  };

  const handlePublish = () => {
    setErrorMsg('');
    const trimmed = text.trim();
    if (!trimmed) {
      setErrorMsg('Tulis status terlebih dahulu!');
      return;
    }
    onPublishStory(trimmed, privacyMode === 'custom' ? excludedPins : []);
    setText('');
    setErrorMsg('');
    setExcludedPins([]);
    setPrivacyMode('all');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Buat Status Cerita Baru</h3>
            <p className="text-[11px] text-slate-500">Status akan aktif selama 24 jam</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm"
          >
            &times;
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[11px] p-2 rounded-xl mb-2 font-medium">
            {errorMsg}
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Apa yang sedang Anda pikirkan atau lakukan?..."
          maxLength={140}
          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 p-3 rounded-2xl text-xs outline-none mb-3 resize-none font-sans transition text-slate-800"
        />

        {/* Privacy Exclusion Controls */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 mb-4 space-y-2.5">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <i className="fa-solid fa-user-shield text-blue-600"></i>
            <span>Privasi Penonton Status:</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPrivacyMode('all')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition border ${
                privacyMode === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua Kontak
            </button>
            <button
              type="button"
              onClick={() => setPrivacyMode('custom')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition border ${
                privacyMode === 'custom'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Kecualikan Orang {excludedPins.length > 0 && `(${excludedPins.length})`}
            </button>
          </div>

          {/* Contact Checkbox Exclusion List */}
          {privacyMode === 'custom' && (
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-[10px] text-slate-500 block mb-1.5">
                Centang kontak yang <strong className="text-red-500">TIDAK BISA</strong> melihat status ini:
              </span>
              {contacts.length === 0 ? (
                <div className="text-[10px] text-slate-400 italic py-1">Belum ada kontak yang tersimpan.</div>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                  {contacts.map((c) => {
                    const isExcluded = excludedPins.includes(c.pin);
                    const name = c.customNickname || c.name;
                    return (
                      <div
                        key={c.pin}
                        onClick={() => handleToggleExclude(c.pin)}
                        className={`p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer transition border ${
                          isExcluded
                            ? 'bg-red-50 border-red-200 text-red-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate max-w-[170px]">{name}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isExcluded}
                          onChange={() => {}} // handled by parent div
                          className="accent-red-600 w-4 h-4 rounded cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            onClick={handlePublish}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition"
          >
            Bagikan Status
          </button>
        </div>
      </div>
    </div>
  );
};
