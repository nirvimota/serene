import React, { useState, useEffect, useMemo } from 'react';
import TopNav from '../components/TopNav.jsx';
import {
    Search,
    Sparkles,
    ArrowRight,
    HelpCircle,
    ChevronRight,
    HeartPulse,
    Waves,
    Leaf,
    CheckCircle2,
    Circle,
    Plus,
    Clock
} from 'lucide-react';

const MYTHS = [
    {
        icon: HelpCircle,
        myth: 'You can\u2019t get pregnant during your period.',
        fact: 'Sperm can survive several days, so it\u2019s possible \u2014 especially with shorter cycles.',
    },
    {
        icon: HelpCircle,
        myth: 'Irregular cycles are always a health problem.',
        fact: 'Occasional variation is common and often normal, especially near puberty or perimenopause.',
    },
    {
        icon: HelpCircle,
        myth: 'PMS is \u201call in your head.\u201d',
        fact: 'PMS is driven by real hormonal shifts in the luteal phase \u2014 your symptoms are physiological.',
    },
];

const RESOURCE_LIBRARY = [
    {
        id: 'sexual-health',
        icon: HeartPulse,
        color: 'rose',
        title: 'Sexual Health',
        subtitle: 'Intimacy, safety, and pleasure through every cycle stage.',
        count: '24 lessons',
    },
    {
        id: 'hormone-insights',
        icon: Waves,
        color: 'purple',
        title: 'Hormone Insights',
        subtitle: 'The science of estrogen, progesterone, and your hormone map.',
        count: '18 lessons',
    },
    {
        id: 'holistic-wellness',
        icon: Leaf,
        color: 'emerald',
        title: 'Holistic Wellness',
        subtitle: 'Nutrition, sleep, and movement tailored to your rhythm.',
        count: '21 lessons',
    },
];

const RITUAL_ITEMS = [
    { id: 'r1', title: 'Gentle Hand Massage', detail: '5 minutes to ease tension and improve circulation.' },
    { id: 'r2', title: 'Mindful Stretching', detail: 'A short flow to release lower-back and hip tightness.' },
    { id: 'r3', title: 'Evening Journaling', detail: 'Two prompts to close out the day with intention.' },
];

const colorMap = {
    rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-500' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-500' },
};

export default function Learn({ activeNav, onNavigate }) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [scrollY, setScrollY] = useState(0);
    const [search, setSearch] = useState('');
    const [checkedRituals, setCheckedRituals] = useState([]);

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

    const toggleRitual = (id) => {
        setCheckedRituals((prev) =>
            prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
        );
    };

    const filteredResources = useMemo(() => {
        if (!search.trim()) return RESOURCE_LIBRARY;
        return RESOURCE_LIBRARY.filter((r) =>
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.subtitle.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    return (
        <div id="learn-root" className="min-h-screen bg-[#fdfaf8] text-stone-800 relative overflow-hidden">

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
            <div className="fixed top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full bg-rose-200/30 blur-[130px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="fixed bottom-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber-100/30 blur-[130px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s', animationDelay: '3s' }} />

            {/* ============ TOP NAV ============ */}
            <TopNav activeNav={activeNav} onNavigate={onNavigate} />

            {/* ============ MAIN CONTENT ============ */}
            <main className="relative z-20 max-w-6xl mx-auto px-6 py-10">

                {/* HERO */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/70 text-rose-600 text-[10px] font-mono font-bold uppercase tracking-widest mb-4">
                        <Sparkles size={11} />
                        <span>Curated Wellness Content</span>
                    </span>
                    <h1 className="text-4xl font-serif font-extrabold text-stone-900 mb-3">Knowledge is Power</h1>
                    <p className="text-sm text-stone-600 leading-relaxed mb-6">
                        Empower your day with evidence-based education for your hormonal health and holistic well-being.
                    </p>

                    <div className="relative max-w-md mx-auto">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search resources, articles, or myths..."
                            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/80 border border-stone-200 text-xs text-stone-700 placeholder-stone-400 focus:outline-none focus:border-rose-300 focus:bg-white transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* TWO COLUMN LAYOUT: main content + sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT / CENTER: main content */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* Featured Article Card */}
                        <div className="glass-panel rounded-3xl overflow-hidden bg-white/80 border border-stone-200/40 grid grid-cols-1 md:grid-cols-2 items-stretch">
                            <div className="p-7 flex flex-col justify-center space-y-3">
                                <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest">Topic of the Week</span>
                                <h2 className="text-xl font-serif font-extrabold text-stone-900 leading-snug">
                                    Understanding Your <span className="text-rose-600">Ovarian Reserve</span>: A Guide to Modern Testing
                                </h2>
                                <p className="text-xs text-stone-600 leading-relaxed">
                                    Demystifying the science behind reproductive health tracking \u2014 what the numbers mean and how to approach fertility conversations with confidence and clarity.
                                </p>
                                <button className="mt-2 self-start px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-800 hover:to-rose-900 text-white font-mono text-xs font-bold tracking-wide shadow-md transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5">
                                    <span>Read the Full Guide</span>
                                    <ArrowRight size={13} />
                                </button>
                            </div>
                            <div
                                className="min-h-[220px] bg-rose-100"
                                style={{
                                    backgroundImage: "url('/src/assets/images/rose.jpg')",
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            />
                        </div>

                        {/* Myths vs Fact */}
                        <div>
                            <h3 className="text-2xl font-serif font-extrabold text-stone-900 mb-1">Myths vs. Fact</h3>
                            <p className="text-xs text-stone-500 mb-5">Gently debunking common misconceptions about menstrual health.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {MYTHS.map(({ icon: Icon, myth, fact }, i) => (
                                    <div key={i} className="glass-panel rounded-2xl p-5 bg-rose-50/50 border border-rose-100/50 flex flex-col space-y-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/80 border border-rose-100 flex items-center justify-center text-rose-500">
                                            <Icon size={15} />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-mono font-bold text-rose-500 uppercase tracking-widest block mb-1">The Myth</span>
                                            <p className="text-xs font-semibold text-stone-800 leading-relaxed">{myth}</p>
                                        </div>
                                        <div className="border-t border-rose-100/70 pt-3">
                                            <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase tracking-widest block mb-1">The Fact</span>
                                            <p className="text-xs text-stone-600 leading-relaxed">{fact}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>



                        {/* Resource Library */}
                        <div>
                            <h3 className="text-2xl font-serif font-extrabold text-stone-900 mb-4">Resource Library</h3>

                            <div className="space-y-3">
                                {filteredResources.length === 0 ? (
                                    <div className="text-xs font-mono text-stone-400 py-6 text-center">No matching resources.</div>
                                ) : (
                                    filteredResources.map(({ id, icon: Icon, color, title, subtitle, count }) => {
                                        const c = colorMap[color];
                                        return (
                                            <button
                                                key={id}
                                                className="w-full glass-panel rounded-2xl p-4 bg-white/80 border border-stone-200/40 flex items-center space-x-4 hover:border-stone-300 transition-all cursor-pointer text-left"
                                            >
                                                <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text} shrink-0`}>
                                                    <Icon size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-stone-900">{title}</h4>
                                                    <p className="text-xs text-stone-500 leading-relaxed">{subtitle}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 shrink-0">
                                                    <span className="text-[10px] font-mono text-stone-400 font-semibold">{count}</span>
                                                    <ChevronRight size={14} className="text-stone-300" />
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT: Daily Ritual sidebar */}
                    <div className="lg:col-span-4">
                        <div className="glass-panel rounded-3xl p-6 bg-white/85 border border-stone-200/40 sticky top-24">
                            <span className="inline-block px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200/70 text-rose-600 text-[9px] font-mono font-bold uppercase tracking-widest mb-3">
                                Grounding Ritual
                            </span>
                            <h3 className="text-lg font-serif font-extrabold text-stone-900 leading-snug mb-1">
                                Grounding Practices for Your Inner Balance
                            </h3>
                            <p className="text-xs text-stone-500 leading-relaxed mb-5">
                                A short, restorative sequence for your current phase.
                            </p>

                            <div className="space-y-3 mb-5">
                                {RITUAL_ITEMS.map((item) => {
                                    const isChecked = checkedRituals.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleRitual(item.id)}
                                            className="w-full flex items-start space-x-3 p-3 rounded-2xl bg-stone-50/70 hover:bg-stone-100/70 border border-stone-200/50 transition-all cursor-pointer text-left"
                                        >
                                            {isChecked ? (
                                                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                            ) : (
                                                <Circle size={16} className="text-stone-300 shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                                <span className={`text-xs font-bold block ${isChecked ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                                                    {item.title}
                                                </span>
                                                <span className="text-[11px] text-stone-500 leading-relaxed">{item.detail}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all duration-300 shadow-md cursor-pointer">
                                <Plus size={14} />
                                <span>Add to My Selections</span>
                            </button>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}