import React, { useState, useEffect, useRef } from 'react';
import { Contact, RandomChatMessage } from '../types';

interface Props {
  myPin: string;
  myName: string;
  onClose: () => void;
  onAddContactFromRandom: (contact: Contact) => void;
  onShowToast: (title: string, body: string) => void;
}

const BOT_PERSONAS = [
  { name: 'Salsa', city: 'Jakarta', alias: 'Anonim #5029', pin: 'CZ5029', greetings: ['Halo! Salam kenal yaa 👋', 'Lagi gabut nih, kamu lagi ngapain?', 'Chatzz keren juga ya fiturnya!'] },
  { name: 'Rian', city: 'Bandung', alias: 'Anonim #3182', pin: 'CZ3182', greetings: ['Hai hai! Dari kota mana nih?', 'Salam kenal ya, asik juga fitur random chat ini 🚀'] },
  { name: 'Dina', city: 'Surabaya', alias: 'Anonim #8841', pin: 'CZ8841', greetings: ['Halo kak! Lagi santai ya? Boleh add friend kalo asik ngobrolnya ✨'] },
  { name: 'Dimas', city: 'Jogja', alias: 'Anonim #4290', pin: 'CZ4290', greetings: ['Yo halo! Wah dapet teman random baru nih. Salam kenal! ☕'] },
];

export const RandomChatScreen: React.FC<Props> = ({
  myPin,
  myName,
  onClose,
  onAddContactFromRandom,
  onShowToast,
}) => {
  const [matchState, setMatchState] = useState<'searching' | 'connected'>('searching');
  const [currentPartner, setCurrentPartner] = useState<{
    alias: string;
    pin: string;
    realName: string;
    city: string;
    isBot?: boolean;
  } | null>(null);

  const [messages, setMessages] = useState<RandomChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Friend request states
  const [hasSentFriendRequest, setHasSentFriendRequest] = useState(false);
  const [hasReceivedFriendRequest, setHasReceivedFriendRequest] = useState(false);
  const [isFriendshipEstablished, setIsFriendshipEstablished] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start matchmaking on mount
  useEffect(() => {
    startSearch();
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const startSearch = () => {
    setMatchState('searching');
    setCurrentPartner(null);
    setMessages([]);
    setHasSentFriendRequest(false);
    setHasReceivedFriendRequest(false);
    setIsFriendshipEstablished(false);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    // Simulate matchmaking pairing within 2.5 - 3.5 seconds
    searchTimeoutRef.current = setTimeout(() => {
      const persona = BOT_PERSONAS[Math.floor(Math.random() * BOT_PERSONAS.length)];
      setCurrentPartner({
        alias: persona.alias,
        pin: persona.pin,
        realName: persona.name,
        city: persona.city,
        isBot: true,
      });
      setMatchState('connected');

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const initialMsgs: RandomChatMessage[] = [
        {
          id: `sys_${Date.now()}`,
          senderPin: 'SYSTEM',
          senderAlias: 'Sistem',
          text: `🎉 Anda terhubung dengan ${persona.alias}! Obrolan ini bersifat anonim sampai Anda berdua sepakat berteman.`,
          time: timeStr,
          timestamp: Date.now(),
          isSystem: true,
        },
      ];

      setMessages(initialMsgs);

      // Bot greets after 1.2s
      setTimeout(() => {
        const greet = persona.greetings[Math.floor(Math.random() * persona.greetings.length)];
        const botMsg: RandomChatMessage = {
          id: `bot_${Date.now()}`,
          senderPin: persona.pin,
          senderAlias: persona.alias,
          text: greet,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 1200);
    }, 2800);
  };

  const handleSkip = () => {
    if (confirm('Lewati dan cari teman random yang baru?')) {
      onShowToast('Mencari Baru', 'Menghubungkan ke teman anonim berikutnya...');
      startSearch();
    }
  };

  const handleSendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !currentPartner) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: RandomChatMessage = {
      id: `rc_${Date.now()}`,
      senderPin: myPin,
      senderAlias: 'Anda',
      text: trimmed,
      time: timeStr,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Bot automated conversational response if bot partner
    if (currentPartner.isBot && !isFriendshipEstablished) {
      setTimeout(() => {
        const replies = [
          'Wah seru juga yaa!',
          'Haha bener banget!',
          'Keren sih, kamu sering pake Chatzz?',
          'Btw asik juga ngobrol sama kamu, yuk add friend!',
          'Setuju banget sama kamu 👍',
        ];
        const replyText = replies[Math.floor(Math.random() * replies.length)];
        const partnerReply: RandomChatMessage = {
          id: `bot_reply_${Date.now()}`,
          senderPin: currentPartner.pin,
          senderAlias: currentPartner.alias,
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, partnerReply]);

        // Bot also sends friend request sometimes
        if (!hasSentFriendRequest && Math.random() > 0.4) {
          setTimeout(() => {
            setHasReceivedFriendRequest(true);
          }, 1500);
        }
      }, 1500);
    }
  };

  const handleSendFriendRequest = () => {
    if (!currentPartner || hasSentFriendRequest || isFriendshipEstablished) return;

    setHasSentFriendRequest(true);
    onShowToast('Permintaan Dikirim', `Permintaan pertemanan dikirim ke ${currentPartner.alias}.`);

    // In bot mode, the partner accepts after 1.5 seconds
    if (currentPartner.isBot) {
      setTimeout(() => {
        establishFriendship();
      }, 1800);
    }
  };

  const handleAcceptFriendRequest = () => {
    establishFriendship();
  };

  const establishFriendship = () => {
    if (!currentPartner) return;

    setIsFriendshipEstablished(true);
    setHasSentFriendRequest(true);
    setHasReceivedFriendRequest(false);

    // Save as contact
    const newContact: Contact = {
      pin: currentPartner.pin,
      name: currentPartner.realName,
      customNickname: `${currentPartner.realName} (Random Match)`,
      lastActivity: Date.now(),
      isOnline: true,
    };

    onAddContactFromRandom(newContact);
    onShowToast(
      'Kalian Berteman! 🎉',
      `${currentPartner.realName} (PIN: ${currentPartner.pin}) berhasil ditambahkan ke kontak Anda!`
    );

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const successMsg: RandomChatMessage = {
      id: `sys_friend_${Date.now()}`,
      senderPin: 'SYSTEM',
      senderAlias: 'Sistem',
      text: `🤝 Kalian berdua telah resmi berteman! PIN ${currentPartner.pin} (${currentPartner.realName}) telah disimpan ke kontak obrolan Anda.`,
      time: timeStr,
      timestamp: Date.now(),
      isSystem: true,
    };

    setMessages((prev) => [...prev, successMsg]);
  };

  return (
    <div className="absolute inset-0 bg-slate-900 z-30 flex flex-col select-none text-white animate-fade-in">
      {/* Top App Bar */}
      <div className="h-14 bg-slate-800/90 backdrop-blur-md border-b border-slate-700/80 px-3 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            title="Keluar dari Teman Random"
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
          </button>

          {matchState === 'connected' && currentPartner ? (
            <div className="flex items-center space-x-2 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-xs shadow-sm">
                  <i className="fa-solid fa-user-secret text-sm"></i>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs text-white truncate leading-tight flex items-center gap-1.5">
                  <span>{isFriendshipEstablished ? `${currentPartner.realName} (${currentPartner.pin})` : currentPartner.alias}</span>
                </h3>
                <p className="text-[10px] text-purple-300 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                  <span>{isFriendshipEstablished ? 'Kontak Disimpan' : 'Obrolan Anonim'}</span>
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-xs text-white">Temu Teman Random</h3>
              <p className="text-[10px] text-sky-400">Mencari obrolan anonim...</p>
            </div>
          )}
        </div>

        {/* Action Controls: Skip & Add Friend */}
        {matchState === 'connected' && (
          <div className="flex items-center space-x-2 shrink-0">
            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Lewati dan cari teman random lain"
            >
              <i className="fa-solid fa-forward-step text-amber-400 text-xs"></i>
              <span>Lewati (Skip)</span>
            </button>

            {/* Add Friend Button */}
            <button
              onClick={handleSendFriendRequest}
              disabled={hasSentFriendRequest || isFriendshipEstablished}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                isFriendshipEstablished
                  ? 'bg-emerald-600 text-white cursor-default'
                  : hasSentFriendRequest
                  ? 'bg-purple-800 text-purple-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer'
              }`}
              title="Kirim permintaan tukar PIN dan berteman"
            >
              <i
                className={`fa-solid ${
                  isFriendshipEstablished
                    ? 'fa-check'
                    : hasSentFriendRequest
                    ? 'fa-clock'
                    : 'fa-user-plus'
                } text-xs`}
              ></i>
              <span>
                {isFriendshipEstablished
                  ? 'Berteman ✓'
                  : hasSentFriendRequest
                  ? 'Menunggu...'
                  : 'Tambah Teman'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Main Body */}
      {matchState === 'searching' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-b from-slate-900 to-slate-950">
          {/* Radar Radar Pulsing Animation */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center animate-ping"></div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/20 absolute inset-2">
              <i className="fa-solid fa-shuffle text-2xl text-white animate-spin"></i>
            </div>
          </div>

          <h3 className="text-base font-bold text-white mb-1">Mencari Teman Random...</h3>
          <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
            Menghubungkan Anda dengan pengguna lain secara acak. Privasi PIN Anda aman dan terjaga.
          </p>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Batal & Kembali
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Incoming Friend Request Alert Banner */}
          {hasReceivedFriendRequest && !isFriendshipEstablished && (
            <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-blue-900/90 border-b border-purple-500/40 p-3 flex items-center justify-between shadow-lg animate-bounce-once">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                  <i className="fa-solid fa-handshake"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {currentPartner?.alias} mengajak berteman!
                  </div>
                  <div className="text-[10px] text-purple-200">
                    Buka PIN dan simpan kontak ke daftar obrolan Anda?
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAcceptFriendRequest}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  Terima
                </button>
                <button
                  onClick={() => setHasReceivedFriendRequest(false)}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-xs transition"
                >
                  Nanti
                </button>
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => {
              if (m.isSystem) {
                return (
                  <div key={m.id} className="flex justify-center my-2">
                    <div className="bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] px-3.5 py-1.5 rounded-full max-w-sm text-center leading-normal">
                      {m.text}
                    </div>
                  </div>
                );
              }

              const isMe = m.senderPin === myPin;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                    {isMe ? 'Anda' : m.senderAlias}
                  </span>
                  <div
                    className={`p-3 rounded-2xl text-xs max-w-[80%] shadow-xs break-words ${
                      isMe
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                        : 'bg-slate-800 text-slate-100 border border-slate-700/70 rounded-tl-xs'
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <div
                      className={`text-[9px] mt-1 text-right font-sans ${
                        isMe ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ketik pesan anonim Anda..."
              className="flex-1 bg-slate-800 text-white px-4 py-2.5 rounded-full text-xs outline-none border border-transparent focus:border-purple-500 font-sans transition placeholder:text-slate-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-sm ${
                inputText.trim()
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Kirim Pesan"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
