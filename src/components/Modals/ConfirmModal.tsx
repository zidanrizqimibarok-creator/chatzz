import React from 'react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<Props> = ({
  isOpen,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  isDanger = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-xs p-4 shadow-2xl border border-white">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs ${
              isDanger ? 'bg-red-500' : 'bg-blue-600'
            }`}
          >
            <i className={`fa-solid ${isDanger ? 'fa-triangle-exclamation' : 'fa-circle-question'}`}></i>
          </div>
          <h3 className="font-bold text-sm text-slate-800">{title}</h3>
        </div>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">{message}</p>
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold text-white shadow transition ${
              isDanger ? 'btn-danger-jelly' : 'btn-jelly'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
