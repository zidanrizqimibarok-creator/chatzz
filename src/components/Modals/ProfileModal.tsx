import React, { useState, useEffect } from 'react';
import { Presence } from '../../types';

interface Props {
  isOpen: boolean;
  currentName: string;
  currentStatus: string;
  currentPresence: Presence;
  onClose: () => void;
  onSave: (name: string, status: string, presence: Presence) => void;
}

export const ProfileModal: React.FC<Props> = ({
  isOpen,
  currentName,
  currentStatus,
  currentPresence,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(currentName);
  const [status, setStatus] = useState(currentStatus);
  const [presence, setPresence] = useState<Presence>(currentPresence);

  useEffect(() => {
    setName(currentName);
    setStatus(currentStatus);
    setPresence(currentPresence);
  }, [currentName, currentStatus, currentPresence, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(name.trim() || currentName, status.trim(), presence);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xs p-4 shadow-2xl border border-white">
        <h3 className="font-bold text-sm text-slate-800 mb-3">Edit Profil & Status</h3>
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">
              NAMA TAMPILAN
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-full inset-panel px-3 py-2 text-xs outline-none rounded-xl"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">
              PERSONAL MESSAGE (PM)
            </label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              maxLength={40}
              className="w-full inset-panel px-3 py-2 text-xs outline-none rounded-xl"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">
              STATUS KEHADIRAN
            </label>
            <select
              value={presence}
              onChange={(e) => setPresence(e.target.value as Presence)}
              className="w-full bg-slate-100 border border-slate-300 rounded-xl px-2 py-1.5 text-xs outline-none"
            >
              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="busy">Busy</option>
            </select>
          </div>
        </div>
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
