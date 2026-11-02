import React, { useState, useEffect, useRef, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import {
  Contact,
  Message,
  Presence,
  Story,
  ScheduledMessage,
  CenterCommand,
  ToastInfo,
  AppTheme,
  NotificationSound,
  GroupRoom,
} from './types';
import { playPingSound, playMessageSound } from './utils/sound';
import { BootScreen } from './components/BootScreen';
import { Header } from './components/Header';
import { ContactsScreen } from './components/ContactsScreen';
import { ChatScreen } from './components/ChatScreen';
import { GroupChatScreen } from './components/GroupChatScreen';
import { GlobalChatScreen } from './components/GlobalChatScreen';
import { showWebNotification, startTitleBlink, requestNotificationPermission } from './utils/webNotification';
import {
  sendFirebaseDirectMessage,
  sendFirebaseGroupMessage,
  listenFirebaseInbox,
  sendFirebaseTyping,
  listenFirebaseTyping,
} from './utils/firebaseDualPipe';
import { VoiceCallModal } from './components/VoiceCallModal';
import { MaintenanceOverlay } from './components/MaintenanceOverlay';
import { Toast } from './components/Toast';
import { AddContactModal } from './components/Modals/AddContactModal';
import { ProfileModal } from './components/Modals/ProfileModal';
import { StoryModal } from './components/Modals/StoryModal';
import { ScheduleModal } from './components/Modals/ScheduleModal';
import { ToolsModal } from './components/Modals/ToolsModal';
import { DebugModal } from './components/Modals/DebugModal';
import { ImageModal } from './components/Modals/ImageModal';
import { QrScannerModal } from './components/Modals/QrScannerModal';
import { BroadcastModal } from './components/Modals/BroadcastModal';
import { NicknameModal } from './components/Modals/NicknameModal';
import { GroupChatModal } from './components/Modals/GroupChatModal';
import { NowPlayingModal } from './components/Modals/NowPlayingModal';
import { AvatarPickerModal } from './components/Modals/AvatarPickerModal';
import { NotificationSoundModal } from './components/Modals/NotificationSoundModal';
import { StatsModal } from './components/Modals/StatsModal';
import { PasscodeModal } from './components/Modals/PasscodeModal';
import { ConfirmModal } from './components/Modals/ConfirmModal';
import { StoryViewModal } from './components/Modals/StoryViewModal';

const RTC_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function App() {
  // Device & Profile State
  const [myPin] = useState<string>(() => {
    let pin = localStorage.getItem('chatzz_permanent_device_id');
    if (!pin) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      pin = 'ZZ';
      for (let i = 0; i < 6; i++) {
        pin += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      localStorage.setItem('chatzz_permanent_device_id', pin);
    }
    return pin;
  });

  const [myName, setMyName] = useState<string>(() => {
    return localStorage.getItem('chatzz_user_name') || `User_${myPin.substring(2, 6)}`;
  });
  const [myStatus, setMyStatus] = useState<string>(() => {
    return localStorage.getItem('chatzz_user_status') || 'Chatzzing...';
  });
  const [myPresence, setMyPresence] = useState<Presence>(() => {
    return (localStorage.getItem('chatzz_user_presence') as Presence) || 'online';
  });
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('chatzz_app_theme') as AppTheme) || 'aero-blue';
  });
  const [avatarId, setAvatarId] = useState<string>(() => {
    return localStorage.getItem('chatzz_avatar_id') || 'robot';
  });
  const [nowPlaying, setNowPlaying] = useState<string>(() => {
    return localStorage.getItem('chatzz_now_playing') || '';
  });
  const [notifSound, setNotifSound] = useState<NotificationSound>(() => {
    return (localStorage.getItem('chatzz_notif_sound') as NotificationSound) || 'bbm-ping';
  });

  // App Lock State
  const [passcode, setPasscode] = useState<string>(() => {
    return localStorage.getItem('chatzz_passcode') || '';
  });
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    return !!localStorage.getItem('chatzz_passcode');
  });
  const [isSettingUpPasscode, setIsSettingUpPasscode] = useState<boolean>(false);

  // App System & Overlay States
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [isMaintenance, setIsMaintenance] = useState<boolean>(() => {
    return localStorage.getItem('chatzz_server_shutdown') === 'true';
  });
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // MQTT Connection State
  const [mqttStatus, setMqttStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [mqttStatusText, setMqttStatusText] = useState<string>('Connecting WSS...');
  const mqttClientRef = useRef<MqttClient | null>(null);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // Contacts, Groups & Active Conversation
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('chatzz_user_contacts') || '[]');
    } catch {
      return [];
    }
  });

  const [groups, setGroups] = useState<GroupRoom[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('chatzz_groups') || '[]');
    } catch {
      return [];
    }
  });

  const [activeContactPin, setActiveContactPin] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [activeGroup, setActiveGroup] = useState<GroupRoom | null>(null);
  const [activeGroupMessages, setActiveGroupMessages] = useState<Message[]>([]);
  const [isGlobalOpen, setIsGlobalOpen] = useState<boolean>(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);

  // Modals Visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState<boolean>(false);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState<boolean>(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState<boolean>(false);
  const [isNowPlayingModalOpen, setIsNowPlayingModalOpen] = useState<boolean>(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState<boolean>(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState<boolean>(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [isClearCacheConfirmOpen, setIsClearCacheConfirmOpen] = useState<boolean>(false);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [editingContact, setEditingContact] = useState<{ pin: string; current: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Stories
  const [stories, setStories] = useState<Story[]>([]);

  // WebRTC Voice Call States
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const [isIncomingCall, setIsIncomingCall] = useState<boolean>(false);
  const [callerTitle, setCallerTitle] = useState<string>('');
  const [callerSubtitle, setCallerSubtitle] = useState<string>('');
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const incomingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const callPartnerPinRef = useRef<string | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const pushLog = useCallback((text: string) => {
    const time = new Date().toLocaleTimeString();
    setDebugLogs((prev) => [...prev.slice(-100), `[${time}] ${text}`]);
  }, []);

  const showToast = useCallback((title: string, body: string, isPing = false) => {
    const id = Math.random().toString();
    setToast({ id, title, body, isPing });
    setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 3000);
  }, []);

  const triggerScreenShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Theme Setter
  const handleSelectTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem('chatzz_app_theme', newTheme);
    showToast('Tema Diperbarui', `Tema diubah.`);
  };

  // Avatar Setter
  const handleSelectAvatar = (avId: string) => {
    setAvatarId(avId);
    localStorage.setItem('chatzz_avatar_id', avId);
    showToast('Avatar Diperbarui', 'Foto avatar retro berhasil dipasang.');
  };

  // Sound Setter
  const handleSelectSound = (sound: NotificationSound) => {
    setNotifSound(sound);
    localStorage.setItem('chatzz_notif_sound', sound);
    showToast('Nada Dering Diperbarui', 'Suara notifikasi berhasil disimpan.');
  };

  // Now Playing Setter
  const handleSaveNowPlaying = (songTitle: string) => {
    setNowPlaying(songTitle);
    localStorage.setItem('chatzz_now_playing', songTitle);
    showToast(songTitle ? 'Status Musik Dipasang' : 'Status Musik Dihapus', songTitle || '');

    // Broadcast song status to contacts
    if (mqttClientRef.current?.connected) {
      contacts.forEach((c) => {
        mqttClientRef.current?.publish(
          `chatzz/user/${c.pin}/inbox`,
          JSON.stringify({
            type: 'NOW_PLAYING',
            sender: myPin,
            nowPlaying: songTitle,
          }),
          { qos: 0 }
        );
      });
    }
  };

  // Load Stories
  const loadStories = useCallback(() => {
    try {
      const myStories: Story[] = JSON.parse(localStorage.getItem('chatzz_my_stories') || '[]');
      const receivedStories: Story[] = JSON.parse(
        localStorage.getItem('chatzz_received_stories') || '[]'
      );
      const now = Date.now();
      const valid = [...myStories, ...receivedStories].filter((s) => s.expiresAt > now);
      setStories(valid);
    } catch {
      setStories([]);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  // Load Messages for Active Conversation
  const loadActiveMessages = useCallback(() => {
    if (!activeContactPin) {
      setActiveMessages([]);
      return;
    }
    const storageKey = `chatzz_msg_${[myPin, activeContactPin].sort().join('_')}`;
    try {
      const msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setActiveMessages(msgs);
    } catch {
      setActiveMessages([]);
    }
  }, [activeContactPin, myPin]);

  useEffect(() => {
    loadActiveMessages();
  }, [loadActiveMessages]);

  // Load Messages for Active Group
  const loadActiveGroupMessages = useCallback(() => {
    if (!activeGroup) {
      setActiveGroupMessages([]);
      return;
    }
    const storageKey = `chatzz_group_msg_${activeGroup.id}`;
    try {
      const msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setActiveGroupMessages(msgs);
    } catch {
      setActiveGroupMessages([]);
    }
  }, [activeGroup]);

  useEffect(() => {
    loadActiveGroupMessages();
  }, [loadActiveGroupMessages]);

  // Auto-Reply Function
  const triggerAutoReply = useCallback(
    (targetPin: string) => {
      const autoText = `[Auto-Reply]: Halo, saya sedang ${myPresence.toUpperCase()} saat ini. Pesan akan dibaca segera.`;
      const now = Date.now();
      const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const payload = {
        type: 'CHAT',
        sender: myPin,
        senderName: myName,
        text: autoText,
        time: timeStr,
        timestamp: now,
      };
      if (mqttClientRef.current?.connected) {
        mqttClientRef.current.publish(`chatzz/user/${targetPin}/inbox`, JSON.stringify(payload), {
          qos: 1,
        });
      }
    },
    [myPin, myName, myPresence]
  );

  // Send ACK_READ for messages
  const sendReadACK = useCallback(
    (targetPin: string) => {
      if (!mqttClientRef.current?.connected) return;
      const payload = { type: 'ACK_READ', sender: myPin, timestamp: Date.now() };
      mqttClientRef.current.publish(`chatzz/user/${targetPin}/inbox`, JSON.stringify(payload), {
        qos: 1,
      });
    },
    [myPin]
  );

  // Call Session Cleanup
  const closeCallSession = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    incomingOfferRef.current = null;
    callPartnerPinRef.current = null;
    setIsCallModalOpen(false);
    setIsIncomingCall(false);
    setCallSeconds(0);
  }, []);

  const startCallTimer = useCallback(() => {
    setCallSeconds(0);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const createPeerConnection = useCallback(
    (targetPin: string) => {
      const pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnectionRef.current = pc;

      pc.onicecandidate = (event) => {
        if (event.candidate && mqttClientRef.current?.connected) {
          mqttClientRef.current.publish(
            `chatzz/user/${targetPin}/inbox`,
            JSON.stringify({
              type: 'WEBRTC_ICE',
              sender: myPin,
              candidate: event.candidate,
            }),
            { qos: 1 }
          );
        }
      };

      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      return pc;
    },
    [myPin]
  );

  // Handle Center Commands
  const handleCenterCommand = useCallback(
    (cmd: CenterCommand) => {
      pushLog(`CENTER CMD: ${cmd.action}`);
      if (cmd.action === 'SHUTDOWN' || cmd.action === 'MAINTENANCE') {
        localStorage.setItem('chatzz_server_shutdown', 'true');
        setIsMaintenance(true);
      } else if (cmd.action === 'RESTORE' || cmd.action === 'START') {
        localStorage.removeItem('chatzz_server_shutdown');
        setIsMaintenance(false);
      } else if (cmd.action === 'ANNOUNCEMENT') {
        showToast('Pengumuman Pusat', cmd.text || 'Pesan dari Administrator');
      }
    },
    [pushLog, showToast]
  );

  // Incoming Dual-Pipe Message Handler (MQTT + Firebase)
  const handleIncomingMessage = useCallback(
    (data: any) => {
      if (!data || !data.type) return;

      // Deduplicate across dual pipe
      if (data.sender && data.timestamp) {
        const dedupeKey = `${data.sender}_${data.timestamp}_${data.type}_${data.text || ''}`;
        if (processedMessageIdsRef.current.has(dedupeKey)) {
          return;
        }
        processedMessageIdsRef.current.add(dedupeKey);
        if (processedMessageIdsRef.current.size > 2500) {
          const keys = Array.from(processedMessageIdsRef.current);
          keys.slice(0, 500).forEach((k) => processedMessageIdsRef.current.delete(k));
        }
      }

      const now = Date.now();
      pushLog(`INBOX [${data.type}] from ${data.sender}`);

      const senderContact = contacts.find((c) => c.pin === data.sender);
      if (senderContact && senderContact.isBlocked) return;

      if (data.type === 'WEBRTC_OFFER') {
        callPartnerPinRef.current = data.sender;
        incomingOfferRef.current = data.offer;
        setCallerTitle(data.senderName || `User_${data.sender.substring(2, 6)}`);
        setCallerSubtitle(`Panggilan Masuk (PIN: ${data.sender})`);
        setIsIncomingCall(true);
        setIsCallModalOpen(true);
        playPingSound();
        return;
      }

      if (data.type === 'WEBRTC_ANSWER') {
        if (peerConnectionRef.current && data.answer) {
          peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
        return;
      }

      if (data.type === 'WEBRTC_ICE') {
        if (peerConnectionRef.current && data.candidate) {
          peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
        return;
      }

      if (data.type === 'CALL_END') {
        closeCallSession();
        showToast('Panggilan Berakhir', 'Telepon ditutup.');
        return;
      }

      if (data.type === 'TYPING') {
        if (activeContactPin === data.sender) {
          setIsPartnerTyping(!!data.isTyping);
        }
        return;
      }

      if (data.type === 'NOW_PLAYING') {
        setContacts((prev) =>
          prev.map((c) => (c.pin === data.sender ? { ...c, nowPlaying: data.nowPlaying } : c))
        );
        return;
      }

      if (data.type === 'DELETE_MSG') {
        const partnerPin = data.sender;
        const storageKey = `chatzz_msg_${[myPin, partnerPin].sort().join('_')}`;
        let msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        msgs = msgs.map((m) =>
          m.timestamp === data.messageTimestamp ? { ...m, deletedForEveryone: true } : m
        );
        localStorage.setItem(storageKey, JSON.stringify(msgs));
        if (activeContactPin === partnerPin) {
          setActiveMessages(msgs);
        }
        return;
      }

      if (data.type === 'REACTION') {
        const partnerPin = data.sender;
        const storageKey = `chatzz_msg_${[myPin, partnerPin].sort().join('_')}`;
        let msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        let updated = false;

        msgs = msgs.map((m) => {
          if (m.timestamp === data.messageTimestamp) {
            updated = true;
            const currentReactions: Record<string, string[]> = m.reactions ? { ...m.reactions } : {};
            const userList = currentReactions[data.emoji] ? [...currentReactions[data.emoji]] : [];
            if (userList.includes(partnerPin)) {
              currentReactions[data.emoji] = userList.filter((p) => p !== partnerPin);
            } else {
              currentReactions[data.emoji] = [...userList, partnerPin];
            }
            return { ...m, reactions: currentReactions };
          }
          return m;
        });

        if (updated) {
          localStorage.setItem(storageKey, JSON.stringify(msgs));
          if (activeContactPin === partnerPin) {
            setActiveMessages([...msgs]);
          }
        }
        return;
      }

      if (data.type === 'STORY_SHARE') {
        try {
          const recStories: Story[] = JSON.parse(
            localStorage.getItem('chatzz_received_stories') || '[]'
          );
          if (!recStories.some((s) => s.timestamp === data.timestamp)) {
            recStories.push(data);
            localStorage.setItem('chatzz_received_stories', JSON.stringify(recStories));
            loadStories();
          }
        } catch {
          // ignore error
        }
        return;
      }

      if (data.type === 'ACK_READ') {
        const storageKey = `chatzz_msg_${[myPin, data.sender].sort().join('_')}`;
        let msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        let updated = false;
        msgs.forEach((m) => {
          if (m.sender === myPin && m.status === 'S') {
            m.status = 'R';
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(storageKey, JSON.stringify(msgs));
          if (activeContactPin === data.sender) {
            setActiveMessages([...msgs]);
          }
        }
        return;
      }

      if (data.type === 'CHAT' || data.type === 'PING') {
        const partnerPin = data.sender;
        let updatedContacts = [...contacts];
        let contactObj = updatedContacts.find((c) => c.pin === partnerPin);

        if (!contactObj) {
          contactObj = {
            pin: partnerPin,
            name: data.senderName || `User_${partnerPin.substring(2, 6)}`,
            lastActivity: now,
            isBlocked: false,
          };
          updatedContacts.push(contactObj);
        } else {
          contactObj.lastActivity = now;
          if (data.senderName && !contactObj.customNickname) {
            contactObj.name = data.senderName;
          }
        }
        setContacts(updatedContacts);
        localStorage.setItem('chatzz_user_contacts', JSON.stringify(updatedContacts));

        const storageKey = `chatzz_msg_${[myPin, partnerPin].sort().join('_')}`;
        let msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');

        if (!msgs.some((m) => m.timestamp === data.timestamp)) {
          const newMsg: Message = {
            sender: partnerPin,
            text: data.text || 'PING!!!',
            caption: data.caption,
            time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: data.timestamp || now,
            isPing: data.type === 'PING',
            isBroadcast: !!data.isBroadcast,
            status: 'R',
          };
          msgs.push(newMsg);
          localStorage.setItem(storageKey, JSON.stringify(msgs));

          if (activeContactPin === partnerPin) {
            setActiveMessages((prev) => [...prev, newMsg]);
            sendReadACK(partnerPin);
          }

          if (data.type === 'PING') {
            playPingSound();
            triggerScreenShake();
            showToast('PING!!!', `PING dari ${contactObj.customNickname || contactObj.name}`, true);
          } else {
            playMessageSound(notifSound);
            showToast(contactObj.customNickname || contactObj.name, data.text);
          }

          if (document.hidden) {
            showWebNotification(contactObj.customNickname || contactObj.name, data.text || 'PING!!!');
            startTitleBlink(contactObj.customNickname || contactObj.name);
          }

          // Anti-loop auto reply
          const isAutoReplyText = data.text?.startsWith('[Auto-Reply]');
          if (
            myPresence !== 'online' &&
            activeContactPin !== partnerPin &&
            data.type !== 'PING' &&
            !isAutoReplyText &&
            !data.isBroadcast
          ) {
            triggerAutoReply(partnerPin);
          }
        }
      }
    },
    [
      contacts,
      myPin,
      activeContactPin,
      myPresence,
      notifSound,
      pushLog,
      closeCallSession,
      showToast,
      loadStories,
      sendReadACK,
      triggerAutoReply,
      triggerScreenShake,
    ]
  );

  // Incoming Group Dual-Pipe Message Handler (MQTT + Firebase)
  const handleIncomingGroupMessage = useCallback(
    (topic: string, data: any) => {
      if (!data || !data.type) return;
      const groupId = data.groupId || topic.split('/')[2];
      if (!groupId) return;

      if (data.sender && data.timestamp) {
        const dedupeKey = `group_${groupId}_${data.sender}_${data.timestamp}_${data.text || ''}`;
        if (processedMessageIdsRef.current.has(dedupeKey)) {
          return;
        }
        processedMessageIdsRef.current.add(dedupeKey);
      }

      pushLog(`GROUP [${data.type}] in ${groupId} from ${data.sender}`);

      if (data.type === 'GROUP_INVITE' && data.group) {
        setGroups((prev) => {
          if (prev.some((g) => g.id === data.group.id)) return prev;
          const updated = [...prev, data.group];
          localStorage.setItem('chatzz_groups', JSON.stringify(updated));
          return updated;
        });
        if (mqttClientRef.current?.connected) {
          mqttClientRef.current.subscribe(`chatzz/group/${data.group.id}/room`, { qos: 1 });
        }
        showToast('Grup Baru Ditambahkan', `Kamu bergabung ke grup ${data.group.name}.`);
        return;
      }

      if (data.type === 'GROUP_NAME_UPDATE') {
        setGroups((prev) => {
          const updated = prev.map((g) => (g.id === groupId ? { ...g, name: data.newName } : g));
          localStorage.setItem('chatzz_groups', JSON.stringify(updated));
          return updated;
        });
        setActiveGroup((prev) => (prev && prev.id === groupId ? { ...prev, name: data.newName } : prev));
        return;
      }

      if (data.type === 'GROUP_MEMBER_UPDATE') {
        setGroups((prev) => {
          const updated = prev.map((g) => (g.id === groupId ? { ...g, members: data.members } : g));
          localStorage.setItem('chatzz_groups', JSON.stringify(updated));
          return updated;
        });
        setActiveGroup((prev) => (prev && prev.id === groupId ? { ...prev, members: data.members } : prev));
        return;
      }

      if (data.type === 'GROUP_REACTION') {
        const storageKey = `chatzz_group_msg_${groupId}`;
        let msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        let updated = false;

        msgs = msgs.map((m) => {
          if (m.timestamp === data.messageTimestamp) {
            updated = true;
            const currentReactions: Record<string, string[]> = m.reactions ? { ...m.reactions } : {};
            const userList = currentReactions[data.emoji] ? [...currentReactions[data.emoji]] : [];
            if (userList.includes(data.sender)) {
              currentReactions[data.emoji] = userList.filter((p) => p !== data.sender);
            } else {
              currentReactions[data.emoji] = [...userList, data.sender];
            }
            return { ...m, reactions: currentReactions };
          }
          return m;
        });

        if (updated) {
          localStorage.setItem(storageKey, JSON.stringify(msgs));
          if (activeGroup && activeGroup.id === groupId) {
            setActiveGroupMessages(msgs);
          }
        }
        return;
      }

      if (data.type === 'GROUP_CHAT' || data.type === 'GROUP_PING') {
        if (data.sender === myPin) return;

        const storageKey = `chatzz_group_msg_${groupId}`;
        const msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');

        if (!msgs.some((m) => m.timestamp === data.timestamp)) {
          const newMsg: Message = {
            sender: data.sender,
            senderName: data.senderName,
            groupId,
            text: data.text || 'PING!!!',
            caption: data.caption,
            time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: data.timestamp || Date.now(),
            isPing: data.type === 'GROUP_PING',
            status: 'R',
          };
          msgs.push(newMsg);
          localStorage.setItem(storageKey, JSON.stringify(msgs));

          if (activeGroup && activeGroup.id === groupId) {
            setActiveGroupMessages((prev) => [...prev, newMsg]);
          }

          if (data.type === 'GROUP_PING') {
            playPingSound();
            triggerScreenShake();
            showToast('PING GRUP!!!', `PING dari ${data.senderName || data.sender} di grup ${data.groupName || ''}`, true);
          } else {
            playMessageSound(notifSound);
            showToast(data.groupName || 'Grup Chatzz', `${data.senderName || data.sender}: ${data.text}`);
          }

          if (document.hidden) {
            showWebNotification(
              data.groupName ? `[${data.groupName}] ${data.senderName || data.sender}` : (data.senderName || data.sender),
              data.text || 'PING!!!'
            );
            startTitleBlink(data.groupName || data.senderName || 'Grup');
          }
        }
      }
    },
    [myPin, activeGroup, notifSound, pushLog, showToast, triggerScreenShake]
  );

  // Incoming Retained Mailbox Message Handler (Syncs offline messages when coming back online)
  const handleMailboxMessage = useCallback(
    (topic: string, data: any) => {
      // Clear retained message immediately from broker so it is not redelivered next time
      if (mqttClientRef.current?.connected) {
        mqttClientRef.current.publish(topic, '', { retain: true, qos: 1 });
      }

      if (!data || !data.type) return;
      pushLog(`MAILBOX SYNC: [${data.type}] from ${data.sender || 'unknown'}`);

      if (
        data.type === 'GROUP_CHAT' ||
        data.type === 'GROUP_PING' ||
        data.type === 'GROUP_INVITE' ||
        data.type === 'GROUP_REACTION'
      ) {
        handleIncomingGroupMessage(topic, data);
      } else {
        handleIncomingMessage(data);
      }
    },
    [handleIncomingGroupMessage, handleIncomingMessage, pushLog]
  );

  // Maintain current state and callbacks in refs so MQTT listener never uses stale closures or drops connection
  const stateRef = useRef({
    myPin,
    myName,
    myPresence,
    notifSound,
    contacts,
    groups,
    activeContactPin,
    activeGroup,
  });

  useEffect(() => {
    stateRef.current = {
      myPin,
      myName,
      myPresence,
      notifSound,
      contacts,
      groups,
      activeContactPin,
      activeGroup,
    };
  });

  const callbacksRef = useRef({
    handleCenterCommand,
    handleMailboxMessage,
    handleIncomingGroupMessage,
    handleIncomingMessage,
  });

  useEffect(() => {
    callbacksRef.current = {
      handleCenterCommand,
      handleMailboxMessage,
      handleIncomingGroupMessage,
      handleIncomingMessage,
    };
  });

  // Dynamic Group Subscription (subscribes to new rooms without reconnecting MQTT)
  useEffect(() => {
    if (mqttClientRef.current?.connected) {
      groups.forEach((g) => {
        mqttClientRef.current?.subscribe(`chatzz/group/${g.id}/room`, { qos: 1 });
      });
    }
  }, [groups]);

  // Firebase Realtime Database Dual-Pipe Background Sync Listener
  useEffect(() => {
    if (!myPin) return;

    // Listen to personal cloud mailbox (pulls messages when reopening tab/app)
    const unsubInbox = listenFirebaseInbox(myPin, (data) => {
      if (!data) return;
      if (
        data.type === 'GROUP_CHAT' ||
        data.type === 'GROUP_PING' ||
        data.type === 'GROUP_INVITE' ||
        data.type === 'GROUP_REACTION'
      ) {
        const gId = data.groupId || (data.group && data.group.id);
        if (gId) {
          callbacksRef.current.handleIncomingGroupMessage(`chatzz/group/${gId}/room`, data);
        }
      } else {
        callbacksRef.current.handleIncomingMessage(data);
      }
    });

    // Listen to partner typing over Firebase Realtime Database
    const unsubTyping = listenFirebaseTyping(myPin, (senderPin, isTyping) => {
      if (stateRef.current.activeContactPin === senderPin) {
        setIsPartnerTyping(isTyping);
      }
    });

    return () => {
      unsubInbox();
      unsubTyping();
    };
  }, [myPin]);

  // Initialize Persistent MQTT (connects once on mount and stays active)
  useEffect(() => {
    const brokerUrl = 'wss://broker.emqx.io:8084/mqtt';
    const savedDeviceId =
      localStorage.getItem('chatzz_device_id') ||
      (() => {
        const d = Math.random().toString(36).substring(2, 9);
        localStorage.setItem('chatzz_device_id', d);
        return d;
      })();
    const clientId = 'chatzz_' + myPin + '_' + savedDeviceId;
    const client = mqtt.connect(brokerUrl, {
      clientId,
      keepalive: 60,
      clean: true,
      reconnectPeriod: 2000,
      connectTimeout: 10000,
    });
    mqttClientRef.current = client;

    client.on('connect', () => {
      setMqttStatus('connected');
      setMqttStatusText('Connected (WSS 8084)');
      pushLog('MQTT Connected to EMQX WSS Port 8084');

      // Subscribe to personal inbox and multi-level persistent mailbox
      client.subscribe(`chatzz/user/${myPin}/inbox`, { qos: 1 });
      client.subscribe(`chatzz/mailbox/${myPin}/+`, { qos: 1 });
      client.subscribe(`chatzz/mailbox/${myPin}/#`, { qos: 1 });
      client.subscribe('chatzz/presence/+', { qos: 1 });
      client.subscribe('chatzz/center/control/broadcast', { qos: 0 });
      client.subscribe(`chatzz/center/control/${myPin}`, { qos: 0 });

      // Wildcard group room listener & specific groups
      client.subscribe('chatzz/group/+/room', { qos: 1 });
      stateRef.current.groups.forEach((g) => {
        client.subscribe(`chatzz/group/${g.id}/room`, { qos: 1 });
      });

      // Broadcast ONLINE presence sync
      client.publish(
        `chatzz/presence/${myPin}`,
        JSON.stringify({
          type: 'ONLINE_SYNC',
          sender: myPin,
          name: stateRef.current.myName,
          timestamp: Date.now(),
        }),
        { qos: 1 }
      );

      // Flush offline pending outbox if any
      try {
        const outbox: Array<{ targetPin: string; payload: any; now: number }> = JSON.parse(
          localStorage.getItem('chatzz_pending_outbox') || '[]'
        );
        if (outbox.length > 0) {
          outbox.forEach((item) => {
            client.publish(`chatzz/user/${item.targetPin}/inbox`, JSON.stringify(item.payload), {
              qos: 1,
            });
            client.publish(
              `chatzz/mailbox/${item.targetPin}/msg_${item.now}_${myPin}`,
              JSON.stringify(item.payload),
              { qos: 1, retain: true }
            );
            client.publish(
              `chatzz/mailbox/${item.targetPin}/latest_${myPin}`,
              JSON.stringify(item.payload),
              { qos: 1, retain: true }
            );
          });
          localStorage.removeItem('chatzz_pending_outbox');
          pushLog(`Flushed ${outbox.length} pending outbox messages.`);
        }
      } catch {
        // ignore outbox error
      }
    });

    client.on('reconnect', () => {
      setMqttStatus('connecting');
      setMqttStatusText('Reconnecting...');
    });

    client.on('error', (err) => {
      setMqttStatus('error');
      setMqttStatusText('WSS Error');
      pushLog(`MQTT Error: ${err.message}`);
    });

    client.on('message', (topic, payload) => {
      try {
        if (!payload || payload.length === 0) return;
        const payloadStr = payload.toString().trim();
        if (!payloadStr) return;
        const data = JSON.parse(payloadStr);

        if (topic.startsWith('chatzz/presence/')) {
          if (data.type === 'ONLINE_SYNC' && data.sender && data.sender !== myPin) {
            // A contact just came online! Resend any unacknowledged messages with status 'S'
            try {
              const storageKey = `chatzz_msg_${[myPin, data.sender].sort().join('_')}`;
              const msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
              const unacked = msgs.filter((m) => m.sender === myPin && m.status === 'S');
              if (unacked.length > 0) {
                unacked.forEach((m) => {
                  const retryPayload = {
                    type: 'CHAT',
                    sender: myPin,
                    senderName: stateRef.current.myName,
                    text: m.text,
                    caption: m.caption,
                    time: m.time,
                    timestamp: m.timestamp,
                  };
                  client.publish(`chatzz/user/${data.sender}/inbox`, JSON.stringify(retryPayload), {
                    qos: 1,
                  });
                  client.publish(
                    `chatzz/mailbox/${data.sender}/latest_${myPin}`,
                    JSON.stringify(retryPayload),
                    { qos: 1, retain: true }
                  );
                });
              }
            } catch {}
          }
          return;
        }

        if (topic.includes('chatzz/center/control/')) {
          callbacksRef.current.handleCenterCommand(data);
        } else if (topic.startsWith(`chatzz/mailbox/${myPin}/`)) {
          callbacksRef.current.handleMailboxMessage(topic, data);
        } else if (topic.startsWith('chatzz/group/')) {
          callbacksRef.current.handleIncomingGroupMessage(topic, data);
        } else {
          callbacksRef.current.handleIncomingMessage(data);
        }
      } catch (e: any) {
        pushLog(`Parse error on topic ${topic}: ${e.message}`);
      }
    });

    return () => {
      client.end();
    };
  }, [myPin, pushLog]);

  // Periodic Check for Scheduled Messages
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const scheduledList: ScheduledMessage[] = JSON.parse(
          localStorage.getItem('chatzz_scheduled_msgs') || '[]'
        );
        if (scheduledList.length === 0) return;

        const now = Date.now();
        const remaining: ScheduledMessage[] = [];

        scheduledList.forEach((item) => {
          if (now >= item.targetTime) {
            const timeStr = new Date(now).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const payload = {
              type: 'CHAT',
              sender: myPin,
              senderName: myName,
              text: item.text,
              time: timeStr,
              timestamp: now,
            };

            const targetContact = contacts.find((c) => c.pin === item.targetPin);
            const isBlocked = targetContact && targetContact.isBlocked;
            const messageStatus: 'S' | 'NS' = isBlocked ? 'NS' : 'S';

            const storageKey = `chatzz_msg_${[myPin, item.targetPin].sort().join('_')}`;
            const msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const newMsg: Message = {
              sender: myPin,
              text: item.text,
              time: timeStr,
              timestamp: now,
              isPing: false,
              status: messageStatus,
            };
            msgs.push(newMsg);
            localStorage.setItem(storageKey, JSON.stringify(msgs));

            if (!isBlocked && mqttClientRef.current?.connected) {
              mqttClientRef.current.publish(
                `chatzz/user/${item.targetPin}/inbox`,
                JSON.stringify(payload),
                { qos: 1 }
              );
            }
            showToast('Pesan Terjadwal', isBlocked ? 'Kontak diblokir (NS)' : 'Pesan terkirim otomatis.');
            if (activeContactPin === item.targetPin) {
              setActiveMessages((prev) => [...prev, newMsg]);
            }
          } else {
            remaining.push(item);
          }
        });

        localStorage.setItem('chatzz_scheduled_msgs', JSON.stringify(remaining));
      } catch {
        // ignore error
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [myPin, myName, contacts, activeContactPin, showToast]);

  // Copy PIN
  const handleCopyMyPin = () => {
    navigator.clipboard.writeText(myPin).then(() => {
      showToast('PIN Disalin', `PIN ${myPin} disalin.`);
    });
  };

  // Add Contact
  const handleAddContact = (pin: string) => {
    if (pin === myPin) {
      showToast('Gagal Menambah', 'Tidak bisa menambah PIN milik sendiri!');
      return;
    }
    if (contacts.some((c) => c.pin === pin)) {
      showToast('Kontak Sudah Ada', `PIN ${pin} sudah tersimpan di kontak.`);
      return;
    }
    const newContact: Contact = {
      pin,
      name: `User_${pin.substring(2, 6)}`,
      customNickname: '',
      lastActivity: Date.now(),
      isBlocked: false,
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
    localStorage.setItem('chatzz_user_contacts', JSON.stringify(updated));
    setIsAddModalOpen(false);
    showToast('Kontak Ditambahkan', `PIN ${pin} disimpan.`);
  };

  // Delete Contact
  const handleDeleteContact = (pin: string) => {
    setContactToDelete(pin);
  };

  const confirmDeleteContact = () => {
    if (!contactToDelete) return;
    const pin = contactToDelete;
    const updated = contacts.filter((c) => c.pin !== pin);
    setContacts(updated);
    localStorage.setItem('chatzz_user_contacts', JSON.stringify(updated));
    if (activeContactPin === pin) {
      setActiveContactPin(null);
    }
    showToast('Kontak Dihapus', `PIN ${pin} berhasil dihapus.`);
    setContactToDelete(null);
  };

  // Toggle Pinned Contact
  const handleTogglePinContact = (pin: string) => {
    const updated = contacts.map((c) =>
      c.pin === pin ? { ...c, isPinned: !c.isPinned } : c
    );
    setContacts(updated);
    localStorage.setItem('chatzz_user_contacts', JSON.stringify(updated));
  };

  // Save Nickname
  const handleSaveNickname = (pin: string, newNickname: string) => {
    const updated = contacts.map((c) =>
      c.pin === pin ? { ...c, customNickname: newNickname } : c
    );
    setContacts(updated);
    localStorage.setItem('chatzz_user_contacts', JSON.stringify(updated));
    showToast('Nama Diperbarui', 'Nama panggilan kontak berhasil disimpan.');
  };

  // Save Profile
  const handleSaveProfile = (name: string, status: string, presence: Presence) => {
    setMyName(name);
    setMyStatus(status);
    setMyPresence(presence);
    localStorage.setItem('chatzz_user_name', name);
    localStorage.setItem('chatzz_user_status', status);
    localStorage.setItem('chatzz_user_presence', presence);
    setIsProfileModalOpen(false);
  };

  // Create Group Room
  const handleCreateGroup = (name: string, memberPins: string[]) => {
    const newGroup: GroupRoom = {
      id: `GRP_${Date.now()}`,
      name,
      members: [myPin, ...memberPins],
      createdAt: Date.now(),
      creatorPin: myPin,
    };
    const updated = [...groups, newGroup];
    setGroups(updated);
    localStorage.setItem('chatzz_groups', JSON.stringify(updated));

    if (mqttClientRef.current?.connected) {
      mqttClientRef.current.subscribe(`chatzz/group/${newGroup.id}/room`, { qos: 1 });
      memberPins.forEach((targetPin) => {
        const invitePayload = {
          type: 'GROUP_INVITE',
          group: newGroup,
          invitedBy: myPin,
          timestamp: Date.now(),
        };
        mqttClientRef.current?.publish(
          `chatzz/user/${targetPin}/inbox`,
          JSON.stringify(invitePayload),
          { qos: 1 }
        );
        mqttClientRef.current?.publish(
          `chatzz/mailbox/${targetPin}/invite_${newGroup.id}`,
          JSON.stringify(invitePayload),
          { qos: 1, retain: true }
        );
      });
    }

    showToast('Grup Dibuat', `Grup ${name} berhasil dibuat dengan ${memberPins.length} anggota.`);
    setActiveContactPin(null);
    setActiveGroup(newGroup);
    setActiveGroupMessages([]);
  };

  // Group Chat Message Actions
  const handleSendGroupMessage = (text: string, caption?: string) => {
    if (!activeGroup) return;
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      sender: myPin,
      senderName: myName,
      groupId: activeGroup.id,
      text,
      caption,
      time: timeStr,
      timestamp: now,
      status: 'S',
    };

    const storageKey = `chatzz_group_msg_${activeGroup.id}`;
    const msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    msgs.push(newMsg);
    localStorage.setItem(storageKey, JSON.stringify(msgs));
    setActiveGroupMessages((prev) => [...prev, newMsg]);

    const payload = {
      type: 'GROUP_CHAT',
      groupId: activeGroup.id,
      groupName: activeGroup.name,
      sender: myPin,
      senderName: myName,
      text,
      caption,
      time: timeStr,
      timestamp: now,
    };

    if (mqttClientRef.current?.connected) {
      mqttClientRef.current.publish(`chatzz/group/${activeGroup.id}/room`, JSON.stringify(payload), {
        qos: 1,
      });

      // Retained mailbox for offline delivery to all group members
      activeGroup.members.forEach((memberPin) => {
        if (memberPin !== myPin) {
          mqttClientRef.current?.publish(
            `chatzz/mailbox/${memberPin}/grp_${activeGroup.id}_${now}`,
            JSON.stringify(payload),
            { qos: 1, retain: true }
          );
        }
      });
    }

    // Dual-pipe Firebase cloud delivery for group messages
    sendFirebaseGroupMessage(activeGroup.id, payload);
    activeGroup.members.forEach((memberPin) => {
      if (memberPin !== myPin) {
        sendFirebaseDirectMessage(memberPin, payload);
      }
    });
  };

  const handleSendGroupPing = () => {
    if (!activeGroup) return;
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      sender: myPin,
      senderName: myName,
      groupId: activeGroup.id,
      text: 'PING!!!',
      time: timeStr,
      timestamp: now,
      isPing: true,
      status: 'S',
    };

    const storageKey = `chatzz_group_msg_${activeGroup.id}`;
    const msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    msgs.push(newMsg);
    localStorage.setItem(storageKey, JSON.stringify(msgs));
    setActiveGroupMessages((prev) => [...prev, newMsg]);

    const payload = {
      type: 'GROUP_PING',
      groupId: activeGroup.id,
      groupName: activeGroup.name,
      sender: myPin,
      senderName: myName,
      text: 'PING!!!',
      time: timeStr,
      timestamp: now,
    };

    if (mqttClientRef.current?.connected) {
      mqttClientRef.current.publish(`chatzz/group/${activeGroup.id}/room`, JSON.stringify(payload), {
        qos: 1,
      });

      activeGroup.members.forEach((memberPin) => {
        if (memberPin !== myPin) {
          mqttClientRef.current?.publish(
            `chatzz/mailbox/${memberPin}/grp_${activeGroup.id}_${now}`,
            JSON.stringify(payload),
            { qos: 1, retain: true }
          );
        }
      });
    }

    // Dual-pipe Firebase cloud delivery for group pings
    sendFirebaseGroupMessage(activeGroup.id, payload);
    activeGroup.members.forEach((memberPin) => {
      if (memberPin !== myPin) {
        sendFirebaseDirectMessage(memberPin, payload);
      }
    });

    playPingSound();
    triggerScreenShake();
  };

  const handleGroupToggleStar = (timestamp: number) => {
    if (!activeGroup) return;
    const storageKey = `chatzz_group_msg_${activeGroup.id}`;
    const msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    let isNowStarred = false;

    const updated = msgs.map((m) => {
      if (m.timestamp === timestamp) {
        isNowStarred = !m.isStarred;
        return { ...m, isStarred: isNowStarred };
      }
      return m;
    });

    localStorage.setItem(storageKey, JSON.stringify(updated));
    setActiveGroupMessages(updated);
    showToast(
      isNowStarred ? 'Pesan Berbintang' : 'Bintang Dihapus',
      isNowStarred ? 'Pesan disimpan di pesan berbintang.' : 'Tanda bintang dihapus.'
    );
  };

  const handleGroupToggleReaction = (timestamp: number, emoji: string) => {
    if (!activeGroup) return;
    const storageKey = `chatzz_group_msg_${activeGroup.id}`;
    let msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    let updated = false;

    msgs = msgs.map((m) => {
      if (m.timestamp === timestamp) {
        updated = true;
        const currentReactions: Record<string, string[]> = m.reactions ? { ...m.reactions } : {};
        const userList = currentReactions[emoji] ? [...currentReactions[emoji]] : [];

        if (userList.includes(myPin)) {
          currentReactions[emoji] = userList.filter((p) => p !== myPin);
        } else {
          currentReactions[emoji] = [...userList, myPin];
        }
        return { ...m, reactions: currentReactions };
      }
      return m;
    });

    if (updated) {
      localStorage.setItem(storageKey, JSON.stringify(msgs));
      setActiveGroupMessages(msgs);

      if (mqttClientRef.current?.connected) {
        mqttClientRef.current.publish(
          `chatzz/group/${activeGroup.id}/room`,
          JSON.stringify({
            type: 'GROUP_REACTION',
            groupId: activeGroup.id,
            sender: myPin,
            messageTimestamp: timestamp,
            emoji,
          }),
          { qos: 1 }
        );
      }
    }
  };

  const handleGroupDeleteMessageForMe = (timestamp: number) => {
    if (!activeGroup) return;
    const storageKey = `chatzz_group_msg_${activeGroup.id}`;
    let msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    msgs = msgs.filter((m) => m.timestamp !== timestamp);
    localStorage.setItem(storageKey, JSON.stringify(msgs));
    setActiveGroupMessages(msgs);
    showToast('Pesan Dihapus', 'Pesan grup dihapus dari riwayat lokal.');
  };

  const handleClearGroupHistory = () => {
    if (!activeGroup) return;
    localStorage.removeItem(`chatzz_group_msg_${activeGroup.id}`);
    setActiveGroupMessages([]);
    showToast('Riwayat Grup Dikosongkan', 'Semua pesan di grup ini telah dibersihkan.');
  };

  const handleUpdateGroupName = (groupId: string, newName: string) => {
    const updated = groups.map((g) => (g.id === groupId ? { ...g, name: newName } : g));
    setGroups(updated);
    localStorage.setItem('chatzz_groups', JSON.stringify(updated));
    if (activeGroup && activeGroup.id === groupId) {
      setActiveGroup({ ...activeGroup, name: newName });
    }
    if (mqttClientRef.current?.connected) {
      mqttClientRef.current.publish(
        `chatzz/group/${groupId}/room`,
        JSON.stringify({ type: 'GROUP_NAME_UPDATE', groupId, newName }),
        { qos: 1 }
      );
    }
    showToast('Nama Grup Diperbarui', `Nama grup diubah menjadi ${newName}.`);
  };

  const handleAddMembersToGroup = (groupId: string, newPins: string[]) => {
    const existingGroup = groups.find((g) => g.id === groupId);
    if (!existingGroup) return;

    const newMembers = Array.from(new Set([...existingGroup.members, ...newPins]));
    const updatedGroup: GroupRoom = { ...existingGroup, members: newMembers };
    const updated = groups.map((g) => (g.id === groupId ? updatedGroup : g));

    setGroups(updated);
    localStorage.setItem('chatzz_groups', JSON.stringify(updated));

    if (activeGroup && activeGroup.id === groupId) {
      setActiveGroup(updatedGroup);
    }
    if (mqttClientRef.current?.connected) {
      mqttClientRef.current.publish(
        `chatzz/group/${groupId}/room`,
        JSON.stringify({ type: 'GROUP_MEMBER_UPDATE', groupId, members: updatedGroup.members }),
        { qos: 1 }
      );
      newPins.forEach((pin) => {
        const invitePayload = {
          type: 'GROUP_INVITE',
          group: updatedGroup,
          invitedBy: myPin,
          timestamp: Date.now(),
        };
        mqttClientRef.current?.publish(`chatzz/user/${pin}/inbox`, JSON.stringify(invitePayload), {
          qos: 1,
        });
        mqttClientRef.current?.publish(
          `chatzz/mailbox/${pin}/invite_${groupId}`,
          JSON.stringify(invitePayload),
          { qos: 1, retain: true }
        );
      });
    }
    showToast('Anggota Ditambahkan', `${newPins.length} anggota baru berhasil ditambahkan.`);
  };

  const handleRemoveMemberFromGroup = (groupId: string, pinToRemove: string) => {
    const updated = groups.map((g) => {
      if (g.id === groupId) {
        return { ...g, members: g.members.filter((p) => p !== pinToRemove) };
      }
      return g;
    });
    setGroups(updated);
    localStorage.setItem('chatzz_groups', JSON.stringify(updated));
    if (activeGroup && activeGroup.id === groupId) {
      setActiveGroup({ ...activeGroup, members: activeGroup.members.filter((p) => p !== pinToRemove) });
    }
    if (mqttClientRef.current?.connected) {
      mqttClientRef.current.publish(
        `chatzz/group/${groupId}/room`,
        JSON.stringify({
          type: 'GROUP_MEMBER_UPDATE',
          groupId,
          members: updated.find((g) => g.id === groupId)?.members || [],
        }),
        { qos: 1 }
      );
    }
    showToast('Anggota Dikeluarkan', `PIN ${pinToRemove} telah dikeluarkan dari grup.`);
  };

  const handleLeaveGroup = (groupId: string) => {
    const updated = groups.filter((g) => g.id !== groupId);
    setGroups(updated);
    localStorage.setItem('chatzz_groups', JSON.stringify(updated));
    if (activeGroup && activeGroup.id === groupId) {
      setActiveGroup(null);
      setActiveGroupMessages([]);
    }
    showToast('Keluar dari Grup', 'Kamu telah keluar dari grup.');
  };

  // Open 1-on-1 Contact Chat (mutually exclusive with group chat)
  const handleSelectContact = useCallback((contact: Contact) => {
    setActiveGroup(null);
    setActiveGroupMessages([]);
    setActiveContactPin(contact.pin);
    setIsPartnerTyping(false);
    sendReadACK(contact.pin);
  }, [sendReadACK]);

  // Open Group Chat (mutually exclusive with 1-on-1 contact chat)
  const handleSelectGroup = useCallback((group: GroupRoom) => {
    setActiveContactPin(null);
    setIsPartnerTyping(false);
    setActiveGroup(group);
    try {
      const groupMsgs: Message[] = JSON.parse(
        localStorage.getItem(`chatzz_group_msg_${group.id}`) || '[]'
      );
      setActiveGroupMessages(groupMsgs);
    } catch {
      setActiveGroupMessages([]);
    }
  }, []);

  // Block Contact
  const handleToggleBlock = () => {
    if (!activeContactPin) return;
    const updated = contacts.map((c) => {
      if (c.pin === activeContactPin) {
        const nextBlocked = !c.isBlocked;
        showToast(
          nextBlocked ? 'Kontak Diblokir' : 'Blokir Dibuka',
          `Kontak ${c.customNickname || c.name} ${nextBlocked ? 'diblokir.' : 'dibuka.'}`
        );
        return { ...c, isBlocked: nextBlocked };
      }
      return c;
    });
    setContacts(updated);
    localStorage.setItem('chatzz_user_contacts', JSON.stringify(updated));
  };

  // Send Message
  const handleSendMessage = (text: string, isBroadcast = false, caption?: string) => {
    if (!activeContactPin) return;
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const targetContact = contacts.find((c) => c.pin === activeContactPin);
    const isBlocked = targetContact && targetContact.isBlocked;
    const messageStatus: 'S' | 'NS' = isBlocked ? 'NS' : 'S';

    const payload = {
      type: 'CHAT',
      sender: myPin,
      senderName: myName,
      text,
      caption,
      time: timeStr,
      timestamp: now,
      isBroadcast,
    };

    const storageKey = `chatzz_msg_${[myPin, activeContactPin].sort().join('_')}`;
    const msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const newMsg: Message = {
      sender: myPin,
      text,
      caption,
      time: timeStr,
      timestamp: now,
      isPing: false,
      isBroadcast,
      status: messageStatus,
    };
    msgs.push(newMsg);
    localStorage.setItem(storageKey, JSON.stringify(msgs));
    setActiveMessages((prev) => [...prev, newMsg]);

    if (!isBlocked && mqttClientRef.current?.connected) {
      mqttClientRef.current.publish(`chatzz/user/${activeContactPin}/inbox`, JSON.stringify(payload), {
        qos: 1,
      });
      // Multi-layer persistent mailbox for offline delivery
      mqttClientRef.current.publish(
        `chatzz/mailbox/${activeContactPin}/msg_${now}_${myPin}`,
        JSON.stringify(payload),
        { qos: 1, retain: true }
      );
      mqttClientRef.current.publish(
        `chatzz/mailbox/${activeContactPin}/latest_${myPin}`,
        JSON.stringify(payload),
        { qos: 1, retain: true }
      );
    } else if (!isBlocked && !mqttClientRef.current?.connected) {
      // Offline outbox queue
      try {
        const outbox = JSON.parse(localStorage.getItem('chatzz_pending_outbox') || '[]');
        outbox.push({ targetPin: activeContactPin, payload, now });
        localStorage.setItem('chatzz_pending_outbox', JSON.stringify(outbox));
        showToast('Tersimpan di Outbox', 'Pesan akan terkirim otomatis saat koneksi terhubung.');
      } catch {}
    } else if (isBlocked) {
      showToast('Gagal', 'Kontak diblokir (NS).', true);
    }

    if (!isBlocked) {
      // Dual-pipe Firebase cloud delivery (reliably stored and pushed even if receiver's tab is closed)
      sendFirebaseDirectMessage(activeContactPin, payload);
    }

    if (targetContact) {
      const updated = contacts.map((c) =>
        c.pin === activeContactPin ? { ...c, lastActivity: now } : c
      );
      setContacts(updated);
      localStorage.setItem('chatzz_user_contacts', JSON.stringify(updated));
    }
  };

  // Delete message for everyone (Unsend)
  const handleDeleteMessageForEveryone = (timestamp: number) => {
    if (!activeContactPin) return;
    const storageKey = `chatzz_msg_${[myPin, activeContactPin].sort().join('_')}`;
    let msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');

    msgs = msgs.map((m) =>
      m.timestamp === timestamp ? { ...m, deletedForEveryone: true } : m
    );
    localStorage.setItem(storageKey, JSON.stringify(msgs));
    setActiveMessages(msgs);

    if (mqttClientRef.current?.connected) {
      mqttClientRef.current.publish(
        `chatzz/user/${activeContactPin}/inbox`,
        JSON.stringify({
          type: 'DELETE_MSG',
          sender: myPin,
          messageTimestamp: timestamp,
        }),
        { qos: 1 }
      );
    }
    showToast('Pesan Ditarik', 'Pesan ditarik untuk semua orang.');
  };

  // Delete message for me only
  const handleDeleteMessageForMe = (timestamp: number) => {
    if (!activeContactPin) return;
    const storageKey = `chatzz_msg_${[myPin, activeContactPin].sort().join('_')}`;
    let msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    msgs = msgs.filter((m) => m.timestamp !== timestamp);
    localStorage.setItem(storageKey, JSON.stringify(msgs));
    setActiveMessages(msgs);
    showToast('Pesan Dihapus', 'Pesan dihapus dari riwayat lokal.');
  };

  // Send typing status (Dual pipe: MQTT + Firebase)
  const handleSendTypingStatus = (isTyping: boolean) => {
    if (!activeContactPin) return;
    if (mqttClientRef.current?.connected) {
      mqttClientRef.current.publish(
        `chatzz/user/${activeContactPin}/inbox`,
        JSON.stringify({
          type: 'TYPING',
          sender: myPin,
          isTyping,
        }),
        { qos: 0 }
      );
    }
    sendFirebaseTyping(activeContactPin, myPin, isTyping);
  };

  // Send Broadcast (BC)
  const handleSendBroadcast = (text: string) => {
    const unblockedContacts = contacts.filter((c) => !c.isBlocked);
    if (unblockedContacts.length === 0) {
      showToast('Pesan Siaran Gagal', 'Tidak ada kontak aktif untuk dikirim.');
      return;
    }

    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const bcText = text.startsWith('[BC]:') ? text : `[BC]: ${text}`;

    unblockedContacts.forEach((contact) => {
      const payload = {
        type: 'CHAT',
        sender: myPin,
        senderName: myName,
        text: bcText,
        time: timeStr,
        timestamp: now,
        isBroadcast: true,
      };

      const storageKey = `chatzz_msg_${[myPin, contact.pin].sort().join('_')}`;
      const msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const newMsg: Message = {
        sender: myPin,
        text: bcText,
        time: timeStr,
        timestamp: now,
        isPing: false,
        isBroadcast: true,
        status: 'S',
      };
      msgs.push(newMsg);
      localStorage.setItem(storageKey, JSON.stringify(msgs));

      if (mqttClientRef.current?.connected) {
        mqttClientRef.current.publish(
          `chatzz/user/${contact.pin}/inbox`,
          JSON.stringify(payload),
          { qos: 1 }
        );
        mqttClientRef.current.publish(
          `chatzz/mailbox/${contact.pin}/msg_${now}_${myPin}`,
          JSON.stringify(payload),
          { qos: 1, retain: true }
        );
      }

      // Dual pipe Firebase cloud delivery
      sendFirebaseDirectMessage(contact.pin, payload);
    });

    if (activeContactPin) {
      loadActiveMessages();
    }

    setIsBroadcastModalOpen(false);
    showToast('Pesan Siaran Terkirim', `BC berhasil dikirim ke ${unblockedContacts.length} kontak.`);
  };

  // Toggle Star
  const handleToggleStar = (timestamp: number) => {
    if (!activeContactPin) return;
    const storageKey = `chatzz_msg_${[myPin, activeContactPin].sort().join('_')}`;
    const msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    let isNowStarred = false;

    const updated = msgs.map((m) => {
      if (m.timestamp === timestamp) {
        isNowStarred = !m.isStarred;
        return { ...m, isStarred: isNowStarred };
      }
      return m;
    });

    localStorage.setItem(storageKey, JSON.stringify(updated));
    setActiveMessages(updated);
    showToast(
      isNowStarred ? 'Pesan Berbintang' : 'Bintang Dihapus',
      isNowStarred ? 'Pesan disimpan di pesan berbintang.' : 'Tanda bintang dihapus.'
    );
  };

  // Toggle Reaction
  const handleToggleReaction = (timestamp: number, emoji: string) => {
    if (!activeContactPin) return;
    const storageKey = `chatzz_msg_${[myPin, activeContactPin].sort().join('_')}`;
    let msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    let updated = false;

    msgs = msgs.map((m) => {
      if (m.timestamp === timestamp) {
        updated = true;
        const currentReactions: Record<string, string[]> = m.reactions ? { ...m.reactions } : {};
        const userList = currentReactions[emoji] ? [...currentReactions[emoji]] : [];

        if (userList.includes(myPin)) {
          currentReactions[emoji] = userList.filter((p) => p !== myPin);
        } else {
          currentReactions[emoji] = [...userList, myPin];
        }
        return { ...m, reactions: currentReactions };
      }
      return m;
    });

    if (updated) {
      localStorage.setItem(storageKey, JSON.stringify(msgs));
      setActiveMessages(msgs);

      if (mqttClientRef.current?.connected) {
        mqttClientRef.current.publish(
          `chatzz/user/${activeContactPin}/inbox`,
          JSON.stringify({
            type: 'REACTION',
            sender: myPin,
            senderName: myName,
            messageTimestamp: timestamp,
            emoji,
          }),
          { qos: 1 }
        );
      }
    }
  };

  // Send PING
  const handleSendPing = () => {
    if (!activeContactPin) return;
    const targetContact = contacts.find((c) => c.pin === activeContactPin);
    if (targetContact && targetContact.isBlocked) {
      showToast('Gagal', 'Kontak diblokir.', true);
      return;
    }

    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const payload = {
      type: 'PING',
      sender: myPin,
      senderName: myName,
      text: 'PING!!!',
      time: timeStr,
      timestamp: now,
    };

    const storageKey = `chatzz_msg_${[myPin, activeContactPin].sort().join('_')}`;
    const msgs: Message[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const newMsg: Message = {
      sender: myPin,
      text: 'PING!!!',
      time: timeStr,
      timestamp: now,
      isPing: true,
      status: 'S',
    };
    msgs.push(newMsg);
    localStorage.setItem(storageKey, JSON.stringify(msgs));
    setActiveMessages((prev) => [...prev, newMsg]);

    if (mqttClientRef.current?.connected) {
      mqttClientRef.current.publish(`chatzz/user/${activeContactPin}/inbox`, JSON.stringify(payload), {
        qos: 1,
      });
      // Retained mailbox delivery for offline contact
      mqttClientRef.current.publish(
        `chatzz/mailbox/${activeContactPin}/msg_${now}_${myPin}`,
        JSON.stringify(payload),
        { qos: 1, retain: true }
      );
    }

    // Dual-pipe Firebase cloud delivery
    sendFirebaseDirectMessage(activeContactPin, payload);

    playPingSound();
    triggerScreenShake();
  };

  // Save Scheduled Message
  const handleSaveScheduled = (timeVal: string, text: string) => {
    if (!activeContactPin) return;
    const targetTime = new Date(timeVal).getTime();
    const scheduledList: ScheduledMessage[] = JSON.parse(
      localStorage.getItem('chatzz_scheduled_msgs') || '[]'
    );
    scheduledList.push({
      targetPin: activeContactPin,
      text,
      targetTime,
      timeStr: new Date(targetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    localStorage.setItem('chatzz_scheduled_msgs', JSON.stringify(scheduledList));
    setIsScheduleModalOpen(false);
    showToast('Berhasil Dijadwalkan', 'Pesan akan terkirim otomatis pada waktu yang ditentukan.');
  };

  // Publish Story
  const handlePublishStory = (text: string) => {
    const now = Date.now();
    const storyObj: Story = {
      sender: myPin,
      senderName: myName,
      text,
      timestamp: now,
      expiresAt: now + 23 * 60 * 60 * 1000,
    };
    const myStories: Story[] = JSON.parse(localStorage.getItem('chatzz_my_stories') || '[]');
    myStories.push(storyObj);
    localStorage.setItem('chatzz_my_stories', JSON.stringify(myStories));
    setIsStoryModalOpen(false);
    loadStories();
    showToast('Status Diposting', 'Status aktif 23 jam.');

    if (mqttClientRef.current?.connected) {
      contacts.forEach((c) => {
        mqttClientRef.current?.publish(
          `chatzz/user/${c.pin}/inbox`,
          JSON.stringify({ type: 'STORY_SHARE', ...storyObj }),
          { qos: 0 }
        );
      });
    }
  };

  // Export Backup
  const handleExportBackup = () => {
    const backupData: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) backupData[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatzz_backup_${myPin}.json`;
    a.click();
    showToast('Backup Selesai', 'File backup `.json` diunduh.');
  };

  // Clear Cache
  const handleClearCache = () => {
    setIsClearCacheConfirmOpen(true);
  };

  const confirmClearCache = () => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('chatzz_msg_') || k.startsWith('chatzz_group_msg_'))) {
        localStorage.removeItem(k);
      }
    }
    setActiveMessages([]);
    setActiveGroupMessages([]);
    showToast('Cache Dibersihkan', 'Riwayat chat dan grup dikosongkan.');
    setIsClearCacheConfirmOpen(false);
  };

  // Voice Call Actions
  const handleStartVoiceCall = async () => {
    if (!activeContactPin) return;
    const targetContact = contacts.find((c) => c.pin === activeContactPin);
    if (targetContact && targetContact.isBlocked) {
      showToast('Panggilan Ditolak', 'Kontak ini sedang diblokir.');
      return;
    }

    callPartnerPinRef.current = activeContactPin;
    setCallerTitle('Memanggil...');
    setCallerSubtitle(`PIN: ${activeContactPin}`);
    setIsIncomingCall(false);
    setIsCallModalOpen(true);
    startCallTimer();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      const pc = createPeerConnection(activeContactPin);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (mqttClientRef.current?.connected) {
        mqttClientRef.current.publish(
          `chatzz/user/${activeContactPin}/inbox`,
          JSON.stringify({
            type: 'WEBRTC_OFFER',
            sender: myPin,
            senderName: myName,
            offer,
          }),
          { qos: 1 }
        );
      }
    } catch {
      showToast('Panggilan Gagal', 'Akses mikrofon ditolak atau tidak tersedia.');
      closeCallSession();
    }
  };

  const handleAcceptCall = async () => {
    if (!callPartnerPinRef.current || !incomingOfferRef.current) return;
    setIsIncomingCall(false);
    setCallerTitle('Terhubung');
    startCallTimer();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      const pc = createPeerConnection(callPartnerPinRef.current);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOfferRef.current));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (mqttClientRef.current?.connected) {
        mqttClientRef.current.publish(
          `chatzz/user/${callPartnerPinRef.current}/inbox`,
          JSON.stringify({
            type: 'WEBRTC_ANSWER',
            sender: myPin,
            answer,
          }),
          { qos: 1 }
        );
      }
    } catch {
      closeCallSession();
    }
  };

  const handleRejectCall = () => {
    if (callPartnerPinRef.current && mqttClientRef.current?.connected) {
      mqttClientRef.current.publish(
        `chatzz/user/${callPartnerPinRef.current}/inbox`,
        JSON.stringify({ type: 'CALL_END', sender: myPin }),
        { qos: 1 }
      );
    }
    closeCallSession();
  };

  const handleEndCall = () => {
    if (callPartnerPinRef.current && mqttClientRef.current?.connected) {
      mqttClientRef.current.publish(
        `chatzz/user/${callPartnerPinRef.current}/inbox`,
        JSON.stringify({ type: 'CALL_END', sender: myPin }),
        { qos: 1 }
      );
    }
    closeCallSession();
  };

  const handleToggleMute = () => {
    if (!localStreamRef.current) return;
    const nextMuted = !isMicMuted;
    localStreamRef.current.getAudioTracks()[0].enabled = !nextMuted;
    setIsMicMuted(nextMuted);
  };

  const handleToggleSpeaker = () => {
    const nextSpeaker = !isSpeakerOn;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = nextSpeaker ? 1.0 : 0.2;
    }
    setIsSpeakerOn(nextSpeaker);
  };

  const activeContact = contacts.find((c) => c.pin === activeContactPin);

  // Compute stats
  const totalMessagesCount = activeMessages.length;
  const totalPingsCount = activeMessages.filter((m) => m.isPing).length;
  const totalVoiceNotesCount = activeMessages.filter((m) => m.text.startsWith('[AUDIO]:')).length;

  return (
    <>
      <div className="chatzz-bg-watermark">chatzz.com</div>

      {/* App Passcode Lock Screen */}
      {isAppLocked && (
        <PasscodeModal
          isOpen={isAppLocked}
          savedPasscode={passcode}
          onClose={() => {}}
          onSuccess={() => setIsAppLocked(false)}
        />
      )}

      {/* Passcode Setup Modal */}
      {isSettingUpPasscode && (
        <PasscodeModal
          isOpen={isSettingUpPasscode}
          isSettingUp={true}
          savedPasscode=""
          onClose={() => setIsSettingUpPasscode(false)}
          onSuccess={(newCode) => {
            if (newCode) {
              setPasscode(newCode);
              localStorage.setItem('chatzz_passcode', newCode);
              showToast('Kunci Sandi Diaktifkan', 'Aplikasi diamankan dengan 4-digit PIN.');
            } else {
              setPasscode('');
              localStorage.removeItem('chatzz_passcode');
              showToast('Kunci Sandi Dihapus', 'Aplikasi tidak lagi menggunakan PIN kunci.');
            }
            setIsSettingUpPasscode(false);
          }}
        />
      )}

      <div
        id="jelly-app"
        className={`jelly-window theme-${theme} ${isShaking ? 'shake-active' : ''}`}
      >
        {/* Persistent Shutdown / Maintenance Overlay */}
        <MaintenanceOverlay isOpen={isMaintenance} />

        {/* Booting Progress Screen */}
        {isBooting && <BootScreen onComplete={() => setIsBooting(false)} />}

        {/* Window Header */}
        <Header
          pin={myPin}
          onCopyPin={handleCopyMyPin}
          onOpenQr={() => setIsQrScannerOpen(true)}
          onOpenBroadcast={() => setIsBroadcastModalOpen(true)}
          onOpenGlobal={() => setIsGlobalOpen(true)}
          onOpenStory={() => setIsStoryModalOpen(true)}
          onOpenTools={() => setIsToolsModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {/* Screen: Contacts List (with top search, pinned contacts, avatar, now playing, and groups) */}
          <ContactsScreen
            myPin={myPin}
            name={myName}
            statusText={myStatus}
            presence={myPresence}
            avatarId={avatarId}
            nowPlaying={nowPlaying}
            stories={stories}
            contacts={contacts}
            groups={groups}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenAvatarPicker={() => setIsAvatarPickerOpen(true)}
            onOpenNowPlaying={() => setIsNowPlayingModalOpen(true)}
            onOpenQr={() => setIsQrScannerOpen(true)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenBroadcast={() => setIsBroadcastModalOpen(true)}
            onOpenCreateGroup={() => setIsGroupModalOpen(true)}
            onSelectContact={handleSelectContact}
            onSelectGroup={handleSelectGroup}
            onDeleteContact={handleDeleteContact}
            onTogglePinContact={handleTogglePinContact}
            onEditNickname={(pin, current) => setEditingContact({ pin, current })}
            onViewStory={(s) => setViewingStory(s)}
          />

          {/* Screen: Private Chat (mutually exclusive with group chat) */}
          {activeContact && !activeGroup && (
            <ChatScreen
              myPin={myPin}
              contact={activeContact}
              messages={activeMessages}
              isPartnerTyping={isPartnerTyping}
              onBack={() => {
                setActiveContactPin(null);
                setIsPartnerTyping(false);
              }}
              onToggleBlock={handleToggleBlock}
              onStartVoiceCall={handleStartVoiceCall}
              onSendPing={handleSendPing}
              onSendMessage={handleSendMessage}
              onToggleStar={handleToggleStar}
              onToggleReaction={handleToggleReaction}
              onDeleteMessageForEveryone={handleDeleteMessageForEveryone}
              onDeleteMessageForMe={handleDeleteMessageForMe}
              onSendTypingStatus={handleSendTypingStatus}
              onOpenSchedule={() => setIsScheduleModalOpen(true)}
              onOpenImage={(src) => setPreviewImage(src)}
              onShowToast={showToast}
            />
          )}

          {/* Screen: Group Chat */}
          {activeGroup && (
            <GroupChatScreen
              myPin={myPin}
              myName={myName}
              group={activeGroup}
              contacts={contacts}
              messages={activeGroupMessages}
              onBack={() => {
                setActiveGroup(null);
                setActiveGroupMessages([]);
              }}
              onSendMessage={handleSendGroupMessage}
              onSendPing={handleSendGroupPing}
              onToggleStar={handleGroupToggleStar}
              onToggleReaction={handleGroupToggleReaction}
              onDeleteMessageForMe={handleGroupDeleteMessageForMe}
              onClearGroupHistory={handleClearGroupHistory}
              onUpdateGroupName={handleUpdateGroupName}
              onAddMembers={handleAddMembersToGroup}
              onRemoveMember={handleRemoveMemberFromGroup}
              onLeaveGroup={handleLeaveGroup}
              onSelectDirectContact={(c) => {
                setActiveGroup(null);
                setActiveGroupMessages([]);
                handleSelectContact(c);
              }}
              onOpenImage={(src) => setPreviewImage(src)}
              onShowToast={showToast}
              onCopyPin={(pin) => {
                navigator.clipboard.writeText(pin).then(() => {
                  showToast('PIN Disalin', `PIN ${pin} disalin.`);
                });
              }}
            />
          )}

          {/* Screen: Global Chat (Closed) */}
          {isGlobalOpen && <GlobalChatScreen onClose={() => setIsGlobalOpen(false)} />}
        </div>
      </div>

      {/* Voice Call Screen Modal */}
      <VoiceCallModal
        isOpen={isCallModalOpen}
        isIncoming={isIncomingCall}
        callerTitle={callerTitle}
        callerSubtitle={callerSubtitle}
        callSeconds={callSeconds}
        isMuted={isMicMuted}
        isSpeakerOn={isSpeakerOn}
        remoteAudioRef={remoteAudioRef}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
        onEndCall={handleEndCall}
        onToggleMute={handleToggleMute}
        onToggleSpeaker={handleToggleSpeaker}
      />

      {/* Modals */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddContact={handleAddContact}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        currentName={myName}
        currentStatus={myStatus}
        currentPresence={myPresence}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
      />

      <StoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        onPublishStory={handlePublishStory}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSaveSchedule={handleSaveScheduled}
      />

      <ToolsModal
        isOpen={isToolsModalOpen}
        currentTheme={theme}
        hasPasscode={!!passcode}
        onClose={() => setIsToolsModalOpen(false)}
        onSelectTheme={handleSelectTheme}
        onOpenBroadcast={() => setIsBroadcastModalOpen(true)}
        onOpenQr={() => setIsQrScannerOpen(true)}
        onOpenGroupChat={() => setIsGroupModalOpen(true)}
        onOpenPasscodeSetup={() => setIsSettingUpPasscode(true)}
        onOpenSoundModal={() => setIsSoundModalOpen(true)}
        onOpenNowPlaying={() => setIsNowPlayingModalOpen(true)}
        onOpenAvatarPicker={() => setIsAvatarPickerOpen(true)}
        onOpenStats={() => setIsStatsModalOpen(true)}
        onExportBackup={handleExportBackup}
        onClearCache={handleClearCache}
        onOpenDebug={() => setIsDebugModalOpen(true)}
      />

      <DebugModal
        isOpen={isDebugModalOpen}
        logs={debugLogs}
        onClose={() => setIsDebugModalOpen(false)}
      />

      {/* Real QR Scanner & Generator Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        myPin={myPin}
        myName={myName}
        onClose={() => setIsQrScannerOpen(false)}
        onAddContact={handleAddContact}
        onCopyPin={handleCopyMyPin}
      />

      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        contactCount={contacts.filter((c) => !c.isBlocked).length}
        onClose={() => setIsBroadcastModalOpen(false)}
        onSendBroadcast={handleSendBroadcast}
      />

      <GroupChatModal
        isOpen={isGroupModalOpen}
        contacts={contacts.filter((c) => !c.isBlocked)}
        onClose={() => setIsGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />

      <NowPlayingModal
        isOpen={isNowPlayingModalOpen}
        currentSong={nowPlaying}
        onClose={() => setIsNowPlayingModalOpen(false)}
        onSave={handleSaveNowPlaying}
      />

      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        currentAvatar={avatarId}
        onClose={() => setIsAvatarPickerOpen(false)}
        onSelect={handleSelectAvatar}
      />

      <NotificationSoundModal
        isOpen={isSoundModalOpen}
        currentSound={notifSound}
        onClose={() => setIsSoundModalOpen(false)}
        onSelect={handleSelectSound}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        myPin={myPin}
        contactCount={contacts.length}
        totalMessages={totalMessagesCount}
        totalPings={totalPingsCount}
        totalVoiceNotes={totalVoiceNotesCount}
      />

      <NicknameModal
        isOpen={!!editingContact}
        pin={editingContact?.pin || ''}
        currentNickname={editingContact?.current || ''}
        onClose={() => setEditingContact(null)}
        onSave={handleSaveNickname}
      />

      <ImageModal src={previewImage} onClose={() => setPreviewImage(null)} />

      {/* Delete Contact Confirmation */}
      <ConfirmModal
        isOpen={!!contactToDelete}
        title="Hapus Kontak"
        message={`Apakah kamu yakin ingin menghapus kontak dengan PIN ${contactToDelete}? Riwayat chat lokal tetap tersimpan.`}
        confirmText="Hapus Kontak"
        cancelText="Batal"
        isDanger={true}
        onConfirm={confirmDeleteContact}
        onClose={() => setContactToDelete(null)}
      />

      {/* Clear Cache Confirmation */}
      <ConfirmModal
        isOpen={isClearCacheConfirmOpen}
        title="Bersihkan Cache & Riwayat"
        message="Apakah kamu yakin ingin menghapus seluruh riwayat percakapan lokal dari perangkat ini?"
        confirmText="Bersihkan Riwayat"
        cancelText="Batal"
        isDanger={true}
        onConfirm={confirmClearCache}
        onClose={() => setIsClearCacheConfirmOpen(false)}
      />

      {/* Story View Modal */}
      <StoryViewModal
        story={viewingStory}
        onClose={() => setViewingStory(null)}
      />

      {/* Toast Notification */}
      <Toast toast={toast} />
    </>
  );
}
