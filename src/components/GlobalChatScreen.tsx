import React, { useState, useEffect, useRef } from 'react';

export interface GlobalMessage {
  id: string;
  senderPin: string;
  senderName: string;
  text: string;
  time: string;
  timestamp: number;
}

interface Props {
  myPin: string;
  myName: string;
  onClose: () => void;
  onSelectDirectPin?: (pin: string) => void;
  onSendGlobalMessage?: (text: string) => void;
  externalMessages?: GlobalMessage[];
}

const DEFAULT_GLOBAL_MESSAGES: GlobalMessage[] = [
  {
    id: 'g_init_1',
    senderPin: 'CZ9988',
    senderName: 'Chatzz Bot',
    text: 'Selamat datang di Ruang Obrolan Publik Global Chatzz! 👋 Di sini Anda bisa menyapa pengguna lain secara bebas dan bertukar PIN.',
    time: '12:00',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'g_init_2',
    senderPin: 'ID4102',
    senderName: 'Rian_JKT',
    text: 'Halo semua! Ada yang mau ngobrol santai? Boleh add PIN saya yaa 👍',
    time: '12:05',
    timestamp: Date.now() - 1800000,
  },
];

export const GlobalChatScreen: React.FC<Props> = ({
  myPin,
  myName,
  onClose,
  onSelectDirectPin,
  onSendGlobalMessage,
  externalMessages = [],
}) => {
  const [messages, setMessages] = useState<GlobalMessage[]>(() => {
    try {
      const saved = localStorage.getItem('chatzz_global_messages');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_GLOBAL_MESSAGES;
  });

  const [inputText, setInputText] = useState('');
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync external messages if provided
  useEffect(() => {
    if (externalMessages.length > 0) {
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const newOnes = externalMessages.filter((m) => !ids.has(m.id));
        if (newOnes.length > 0) {
          const updated = [...prev, ...newOnes];
          localStorage.setItem('chatzz_global_messages', JSON.stringify(updated.slice(-100)));
          return updated;
        }
        return prev;
      });
    }
  }, [externalMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: GlobalMessage = {
      id: `gm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderPin: myPin,
      senderName: myName,
      text: trimmed,
      time: timeStr,
      timestamp: Date.now(),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem('chatzz_global_messages', JSON.stringify(updated.slice(-100)));
    setInputText('');

    if (onSendGlobalMessage) {
      onSendGlobalMessage(trimmed);
    }
  };

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin).then(() => {
      setCopiedPin(pin);
      setTimeout(() => setCopiedPin(null), 2000);
    });
  };

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col z-20 select-none animate-fade-in">
      {/* Header */}
      <div className="h-14 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition"
            title="Kembali"
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                <i className="fa-solid fa-earth-americas text-emerald-200"></i>
                <span>Ruang Obrolan Publik Global</span>
              </h3>
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                Terbuka
              </span>
            </div>
            <p className="text-[10px] text-emerald-100 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
              <span>Terhubung dengan semua pengguna Chatzz</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Bersihkan riwayat pesan obrolan global di perangkat ini?')) {
              setMessages(DEFAULT_GLOBAL_MESSAGES);
              localStorage.setItem('chatzz_global_messages', JSON.stringify(DEFAULT_GLOBAL_MESSAGES));
            }
          }}
          className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-emerald-100 hover:text-white transition"
          title="Bersihkan Tampilan"
        >
          <i className="fa-solid fa-broom text-xs"></i>
        </button>
      </div>

      {/* Notice Banner */}
      <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 text-[11px] text-emerald-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-circle-info text-emerald-600"></i>
          <span>Klik foto profil pengguna mana pun untuk menyalin PIN atau mengajak chat privat!</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const isMe = m.senderPin === myPin;
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar with click popup */}
              <div
                onClick={() => handleCopyPin(m.senderPin)}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm cursor-pointer hover:ring-2 hover:ring-emerald-400 transition shrink-0"
                title={`Klik untuk salin PIN: ${m.senderPin}`}
              >
                {m.senderName.charAt(0).toUpperCase()}
              </div>

              <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-xs font-bold text-slate-800">
                    {isMe ? 'Anda' : m.senderName}
                  </span>
                  <button
                    onClick={() => handleCopyPin(m.senderPin)}
                    className="text-[10px] font-mono text-slate-400 hover:text-blue-600 hover:underline flex items-center gap-0.5"
                    title="Salin PIN"
                  >
                    <span>({m.senderPin})</span>
                    {copiedPin === m.senderPin ? (
                      <span className="text-emerald-600 font-bold ml-1">Tersalin!</span>
                    ) : (
                      <i className="fa-regular fa-copy text-[9px]"></i>
                    )}
                  </button>
                  {!isMe && onSelectDirectPin && (
                    <button
                      onClick={() => onSelectDirectPin(m.senderPin)}
                      className="text-[10px] text-blue-600 font-semibold hover:underline ml-1"
                    >
                      Chat
                    </button>
                  )}
                </div>

                <div
                  className={`p-3 rounded-2xl text-xs shadow-xs break-words ${
                    isMe
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <div
                    className={`text-[9px] mt-1 text-right font-sans ${
                      isMe ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ketik pesan publik ke semua orang..."
          className="flex-1 bg-slate-100 px-4 py-2.5 rounded-full text-xs text-slate-800 outline-none border border-transparent focus:border-emerald-500 font-sans transition"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-sm ${
            inputText.trim()
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          title="Kirim Pesan Publik"
        >
          <i className="fa-solid fa-paper-plane text-xs"></i>
        </button>
      </div>
    </div>
  );
};
