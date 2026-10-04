import React from 'react';
import Generator from './components/Generator';
import LatestDraw from './components/LatestDraw';
import Statistics from './components/Statistics';
import WinningNumbers from './components/WinningNumbers';
import Footer from './components/Footer';

const LottoApp = () => (
  <div className="min-h-screen bg-[#03100a] text-emerald-50 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.28),_transparent_60%)]">
    <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-10 space-y-4 sm:space-y-6">
      <Generator />
      <LatestDraw />
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        <Statistics />
        <WinningNumbers />
      </div>
      <Footer />
    </main>
  </div>
);

export default LottoApp;
