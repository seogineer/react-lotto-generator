import React, { useEffect, useState } from 'react';
import { FlaskConical, Loader2 } from 'lucide-react';
import { LOTTO_MAX, PICK_COUNT } from '../utils/lotto';
import NumberBall from './NumberBall';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// 번호가 확정되기 전에는 숫자를 빠르게 바꿔 보여 주고, 확정되면 번호 공으로 바뀐다.
const Slot = ({ value, spinning, runId }) => {
  const [display, setDisplay] = useState(null);

  useEffect(() => {
    if (!spinning || prefersReducedMotion()) return undefined;
    const id = setInterval(() => setDisplay(1 + Math.floor(Math.random() * LOTTO_MAX)), 70);
    return () => clearInterval(id);
  }, [spinning]);

  if (!spinning && value) {
    return <NumberBall key={`ball-${runId}`} number={value} size="lg" />;
  }

  return (
    <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-lg border-2 border-dashed border-line-strong bg-panel flex items-center justify-center text-lg sm:text-2xl font-bold font-mono text-muted">
      {spinning ? (display ?? '·') : '?'}
    </div>
  );
};

const NumberBoard = ({ values, spinning, runId, onSpin, busy = false, adNotice = '' }) => {
  const isGenerating = spinning.some(Boolean);

  return (
    <>
      <div className="flex justify-center items-center gap-2 sm:gap-4 mb-6" aria-hidden="true">
        {Array.from({ length: PICK_COUNT }, (_, i) => (
          <Slot key={i} value={values[i]} spinning={spinning[i]} runId={runId} />
        ))}
      </div>

      <button
        onClick={onSpin}
        disabled={isGenerating || busy}
        className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 min-h-[48px] bg-brand text-on-brand text-lg font-bold rounded-full
                 shadow-md hover:brightness-110 transition-all duration-200
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2
                 disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        {isGenerating || busy ? (
          <>
            <Loader2 className="animate-spin w-5 h-5" aria-hidden="true" />
            {isGenerating ? '분석 중...' : '준비 중...'}
          </>
        ) : (
          <>
            <FlaskConical className="w-5 h-5" aria-hidden="true" />
            번호 생성하기
          </>
        )}
      </button>
      {adNotice && <p className="mt-2 text-xs text-muted">{adNotice}</p>}
      <p className="hidden sm:block mt-2 text-xs text-muted">스페이스바를 눌러도 생성할 수 있어요</p>
    </>
  );
};

export default NumberBoard;
