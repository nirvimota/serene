import React, { useState, useEffect, useMemo, useRef } from 'react';

import { getDayInfo, toKey, stripTime, getCyclePredictions } from '../utils/cycleUtils';
import { Droplet, ChevronLeft, ChevronRight, Thermometer, AlertTriangle, X, Stethoscope, TrendingUp, Sparkles, CalendarDays, Download } from 'lucide-react';
import { getDayLog, upsertDayLog } from '../api/cycleapi.js';
import { useToast } from '../components/Toast.jsx';
import { supabase } from '../supabaseClient';
import SymptomAnalytics from '../components/SymptomAnalytics.jsx';



export default function Calendar({ activeNav, onNavigate, cycleData }) {
  const { loggedPeriods, cycleLength, selectedDate, setSelectedDate, togglePeriodDay } = cycleData;
  const { showToast } = useToast();
  const [viewMonth, setViewMonth] = useState(new Date(selectedDate));
  const [activeTab, setActiveTab] = useState('flow');
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptomText, setCustomSymptomText] = useState('');
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [notesText, setNotesText] = useState('');
  const [dayLogLoading, setDayLogLoading] = useState(false);
  const [showPeriodConfirm, setShowPeriodConfirm] = useState(false);
  const dayDetailsRef = useRef(null);
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
  const handleLogPeriod = () => setShowPeriodConfirm(true);
  const confirmLogPeriod = async () => {
    if (typeof togglePeriodDay === 'function') {
      await togglePeriodDay(selectedDate);
      const isLogged = loggedPeriods.includes(toKey(stripTime(selectedDate)));
      showToast(isLogged ? 'Period day removed ✓' : 'Period day logged! Predictions updated ✨', 'success');
    } else {
      console.warn('togglePeriodDay is not a function — check what cycleData is passing in from the parent.');
    }
    setShowPeriodConfirm(false);
  };
  const handleGoToSymptoms = () => {
    setActiveTab('symptoms');
    dayDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

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

  // Cycle predictions based on the last 5 months of logged period starts
  const predictions = useMemo(
    () => getCyclePredictions(loggedPeriods, cycleLength || 28, 5),
    [loggedPeriods, cycleLength]
  );

  const daysUntilNextPeriod = predictions.predictedNextPeriodStart
    ? Math.round((stripTime(predictions.predictedNextPeriodStart) - stripTime(new Date())) / 86400000)
    : null;

  const formatShortDate = (date) =>
    date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

  // Bar chart of real logged cycle lengths (history), scaled against a
  // sensible day range so short/long cycles are still readable.
  const cycleChartMax = useMemo(() => {
    if (!predictions.history.length) return 35;
    return Math.max(35, predictions.longestCycle + 4);
  }, [predictions]);

  const buildCycleBar = (length, i, total) => {
    const w = 560, h = 140, pad = 20;
    const barGap = 14;
    const barWidth = (w - pad * 2 - barGap * (total - 1)) / total;
    const x = pad + i * (barWidth + barGap);
    const barHeight = (length / cycleChartMax) * (h - pad * 2);
    const y = h - pad - barHeight;
    return { x, y, width: barWidth, height: barHeight };
  };

  useEffect(() => {
    if (!cycleData?.userId) return;
    setDayLogLoading(true);
    const dateKey = toKey(stripTime(selectedDate));
    getDayLog(cycleData.userId, dateKey)
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
      const dateKey = toKey(stripTime(selectedDate));
      await upsertDayLog(cycleData.userId, dateKey, { flow: flow.toLowerCase() });
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
      const dateKey = toKey(stripTime(selectedDate));
      await upsertDayLog(cycleData.userId, dateKey, { symptoms: updated });
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
      const dateKey = toKey(stripTime(selectedDate));
      await upsertDayLog(cycleData.userId, dateKey, { symptoms: updated });
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
      const dateKey = toKey(stripTime(selectedDate));
      await upsertDayLog(cycleData.userId, dateKey, { mood: updated });
    } catch (err) {
      console.error('Failed to save mood:', err);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const dateKey = toKey(stripTime(selectedDate));
      await upsertDayLog(cycleData.userId, dateKey, { notes: notesText });
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };


  return (
    <div className="min-h-screen bg-[#fdfaf8] text-stone-800 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full bg-rose-200/30 blur-[130px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="fixed bottom-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber-100/30 blur-[130px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s', animationDelay: '3s' }} />



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
                className="w-full bg-gradient-to-br from-rose-700 to-rose-900 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-rose-200 transition-all"
              >
                <Droplet size={13} /> {selectedInfo.isPeriod ? 'Remove Period Day' : 'Log Period'}
              </button>
              <button
                onClick={handleGoToSymptoms}
                className="w-full bg-gradient-to-br from-amber-600 to-amber-800 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-amber-200 transition-all"
              >
                <Stethoscope size={13} /> Log Symptoms
              </button>
              <button
                onClick={async () => {
                  try {
                    const { data: logs, error } = await supabase
                      .from('cycle_logs')
                      .select('*')
                      .eq('user_id', cycleData?.userId)
                      .order('log_date', { ascending: true });

                    if (error) throw error;
                    if (!logs || logs.length === 0) {
                      showToast('No logged period history to export', 'info');
                      return;
                    }

                    const headers = ['log_date', 'is_period', 'is_cycle_start', 'flow', 'symptoms', 'mood', 'basal_temp', 'notes'];
                    const rows = logs.map(l => headers.map(h => JSON.stringify(l[h] ?? '')).join(','));
                    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');

                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `serene_cycle_report_${new Date().toISOString().slice(0, 10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    showToast('Exported cycle report to CSV ✓', 'success');
                  } catch (err) {
                    showToast('Export failed: ' + (err.message || 'Error'), 'error');
                  }
                }}
                className="w-full bg-white/70 border border-stone-200 text-stone-600 text-xs font-semibold py-2.5 rounded-xl cursor-pointer hover:bg-stone-50 transition-all flex items-center justify-center gap-1.5"
              >
                <Download size={13} className="text-stone-500" />
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
          <div ref={dayDetailsRef} className="lg:col-span-3 rounded-3xl p-6 bg-white/75 border border-stone-200/40 backdrop-blur-md flex flex-col gap-4">
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

        {/* BOTTOM — Cycle Predictions (replaces old fake Insights & Trends) */}
        <div className="rounded-3xl p-6 bg-white/75 border border-stone-200/40 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={16} className="text-rose-600" />
            <h3 className="text-lg font-sans font-extrabold text-stone-900">Cycle Predictions</h3>
          </div>
          <p className="text-xs text-stone-400 font-mono mb-5">
            Based on your logged periods over the last 5 months.
          </p>

          {predictions.hasEnoughData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Cycle length history — real bar chart, no fabricated data */}
              <div className="lg:col-span-2">
                <p className="text-[11px] font-mono text-stone-500 mb-2">Cycle length by period, most recent on the right</p>
                <svg viewBox="0 0 560 140" className="w-full h-36">
                  {predictions.history.map((entry, i) => {
                    const { x, y, width, height } = buildCycleBar(entry.length, i, predictions.history.length);
                    return (
                      <g key={i}>
                        <rect x={x} y={y} width={width} height={height} rx="4" fill="#e11d48" opacity={i === predictions.history.length - 1 ? 1 : 0.35} />
                        <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#78716c">
                          {entry.length}d
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div
                  className="grid text-center text-[10px] font-mono text-stone-400 mt-1"
                  style={{ gridTemplateColumns: `repeat(${predictions.history.length}, minmax(0, 1fr))` }}
                >
                  {predictions.history.map((entry, i) => (
                    <span key={i}>{formatShortDate(entry.endDate)}</span>
                  ))}
                </div>
              </div>

              {/* Prediction cards */}
              <div className="flex flex-col gap-3">
                <div className="rounded-xl bg-rose-50 p-4 flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <Droplet size={14} className="text-rose-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Next Period Predicted</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {formatShortDate(predictions.predictedNextPeriodStart)}
                      {daysUntilNextPeriod !== null && (
                        <> — {daysUntilNextPeriod > 0 ? `in ${daysUntilNextPeriod} days` : daysUntilNextPeriod === 0 ? 'today' : `${Math.abs(daysUntilNextPeriod)} days overdue`}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4 flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Sparkles size={14} className="text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Predicted Fertile Window</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {formatShortDate(predictions.predictedFertileStart)} – {formatShortDate(predictions.predictedFertileEnd)}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50 p-4 flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <TrendingUp size={14} className="text-amber-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Avg. Cycle Length</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {predictions.avgCycleLength} days, based on {predictions.cyclesUsed} recent cycle{predictions.cyclesUsed === 1 ? '' : 's'}
                      {predictions.shortestCycle !== predictions.longestCycle && (
                        <> ({predictions.shortestCycle}–{predictions.longestCycle} day range)</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-stone-50 p-4 flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                <TrendingUp size={14} className="text-stone-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">Not Enough Data Yet</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Log at least two full periods and predictions will appear here automatically.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Symptom & Mood Spectrum Analytics ── */}
        <SymptomAnalytics userId={cycleData?.userId} />

      </main>

      {/* ── Period Confirmation Modal ── */}
      {showPeriodConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPeriodConfirm(false)}>
          <div
            className="relative bg-white rounded-3xl p-8 max-w-sm w-[90%] shadow-2xl border border-stone-200/60"
            style={{ animation: 'modalIn .25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPeriodConfirm(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={14} className="text-stone-500" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-rose-600" />
              </div>
              <h4 className="text-lg font-extrabold text-stone-900">
                {selectedInfo.isPeriod ? 'Remove Period Day?' : 'Log Period Day?'}
              </h4>
            </div>

            <p className="text-sm text-stone-500 leading-relaxed mb-6">
              {selectedInfo.isPeriod
                ? <>You are about to <strong className="text-stone-700">remove</strong> <strong className="text-rose-600">{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> from your period days. This will update your cycle predictions.</>
                : <>You are about to mark <strong className="text-rose-600">{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> as a <strong className="text-stone-700">period day</strong>. This will update your cycle predictions.</>
              }
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPeriodConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-600 text-sm font-semibold cursor-pointer hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogPeriod}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-rose-600 to-rose-800 text-white text-sm font-bold cursor-pointer hover:shadow-lg hover:shadow-rose-200 transition-all"
              >
                {selectedInfo.isPeriod ? 'Yes, Remove' : 'Yes, Log Period'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.92) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}


/*Recent work in this session:

Project: Serene Cycle (React + Vite menstrual tracking app, rose/amber glassmorphism aesthetic, stone/rose/emerald/amber Tailwind palette, `font-sans`/`font-mono` mix, `glass-panel` class, Supabase backend)

1. Learn.jsx — Added real, sourced articles (ACOG, Mayo Clinic, Cleveland Clinic, etc.) on birth control, pregnancy science, and period myths vs. facts. Updated the existing `MYTHS` array with sourced links, and added a new "Trusted Reads" section (tabbed: Birth Control / Pregnancy Science / Period Science) between the Myths section and Resource Library. All links open the real source rather than reproducing article text (copyright-safe).

2. Calendar.jsx bug fix — `confirmLogPeriod` was calling `togglePeriodDay(selectedDate)` from the `cycleData` prop, plus a broken direct Supabase write attempt (wrong column name `isPeriod` that doesn't exist on `cycle_logs`) — removed that bad write, kept it calling `togglePeriodDay` only. Confirmed working now.

3. Cycle predictions built from real data (no fabricated inputs):

   * `cycleUtils.js` — added `getCyclePredictions(loggedPeriods, fallbackCycleLength, monthsBack)`. It clusters the flat `loggedPeriods` array (one key per logged day) into actual period start dates, computes real cycle lengths (gaps between starts) from the last 5 months, averages them, and returns: `avgCycleLength`, `shortestCycle`/`longestCycle`, `cyclesUsed`, `history` (array of `{length, endDate}` per cycle — for charting), `predictedNextPeriodStart`, `predictedOvulationDate`, `predictedFertileStart/End`, `hasEnoughData`.

   * `Calendar.jsx` — the old "Insights & Trends" section used fake random energy/sleep data with no real user input backing it. Fully replaced with a "Cycle Predictions" section: a real bar chart of logged cycle lengths (`predictions.history`) on the left, and three cards on the right (Next Period Predicted, Predicted Fertile Window, Avg. Cycle Length). Shows a "Not Enough Data Yet" empty state if fewer than 2 periods are logged.



Other apps in scope: vestIQ (Indian stock trading app), YieldWise (AgriTech dashboard), portfolio site "Built by Nirvi" — not touched this session.

Open items / things to watch:



* Haven't seen the parent component/hook that defines `togglePeriodDay` and constructs the `cycleData` object — if further Calendar bugs come up, that file will likely be needed.

* The `pointer-none` typo (should be `pointer-events-none`) in Learn.jsx's flowers-layer div was flagged but left as-is since it predates this session — still unfixed in the actual codebase.

* Resource Library section in Learn.jsx (Sexual Health / Hormone Insights / Holistic Wellness cards) still has no `onClick` handlers — untouched, may need wiring later.*/