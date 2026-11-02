import React, { useState } from 'react';
import { Contact } from '../../types';

interface Props {
  isOpen: boolean;
  contacts: Contact[];
  onClose: () => void;
  onCreateGroup: (name: string, selectedPins: string[]) => void;
}

export const GroupChatModal: React.FC<Props> = ({
  isOpen,
  contacts,
  onClose,
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState('');
  const [selectedPins, setSelectedPins] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleSelect = (pin: string) => {
    if (selectedPins.includes(pin)) {
      setSelectedPins(selectedPins.filter((p) => p !== pin));
    } else {
      setSelectedPins([...selectedPins, pin]);
    }
  };

  const handleCreate = () => {
    setErrorMsg('');
    const trimmed = groupName.trim();
    if (!trimmed) {
      setErrorMsg('Masukkan nama grup!');
      return;
    }
    if (selectedPins.length === 0) {
      setErrorMsg('Pilih minimal 1 kontak untuk bergabung ke grup!');
      return;
    }
    onCreateGroup(trimmed, selectedPins);
    setGroupName('');
    setSelectedPins([]);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xs p-4 shadow-2xl border border-white flex flex-col max-h-[85vh]">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs shadow-md">
            <i className="fa-solid fa-users"></i>
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-800">Buat Grup Baru (BBM Groups)</h3>
            <p className="text-[9px] text-slate-400">Obrolan multi-kontak serentak</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] p-2 rounded-xl mb-2 font-medium">
            {errorMsg}
          </div>
        )}

        <div className="mb-2">
          <label className="text-[10px] font-bold text-slate-500 block mb-1">
            NAMA GRUP CHATZZ
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Contoh: Sahabat Nongkrong, Tim Kerja..."
            maxLength={30}
            className="w-full inset-panel px-3 py-1.5 text-xs outline-none rounded-xl font-sans"
          />
        </div>

        <div className="text-[10px] font-bold text-slate-500 mb-1 flex justify-between items-center">
          <span>PILIH ANGGOTA ({selectedPins.length})</span>
        </div>

        {/* Contact selection list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-48 my-1">
          {contacts.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-400">
              Belum ada kontak yang bisa ditambahkan.
            </div>
          ) : (
            contacts.map((c) => {
              const isSelected = selectedPins.includes(c.pin);
              const displayName = c.customNickname || c.name;
              return (
                <div
                  key={c.pin}
                  onClick={() => toggleSelect(c.pin)}
                  className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition text-xs ${
                    isSelected
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] shrink-0 font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{displayName}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'
                    }`}
                  >
                    {isSelected && <i className="fa-solid fa-check"></i>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex space-x-2 pt-2 border-t border-slate-200 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
          >
            Batal
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 btn-jelly py-2 rounded-xl text-xs font-bold shadow"
          >
            Buat Grup
          </button>
        </div>
      </div>
    </div>
  );
};
