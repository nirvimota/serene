import { useState, useEffect, useCallback } from 'react';
import {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from '../api/journalApi';

export function useJournalData(userId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await getJournalEntries(userId);
      setEntries(rows.map(mapRowToEntry));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEntry = useCallback(async (entry) => {
    const row = await createJournalEntry(userId, entry);
    setEntries((prev) => [mapRowToEntry(row), ...prev]);
    return row;
  }, [userId]);

  const editEntry = useCallback(async (entryId, updates) => {
    const row = await updateJournalEntry(entryId, updates);
    setEntries((prev) => prev.map((e) => (e.id === entryId ? mapRowToEntry(row) : e)));
    return row;
  }, []);

  const removeEntry = useCallback(async (entryId) => {
    await deleteJournalEntry(entryId);
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  }, []);

  return { entries, loading, error, addEntry, editEntry, removeEntry, refresh };
}

// Maps a Supabase row to the shape Journal.jsx already expects
function mapRowToEntry(row) {
  return {
    id: row.id,
    date: new Date(row.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    entryDate: row.entry_date,
    title: row.title,
    excerpt: row.content?.length > 90 ? row.content.slice(0, 90) + '…' : row.content,
    content: row.content,
    mood: row.mood,
    tags: row.tags || [],
    type: row.entry_type,
  };
}