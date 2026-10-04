import React from 'react';
import { Trophy } from 'lucide-react';
import Card from './Card';
import NumberBall from './NumberBall';
import AsyncState from './AsyncState';
import { useFetch } from '../hooks/useFetch';

const LOTTO_API_URL = process.env.REACT_APP_LOTTO_API_URL;

const LatestDraw = () => {
  const { data, loading, error, retry } = useFetch(`${LOTTO_API_URL}/drawings?page=0&size=1`);
  const draw = data?.content?.[0];

  return (
    <Card title={draw ? `최신 당첨 번호 · ${draw.round}회` : '최신 당첨 번호'} icon={Trophy}>
      <AsyncState loading={loading} error={error} hasData={!!draw} onRetry={retry} rows={1}>
        {draw && (() => {
          const { date, one, two, three, four, five, six, bonus, firstWinPrize, firstWinners } = draw;
          const [year, month, day] = date.split('-');
          return (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
                {[one, two, three, four, five, six].map((n, i) => (
                  <NumberBall key={i} number={n} size="md" />
                ))}
                <span className="mx-1 text-emerald-200/70 text-xl" aria-label="보너스">+</span>
                <NumberBall number={bonus} size="md" />
              </div>
              <div className="text-sm text-emerald-100 space-y-1">
                <p className="text-emerald-200/70">{year}년 {month}월 {day}일 추첨</p>
                <p><span className="text-amber-400 font-medium">1등 상금</span> {firstWinPrize.toLocaleString()}원 · <span className="text-amber-400 font-medium">당첨자</span> {firstWinners}명</p>
              </div>
            </div>
          );
        })()}
      </AsyncState>
    </Card>
  );
};

export default LatestDraw;
