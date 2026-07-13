import React from 'react';
import { Heart, Bell, Home, Calendar as CalendarIcon, BookOpen, GraduationCap } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { key: 'journal', label: 'Journal', icon: BookOpen },
  { key: 'learn', label: 'Learn', icon: GraduationCap },
];

export default function TopNav({ activeNav, onNavigate }) {
  return (
    <header
      id="app-top-nav"
      className="sticky top-0 left-0 w-full z-50 border-b border-stone-200/40 bg-white/60 backdrop-blur-md px-6 py-3.5 flex items-center justify-between"
    >
      {/* Logo */}
      <div
        className="flex items-center space-x-3 cursor-pointer shrink-0"
        onClick={() => onNavigate('home')}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-amber-400 p-[1px] shadow-sm flex items-center justify-center">
          <div className="w-full h-full rounded-md bg-white flex items-center justify-center">
            <Heart size={14} className="text-rose-500" />
          </div>
        </div>
        <span className="font-sans text-lg tracking-[0.2em] font-bold text-stone-900 hidden sm:inline">
          Serene
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex items-center space-x-1 sm:space-x-2 bg-stone-50/70 border border-stone-200/50 rounded-2xl p-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = activeNav === key;
          return (
            <button
              key={key}
              id={`topnav-btn-${key}`}
              onClick={() => onNavigate(key)}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon size={14} />
              <span className="hidden md:inline">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right side: notifications + avatar */}
      <div className="flex items-center space-x-3 shrink-0">
        <button
          id="topnav-btn-notifications"
          className="w-9 h-9 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200/60 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors cursor-pointer relative"
          title="Notifications"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </button>

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-300 to-amber-300 flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer">
          E
        </div>
      </div>
    </header>
  );
}