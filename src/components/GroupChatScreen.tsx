import React, { useState, useRef, useEffect } from 'react';
import { GroupRoom, Contact, Message, ChatFontSize } from '../types';
import { EmoticonPicker } from './EmoticonPicker';
import { ReactionPicker } from './ReactionPicker';
import { PhotoCaptionModal } from './Modals/PhotoCaptionModal';
import { WallpaperModal, WALLPAPER_PRESETS } from './Modals/WallpaperModal';
import { DeleteMessageModal } from './Modals/DeleteMessageModal';
import { GroupInfoModal } from './Modals/GroupInfoModal';

interface Props {
  myPin: string;
  myName: string;
  group: GroupRoom;
  contacts: Contact[];
  messages: Message[];
  onBack: () => void;
  onSendMessage: (text: string, caption?: string) => void;
  onSendPing: () => void;
  onToggleStar: (timestamp: number) => void;
  onToggleReaction: (timestamp: number, emoji: string) => void;
  onDeleteMessageForMe: (timestamp: number) => void;
  onClearGroupHistory: () => void;
  onUpdateGroupName: (groupId: string, newName: string) => void;
  onAddMembers: (groupId: string, newPins: string[]) => void;
  onRemoveMember: (groupId: string, pinToRemove: string) => void;
  onLeaveGroup: (groupId: string) => void;
  onSelectDirectContact: (contact: Contact) => void;
  onOpenImage: (src: string) => void;
  onShowToast: (title: string, body: string) => void;
  onCopyPin: (pin: string) => void;
}

const QUICK_GROUP_REPLIES = [
  'Halo semua! 👋',
  'Ada info apa hari ini? 🤔',
  'Siap gas! 🚀',
  'Oke mantap 👍',
  'Lagi otw yaa 🛵',
  'Kumpul jam berapa? ⏰',
];

// Color palette for group members
const MEMBER_COLOR_CLASSES = [
  'text-rose-600 bg-rose-50 border-rose-200',
  'text-emerald-600 bg-emerald-50 border-emerald-200',
  'text-indigo-600 bg-indigo-50 border-indigo-200',
  'text-amber-600 bg-amber-50 border-amber-200',
  'text-purple-600 bg-purple-50 border-purple-200',
  'text-teal-600 bg-teal-50 border-teal-200',
  'text-cyan-600 bg-cyan-50 border-cyan-200',
  'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200',
];

function getMemberColorClass(pin: string) {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    hash = (hash << 5) - hash + pin.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % MEMBER_COLOR_CLASSES.length;
  return MEMBER_COLOR_CLASSES[idx];
}

export const GroupChatScreen: React.FC<Props> = ({
  myPin,
  myName,
  group,
  contacts,
  messages,
  onBack,
  onSendMessage,
  onSendPing,
  onToggleStar,
  onToggleReaction,
  onDeleteMessageForMe,
  onClearGroupHistory,
  onUpdateGroupName,
  onAddMembers,
  onRemoveMember,
  onLeaveGroup,
  onSelectDirectContact,
  onOpenImage,
  onShowToast,
  onCopyPin,
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
    return (
      localStorage.getItem(`chatzz_wallpaper_${group.id}`) ||
      localStorage.getItem('chatzz_wallpaper') ||
      'classic'
    );
  });
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);

  // Group Info Modal State
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

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

  // Active Wallpaper preset style
  const activeWallpaper =
    WALLPAPER_PRESETS.find((wp) => wp.id === wallpaperId) || WALLPAPER_PRESETS[0];

  const handleSelectWallpaper = (newWpId: string) => {
    setWallpaperId(newWpId);
    localStorage.setItem(`chatzz_wallpaper_${group.id}`, newWpId);
    onShowToast('Wallpaper Diperbarui', 'Latar belakang grup berhasil diubah.');
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    };
  }, []);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputText('');
    setIsEmoticonOpen(false);
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

  const handleConfirmSendPhoto = (caption: string) => {
    if (!pendingImageSrc) return;
    onSendMessage(`[IMG]:${pendingImageSrc}`, caption);
    setPendingImageSrc(null);
  };

  // Real Voice Note Recorder
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          if (base64Audio) {
            onSendMessage(`[AUDIO]:${base64Audio}`);
          }
        };
        reader.readAsDataURL(audioBlob);

        if (recordStreamRef.current) {
          recordStreamRef.current.getTracks().forEach((track) => track.stop());
          recordStreamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      onShowToast('Mikrofon Gagal', 'Izinkan akses mikrofon untuk merekam VN.');
    }
  };

  const handleStopRecording = (shouldSend = true) => {
    if (!mediaRecorderRef.current) return;
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);

    if (shouldSend) {
      mediaRecorderRef.current.stop();
    } else {
      if (recordStreamRef.current) {
        recordStreamRef.current.getTracks().forEach((track) => track.stop());
        recordStreamRef.current = null;
      }
      audioChunksRef.current = [];
    }

    setIsRecording(false);
    setRecordSeconds(0);
    mediaRecorderRef.current = null;
  };

  const handlePlayAudio = (timestamp: number, base64Audio: string) => {
    if (playingAudioTimestamp === timestamp) {
      if (activeAudioInstanceRef.current) {
        activeAudioInstanceRef.current.pause();
      }
      setPlayingAudioTimestamp(null);
      return;
    }

    if (activeAudioInstanceRef.current) {
      activeAudioInstanceRef.current.pause();
    }

    const audio = new Audio(base64Audio);
    activeAudioInstanceRef.current = audio;
    setPlayingAudioTimestamp(timestamp);

    audio.onended = () => {
      setPlayingAudioTimestamp(null);
    };
    audio.onerror = () => {
      setPlayingAudioTimestamp(null);
      onShowToast('Pemutaran Gagal', 'Audio tidak dapat diputar.');
    };

    audio.play().catch(() => {
      setPlayingAudioTimestamp(null);
    });
  };

  // Export Group Chat to .txt
  const handleExportChat = () => {
    const textLines = [
      `=== RIWAYAT OBROLAN GRUP CHATZZ: ${group.name} ===`,
      `ID Grup: ${group.id}`,
      `Total Anggota: ${group.members.length}`,
      `Waktu Ekspor: ${new Date().toLocaleString('id-ID')}`,
      `=============================================`,
      '',
    ];

    messages.forEach((m) => {
      const senderContact = contacts.find((c) => c.pin === m.sender);
      const senderLabel =
        m.sender === myPin
          ? `Kamu (${m.sender})`
          : `${m.senderName || (senderContact ? senderContact.name : m.sender)} (${m.sender})`;
      let content = m.text;
      if (m.text.startsWith('[IMG]:')) {
        content = `[FOTO TERLAMPIR${m.caption ? `: ${m.caption}` : ''}]`;
      } else if (m.text.startsWith('[AUDIO]:')) {
        content = '[CATATAN SUARA / VN]';
      }
      textLines.push(`[${m.time}] ${senderLabel}: ${content}`);
    });

    const blob = new Blob([textLines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chatzz_Grup_${group.name.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Ekspor Berhasil', 'Riwayat obrolan grup berhasil diunduh.');
  };

  // Filter messages
  let filteredMessages = messages;
  if (showStarredOnly) {
    filteredMessages = filteredMessages.filter((m) => m.isStarred);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredMessages = filteredMessages.filter((m) => {
      const textMatch = m.text.toLowerCase().includes(q);
      const captionMatch = m.caption && m.caption.toLowerCase().includes(q);
      const senderMatch = m.sender.toLowerCase().includes(q) || (m.senderName && m.senderName.toLowerCase().includes(q));
      return textMatch || captionMatch || senderMatch;
    });
  }

  const formatRecordTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getMemberDisplayName = (pin: string, senderName?: string) => {
    if (pin === myPin) return 'Kamu';
    const c = contacts.find((contact) => contact.pin === pin);
    if (c) return c.customNickname || c.name;
    if (senderName) return senderName;
    return `User ${pin.substring(2, 6)}`;
  };

  return (
    <div className="absolute inset-0 bg-[#e6edf5] flex flex-col z-20">
      {/* 1. Header Bar */}
      <div className="h-14 bg-white border-b border-slate-200 px-3 flex items-center justify-between shadow-xs z-20 select-none">
        <div className="flex items-center space-x-2 overflow-hidden">
          {/* Back button */}
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-600 flex items-center justify-center transition shrink-0"
            title="Kembali ke Daftar Percakapan"
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
          </button>

          {/* Group Avatar & Info Clicker */}
          <div
            onClick={() => setIsGroupInfoOpen(true)}
            className="flex items-center space-x-2.5 cursor-pointer group truncate"
            title="Klik untuk lihat anggota & info grup"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              <i className="fa-solid fa-users"></i>
            </div>

            <div className="truncate">
              <h3 className="font-bold text-xs leading-tight truncate flex items-center gap-1.5 text-slate-900">
                <span>{group.name}</span>
                <i className="fa-solid fa-circle-info text-[10px] text-slate-400 group-hover:text-blue-600 transition"></i>
              </h3>
              <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                <span>{group.members.length} Anggota</span>
                <span>•</span>
                <span className="hover:underline text-blue-600 font-medium">Lihat Info</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 shrink-0">
          {/* Group PING */}
          <button
            onClick={onSendPing}
            className="w-8 h-8 rounded-full hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition"
            title="Kirim PING! ke semua anggota grup"
          >
            <i className="fa-solid fa-bell text-xs"></i>
          </button>

          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              showSearch
                ? 'bg-blue-100 text-blue-600 font-bold'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
            title="Cari pesan dalam grup"
          >
            <i className="fa-solid fa-magnifying-glass text-xs"></i>
          </button>

          {/* Wallpaper Picker */}
          <button
            onClick={() => setIsWallpaperModalOpen(true)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-600 hover:text-blue-600 flex items-center justify-center transition"
            title="Ganti Tema Wallpaper Grup"
          >
            <i className="fa-solid fa-image text-xs"></i>
          </button>

          {/* Group Info */}
          <button
            onClick={() => setIsGroupInfoOpen(true)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-600 hover:text-blue-600 flex items-center justify-center transition"
            title="Pengaturan Anggota & Info Grup"
          >
            <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
          </button>
        </div>
      </div>

      {/* 2. In-Chat Search Bar */}
      {showSearch && (
        <div className="bg-slate-100 p-2 border-b border-slate-300 flex items-center gap-2 text-xs shrink-0 shadow-inner">
          <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik kata kunci untuk mencari pesan..."
            className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs outline-none text-slate-700"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs px-1"
            >
              &times;
            </button>
          )}
          <span className="text-[10px] text-slate-500 font-bold">
            {filteredMessages.length} pesan
          </span>
        </div>
      )}

      {/* Starred Banner */}
      {showStarredOnly && (
        <div className="bg-amber-100/90 border-b border-amber-300 px-3 py-1 flex items-center justify-between text-amber-900 text-[10px] font-bold shrink-0">
          <div className="flex items-center gap-1.5">
            <i className="fa-solid fa-star text-amber-600 text-xs"></i>
            <span>Menampilkan pesan berbintang saja ({filteredMessages.length})</span>
          </div>
          <button
            onClick={() => setShowStarredOnly(false)}
            className="underline hover:text-amber-950"
          >
            Tampilkan Semua
          </button>
        </div>
      )}

      {/* 3. Messages Flow Viewport */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2.5 transition-all"
        style={activeWallpaper.style}
      >
        {/* Group Welcome Card */}
        <div className="flex justify-center my-2">
          <div className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl px-4 py-2 text-center shadow-sm max-w-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1 text-xs">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h4 className="font-bold text-xs text-slate-800">{group.name}</h4>
            <p className="text-[9px] text-slate-500 mt-0.5">
              Grup BBM dengan {group.members.length} anggota. Obrolan disinkronkan secara real-time via MQTT.
            </p>
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center text-slate-400/80">
            <i className="fa-solid fa-comments text-3xl mb-2 text-slate-300/80"></i>
            <p className="text-xs font-medium">
              {searchQuery
                ? 'Tidak ada pesan yang cocok.'
                : 'Mulai obrolan grup dengan mengetik pesan di bawah!'}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const isMe = msg.sender === myPin;
            const isImage = msg.text.startsWith('[IMG]:');
            const isAudio = msg.text.startsWith('[AUDIO]:');
            const imgSrc = isImage ? msg.text.substring(6) : '';
            const audioSrc = isAudio ? msg.text.substring(8) : '';
            const memberColor = getMemberColorClass(msg.sender);
            const senderDisplayName = getMemberDisplayName(msg.sender, msg.senderName);

            return (
              <div
                key={msg.timestamp || index}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
              >
                {/* Sender badge for incoming group messages */}
                {!isMe && (
                  <div className="flex items-center gap-1.5 ml-2 mb-0.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${memberColor}`}
                    >
                      {senderDisplayName} • {msg.sender.substring(2, 6)}
                    </span>
                  </div>
                )}

                <div
                  className={`relative max-w-[82%] px-3 py-2 rounded-2xl shadow-sm text-slate-800 transition ${
                    isMe
                      ? 'bg-gradient-to-tr from-cyan-100 to-blue-100 border border-cyan-200/90 rounded-br-none'
                      : 'bg-white border border-slate-200 rounded-bl-none shadow'
                  } ${fontSize === 'base' ? 'text-sm' : fontSize === 'lg' ? 'text-base' : 'text-xs'}`}
                >
                  {/* PING badge */}
                  {msg.isPing && (
                    <div className="flex items-center gap-1.5 text-red-600 font-black text-sm tracking-widest mb-0.5 animate-bounce">
                      <i className="fa-solid fa-bell"></i>
                      <span>PING!!!</span>
                    </div>
                  )}

                  {/* Image attachment */}
                  {isImage && (
                    <div className="mb-1 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={imgSrc}
                        alt="Foto grup"
                        className="max-h-48 w-auto rounded-xl object-contain cursor-pointer hover:opacity-95 transition"
                        onClick={() => onOpenImage(imgSrc)}
                      />
                      {msg.caption && (
                        <p className="mt-1 text-xs text-slate-700 italic px-1 pb-1">
                          {msg.caption}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Voice note player */}
                  {isAudio && (
                    <div className="flex items-center gap-2 py-1 pr-1">
                      <button
                        onClick={() => handlePlayAudio(msg.timestamp, audioSrc)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shadow-md transition ${
                          playingAudioTimestamp === msg.timestamp
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        title="Putar Voice Note"
                      >
                        <i
                          className={`fa-solid ${
                            playingAudioTimestamp === msg.timestamp ? 'fa-pause' : 'fa-play'
                          }`}
                        ></i>
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-0.5 h-3">
                          {[3, 6, 8, 5, 9, 4, 7, 10, 6, 4, 8, 3].map((h, i) => (
                            <div
                              key={i}
                              className={`w-1 rounded-full ${
                                playingAudioTimestamp === msg.timestamp
                                  ? 'bg-blue-500 animate-pulse'
                                  : 'bg-slate-300'
                              }`}
                              style={{ height: `${h * 1.5}px` }}
                            ></div>
                          ))}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                          Voice Note Grup
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Plain text */}
                  {!isImage && !isAudio && !msg.isPing && (
                    <p className="break-words leading-relaxed">{msg.text}</p>
                  )}

                  {/* Timestamp & Status footer */}
                  <div className="flex items-center justify-end gap-1.5 mt-1 text-[8px] text-slate-400">
                    {msg.isStarred && (
                      <i className="fa-solid fa-star text-amber-500 text-[8px]"></i>
                    )}
                    <span>{msg.time}</span>
                    {isMe && (
                      <span
                        className={`font-mono font-bold ${
                          msg.status === 'R' ? 'text-blue-600' : 'text-slate-400'
                        }`}
                        title={msg.status === 'R' ? 'Read' : 'Sent'}
                      >
                        {msg.status === 'R' ? 'R' : 'S'}
                      </span>
                    )}
                  </div>

                  {/* Reactions Display */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-slate-100">
                      {Object.entries(msg.reactions).map(([emoji, users]) => {
                        if (users.length === 0) return null;
                        const hasReacted = users.includes(myPin);
                        return (
                          <button
                            key={emoji}
                            onClick={() => onToggleReaction(msg.timestamp, emoji)}
                            className={`px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 border transition ${
                              hasReacted
                                ? 'bg-blue-100 border-blue-400 text-blue-800 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                            title={`Direaksikan oleh ${users.length} anggota`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[9px]">{users.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Floating Action Bar on hover */}
                  <div
                    className={`absolute -top-3 ${
                      isMe ? 'right-2' : 'left-2'
                    } hidden group-hover:flex items-center gap-1 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-md z-10 text-[10px]`}
                  >
                    <button
                      onClick={() =>
                        setActiveReactionTimestamp(
                          activeReactionTimestamp === msg.timestamp ? null : msg.timestamp
                        )
                      }
                      className="text-slate-500 hover:text-amber-500 p-0.5"
                      title="Beri Emosi / Reaction"
                    >
                      <i className="fa-regular fa-face-smile"></i>
                    </button>
                    <button
                      onClick={() => onToggleStar(msg.timestamp)}
                      className={`p-0.5 ${
                        msg.isStarred
                          ? 'text-amber-500'
                          : 'text-slate-400 hover:text-amber-500'
                      }`}
                      title={msg.isStarred ? 'Hapus Bintang' : 'Beri Bintang'}
                    >
                      <i
                        className={`fa-solid fa-star ${
                          msg.isStarred ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      ></i>
                    </button>
                    <button
                      onClick={() => setMessageToDelete(msg)}
                      className="text-slate-400 hover:text-red-500 p-0.5"
                      title="Hapus pesan"
                    >
                      <i className="fa-solid fa-trash text-[9px]"></i>
                    </button>
                  </div>

                  {/* Reaction Picker Popover */}
                  {activeReactionTimestamp === msg.timestamp && (
                    <div className="absolute top-0 right-0 z-30">
                      <ReactionPicker
                        isOpen={activeReactionTimestamp === msg.timestamp}
                        onSelect={(emoji: string) => {
                          onToggleReaction(msg.timestamp, emoji);
                          setActiveReactionTimestamp(null);
                        }}
                        onClose={() => setActiveReactionTimestamp(null)}
                        isMe={isMe}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Quick Replies Pill Slider */}
      {showQuickReplies && (
        <div className="bg-white/95 px-3 py-1.5 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0 shadow-inner">
          {QUICK_GROUP_REPLIES.map((reply, i) => (
            <button
              key={i}
              onClick={() => {
                onSendMessage(reply);
                setShowQuickReplies(false);
              }}
              className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 transition shrink-0"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* 5. Emoticon Drawer */}
      <EmoticonPicker
        isOpen={isEmoticonOpen}
        onClose={() => setIsEmoticonOpen(false)}
        onSelect={(emo: string) => {
          setInputText((prev) => prev + emo);
        }}
      />

      {/* 6. Voice Note Recording Banner */}
      {isRecording && (
        <div className="bg-red-500 text-white px-3 py-2 flex items-center justify-between shrink-0 shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></div>
            <span className="text-xs font-bold">Merekam Voice Note Grup...</span>
            <span className="font-mono text-xs font-bold bg-red-700 px-2 py-0.5 rounded">
              {formatRecordTime(recordSeconds)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStopRecording(false)}
              className="px-2 py-1 bg-red-700 hover:bg-red-800 text-white text-[10px] font-bold rounded-lg"
            >
              Batal
            </button>
            <button
              onClick={() => handleStopRecording(true)}
              className="px-3 py-1 bg-white text-red-600 hover:bg-slate-100 text-[10px] font-bold rounded-lg shadow"
            >
              Kirim
            </button>
          </div>
        </div>
      )}

      {/* 7. Bottom Input Bar */}
      <div className="p-2 bg-white/95 backdrop-blur border-t border-slate-200 flex items-center gap-1.5 shrink-0 shadow-sm">
        {/* Quick replies toggle */}
        <button
          onClick={() => setShowQuickReplies(!showQuickReplies)}
          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs transition border ${
            showQuickReplies
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
          }`}
          title="Balasan Cepat (Quick Replies)"
        >
          <i className="fa-solid fa-bolt text-[10px]"></i>
        </button>

        {/* Emoticon Picker Toggle */}
        <button
          onClick={() => setIsEmoticonOpen(!isEmoticonOpen)}
          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs transition border ${
            isEmoticonOpen
              ? 'bg-amber-400 text-slate-900 border-amber-400'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
          }`}
          title="BBM Emoticons"
        >
          <i className="fa-regular fa-face-smile"></i>
        </button>

        {/* File / Photo Upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs transition border border-slate-200"
          title="Kirim Foto"
        >
          <i className="fa-solid fa-paperclip text-[10px]"></i>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Voice Note Mic Button */}
        <button
          onClick={handleStartRecording}
          disabled={isRecording}
          className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs transition border border-slate-200"
          title="Rekam Voice Note (VN)"
        >
          <i className="fa-solid fa-microphone text-[10px]"></i>
        </button>

        {/* Input Text Box */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Kirim pesan ke grup..."
          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white text-slate-800 transition"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm active:scale-95 transition shrink-0"
          title="Kirim Pesan"
        >
          <i className="fa-solid fa-paper-plane text-xs ml-0.5"></i>
        </button>
      </div>

      {/* Group Info Modal */}
      <GroupInfoModal
        isOpen={isGroupInfoOpen}
        group={group}
        myPin={myPin}
        contacts={contacts}
        onClose={() => setIsGroupInfoOpen(false)}
        onUpdateGroupName={onUpdateGroupName}
        onAddMembers={onAddMembers}
        onRemoveMember={onRemoveMember}
        onLeaveGroup={onLeaveGroup}
        onSelectDirectChat={(pin) => {
          const contact = contacts.find((c) => c.pin === pin);
          if (contact) {
            onSelectDirectContact(contact);
          } else {
            onShowToast('Kontak Belum Disimpan', `PIN ${pin} belum tersimpan di kontak.`);
          }
        }}
        onCopyPin={onCopyPin}
      />

      {/* Wallpaper Modal */}
      <WallpaperModal
        isOpen={isWallpaperModalOpen}
        activeWallpaperId={wallpaperId}
        onClose={() => setIsWallpaperModalOpen(false)}
        onSelectWallpaper={handleSelectWallpaper}
      />

      {/* Photo Caption Modal */}
      <PhotoCaptionModal
        isOpen={!!pendingImageSrc}
        imageSrc={pendingImageSrc}
        onClose={() => setPendingImageSrc(null)}
        onSend={(imgSrc, caption) => {
          onSendMessage(`[IMG]:${imgSrc}`, caption);
          setPendingImageSrc(null);
        }}
      />

      {/* Delete Message Modal */}
      <DeleteMessageModal
        isOpen={!!messageToDelete}
        isMyMessage={messageToDelete?.sender === myPin}
        messageText={messageToDelete?.text || ''}
        onClose={() => setMessageToDelete(null)}
        onDeleteForMe={() => {
          if (messageToDelete) {
            onDeleteMessageForMe(messageToDelete.timestamp);
            setMessageToDelete(null);
          }
        }}
        onDeleteForEveryone={() => {
          if (messageToDelete) {
            onDeleteMessageForMe(messageToDelete.timestamp);
            setMessageToDelete(null);
          }
        }}
      />
    </div>
  );
};
