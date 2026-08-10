// src/components/ProfileModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Sliders,
  LogOut,
  Trash2,
  ShieldCheck,
  FileText,
  Save,
  Check,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { updateProfile, getProfile } from '../api/cycleapi';
import { useToast } from './Toast';

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  cycleData,
  onOpenPrivacy,
  onOpenTerms,
}) {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [cycleLength, setCycleLength] = useState(cycleData?.cycleLength || 28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      getProfile(user.id).then((profile) => {
        if (profile) {
          if (profile.avg_cycle_length) setCycleLength(profile.avg_cycle_length);
          if (profile.avg_period_length) setPeriodDuration(profile.avg_period_length);
        }
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update Supabase User Metadata (Full Name)
      await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      // 2. Update cycleData state and database
      if (cycleData?.setCycleLength) {
        await cycleData.setCycleLength(cycleLength);
      } else {
        await updateProfile(user.id, { avg_cycle_length: cycleLength, avg_period_length: periodDuration });
      }

      showToast('Profile & cycle preferences updated ✓', 'success');
      onClose();
    } catch (err) {
      console.error('Profile update failed:', err);
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      showToast('Logged out successfully', 'info');
      onClose();
    } catch (err) {
      showToast('Error signing out', 'error');
    }
  };

  const handleDeleteData = async () => {
    if (!user?.id) return;
    setDeleting(true);
    try {
      // Clear user's logs
      await supabase.from('cycle_logs').delete().eq('user_id', user.id);
      await supabase.from('cycles').delete().eq('user_id', user.id);
      showToast('All cycle history permanently cleared', 'success');
      setShowDeleteConfirm(false);
      // reload window or refresh cycleData
      window.location.reload();
    } catch (err) {
      showToast(err.message || 'Failed to clear data', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const userInitial = (fullName?.[0] || user?.email?.[0] || 'S').toUpperCase();

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white/95 border border-stone-200/80 shadow-2xl overflow-hidden font-sans">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {userInitial}
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">Account & Preferences</h3>
              <p className="text-xs font-mono text-stone-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
          
          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            {/* Display Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-stone-400 tracking-wider uppercase block">Display Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 focus:border-rose-400 outline-none text-xs text-stone-800 font-sans"
                />
              </div>
            </div>

            {/* Cycle Calibration Sliders */}
            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/60 space-y-3">
              <div className="flex items-center space-x-1.5 text-rose-500">
                <Sliders size={13} />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Cycle Calibration</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-stone-600 font-bold uppercase">
                  <span>Average Cycle Length</span>
                  <span className="text-rose-600 font-bold">{cycleLength} Days</span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="38"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-stone-600 font-bold uppercase">
                  <span>Default Period Duration</span>
                  <span className="text-rose-600 font-bold">{periodDuration} Days</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="9"
                  value={periodDuration}
                  onChange={(e) => setPeriodDuration(Number(e.target.value))}
                  className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save size={13} />
              <span>{saving ? 'SAVING...' : 'SAVE PREFERENCES'}</span>
            </button>
          </form>

          {/* Legal Links */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-mono text-stone-500">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ShieldCheck size={13} />
              <span>Privacy Policy</span>
            </button>
            <button
              onClick={onOpenTerms}
              className="hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FileText size={13} />
              <span>Terms of Service</span>
            </button>
          </div>

          {/* Data Export (CSV) */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-stone-800">Export Cycle Data</h4>
              <p className="text-[11px] text-stone-400">Download your period dates & symptoms as a CSV file</p>
            </div>
            <button
              onClick={async () => {
                try {
                  const { data: logs, error } = await supabase
                    .from('cycle_logs')
                    .select('*')
                    .eq('user_id', user?.id)
                    .order('log_date', { ascending: true });

                  if (error) throw error;

                  if (!logs || logs.length === 0) {
                    showToast('No logged data available to export yet', 'info');
                    return;
                  }

                  const headers = ['log_date', 'is_period', 'is_cycle_start', 'flow', 'symptoms', 'mood', 'basal_temp', 'notes'];
                  const rows = logs.map(l => headers.map(h => JSON.stringify(l[h] ?? '')).join(','));
                  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');

                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `serene_cycle_export_${new Date().toISOString().slice(0, 10)}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);

                  showToast('Exported cycle history to CSV ✓', 'success');
                } catch (err) {
                  showToast('Export failed: ' + (err.message || 'Error'), 'error');
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save size={12} className="text-rose-500" />
              Export CSV
            </button>
          </div>

          {/* Danger Zone: Account Deletion / Reset */}
          <div className="pt-4 border-t border-stone-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-stone-800">Clear Cycle Data</h4>
                <p className="text-[11px] text-stone-400">Permanently reset all logged periods & journal logs</p>
              </div>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Reset Data
                </button>
              ) : null}
            </div>

            {showDeleteConfirm && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 animate-slide-up">
                <div className="flex items-start gap-2 text-rose-800 text-xs">
                  <AlertTriangle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Are you sure? This will delete all your logged periods and journal entries forever.</span>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1 rounded-lg bg-white border border-stone-200 text-stone-600 text-xs font-mono cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteData}
                    disabled={deleting}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-mono font-bold hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                  >
                    {deleting ? 'Clearing...' : 'Yes, Delete All Data'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-mono text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogOut size={14} />
              <span>LOG OUT OF SERENE</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
