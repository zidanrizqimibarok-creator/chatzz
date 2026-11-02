import React, { useEffect, useRef } from 'react';

interface Props {
  isOpen: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  isMe?: boolean;
}

const POPULAR_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥', '👏', '🎉', '🙏', '💯'];

export const ReactionPicker: React.FC<Props> = ({ isOpen, onSelect, onClose, isMe }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute -top-10 ${
        isMe ? 'right-0' : 'left-0'
      } bg-white/95 backdrop-blur-md rounded-full px-2 py-1 shadow-xl border border-blue-200 flex items-center space-x-1 z-30 animate-fade-in`}
    >
      {POPULAR_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(emoji);
            onClose();
          }}
          className="hover:scale-130 active:scale-95 transition-transform text-base sm:text-lg p-1 rounded-full hover:bg-blue-50"
          title={`React ${emoji}`}
        >
          {emoji}
        </button>
      ))}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="text-slate-400 hover:text-slate-600 text-xs px-1"
        title="Tutup"
      >
        &times;
      </button>
    </div>
  );
};
