import React from 'react';
import { ClipboardList } from 'lucide-react';
import Card from './Card';
import NumberBall from './NumberBall';
import AsyncState from './AsyncState';
import { useFetch } from '../hooks/useFetch';

const LOTTO_API_URL = process.env.REACT_APP_LOTTO_API_URL;

const LatestDraw = () => {
  const { data, loading, error, retry } = useFetch(`${LOTTO_API_URL}/drawings?page=0&size=1`);
  const draw = data?.content?.[0];

  return (
    <Card title={draw ? `최신 회차 번호 · ${draw.round}회` : '최신 회차 번호'} icon={ClipboardList}>
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
                <span className="mx-1 text-muted text-xl" aria-label="보너스">+</span>
                <NumberBall number={bonus} size="md" />
              </div>
              <div className="text-sm text-body space-y-1">
                <p className="text-muted">{year}년 {month}월 {day}일 회차</p>
                <p><span className="text-accent font-medium">1등 지급액</span> {firstWinPrize.toLocaleString()}원 · <span className="text-accent font-medium">1등 인원</span> {firstWinners}명</p>
              </div>
            </div>
          );
        })()}
      </AsyncState>
    </Card>
  );
};

export default LatestDraw;
