// src/components/NotificationTray.jsx
//
// Glassmorphism slide-down notification panel.
// Renders inside the TopNav positioned below the bell button.
// Closes on outside click.

import React, { useEffect, useRef } from 'react';
import { X, CheckCheck, Bell, ExternalLink } from 'lucide-react';
import { NOTIFICATION_META } from '../utils/notificationContent';

// ── Relative time formatter ──────────────────────────────────────────────────
function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Single notification card ─────────────────────────────────────────────────
function NotifCard({ notif, onDismiss, onAction, onMarkRead }) {
  const meta = NOTIFICATION_META[notif.type] ?? NOTIFICATION_META.hydration;

  return (
    <div
      className={`relative flex gap-3 p-3.5 rounded-2xl border-l-[3px] transition-all duration-200 ${meta.bgClass} ${meta.colorClass} ${notif.read ? 'opacity-70' : 'opacity-100'}`}
      onClick={() => onMarkRead(notif.id)}
      role="article"
      aria-label={notif.title}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span className="absolute top-3 right-8 w-1.5 h-1.5 rounded-full bg-rose-500" />
      )}

      {/* Emoji icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg bg-white/70 shadow-sm border border-white/60`}>
        {meta.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
          <span className={meta.iconColor}>{meta.label}</span>
          <span className="text-stone-300">·</span>
          <span>{relativeTime(notif.time)}</span>
        </p>
        <p className="text-sm font-semibold text-stone-800 leading-tight mb-1">{notif.title}</p>
        <p className="text-xs text-stone-500 leading-relaxed">{notif.body}</p>

        {/* Action link */}
        {notif.actionLabel && onAction && (
          <button
            onClick={(e) => { e.stopPropagation(); onAction(notif); }}
            className={`mt-2 inline-flex items-center gap-1 text-[11px] font-mono font-bold ${meta.iconColor} hover:underline cursor-pointer`}
          >
            {notif.actionLabel}
            <ExternalLink size={10} />
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
        id={`notif-dismiss-${notif.id}`}
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-stone-300 hover:text-stone-600 hover:bg-white/70 transition-colors cursor-pointer self-start mt-0.5"
        aria-label={`Dismiss: ${notif.title}`}
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ── Main tray ────────────────────────────────────────────────────────────────
export default function NotificationTray({
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onNavigate,
  onClose,
}) {
  const trayRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (trayRef.current && !trayRef.current.contains(e.target)) {
        onClose?.();
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [onClose]);

  function handleAction(notif) {
    if (notif.actionNav) onNavigate?.(notif.actionNav);
    onMarkRead?.(notif.id);
    onClose?.();
  }

  return (
    <div
      ref={trayRef}
      id="notification-tray-panel"
      className="absolute top-full right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-stone-200/60 bg-white/90 backdrop-blur-xl shadow-2xl shadow-stone-200/50 z-[100] overflow-hidden"
      style={{ animation: 'tray-slide-down 0.2s ease-out' }}
    >

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-rose-400" />
          <span className="text-sm font-bold text-stone-800 font-sans">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-mono font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              id="notif-mark-all-read"
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-[11px] font-mono text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
          )}
          <button
            id="notif-tray-close"
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center text-stone-300 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="p-3 flex flex-col gap-2 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-stone-200">
        {notifications.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl">
              ✨
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-stone-700">You're all caught up</p>
              <p className="text-xs text-stone-400 mt-0.5">No new notifications right now</p>
            </div>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotifCard
              key={notif.id}
              notif={notif}
              onDismiss={onDismiss}
              onAction={handleAction}
              onMarkRead={onMarkRead}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-stone-100 bg-stone-50/50">
          <p className="text-[10px] font-mono text-stone-400 text-center">
            Notifications update on each app session · Powered by your cycle data
          </p>
        </div>
      )}
    </div>
  );
}
