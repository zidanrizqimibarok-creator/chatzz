import React from 'react';
import { AppTheme } from '../../types';

interface Props {
  isOpen: boolean;
  currentTheme: AppTheme;
  hasPasscode: boolean;
  onClose: () => void;
  onSelectTheme: (theme: AppTheme) => void;
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
}

export const ToolsModal: React.FC<Props> = ({
  isOpen,
  currentTheme,
  hasPasscode,
  onClose,
  onSelectTheme,
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
}) => {
  if (!isOpen) return null;

  const themes: { id: AppTheme; label: string; color: string }[] = [
    { id: 'aero-blue', label: 'Aero Blue (Klasik)', color: 'bg-blue-500' },
    { id: 'blackberry-purple', label: 'Berry Purple', color: 'bg-purple-600' },
    { id: 'matrix-emerald', label: 'Matrix Emerald', color: 'bg-emerald-600' },
    { id: 'crimson-ruby', label: 'Crimson Ruby', color: 'bg-rose-600' },
    { id: 'obsidian-dark', label: 'Obsidian Dark', color: 'bg-slate-800' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl border border-white space-y-3 max-h-[88vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="font-bold text-xs text-slate-800 flex items-center">
            <i className="fa-solid fa-toolbox text-blue-600 mr-1.5"></i>
            Pusat Fitur & Pengaturan Chatzz
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            Tutup &times;
          </button>
        </div>

        {/* Feature Shortcuts Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenQr();
            }}
            className="p-2.5 bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-200 text-left transition flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
              <i className="fa-solid fa-qrcode"></i>
            </div>
            <div>
              <div className="text-[11px] font-bold text-blue-900 leading-tight">Pindai / QR PIN</div>
              <div className="text-[9px] text-blue-600">Scan & Barcode</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenBroadcast();
            }}
            className="p-2.5 bg-purple-50 hover:bg-purple-100 rounded-2xl border border-purple-200 text-left transition flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
              <i className="fa-solid fa-tower-broadcast"></i>
            </div>
            <div>
              <div className="text-[11px] font-bold text-purple-900 leading-tight">Pesan Siaran</div>
              <div className="text-[9px] text-purple-600">Broadcast BC</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenGroupChat();
            }}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-2xl border border-emerald-200 text-left transition flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-900 leading-tight">Grup Baru</div>
              <div className="text-[9px] text-emerald-600">Obrolan grup</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenSoundModal();
            }}
            className="p-2.5 bg-amber-50 hover:bg-amber-100 rounded-2xl border border-amber-200 text-left transition flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
              <i className="fa-solid fa-volume-high"></i>
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-900 leading-tight">Nada Dering</div>
              <div className="text-[9px] text-amber-600">Suara Ping & Alert</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenNowPlaying();
            }}
            className="p-2.5 bg-pink-50 hover:bg-pink-100 rounded-2xl border border-pink-200 text-left transition flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
              <i className="fa-solid fa-music"></i>
            </div>
            <div>
              <div className="text-[11px] font-bold text-pink-900 leading-tight">Status Musik</div>
              <div className="text-[9px] text-pink-600">Now Playing song</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenAvatarPicker();
            }}
            className="p-2.5 bg-indigo-50 hover:bg-indigo-100 rounded-2xl border border-indigo-200 text-left transition flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
              <i className="fa-solid fa-image-portrait"></i>
            </div>
            <div>
              <div className="text-[11px] font-bold text-indigo-900 leading-tight">Avatar Retro</div>
              <div className="text-[9px] text-indigo-600">Ganti foto profil</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenPasscodeSetup();
            }}
            className="p-2.5 bg-cyan-50 hover:bg-cyan-100 rounded-2xl border border-cyan-200 text-left transition flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
              <i className="fa-solid fa-lock"></i>
            </div>
            <div>
              <div className="text-[11px] font-bold text-cyan-900 leading-tight">Kunci Sandi</div>
              <div className="text-[9px] text-cyan-600">
                {hasPasscode ? 'Aktif (4-Digit)' : 'Belum aktif'}
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenStats();
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl border border-slate-300 text-left transition flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-800 leading-tight">Statistik</div>
              <div className="text-[9px] text-slate-500">Aktivitas Chatzz</div>
            </div>
          </button>
        </div>

        {/* Theme Color Switcher */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-1.5">
            PILIH TEMA JELLY (WARNA SKIN)
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTheme(t.id)}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs font-semibold transition ${
                  currentTheme === t.id
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-3.5 h-3.5 rounded-full ${t.color} shadow-sm`}></span>
                  <span>{t.label}</span>
                </div>
                {currentTheme === t.id && (
                  <i className="fa-solid fa-check text-blue-600 text-xs"></i>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cache & Backup */}
        <div className="pt-2 border-t flex space-x-2">
          <button
            onClick={onExportBackup}
            className="flex-1 btn-jelly py-2 rounded-xl text-xs font-bold"
          >
            Export Backup JSON
          </button>
          <button
            onClick={onClearCache}
            className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-bold"
          >
            Bersihkan Cache
          </button>
        </div>
      </div>
    </div>
  );
};
