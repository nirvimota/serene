import React, { useState, useEffect } from 'react';
import { Heart, Bell, Home, Calendar as CalendarIcon, BookOpen, GraduationCap, Moon, Sun, Share2 } from 'lucide-react';
import NotificationTray from './NotificationTray.jsx';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { key: 'journal', label: 'Journal', icon: BookOpen },
  { key: 'learn', label: 'Learn', icon: GraduationCap },
];

export default function TopNav({
  activeNav,
  onNavigate,
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  userInitial = 'S',
  onOpenProfile,
  onOpenShare,
}) {
  const [trayOpen, setTrayOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('serene_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('serene_theme', 'light');
    }
  };

  function handleBellClick() {
    setTrayOpen((prev) => !prev);
  }

  function handleTrayNavigate(page) {
    onNavigate?.(page);
    setTrayOpen(false);
  }

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

      {/* Right side: notifications + theme + share + avatar */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 relative">
        {/* Share Button */}
        <button
          onClick={onOpenShare}
          className="w-9 h-9 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200/60 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          title="Share Cycle Summary"
        >
          <Share2 size={15} />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200/60 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
        </button>

        {/* Bell button */}
        <button
          id="topnav-btn-notifications"
          onClick={handleBellClick}
          className="w-9 h-9 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200/60 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors cursor-pointer relative"
          title="Notifications"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          aria-expanded={trayOpen}
        >
          <Bell size={15} />
          {/* Badge — shows real unread count */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold font-mono flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification tray */}
        {trayOpen && (
          <NotificationTray
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={onMarkRead}
            onMarkAllRead={onMarkAllRead}
            onDismiss={onDismiss}
            onNavigate={handleTrayNavigate}
            onClose={() => setTrayOpen(false)}
          />
        )}

        {/* User avatar button */}
        <button
          onClick={onOpenProfile}
          id="topnav-btn-profile"
          className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-300 to-amber-300 hover:from-rose-400 hover:to-amber-400 flex items-center justify-center text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95 border border-white/60"
          title="Account Settings & Profile"
        >
          {userInitial}
        </button>
      </div>
    </header>
  );
}