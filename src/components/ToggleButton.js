import React from 'react';

const ToggleButton = ({ active, children, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-pressed={active}
    className={`flex items-center justify-center gap-2 px-4 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-50 ${active
      ? 'bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-600 text-slate-900 shadow-glow-gold border-transparent font-semibold'
      : 'bg-black/40 text-emerald-100 border-amber-500/30 hover:border-amber-400/60 hover:text-white'
      }`}
  >
    {children}
  </button>
);

export default ToggleButton;
