import React from 'react';
import { RefreshCw } from 'lucide-react';

export const Skeleton = ({ rows = 3 }) => (
  <div className="space-y-3 animate-pulse" role="status" aria-label="불러오는 중">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="h-10 rounded-xl bg-panel" />
    ))}
  </div>
);

export const ErrorMessage = ({ onRetry }) => (
  <div className="text-center py-6" role="alert">
    <p className="text-body mb-3">데이터를 불러오지 못했어요.</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-full border border-line-strong text-accent-strong hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      <RefreshCw className="w-4 h-4" aria-hidden="true" />
      다시 시도
    </button>
  </div>
);

export const EmptyMessage = () => (
  <div className="text-center py-6">
    <p className="text-muted">아직 표시할 회차가 없어요</p>
  </div>
);

// 데이터가 이미 있으면 재요청 중에도 기존 내용을 유지한다.
const AsyncState = ({ loading, error, hasData, onRetry, rows, children }) => {
  if (hasData) return children;
  if (error) return <ErrorMessage onRetry={onRetry} />;
  if (loading) return <Skeleton rows={rows} />;
  return <EmptyMessage />;
};

export default AsyncState;
