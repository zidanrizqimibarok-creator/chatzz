import React, { useState } from 'react';
import { GroupRoom, Contact } from '../../types';

interface Props {
  isOpen: boolean;
  group: GroupRoom;
  myPin: string;
  contacts: Contact[];
  onClose: () => void;
  onUpdateGroupName: (groupId: string, newName: string) => void;
  onAddMembers: (groupId: string, newPins: string[]) => void;
  onRemoveMember: (groupId: string, pinToRemove: string) => void;
  onLeaveGroup: (groupId: string) => void;
  onSelectDirectChat: (pin: string) => void;
  onCopyPin: (pin: string) => void;
}

export const GroupInfoModal: React.FC<Props> = ({
  isOpen,
  group,
  myPin,
  contacts,
  onClose,
  onUpdateGroupName,
  onAddMembers,
  onRemoveMember,
  onLeaveGroup,
  onSelectDirectChat,
  onCopyPin,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameText, setEditNameText] = useState(group.name);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSaveName = () => {
    const trimmed = editNameText.trim();
    if (trimmed && trimmed !== group.name) {
      onUpdateGroupName(group.id, trimmed);
    }
    setIsEditingName(false);
  };

  // Contacts not yet in the group
  const availableContacts = contacts.filter((c) => !group.members.includes(c.pin));

  const toggleSelectAdd = (pin: string) => {
    if (selectedToAdd.includes(pin)) {
      setSelectedToAdd(selectedToAdd.filter((p) => p !== pin));
    } else {
      setSelectedToAdd([...selectedToAdd, pin]);
    }
  };

  const handleConfirmAddMembers = () => {
    if (selectedToAdd.length > 0) {
      onAddMembers(group.id, selectedToAdd);
      setSelectedToAdd([]);
      setIsAddingMember(false);
    }
  };

  const isCreator = group.creatorPin === myPin || group.members[0] === myPin;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl border border-white flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-base shadow-md">
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Info Grup</h3>
              <p className="text-[10px] text-slate-400">
                Dibuat {new Date(group.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
          >
            &times;
          </button>
        </div>

        {/* Group Name Editing */}
        <div className="my-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>NAMA GRUP</span>
            {!isEditingName && (
              <button
                onClick={() => {
                  setEditNameText(group.name);
                  setIsEditingName(true);
                }}
                className="text-blue-600 hover:text-blue-700 text-[10px] font-bold flex items-center gap-1"
              >
                <i className="fa-solid fa-pen text-[9px]"></i> Ubah
              </button>
            )}
          </div>
          {isEditingName ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editNameText}
                onChange={(e) => setEditNameText(e.target.value)}
                maxLength={30}
                className="flex-1 px-3 py-1 text-xs font-bold text-slate-800 bg-white border border-blue-400 rounded-xl outline-none"
              />
              <button
                onClick={handleSaveName}
                className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow"
              >
                Simpan
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="px-2 py-1 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
            </div>
          ) : (
            <h4 className="text-sm font-bold text-slate-800">{group.name}</h4>
          )}
        </div>

        {/* Members Header */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <i className="fa-solid fa-user-group text-slate-400 text-xs"></i>
            <span>Anggota ({group.members.length})</span>
          </div>
          <button
            onClick={() => setIsAddingMember(!isAddingMember)}
            className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm transition"
          >
            <i className="fa-solid fa-user-plus text-[10px]"></i>
            <span>{isAddingMember ? 'Tutup Pilihan' : 'Tambah Kontak'}</span>
          </button>
        </div>

        {/* Add Member inline selector */}
        {isAddingMember && (
          <div className="mb-3 p-2.5 bg-emerald-50/60 rounded-2xl border border-emerald-200">
            <div className="text-[10px] font-bold text-emerald-800 mb-1">
              Pilih kontak untuk ditambahkan:
            </div>
            {availableContacts.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic py-1">
                Semua kontak kamu sudah ada di grup ini.
              </p>
            ) : (
              <div className="max-h-28 overflow-y-auto space-y-1 mb-2 pr-0.5">
                {availableContacts.map((c) => {
                  const isSelected = selectedToAdd.includes(c.pin);
                  return (
                    <div
                      key={c.pin}
                      onClick={() => toggleSelectAdd(c.pin)}
                      className={`p-1.5 rounded-xl border flex items-center justify-between cursor-pointer text-xs transition ${
                        isSelected
                          ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <div className="truncate">
                        <span>{c.customNickname || c.name}</span>
                        <span className="text-[9px] text-slate-400 ml-1.5 font-mono">
                          ({c.pin})
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <i className="fa-solid fa-check"></i>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {selectedToAdd.length > 0 && (
              <button
                onClick={handleConfirmAddMembers}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition"
              >
                Tambahkan ({selectedToAdd.length}) Anggota
              </button>
            )}
          </div>
        )}

        {/* Members List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 mb-3 max-h-56">
          {group.members.map((pin, idx) => {
            const isMe = pin === myPin;
            const contact = contacts.find((c) => c.pin === pin);
            const displayName = isMe
              ? 'Kamu (Saya)'
              : contact
              ? contact.customNickname || contact.name
              : `Member ${pin.substring(2, 6)}`;
            const isMemberCreator = idx === 0 || pin === group.creatorPin;

            return (
              <div
                key={pin}
                className="p-2 bg-white rounded-2xl border border-slate-200 flex items-center justify-between hover:border-slate-300 shadow-sm"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm ${
                      isMe
                        ? 'bg-gradient-to-tr from-blue-500 to-indigo-600'
                        : isMemberCreator
                        ? 'bg-gradient-to-tr from-amber-500 to-orange-600'
                        : 'bg-gradient-to-tr from-slate-400 to-slate-600'
                    }`}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {displayName}
                      </span>
                      {isMemberCreator && (
                        <span className="text-[8px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                      <span>PIN: {pin}</span>
                      <button
                        onClick={() => onCopyPin(pin)}
                        className="hover:text-blue-600 text-[9px]"
                        title="Salin PIN"
                      >
                        <i className="fa-regular fa-copy"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  {!isMe && (
                    <button
                      onClick={() => {
                        onClose();
                        onSelectDirectChat(pin);
                      }}
                      className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-bold border border-blue-200 flex items-center gap-1"
                      title="Kirim pesan pribadi (1-on-1)"
                    >
                      <i className="fa-solid fa-comment-dots text-[9px]"></i>
                      <span>Chat</span>
                    </button>
                  )}
                  {/* Kick member if creator and not kicking self */}
                  {isCreator && !isMe && (
                    <button
                      onClick={() => onRemoveMember(group.id, pin)}
                      className="text-[10px] text-slate-400 hover:text-red-600 p-1 rounded-lg"
                      title="Keluarkan dari grup"
                    >
                      <i className="fa-solid fa-user-minus"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-200 flex gap-2">
          <button
            onClick={() => {
              onClose();
              onLeaveGroup(group.id);
            }}
            className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
            <span>Keluar dari Grup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
