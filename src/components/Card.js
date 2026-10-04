import React from 'react';

const Card = ({ title, icon: Icon, children, className = '' }) => (
  <section className={`bg-emerald-950/80 backdrop-blur border border-amber-500/30 rounded-2xl shadow-glow-felt p-4 sm:p-6 ${className}`}>
    {title && (
      <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white mb-4 sm:mb-5">
        {Icon && <Icon className="w-5 h-5 text-amber-400" aria-hidden="true" />}
        {title}
      </h2>
    )}
    {children}
  </section>
);

export default Card;
