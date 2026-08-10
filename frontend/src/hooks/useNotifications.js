// src/hooks/useNotifications.js
//
// Computes smart in-app notifications from real cycle prediction data.
// Persists "read/dismissed" state to localStorage (keyed by userId).
// Optionally fires browser Notification API for tab-active push.
//
// Returns:
//   notifications     — sorted array of active notification objects
//   unreadCount       — number not yet read or dismissed
//   markRead(id)      — mark a single notification as read
//   markAllRead()     — mark all as read
//   dismiss(id)       — permanently remove from list
//   requestBrowserPermission() — call to trigger the permission prompt
//   browserPermission — 'default' | 'granted' | 'denied'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCyclePredictions, getDayInfo, stripTime } from '../utils/cycleUtils';
import {
  FOOD_TIPS_BY_PHASE,
  HYDRATION_TIPS,
  getTipOfDay,
} from '../utils/notificationContent';

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(date) {
  if (!date) return null;
  const now = stripTime(new Date());
  const target = stripTime(new Date(date));
  return Math.round((target - now) / 86400000);
}

function makeNotification({ id, type, title, body, priority = 5, actionLabel = null, actionNav = null }) {
  return { id, type, title, body, priority, actionLabel, actionNav, read: false, dismissed: false, time: new Date().toISOString() };
}

// ── Storage helpers ──────────────────────────────────────────────────────────

function loadPersistedState(userId) {
  try {
    const raw = localStorage.getItem(`serene_notifs_${userId}`);
    return raw ? JSON.parse(raw) : { read: [], dismissed: [] };
  } catch {
    return { read: [], dismissed: [] };
  }
}

function savePersistedState(userId, state) {
  try {
    localStorage.setItem(`serene_notifs_${userId}`, JSON.stringify(state));
  } catch {
    // storage quota or private mode — fail silently
  }
}

// ── Notification computation ─────────────────────────────────────────────────

function computeNotifications(loggedPeriods, cycleLength) {
  const notifs = [];
  const predictions = getCyclePredictions(loggedPeriods, cycleLength);
  const today = new Date();
  const todayInfo = getDayInfo(today, loggedPeriods, cycleLength);
  const phase = todayInfo?.phase ?? 'unknown';

  // 1. Period approaching
  if (predictions.hasEnoughData && predictions.predictedNextPeriodStart) {
    const days = daysUntil(predictions.predictedNextPeriodStart);
    if (days !== null && days >= 0 && days <= 4) {
      notifs.push(makeNotification({
        id: 'period_soon',
        type: 'period_soon',
        priority: 1,
        title: days === 0
          ? 'Your period may start today 🌸'
          : `Period predicted in ${days} day${days === 1 ? '' : 's'}`,
        body: days === 0
          ? 'Pack some essentials, keep a heating pad close, and take it easy.'
          : `Your period is expected around ${predictions.predictedNextPeriodStart.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}. Stock up on iron-rich foods.`,
        actionLabel: 'View Calendar',
        actionNav: 'calendar',
      }));
    }
  }

  // 2. Ovulation approaching
  if (predictions.hasEnoughData && predictions.predictedOvulationDate) {
    const days = daysUntil(predictions.predictedOvulationDate);
    if (days !== null && days >= 0 && days <= 2) {
      notifs.push(makeNotification({
        id: 'ovulation_soon',
        type: 'ovulation_soon',
        priority: 2,
        title: days === 0
          ? 'Ovulation is predicted today ✨'
          : `Ovulation approaching — ${days} day${days === 1 ? '' : 's'} away`,
        body: 'LH is likely surging. This is your peak energy and communication window. Great day for big decisions.',
        actionLabel: 'View Calendar',
        actionNav: 'calendar',
      }));
    }
  }

  // 3. Fertile window starts
  if (predictions.hasEnoughData && predictions.predictedFertileStart) {
    const days = daysUntil(predictions.predictedFertileStart);
    if (days !== null && days >= 0 && days <= 1) {
      const alreadyHaveOvulation = notifs.some(n => n.id === 'ovulation_soon');
      if (!alreadyHaveOvulation) {
        notifs.push(makeNotification({
          id: 'fertile_window',
          type: 'fertile_window',
          priority: 3,
          title: days === 0
            ? 'Your fertile window opens today 🌿'
            : 'Fertile window starts tomorrow 🌿',
          body: `Your fertile window runs until ${predictions.predictedFertileEnd?.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}. Estrogen is climbing — great for exercise and social activities.`,
          actionLabel: 'View Calendar',
          actionNav: 'calendar',
        }));
      }
    }
  }

  // 4. Cycle complete / enough data unlocked
  if (predictions.hasEnoughData && predictions.cyclesUsed >= 2) {
    notifs.push(makeNotification({
      id: 'cycle_complete',
      type: 'cycle_complete',
      priority: 4,
      title: 'Your cycle predictions are ready 📊',
      body: `Based on ${predictions.cyclesUsed} logged cycle${predictions.cyclesUsed === 1 ? '' : 's'}, your average is ${predictions.avgCycleLength} days. View your personalized forecast.`,
      actionLabel: 'View Predictions',
      actionNav: 'calendar',
    }));
  }

  // 5. Food tip of the day (phase-aware)
  const phaseTips = FOOD_TIPS_BY_PHASE[phase] ?? FOOD_TIPS_BY_PHASE.unknown;
  const foodTip = getTipOfDay(phaseTips);
  if (foodTip) {
    notifs.push(makeNotification({
      id: 'food_tip',
      type: 'food_tip',
      priority: 6,
      title: foodTip.title,
      body: foodTip.body,
      actionLabel: 'Learn More',
      actionNav: 'learn',
    }));
  }

  // 6. Hydration reminder (always shown, rotates daily)
  const hydTip = getTipOfDay(HYDRATION_TIPS);
  if (hydTip) {
    notifs.push(makeNotification({
      id: 'hydration',
      type: 'hydration',
      priority: 7,
      title: hydTip.title,
      body: hydTip.body,
    }));
  }

  // 7. Symptom log nudge (shown in evening — after 3 PM)
  const hour = today.getHours();
  if (hour >= 15) {
    notifs.push(makeNotification({
      id: 'symptom_log',
      type: 'symptom_log',
      priority: 8,
      title: 'Log how you\'re feeling today 📓',
      body: 'Tracking your mood, energy, and symptoms helps spot patterns over time.',
      actionLabel: 'Open Journal',
      actionNav: 'journal',
    }));
  }

  return notifs.sort((a, b) => a.priority - b.priority);
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications(cycleData) {
  const { userId, loggedPeriods = [], cycleLength = 28 } = cycleData ?? {};

  const [persisted, setPersisted] = useState(() =>
    userId ? loadPersistedState(userId) : { read: [], dismissed: [] }
  );

  const [browserPermission, setBrowserPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  // Re-load persisted state when userId changes (login switch)
  useEffect(() => {
    if (userId) setPersisted(loadPersistedState(userId));
  }, [userId]);

  // Persist any change
  useEffect(() => {
    if (userId) savePersistedState(userId, persisted);
  }, [userId, persisted]);

  // Compute raw notifications from cycle data
  const raw = useMemo(
    () => computeNotifications(loggedPeriods, cycleLength),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loggedPeriods.join(','), cycleLength]
  );

  // Merge persisted read/dismissed state
  const notifications = useMemo(
    () =>
      raw
        .filter((n) => !persisted.dismissed.includes(n.id))
        .map((n) => ({ ...n, read: persisted.read.includes(n.id) })),
    [raw, persisted]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markRead = useCallback((id) => {
    setPersisted((prev) => ({
      ...prev,
      read: prev.read.includes(id) ? prev.read : [...prev.read, id],
    }));
  }, []);

  const markAllRead = useCallback(() => {
    setPersisted((prev) => ({
      ...prev,
      read: [...new Set([...prev.read, ...notifications.map((n) => n.id)])],
    }));
  }, [notifications]);

  const dismiss = useCallback((id) => {
    setPersisted((prev) => ({
      ...prev,
      dismissed: prev.dismissed.includes(id) ? prev.dismissed : [...prev.dismissed, id],
      read: [...new Set([...prev.read, id])],
    }));
  }, []);

  // ── Browser Notification API ───────────────────────────────────────────────
  const requestBrowserPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') {
      setBrowserPermission('granted');
      return;
    }
    const result = await Notification.requestPermission();
    setBrowserPermission(result);
  }, []);

  // Fire browser notifications for high-priority unread items when permission granted
  useEffect(() => {
    if (browserPermission !== 'granted') return;
    const urgent = notifications.filter(
      (n) => !n.read && n.priority <= 3
    );
    urgent.forEach((n) => {
      try {
        new Notification(`Serene — ${n.title}`, {
          body: n.body,
          icon: '/favicon.ico',
          tag: n.id, // prevents duplicate if tab reloads
        });
      } catch {
        // Silently ignore (some browsers block programmatic Notification())
      }
    });
  // Only fire when permissions or urgent items change (not on every render)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserPermission]);

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    dismiss,
    requestBrowserPermission,
    browserPermission,
  };
}
