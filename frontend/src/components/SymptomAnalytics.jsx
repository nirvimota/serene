// src/components/SymptomAnalytics.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Sparkles, TrendingUp, Heart, Smile } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function SymptomAnalytics({ userId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('cycle_logs')
      .select('symptoms, mood, flow, log_date')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) setLogs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const { symptomCounts, totalLogs, topSymptom } = useMemo(() => {
    const counts = {};
    let total = 0;
    logs.forEach((log) => {
      if (Array.isArray(log.symptoms)) {
        log.symptoms.forEach((s) => {
          counts[s] = (counts[s] || 0) + 1;
          total++;
        });
      }
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      symptomCounts: sorted,
      totalLogs: logs.length,
      topSymptom: sorted[0] ? sorted[0][0] : null,
    };
  }, [logs]);

  if (loading) {
    return (
      <div className="glass-panel rounded-3xl p-6 bg-white/75 border border-stone-200/40 animate-pulse flex items-center justify-center py-10">
        <span className="text-xs font-mono text-stone-400">Loading symptom spectrum...</span>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-6 bg-white/80 border border-stone-200/40 space-y-4 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Activity size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 leading-tight">Symptom Frequency Spectrum</h3>
            <p className="text-[10px] font-mono text-stone-400 uppercase">ANALYZED OVER {totalLogs} LOGGED DAYS</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 font-mono text-[10px] font-bold">
          ANALYTICS LIVE
        </span>
      </div>

      {symptomCounts.length === 0 ? (
        <div className="py-8 text-center space-y-1">
          <p className="text-xs font-semibold text-stone-600">No symptoms logged yet</p>
          <p className="text-[11px] text-stone-400">Log symptoms in Journal or Calendar to see frequency trends</p>
        </div>
      ) : (
        <div className="space-y-3">
          {symptomCounts.slice(0, 5).map(([symptom, count]) => {
            const pct = Math.min(Math.round((count / Math.max(totalLogs, 1)) * 100), 100);
            return (
              <div key={symptom} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-stone-800">{symptom}</span>
                  <span className="text-stone-500">{count} times ({pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-400 to-purple-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}

          {topSymptom && (
            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100/80 flex items-start gap-2.5 mt-3">
              <Sparkles size={14} className="text-purple-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-stone-600 leading-relaxed">
                <strong className="text-purple-800">{topSymptom}</strong> is your most frequent entry. Consider logging hydration and magnesium intake during luteal phases to mitigate intensity.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
