import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sliders,
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Auth({ onAuthSuccess, initialMode = 'login', onBackToLanding }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [customCycleLength, setCustomCycleLength] = useState(28);
  const [customPeriodLength, setCustomPeriodLength] = useState(5);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');

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

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all core credentials.');
      return;
    }
    if (mode === 'signup' && !fullName) {
      setError('Please supply your full name for cycle matching.');
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    try {
      if (mode === 'signup') {
        setLoadingStep(0); // "Authenticating secure credentials..."
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              avg_cycle_length: customCycleLength,
              avg_period_length: customPeriodLength,
            },
          },
        });
        if (signUpError) throw signUpError;

        if (!data.session) {
          setLoading(false);
          setError('Check your email to confirm your account, then log in.');
          setMode('login');
          return;
        }

        setLoadingStep(1);
        onAuthSuccess(data.user);

        setLoadingStep(1); // "Calibrating hormonal phase indicators..."
        // profiles row already exists via the on_auth_user_created trigger —
        // just update it with the cycle-length sliders from this form.
        const { data: updatedRows, error: profileError } = await supabase
          .from('profiles')
          .update({
            avg_cycle_length: customCycleLength,
            avg_period_length: customPeriodLength,
          })
          .eq('id', data.user.id)
          .select(); // <-- forces it to return the updated row(s)

        if (profileError) throw profileError;
        console.log('Profile update result:', updatedRows); // [] means RLS blocked it silently

        setLoadingStep(2); // "Generating custom glassmorphic canvas..."
        onAuthSuccess(data.user);
      } else {
        setLoadingStep(0);
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        setLoadingStep(2);
        onAuthSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div id="auth-container" className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">

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

      {/* Decorative Aura Spotlights */}
      <div className="absolute top-[20%] left-[30%] w-96 h-96 bg-rose-200/40 rounded-full filter blur-[100px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] right-[30%] w-96 h-96 bg-amber-100/30 rounded-full filter blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <div
        id="auth-glass-card"
        className="w-full max-w-md rounded-3xl p-6 md:p-8 relative z-20 border border-white/40 bg-white/45 shadow-xl shadow-stone-200/10 transition-all duration-500 ease-out"
        style={{
          backdropFilter: 'blur(24px) saturate(130%)',
          boxShadow: '0 20px 50px -15px rgba(244, 63, 94, 0.08)'
        }}
      >

        {/* Card Header & Brand Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-rose-400 to-amber-400 p-1px shadow-md mb-4 flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
              <Heart size={20} className="text-rose-500 animate-pulse" />
            </div>
          </div>

          <h2 className="text-2xl font-sans font-extrabold tracking-tight text-stone-900">
            {mode === 'login' ? 'Sync Your Aura Account' : 'Initialize Your Bio-Cycle'}
          </h2>
          <p className="text-xs text-stone-500 mt-1.5 font-mono tracking-wider uppercase">
            {mode === 'login' ? 'BIOMETRIC SECURE LOGIN' : 'CREATE BIOLOGICAL PROFILE'}
          </p>
        </div>

        {/* Tab Toggle */}
        {!loading && (
          <div className="flex bg-stone-100/80 p-1.5 rounded-2xl mb-6 border border-stone-200/40">
            <button
              type="button"
              id="auth-tab-login"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all ${mode === 'login'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-400 hover:text-stone-700'
                }`}
            >
              LOGIN
            </button>
            <button
              type="button"
              id="auth-tab-signup"
              onClick={() => {
                setMode('signup'); setError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all ${mode === 'signup'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-400 hover:text-stone-700'
                }`}
            >
              SIGN UP
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-mono flex items-center space-x-2 animate-shake">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Phase Animation */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-stone-100 border-t-rose-500 animate-spin" />
              <Sparkles size={20} className="text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-mono font-bold text-stone-800 tracking-wider">
                {loadingStep === 0 && 'VALIDATING SECURE LEDGER...'}
                {loadingStep === 1 && 'METABOLIC PROFILE ALIGNMENT...'}
                {loadingStep === 2 && 'PREPARING DIGITAL CANVAS...'}
              </p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                {loadingStep === 0 && 'Confirming authorization credentials with Supabase Auth.'}
                {loadingStep === 1 && 'Saving your cycle-length preferences to your profile.'}
                {loadingStep === 2 && 'Loading your dashboard...'}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">

            {/* Full Name (Sign Up only) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-stone-400 tracking-wider block uppercase">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    id="auth-input-fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Emma Vance"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border border-stone-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/35 outline-none text-xs text-stone-800 transition-all font-sans"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-stone-400 tracking-wider block uppercase">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  id="auth-input-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="emma@auracycle.io"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border border-stone-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/35 outline-none text-xs text-stone-800 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[10px] font-mono text-stone-400 tracking-wider block uppercase">Password</label>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock size={14} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="auth-input-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/80 border border-stone-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/35 outline-none text-xs text-stone-800 transition-all font-sans"
                />
                <button
                  type="button"
                  id="auth-btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Sliders for Cycle Configurations (Sign Up only) */}
            {mode === 'signup' && (
              <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/50 space-y-3 mt-4">
                <div className="flex items-center space-x-1 text-rose-500 mb-1">
                  <Sliders size={12} />
                  <span className="text-[9px] font-mono font-bold tracking-widest uppercase">Default Biological Calibration</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[9px] text-stone-500 font-bold uppercase">
                    <span>Average Cycle Length</span>
                    <span>{customCycleLength} Days</span>
                  </div>
                  <input
                    type="range"
                    min="21"
                    max="35"
                    value={customCycleLength}
                    onChange={(e) => setCustomCycleLength(Number(e.target.value))}
                    className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-700"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[9px] text-stone-500 font-bold uppercase">
                    <span>Average Period Duration</span>
                    <span>{customPeriodLength} Days</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="9"
                    value={customPeriodLength}
                    onChange={(e) => setCustomPeriodLength(Number(e.target.value))}
                    className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-700"
                  />
                </div>
              </div>
            )}

            {/* Authentication Submit Button */}
            <button
              type="submit"
              id="auth-btn-submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-mono text-xs font-bold transition-all duration-300 shadow-md hover:shadow-rose-400/10 active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>{mode === 'login' ? 'ESTABLISH SECURE LINK' : 'INITIALIZE BIO-PROFILE'}</span>
              <ArrowRight size={13} />
            </button>

            {/* Back button */}
            <div className="pt-2 text-center flex flex-col items-center space-y-2">
              <button
                type="button"
                onClick={onBackToLanding}
                className="text-[10px] font-mono text-stone-400 hover:text-stone-600 tracking-wider uppercase underline"
              >
                Back to landing page
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}