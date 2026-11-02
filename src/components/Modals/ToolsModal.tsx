import React, { useState, useEffect } from 'react';
import { AppTheme } from '../../types';
import { requestNotificationPermission, showWebNotification } from '../../utils/webNotification';
import { playPingSound } from '../../utils/sound';

interface Props {
  isOpen: boolean;
  currentTheme: AppTheme;
  hasPasscode: boolean;
  shareOnlineStatus?: boolean;
  onClose: () => void;
  onSelectTheme: (theme: AppTheme) => void;
  onToggleShareOnlineStatus?: (val: boolean) => void;
  onOpenBroadcast: () => void;
  onOpenQr: () => void;
  onOpenGroupChat: () => void;
  onOpenPasscodeSetup: () => void;
  onOpenSoundModal: () => void;
  onOpenNowPlaying: () => void;
  onOpenAvatarPicker: () => void;
  onOpenStats: () => void;
  onExportBackup: () => void;
  onClearCache: () => void;
  onOpenDebug?: () => void;
}

export const ToolsModal: React.FC<Props> = ({
  isOpen,
  currentTheme,
  hasPasscode,
  shareOnlineStatus = true,
  onClose,
  onSelectTheme,
  onToggleShareOnlineStatus,
  onOpenBroadcast,
  onOpenQr,
  onOpenGroupChat,
  onOpenPasscodeSetup,
  onOpenSoundModal,
  onOpenNowPlaying,
  onOpenAvatarPicker,
  onOpenStats,
  onExportBackup,
  onClearCache,
  onOpenDebug,
}) => {
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestNotif = async () => {
    const granted = await requestNotificationPermission();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
    if (granted) {
      playPingSound();
      showWebNotification('Chatzz Messenger', 'Notifikasi berhasil diaktifkan! Anda akan menerima peringatan saat ada pesan baru.');
    }
  };

  const modernThemes: { id: AppTheme; label: string; desc: string; color: string }[] = [
    { id: 'telegram-blue', label: 'Telegram Day', desc: 'Biru langit modern & elegan', color: 'bg-sky-500' },
    { id: 'whatsapp-emerald', label: 'WhatsApp Emerald', desc: 'Hijau khas WhatsApp', color: 'bg-emerald-600' },
    { id: 'telegram-dark', label: 'Telegram Midnight', desc: 'Mode gelap premium', color: 'bg-slate-800' },
    { id: 'ios-slate', label: 'Apple Messages', desc: 'Abu-abu terang minimalis', color: 'bg-blue-600' },
    { id: 'sakura-blush', label: 'Lavender Rose', desc: 'Pastel lembut kontemporer', color: 'bg-rose-500' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 space-y-4 max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
              <i className="fa-solid fa-gear"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 leading-tight">Pengaturan & Fitur</h3>
              <p className="text-[11px] text-slate-500">Kustomisasi tema, privasi, dan obrolan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition"
          >
            &times;
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenQr();
            }}
            className="p-2.5 bg-blue-50/70 hover:bg-blue-100/70 rounded-2xl border border-blue-100 text-left transition flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
              <i className="fa-solid fa-qrcode"></i>
            </div>
            <div>
              <div className="text-[11px] font-bold text-blue-900 leading-tight">QR Kontak</div>
              <div className="text-[9px] text-blue-600">Undang teman instan</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenBroadcast();
            }}
            className="p-2.5 bg-purple-50/70 hover:bg-purple-100/70 rounded-2xl border border-purple-100 text-left transition flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
              <i className="fa-solid fa-tower-broadcast"></i>
            </div>
            <div>
              <div className="text-[11px] font-bold text-purple-900 leading-tight">Siaran (BC)</div>
              <div className="text-[9px] text-purple-600">Kirim ke semua teman</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenGroupChat();
            }}
            className="p-2.5 bg-emerald-50/70 hover:bg-emerald-100/70 rounded-2xl border border-emerald-100 text-left transition flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-900 leading-tight">Grup Baru</div>
              <div className="text-[9px] text-emerald-600">Buat ruang grup</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenSoundModal();
            }}
            className="p-2.5 bg-amber-50/70 hover:bg-amber-100/70 rounded-2xl border border-amber-100 text-left transition flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
              <i className="fa-solid fa-bell"></i>
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-900 leading-tight">Nada Dering</div>
              <div className="text-[9px] text-amber-600">Suara notifikasi</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenNowPlaying();
            }}
            className="p-2.5 bg-pink-50/70 hover:bg-pink-100/70 rounded-2xl border border-pink-100 text-left transition flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
              <i className="fa-solid fa-music"></i>
            </div>
            <div>
              <div className="text-[11px] font-bold text-pink-900 leading-tight">Status Lagu</div>
              <div className="text-[9px] text-pink-600">Now playing music</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenPasscodeSetup();
            }}
            className="p-2.5 bg-cyan-50/70 hover:bg-cyan-100/70 rounded-2xl border border-cyan-100 text-left transition flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
              <i className="fa-solid fa-lock"></i>
            </div>
            <div>
              <div className="text-[11px] font-bold text-cyan-900 leading-tight">Kunci PIN</div>
              <div className="text-[9px] text-cyan-600">
                {hasPasscode ? 'Aktif (4-Digit)' : 'Belum aktif'}
              </div>
            </div>
          </button>
        </div>

        {/* Automatic Online Status Toggle */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="pr-2">
              <span className="text-xs font-bold text-slate-800 block">
                Indikator Aktif Otomatis
              </span>
              <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                {shareOnlineStatus
                  ? 'Menampilkan status online saat Anda membuka web dan offline saat menutup tab'
                  : 'Status online dan terakhir dilihat dinonaktifkan (Privasi)'}
              </span>
            </div>
            {onToggleShareOnlineStatus && (
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={shareOnlineStatus}
                  onChange={(e) => onToggleShareOnlineStatus(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            )}
          </div>
        </div>

        {/* Web Notification Card */}
        <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">Notifikasi Pesan Web</div>
              <div className="text-[10px] text-slate-500">
                {notifPermission === 'granted'
                  ? 'Aktif: Muncul saat web ditutup'
                  : 'Belum diizinkan'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleRequestNotif}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              {notifPermission === 'granted' ? 'Uji Suara' : 'Izinkan'}
            </button>
          </div>
        </div>

        {/* Modern App Themes */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-2">
            PILIH TEMA APLIKASI
          </label>
          <div className="space-y-1.5">
            {modernThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTheme(t.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition text-left ${
                  currentTheme === t.id
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={`w-3.5 h-3.5 rounded-full ${t.color} shadow-sm shrink-0`}></span>
                  <div>
                    <div className="text-xs font-bold leading-tight">{t.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{t.desc}</div>
                  </div>
                </div>
                {currentTheme === t.id && (
                  <i className="fa-solid fa-check text-blue-600 text-xs"></i>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Backup & Clear Data */}
        <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
          <button
            onClick={onExportBackup}
            className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Cadangkan Data
          </button>
          {onOpenDebug && (
            <button
              onClick={onOpenDebug}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition flex items-center space-x-1"
              title="Log Aktivitas Jaringan"
            >
              <i className="fa-solid fa-list-check text-xs"></i>
              <span>Log</span>
            </button>
          )}
          <button
            onClick={onClearCache}
            className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition"
          >
            Hapus Cache
          </button>
        </div>
      </div>
    </div>
  );
};
