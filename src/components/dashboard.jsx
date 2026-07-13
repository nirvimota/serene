import React, { useState, useEffect } from 'react';
import {
  Heart, Smile, Activity, Moon, Zap, Sparkles, Droplet
} from 'lucide-react';
import { getDayInfo, addDays } from '../utils/cycleUtils';
import TopNav from '../components/TopNav.jsx';

export default function Dashboard({ activeNav, onNavigate, cycleData }) {
  const { loggedPeriods, cycleLength, togglePeriodDay } = cycleData;
  const today = new Date();
  const todayInfo = getDayInfo(today, loggedPeriods, cycleLength);
  const stripDays = Array.from({ length: 8 }, (_, i) => addDays(today, i - 3));

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

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

  return (
    <div id="dashboard-root" className="min-h-screen bg-[#fdfaf8] text-stone-800 relative overflow-hidden">

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
      <main className="relative z-20 max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-6">

          {/* Phase Card */}
          <div className="glass-panel rounded-3xl p-8 bg-white/75 border border-stone-200/40 relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-50 border border-rose-200/70 text-rose-600 text-[10px] font-mono font-bold uppercase tracking-wider">
                Current Phase
              </span>
              {todayInfo.cycleDay ? (
                <h1 className="text-4xl font-sans font-extrabold text-stone-900 leading-tight">
                  Day {todayInfo.cycleDay}: <br />
                  <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-transparent bg-clip-text capitalize">
                    {todayInfo.phase} Phase
                  </span>
                </h1>
              ) : (
                <h1 className="text-3xl font-sans font-extrabold text-stone-900 leading-tight">
                  No period logged yet
                </h1>
              )}
              <p className="text-sm text-stone-600 leading-relaxed">
                {todayInfo.cycleDay
                  ? 'Tap a date on the calendar to log or update your period days.'
                  : 'Go to the Calendar and tap your first period day to start tracking.'}
              </p>
              <button
                onClick={() => onNavigate('calendar')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-800 hover:to-rose-900 text-white font-mono text-xs font-bold tracking-wide shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {todayInfo.cycleDay ? 'View Calendar' : 'Log Your Period'}
              </button>
            </div>

            {/* Decorative circular outline */}
            <div className="hidden md:flex items-center justify-center relative h-56">
              <div className="w-48 h-48 rounded-[45%_55%_60%_40%/50%_45%_55%_50%] border-2 border-rose-200/60 animate-pulse" style={{ animationDuration: '4s' }} />
              <Sparkles size={22} className="absolute top-4 right-8 text-amber-400/70" />
            </div>
          </div>

          {/* Stat mini cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel rounded-2xl p-4 bg-white/75 border border-stone-200/40 flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                <Droplet size={16} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wide block">Days Logged</span>
                <span className="text-sm font-bold text-stone-800">{loggedPeriods.length} total</span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4 bg-white/75 border border-stone-200/40 flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                <Zap size={16} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wide block">Fertile Window</span>
                <span className="text-sm font-bold text-stone-800 capitalize">
                  {todayInfo.isFertile ? 'Active now' : todayInfo.cycleDay ? 'Not now' : 'Log period first'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="glass-panel rounded-3xl p-6 bg-rose-50/50 border border-rose-100/60">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles size={14} className="text-rose-500" />
              <span className="font-mono text-xs font-bold text-stone-800 uppercase tracking-wide">AI Insight</span>
            </div>
            <p className="text-sm text-stone-700 italic leading-relaxed">
              {loggedPeriods.length >= 2
                ? 'Your logged data is building a pattern. Check back after a full cycle for personalized insights.'
                : 'Log a few period days to start receiving insights based on your patterns.'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-6">

          {/* Quick Log */}
          <div className="glass-panel rounded-3xl p-6 bg-white/75 border border-stone-200/40">
            <h3 className="font-sans text-lg font-bold text-stone-900 mb-4">Quick Log</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Mood', icon: Smile },
                { label: 'Symptoms', icon: Heart },
                { label: 'Sleep', icon: Moon },
                { label: 'Activity', icon: Activity },
              ].map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  className="p-4 rounded-2xl bg-rose-50/60 hover:bg-rose-100/60 border border-rose-100/50 flex flex-col items-center justify-center space-y-1.5 transition-colors cursor-pointer"
                >
                  <Icon size={18} className="text-rose-500" />
                  <span className="text-xs font-mono font-semibold text-stone-700">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mini Calendar (This Week strip) — click to toggle period */}
          <div className="glass-panel rounded-3xl p-6 bg-white/75 border border-stone-200/40">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans text-lg font-bold text-stone-900">This Week</h3>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-[10px] font-mono font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wide cursor-pointer"
              >
                View Full →
              </button>
            </div>

            <div className="grid grid-cols-8 gap-1.5 text-center mb-2">
              {stripDays.map((date) => {
                const info = getDayInfo(date, loggedPeriods, cycleLength);
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => togglePeriodDay(date)}
                    className="flex flex-col items-center space-y-1 cursor-pointer"
                  >
                    <span className="text-[9px] font-mono text-stone-400">
                      {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-all ${
                        info.isPeriod
                          ? 'bg-rose-500 text-white shadow-sm'
                          : info.isFertile
                          ? 'bg-emerald-100 text-emerald-700'
                          : info.isToday
                          ? 'ring-2 ring-rose-300 text-stone-700'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-4 pt-2 border-t border-stone-100 mt-2 text-[10px] font-mono text-stone-500">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 block" />
                <span>Period</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
                <span>Fertile</span>
              </div>
            </div>
          </div>

          {/* Fact of the Day */}
          <div className="rounded-3xl overflow-hidden relative h-56 shadow-md group cursor-pointer">
            <img
              src="/src/assets/images/fact_rose.jpg"
              alt="Fact of the day"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 space-y-1">
              <span className="text-[10px] font-mono text-rose-200 uppercase tracking-wider">Fact of the Day</span>
              <h4 className="text-white text-lg font-sans font-bold">The Power of Estrogen</h4>
              <p className="text-white/80 text-xs leading-relaxed">
                In your follicular phase, rising estrogen levels can improve your verbal memory and social coordination.
              </p>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}