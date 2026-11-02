import React, { useState } from 'react';
import { Contact, Presence, Story, GroupRoom, Message } from '../types';

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
  onSelectContact,
  onSelectGroup,
  onDeleteContact,
  onTogglePinContact,
  onEditNickname,
  onViewStory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'contacts' | 'groups'>('contacts');

  const gemClass =
    presence === 'online'
      ? 'gem-online'
      : presence === 'away'
      ? 'gem-away'
      : 'gem-busy';

  // Real-time filtering by name or PIN
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const displayName = (c.customNickname || c.name).toLowerCase();
    const pin = c.pin.toLowerCase();
    return displayName.includes(q) || pin.includes(q);
  });

  // Sort pinned contacts first, then by lastActivity
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.lastActivity || 0) - (a.lastActivity || 0);
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
    if (m.isPing) return <span className="text-red-500 font-bold">🚨 PING!!!</span>;
    if (m.text.startsWith('[AUDIO]:')) {
      return <span className="text-blue-600 font-semibold">🎤 Catatan Suara</span>;
    }
    if (m.text.startsWith('[IMG]:') || m.text.startsWith('[IMAGE]:')) {
      return (
        <span className="text-indigo-600 font-semibold">
          📷 Foto {m.caption ? `"${m.caption.substring(0, 15)}..."` : ''}
        </span>
      );
    }
    return <span>{m.text.length > 28 ? `${m.text.substring(0, 28)}...` : m.text}</span>;
  };

  return (
    <div className="flex-1 flex flex-col p-2.5 space-y-2 overflow-hidden">
      {/* 1. TOP SEARCH INPUT FIELD (Allows filtering contacts by name or PIN) */}
      <div className="relative z-10">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-blue-500">
          <i className="fa-solid fa-magnifying-glass text-xs"></i>
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari kontak berdasarkan Nama atau PIN..."
          className="w-full inset-panel pl-9 pr-8 py-2 rounded-2xl text-xs outline-none font-sans shadow-sm focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 text-sm font-bold"
          >
            &times;
          </button>
        )}
      </div>

      {/* 2. User Profile Card */}
      <div className="bg-white/90 backdrop-blur border border-white rounded-2xl p-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          {/* Avatar button */}
          <div
            onClick={onOpenAvatarPicker}
            className="relative cursor-pointer group shrink-0"
            title="Klik untuk Ganti Avatar Retro"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border-2 border-white shadow flex items-center justify-center text-white text-base">
              <i
                className={`fa-solid ${
                  avatarId === 'cat'
                    ? 'fa-cat'
                    : avatarId === 'gamepad'
                    ? 'fa-gamepad'
                    : avatarId === 'user-ninja'
                    ? 'fa-user-ninja'
                    : avatarId === 'rocket'
                    ? 'fa-rocket'
                    : avatarId === 'skull'
                    ? 'fa-skull'
                    : avatarId === 'headphones'
                    ? 'fa-headphones'
                    : avatarId === 'ghost'
                    ? 'fa-ghost'
                    : 'fa-robot'
                }`}
              ></i>
            </div>
            <span
              className={`status-gem ${gemClass} absolute bottom-0 right-0 border-2 border-white`}
            ></span>
          </div>

          <div className="truncate">
            <h3 className="font-bold text-xs text-slate-800 leading-tight truncate flex items-center gap-1">
              <span>{name || 'Pengguna Chatzz'}</span>
            </h3>
            <p className="text-[9px] text-slate-500 truncate mt-0.5">
              {statusText || 'Chatzzing...'}
            </p>

            {/* Now Playing Music Banner */}
            {nowPlaying ? (
              <div
                onClick={onOpenNowPlaying}
                className="inline-flex items-center gap-1 text-[8px] font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 px-1.5 py-0.2 rounded-full cursor-pointer mt-0.5 border border-pink-200"
                title="Status Musik Aktif - Klik untuk ubah"
              >
                <i className="fa-solid fa-music animate-pulse"></i>
                <span className="truncate max-w-[130px]">{nowPlaying}</span>
              </div>
            ) : (
              <button
                onClick={onOpenNowPlaying}
                className="text-[8px] text-slate-400 hover:text-pink-600 block mt-0.5"
              >
                + Pasang Musik (Now Playing)
              </button>
            )}
          </div>
        </div>

        {/* Profile & QR Quick Buttons */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={onOpenQr}
            className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold border border-slate-300 flex items-center gap-1 shadow-sm"
            title="Buka Scanner & Barcode PIN"
          >
            <i className="fa-solid fa-qrcode text-[9px] text-blue-600"></i>
            <span>Scan QR</span>
          </button>
          <button
            onClick={onOpenProfile}
            className="text-[9px] bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-lg font-bold border border-blue-300 shadow-sm"
          >
            Profil
          </button>
        </div>
      </div>

      {/* 3. Story / Status Feed Container */}
      <div className="bg-white/75 border border-white rounded-xl p-2 flex items-center space-x-2 overflow-x-auto shadow-inner">
        <span className="text-[9px] font-bold text-slate-500 shrink-0 flex items-center">
          <i className="fa-solid fa-bolt text-amber-500 mr-1"></i>Status:
        </span>
        <div className="flex items-center space-x-2">
          {stories.length === 0 ? (
            <span className="text-[9px] text-slate-400 italic">Tidak ada status</span>
          ) : (
            stories.map((s, idx) => (
              <div
                key={`${s.sender}_${s.timestamp}_${idx}`}
                onClick={() => onViewStory(s)}
                className="bg-blue-100 border border-blue-300 text-blue-800 px-2 py-1 rounded-xl text-[9px] font-bold shrink-0 cursor-pointer hover:bg-blue-200 transition"
                title={`${s.senderName}: ${s.text}`}
              >
                {s.senderName}: &quot;
                {s.text.length > 10 ? `${s.text.substring(0, 10)}...` : s.text}&quot;
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Action Row (Add Contact, Broadcast BC, Create Group) */}
      <div className="flex space-x-1.5">
        <button
          onClick={onOpenAddModal}
          className="btn-jelly flex-1 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
        >
          <i className="fa-solid fa-user-plus text-[10px]"></i>
          <span>Tambah PIN</span>
        </button>
        <button
          onClick={onOpenBroadcast}
          className="btn-purple-jelly px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow"
          title="Kirim Pesan Siaran (BC)"
        >
          <i className="fa-solid fa-tower-broadcast text-[10px]"></i>
          <span>BC</span>
        </button>
        <button
          onClick={onOpenCreateGroup}
          className="btn-success-jelly px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow"
          title="Buat Grup Baru"
        >
          <i className="fa-solid fa-users text-[10px]"></i>
          <span>Grup</span>
        </button>
      </div>

      {/* 5. Contact List / Group List Segment Tabs */}
      <div className="flex items-center justify-between px-1 text-[10px] font-bold text-slate-600">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`pb-0.5 border-b-2 transition ${
              activeTab === 'contacts'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            KONTAK ({filteredContacts.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`pb-0.5 border-b-2 transition ${
              activeTab === 'groups'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            GRUP ({filteredGroups.length})
          </button>
        </div>
      </div>

      {/* 6. List Area */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
        {activeTab === 'contacts' ? (
          sortedContacts.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-center p-4 text-slate-400">
              <i className="fa-solid fa-address-book text-2xl mb-1 text-slate-300"></i>
              <p className="text-xs">
                {searchQuery ? 'Kontak tidak ditemukan' : 'Belum ada kontak tersimpan'}
              </p>
            </div>
          ) : (
            sortedContacts.map((c) => {
              const displayName = c.customNickname || c.name;
              const { lastMessage, unreadCount } = getContactPreview(c.pin);
              const isSentByMe = lastMessage && lastMessage.sender === myPin;

              return (
                <div
                  key={c.pin}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectContact(c);
                  }}
                  className={`bg-white border rounded-xl p-2.5 flex items-center justify-between shadow-sm cursor-pointer hover:border-blue-400 transition ${
                    c.isPinned ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0 pr-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 relative">
                      {displayName.charAt(0).toUpperCase()}
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                      )}
                    </div>
                    <div className="truncate flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-800 truncate flex items-center gap-1">
                          <span>{displayName}</span>
                          {c.isPinned && (
                            <i className="fa-solid fa-thumbtack text-[9px] text-amber-500" title="Kontak Favorit Dipin"></i>
                          )}
                          {c.isBlocked && (
                            <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.2 rounded">
                              Diblokir
                            </span>
                          )}
                        </h4>
                        {lastMessage && (
                          <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-1">
                            {lastMessage.time}
                          </span>
                        )}
                      </div>

                      {/* Snippet / Last message preview */}
                      <div className="flex items-center justify-between mt-0.5">
                        <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                          {isSentByMe && (
                            <span
                              className={`text-[9px] font-mono font-bold ${
                                lastMessage.status === 'R'
                                  ? 'text-blue-600'
                                  : lastMessage.status === 'NS'
                                  ? 'text-red-500'
                                  : 'text-slate-400'
                              }`}
                              title={
                                lastMessage.status === 'R'
                                  ? 'Dibaca (R)'
                                  : lastMessage.status === 'NS'
                                  ? 'Gagal Kirim (NS)'
                                  : 'Terkirim (S)'
                              }
                            >
                              [{lastMessage.status || 'S'}]
                            </span>
                          )}
                          {lastMessage ? (
                            renderSnippet(lastMessage)
                          ) : (
                            <span className="text-[9px] font-mono text-slate-400">PIN: {c.pin}</span>
                          )}
                        </div>

                        {/* Unread badge */}
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 shadow-sm ml-1">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      {c.nowPlaying && (
                        <div className="text-pink-600 font-sans truncate font-bold text-[8px] mt-0.5">
                          🎵 {c.nowPlaying}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-1">
                    {/* Toggle Pin / Favorite button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePinContact(c.pin);
                      }}
                      className={`p-1 text-[10px] ${
                        c.isPinned ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
                      }`}
                      title={c.isPinned ? 'Lepas Pin' : 'Pin Kontak ke Atas'}
                    >
                      <i className="fa-solid fa-thumbtack"></i>
                    </button>
                    {/* Edit Nickname button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditNickname(c.pin, displayName);
                      }}
                      className="text-slate-400 hover:text-blue-600 p-1"
                      title="Ganti nama panggilan"
                    >
                      <i className="fa-solid fa-pen text-[10px]"></i>
                    </button>
                    {/* Delete contact */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteContact(c.pin);
                      }}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Hapus kontak"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* Groups tab */
          filteredGroups.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-center p-4 text-slate-400">
              <i className="fa-solid fa-users text-2xl mb-1 text-slate-300"></i>
              <p className="text-xs">Belum ada grup chat. Klik tombol &quot;Grup&quot; di atas untuk membuat.</p>
            </div>
          ) : (
            filteredGroups.map((g) => {
              const { lastMessage, unreadCount } = getGroupPreview(g.id);

              return (
                <div
                  key={g.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectGroup(g);
                  }}
                  className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between shadow-sm cursor-pointer hover:border-emerald-400 transition"
                >
                  <div className="flex items-center space-x-2.5 truncate flex-1 min-w-0 pr-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 relative">
                      <i className="fa-solid fa-users"></i>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
                      )}
                    </div>
                    <div className="truncate flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-800 truncate">{g.name}</h4>
                        {lastMessage && (
                          <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-1">
                            {lastMessage.time}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[9px] text-slate-500 truncate">
                          {lastMessage ? (
                            <span>
                              <span className="font-semibold text-slate-700">
                                {lastMessage.sender === myPin ? 'Kamu' : lastMessage.senderName || 'Member'}:
                              </span>{' '}
                              {renderSnippet(lastMessage)}
                            </span>
                          ) : (
                            `${g.members.length} Anggota Kontak`
                          )}
                        </span>
                        {unreadCount > 0 && (
                          <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 shadow-sm ml-1">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 ml-1">
                    Buka
                  </span>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
};
