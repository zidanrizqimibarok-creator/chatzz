import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  isSettingUp?: boolean;
  savedPasscode: string;
  onClose: () => void;
  onSuccess: (code?: string) => void;
}

export const PasscodeModal: React.FC<Props> = ({
  isOpen,
  isSettingUp = false,
  savedPasscode,
  onClose,
  onSuccess,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (inputCode.length < 4) {
      const next = inputCode + digit;
      setInputCode(next);
      setErrorMsg('');

      if (next.length === 4) {
        if (isSettingUp) {
          onSuccess(next);
          setInputCode('');
        } else {
          if (next === savedPasscode) {
            onSuccess();
            setInputCode('');
          } else {
            setErrorMsg('PIN Kunci Salah! Coba lagi.');
            setTimeout(() => setInputCode(''), 500);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    setInputCode(inputCode.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-blue-500/40 rounded-3xl w-full max-w-xs p-6 shadow-2xl text-white text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400 flex items-center justify-center text-xl text-blue-300 mb-3 shadow">
          <i className="fa-solid fa-lock"></i>
        </div>

        <h3 className="font-bold text-sm text-white mb-1">
          {isSettingUp ? 'Atur 4-Digit Kunci Sandi' : 'Aplikasi Terkunci'}
        </h3>
        <p className="text-[10px] text-slate-400 mb-4">
          {isSettingUp
            ? 'Masukkan 4 angka untuk mengamankan Chatzz Messenger'
            : 'Masukkan 4-digit PIN keamanan Chatzz untuk membuka'}
        </p>

        {/* 4 Dots representation */}
        <div className="flex space-x-3 mb-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border border-blue-400 transition-all ${
                inputCode.length > idx ? 'bg-cyan-400 shadow-md shadow-cyan-400/50 scale-110' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="text-[10px] text-red-400 font-bold mb-2 animate-bounce">
            {errorMsg}
          </div>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[200px] mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="w-14 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 border border-slate-700 text-white font-mono font-bold text-base shadow transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => {
              if (isSettingUp) {
                onSuccess(''); // disable
                setInputCode('');
              } else {
                onClose();
              }
            }}
            className="w-14 h-12 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-bold"
          >
            {isSettingUp ? 'Hapus' : 'Batal'}
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="w-14 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 border border-slate-700 text-white font-mono font-bold text-base shadow transition"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-14 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-red-600 border border-slate-700 text-white text-xs flex items-center justify-center transition"
          >
            <i className="fa-solid fa-delete-left"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
