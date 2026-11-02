import React from 'react';
import { ToastInfo } from '../types';

interface Props {
  toast: ToastInfo | null;
}

export const Toast: React.FC<Props> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 bg-slate-950/95 text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-blue-400 z-50 flex items-center space-x-2.5 transition-all duration-300 animate-slide-in">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          toast.isPing ? 'bg-red-500 animate-bounce' : 'bg-blue-500'
        }`}
      >
        <i
          className={`fa-solid ${
            toast.isPing ? 'fa-bell' : 'fa-comment'
          }`}
        ></i>
      </div>
      <div>
        <h4 className="font-bold text-xs text-blue-300">{toast.title}</h4>
        <p className="text-xs text-slate-200 truncate max-w-[180px]">
          {toast.body}
        </p>
      </div>
    </div>
  );
};
