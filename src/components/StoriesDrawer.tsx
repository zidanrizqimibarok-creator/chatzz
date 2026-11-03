import React, { useRef, useState } from 'react';
import { Story } from '../types';

interface Props {
  isOpen: boolean;
  stories: Story[];
  myPin?: string;
  myName?: string;
  onClose: () => void;
  onOpenAddStory: () => void;
  onViewStory: (story: Story) => void;
}

export const StoriesDrawer: React.FC<Props> = ({
  isOpen,
  stories,
  myPin,
  myName,
  onClose,
  onOpenAddStory,
  onViewStory,
}) => {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchEndY - touchStartY;
    // If swiped downwards by more than 50px, close drawer
    if (diff > 50) {
      onClose();
    }
    setTouchStartY(null);
  };

  const myStories = stories.filter((s) => s.sender === myPin);
  const contactStories = stories.filter((s) => s.sender !== myPin);

  return (
    <div
      className="absolute inset-0 bg-slate-950/70 backdrop-blur-md z-40 flex flex-col justify-end select-none animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-t-3xl shadow-2xl border-t border-slate-700/80 p-5 flex flex-col max-h-[85vh] transition-transform animate-slide-up"
      >
        {/* Swipe Down Handle */}
        <div
          onClick={onClose}
          className="flex flex-col items-center cursor-pointer group py-1 mb-3"
          title="Geser atau klik untuk kembali ke obrolan"
        >
          <div className="w-12 h-1.5 bg-slate-600 group-hover:bg-sky-400 rounded-full transition mb-2"></div>
          <span className="text-[11px] text-slate-400 group-hover:text-sky-300 font-semibold flex items-center gap-1.5 transition">
            <i className="fa-solid fa-chevron-down text-xs"></i>
            <span>Geser ke bawah untuk kembali ke obrolan</span>
          </span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 animate-pulse"></span>
              <span>Gelembung Status Cerita</span>
            </h2>
            <p className="text-[11px] text-slate-400">Ketuk gelembung untuk melihat status 24 jam</p>
          </div>
          <button
            onClick={onOpenAddStory}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>Buat Status</span>
          </button>
        </div>

        {/* Stories Bubbles Grid / Canvas */}
        <div className="overflow-y-auto max-h-[60vh] pr-1 py-2">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 p-2 justify-items-center">
            {/* User's Own Story Bubble */}
            <div
              onClick={() => {
                if (myStories.length > 0) {
                  onViewStory(myStories[0]);
                } else {
                  onOpenAddStory();
                }
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="relative">
                <div
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full p-[2.5px] transition shadow-lg ${
                    myStories.length > 0
                      ? 'bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-400 ring-2 ring-purple-400 animate-pulse'
                      : 'bg-slate-800 border-2 border-dashed border-slate-600 hover:border-sky-400'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-lg text-white">
                    {myName ? myName.charAt(0).toUpperCase() : 'A'}
                  </div>
                </div>
                {/* Plus button indicator */}
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-sky-500 border-2 border-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-md group-hover:scale-110 transition">
                  {myStories.length > 0 ? (
                    <i className="fa-solid fa-eye text-[10px]"></i>
                  ) : (
                    <i className="fa-solid fa-plus text-[10px]"></i>
                  )}
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-200 group-hover:text-white text-center">
                Status Saya
              </span>
              <span className="text-[10px] text-slate-400 text-center leading-none">
                {myStories.length > 0 ? `${myStories.length} aktif` : 'Bagikan cerita'}
              </span>
            </div>

            {/* Contacts Story Bubbles */}
            {contactStories.map((story) => (
              <div
                key={story.timestamp}
                onClick={() => onViewStory(story)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className="relative">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full p-[3px] bg-gradient-to-tr from-emerald-400 via-sky-400 to-blue-500 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-base text-sky-200">
                      {story.senderName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate max-w-[80px] text-center">
                  {story.senderName}
                </span>
                <span className="text-[10px] text-sky-400/80 truncate max-w-[80px] text-center font-sans">
                  {new Date(story.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          {contactStories.length === 0 && myStories.length === 0 && (
            <div className="text-center py-10 px-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3 text-2xl">
                <i className="fa-regular fa-circle-play"></i>
              </div>
              <h4 className="text-sm font-bold text-slate-300 mb-1">Belum Ada Status Cerita</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                Jadilah yang pertama membuat status! Cerita akan otomatis terhapus setelah 24 jam.
              </p>
              <button
                onClick={onOpenAddStory}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Posting Cerita Pertama
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
