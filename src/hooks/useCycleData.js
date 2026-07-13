// src/hooks/useCycleData.js
//
// Drop-in replacement for whatever local useState hook currently
// produces `cycleData` (loggedPeriods, cycleLength, selectedDate,
// setSelectedDate, togglePeriodDay) that gets passed into
// Dashboard.jsx and Calendar.jsx. Same shape in, same shape out —
// just backed by Supabase instead of local state.
//
// Usage (e.g. in AppShell.jsx):
//   const cycleData = useCycleData(user.id);
//   <Dashboard cycleData={cycleData} ... />
//   <Calendar cycleData={cycleData} ... />

import { useState, useEffect, useCallback } from 'react';
import {
  getAllPeriodDates,
  togglePeriodDay as apiTogglePeriodDay,
  getProfile,
  updateProfile,
} from '../api/cycleapi';
import { toKey, stripTime } from '../utils/cycleUtils';

export function useCycleData(userId) {
  const [loggedPeriods, setLoggedPeriods] = useState([]);
  const [cycleLength, setCycleLengthState] = useState(28);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [dates, profile] = await Promise.all([
          getAllPeriodDates(userId),
          getProfile(userId),
        ]);
        if (cancelled) return;
        setLoggedPeriods(dates);
        setCycleLengthState(profile?.avg_cycle_length ?? 28);
      } catch (err) {
        if (!cancelled) setError(err);
        console.error('useCycleData: failed to load', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const setCycleLength = useCallback(
    async (newLength) => {
      if (!userId) return;
      setCycleLengthState(newLength); // optimistic
      try {
        await updateProfile(userId, { avg_cycle_length: newLength });
      } catch (err) {
        console.error('Failed to update cycle length:', err);
      }
    },
    [userId]
  );

  const togglePeriodDay = useCallback(
    async (date) => {
      if (!userId) return;
      const key = toKey(stripTime(date));

      // optimistic UI update — flip immediately, revert if the write fails
      setLoggedPeriods((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );

      try {
        await apiTogglePeriodDay(userId, key);
      } catch (err) {
        console.error('Failed to toggle period day, reverting:', err);
        setLoggedPeriods((prev) =>
          prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
      }
    },
    [userId]
  );

  return {
    userId,
    loggedPeriods,
    cycleLength,
    selectedDate,
    setSelectedDate,
    setCycleLength,
    togglePeriodDay,
    loading,
    error,
  };
}