// src/api/reflectionApi.js
import { supabase } from '../supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Calls your existing backend route: POST /api/insights/daily
 * (protected by requireAuth — needs a real Supabase session token)
 *
 * @param {{ mood?: string, entryText?: string, cyclePhase?: string, symptoms?: string[], date?: string }} params
 * @returns {Promise<{ reflection: string, prompt: string, cached: boolean }>}
 */
export async function getDailyInsight({ mood, entryText, cyclePhase, symptoms, date }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE}/api/insights/daily`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ mood, entryText, cyclePhase, symptoms, date }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || 'Failed to generate insight');
  }

  return res.json();
}