import React, { useState, useEffect, useMemo, useCallback } from 'react';

import {
  Search,
  Smile,
  Zap,
  Moon,
  Heart,
  Droplet,
  Sparkles,
  BookOpen,
  Leaf,
  Activity
} from 'lucide-react';
import { getJournalEntries, createJournalEntry } from '../api/journalApi';
import SymptomAnalytics from '../components/SymptomAnalytics.jsx';

import { getDailyInsight } from '../api/reflectionapi.js';
import { upsertDayLog } from '../api/cycleapi.js';
import { toKey, stripTime } from '../utils/cycleUtils';

const FILTERS = ['All', 'Reflections', 'Symptom Log'];

const SYMPTOMS = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Nausea', 'Back Pain', 'Tenderness', 'Acne'];

const MOODS = [
  { name: 'Calm', icon: Smile },
  { name: 'Energetic', icon: Zap },
  { name: 'Tired', icon: Moon },
  { name: 'Sensitive', icon: Heart },
  { name: 'Bloated', icon: Droplet },
];

const TAG_COLORS = [
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-purple-100 text-purple-700',
];

function tagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export default function Journal({ activeNav, onNavigate, cycleData }) {
  const userId = cycleData?.userId;
  const cyclePhase = cycleData?.phase; // may be undefined depending on what your hook exposes

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [entryType, setEntryType] = useState('Reflections'); // matches journalApi's UI label directly
  const [titleText, setTitleText] = useState('');
  const [noteText, setNoteText] = useState('');

  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [insight, setInsight] = useState(null); // { reflection, prompt, cached }
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ---- Load entries ----
  const loadEntries = useCallback(async () => {
    if (!userId) return;
    setEntriesLoading(true);
    try {
      const rows = await getJournalEntries(userId);
      setEntries(rows);
    } catch (err) {
      console.error('Failed to load journal entries:', err);
    } finally {
      setEntriesLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesFilter = activeFilter === 'All' || e.entry_type === activeFilter;
      const matchesSearch =
        search.trim() === '' ||
        (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.content || '').toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [entries, activeFilter, search]);

  const today = new Date();
  const todayLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  // ---- Save entry + get AI reflection ----
  const handleSaveEntry = async () => {
    if (!userId || !noteText.trim()) {
      setSaveError('Write something before saving.');
      return;
    }
    setSaveError('');
    setSaving(true);

    try {
      await createJournalEntry(userId, {
        title: titleText.trim(),
        content: noteText.trim(),
        mood: selectedMood,
        entryType, // 'Reflections' | 'Symptom Log' — journalApi maps this to the DB enum
        tags: [selectedMood, ...selectedSymptoms],
      });

      // symptoms live on cycle_logs, not journal_entries — save them
      // against today's date so Calendar's Day Details picks them up too
      if (selectedSymptoms.length) {
        try {
          const todayKey = toKey(stripTime(new Date()));
          await upsertDayLog(userId, todayKey, { symptoms: selectedSymptoms });
        } catch (err) {
          console.error('Failed to save symptoms to cycle_logs:', err);
        }
      }

      setInsightLoading(true);
      try {
        const result = await getDailyInsight({
          mood: selectedMood,
          entryText: noteText.trim(),
          cyclePhase,
          symptoms: selectedSymptoms,
        });
        setInsight(result);
      } catch (err) {
        console.error('Insight generation failed:', err);
      } finally {
        setInsightLoading(false);
      }

      setTitleText('');
      setNoteText('');
      setSelectedSymptoms([]);
      await loadEntries();
    } catch (err) {
      console.error('Failed to save entry:', err);
      setSaveError('Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="journal-root" className="min-h-screen bg-[#fdfaf8] text-stone-800 relative overflow-hidden">

      {/* 3D Floating Ambient Background Layer */}
      <div
        className="fixed inset-0 pointer-events-none transition-transform duration-700 ease-out z-0 opacity-50 scale-105"
        style={{
          transform: `translate3d(${mousePos.x * -10}px, ${scrollY * -0.05}px, 0px)`,
          backgroundImage: "url('/images/aura_light_bg_1782974447031.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 3D Floating Flowers Layer (parallax) */}
      <div
        className="fixed inset-x-0 top-0 bottom-0 pointer-events-none transition-all duration-1000 ease-out z-0 opacity-15"
        style={{
          transform: `translate3d(${mousePos.x * 20}px, ${scrollY * -0.1}px, 0px) rotate(${scrollY * 0.003}deg)`,
          backgroundImage: "url('/images/fact_rose.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Ambient glow blobs */}
      <div className="fixed top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full bg-rose-200/30 blur-[130px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="fixed bottom-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber-100/30 blur-[130px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s', animationDelay: '3s' }} />



      <main className="relative z-20 max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: Search + Entry List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entries..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-rose-50/60 border border-rose-100/60 text-xs text-stone-700 placeholder-stone-400 focus:outline-none focus:border-rose-300 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold border transition-all cursor-pointer ${activeFilter === f
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-white/70 text-stone-500 border-stone-200/70 hover:border-stone-300'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {entriesLoading ? (
              <div className="text-center py-8 text-stone-400 text-xs font-mono">Loading entries…</div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs font-mono">No entries found.</div>
            ) : (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="glass-panel rounded-2xl p-4 bg-white/80 border border-stone-200/40 cursor-pointer hover:border-rose-200 transition-all"
                >
                  <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wide">
                    {new Date(entry.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <h4 className="font-serif text-base font-bold text-stone-900 mt-1 leading-snug">
                    {entry.title || 'Untitled entry'}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                    {entry.content}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(entry.tags || []).map((tag) => (
                      <span key={tag} className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${tagColor(tag)}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Daily Reflection */}
        <div className="lg:col-span-6">
          <div className="glass-panel rounded-3xl p-8 bg-white/85 border border-stone-200/40 min-h-[600px] flex flex-col">
            <div className="flex items-start justify-between mb-1">
              <div>
                <span className="text-xs font-mono text-emerald-600 font-semibold block mb-1">{todayLabel}</span>
                <h1 className="text-3xl font-serif font-extrabold text-stone-900">Daily Reflection</h1>
              </div>
              <button
                id="btn-save-journal-entry"
                onClick={handleSaveEntry}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-800 hover:to-rose-900 disabled:opacity-50 text-white font-mono text-xs font-bold tracking-wide shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {saving ? 'Saving…' : 'Save Entry'}
              </button>
            </div>

            {saveError && (
              <p className="text-xs text-rose-600 font-mono mt-2">{saveError}</p>
            )}

            {/* Entry type toggle */}
            <div className="flex gap-1 bg-rose-50/70 rounded-xl p-1 mt-4 w-fit">
              {['Reflections', 'Symptom Log'].map((label) => (
                <button
                  key={label}
                  onClick={() => setEntryType(label)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${entryType === label ? 'bg-white text-rose-700 shadow-sm' : 'text-stone-400'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Title */}
            <input
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder="Give it a title (optional)"
              className="mt-4 w-full px-4 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200/60 text-sm font-serif font-bold text-stone-800 placeholder-stone-400 focus:outline-none focus:border-rose-300 focus:bg-white transition-all"
            />

            <div className="mt-6">
              <span className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider block mb-3">How are you feeling?</span>
              <div className="grid grid-cols-5 gap-2">
                {MOODS.map(({ name, icon: Icon }) => {
                  const isSelected = selectedMood === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setSelectedMood(name)}
                      className={`py-4 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${isSelected
                        ? 'bg-rose-50 border-rose-300 shadow-sm'
                        : 'bg-stone-50/70 border-stone-200/60 hover:border-stone-300'
                        }`}
                    >
                      <Icon size={18} className={isSelected ? 'text-rose-600' : 'text-stone-400'} />
                      <span className={`text-[10px] font-mono font-semibold ${isSelected ? 'text-rose-700' : 'text-stone-500'}`}>
                        {name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <span className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider block mb-3">Any symptoms today?</span>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold border transition-all cursor-pointer ${isSelected
                        ? 'bg-rose-100 border-rose-300 text-rose-700'
                        : 'bg-stone-50/70 border-stone-200/60 text-stone-500 hover:border-stone-300'
                        }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex-1">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Start typing your thoughts, feelings, or observations here..."
                className="w-full h-full min-h-[280px] p-5 rounded-2xl bg-rose-50/50 border border-rose-100/60 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-rose-300 focus:bg-white resize-none transition-all leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Reflection + Resources */}
        <div className="lg:col-span-3 space-y-5">

          {/* AI Reflection Card — real, from /api/insights/daily (Groq, cached per day) */}
          <div className="glass-panel rounded-3xl p-5 bg-emerald-50/60 border border-emerald-100/60">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles size={14} className="text-emerald-600" />
              <span className="font-mono text-xs font-bold text-stone-800 uppercase tracking-wide">AI Reflection</span>
            </div>

            {insightLoading ? (
              <p className="text-xs text-stone-500 italic">Thinking...</p>
            ) : insight ? (
              <>
                <p className="text-xs text-stone-700 leading-relaxed">{insight.reflection}</p>
                <div className="mt-3 p-4 rounded-2xl bg-white/80 border border-emerald-100/40 shadow-sm">
                  <p className="text-xs text-stone-600 italic leading-relaxed">{insight.prompt}</p>
                </div>
              </>
            ) : (
              <p className="text-xs text-stone-500 leading-relaxed">
                Save a journal entry and I'll reflect on it here.
              </p>
            )}
          </div>

          {/* Resources for you */}
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-3">Resources for you</h3>

            <div className="space-y-3">
              <div className="rounded-2xl overflow-hidden relative h-40 shadow-sm group cursor-pointer">
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute -top-10 -left-10 w-44 h-44 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-[-10%] w-56 h-40 bg-rose-400/25 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-amber-200/10 rounded-full blur-2xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/25 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 space-y-0.5">
                  <span className="text-[9px] font-mono text-rose-300 uppercase tracking-wider font-bold">Basics</span>
                  <h4 className="text-white text-base font-serif font-bold leading-snug">Understanding the 4 Phases</h4>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4 bg-emerald-50/70 flex flex-col space-y-3 cursor-pointer hover:bg-emerald-50 transition-all shadow-sm">
                  <Leaf size={18} className="text-emerald-600" />
                  <span className="text-xs font-mono font-semibold text-stone-700 leading-snug">Phase Nutrition</span>
                </div>
                <div className="rounded-2xl p-4 bg-rose-50/70 flex flex-col space-y-3 cursor-pointer hover:bg-rose-50 transition-all shadow-sm">
                  <Activity size={18} className="text-rose-500" />
                  <span className="text-xs font-mono font-semibold text-stone-700 leading-snug">Cycle Syncing Workout</span>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-4 bg-white/80 border border-stone-200/40 flex items-center space-x-3 cursor-pointer hover:border-stone-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 shrink-0">
                  <BookOpen size={16} />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-stone-800 block">The Symptom Library</span>
                  <span className="text-[10px] font-mono text-stone-400">Browse 50+ common entries</span>
                </div>
              </div>

              <SymptomAnalytics userId={cycleData?.userId} />
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}