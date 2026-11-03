export type Presence = 'online' | 'offline' | 'away' | 'busy' | 'hidden';

export type AppTheme =
  | 'telegram-blue'
  | 'whatsapp-emerald'
  | 'telegram-dark'
  | 'ios-slate'
  | 'sakura-blush'
  | 'aero-blue'
  | 'blackberry-purple'
  | 'matrix-emerald'
  | 'crimson-ruby'
  | 'obsidian-dark';

export type NotificationSound =
  | 'bbm-ping'
  | 'msn-nudge'
  | 'icq-uhoh'
  | 'retro-chime'
  | 'water-drop';

export type ChatFontSize = 'sm' | 'base' | 'lg';

export interface Contact {
  pin: string;
  name: string;
  customNickname?: string;
  lastActivity?: number;
  isBlocked?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  avatarUrl?: string;
  nowPlaying?: string;
  unreadCount?: number;
  lastSeen?: number;
  isOnline?: boolean;
  isTyping?: boolean;
}

export interface MessageReply {
  text: string;
  sender: string;
  senderName?: string;
  timestamp?: number;
}

export interface Message {
  id?: string;
  sender: string;
  senderName?: string;
  groupId?: string;
  text: string;
  time: string;
  timestamp: number;
  isPing?: boolean;
  isBroadcast?: boolean;
  isStarred?: boolean;
  isEdited?: boolean;
  editedAt?: number;
  replyTo?: MessageReply;
  audioDuration?: number;
  caption?: string;
  deletedForEveryone?: boolean;
  reactions?: Record<string, string[]>; // emoji -> array of user PINs
  status: 'S' | 'R' | 'NS'; // S = Sent, R = Read, NS = Not Sent
}

export interface GroupRoom {
  id: string;
  name: string;
  members: string[]; // array of PINs
  createdAt: number;
  avatar?: string;
  creatorPin?: string;
  description?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
}

export interface Story {
  id?: string;
  sender: string;
  senderName: string;
  text: string;
  mediaUrl?: string;
  timestamp: number;
  expiresAt: number;
  views?: number;
  excludedPins?: string[]; // Contacts who cannot view this story
}

export interface RandomChatMessage {
  id: string;
  senderPin: string;
  senderAlias: string;
  text: string;
  time: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface ScheduledMessage {
  targetPin: string;
  text: string;
  targetTime: number;
  timeStr: string;
}

export interface CenterCommand {
  action: 'SHUTDOWN' | 'MAINTENANCE' | 'RESTORE' | 'START' | 'ANNOUNCEMENT';
  text?: string;
}

export interface ToastInfo {
  id: string;
  title: string;
  body: string;
  isPing?: boolean;
}

export interface QuickReply {
  id: string;
  text: string;
}

export interface ChatzzStats {
  totalSent: number;
  totalReceived: number;
  totalPings: number;
  totalVoiceNotes: number;
  totalPhotos: number;
}
