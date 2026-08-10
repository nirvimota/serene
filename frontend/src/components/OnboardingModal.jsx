// src/components/OnboardingModal.jsx
import React, { useState } from 'react';
import { Sparkles, Calendar, Heart, ArrowRight, Check, ShieldCheck, Bell } from 'lucide-react';
import { useToast } from './Toast';

export default function OnboardingModal({ isOpen, onClose, cycleData, userName }) {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [cycleLength, setCycleLength] = useState(28);
  const [lastPeriodDate, setLastPeriodDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [hasLastPeriod, setHasLastPeriod] = useState(true);

  if (!isOpen) return null;

  const handleFinish = async () => {
    try {
      if (cycleData?.setCycleLength) {
        await cycleData.setCycleLength(cycleLength);
      }
      if (hasLastPeriod && lastPeriodDate && cycleData?.togglePeriodDay) {
        // Log the period date
        const targetDate = new Date(lastPeriodDate);
        await cycleData.togglePeriodDay(targetDate);
        showToast('First period date logged! Predictions calibrated ✨', 'success');
      } else {
        showToast('Welcome to Serene Cycle ✨', 'success');
      }
    } catch (err) {
      console.error('Onboarding save error:', err);
    } finally {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-lg animate-fade-in font-sans">
      <div className="w-full max-w-md rounded-3xl bg-white/95 border border-stone-200/80 shadow-2xl overflow-hidden relative">
        
        {/* Step Indicator Top Bar */}
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-400 to-amber-400 p-[1px] flex items-center justify-center">
              <div className="w-full h-full rounded-md bg-white flex items-center justify-center">
                <Heart size={12} className="text-rose-500" />
              </div>
            </div>
            <span className="text-xs font-mono font-bold tracking-widest text-stone-800 uppercase">
              SETUP // STEP {step} OF 3
            </span>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-5 h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-rose-500' : 'bg-stone-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome & Cycle Calibration */}
        {step === 1 && (
          <div className="p-6 md:p-8 space-y-6 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
              <Sparkles size={24} className="animate-pulse" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                Welcome to Serene, {userName || 'Friend'} ✨
              </h2>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed max-w-xs mx-auto">
                Let's calibrate your biological rhythm in 30 seconds for personalized phase insights and cycle predictions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-3 text-left">
              <div className="flex justify-between font-mono text-xs text-stone-600 font-bold uppercase">
                <span>Average Cycle Length</span>
                <span className="text-rose-600 font-bold">{cycleLength} Days</span>
              </div>
              <input
                type="range"
                min="21"
                max="35"
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <p className="text-[11px] text-stone-400 font-mono">
                *Most cycles range between 26 to 30 days. You can adjust this anytime in settings.
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-mono text-xs font-bold shadow-md hover:shadow-rose-400/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>NEXT: LOG RECENT PERIOD</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Step 2: Last Period Date */}
        {step === 2 && (
          <div className="p-6 md:p-8 space-y-6 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Calendar size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                When did your last period start?
              </h2>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed max-w-xs mx-auto">
                This helps us predict your upcoming fertile window, ovulation, and next cycle start date.
              </p>
            </div>

            {hasLastPeriod ? (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-3 text-left">
                <label className="text-[10px] font-mono text-stone-400 tracking-wider block uppercase">Period Start Date</label>
                <input
                  type="date"
                  value={lastPeriodDate}
                  onChange={(e) => setLastPeriodDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-stone-200 text-xs font-mono font-bold text-stone-800 outline-none focus:border-rose-400"
                />
              </div>
            ) : null}

            <div className="flex items-center justify-center space-x-2 text-xs">
              <input
                type="checkbox"
                id="no-period-check"
                checked={!hasLastPeriod}
                onChange={(e) => setHasLastPeriod(!e.target.checked)}
                className="rounded text-rose-500 focus:ring-rose-400"
              />
              <label htmlFor="no-period-check" className="text-stone-600 font-mono text-xs cursor-pointer">
                I'm not sure / skip for now
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl border border-stone-200 text-stone-600 font-mono text-xs font-bold hover:bg-stone-50 transition-all cursor-pointer"
              >
                BACK
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-mono text-xs font-bold shadow-md hover:shadow-rose-400/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>CONTINUE</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Privacy & Finish */}
        {step === 3 && (
          <div className="p-6 md:p-8 space-y-6 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                Your Data Sovereignty Guaranteed 🔒
              </h2>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed max-w-xs mx-auto">
                Serene Cycle never sells your period logs or health data. Your entries are private, encrypted, and owned entirely by you.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs text-stone-700 font-semibold">
                <Check size={14} className="text-emerald-500 shrink-0" />
                <span>Phase-aware food & hydration guidance</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-700 font-semibold">
                <Check size={14} className="text-emerald-500 shrink-0" />
                <span>Smart ovulation & period notifications</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-700 font-semibold">
                <Check size={14} className="text-emerald-500 shrink-0" />
                <span>End-to-end user data isolation via Supabase RLS</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>EXPLORE MY SERENE DASHBOARD</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
