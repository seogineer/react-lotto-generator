import React from 'react';
import Generator from './components/Generator';
import LatestDraw from './components/LatestDraw';
import Statistics from './components/Statistics';
import WinningNumbers from './components/WinningNumbers';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

const LottoApp = () => (
  <ErrorBoundary>
  <div className="min-h-screen app-bg text-body">
    <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-10 space-y-4 sm:space-y-6">
      <ErrorBoundary><Generator /></ErrorBoundary>
      <ErrorBoundary><LatestDraw /></ErrorBoundary>
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        <ErrorBoundary><Statistics /></ErrorBoundary>
        <ErrorBoundary><WinningNumbers /></ErrorBoundary>
      </div>
      <Footer />
    </main>
  </div>
  </ErrorBoundary>
);

export default LottoApp;
