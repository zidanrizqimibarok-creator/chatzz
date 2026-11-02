import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  myPin: string;
  contactCount: number;
  totalMessages: number;
  totalPings: number;
  totalVoiceNotes: number;
}

export const StatsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  myPin,
  contactCount,
  totalMessages,
  totalPings,
  totalVoiceNotes,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xs p-4 shadow-2xl border border-white">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shadow">
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <h3 className="font-bold text-xs text-slate-800">Statistik Chatzz Messenger</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-100 text-center">
            <div className="text-lg font-black text-blue-700">{totalMessages}</div>
            <div className="text-[9px] font-bold text-blue-500 uppercase">Pesan Obrolan</div>
          </div>
          <div className="bg-red-50 p-2.5 rounded-2xl border border-red-100 text-center">
            <div className="text-lg font-black text-red-600">{totalPings}</div>
            <div className="text-[9px] font-bold text-red-500 uppercase">Buzzer PING</div>
          </div>
          <div className="bg-purple-50 p-2.5 rounded-2xl border border-purple-100 text-center">
            <div className="text-lg font-black text-purple-700">{totalVoiceNotes}</div>
            <div className="text-[9px] font-bold text-purple-500 uppercase">Pesan Suara</div>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100 text-center">
            <div className="text-lg font-black text-emerald-700">{contactCount}</div>
            <div className="text-[9px] font-bold text-emerald-500 uppercase">Kontak Teman</div>
          </div>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-1 mb-3">
          <div className="flex justify-between">
            <span>PIN Pengguna:</span>
            <span className="font-mono font-bold text-blue-600">{myPin}</span>
          </div>
          <div className="flex justify-between">
            <span>Server MQTT:</span>
            <span className="font-mono text-emerald-600 font-bold">EMQX WSS 8084</span>
          </div>
          <div className="flex justify-between">
            <span>Status Enkripsi:</span>
            <span className="text-slate-700 font-bold">Local Device Storage</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full btn-jelly py-2 rounded-xl text-xs font-bold"
        >
          Tutup Statistik
        </button>
      </div>
    </div>
  );
};
