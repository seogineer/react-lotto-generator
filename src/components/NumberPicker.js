import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LOTTO_MAX, MAX_FIXED, nextPickState } from '../utils/lotto';

const NumberPicker = ({ fixed, excluded, onChange, disabled, error }) => {
  const [open, setOpen] = useState(false);

  const stateOf = (n) => (fixed.includes(n) ? 'fixed' : excluded.includes(n) ? 'excluded' : undefined);

  const handleToggle = (n) => {
    const next = nextPickState(stateOf(n));
    // 고정이 가득 찼으면 고정 단계를 건너뛰고 제외로 넘어간다.
    const resolved = next === 'fixed' && fixed.length >= MAX_FIXED ? 'excluded' : next;
    onChange({
      fixed: resolved === 'fixed' ? [...fixed.filter((x) => x !== n), n] : fixed.filter((x) => x !== n),
      excluded: resolved === 'excluded' ? [...excluded.filter((x) => x !== n), n] : excluded.filter((x) => x !== n),
    });
  };

  return (
    <div className="mb-5 text-left max-w-md mx-auto">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 min-h-[44px] rounded-xl border border-amber-500/30 bg-black/30 text-sm text-emerald-100 hover:border-amber-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
      >
        <span>
          고급 옵션 · 고정 {fixed.length}개 / 제외 {excluded.length}개
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="mt-3 p-3 rounded-xl border border-amber-500/20 bg-black/20">
          {disabled ? (
            <p className="text-sm text-emerald-200/70 mb-3">
              추천 번호는 서버가 정해 주기 때문에 고정/제외를 쓸 수 없어요. 랜덤을 선택해 주세요.
            </p>
          ) : (
            <p className="text-sm text-emerald-200/70 mb-3">
              번호를 누를 때마다 <span className="text-amber-300">고정</span> → <span className="line-through">제외</span> → 해제 순으로 바뀌어요. (고정은 최대 {MAX_FIXED}개)
            </p>
          )}
          <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5">
            {Array.from({ length: LOTTO_MAX }, (_, i) => i + 1).map((n) => {
              const state = stateOf(n);
              return (
                <button
                  key={n}
                  onClick={() => handleToggle(n)}
                  disabled={disabled}
                  aria-label={`${n}${state === 'fixed' ? ' 고정됨' : state === 'excluded' ? ' 제외됨' : ''}`}
                  className={`min-h-[40px] rounded-lg text-sm font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-40 ${state === 'fixed'
                    ? 'bg-gradient-to-b from-yellow-200 to-amber-500 text-slate-900 border-transparent'
                    : state === 'excluded'
                      ? 'bg-black/50 text-emerald-100/40 line-through border-white/10'
                      : 'bg-black/30 text-emerald-100 border-amber-500/20 hover:border-amber-400/60'
                    }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
          {!disabled && (fixed.length > 0 || excluded.length > 0) && (
            <button
              onClick={() => onChange({ fixed: [], excluded: [] })}
              className="mt-3 text-sm text-amber-300 underline min-h-[44px]"
            >
              모두 해제
            </button>
          )}
          {error && <p role="alert" className="mt-2 text-sm text-rose-300">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default NumberPicker;
