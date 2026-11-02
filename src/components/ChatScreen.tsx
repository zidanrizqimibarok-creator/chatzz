import React, { useState, useRef, useEffect } from 'react';
import { Contact, Message, ChatFontSize } from '../types';
import { EmoticonPicker } from './EmoticonPicker';
import { ReactionPicker } from './ReactionPicker';
import { PhotoCaptionModal } from './Modals/PhotoCaptionModal';
import { WallpaperModal, WALLPAPER_PRESETS } from './Modals/WallpaperModal';
import { DeleteMessageModal } from './Modals/DeleteMessageModal';

interface Props {
  myPin: string;
  contact: Contact;
  messages: Message[];
  isPartnerTyping?: boolean;
  onBack: () => void;
  onToggleBlock: () => void;
  onStartVoiceCall: () => void;
  onSendPing: () => void;
  onSendMessage: (text: string, isBroadcast?: boolean, caption?: string) => void;
  onToggleStar: (timestamp: number) => void;
  onToggleReaction: (timestamp: number, emoji: string) => void;
  onDeleteMessageForEveryone: (timestamp: number) => void;
  onDeleteMessageForMe: (timestamp: number) => void;
  onClearChatHistory?: () => void;
  onSendTypingStatus: (isTyping: boolean) => void;
  onOpenSchedule: () => void;
  onOpenImage: (src: string) => void;
  onShowToast: (title: string, body: string) => void;
}

const QUICK_REPLIES = [
  'Lagi OTW 🛵',
  'Siap bro! 👍',
  'Ping me nanti ya 🔔',
  'Oke mantap! ✨',
  'Lagi sibuk meeting 🙏',
  'Sampai ketemu! 👋',
];

export const ChatScreen: React.FC<Props> = ({
  myPin,
  contact,
  messages,
  isPartnerTyping,
  onBack,
  onToggleBlock,
  onStartVoiceCall,
  onSendPing,
  onSendMessage,
  onToggleStar,
  onToggleReaction,
  onDeleteMessageForEveryone,
  onDeleteMessageForMe,
  onClearChatHistory,
  onSendTypingStatus,
  onOpenSchedule,
  onOpenImage,
  onShowToast,
}) => {
  const [inputText, setInputText] = useState('');
  const [isEmoticonOpen, setIsEmoticonOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [fontSize, setFontSize] = useState<ChatFontSize>('sm');
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  // Wallpaper State
  const [wallpaperId, setWallpaperId] = useState<string>(() => {
    return localStorage.getItem(`chatzz_wallpaper_${contact.pin}`) || localStorage.getItem('chatzz_wallpaper') || 'classic';
  });
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);

  // Delete Modal State
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

  // Photo Caption Modal State
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);

  // Active Reaction Picker
  const [activeReactionTimestamp, setActiveReactionTimestamp] = useState<number | null>(null);

  // Voice Note Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordStreamRef = useRef<MediaStream | null>(null);

  // Audio Playback Tracking
  const [playingAudioTimestamp, setPlayingAudioTimestamp] = useState<number | null>(null);
  const activeAudioInstanceRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active Wallpaper preset style
  const activeWallpaper =
    WALLPAPER_PRESETS.find((wp) => wp.id === wallpaperId) || WALLPAPER_PRESETS[0];

  const handleSelectWallpaper = (newWpId: string) => {
    setWallpaperId(newWpId);
    localStorage.setItem(`chatzz_wallpaper_${contact.pin}`, newWpId);
    localStorage.setItem('chatzz_wallpaper', newWpId);
    onShowToast('Wallpaper Diperbarui', 'Latar belakang obrolan berhasil diubah.');
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  // Clean up
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (recordStreamRef.current) {
        recordStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (activeAudioInstanceRef.current) {
        activeAudioInstanceRef.current.pause();
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    onSendTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onSendTypingStatus(false);
    }, 1500);
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputText('');
    setIsEmoticonOpen(false);
    onSendTypingStatus(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Img = uploadEvent.target?.result as string;
      if (base64Img) {
        setPendingImageSrc(base64Img);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendImageWithCaption = (imgSrc: string, caption: string) => {
    onSendMessage(`[IMAGE]:${imgSrc}`, false, caption);
    setPendingImageSrc(null);
  };

  // Robust Voice Note Recording (Fixed for all browsers)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordStreamRef.current = stream;
      audioChunksRef.current = [];

      // Determine supported mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/ogg',
      ];
      let selectedMime = '';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const options = selectedMime ? { mimeType: selectedMime } : undefined;
      const mediaRecorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mime = selectedMime || mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        const reader = new FileReader();
        reader.onload = () => {
          const base64Audio = reader.result as string;
          if (base64Audio) {
            onSendMessage(`[AUDIO]:${base64Audio}`);
          }
        };
        reader.readAsDataURL(audioBlob);

        // Stop stream tracks
        if (recordStreamRef.current) {
          recordStreamRef.current.getTracks().forEach((t) => t.stop());
          recordStreamRef.current = null;
        }
        mediaRecorderRef.current = null;
      };

      // Request data in 250ms chunks continuously
      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      onShowToast('Mikrofon Ditolak', 'Izin mikrofon tidak diberikan atau perangkat audio tidak ditemukan.');
      setIsRecording(false);
    }
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current) return;

    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    if (mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.requestData();
      } catch {}
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (recordStreamRef.current) {
      recordStreamRef.current.getTracks().forEach((t) => t.stop());
      recordStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordSeconds(0);
  };

  const togglePlayAudio = (timestamp: number, audioSrc: string) => {
    if (playingAudioTimestamp === timestamp) {
      activeAudioInstanceRef.current?.pause();
      setPlayingAudioTimestamp(null);
      return;
    }

    if (activeAudioInstanceRef.current) {
      activeAudioInstanceRef.current.pause();
    }

    const audio = new Audio(audioSrc);
    activeAudioInstanceRef.current = audio;
    audio.onended = () => setPlayingAudioTimestamp(null);
    audio.onerror = () => setPlayingAudioTimestamp(null);

    audio.play().catch(() => setPlayingAudioTimestamp(null));
    setPlayingAudioTimestamp(timestamp);
  };

  const handleCopyMessage = (text: string) => {
    const cleanText = text.startsWith('[IMAGE]:')
      ? 'Foto Chatzz'
      : text.startsWith('[AUDIO]:')
      ? 'Pesan Suara Chatzz'
      : text;
    navigator.clipboard.writeText(cleanText).then(() => {
      onShowToast('Pesan Disalin', 'Teks berhasil disalin ke clipboard.');
    });
  };

  const handleExportTranscript = () => {
    const lines = messages.map(
      (m) =>
        `[${m.time}] ${m.sender === myPin ? 'Saya' : contact.name}: ${
          m.text.startsWith('[AUDIO]:')
            ? '[Pesan Suara]'
            : m.text.startsWith('[IMAGE]:')
            ? `[Foto: ${m.caption || ''}]`
            : m.text
        }`
    );
    const content = `CHATZZ MESSENGER TRANSCRIPT\nKontak: ${contact.name} (PIN: ${contact.pin})\nTanggal: ${new Date().toLocaleDateString()}\n---------------------------------------\n\n${lines.join(
      '\n'
    )}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatzz_transcript_${contact.pin}.txt`;
    a.click();
    onShowToast('Transkrip Diunduh', 'Riwayat obrolan diunduh ke file .txt.');
  };

  const filteredMessages = messages.filter((m) => {
    if (showStarredOnly && !m.isStarred) return false;
    if (searchQuery.trim()) {
      return (
        m.text.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (m.caption && m.caption.toLowerCase().includes(searchQuery.toLowerCase().trim()))
      );
    }
    return true;
  });

  const displayName = contact.customNickname || contact.name;

  return (
    <div className="absolute inset-0 bg-[#eef4fd] flex flex-col z-10 select-text">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-2 flex items-center justify-between shadow-sm select-none">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="text-white/90 hover:text-white p-1"
            title="Kembali"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <div>
            <h3 className="font-bold text-xs leading-none flex items-center gap-1">
              <span>{displayName}</span>
              {contact.nowPlaying && (
                <span className="text-[9px] text-pink-300 font-normal">
                  🎵 {contact.nowPlaying}
                </span>
              )}
            </h3>
            <p className="text-[9px] text-yellow-300 font-mono mt-0.5 font-bold">
              PIN: {contact.pin}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Chat Wallpaper Button */}
          <button
            onClick={() => setIsWallpaperModalOpen(true)}
            className="p-1.5 rounded-lg text-[10px] text-white/80 hover:text-white hover:bg-white/20 transition"
            title="Ganti Wallpaper Obrolan"
          >
            <i className="fa-solid fa-paintbrush"></i>
          </button>

          {/* Font Scaler */}
          <button
            onClick={() =>
              setFontSize((prev) => (prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'sm'))
            }
            className="p-1.5 rounded-lg text-[10px] text-white/80 hover:text-white font-mono font-bold hover:bg-white/20 transition"
            title={`Ukuran Font: ${fontSize.toUpperCase()}`}
          >
            A{fontSize === 'sm' ? '-' : fontSize === 'base' ? ' ' : '+'}
          </button>

          {/* Export Transcript to TXT */}
          <button
            onClick={handleExportTranscript}
            className="p-1.5 rounded-lg text-[10px] text-white/80 hover:text-white hover:bg-white/20 transition"
            title="Ekspor Chat ke File TXT"
          >
            <i className="fa-solid fa-file-arrow-down"></i>
          </button>

          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-lg text-[10px] transition ${
              showSearch ? 'bg-white/30 text-white' : 'text-white/80 hover:text-white hover:bg-white/20'
            }`}
            title="Cari Pesan"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>

          {/* Starred Filter */}
          <button
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            className={`p-1.5 rounded-lg text-[10px] transition ${
              showStarredOnly ? 'bg-amber-400 text-slate-900 font-bold' : 'text-white/80 hover:text-white hover:bg-white/20'
            }`}
            title={showStarredOnly ? 'Tampilkan Semua' : 'Lihat Pesan Berbintang'}
          >
            <i className="fa-solid fa-star"></i>
          </button>

          {/* Block Toggle */}
          <button
            onClick={onToggleBlock}
            className={`${
              contact.isBlocked
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-slate-800 text-yellow-300 border-slate-600'
            } px-2 py-1 rounded-lg text-[10px] font-bold shadow border`}
          >
            {contact.isBlocked ? 'Buka Blokir' : 'Blokir'}
          </button>

          {/* Voice Call */}
          <button
            onClick={onStartVoiceCall}
            className="btn-success-jelly px-2 py-1 rounded-lg text-[10px] font-bold shadow flex items-center gap-1"
            title="Telepon Suara"
          >
            <i className="fa-solid fa-phone text-[9px]"></i>
            <span>Telpon</span>
          </button>

          {/* PING Buzzer */}
          <button
            onClick={onSendPing}
            className="btn-danger-jelly px-2 py-1 rounded-lg text-[10px] font-black shadow flex items-center gap-1 active:scale-95 transition-transform"
            title="Kirim PING buzzer"
          >
            <i className="fa-solid fa-bell animate-bounce text-[9px]"></i>
            <span>PING</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-1.5 bg-blue-100 border-b border-blue-200 flex items-center space-x-2 select-none">
          <i className="fa-solid fa-magnifying-glass text-xs text-blue-600 ml-1"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata kunci dalam obrolan..."
            className="flex-1 bg-white border border-blue-300 rounded-lg px-2 py-1 text-xs outline-none"
            autoFocus
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-500 text-xs px-1">
              &times;
            </button>
          )}
        </div>
      )}

      {/* Messages Scroll Area with CHAT WALLPAPER */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2.5 transition-all duration-300"
        style={activeWallpaper.style}
      >
        {filteredMessages.length === 0 && (showStarredOnly || searchQuery) && (
          <div className="text-center py-8 text-slate-400 text-xs italic select-none">
            {showStarredOnly
              ? 'Belum ada pesan yang diberi bintang.'
              : 'Tidak ada pesan yang cocok dengan pencarian.'}
          </div>
        )}

        {filteredMessages.map((m, index) => {
          const isMe = m.sender === myPin;

          if (m.isPing) {
            return (
              <div
                key={`${m.timestamp}_${index}`}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} select-none`}
              >
                <div className="bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded-xl animate-bounce shadow-md flex items-center gap-1.5">
                  <i className="fa-solid fa-bell"></i>
                  <span>PING!!!</span>
                </div>
                <span className="text-[8px] text-slate-400 mt-0.5">{m.time}</span>
              </div>
            );
          }

          // Deleted message state
          if (m.deletedForEveryone) {
            return (
              <div
                key={`${m.timestamp}_${index}`}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="bg-slate-200/90 backdrop-blur text-slate-500 italic text-[11px] px-3 py-1.5 rounded-2xl border border-slate-300 flex items-center gap-1.5 shadow-sm">
                  <i className="fa-solid fa-ban text-[10px]"></i>
                  <span>Pesan ini telah ditarik oleh pengirim.</span>
                </div>
                <span className="text-[8px] text-slate-400 mt-0.5">{m.time}</span>
              </div>
            );
          }

          const isAudioMsg = m.text.startsWith('[AUDIO]:');
          const audioSrc = isAudioMsg ? m.text.replace('[AUDIO]:', '') : '';

          const isImageMsg = m.text.startsWith('[IMAGE]:') || m.text.includes('<img src=');
          let imageSrc = '';
          if (m.text.startsWith('[IMAGE]:')) {
            imageSrc = m.text.replace('[IMAGE]:', '');
          } else if (m.text.includes('<img src="')) {
            const match = m.text.match(/src="([^"]+)"/);
            if (match) imageSrc = match[1];
          }

          const statusBadge = isMe ? (
            m.status === 'NS' ? (
              <span className="bg-red-600 text-white font-bold text-[9px] px-1 rounded ml-1">
                NS
              </span>
            ) : m.status === 'R' ? (
              <span className="bg-emerald-500 text-white font-bold text-[9px] px-1 rounded ml-1">
                R
              </span>
            ) : (
              <span className="bg-slate-400 text-white font-bold text-[9px] px-1 rounded ml-1">
                S
              </span>
            )
          ) : null;

          const reactionEntries = m.reactions
            ? Object.entries(m.reactions).filter(([, users]) => users.length > 0)
            : [];

          const fontSizeClass =
            fontSize === 'lg' ? 'text-sm' : fontSize === 'base' ? 'text-xs' : 'text-[11px]';

          return (
            <div
              key={`${m.timestamp}_${index}`}
              className={`flex flex-col group relative ${isMe ? 'items-end' : 'items-start'}`}
            >
              {/* Floating Reaction Bar */}
              <ReactionPicker
                isOpen={activeReactionTimestamp === m.timestamp}
                isMe={isMe}
                onClose={() => setActiveReactionTimestamp(null)}
                onSelect={(emoji) => onToggleReaction(m.timestamp, emoji)}
              />

              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl shadow-sm relative transition-all ${fontSizeClass} ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 rounded-bl-none border border-blue-100'
                }`}
              >
                {/* Broadcast Badge */}
                {m.isBroadcast && (
                  <div className="inline-block bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-md mb-1 uppercase tracking-wider select-none">
                    <i className="fa-solid fa-tower-broadcast mr-0.5"></i> Siaran BC
                  </div>
                )}

                {/* Voice Note Audio Player */}
                {isAudioMsg && audioSrc ? (
                  <div className="space-y-1 py-0.5 select-none">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => togglePlayAudio(m.timestamp, audioSrc)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow cursor-pointer ${
                          isMe ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'
                        }`}
                        title="Putar Pesan Suara"
                      >
                        <i
                          className={`fa-solid ${
                            playingAudioTimestamp === m.timestamp ? 'fa-pause' : 'fa-play pl-0.5'
                          }`}
                        ></i>
                      </button>

                      <div className="flex items-center space-x-0.5 h-4">
                        {[4, 12, 8, 16, 10, 14, 6, 10, 15, 8, 12, 5].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full ${
                              isMe ? 'bg-blue-200' : 'bg-blue-400'
                            } ${playingAudioTimestamp === m.timestamp ? 'animate-pulse' : ''}`}
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>

                      <span className="text-[10px] font-mono opacity-80 flex items-center gap-1">
                        <i className="fa-solid fa-microphone text-[8px]"></i>
                        <span>VN</span>
                      </span>
                    </div>
                  </div>
                ) : isImageMsg && imageSrc ? (
                  <div className="space-y-1.5">
                    <img
                      src={imageSrc}
                      alt="Uploaded"
                      className="max-w-[200px] max-h-[200px] object-cover rounded-xl shadow-md border border-white/40 cursor-pointer"
                      onClick={() => onOpenImage(imageSrc)}
                      title="Klik untuk Perbesar"
                    />
                    {m.caption && (
                      <div className="text-xs font-sans font-medium pt-0.5">{m.caption}</div>
                    )}
                    <a
                      href={imageSrc}
                      download={`chatzz_image_${m.timestamp}.png`}
                      className="inline-flex items-center gap-1 bg-black/40 hover:bg-black/60 text-white text-[9px] font-bold px-2 py-1 rounded-lg transition"
                    >
                      <i className="fa-solid fa-download"></i> Unduh Foto
                    </a>
                  </div>
                ) : (
                  <div className="break-words font-sans whitespace-pre-wrap">{m.text}</div>
                )}

                {/* Bubble Footer & Actions */}
                <div
                  className={`flex items-center justify-between gap-2 mt-1 text-[8px] select-none ${
                    isMe ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    {/* Reaction trigger */}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveReactionTimestamp(
                          activeReactionTimestamp === m.timestamp ? null : m.timestamp
                        )
                      }
                      className="hover:scale-125 transition-transform opacity-70 hover:opacity-100"
                      title="Beri Reaksi Emoji"
                    >
                      <i className="fa-regular fa-face-smile text-[9px]"></i>
                    </button>

                    {/* Star trigger */}
                    <button
                      type="button"
                      onClick={() => onToggleStar(m.timestamp)}
                      className="hover:scale-125 transition-transform"
                      title={m.isStarred ? 'Hapus Bintang' : 'Beri Bintang'}
                    >
                      <i
                        className={`fa-solid fa-star ${
                          m.isStarred ? 'text-amber-400' : 'opacity-40 hover:opacity-100'
                        }`}
                      ></i>
                    </button>

                    {/* Copy message button */}
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(m.text)}
                      className="hover:scale-125 transition-transform opacity-70 hover:opacity-100"
                      title="Salin Pesan"
                    >
                      <i className="fa-solid fa-copy text-[9px]"></i>
                    </button>

                    {/* Delete Message trigger (Opens DeleteMessageModal - NO PROMPT BUG) */}
                    <button
                      type="button"
                      onClick={() => setMessageToDelete(m)}
                      className="hover:scale-125 transition-transform opacity-70 hover:text-red-400"
                      title="Hapus / Tarik Pesan"
                    >
                      <i className="fa-solid fa-trash-can text-[9px]"></i>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <span>{m.time}</span>
                    {statusBadge}
                  </div>
                </div>
              </div>

              {/* Reaction Badges Container */}
              {reactionEntries.length > 0 && (
                <div
                  className={`flex flex-wrap items-center gap-1 mt-1 ${
                    isMe ? 'justify-end mr-1' : 'justify-start ml-1'
                  }`}
                >
                  {reactionEntries.map(([emoji, users]) => {
                    const hasMyReaction = users.includes(myPin);
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => onToggleReaction(m.timestamp, emoji)}
                        className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[10px] shadow-sm transition border ${
                          hasMyReaction
                            ? 'bg-blue-100 border-blue-400 text-blue-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                        title={`${users.length} reaksi (${users.join(', ')})`}
                      >
                        <span>{emoji}</span>
                        <span className="font-mono text-[9px]">{users.length}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Partner Typing Indicator Bubble */}
        {isPartnerTyping && (
          <div className="flex items-center space-x-2 text-slate-500 bg-white/80 backdrop-blur rounded-2xl px-3 py-1.5 w-fit border border-blue-200 shadow-sm animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-200"></span>
            <span className="text-[10px] font-sans font-bold text-blue-600">
              {displayName} sedang mengetik...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Canned Replies Bar */}
      {showQuickReplies && (
        <div className="p-2 bg-white/95 border-t border-slate-200 flex items-center space-x-1 overflow-x-auto select-none">
          <span className="text-[9px] font-bold text-slate-400 shrink-0">Balas Kilat:</span>
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => {
                onSendMessage(reply);
                setShowQuickReplies(false);
              }}
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-bold px-2 py-1 rounded-xl shrink-0 transition"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Emoticon Picker Drawer */}
      <EmoticonPicker
        isOpen={isEmoticonOpen}
        onClose={() => setIsEmoticonOpen(false)}
        onSelect={(emoticon) => {
          setInputText((prev) => prev + emoticon);
        }}
      />

      {/* Input Action Bar */}
      <div className="p-2 bg-white/90 border-t border-slate-300 flex items-center space-x-1.5 relative select-none">
        {isRecording ? (
          <div className="flex-1 bg-red-50 border border-red-300 rounded-xl px-3 py-1.5 flex items-center justify-between text-red-600">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-record"></span>
              <span className="font-bold text-xs">Merekam VN...</span>
              <span className="font-mono text-xs font-bold">
                00:{recordSeconds.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="text-slate-500 hover:text-red-700 text-xs px-2 py-0.5 rounded font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={stopAndSendRecording}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg font-bold shadow"
              >
                Kirim VN
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Replies Toggle */}
            <button
              type="button"
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className={`p-1.5 text-xs rounded-lg transition ${
                showQuickReplies ? 'bg-purple-100 text-purple-700' : 'text-purple-600 hover:text-purple-800'
              }`}
              title="Balasan Kilat (Quick Replies)"
            >
              <i className="fa-solid fa-bolt"></i>
            </button>

            {/* Emoticon */}
            <button
              type="button"
              onClick={() => setIsEmoticonOpen(!isEmoticonOpen)}
              className="text-amber-500 hover:text-amber-600 p-1.5 text-sm"
              title="Emoticon & Emoji"
            >
              <i className="fa-solid fa-face-smile"></i>
            </button>

            {/* Scheduled */}
            <button
              type="button"
              onClick={onOpenSchedule}
              className="text-blue-600 hover:text-blue-800 p-1.5 text-xs"
              title="Jadwalkan Pesan"
            >
              <i className="fa-solid fa-clock"></i>
            </button>

            {/* Photo Attachment with Caption */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-emerald-600 hover:text-emerald-800 p-1.5 text-xs"
              title="Kirim Foto"
            >
              <i className="fa-solid fa-image"></i>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              className="flex-1 inset-panel px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans"
            />

            {/* Voice Note Record */}
            <button
              type="button"
              onClick={startRecording}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-600 border border-slate-300 flex items-center justify-center text-xs shadow-sm"
              title="Rekam Pesan Suara (Voice Note)"
            >
              <i className="fa-solid fa-microphone"></i>
            </button>

            {/* Send button */}
            <button
              type="button"
              onClick={handleSend}
              className="btn-jelly px-3.5 py-2 rounded-xl text-xs flex items-center justify-center shadow"
              title="Kirim"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </>
        )}
      </div>

      {/* Wallpaper Picker Modal */}
      <WallpaperModal
        isOpen={isWallpaperModalOpen}
        activeWallpaperId={wallpaperId}
        onClose={() => setIsWallpaperModalOpen(false)}
        onSelectWallpaper={handleSelectWallpaper}
      />

      {/* Delete Message Modal */}
      <DeleteMessageModal
        isOpen={!!messageToDelete}
        isMyMessage={messageToDelete?.sender === myPin}
        messageText={messageToDelete?.text || ''}
        onClose={() => setMessageToDelete(null)}
        onDeleteForEveryone={() => {
          if (messageToDelete) onDeleteMessageForEveryone(messageToDelete.timestamp);
          setMessageToDelete(null);
        }}
        onDeleteForMe={() => {
          if (messageToDelete) onDeleteMessageForMe(messageToDelete.timestamp);
          setMessageToDelete(null);
        }}
      />

      {/* Photo Caption Modal */}
      <PhotoCaptionModal
        isOpen={!!pendingImageSrc}
        imageSrc={pendingImageSrc}
        onClose={() => setPendingImageSrc(null)}
        onSend={handleSendImageWithCaption}
      />
    </div>
  );
};
