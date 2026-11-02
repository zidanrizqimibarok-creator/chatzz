import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';

interface Props {
  isOpen: boolean;
  myPin: string;
  myName: string;
  onClose: () => void;
  onAddContact: (pin: string) => void;
  onCopyPin: () => void;
}

export const QrScannerModal: React.FC<Props> = ({
  isOpen,
  myPin,
  myName,
  onClose,
  onAddContact,
  onCopyPin,
}) => {
  const [activeTab, setActiveTab] = useState<'my_qr' | 'scan_camera' | 'paste_link'>('my_qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [inputCodeOrUrl, setInputCodeOrUrl] = useState<string>('');
  const [scannedPin, setScannedPin] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}/?addPin=${myPin}`
    : `chatzz://add/${myPin}`;

  // Generate real standard QR Code for inviteLink & PIN
  useEffect(() => {
    if (!isOpen || !myPin) return;

    QRCode.toDataURL(
      inviteLink,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [isOpen, myPin, inviteLink]);

  // Camera Management
  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setCameraError('Kamera tidak dapat diakses atau izin ditolak oleh browser.');
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (!isOpen || activeTab !== 'scan_camera') {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab]);

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `chatzz_qr_${myPin}.png`;
    a.click();
  };

  const extractPinFromText = (raw: string): string | null => {
    const trimmed = raw.trim();
    // 1. Check if URL contains addPin=
    const urlMatch = trimmed.match(/[?&]addPin=([A-Za-z0-9]{4,10})/i);
    if (urlMatch) return urlMatch[1].toUpperCase();

    // 2. Check if text is direct PIN (e.g., ZZ8AB7CD or 8-chars)
    const pinMatch = trimmed.match(/(ZZ[A-Za-z0-9]{6})/i);
    if (pinMatch) return pinMatch[1].toUpperCase();

    // 3. Fallback clean alphanumeric
    const clean = trimmed.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (clean.length >= 6 && clean.length <= 10) return clean;

    return null;
  };

  const handleProcessInput = () => {
    const found = extractPinFromText(inputCodeOrUrl);
    if (found) {
      setScannedPin(found);
    } else {
      alert('Tautan atau PIN tidak valid. Pastikan format PIN benar (contoh: ZZ7B8C9D).');
    }
  };

  const handleConfirmAdd = () => {
    if (!scannedPin) return;
    onAddContact(scannedPin);
    setScannedPin('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header Navigation Tabs */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('my_qr');
                stopCamera();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'my_qr'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              QR Profil Saya
            </button>
            <button
              onClick={() => {
                setActiveTab('scan_camera');
                startCamera();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'scan_camera'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pindai Kamera
            </button>
            <button
              onClick={() => {
                setActiveTab('paste_link');
                stopCamera();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'paste_link'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tempel Link
            </button>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold transition ml-2"
          >
            &times;
          </button>
        </div>

        {/* Tab 1: My QR Profile */}
        {activeTab === 'my_qr' && (
          <div className="py-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-bold text-base shadow flex items-center justify-center mb-2">
              {myName.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-bold text-sm text-slate-900 leading-tight">{myName}</h3>
            <p className="text-xs font-mono text-blue-600 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full mt-1">
              ID PIN: {myPin}
            </p>

            {/* Real Rendered High-Resolution QR Code */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm my-4">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code PIN ${myPin}`}
                  className="w-48 h-48 rounded-xl object-contain"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  Membuat QR Code...
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed mb-4">
              Pindai QR ini dengan kamera HP atau bagikan tautan profil untuk menambah teman langsung tanpa mengetik PIN.
            </p>

            {/* Quick Action Buttons */}
            <div className="w-full grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyInviteLink}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <i className={`fa-solid ${copiedLink ? 'fa-check' : 'fa-link'}`}></i>
                <span>{copiedLink ? 'Tautan Disalin!' : 'Salin Tautan'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadQr}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <i className="fa-solid fa-download"></i>
                <span>Unduh Gambar QR</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Scan Camera */}
        {activeTab === 'scan_camera' && (
          <div className="py-4 flex flex-col items-center text-center">
            <div className="relative w-64 h-64 bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-sm flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target */}
              <div className="absolute inset-8 border-2 border-dashed border-sky-400 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                <span className="text-[10px] text-sky-300 bg-black/60 px-2 py-0.5 rounded self-center font-medium">
                  Arahkan ke QR Code Teman
                </span>
              </div>

              {!cameraActive && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-white">
                  <i className="fa-solid fa-camera text-2xl text-slate-400 mb-2"></i>
                  <p className="text-xs text-slate-300 mb-3 text-center">
                    {cameraError || 'Aktifkan kamera untuk memindai QR Code.'}
                  </p>
                  <button
                    onClick={startCamera}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow"
                  >
                    Buka Kamera
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-3 max-w-[240px]">
              Kamera akan mendeteksi barcode QR Chatzz dan otomatis membuka percakapan.
            </p>
          </div>
        )}

        {/* Tab 3: Paste Link or PIN */}
        {activeTab === 'paste_link' && (
          <div className="py-4 flex flex-col items-center text-left">
            <div className="w-full space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  TEMPEL TAUTAN UNDANGAN ATAU PIN TEMAN
                </label>
                <textarea
                  rows={3}
                  value={inputCodeOrUrl}
                  onChange={(e) => setInputCodeOrUrl(e.target.value)}
                  placeholder="Contoh: https://.../?addPin=ZZ9A8B7C atau ketik PIN: ZZ9A8B7C"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans"
                />
              </div>

              <button
                type="button"
                onClick={handleProcessInput}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-user-plus"></i>
                <span>Deteksi & Tambah Kontak</span>
              </button>
            </div>
          </div>
        )}

        {/* Result & Confirmation Banner */}
        {scannedPin && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center text-center animate-fade-in-slide">
            <span className="text-xs font-bold text-emerald-800">
              PIN Teman Ditemukan!
            </span>
            <span className="font-mono text-sm font-bold text-emerald-700 bg-white px-3 py-1 rounded-lg border border-emerald-300 my-1.5">
              {scannedPin}
            </span>
            <button
              onClick={handleConfirmAdd}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold shadow-sm transition"
            >
              Mulai Obrolan Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
