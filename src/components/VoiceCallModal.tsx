import React from 'react';

interface Props {
  isOpen: boolean;
  isIncoming: boolean;
  callerTitle: string;
  callerSubtitle: string;
  callSeconds: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
  remoteAudioRef: React.RefObject<HTMLAudioElement>;
  onAccept: () => void;
  onReject: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
}

export const VoiceCallModal: React.FC<Props> = ({
  isOpen,
  isIncoming,
  callerTitle,
  callerSubtitle,
  callSeconds,
  isMuted,
  isSpeakerOn,
  remoteAudioRef,
  onAccept,
  onReject,
  onEndCall,
  onToggleMute,
  onToggleSpeaker,
}) => {
  if (!isOpen) return null;

  const m = Math.floor(callSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (callSeconds % 60).toString().padStart(2, '0');
  const timerStr = `${m}:${s}`;

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xs p-6 shadow-2xl text-white text-center flex flex-col items-center justify-between h-[450px]">
        <div className="w-full flex justify-between items-center text-slate-400 text-xs px-2">
          <span>HD Voice P2P</span>
          <span className="font-mono text-cyan-300">{timerStr}</span>
        </div>

        <div className="flex flex-col items-center space-y-3 my-auto">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 border-4 border-white/20 flex items-center justify-center text-4xl font-black shadow-2xl animate-pulse">
            <i className="fa-solid fa-user text-white"></i>
          </div>
          <h3 className="font-bold text-lg text-white">{callerTitle}</h3>
          <p className="text-xs text-cyan-300 font-mono">{callerSubtitle}</p>
        </div>

        {/* Remote audio stream */}
        <audio ref={remoteAudioRef} autoPlay />

        <div className="w-full">
          {isIncoming ? (
            <div className="flex space-x-3 w-full mb-3">
              <button
                onClick={onReject}
                className="flex-1 btn-danger-jelly py-3 rounded-2xl text-xs font-bold shadow-lg"
              >
                Tolak
              </button>
              <button
                onClick={onAccept}
                className="flex-1 btn-success-jelly py-3 rounded-2xl text-xs font-bold shadow-lg"
              >
                Terima
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-around w-full px-4">
              <button
                onClick={onToggleMute}
                className={`w-11 h-11 rounded-full border flex items-center justify-center text-white text-sm shadow transition ${
                  isMuted
                    ? 'bg-red-600 border-red-400'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600'
                }`}
                title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                <i
                  className={`fa-solid ${
                    isMuted ? 'fa-microphone-slash' : 'fa-microphone'
                  }`}
                ></i>
              </button>
              <button
                onClick={onToggleSpeaker}
                className={`w-11 h-11 rounded-full border flex items-center justify-center text-white text-sm shadow transition ${
                  isSpeakerOn
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-600'
                    : 'bg-blue-600 border-blue-400'
                }`}
                title="Toggle Speaker"
              >
                <i className="fa-solid fa-volume-high"></i>
              </button>
              <button
                onClick={onEndCall}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 border-2 border-red-400 flex items-center justify-center text-white text-lg shadow-xl transition"
                title="Matikan Telepon"
              >
                <i className="fa-solid fa-phone-slash"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
