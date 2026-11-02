import React from 'react';

interface Props {
  onClose: () => void;
}

export const GlobalChatScreen: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-[#eef4fd] flex flex-col z-10">
      <div className="bg-gradient-to-r from-cyan-700 to-blue-800 text-white p-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white p-1"
            title="Kembali"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <div>
            <h3 className="font-bold text-xs leading-none">Chat Sosial Global Publik</h3>
            <p className="text-[9px] text-cyan-200 mt-0.5 font-bold">Status: Ditutup</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#e3eeff] to-[#d8e6fa]">
        <div className="w-14 h-14 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 text-2xl mb-3 shadow-inner">
          <i className="fa-solid fa-ban"></i>
        </div>
        <h3 className="font-bold text-sm text-slate-700 mb-1">
          FITUR GLOBAL SUDAH TIDAK DAPAT DI AKSES
        </h3>
        <p className="text-xs text-slate-500 max-w-xs">
          Layanan obrolan global publik telah dihentikan oleh pengembang.
        </p>
      </div>
    </div>
  );
};
