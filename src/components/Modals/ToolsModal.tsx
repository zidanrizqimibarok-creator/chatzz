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

type TabType = 'theme' | 'privacy' | 'notif' | 'tools' | 'data';

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
  const [activeTab, setActiveTab] = useState<TabType>('theme');
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestNotif = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
    if (granted) {
      showWebNotification(
        'Notifikasi Chatzz Aktif',
        'Anda akan menerima pemberitahuan saat ada pesan obrolan baru masuk!'
      );
      playPingSound();
    }
  };

  const modernThemes: { id: AppTheme; label: string; desc: string; color: string }[] = [
    {
      id: 'telegram-blue',
      label: 'Telegram Day Blue',
      desc: 'Biru langit modern, bersih & minimalis',
      color: 'bg-sky-500',
    },
    {
      id: 'whatsapp-emerald',
      label: 'WhatsApp Emerald',
      desc: 'Hijau emerald lembut & profesional',
      color: 'bg-emerald-600',
    },
    {
      id: 'telegram-dark',
      label: 'Telegram Midnight',
      desc: 'Mode gelap elegan, nyaman untuk malam hari',
      color: 'bg-slate-900',
    },
    {
      id: 'ios-slate',
      label: 'Apple Messages Slate',
      desc: 'Abu-abu metalik modern khas iOS',
      color: 'bg-slate-700',
    },
    {
      id: 'sakura-blush',
      label: 'Lavender Rose',
      desc: 'Aksen lavender lembut dan estetis',
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <i className="fa-solid fa-sliders text-sm"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 leading-tight">Pengaturan Chatzz</h3>
              <p className="text-[10px] text-slate-500">Kelola tema, privasi, suara & alat aplikasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm transition"
          >
            &times;
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200/80 bg-slate-100/70 p-1 gap-1 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'theme' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-palette text-[11px]"></i>
            <span>Tema</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'privacy' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-shield text-[11px]"></i>
            <span>Privasi</span>
          </button>
          <button
            onClick={() => setActiveTab('notif')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'notif' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-bell text-[11px]"></i>
            <span>Notif</span>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'tools' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-screwdriver-wrench text-[11px]"></i>
            <span>Fitur</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'data' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-database text-[11px]"></i>
            <span>Data</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* TAB 1: THEME */}
          {activeTab === 'theme' && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                PILIH TEMA VISUAL APLIKASI
              </label>
              {modernThemes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTheme(t.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition text-left ${
                    currentTheme === t.id
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-4 h-4 rounded-full ${t.color} shadow-sm shrink-0`}></span>
                    <div>
                      <div className="text-xs font-bold leading-tight">{t.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{t.desc}</div>
                    </div>
                  </div>
                  {currentTheme === t.id && (
                    <i className="fa-solid fa-circle-check text-blue-600 text-sm"></i>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* TAB 2: PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-3">
              {/* Online Presence Privacy */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div className="pr-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Indikator Status Online Otomatis
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                    {shareOnlineStatus
                      ? 'Menampilkan status online saat membuka web dan offline saat menutup tab'
                      : 'Status online dan terakhir dilihat disembunyikan (Privasi)'}
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

              {/* Passcode Lock Card */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Kunci Sandi Aplikasi (PIN)</div>
                  <div className="text-[10px] text-slate-500">
                    {hasPasscode ? 'PIN 4-digit aktif' : 'Belum mengaktifkan PIN'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenPasscodeSetup}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                    hasPasscode
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {hasPasscode ? 'Ubah / Hapus' : 'Atur PIN'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS & SOUND */}
          {activeTab === 'notif' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Notifikasi Pesan Web</div>
                    <div className="text-[10px] text-slate-500">
                      {notifPermission === 'granted'
                        ? 'Aktif: Muncul saat browser diminimalkan atau tab ditutup'
                        : 'Belum diizinkan'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestNotif}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    {notifPermission === 'granted' ? 'Uji Suara' : 'Izinkan'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenSoundModal}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 text-xs font-semibold text-slate-800 transition text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <i className="fa-solid fa-volume-high text-blue-600"></i>
                  <span>Pilihan Nada Notifikasi Chatzz</span>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] text-slate-400"></i>
              </button>
            </div>
          )}

          {/* TAB 4: TOOLS & SHORTCUTS */}
          {activeTab === 'tools' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpenQr}
                className="flex flex-col items-center p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-base mb-1.5">
                  <i className="fa-solid fa-qrcode"></i>
                </div>
                <span className="text-xs font-bold text-slate-800">Kode QR Saya</span>
                <span className="text-[10px] text-slate-400">Tautan & PIN</span>
              </button>

              <button
                type="button"
                onClick={onOpenBroadcast}
                className="flex flex-col items-center p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-base mb-1.5">
                  <i className="fa-solid fa-tower-broadcast"></i>
                </div>
                <span className="text-xs font-bold text-slate-800">Kirim Siaran</span>
                <span className="text-[10px] text-slate-400">Ke semua kontak</span>
              </button>

              <button
                type="button"
                onClick={onOpenGroupChat}
                className="flex flex-col items-center p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-base mb-1.5">
                  <i className="fa-solid fa-users"></i>
                </div>
                <span className="text-xs font-bold text-slate-800">Buat Grup</span>
                <span className="text-[10px] text-slate-400">Ruang bersama</span>
              </button>

              <button
                type="button"
                onClick={onOpenAvatarPicker}
                className="flex flex-col items-center p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-base mb-1.5">
                  <i className="fa-solid fa-face-smile"></i>
                </div>
                <span className="text-xs font-bold text-slate-800">Ganti Avatar</span>
                <span className="text-[10px] text-slate-400">Ikon profil</span>
              </button>

              <button
                type="button"
                onClick={onOpenNowPlaying}
                className="flex flex-col items-center p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-base mb-1.5">
                  <i className="fa-solid fa-music"></i>
                </div>
                <span className="text-xs font-bold text-slate-800">Now Playing</span>
                <span className="text-[10px] text-slate-400">Status musik</span>
              </button>

              <button
                type="button"
                onClick={onOpenStats}
                className="flex flex-col items-center p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-base mb-1.5">
                  <i className="fa-solid fa-chart-pie"></i>
                </div>
                <span className="text-xs font-bold text-slate-800">Statistik Obrolan</span>
                <span className="text-[10px] text-slate-400">Aktivitas chat</span>
              </button>
            </div>
          )}

          {/* TAB 5: DATA & BACKUP */}
          {activeTab === 'data' && (
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Cadangkan & Pulihkan Obrolan</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Simpan seluruh riwayat chat, kontak, dan konfigurasi ke dalam berkas JSON yang dapat Anda simpan secara lokal.
                </p>
                <button
                  onClick={onExportBackup}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>Unduh Berkas Cadangan JSON</span>
                </button>
              </div>

              {onOpenDebug && (
                <button
                  onClick={onOpenDebug}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-slate-500"></i>
                    <span>Log Aktivitas Koneksi</span>
                  </div>
                  <i className="fa-solid fa-chevron-right text-[10px] text-slate-400"></i>
                </button>
              )}

              <div className="pt-2">
                <button
                  onClick={onClearCache}
                  className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition border border-red-200"
                >
                  Bersihkan Cache & Riwayat Lokal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
