import express from 'express';
import Groq from 'groq-sdk';
import { supabaseAdmin } from '../supabaseAdmin.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
1. A positive, mood-lifting reflection — exactly 2 complete sentences, each ending in a period. Do not run sentences together with "and" or commas. Keep each sentence under 15 words.
2. One short reflective journal prompt — a single sentence, under 15 words.
Respond ONLY with valid JSON in this exact shape, no markdown, no preamble: {"reflection": "First sentence. Second sentence.", "prompt": "Your prompt here?"}`;

    const userPrompt = `Mood: ${mood || 'not specified'}
Cycle phase: ${cyclePhase || 'unknown'}
Journal entry: ${entryText?.trim() ? entryText : '(no entry written today)'}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? '{}';
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
      log_date: insightDate,      // <-- add this
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