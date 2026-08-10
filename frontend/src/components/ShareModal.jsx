// src/components/ShareModal.jsx
import React, { useState } from 'react';
import { X, Share2, Copy, Check, Stethoscope, Heart, Calendar } from 'lucide-react';
import { getDayInfo, getCyclePredictions } from '../utils/cycleUtils';
import { useToast } from './Toast';

export default function ShareModal({ isOpen, onClose, cycleData, user }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { loggedPeriods = [], cycleLength = 28 } = cycleData ?? {};
  const todayInfo = getDayInfo(new Date(), loggedPeriods, cycleLength);
  const predictions = getCyclePredictions(loggedPeriods, cycleLength);

  const userName = user?.user_metadata?.full_name || 'Serene User';
  const lastPeriodStr = predictions.history.length > 0 && predictions.history[predictions.history.length - 1].endDate
    ? new Date(predictions.history[predictions.history.length - 1].endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Not enough data';

  const nextPeriodStr = predictions.predictedNextPeriodStart
    ? new Date(predictions.predictedNextPeriodStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Calculating...';

  const summaryText = `🌸 ${userName}'s Cycle Summary (Serene Cycle)
• Current Phase: ${todayInfo.phase.toUpperCase()} (Day ${todayInfo.cycleDay || '—'})
• Average Cycle Length: ${predictions.avgCycleLength} Days
• Logged Cycles: ${predictions.cyclesUsed}
• Last Period Start: ${lastPeriodStr}
• Next Period Predicted: ${nextPeriodStr}
• Fertile Window: ${predictions.predictedFertileStart ? new Date(predictions.predictedFertileStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—'} to ${predictions.predictedFertileEnd ? new Date(predictions.predictedFertileEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    showToast('Cycle summary copied to clipboard ✓', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-lg rounded-3xl bg-white/95 border border-stone-200/80 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-amber-400 text-white flex items-center justify-center shadow-sm">
              <Share2 size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">Partner & Doctor Share Summary</h3>
              <p className="text-xs font-mono text-stone-400">ENCRYPTED EXPORT CARD</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5">
          
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-3 font-mono text-xs text-stone-700 leading-relaxed">
            <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
              <span className="font-bold text-stone-900 text-sm">{userName}</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] uppercase">
                {todayInfo.phase} Phase
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-stone-400 block text-[9px] uppercase">CYCLE DAY</span>
                <span className="font-bold text-stone-800">Day {todayInfo.cycleDay || '—'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[9px] uppercase">AVG CYCLE LENGTH</span>
                <span className="font-bold text-stone-800">{predictions.avgCycleLength} Days</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[9px] uppercase">LAST PERIOD</span>
                <span className="font-bold text-stone-800">{lastPeriodStr}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[9px] uppercase">NEXT PERIOD</span>
                <span className="font-bold text-rose-600">{nextPeriodStr}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed text-center">
            Easily copy this privacy-focused cycle summary to update your partner or share during a medical consultation.
          </p>

          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'COPIED TO CLIPBOARD!' : 'COPY SUMMARY TO CLIPBOARD'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
