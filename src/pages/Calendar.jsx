import React, { useState, useEffect, useMemo } from 'react';
import TopNav from '../components/TopNav.jsx';
import { getDayInfo, toKey, stripTime } from '../utils/cycleUtils';
import { Droplet, ChevronLeft, ChevronRight, Thermometer, Moon, Zap } from 'lucide-react';
import { getDayLog, upsertDayLog } from '../api/cycleapi.js';


export default function Calendar({ activeNav, onNavigate, cycleData }) {
  const { loggedPeriods, cycleLength, selectedDate, setSelectedDate, togglePeriodDay } = cycleData;
  const [viewMonth, setViewMonth] = useState(new Date(selectedDate));
  const [activeTab, setActiveTab] = useState('flow');
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptomText, setCustomSymptomText] = useState('');
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [notesText, setNotesText] = useState('');
  const [dayLogLoading, setDayLogLoading] = useState(false);
  const [insightsRange, setInsightsRange] = useState('monthly')
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay(); // Sunday-first, matches screenshot header
  const daysInMonth = lastDay.getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const changeMonth = (delta) => setViewMonth(new Date(year, month + delta, 1));
  const handleDayClick = (date) => setSelectedDate(date);
  const handleLogPeriod = () => togglePeriodDay(selectedDate);

  const selectedInfo = getDayInfo(selectedDate, loggedPeriods, cycleLength);

  // day-of-cycle for the ring — falls back gracefully if getDayInfo doesn't expose it
  const dayOfCycle = selectedInfo.dayOfCycle ?? selectedInfo.cycleDay ?? 14;
  const ringPct = Math.min(dayOfCycle / (cycleLength || 28), 1);
  const RADIUS = 52;
  const CIRC = 2 * Math.PI * RADIUS;

  const flowOptions = ['Spotting', 'Light', 'Medium', 'Heavy'];
  const tabs = ['flow', 'symptoms', 'mood', 'notes'];
  const SYMPTOM_OPTIONS = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Nausea', 'Backache', 'Tender Breasts', 'Acne', 'Cravings', 'Insomnia'];
  const MOOD_OPTIONS = ['Happy', 'Calm', 'Irritable', 'Sad', 'Anxious', 'Energetic'];

  // simple inline sparkline data — swap with real logged data when available
  const trendData = useMemo(
    () => [40, 55, 48, 62, 58, 70, 65].map((v, i) => ({ day: i, energy: v, sleep: v - 12 + Math.random() * 10 })),
    [insightsRange]
  );
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const buildPath = (key) => {
    const w = 560, h = 140, pad = 20;
    const max = 100, min = 0;
    return trendData
      .map((d, i) => {
        const x = pad + (i / (trendData.length - 1)) * (w - pad * 2);
        const y = h - pad - ((d[key] - min) / (max - min)) * (h - pad * 2);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  };

  useEffect(() => {
    if (!cycleData?.userId) return;
    setDayLogLoading(true);
    getDayLog(cycleData.userId, selectedDate)
      .then((log) => {
        setSelectedFlow(log?.flow ?? null);
        setSelectedSymptoms(log?.symptoms ?? []);
        setSelectedMoods(log?.mood ?? []);
        setNotesText(log?.notes ?? '');
      })
      .catch((err) => console.error('Failed to load day log:', err))
      .finally(() => setDayLogLoading(false));
  }, [selectedDate, cycleData?.userId]);

  const handleSelectFlow = async (flow) => {
    setSelectedFlow(flow);
    try {
      await upsertDayLog(cycleData.userId, selectedDate, { flow });
    } catch (err) {
      console.error('Failed to save flow:', err);
    }
  };

  const handleToggleSymptom = async (symptom) => {
    const updated = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter((s) => s !== symptom)
      : [...selectedSymptoms, symptom];
    setSelectedSymptoms(updated);
    try {
      await upsertDayLog(cycleData.userId, selectedDate, { symptoms: updated });
    } catch (err) {
      console.error('Failed to save symptoms:', err);
    }
  };

  const handleAddCustomSymptom = async () => {
    const text = customSymptomText.trim();
    if (!text) return;
    const updated = [...selectedSymptoms, text];
    setSelectedSymptoms(updated);
    setCustomSymptomText('');
    try {
      await upsertDayLog(cycleData.userId, selectedDate, { symptoms: updated });
    } catch (err) {
      console.error('Failed to save custom symptom:', err);
    }
  };

  const handleToggleMood = async (mood) => {
    const updated = selectedMoods.includes(mood)
      ? selectedMoods.filter((m) => m !== mood)
      : [...selectedMoods, mood];
    setSelectedMoods(updated);
    try {
      await upsertDayLog(cycleData.userId, selectedDate, { mood: updated });
    } catch (err) {
      console.error('Failed to save mood:', err);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await upsertDayLog(cycleData.userId, selectedDate, { notes: notesText });
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };


  return (
    <div className="min-h-screen bg-[#fdfaf8] text-stone-800 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full bg-rose-200/30 blur-[130px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="fixed bottom-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber-100/30 blur-[130px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s', animationDelay: '3s' }} />

      <TopNav activeNav={activeNav} onNavigate={onNavigate} />

      <main className="relative z-20 max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* 3-panel dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT — Cycle Status */}
          <div className="lg:col-span-3 rounded-3xl p-6 bg-white/75 border border-stone-200/40 backdrop-blur-md flex flex-col gap-5">
            <h3 className="text-lg font-sans font-bold text-stone-900">Cycle Status</h3>

            <div className="relative w-36 h-36 mx-auto">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#f3e4e0" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r={RADIUS} fill="none"
                  stroke="#9f5b4d" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - ringPct)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-stone-900">{dayOfCycle}</span>
                <span className="text-[10px] text-stone-400 font-mono">Day of Cycle</span>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 rounded-xl bg-rose-50 text-center py-2">
                <p className="text-[9px] text-stone-400 font-mono">Current Phase</p>
                <p className="text-xs font-bold text-rose-700">
                  {selectedInfo.isPeriod ? 'Menstrual' : selectedInfo.isFertile ? 'Ovulation' : 'Follicular'}
                </p>
              </div>
              <div className="flex-1 rounded-xl bg-emerald-50 text-center py-2">
                <p className="text-[9px] text-stone-400 font-mono">Status</p>
                <p className="text-xs font-bold text-emerald-700">
                  {selectedInfo.isFertile ? 'Ovulation' : 'Regular'}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed italic">
              "You might feel a surge of energy today. Great time for creative projects or social gatherings."
            </p>

            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              <p className="text-xs font-bold text-stone-700 mb-1">Quick Actions</p>
              <button
                onClick={handleLogPeriod}
                className="w-full bg-gradient-to-br from-rose-700 to-rose-900 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Droplet size={13} /> Log Symptoms
              </button>
              <button className="w-full bg-white/70 border border-stone-200 text-stone-600 text-xs font-semibold py-2.5 rounded-xl cursor-pointer">
                Export Report
              </button>
            </div>
          </div>

          {/* CENTER — Calendar */}
          <div className="lg:col-span-6 rounded-3xl p-6 bg-white/75 border border-stone-200/40 backdrop-blur-md">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-sans font-extrabold text-stone-900">
                {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => changeMonth(-1)} className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center cursor-pointer">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => changeMonth(1)} className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center cursor-pointer">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <p className="text-xs text-stone-400 font-mono mb-5">Your cycle is regular and healthy</p>

            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <span key={i} className="text-[10px] font-mono text-stone-400 font-bold">{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {cells.map((date, i) => {
                if (!date) return <div key={i} className="aspect-square" />;
                const info = getDayInfo(date, loggedPeriods, cycleLength);
                const isSelected = toKey(stripTime(date)) === toKey(stripTime(selectedDate));
                return (
                  <button
                    key={i}
                    onClick={() => handleDayClick(date)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-mono transition-all cursor-pointer relative ${isSelected ? 'ring-2 ring-rose-500' : ''
                      } ${info.isPeriod
                        ? 'bg-rose-100 text-rose-700 font-bold'
                        : info.isFertile
                          ? 'bg-emerald-50 text-emerald-700 font-bold'
                          : info.isPredicted
                            ? 'bg-stone-100 text-stone-500'
                            : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                  >
                    {date.getDate()}
                    {info.isPeriod && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 absolute bottom-1.5" />}
                    {info.isOvulation && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute bottom-1.5" />}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-5 mt-5 border-t border-stone-100 text-[11px] font-mono text-stone-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block" /> <span>Menstruation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-100 border border-emerald-300 block" /> <span>Fertile Window</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-200 block" /> <span>Predicted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-amber-500 block" /> <span>Ovulation Day</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Day Details */}
          <div className="lg:col-span-3 rounded-3xl p-6 bg-white/75 border border-stone-200/40 backdrop-blur-md flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-sans font-bold text-stone-900">
                Day {dayOfCycle} Details
              </h3>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Today</span>
            </div>

            <div className="flex gap-1 bg-rose-50 rounded-xl p-1 text-[10px]">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-center capitalize py-1.5 rounded-lg cursor-pointer transition-all ${activeTab === tab ? 'bg-white text-rose-600 shadow-sm font-bold' : 'text-stone-400'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'flow' && (
              <div>
                <p className="text-[10px] font-mono text-stone-400 mb-2">Flow Intensity</p>
                <div className="grid grid-cols-2 gap-2">
                  {flowOptions.map((flow) => (
                    <button
                      key={flow}
                      onClick={() => handleSelectFlow(flow)}
                      className={`text-center px-2 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${selectedFlow === flow
                        ? 'bg-rose-100 border-2 border-rose-500 text-rose-700'
                        : 'bg-white/70 border border-stone-200 text-stone-600'
                        }`}
                    >
                      {flow}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'symptoms' && (
              <div className="space-y-3">
                <p className="text-[10px] font-mono text-stone-400 mb-1">Symptoms</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {SYMPTOM_OPTIONS.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => handleToggleSymptom(symptom)}
                      className={`text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all ${selectedSymptoms.includes(symptom)
                        ? 'bg-rose-100 border border-rose-400 text-rose-700'
                        : 'bg-white/70 border border-stone-200 text-stone-600'
                        }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    value={customSymptomText}
                    onChange={(e) => setCustomSymptomText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSymptom()}
                    placeholder="Add custom symptom..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/70 border border-stone-200 text-[11px] text-stone-700 focus:outline-none focus:border-rose-300"
                  />
                  <button
                    onClick={handleAddCustomSymptom}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {selectedSymptoms.filter((s) => !SYMPTOM_OPTIONS.includes(s)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedSymptoms.filter((s) => !SYMPTOM_OPTIONS.includes(s)).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-100 text-stone-600">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'mood' && (
              <div>
                <p className="text-[10px] font-mono text-stone-400 mb-2">How are you feeling? (select all that apply)</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => handleToggleMood(mood)}
                      className={`text-center px-2 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${selectedMoods.includes(mood)
                        ? 'bg-rose-100 border-2 border-rose-500 text-rose-700'
                        : 'bg-white/70 border border-stone-200 text-stone-600'
                        }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'notes' && (
              <div className="space-y-2">
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Any additional notes for today..."
                  className="w-full h-24 p-3 rounded-xl bg-white/70 border border-stone-200 text-xs text-stone-700 focus:outline-none focus:border-rose-300 resize-none"
                />
                <button
                  onClick={handleSaveNotes}
                  className="w-full py-2 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer"
                >
                  Save Notes
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="rounded-xl bg-emerald-50 p-3">
                <div className="flex items-center gap-1 text-emerald-700 mb-1">
                  <Thermometer size={12} />
                  <p className="text-[9px] font-mono">Basal Temp</p>
                </div>
                <p className="text-sm font-extrabold text-stone-900">36.8°C</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-3">
                <p className="text-[9px] font-mono text-rose-700 mb-1">Cervical Mucus</p>
                <p className="text-sm font-extrabold text-stone-900">Egg White</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM — Insights & Trends */}
        <div className="rounded-3xl p-6 bg-white/75 border border-stone-200/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-sans font-extrabold text-stone-900">Insights & Trends</h3>
              <p className="text-xs text-stone-400 font-mono">Correlation between energy levels and sleep quality over the last 30 days.</p>
            </div>
            <div className="flex gap-1 bg-stone-100 rounded-full p-1 text-xs">
              <button
                onClick={() => setInsightsRange('monthly')}
                className={`px-4 py-1.5 rounded-full font-semibold cursor-pointer ${insightsRange === 'monthly' ? 'bg-rose-800 text-white' : 'text-stone-500'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setInsightsRange('weekly')}
                className={`px-4 py-1.5 rounded-full font-semibold cursor-pointer ${insightsRange === 'weekly' ? 'bg-rose-800 text-white' : 'text-stone-500'
                  }`}
              >
                Weekly
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-2 text-[11px] font-mono text-stone-500">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Energy</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Sleep Quality</span>
              </div>
              <svg viewBox="0 0 560 140" className="w-full h-36">
                <path d={buildPath('energy')} fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
                <path d={buildPath('sleep')} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <div className="grid grid-cols-7 text-center text-[10px] font-mono text-stone-400 mt-1">
                {weekLabels.map((d) => <span key={d}>{d}</span>)}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-xl bg-emerald-50 p-4 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Moon size={14} className="text-emerald-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Sleep Pattern</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Your sleep duration increases by 15% during the Luteal phase.</p>
                </div>
              </div>
              <div className="rounded-xl bg-rose-50 p-4 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <Zap size={14} className="text-rose-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Energy Peak</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">You log the highest activity levels during the Fertile window.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}