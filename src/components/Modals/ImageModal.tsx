import React from 'react';

interface Props {
  src: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<Props> = ({ src, onClose }) => {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full text-xs font-bold"
        >
          Tutup &times;
        </button>
        <img
          src={src}
          alt="Preview"
          className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl border border-white/20"
          onClick={(e) => e.stopPropagation()}
        />
        <a
          href={src}
          download={`chatzz_download_${Date.now()}.png`}
          onClick={(e) => e.stopPropagation()}
          className="mt-3 btn-jelly px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
        >
          <i className="fa-solid fa-download"></i> Unduh Gambar
        </a>
      </div>
    </div>
  );
};
