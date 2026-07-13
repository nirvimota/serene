import { supabase } from '../supabaseClient';

// UI label <-> DB enum mapping (journal_entry_type enum only accepts these two)
const UI_TO_DB_TYPE = {
  'Reflections': 'reflection',
  'Symptom Log': 'symptom_log',
};
const DB_TO_UI_TYPE = {
  'reflection': 'Reflections',
  'symptom_log': 'Symptom Log',
};

function toDbType(uiType) {
  return UI_TO_DB_TYPE[uiType] ?? 'reflection';
}
function toUiType(dbType) {
  return DB_TO_UI_TYPE[dbType] ?? 'Reflections';
}

// Get all journal entries for a user, most recent first
export async function getJournalEntries(userId) {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false });

  if (error) throw error;
  return data.map((row) => ({ ...row, entry_type: toUiType(row.entry_type) }));
}

// Get a single entry by id
export async function getJournalEntry(entryId) {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', entryId)
    .single();

  if (error) throw error;
  return { ...data, entry_type: toUiType(data.entry_type) };
}

// Create a new entry
export async function createJournalEntry(userId, entry) {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      entry_date: entry.entryDate ?? new Date().toISOString().slice(0, 10),
      title: entry.title ?? '',
      content: entry.content ?? '',
      mood: entry.mood ?? null,
      entry_type: toDbType(entry.entryType ?? 'Reflections'),
      tags: entry.tags ?? [],
    })
    .select()
    .single();

  if (error) throw error;
  return { ...data, entry_type: toUiType(data.entry_type) };
}

// Update an existing entry (partial updates supported)
export async function updateJournalEntry(entryId, updates) {
  const payload = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.mood !== undefined) payload.mood = updates.mood;
  if (updates.entryType !== undefined) payload.entry_type = toDbType(updates.entryType);
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.entryDate !== undefined) payload.entry_date = updates.entryDate;

  const { data, error } = await supabase
    .from('journal_entries')
    .update(payload)
    .eq('id', entryId)
    .select()
    .single();

  if (error) throw error;
  return { ...data, entry_type: toUiType(data.entry_type) };
}

// Delete an entry
export async function deleteJournalEntry(entryId) {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', entryId);

  if (error) throw error;
  return true;
}