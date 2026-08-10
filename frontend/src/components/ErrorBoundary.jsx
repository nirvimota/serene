// src/components/ErrorBoundary.jsx
import React, { Component } from 'react';
import { Heart, RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Serene Cycle Uncaught Error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fdfaf8] flex flex-col items-center justify-center p-6 text-stone-800 relative overflow-hidden font-sans">
          {/* Ambient Glow background */}
          <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-rose-200/50 blur-[130px] pointer-events-none" />
          
          <div className="w-full max-w-md p-8 rounded-3xl bg-white/80 border border-stone-200/80 shadow-2xl backdrop-blur-xl text-center space-y-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-500 shadow-sm">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                Something took a quiet pause
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
                An unexpected interface error occurred. Don't worry, your biological data and cycle logs are completely safe.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-[11px] font-mono text-stone-500 overflow-x-auto text-left max-h-24">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-mono text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
            >
              <RefreshCw size={14} />
              <span>RELOAD SERENE CANVAS</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
