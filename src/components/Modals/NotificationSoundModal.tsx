import React from 'react';
import { NotificationSound } from '../../types';
import { playNotificationSound } from '../../utils/sound';

interface Props {
  isOpen: boolean;
  currentSound: NotificationSound;
  onClose: () => void;
  onSelect: (sound: NotificationSound) => void;
}

const SOUND_LIST: { id: NotificationSound; title: string; desc: string; icon: string }[] = [
  { id: 'bbm-ping', title: 'BBM Ping (Klasik)', desc: 'Suara triangle sharp khas BlackBerry', icon: 'fa-bell' },
  { id: 'msn-nudge', title: 'MSN Nudge (Buzzer)', desc: 'Getar dual-tone buzzer khas MSN Live', icon: 'fa-bullhorn' },
  { id: 'icq-uhoh', title: 'ICQ Uh-Oh!', desc: 'Suara ikonik "Uh-Oh" retro era 90-an', icon: 'fa-comment-dots' },
  { id: 'retro-chime', title: 'Crystal Chime', desc: 'Melodi kristal nada lembut', icon: 'fa-wand-magic-sparkles' },
  { id: 'water-drop', title: 'Water Bubble', desc: 'Tetesan air gelembung santai', icon: 'fa-droplet' },
];

export const NotificationSoundModal: React.FC<Props> = ({
  isOpen,
  currentSound,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xs p-4 shadow-2xl border border-white">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shadow">
              <i className="fa-solid fa-volume-high"></i>
            </div>
            <h3 className="font-bold text-xs text-slate-800">Nada Dering & Notifikasi</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            &times;
          </button>
        </div>

        <p className="text-[10px] text-slate-500 mb-2">
          Pilih suara pemberitahuan pesan masuk dan buzzer Chatzz.
        </p>

        <div className="space-y-1.5 mb-3">
          {SOUND_LIST.map((item) => {
            const isSelected = currentSound === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  playNotificationSound(item.id);
                  onSelect(item.id);
                }}
                className={`p-2 rounded-2xl border flex items-center justify-between cursor-pointer transition text-xs ${
                  isSelected
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <i className={`fa-solid ${item.icon} text-blue-500 text-xs`}></i>
                  <div className="truncate">
                    <div className="text-xs font-bold leading-tight">{item.title}</div>
                    <div className="text-[9px] text-slate-400 font-normal">{item.desc}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playNotificationSound(item.id);
                  }}
                  className="w-6 h-6 rounded-full bg-slate-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center text-[10px] shrink-0 ml-1"
                  title="Dengarkan Suara"
                >
                  <i className="fa-solid fa-play pl-0.5"></i>
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full btn-jelly py-2 rounded-xl text-xs font-bold"
        >
          Simpan Pilihan
        </button>
      </div>
    </div>
  );
};
