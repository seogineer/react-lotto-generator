import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { LOTTO_MAX, PICK_COUNT, getBallTone } from '../utils/lotto';
import { playTick } from '../utils/sound';
import { TONE_TEXT } from './NumberBall';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const Reel = ({ value, spinning, runId }) => {
  const [display, setDisplay] = useState(null);

  useEffect(() => {
    if (!spinning || prefersReducedMotion()) return undefined;
    const id = setInterval(() => setDisplay(1 + Math.floor(Math.random() * LOTTO_MAX)), 70);
    return () => clearInterval(id);
  }, [spinning]);

  const shown = spinning ? display : value;

  return (
    <div className="relative w-10 h-16 sm:w-20 sm:h-28 rounded-lg overflow-hidden bg-gradient-to-b from-zinc-400 via-white to-zinc-400 ring-2 ring-yellow-500 shadow-[inset_0_0_14px_rgba(0,0,0,0.7)]">
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 m-0.5 rounded-md">
        <span
          key={spinning ? 'spin' : `stop-${runId}`}
          className={`font-display font-black text-2xl sm:text-5xl ${shown ? TONE_TEXT[getBallTone(shown)] : 'text-yellow-400'}
                      ${spinning ? 'blur-[1.5px] scale-y-110' : 'animate-reel-stop'}`}
        >
          {shown || '7'}
        </span>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/70 via-transparent to-black/70" />
    </div>
  );
};

const SlotMachine = ({ values, spinning, runId, onSpin, soundOn }) => {
  const isGenerating = spinning.some(Boolean);

  useEffect(() => {
    if (!soundOn || !isGenerating) return undefined;
    const id = setInterval(playTick, 110);
    return () => clearInterval(id);
  }, [soundOn, isGenerating]);

  return (
    <>
      <div className="flex justify-center items-center gap-3 sm:gap-5 mb-6">
        <div className="relative rounded-2xl sm:rounded-3xl p-2 sm:p-4 bg-gradient-to-b from-red-700 to-red-950 ring-4 ring-yellow-500 shadow-glow-gold">
          <div className="relative flex gap-1.5 sm:gap-3 p-2 sm:p-3 rounded-xl bg-black/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]" aria-hidden="true">
            {Array.from({ length: PICK_COUNT }, (_, i) => (
              <Reel key={i} value={values[i]} spinning={spinning[i]} runId={runId} />
            ))}
          </div>
        </div>

        <button
          onClick={onSpin}
          disabled={isGenerating}
          aria-label="레버 당기기"
          className="hidden sm:flex flex-col items-center disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
        >
          <span className={`w-8 h-8 rounded-full bg-gradient-to-b from-red-400 to-red-700 ring-2 ring-yellow-300 shadow-glow-gold transition-transform duration-300 ${isGenerating ? 'translate-y-12' : ''}`} />
          <span className="w-2 h-16 -mt-1 bg-gradient-to-r from-zinc-300 to-zinc-500 rounded" />
          <span className="w-6 h-3 bg-yellow-600 rounded-b-lg" />
        </button>
      </div>

      <button
        onClick={onSpin}
        disabled={isGenerating}
        className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 min-h-[48px] bg-gradient-to-b from-red-500 to-red-700 text-yellow-100 text-lg font-bold rounded-full
                 ring-4 ring-yellow-400 shadow-glow-gold hover:brightness-110 transition-all duration-200
                 focus:outline-none focus-visible:ring-white
                 disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin w-5 h-5" aria-hidden="true" />
            SPINNING...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            번호 생성하기
          </>
        )}
      </button>
      <p className="hidden sm:block mt-2 text-xs text-muted">스페이스바를 눌러도 돌릴 수 있어요</p>
    </>
  );
};

export default SlotMachine;
