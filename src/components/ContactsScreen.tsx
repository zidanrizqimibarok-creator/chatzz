import React, { useState } from 'react';
import { Contact, Presence, Story, GroupRoom, Message } from '../types';
import { StoriesDrawer } from './StoriesDrawer';

interface Props {
  myPin?: string;
  name: string;
  statusText: string;
  presence: Presence;
  avatarId?: string;
  nowPlaying?: string;
  stories: Story[];
  contacts: Contact[];
  groups: GroupRoom[];
  onOpenProfile: () => void;
  onOpenAvatarPicker: () => void;
  onOpenNowPlaying: () => void;
  onOpenQr: () => void;
  onOpenAddModal: () => void;
  onOpenBroadcast: () => void;
  onOpenCreateGroup: () => void;
  onOpenRandomChat?: () => void;
  onOpenStoryModal?: () => void;
  onSelectContact: (contact: Contact) => void;
  onSelectGroup: (group: GroupRoom) => void;
  onDeleteContact: (pin: string) => void;
  onTogglePinContact: (pin: string) => void;
  onEditNickname: (pin: string, current: string) => void;
  onViewStory: (story: Story) => void;
}

export const ContactsScreen: React.FC<Props> = ({
  myPin,
  name,
  statusText,
  presence,
  avatarId = 'robot',
  nowPlaying,
  stories,
  contacts,
  groups,
  onOpenProfile,
  onOpenAvatarPicker,
  onOpenNowPlaying,
  onOpenQr,
  onOpenAddModal,
  onOpenBroadcast,
  onOpenCreateGroup,
  onOpenRandomChat,
  onOpenStoryModal,
  onSelectContact,
  onSelectGroup,
  onDeleteContact,
  onTogglePinContact,
  onEditNickname,
  onViewStory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'groups'>('all');
  const [isStoriesDrawerOpen, setIsStoriesDrawerOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const diff = touchStartY - e.changedTouches[0].clientY;
    // If swiped upward by more than 50px, open stories drawer
    if (diff > 50) {
      setIsStoriesDrawerOpen(true);
    }
    setTouchStartY(null);
  };

  // Search filtering
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const displayName = (c.customNickname || c.name).toLowerCase();
    return displayName.includes(q) || c.pin.toLowerCase().includes(q);
  });

  const filteredGroups = groups.filter((g) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return g.name.toLowerCase().includes(q);
  });

  const getContactPreview = (pin: string) => {
    if (!myPin) return { lastMessage: null, unreadCount: 0 };
    try {
      const key = `chatzz_msg_${[myPin, pin].sort().join('_')}`;
      const msgs: Message[] = JSON.parse(localStorage.getItem(key) || '[]');
      if (!msgs || msgs.length === 0) return { lastMessage: null, unreadCount: 0 };
      const last = msgs[msgs.length - 1];
      const unreadCount = msgs.filter((m) => m.sender === pin && m.status !== 'R').length;
      return { lastMessage: last, unreadCount };
    } catch {
      return { lastMessage: null, unreadCount: 0 };
    }
  };

  const getGroupPreview = (groupId: string) => {
    try {
      const key = `chatzz_group_msg_${groupId}`;
      const msgs: Message[] = JSON.parse(localStorage.getItem(key) || '[]');
      if (!msgs || msgs.length === 0) return { lastMessage: null, unreadCount: 0 };
      const last = msgs[msgs.length - 1];
      const unreadCount = msgs.filter((m) => m.sender !== myPin && m.status !== 'R').length;
      return { lastMessage: last, unreadCount };
    } catch {
      return { lastMessage: null, unreadCount: 0 };
    }
  };

  const renderSnippet = (m: Message | null) => {
    if (!m) return null;
    if (m.isPing) return <span className="text-red-500 font-semibold">🔔 PING!</span>;
    if (m.text.startsWith('[AUDIO]:')) {
      return <span className="text-blue-500 font-medium flex items-center gap-1"><i className="fa-solid fa-microphone text-[10px]"></i> Pesan Suara</span>;
    }
    if (m.text.startsWith('[IMG]:') || m.text.startsWith('[IMAGE]:')) {
      return (
        <span className="text-emerald-600 font-medium flex items-center gap-1">
          <i className="fa-solid fa-image text-[10px]"></i> Foto {m.caption ? `"${m.caption.substring(0, 15)}..."` : ''}
        </span>
      );
    }
    return <span>{m.text.length > 32 ? `${m.text.substring(0, 32)}...` : m.text}</span>;
  };

  // Sort pinned first, then by lastActivity
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.lastActivity || 0) - (a.lastActivity || 0);
  });

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden select-none">
      {/* Search Bar (WhatsApp/Telegram Style) */}
      <div className="p-3 pb-2 border-b border-slate-100 space-y-2.5">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <i className="fa-solid fa-magnifying-glass text-xs"></i>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari obrolan atau kontak..."
            className="w-full bg-slate-100 hover:bg-slate-150 focus:bg-white pl-9 pr-8 py-2 rounded-xl text-xs outline-none font-sans transition border border-transparent focus:border-blue-500 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 text-sm"
            >
              &times;
            </button>
          )}
        </div>

        {/* Filter Pills (WhatsApp/Telegram Segmented Controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition shrink-0 ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({contacts.length})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition shrink-0 ${
              filterType === 'unread'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Belum Dibaca
          </button>
          <button
            onClick={() => setFilterType('groups')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition shrink-0 ${
              filterType === 'groups'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Grup ({groups.length})
          </button>
        </div>
      </div>

      {/* Stories / Status Avatars Tray (WhatsApp/Telegram Stories) */}
      {stories.length > 0 && (
        <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-3 overflow-x-auto no-scrollbar">
          {stories.map((story) => (
            <div
              key={story.timestamp}
              onClick={() => onViewStory(story)}
              className="flex flex-col items-center gap-1 cursor-pointer shrink-0 group"
            >
              <div className="w-12 h-12 rounded-full p-[2px] ring-2 ring-emerald-500 hover:ring-emerald-400 transition">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {story.senderName.charAt(0).toUpperCase()}
                </div>
              </div>
              <span className="text-[10px] text-slate-600 group-hover:text-slate-900 font-medium truncate max-w-[54px] text-center">
                {story.senderName}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {/* Groups (if selected or in all) */}
        {(filterType === 'all' || filterType === 'groups') && filteredGroups.length > 0 && (
          <div className="bg-slate-50/50">
            {filteredGroups.map((group) => {
              const preview = getGroupPreview(group.id);
              return (
                <div
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className="flex items-center gap-3 px-3.5 py-3 hover:bg-blue-50/60 transition cursor-pointer group"
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                      <i className="fa-solid fa-users text-sm"></i>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-blue-600 transition">
                        {group.name}
                      </h4>
                      {preview.lastMessage && (
                        <span className="text-[10px] text-slate-400">
                          {preview.lastMessage.time}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-500 truncate pr-2">
                        {preview.lastMessage ? (
                          renderSnippet(preview.lastMessage)
                        ) : (
                          <span className="italic text-slate-400">Belum ada obrolan</span>
                        )}
                      </p>
                      {preview.unreadCount > 0 && (
                        <span className="bg-emerald-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-sm">
                          {preview.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Contacts */}
        {sortedContacts.length === 0 && filteredGroups.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center p-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <i className="fa-regular fa-comments text-2xl"></i>
            </div>
            <h4 className="font-bold text-sm text-slate-700">Belum Ada Obrolan</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
              Tambahkan kontak teman dengan PIN atau bagikan QR profil Anda untuk memulai chat.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              + Tambah Kontak Baru
            </button>
          </div>
        ) : (
          sortedContacts
            .filter((c) => {
              if (filterType === 'unread') {
                const prev = getContactPreview(c.pin);
                return prev.unreadCount > 0;
              }
              if (filterType === 'groups') return false;
              return true;
            })
            .map((contact) => {
              const displayName = contact.customNickname || contact.name;
              const preview = getContactPreview(contact.pin);

              return (
                <div
                  key={contact.pin}
                  onClick={() => onSelectContact(contact)}
                  className="flex items-center gap-3 px-3.5 py-3 hover:bg-blue-50/50 transition cursor-pointer group"
                >
                  {/* Modern Avatar with Live Online Status Badge */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-black/5">
                      {displayName.charAt(0).toUpperCase()}
                    </div>

                    {/* Automatic Live Online Indicator */}
                    {contact.isOnline ? (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center"
                        title="Sedang Online"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      </span>
                    ) : contact.lastSeen ? (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"
                        title="Offline"
                      />
                    ) : null}
                  </div>

                  {/* Contact Info & Snippet */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {contact.isPinned && (
                          <i className="fa-solid fa-thumbtack text-[10px] text-blue-600"></i>
                        )}
                        <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-blue-600 transition">
                          {displayName}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {preview.lastMessage && (
                          <span className="text-[10px] text-slate-400">
                            {preview.lastMessage.time}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate pr-2">
                        {/* Delivery Status Tick (WhatsApp / Telegram style) */}
                        {preview.lastMessage && preview.lastMessage.sender === myPin && (
                          <span
                            className={`text-xs ${
                              preview.lastMessage.status === 'R'
                                ? 'text-sky-500 font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            {preview.lastMessage.status === 'R' ? '✓✓' : '✓'}
                          </span>
                        )}
                        <span className="truncate">
                          {preview.lastMessage ? (
                            renderSnippet(preview.lastMessage)
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px]">
                              PIN: {contact.pin}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Unread Message Counter Badge */}
                      {preview.unreadCount > 0 && (
                        <span className="bg-emerald-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-sm">
                          {preview.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Dropdown Options (Pin / Edit Nickname / Delete) */}
                  <div
                    className="opacity-0 group-hover:opacity-100 transition flex items-center space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onTogglePinContact(contact.pin)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 text-[11px]"
                      title={contact.isPinned ? 'Lepas Sematan' : 'Sematkan di Atas'}
                    >
                      <i className="fa-solid fa-thumbtack"></i>
                    </button>
                    <button
                      onClick={() => onEditNickname(contact.pin, contact.customNickname || contact.name)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 text-[11px]"
                      title="Edit Nama Kontak"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      onClick={() => onDeleteContact(contact.pin)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 text-[11px]"
                      title="Hapus Kontak"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Swipe-Up Handle Bar for Gelembung Status / Stories */}
      <div
        onClick={() => setIsStoriesDrawerOpen(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="px-3 py-2 bg-gradient-to-r from-sky-50 via-purple-50 to-pink-50 hover:from-sky-100 hover:to-pink-100 border-t border-purple-100/80 flex items-center justify-between cursor-pointer group transition select-none shrink-0"
        title="Geser atau klik untuk membuka Gelembung Status Cerita"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></div>
          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700 flex items-center gap-1.5 transition">
            <i className="fa-solid fa-chevron-up text-[10px] text-purple-600 group-hover:-translate-y-0.5 transition-transform"></i>
            <span>Geser ke atas untuk melihat Status Cerita</span>
          </span>
        </div>
        <span className="text-[10px] text-purple-600 font-semibold bg-white/80 px-2 py-0.5 rounded-full border border-purple-200">
          {stories.length} Status
        </span>
      </div>

      {/* Modern Action Bar (New Group, Random Chat, New Chat) */}
      <div className="p-2.5 border-t border-slate-100 bg-white flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenCreateGroup}
          className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          title="Buat Grup Obrolan Baru"
        >
          <i className="fa-solid fa-users text-emerald-600 text-xs"></i>
          <span className="hidden sm:inline">Grup</span>
        </button>

        {onOpenRandomChat && (
          <button
            onClick={onOpenRandomChat}
            className="flex-1 py-2 px-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
            title="Temu Teman Random (Anonymous Chat)"
          >
            <i className="fa-solid fa-shuffle text-xs"></i>
            <span>Teman Random</span>
          </button>
        )}

        <button
          onClick={onOpenAddModal}
          className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 shrink-0"
          title="Tambah Kontak Baru via PIN"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Tambah</span>
        </button>
      </div>

      {/* Stories Gelembung Drawer */}
      <StoriesDrawer
        isOpen={isStoriesDrawerOpen}
        stories={stories}
        myPin={myPin}
        myName={name}
        onClose={() => setIsStoriesDrawerOpen(false)}
        onOpenAddStory={() => {
          setIsStoriesDrawerOpen(false);
          if (onOpenStoryModal) onOpenStoryModal();
        }}
        onViewStory={(s) => {
          setIsStoriesDrawerOpen(false);
          onViewStory(s);
        }}
      />
    </div>
  );
};
