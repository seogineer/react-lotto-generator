import React from 'react';

const Card = ({ title, icon: Icon, children, className = '' }) => (
  <section className={`bg-surface backdrop-blur border border-line rounded-2xl shadow-card p-4 sm:p-6 ${className}`}>
    {title && (
      <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-heading mb-4 sm:mb-5">
        {Icon && <Icon className="w-5 h-5 text-gold" aria-hidden="true" />}
        {title}
      </h2>
    )}
    {children}
  </section>
);

export default Card;
