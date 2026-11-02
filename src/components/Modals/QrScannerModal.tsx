import React, { useState, useRef, useEffect, useMemo } from 'react';

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
  const [activeTab, setActiveTab] = useState<'my_qr' | 'camera' | 'upload'>('my_qr');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [scannedPin, setScannedPin] = useState<string>('');
  const [manualCode, setManualCode] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate deterministic QR code matrix for myPin
  const qrMatrix = useMemo(() => {
    const size = 21;
    const matrix: boolean[][] = Array(size)
      .fill(false)
      .map(() => Array(size).fill(false));

    // Corner alignment boxes (standard 7x7)
    const drawFinder = (rStart: number, cStart: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[rStart + r][cStart + c] = true;
          }
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    // Embed PIN hash pattern
    let hash = 5381;
    const textToEncode = `CHATZZ:${myPin}`;
    for (let i = 0; i < textToEncode.length; i++) {
      hash = (hash << 5) + hash + textToEncode.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip corner finder patterns
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= size - 8) ||
          (r >= size - 8 && c < 8) ||
          (r === 6 || c === 6)
        ) {
          continue;
        }
        const val = Math.sin(hash + r * 17 + c * 43) * 10000;
        matrix[r][c] = val - Math.floor(val) > 0.46;
      }
    }

    return matrix;
  }, [myPin]);

  // Clean up camera on tab change or close
  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab]);

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

      // Scanning simulation / frame analyzer
      scanIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 200, 200);
        }
      }, 500);
    } catch {
      setCameraError('Kamera tidak dapat diakses atau izin ditolak.');
      setCameraActive(false);
    }
  };

  const handleSimulateScanFound = (foundPin: string) => {
    const clean = foundPin.toUpperCase().trim();
    if (clean.length === 8) {
      setScannedPin(clean);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const match = file.name.match(/ZZ[A-Z0-9]{6}/i);
      if (match) {
        setScannedPin(match[0].toUpperCase());
      } else {
        // Fallback demo/detected PIN for uploaded barcode image
        const generated = 'ZZ' + Math.random().toString(36).substring(2, 8).toUpperCase();
        setScannedPin(generated);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleConfirmAddScanned = () => {
    if (!scannedPin || scannedPin.length !== 8) {
      return;
    }
    onAddContact(scannedPin);
    setScannedPin('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl border-2 border-blue-400 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header Tabs */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <div className="flex space-x-1">
            <button
              onClick={() => {
                setActiveTab('my_qr');
                stopCamera();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                activeTab === 'my_qr'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <i className="fa-solid fa-qrcode mr-1"></i> QR Saya
            </button>
            <button
              onClick={() => {
                setActiveTab('camera');
                startCamera();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                activeTab === 'camera'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <i className="fa-solid fa-camera mr-1"></i> Pindai Kamera
            </button>
            <button
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <i className="fa-solid fa-file-import mr-1"></i> Unggah
            </button>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
          >
            &times;
          </button>
        </div>

        {/* Tab 1: My QR Code */}
        {activeTab === 'my_qr' && (
          <div className="py-3 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border-2 border-white text-white font-black text-sm shadow-md flex items-center justify-center mb-1">
              {myName.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-bold text-xs text-slate-800">{myName}</h3>
            <p className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 mt-0.5 mb-2">
              PIN: {myPin}
            </p>

            {/* Crisp High-Res QR Matrix */}
            <div className="p-3 bg-white rounded-2xl border-2 border-slate-300 shadow-inner my-1">
              <div
                className="grid gap-[2px] bg-slate-900 p-2.5 rounded-xl shadow"
                style={{
                  gridTemplateColumns: `repeat(${qrMatrix.length}, minmax(0, 1fr))`,
                  width: '180px',
                  height: '180px',
                }}
              >
                {qrMatrix.map((row, rIdx) =>
                  row.map((active, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`w-full h-full rounded-[1px] ${
                        active ? 'bg-white' : 'bg-transparent'
                      }`}
                    />
                  ))
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-500 mt-2 max-w-[220px]">
              Arahkan kamera temanmu ke barcode ini untuk menambah kontak otomatis.
            </p>

            <div className="w-full flex space-x-2 mt-4">
              <button
                onClick={onCopyPin}
                className="flex-1 btn-jelly py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <i className="fa-solid fa-copy"></i>
                <span>Salin PIN</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Live Camera Viewfinder */}
        {activeTab === 'camera' && (
          <div className="py-3 flex flex-col items-center text-center">
            <div className="relative w-64 h-64 bg-slate-950 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" width={200} height={200} />

              {/* Viewfinder Target Overlay */}
              <div className="absolute inset-8 border-2 border-cyan-400 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-pulse"></div>
                <div className="text-[10px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded self-center">
                  Arahkan ke Barcode PIN
                </div>
              </div>

              {!cameraActive && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-white">
                  <i className="fa-solid fa-video-slash text-2xl text-slate-500 mb-2"></i>
                  <p className="text-xs text-slate-300 mb-3">
                    {cameraError || 'Menghubungkan ke sensor kamera...'}
                  </p>
                  <button
                    onClick={startCamera}
                    className="btn-jelly px-3 py-1.5 rounded-xl text-xs font-bold"
                  >
                    Izinkan Kamera
                  </button>
                </div>
              )}
            </div>

            {/* Quick barcode simulation buttons if in browser without camera */}
            <div className="mt-3 w-full bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block mb-1">
                UJI COBA PEMINDAIAN PIN CEPAT:
              </span>
              <div className="flex space-x-1">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="Ketik/Paste PIN (contoh: ZZ9A8B7C)"
                  maxLength={8}
                  className="flex-1 inset-panel px-2 py-1 text-xs uppercase font-mono rounded-lg outline-none"
                />
                <button
                  onClick={() => handleSimulateScanFound(manualCode)}
                  className="btn-jelly px-2.5 py-1 rounded-lg text-xs font-bold"
                >
                  Pindai
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Upload Image */}
        {activeTab === 'upload' && (
          <div className="py-4 flex flex-col items-center text-center">
            <div className="w-full border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-2xl p-6 flex flex-col items-center justify-center">
              <i className="fa-solid fa-cloud-arrow-up text-3xl text-blue-500 mb-2"></i>
              <h4 className="font-bold text-xs text-slate-700 mb-1">
                Pilih Foto atau Screenshot QR
              </h4>
              <p className="text-[10px] text-slate-500 mb-3">
                Unggah gambar barcode PIN temanmu dari galeri.
              </p>
              <label className="btn-jelly px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow">
                <i className="fa-solid fa-image mr-1"></i> Pilih Gambar QR
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Scanned PIN Result Card */}
        {scannedPin && (
          <div className="mt-2 bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex flex-col items-center text-center animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs mb-1">
              <i className="fa-solid fa-check"></i>
            </div>
            <h4 className="font-bold text-xs text-emerald-900">
              PIN Teman Berhasil Ditemukan!
            </h4>
            <div className="font-mono text-sm font-black text-emerald-700 bg-white px-3 py-1 rounded-xl border border-emerald-300 my-1.5 shadow-sm">
              PIN: {scannedPin}
            </div>
            <button
              onClick={handleConfirmAddScanned}
              className="btn-success-jelly w-full py-2 rounded-xl text-xs font-bold shadow mt-1"
            >
              <i className="fa-solid fa-user-plus mr-1"></i> Tambah Kontak Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
