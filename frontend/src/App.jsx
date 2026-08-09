import React, { useState, useEffect, useRef, useMemo } from 'react';
import Auth from './components/auth.jsx';
import AppShell from './AppShell.jsx';
import { supabase } from './supabaseClient';
import {
  Sparkles,
  Calendar,
  Activity,
  Heart,
  Compass,
  Sliders,
  Code,
  Check,
  Copy,
  Zap,
  RefreshCw,
  Eye,
  ArrowDown,
  Info,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Moon,
  Flame,
  Clock,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';



export default function App() {
  // --- View Mode State ---
  // 'landing' for the beautiful product introduction page
  // 'app' for the live interactive biometric tracker dashboard
  const [viewMode, setViewMode] = useState('landing');
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(true);

  // --- States for 3D and Scroll Mechanics ---
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeSeasonTab, setActiveSeasonTab] = useState('menstrual');

  // --- Mouse Move Parallax Logic ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // --- Scroll Tracking for Landing Page Animations ---
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setViewMode('app'); // <-- this was missing, so refresh always fell back to 'landing'
      }
      setAuthLoading(false);
    });

    // Keep state in sync if session changes (login/logout elsewhere, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setViewMode('app');
      } else {
        setUser(null);
        setViewMode('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Static description dictionary for the 4 Seasons on the Landing Page ---
  const seasonsData = {
    menstrual: {
      title: 'Menstrual Phase (Winter)',
      days: 'Days 1 - 5',
      energy: 'Inward, reflective, slow',
      hormoneText: 'Estrogen and Progesterone levels are low',
      exercise: 'Restful Yin yoga, cozy stretching & slow walking',
      food: 'Iron-rich warm broths, dark leafy greens, hot tea infusions',
      quote: 'Winter is a calling for deep restorative recovery. Listen to your body and rest.',
      accent: 'text-rose-600',
      bgGlow: 'bg-rose-200/40',
      badge: 'bg-rose-100 border-rose-200 text-rose-800'
    },
    follicular: {
      title: 'Follicular Phase (Spring)',
      days: 'Days 6 - 11',
      energy: 'Rising energy, high creativity, open perspective',
      hormoneText: 'Estrogen rises, boosting brain energy',
      exercise: 'Steady strength training, running, hiking, light cardio',
      food: 'Probiotic foods, raw brassicas, pumpkin seeds, fresh citrus fruits',
      quote: 'Spring represents birth and new pathways. Ideal for launching creative projects.',
      accent: 'text-purple-600',
      bgGlow: 'bg-purple-200/40',
      badge: 'bg-purple-100 border-purple-200 text-purple-800'
    },
    ovulatory: {
      title: 'Ovulatory Phase (Summer)',
      days: 'Days 12 - 16',
      energy: 'Magnetic charisma, absolute peak physical endurance',
      hormoneText: 'Luteinizing Hormone (LH) and Estrogen peak',
      exercise: 'High-intensity intervals (HIIT), dancing, heavy lifting',
      food: 'Cooling cucumbers, fresh berries, cold-pressed green juices, quinoa',
      quote: 'Summer is your peak communicative strength. Shine, present, and collaborate.',
      accent: 'text-cyan-700',
      bgGlow: 'bg-cyan-200/40',
      badge: 'bg-cyan-100 border-cyan-200 text-cyan-800'
    },
    luteal: {
      title: 'Luteal Phase (Autumn)',
      days: 'Days 17 - 28+',
      energy: 'Nesting, details-focused, intuitive, slow focus',
      hormoneText: 'Progesterone climbs high, stabilizing body systems',
      exercise: 'Moderate Pilates, alignment flows, swimming',
      food: 'Baked sweet potatoes, dark chocolate, magnesium grains, herbal teas',
      quote: 'Autumn invites nesting, completion of open tasks, and comforting routines.',
      accent: 'text-amber-700',
      bgGlow: 'bg-amber-200/40',
      badge: 'bg-amber-100 border-amber-200 text-amber-800'
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setViewMode('app');
  };

  const handleBackToLanding = () => {
    setViewMode('landing');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf8]">
        <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-rose-500 animate-spin" />
      </div>
    );
  }
  
  return (
    <div id="aura-cycle-root" className="relative min-h-screen text-stone-800 overflow-hidden bg-[#fdfaf8] selection:bg-rose-200 selection:text-rose-900">

      {/* Ambient background image with soft, smooth blending */}
      <div
        id="bg-light-ambient"
        className="fixed inset-0 pointer-events-none transition-transform duration-700 ease-out z-0 opacity-60 scale-105"
        style={{
          transform: `translate3d(${mousePos.x * -10}px, ${scrollY * -0.05}px, 0px)`,
          backgroundImage: "url('/src/assets/images/aura_light_bg_1782974447031.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Floating 3D floral accent ribbons in background */}
      <div
        id="bg-light-3dflowers"
        className="fixed inset-x-0 top-0 bottom-0 pointer-events-none transition-all duration-1000 ease-out z-0 opacity-20 scale-100"
        style={{
          transform: `translate3d(${mousePos.x * 20}px, ${scrollY * -0.1}px, 0px) rotate(${scrollY * 0.003}deg)`,
          backgroundImage: "url('/src/assets/images/aura_3d_flowers_1782974462579.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Subtle light aesthetic grid overlay */}
      <div id="grid-overlay-light" className="fixed inset-0 pointer-events-none z-10 opacity-30 digital-grid" />

      {/* Radiant warm accent blobs */}
      <div id="glow-blob-warm-rose" className="fixed top-[-10%] left-[20%] w-500px h-500px rounded-full bg-rose-200/50 blur-[130px] pointer-events-none z-0 animate-ambient-glow" />
      <div id="glow-blob-amber-gold" className="fixed bottom-[10%] right-[10%] w-600px h-600px rounded-full bg-amber-100/40 blur-[140px] pointer-events-none z-0 animate-ambient-glow" style={{ animationDelay: '4s' }} />

      {/* ==========================================================
          HEADER BAR (landing / auth only — AppShell has its own TopNav)
          ========================================================== */}
      {viewMode !== 'app' && (
        <header id="app-header-bar" className="fixed top-0 left-0 w-full z-50 border-b border-stone-200/40 bg-white/45 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setViewMode('landing')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to- from-rose-400 to-amber-400 flex items-center justify-center p-1px shadow-sm">
              <div className="w-full h-full rounded-md bg-white flex items-center justify-center">
                <Heart size={14} className="text-rose-500 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-2xl tracking-[0.25em] font-bold text-stone-900">
                Serene
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 justify-between">
            <div className="hidden md:flex items-center space-x-8 text-xs font-mono text-stone-600 mr-4 ">
              <a href="#benefits-section" className="hover:text-stone-900 transition-colors">FEATURES</a>
            </div>

            <button
              id="btn-back-landing-header"
              onClick={() => setViewMode('landing')}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200/80 font-mono text-xs font-semibold transition-all duration-300 active:scale-95 cursor-pointer flex items-center space-x-1.5"
            >
              <Compass size={13} />
              <span>Home</span>
            </button>
          </div>
        </header>
      )}

      {/* ==========================================================
          VIEWPORT CONTENT
          ========================================================== */}

      {viewMode === 'landing' && (
        <div id="landing-page-view" className=" relative z-20 animate-fade-in">

          {/* HERO SECTION */}
          <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto py-16">

            {/* Premium Floating Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 mt-20 rounded-full bg-rose-50 border border-rose-200/80 text-rose-600 text-[10px] font-mono tracking-widest uppercase mb-6 shadow-sm">
              <Sparkles size={11} className="animate-spin" style={{ animationDuration: '4s' }} />
              <span>Light-Infused Menstrual & Hormone Intelligence</span>
            </div>

            {/* Master Display Typography */}
            <h1 className="text-7xl font-serif font-extrabold tracking-tight text-stone-900 leading-[1.1] mb-6 text-left mt-8">
              Your <span className='text-rose-500'>Body</span>, <br />
              <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-6xl mt-3 block-2.5 italic font-normal text-transparent bg-clip-text">
                Understood beautifully.
              </span>
            </h1>

            {/* High-Key Product Narrative */}
            <p className="text-sm sm:text-lg md:text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed font-sans mb-8">
              Serene Cycle bridges medical hormonal phase analysis with state-of-the-art frosted AeroGlass interface design. Feel the dynamic alignment of bio-nutrition, exercise, and mindfulness curated for your specific day.
            </p>

            {/* Multi-Button Action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                id="btn-launch-tracker-header"
                onClick={() => { setAuthMode('login'); setViewMode('auth'); }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-mono text-lg font-bold transition-all duration-300 shadow-md hover:shadow-rose-400/20 active:scale-95 cursor-pointer"
              >
                LAUNCH TRACKER
              </button>

              < a href="#science-section"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 hover:border-stone-300 font-sans font-semibold text-base transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Compass size={18} className="text-stone-400" />
                <span>Explore Biological Science</span>
              </a>
            </div>

            {/* Down Arrow bounce indicator */}
            <div className=" animate-bounce">
              <ArrowDown className="text-stone-400" size={20} />
            </div>

          </section>
          <section id="benefits-section" className="py-24 w-full mx-auto px-6 bg-stone-50/80">

            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-sans font-extrabold text-stone-900 tracking-tight">
                High-Fidelity Tracking Systems
              </h2>
              <p className="text-stone-600 mt-3 text-sm sm:text-base leading-relaxed">
                Engineered with visual fidelity and architectural integrity, Aura Cycle replaces dark, clinical medical applications with light-infused elegant systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Dial indicator Card */}
              <div className="glass-panel rounded-3xl p-6 bg-white/75 relative overflow-hidden flex flex-col justify-between group hover:border-rose-300 transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100 text-rose-500">
                    <Calendar size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">Track</h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    Visualize where you stand on the 28-day lifecycle. Track remaining days in real-time, matching body metrics dynamically on a custom circular track.
                  </p>
                </div>
              </div>

              {/* Spectrograph Card */}
              <div className="glass-panel rounded-3xl p-6 bg-white/75 relative overflow-hidden flex flex-col justify-between group hover:border-purple-300 transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100 text-purple-500">
                    <Activity size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">Learn</h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    Understand rising Estrogen peaks and Progesterone waves through gorgeous, interactive wave coordinates, calculated instantly upon cycle simulation updates.
                  </p>
                </div>
              </div>

              {/* Anomaly database card */}
              <div className="glass-panel rounded-3xl p-6 bg-white/75 relative overflow-hidden flex flex-col justify-between group hover:border-amber-300 transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-600">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">Analyze</h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    Keep a clean, encrypted ledger of daily Basal Temperatures, Flow intensities, symptoms, and biological mood states. Save and delete logs instantly.
                  </p>
                </div>
              </div>

            </div>

          </section>

          {/* SCIENCE SECTION: THE 4 BIOLOGICAL SEASONS */}
          <section id="science-section" className="py-24  border-y border-stone-200/50 relative">
            <div className="max-w-6xl mx-auto px-6">

              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-5xl font-sans font-extrabold text-stone-900 tracking-tight">
                  The Four Biological Seasons
                </h2>
                <p className="text-stone-600 mt-3 text-sm sm:text-base leading-relaxed">
                  A woman's cycle is not a static line. It fluctuates across four distinct chemical seasons, regulating everything from baseline metabolism and sleep needs to creative flow.
                </p>
              </div>

              {/* Season tabs controller */}
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {Object.keys(seasonsData).map((key) => (
                  <button
                    key={key}
                    id={`tab-season-${key}`}
                    onClick={() => setActiveSeasonTab(key)}
                    className={`px-5 py-3 rounded-2xl font-mono text-xs font-bold uppercase transition-all duration-300 border cursor-pointer ${activeSeasonTab === key
                      ? 'bg-white text-stone-900 border-stone-200 shadow-md scale-105'
                      : 'bg-stone-100/50 text-stone-500 border-transparent hover:text-stone-800'
                      }`}
                  >
                    {seasonsData[key].title.split(' ')[0]} ({seasonsData[key].days})
                  </button>
                ))}
              </div>

              {/* Season Details Plate */}
              <div className="glass-panel rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/85">

                {/* Left explanation (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${seasonsData[activeSeasonTab].badge}`}>
                      {seasonsData[activeSeasonTab].days}
                    </span>
                    <span className="font-mono text-xs text-stone-400">STATUS // SECURE CLINICAL INTELLIGENCE</span>
                  </div>

                  <h3 className={`text-2xl md:text-3xl font-extrabold ${seasonsData[activeSeasonTab].accent}`}>
                    {seasonsData[activeSeasonTab].title}
                  </h3>

                  <p className="text-stone-700 text-sm md:text-base leading-relaxed italic">
                    "{seasonsData[activeSeasonTab].quote}"
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-100 pt-6">
                    <div className="p-4 rounded-xl bg-stone-50/60 border border-stone-100/80">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1">ENERGY PROFILE</span>
                      <span className="text-xs font-bold text-stone-800">{seasonsData[activeSeasonTab].energy}</span>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50/60 border border-stone-100/80">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1">ESTROGEN & PROGESTERONE</span>
                      <span className="text-xs font-bold text-stone-800">{seasonsData[activeSeasonTab].hormoneText}</span>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50/60 border border-stone-100/80">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1">BIOMECHANICAL EXERCISE</span>
                      <span className="text-xs font-bold text-stone-800">{seasonsData[activeSeasonTab].exercise}</span>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50/60 border border-stone-100/80">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1">BIO-NUTRITIONAL STRATEGY</span>
                      <span className="text-xs font-bold text-stone-800">{seasonsData[activeSeasonTab].food}</span>
                    </div>
                  </div>
                </div>

                {/* Right abstract vector art representations (5 Cols) */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative w-72 h-72 flex items-center justify-center">
                    {/* Decorative outer orbit circles representing hormones */}
                    <div className={`absolute inset-0 rounded-full border-2 border-dashed border-stone-200/60 animate-spin`} style={{ animationDuration: '40s' }} />
                    <div className={`absolute inset-4 rounded-full border border-stone-100 animate-spin`} style={{ animationDuration: '25s', animationDirection: 'reverse' }} />

                    {/* Big colored glowing background blob based on phase */}
                    <div className={`absolute w-44 h-44 rounded-full filter blur-3xl transition-colors duration-700 ${seasonsData[activeSeasonTab].bgGlow}`} />

                    {/* Floating orb center */}
                    <div className="absolute w-36 h-36 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-stone-200/50 flex flex-col items-center justify-center p-4 text-center z-10">
                      <Heart className={`animate-pulse mb-2 ${seasonsData[activeSeasonTab].accent}`} size={28} />
                      <span className="text-xs font-mono font-bold tracking-widest text-stone-500 uppercase">SEASONAL</span>
                      <span className="text-sm font-sans font-extrabold text-stone-800 mt-1 uppercase">
                        {activeSeasonTab}
                      </span>
                    </div>

                    {/* Small floating status tags */}
                    <div className="absolute top-[10%] left-[-5%] bg-white border border-stone-100 rounded-full px-3 py-1 text-[10px] font-mono font-semibold shadow-sm text-stone-600 flex items-center space-x-1">
                      <Clock size={10} className="text-rose-500" />
                      <span>INTELLIGENCE</span>
                    </div>
                    <div className="absolute bottom-[10%] right-[-5%] bg-white border border-stone-100 rounded-full px-3 py-1 text-[10px] font-mono font-semibold shadow-sm text-stone-600 flex items-center space-x-1">
                      <Sparkles size={10} className="text-amber-500" />
                      <span>BIO-MATCH</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </section>

        </div>
      )}

      <main id="main-viewport" className={viewMode === 'app' ? 'relative z-20' : 'relative z-20 pt-20'}>

        {viewMode === 'auth' && (
          <Auth
            onAuthSuccess={handleAuthSuccess}
            initialMode={authMode}
            onBackToLanding={handleBackToLanding}
          />
        )}

        {/* ==========================================================
            LIVE APP — real Dashboard/Calendar system via AppShell
            ========================================================== */}
        {viewMode === 'app' && (
          <AppShell user={user} />
        )}

      </main>

      {/* Floating Interactive Back-To-Top indicator */}
      {viewMode !== 'app' && scrollY > 400 && (
        <button
          id="btn-back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-stone-900 hover:bg-stone-800 text-white z-40 shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          title="Back to Top"
        >
          <ArrowDown className="rotate-180" size={16} />
        </button>
      )}

    </div>
  );
}