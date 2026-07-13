import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '../supabaseAdmin.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/daily', requireAuth, async (req, res) => {
  const userId = req.userId;
  const { mood, entryText, cyclePhase, date } = req.body;
  const insightDate = date || new Date().toISOString().slice(0, 10);

  try {
    // 1. Return cached reflection if one exists for today
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('daily_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('insight_date', insightDate)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (existing) {
      return res.json({
        reflection: existing.reflection_text,
        prompt: existing.prompt_text,
        cached: true,
      });
    }

    // 2. Generate a fresh one
    const systemPrompt = `You are a warm, supportive companion inside a menstrual health app called Serene Cycle.
Given a user's mood, optional journal text, and cycle phase, write:
1. A short (2-3 sentence) positive, mood-lifting reflection that validates their feelings and gently connects it to their cycle phase if relevant.
2. One short reflective journal prompt (a single sentence).
Respond ONLY with JSON in this exact shape, no markdown, no preamble: {"reflection": "...", "prompt": "..."}`;

    const userPrompt = `Mood: ${mood || 'not specified'}
Cycle phase: ${cyclePhase || 'unknown'}
Journal entry: ${entryText?.trim() ? entryText : '(no entry written today)'}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const raw = response.content.find((b) => b.type === 'text')?.text?.trim() ?? '{}';
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { reflection: cleaned, prompt: '' };
    }

    // 3. Cache it so it's not regenerated today
    const { error: insertError } = await supabaseAdmin.from('daily_insights').insert({
      user_id: userId,
      insight_date: insightDate,
      mood: mood || null,
      cycle_phase: cyclePhase || null,
      reflection_text: parsed.reflection,
      prompt_text: parsed.prompt,
    });
    if (insertError) throw insertError;

    res.json({ reflection: parsed.reflection, prompt: parsed.prompt, cached: false });
  } catch (err) {
    console.error('Insight generation error:', err);
    res.status(500).json({ error: 'Failed to generate insight' });
  }
});

export default router;