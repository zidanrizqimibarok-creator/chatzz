import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddContact: (pin: string) => void;
}

export const AddContactModal: React.FC<Props> = ({ isOpen, onClose, onAddContact }) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    setErrorMsg('');
    const trimmed = pin.trim().toUpperCase();
    if (!trimmed || trimmed.length !== 8) {
      setErrorMsg('PIN harus terdiri dari 8 digit huruf/angka!');
      return;
    }
    onAddContact(trimmed);
    setPin('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xs p-4 shadow-2xl border border-white">
        <h3 className="font-bold text-sm text-slate-800 mb-1">Tambah Kontak Baru</h3>
        <p className="text-xs text-slate-500 mb-2">Masukkan 8 digit PIN Chatzz temanmu.</p>
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] p-2 rounded-xl mb-2 font-medium">
            {errorMsg}
          </div>
        )}
        <input
          type="text"
          value={pin}
          onChange={(e) => setPin(e.target.value.toUpperCase())}
          placeholder="Contoh: ZZ8K9X2P"
          maxLength={8}
          className="w-full inset-panel px-3 py-2 text-xs uppercase font-mono font-bold tracking-wider mb-3 outline-none text-center"
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
