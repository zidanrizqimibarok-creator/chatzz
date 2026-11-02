import React, { useState, useEffect } from 'react';
import { Presence } from '../../types';
import { requestNotificationPermission, showWebNotification } from '../../utils/webNotification';

interface Props {
  isOpen: boolean;
  currentName: string;
  currentStatus: string;
  currentPresence: Presence;
  shareOnlineStatus?: boolean;
  onClose: () => void;
  onSave: (name: string, status: string, presence: Presence, shareOnlineStatus: boolean) => void;
}

export const ProfileModal: React.FC<Props> = ({
  isOpen,
  currentName,
  currentStatus,
  currentPresence,
  shareOnlineStatus = true,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(currentName);
  const [status, setStatus] = useState(currentStatus);
  const [presence, setPresence] = useState<Presence>(currentPresence);
  const [shareOnline, setShareOnline] = useState<boolean>(shareOnlineStatus);
  const [notifGranted, setNotifGranted] = useState(false);

  useEffect(() => {
    setName(currentName);
    setStatus(currentStatus);
    setPresence(currentPresence);
    setShareOnline(shareOnlineStatus);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifGranted(Notification.permission === 'granted');
    }
  }, [currentName, currentStatus, currentPresence, shareOnlineStatus, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(name.trim() || currentName, status.trim(), presence, shareOnline);
  };

  const handleToggleNotif = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    if (granted) {
      showWebNotification('Chatzz Messenger', 'Izin notifikasi chat aktif!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold">
              <i className="fa-solid fa-user-pen"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 leading-tight">Edit Profil & Privasi</h3>
              <p className="text-[11px] text-slate-500">Nama tampilan dan pengaturan privasi status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition"
          >
            &times;
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              NAMA TAMPILAN
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={25}
              placeholder="Masukkan nama Anda..."
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-sans"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              STATUS / BIO (ABOUT)
            </label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              maxLength={60}
              placeholder="Ada apa hari ini? (contoh: Sedang bekerja)"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-sans"
            />
          </div>

          {/* Privacy: Online Status Indicator Toggle */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Indikator Status Online Otomatis
                </span>
                <span className="text-[10px] text-slate-500">
                  {shareOnline
                    ? 'Aktif: Orang lain melihat tanda hijau saat Anda membuka web'
                    : 'Mati: Status online dan waktu terakhir dilihat disembunyikan'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                <input
                  type="checkbox"
                  checked={shareOnline}
                  onChange={(e) => setShareOnline(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* Web Notification */}
          <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Notifikasi Browser</span>
              <span className="text-[10px] text-slate-500">
                {notifGranted ? 'Peringatan aktif saat tab ditutup' : 'Izin browser belum aktif'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleNotif}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                notifGranted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
            >
              {notifGranted ? 'Aktif ✓' : 'Izinkan'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex space-x-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold shadow transition"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
