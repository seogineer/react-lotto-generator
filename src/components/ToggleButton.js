import React from 'react';

const ToggleButton = ({ active, children, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-pressed={active}
    className={`flex items-center justify-center gap-2 px-4 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 ${active
      ? 'bg-brand text-on-brand shadow-sm border-transparent font-semibold'
      : 'bg-panel-strong text-body border-line hover:border-line-strong hover:text-heading'
      }`}
  >
    {children}
  </button>
);

export default ToggleButton;
