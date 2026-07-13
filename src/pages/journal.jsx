import React, { useState, useEffect, useMemo } from 'react';
import TopNav from '../components/TopNav.jsx';
import { getDailyInsight } from '../api/insightApi.js';
import { useJournalData } from '../hooks/useJournalData.js';
import {
  Search,
  Image as ImageIcon,
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

const FILTERS = ['All', 'Reflections', 'Symptom Log'];

const MOODS = [
  { name: 'Calm', icon: Smile },
  { name: 'Energetic', icon: Zap },
  { name: 'Tired', icon: Moon },
  { name: 'Sensitive', icon: Heart },
  { name: 'Bloated', icon: Droplet },
];

const SEED_ENTRIES = [
  {
    id: '1',
    date: 'Oct 24',
    title: 'Quiet Clarity',
    excerpt: 'Today I felt a strange sense of calm. My morning routine wit…',
    tags: [{ label: 'Calm', color: 'bg-emerald-100 text-emerald-700' }, { label: 'Phase 2', color: 'bg-rose-100 text-rose-700' }],
    type: 'Reflections',
  },
  {
    id: '2',
    date: 'Oct 22',
    title: 'Energy Burst',
    excerpt: 'Woke up at 6 AM ready to conquer the world. Noticed…',
    tags: [{ label: 'Active', color: 'bg-amber-100 text-amber-700' }],
    type: 'Reflections',
  },
  {
    id: '3',
    date: 'Oct 21',
    title: 'Restorative Day',
    excerpt: 'Cramps were heavy today. Decided to skip the gym and…',
    tags: [{ label: 'Cramps', color: 'bg-rose-100 text-rose-700' }],
    type: 'Symptom Log',
  },
];

export default function Journal({ activeNav, onNavigate, cycleData }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedMood, setSelectedMood] = useState('Energetic');
  const [noteText, setNoteText] = useState('');
  const { entries, loading, addEntry } = useJournalData(cycleData?.userId);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(true);

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

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesFilter = activeFilter === 'All' || e.type === activeFilter;
      const matchesSearch = search.trim() === '' || e.title.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [entries, activeFilter, search]);

  const today = new Date();
  const todayLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleSaveEntry = async () => {
    if (!noteText.trim()) return;
    try {
      await addEntry({
        title: noteText.slice(0, 40) || 'Untitled Entry',
        content: noteText,
        mood: selectedMood,
        entryType: 'Reflections',
        tags: [{ label: selectedMood, color: 'bg-rose-100 text-rose-700' }],
      });
      setNoteText('');
    } catch (err) {
      console.error('Failed to save journal entry:', err);
    }
  };
  useEffect(() => {
    if (!cycleData?.userId) return;
    getDailyInsight({
      mood: selectedMood,
      entryText: noteText,
      cyclePhase: cycleData?.currentPhase, // adjust to whatever field name your cycleData actually uses
    })
      .then(setInsight)
      .catch((err) => console.error('Insight fetch failed:', err))
      .finally(() => setInsightLoading(false));
  }, [cycleData?.userId]);

  return (
    <div id="journal-root" className="min-h-screen bg-[#fdfaf8] text-stone-800 relative overflow-hidden">

      {/* 3D Floating Ambient Background Layer */}
      <div
        className="fixed inset-0 pointer-events-none transition-transform duration-700 ease-out z-0 opacity-50 scale-105"
        style={{
          transform: `translate3d(${mousePos.x * -10}px, ${scrollY * -0.05}px, 0px)`,
          backgroundImage: "url('/src/assets/images/aura_light_bg_1782974447031.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 3D Floating Flowers Layer (parallax) */}
      <div
        className="fixed inset-x-0 top-0 bottom-0 pointer-events-none transition-all duration-1000 ease-out z-0 opacity-15"
        style={{
          transform: `translate3d(${mousePos.x * 20}px, ${scrollY * -0.1}px, 0px) rotate(${scrollY * 0.003}deg)`,
          backgroundImage: "url('/src/assets/images/aura_3d_flowers_1782974462579.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Ambient glow blobs */}
      <div className="fixed top-[-10%] left-[15%] w-500px h-500px rounded-full bg-rose-200/30 blur-[130px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="fixed bottom-[5%] right-[10%] w-500px h-500px rounded-full bg-amber-100/30 blur-[130px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s', animationDelay: '3s' }} />

      {/* ============ TOP NAV ============ */}
      <TopNav activeNav={activeNav} onNavigate={onNavigate} />

      {/* ============ MAIN CONTENT ============ */}
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
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs font-mono">No entries found.</div>
            ) : (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="glass-panel rounded-2xl p-4 bg-white/80 border border-stone-200/40 cursor-pointer hover:border-rose-200 transition-all"
                >
                  <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wide">{entry.date}</span>
                  <h4 className="font-serif text-base font-bold text-stone-900 mt-1 leading-snug">{entry.title}</h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">{entry.excerpt}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {entry.tags.map((tag) => (
                      <span key={tag.label} className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${tag.color}`}>
                        {tag.label}
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
          <div className="glass-panel rounded-3xl p-8 bg-white/85 border border-stone-200/40 min-h-600px flex flex-col">
            <div className="flex items-start justify-between mb-1">
              <div>
                <span className="text-xs font-mono text-emerald-600 font-semibold block mb-1">{todayLabel}</span>
                <h1 className="text-3xl font-serif font-extrabold text-stone-900">Daily Reflection</h1>
              </div>
              <div className="flex items-center space-x-3">

                <button
                  id="btn-save-journal-entry"
                  onClick={handleSaveEntry}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-800 hover:to-rose-900 text-white font-mono text-xs font-bold tracking-wide shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </div>

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

            <div className="mt-6 flex-1">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Start typing your thoughts, feelings, or observations here..."
                className="w-full h-full min-h-280px p-5 rounded-2xl bg-rose-50/50 border border-rose-100/60 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-rose-300 focus:bg-white resize-none transition-all leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Reflection + Resources */}
        <div className="lg:col-span-3 space-y-5">

          {/* AI Reflection Card */}
          <p className="text-xs text-stone-700 leading-relaxed">
            {insightLoading ? 'Thinking of something for you…' : insight?.reflection}
          </p>
          <div className="mt-3 p-3 rounded-xl bg-white/70 border border-emerald-100/50">
            <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wide block mb-1">Prompt for you</span>
            <p className="text-xs text-stone-600 italic leading-relaxed">
              {insight?.prompt}
            </p>
          </div>

          {/* Resources for you */}
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-3">Resources for you</h3>

            <div className="space-y-3">
              {/* Featured resource image card */}
              <div className="rounded-2xl overflow-hidden relative h-36 shadow-sm group cursor-pointer">
                <div
                  className="w-full h-full bg-gradient-to-r from-rose-300 via-rose-400 to-amber-300 transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: "url('/src/assets/images/aura_3d_flowers_1782974462579.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 space-y-0.5">
                  <span className="text-[9px] font-mono text-rose-200 uppercase tracking-wider">Basics</span>
                  <h4 className="text-white text-sm font-sans font-bold leading-snug">Understanding the 4 Phases</h4>
                </div>
              </div>

              {/* Two small resource cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-panel rounded-2xl p-4 bg-emerald-50/60 border border-emerald-100/50 flex flex-col space-y-2 cursor-pointer hover:border-emerald-200 transition-all">
                  <Leaf size={16} className="text-emerald-600" />
                  <span className="text-xs font-mono font-semibold text-stone-700 leading-snug">Phase Nutrition</span>
                </div>
                <div className="glass-panel rounded-2xl p-4 bg-rose-50/60 border border-rose-100/50 flex flex-col space-y-2 cursor-pointer hover:border-rose-200 transition-all">
                  <Activity size={16} className="text-rose-500" />
                  <span className="text-xs font-mono font-semibold text-stone-700 leading-snug">Cycle Syncing Workout</span>
                </div>
              </div>

              {/* Symptom library card */}
              <div className="glass-panel rounded-2xl p-4 bg-white/80 border border-stone-200/40 flex items-center space-x-3 cursor-pointer hover:border-stone-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 shrink-0">
                  <BookOpen size={16} />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-stone-800 block">The Symptom Library</span>
                  <span className="text-[10px] font-mono text-stone-400">Browse 50+ common entries</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}