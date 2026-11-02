export type Presence = 'online' | 'away' | 'busy';

export type AppTheme =
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
  avatarUrl?: string;
  nowPlaying?: string;
  unreadCount?: number;
  lastSeen?: number;
  isTyping?: boolean;
}

export interface Message {
  sender: string;
  senderName?: string;
  groupId?: string;
  text: string;
  time: string;
  timestamp: number;
  isPing?: boolean;
  isBroadcast?: boolean;
  isStarred?: boolean;
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
}

export interface Story {
  sender: string;
  senderName: string;
  text: string;
  timestamp: number;
  expiresAt: number;
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
