
// src/api/cycleApi.js
//
// Thin data-access layer over `cycle_logs` and `cycles`.
// Adjust the import path below to wherever your existing
// supabaseClient.js singleton lives (used already in FarmerLiveMarket).
import { supabase } from '../supabaseClient';

// ------------------------------------------------------------
// CYCLE LOGS
// ------------------------------------------------------------

/**
 * Fetch all logged days for a given month.
 * Returns raw rows from cycle_logs — shape:
 * { log_date, is_period, is_cycle_start, flow, symptoms, mood, notes, basal_temp, cervical_mucus }
 */
export async function getMonthLogs(userId, year, month) {
  const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
  const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('cycle_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: true });

  if (error) throw error;
  return data;
}
export async function getDayLog(userId, date) {
  const dateStr = typeof date === 'string' ? date : date.toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('cycle_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', dateStr)
    .maybeSingle();

  if (error) throw error;
  return data; // null if no log exists yet for that day
}

export async function upsertDayLog(userId, date, fields) {
  const dateStr = typeof date === 'string' ? date : date.toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('cycle_logs')
    .upsert(
      { user_id: userId, log_date: dateStr, ...fields },
      { onConflict: 'user_id,log_date' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch every date the user has marked as a period day, across all time,
 * as an array of 'YYYY-MM-DD' strings — the exact shape cycleUtils.js
 * expects for `loggedPeriods` (it does `loggedPeriods.includes(key)` and
 * scans the whole array in getMostRecentPeriodStart to find the current
 * cycle's start date). A per-month fetch is NOT enough here: if the most
 * recent period started last month, cycle-day math for this month breaks.
 */
export async function getAllPeriodDates(userId) {
  const { data, error } = await supabase
    .from('cycle_logs')
    .select('log_date')
    .eq('user_id', userId)
    .eq('is_period', true)
    .order('log_date', { ascending: true });

  if (error) throw error;
  return data.map((row) => row.log_date); // already 'YYYY-MM-DD' from Postgres date type
}

/**
 * Create or update a day's log. Pass only the fields you want to change —
 * existing columns not included are left untouched (Postgres upsert
 * behavior via merge on the unique (user_id, log_date) constraint).
 */

/** Flip is_period for a day — mirrors your current togglePeriodDay(date) behavior. */
export async function togglePeriodDay(userId, dateStr) {
  const existing = await getDayLog(userId, dateStr);
  const nextIsPeriod = !existing?.is_period;
  return upsertDayLog(userId, dateStr, { is_period: nextIsPeriod });
}

export async function deleteDayLog(userId, dateStr) {
  const { error } = await supabase
    .from('cycle_logs')
    .delete()
    .eq('user_id', userId)
    .eq('log_date', dateStr);

  if (error) throw error;
}

// ------------------------------------------------------------
// PROFILE (cycle length setting)
// ------------------------------------------------------------

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId, fields) {
  const { data, error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ------------------------------------------------------------
// CYCLES (start/end tracking, used for predictions)
// ------------------------------------------------------------

export async function getCycles(userId) {
  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Opens a new cycle row starting at `startDate`, and closes out
 * whatever cycle was previously open (computing its length).
 * Also syncs profiles.last_period_start.
 */
export async function startNewCycle(userId, startDate) {
  const { data: openCycle } = await supabase
    .from('cycles')
    .select('*')
    .eq('user_id', userId)
    .is('end_date', null)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (openCycle) {
    const cycleLength = Math.round(
      (new Date(startDate) - new Date(openCycle.start_date)) / 86400000
    );
    await supabase
      .from('cycles')
      .update({ end_date: startDate, cycle_length: cycleLength })
      .eq('id', openCycle.id);
  }

  const { data, error } = await supabase
    .from('cycles')
    .insert({ user_id: userId, start_date: startDate })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('profiles')
    .update({ last_period_start: startDate })
    .eq('id', userId);

  return data;
}

/**
 * Wires up the "Mark as Start of Cycle" toggle from Calendar.jsx.
 * Marking a day as cycle start also marks it as a period day and
 * opens a new `cycles` row (closing the previous one).
 * Unmarking just flips the flag — it does not retroactively delete
 * the cycles row, since that would corrupt cycle-length history.
 */
export async function toggleCycleStart(userId, dateStr) {
  const dayLog = await getDayLog(userId, dateStr);

  if (dayLog?.is_cycle_start) {
    return upsertDayLog(userId, dateStr, { is_cycle_start: false });
  }

  await upsertDayLog(userId, dateStr, { is_cycle_start: true, is_period: true });
  return startNewCycle(userId, dateStr);
}