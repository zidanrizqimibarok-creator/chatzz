import React, { useState, useRef, useEffect } from 'react';
import { Contact, Message, ChatFontSize, MessageReply } from '../types';
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
  onSendMessage: (text: string, isBroadcast?: boolean, caption?: string, replyTo?: MessageReply) => void;
  onEditMessage?: (timestamp: number, newText: string) => void;
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
  'Lagi di jalan 🛵',
  'Siap, mantap! 👍',
  'Oke saya kabari nanti ✨',
  'Lagi sibuk sebentar 🙏',
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
  onEditMessage,
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

  // Reply & Edit State (WhatsApp & Telegram style)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // Wallpaper State (WhatsApp / Telegram presets)
  const [wallpaperId, setWallpaperId] = useState<string>(() => {
    return localStorage.getItem(`chatzz_wallpaper_${contact.pin}`) || localStorage.getItem('chatzz_wallpaper') || 'whatsapp-doodle-light';
  });
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);

  // Delete Modal State
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

  // Photo Attachment Modal State
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

  const activeWallpaper =
    WALLPAPER_PRESETS.find((wp) => wp.id === wallpaperId) || WALLPAPER_PRESETS[0];

  const displayName = contact.customNickname || contact.name;

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

  const handleSelectWallpaper = (newWpId: string) => {
    setWallpaperId(newWpId);
    localStorage.setItem(`chatzz_wallpaper_${contact.pin}`, newWpId);
    localStorage.setItem('chatzz_wallpaper', newWpId);
    onShowToast('Wallpaper Diperbarui', 'Latar belakang obrolan berhasil diubah.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    onSendTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onSendTypingStatus(false);
    }, 1800);
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    if (editingMessage && onEditMessage) {
      onEditMessage(editingMessage.timestamp, trimmed);
      setEditingMessage(null);
    } else {
      const replyPayload: MessageReply | undefined = replyingTo
        ? {
            text: replyingTo.text,
            sender: replyingTo.sender,
            senderName: replyingTo.sender === myPin ? 'Anda' : displayName,
            timestamp: replyingTo.timestamp,
          }
        : undefined;

      onSendMessage(trimmed, false, undefined, replyPayload);
    }

    setInputText('');
    setReplyingTo(null);
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

  // Voice Note Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordStreamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
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
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      onShowToast('Gagal', 'Izin mikrofon diperlukan untuk merekam pesan suara.');
    }
  };

  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recordStreamRef.current) {
        recordStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      setIsRecording(false);
      setRecordSeconds(0);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recordStreamRef.current) {
        recordStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      audioChunksRef.current = [];
      setIsRecording(false);
      setRecordSeconds(0);
    }
  };

  const handlePlayAudio = (timestamp: number, base64Audio: string) => {
    if (playingAudioTimestamp === timestamp) {
      activeAudioInstanceRef.current?.pause();
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

    audio.play().catch(() => {
      setPlayingAudioTimestamp(null);
    });
  };

  // Filter messages
  const displayedMessages = messages.filter((m) => {
    if (showStarredOnly && !m.isStarred) return false;
    if (searchQuery.trim()) {
      return m.text.toLowerCase().includes(searchQuery.toLowerCase().trim());
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative select-none">
      {/* Modern WhatsApp/Telegram Chat Header */}
      <div className="h-14 bg-white border-b border-slate-200 px-3 flex items-center justify-between shadow-xs z-20">
        <div className="flex items-center space-x-2.5 min-w-0">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-600 flex items-center justify-center transition shrink-0"
            title="Kembali ke Kontak"
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
          </button>

          {/* Contact Avatar & Online Status */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            {contact.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-xs text-slate-900 truncate leading-tight flex items-center gap-1.5">
              <span>{displayName}</span>
              {contact.nowPlaying && (
                <span className="text-[10px] text-pink-600 font-normal truncate">
                  🎵 {contact.nowPlaying}
                </span>
              )}
            </h3>

            {/* Subtitle: Live Typing or Online / Last Seen Status */}
            <div className="text-[10px] leading-tight truncate">
              {isPartnerTyping ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  sedang mengetik...
                </span>
              ) : contact.isOnline ? (
                <span className="text-emerald-600 font-medium">Online</span>
              ) : contact.lastSeen ? (
                <span className="text-slate-400">
                  Terakhir dilihat {new Date(contact.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              ) : (
                <span className="text-slate-400 font-mono">ID: {contact.pin}</span>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-1">
          {/* Voice Call */}
          <button
            onClick={onStartVoiceCall}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-600 hover:text-blue-600 flex items-center justify-center transition"
            title="Panggilan Suara"
          >
            <i className="fa-solid fa-phone text-xs"></i>
          </button>

          {/* PING Buzzer */}
          <button
            onClick={onSendPing}
            className="w-8 h-8 rounded-full hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition active:scale-90"
            title="Kirim PING!"
          >
            <i className="fa-solid fa-bell text-xs"></i>
          </button>

          {/* Search in Chat */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`w-8 h-8 rounded-full transition flex items-center justify-center ${
              showSearch ? 'bg-blue-100 text-blue-600 font-bold' : 'hover:bg-slate-100 text-slate-600'
            }`}
            title="Cari Pesan"
          >
            <i className="fa-solid fa-magnifying-glass text-xs"></i>
          </button>

          {/* Wallpaper Picker */}
          <button
            onClick={() => setIsWallpaperModalOpen(true)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-600 hover:text-blue-600 flex items-center justify-center transition"
            title="Ganti Wallpaper Obrolan"
          >
            <i className="fa-solid fa-image text-xs"></i>
          </button>

          {/* Block / Unblock */}
          <button
            onClick={onToggleBlock}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition ml-1 ${
              contact.isBlocked
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {contact.isBlocked ? 'Buka Blokir' : 'Blokir'}
          </button>
        </div>
      </div>

      {/* In-Chat Search Bar */}
      {showSearch && (
        <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata kunci dalam chat..."
            className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-sans"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
            >
              Hapus
            </button>
          )}
        </div>
      )}

      {/* Messages Canvas with Wallpaper */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2.5"
        style={activeWallpaper.style}
      >
        {displayedMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center text-slate-400 mb-2">
              <i className="fa-regular fa-comment-dots text-xl text-blue-500"></i>
            </div>
            <p className="text-xs text-slate-600 font-semibold bg-white/80 px-3 py-1 rounded-full shadow-sm">
              Mulai percakapan dengan {displayName}
            </p>
          </div>
        ) : (
          displayedMessages.map((msg) => {
            const isMe = msg.sender === myPin;

            return (
              <div
                key={msg.timestamp}
                className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`relative max-w-[82%] sm:max-w-[70%] px-3.5 py-2 transition-shadow ${
                    isMe
                      ? 'modern-bubble-sent'
                      : 'modern-bubble-received'
                  }`}
                >
                  {/* Quoted / Reply Preview Block (WhatsApp / Telegram style) */}
                  {msg.replyTo && (
                    <div
                      className={`mb-1.5 p-2 rounded-lg text-left text-xs border-l-4 ${
                        isMe
                          ? 'bg-emerald-900/10 border-emerald-600 text-emerald-900'
                          : 'bg-slate-100 border-blue-600 text-slate-800'
                      }`}
                    >
                      <div className="font-bold text-[10px] text-blue-600 leading-tight">
                        {msg.replyTo.senderName || msg.replyTo.sender}
                      </div>
                      <div className="text-[11px] truncate opacity-85 mt-0.5">
                        {msg.replyTo.text}
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  {msg.deletedForEveryone ? (
                    <span className="italic text-slate-400 text-xs flex items-center gap-1.5">
                      <i className="fa-solid fa-ban text-[11px]"></i> Pesan ini telah ditarik.
                    </span>
                  ) : msg.isPing ? (
                    <div className="font-black text-red-600 tracking-wider text-sm animate-bounce flex items-center gap-1.5 py-0.5">
                      <i className="fa-solid fa-bell"></i> PING!!!
                    </div>
                  ) : msg.text.startsWith('[AUDIO]:') ? (
                    <div className="flex items-center gap-3 py-1 min-w-[180px]">
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(msg.timestamp, msg.text.replace('[AUDIO]:', ''))}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm transition ${
                          playingAudioTimestamp === msg.timestamp
                            ? 'bg-red-500'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        <i
                          className={`fa-solid ${
                            playingAudioTimestamp === msg.timestamp ? 'fa-pause' : 'fa-play'
                          } text-xs ml-0.5`}
                        ></i>
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 h-3">
                          <span className="w-1 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                          <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
                          <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                          <span className="w-1 h-2 bg-slate-400 rounded-full"></span>
                          <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                          Pesan Suara
                        </span>
                      </div>
                    </div>
                  ) : msg.text.startsWith('[IMAGE]:') ? (
                    <div className="space-y-1.5 py-0.5">
                      <img
                        src={msg.text.replace('[IMAGE]:', '')}
                        alt="Foto"
                        onClick={() => onOpenImage(msg.text.replace('[IMAGE]:', ''))}
                        className="rounded-xl max-h-60 object-cover cursor-pointer hover:opacity-95 transition"
                      />
                      {msg.caption && (
                        <p className="text-xs text-slate-800 font-sans leading-relaxed">
                          {msg.caption}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs whitespace-pre-wrap break-words leading-relaxed font-sans">
                      {msg.text}
                    </p>
                  )}

                  {/* Message Bottom Metadata (Timestamp, Edited tag, and Delivery Status ✓✓) */}
                  <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-slate-400 select-none">
                    {msg.isStarred && (
                      <i className="fa-solid fa-star text-amber-500 text-[9px]"></i>
                    )}
                    {msg.isEdited && (
                      <span className="italic text-[9px] text-slate-400 font-normal">diedit</span>
                    )}
                    <span>{msg.time}</span>

                    {/* Double Checkmark (Sent / Read status) */}
                    {isMe && (
                      <span
                        className={`font-bold text-xs ${
                          msg.status === 'R' ? 'text-sky-500 font-black' : 'text-slate-400'
                        }`}
                        title={msg.status === 'R' ? 'Dibaca (✓✓)' : 'Terkirim (✓)'}
                      >
                        {msg.status === 'R' ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>

                  {/* WhatsApp/Telegram Floating Message Actions on Hover */}
                  {!msg.deletedForEveryone && (
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 shadow-md border border-slate-200 rounded-lg flex items-center p-0.5 z-10">
                      {/* Reply */}
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600 text-[10px]"
                        title="Balas Pesan"
                      >
                        <i className="fa-solid fa-reply"></i>
                      </button>

                      {/* React */}
                      <button
                        onClick={() =>
                          setActiveReactionTimestamp(
                            activeReactionTimestamp === msg.timestamp ? null : msg.timestamp
                          )
                        }
                        className="p-1 hover:bg-slate-100 rounded text-slate-600 text-[10px]"
                        title="Beri Reaksi Emoji"
                      >
                        <i className="fa-regular fa-face-smile"></i>
                      </button>

                      {/* Edit (if sent by me) */}
                      {isMe && !msg.text.startsWith('[AUDIO]:') && !msg.text.startsWith('[IMAGE]:') && (
                        <button
                          onClick={() => {
                            setEditingMessage(msg);
                            setInputText(msg.text);
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 text-[10px]"
                          title="Edit Pesan"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                      )}

                      {/* Star */}
                      <button
                        onClick={() => onToggleStar(msg.timestamp)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600 text-[10px]"
                        title={msg.isStarred ? 'Hapus Bintang' : 'Beri Bintang'}
                      >
                        <i className={`fa-solid fa-star ${msg.isStarred ? 'text-amber-500' : ''}`}></i>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setMessageToDelete(msg)}
                        className="p-1 hover:bg-slate-100 rounded text-red-600 text-[10px]"
                        title="Hapus Pesan"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  )}

                  {/* Reaction Drawer Popup */}
                  {activeReactionTimestamp === msg.timestamp && (
                    <div className="absolute -top-9 left-2 bg-white rounded-full shadow-lg border border-slate-200 px-2 py-1 flex items-center gap-1.5 z-30 animate-fade-in-slide">
                      {['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onToggleReaction(msg.timestamp, emoji);
                            setActiveReactionTimestamp(null);
                          }}
                          className="text-base hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Active Reactions Pills */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(msg.reactions).map(([emoji, users]) => {
                        if (!users || users.length === 0) return null;
                        const isMine = users.includes(myPin);
                        return (
                          <button
                            key={emoji}
                            onClick={() => onToggleReaction(msg.timestamp, emoji)}
                            className={`text-[10px] px-1.5 py-0.2 rounded-full border flex items-center gap-1 transition ${
                              isMine
                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                : 'bg-white/80 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="font-bold">{users.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Live Partner Typing Banner above input */}
      {isPartnerTyping && (
        <div className="px-4 py-1.5 bg-blue-50/90 border-t border-blue-100 text-blue-700 text-xs font-medium flex items-center justify-between animate-fade-in-slide">
          <div className="flex items-center gap-2">
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.3s]"></span>
            </span>
            <span className="font-semibold italic">{displayName} sedang mengetik...</span>
          </div>
        </div>
      )}

      {/* Quoted Message / Replying Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between animate-fade-in-slide">
          <div className="border-l-4 border-blue-600 pl-2.5 text-xs min-w-0">
            <div className="font-bold text-[11px] text-blue-600">
              Membalas {replyingTo.sender === myPin ? 'Anda' : displayName}
            </div>
            <div className="text-slate-600 truncate text-[11px] mt-0.5">
              {replyingTo.text}
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="w-6 h-6 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* Edit Mode Banner */}
      {editingMessage && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center justify-between animate-fade-in-slide">
          <div className="text-xs text-amber-800 flex items-center gap-1.5">
            <i className="fa-solid fa-pen text-[10px]"></i>
            <span className="font-bold">Mengedit Pesan</span>
          </div>
          <button
            onClick={() => {
              setEditingMessage(null);
              setInputText('');
            }}
            className="text-xs text-amber-800 hover:underline font-bold"
          >
            Batal Edit
          </button>
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

      {/* Modern WhatsApp/Telegram Input Action Bar */}
      <div className="p-2.5 bg-white border-t border-slate-200 flex items-center space-x-2 relative select-none">
        {isRecording ? (
          <div className="flex-1 bg-red-50 border border-red-200 rounded-2xl px-4 py-2 flex items-center justify-between text-red-600">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <span className="font-bold text-xs">Merekam VN...</span>
              <span className="font-mono text-xs font-bold">
                00:{recordSeconds.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="text-slate-500 hover:text-red-700 text-xs px-2 py-1 font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={stopAndSendRecording}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3.5 py-1.5 rounded-xl font-bold shadow-sm"
              >
                Kirim
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Replies Toggle */}
            <button
              type="button"
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                showQuickReplies ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Balasan Kilat"
            >
              <i className="fa-solid fa-bolt text-xs"></i>
            </button>

            {/* Emoticon */}
            <button
              type="button"
              onClick={() => setIsEmoticonOpen(!isEmoticonOpen)}
              className="w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-amber-500 flex items-center justify-center transition"
              title="Emoji"
            >
              <i className="fa-regular fa-face-smile text-base"></i>
            </button>

            {/* Image / Camera Attachment */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-emerald-600 flex items-center justify-center transition"
              title="Kirim Foto"
            >
              <i className="fa-solid fa-image text-sm"></i>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Schedule Message */}
            <button
              type="button"
              onClick={onOpenSchedule}
              className="w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 flex items-center justify-center transition"
              title="Jadwalkan Pesan"
            >
              <i className="fa-regular fa-clock text-sm"></i>
            </button>

            {/* Main Modern Input Field */}
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              className="flex-1 bg-slate-100 hover:bg-slate-150 focus:bg-white border border-transparent focus:border-blue-500 px-4 py-2 rounded-2xl text-xs outline-none font-sans transition placeholder:text-slate-400"
            />

            {/* Voice Note Record */}
            <button
              type="button"
              onClick={startRecording}
              className="w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 flex items-center justify-center transition"
              title="Rekam Pesan Suara"
            >
              <i className="fa-solid fa-microphone text-sm"></i>
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-sm transition"
              title="Kirim Pesan"
            >
              <i className="fa-solid fa-paper-plane text-xs ml-0.5"></i>
            </button>
          </>
        )}
      </div>

      {/* Quick Replies Tray */}
      {showQuickReplies && (
        <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {QUICK_REPLIES.map((text) => (
            <button
              key={text}
              onClick={() => {
                onSendMessage(text);
                setShowQuickReplies(false);
              }}
              className="px-3 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full text-xs text-slate-700 whitespace-nowrap shadow-xs transition"
            >
              {text}
            </button>
          ))}
        </div>
      )}

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
