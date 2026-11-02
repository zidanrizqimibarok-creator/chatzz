import React from 'react';

interface Props {
  status: 'connected' | 'connecting' | 'error';
  statusText: string;
  onOpenDebug: () => void;
}

export const FooterBar: React.FC<Props> = ({ status, statusText, onOpenDebug }) => {
  const dotColor =
    status === 'connected'
      ? 'bg-emerald-400'
      : status === 'connecting'
      ? 'bg-yellow-400 animate-pulse'
      : 'bg-red-500';

  return (
    <div className="p-1.5 bg-slate-900 text-slate-400 text-[10px] flex justify-between items-center px-3 border-t border-slate-800">
      <span className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
        <span>{statusText}</span>
      </span>
      <button
        type="button"
        className="cursor-pointer hover:text-white flex items-center gap-1 bg-transparent border-0 p-0 text-slate-400"
        onClick={onOpenDebug}
      >
        <span>Center Hook</span>
        <i className="fa-solid fa-terminal text-[9px]"></i>
      </button>
    </div>
  );
};
