import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trophy } from 'lucide-react';
import Card from './Card';
import NumberBall from './NumberBall';
import AsyncState from './AsyncState';
import { useFetch } from '../hooks/useFetch';

const LOTTO_API_URL = process.env.REACT_APP_LOTTO_API_URL;
const ITEMS_PER_PAGE = 5;

const PageButton = ({ label, onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-emerald-100 hover:bg-amber-400/10 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
  >
    {children}
  </button>
);

const WinningNumbers = () => {
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const { data, loading, error, retry } = useFetch(`${LOTTO_API_URL}/drawings?page=${page - 1}&size=${ITEMS_PER_PAGE}`);
  const totalPages = data?.totalPages ?? 0;

  const goTo = (target) => {
    const next = Math.min(Math.max(1, Number(target) || 1), Math.max(totalPages, 1));
    setPage(next);
    setPageInput(String(next));
  };

  return (
    <Card title="당첨 내역" icon={Trophy}>
      <AsyncState loading={loading} error={error} hasData={!!data} onRetry={retry} rows={4}>
        <div className={`grid gap-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          {data?.content.map(({ round, date, one, two, three, four, five, six, bonus, firstWinners, firstWinPrize }) => (
            <div key={round} className="bg-black/30 border border-amber-500/30 p-3 sm:p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3 text-sm sm:text-base">
                <span className="font-bold text-white">{round}회</span>
                <span className="text-emerald-200/70">{date.split('-')[0]}년 {date.split('-')[1]}월 {date.split('-')[2]}일 추첨</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2.5 mb-3">
                {[one, two, three, four, five, six].map((n, i) => (
                  <NumberBall key={`${round}-${i}`} number={n} size="sm" />
                ))}
                <span className="mx-1 text-emerald-200/70" aria-label="보너스">+</span>
                <NumberBall number={bonus} size="sm" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-sm text-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-medium">1등 상금:</span>
                  <span>{firstWinPrize.toLocaleString()}원</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-medium">당첨자 수:</span>
                  <span>{firstWinners}명</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center flex-wrap gap-1 mt-4 text-sm sm:text-base">
          <PageButton label="첫 페이지" onClick={() => goTo(1)} disabled={page === 1}><ChevronsLeft className="w-5 h-5" /></PageButton>
          <PageButton label="이전 페이지" onClick={() => goTo(page - 1)} disabled={page === 1}><ChevronLeft className="w-5 h-5" /></PageButton>
          <form
            onSubmit={(e) => { e.preventDefault(); goTo(pageInput); }}
            className="flex items-center gap-1 text-emerald-100"
          >
            <input
              type="number"
              min="1"
              max={totalPages || undefined}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => goTo(pageInput)}
              aria-label="페이지 번호"
              className="w-16 min-h-[44px] text-center rounded-lg bg-black/40 border border-amber-500/30 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            />
            <span>/ {totalPages}</span>
          </form>
          <PageButton label="다음 페이지" onClick={() => goTo(page + 1)} disabled={page >= totalPages}><ChevronRight className="w-5 h-5" /></PageButton>
          <PageButton label="마지막 페이지" onClick={() => goTo(totalPages)} disabled={page >= totalPages}><ChevronsRight className="w-5 h-5" /></PageButton>
        </div>
      </AsyncState>
    </Card>
  );
};

export default WinningNumbers;
