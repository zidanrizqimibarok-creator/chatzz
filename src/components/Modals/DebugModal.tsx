import React, { useEffect, useRef } from 'react';

interface Props {
  isOpen: boolean;
  logs: string[];
  onClose: () => void;
}

export const DebugModal: React.FC<Props> = ({ isOpen, logs, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm p-4 shadow-2xl text-slate-300 font-mono text-[10px] flex flex-col h-80">
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
          <span className="font-bold text-white flex items-center gap-1.5">
            <i className="fa-solid fa-network-wired text-sky-400"></i> Log Aktivitas Jaringan Chatzz
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded-lg text-xs"
          >
            Tutup
          </button>
        </div>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800"
        >
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">Belum ada aktivitas.</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                {log
                  .replace(/MQTT/gi, 'Chatzz')
                  .replace(/EMQX/gi, 'Cloud')
                  .replace(/WSS 8084/gi, 'SSL')
                  .replace(/Firebase/gi, 'Backup')}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
