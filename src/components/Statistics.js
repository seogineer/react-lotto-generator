import React from 'react';
import { BarChart2, ListOrdered } from 'lucide-react';
import Card from './Card';
import NumberBall from './NumberBall';
import AsyncState from './AsyncState';
import { useFetch } from '../hooks/useFetch';
import { PICK_COUNT } from '../utils/lotto';

const LOTTO_API_URL = process.env.REACT_APP_LOTTO_API_URL;

const Statistics = () => {
  const frequent = useFetch(`${LOTTO_API_URL}/drawings/frequent`);
  const position = useFetch(`${LOTTO_API_URL}/drawings/position/frequent`);

  const frequentList = Array.isArray(frequent.data) ? frequent.data : [];
  const positionList = Array.isArray(position.data) ? position.data : [];
  const maxFrequency = Math.max(1, ...frequentList.map(({ frequency }) => frequency));
  const positionStats = Array.from({ length: PICK_COUNT }, (_, i) => ({
    position: i + 1,
    numbers: positionList.filter((item) => item.position === i + 1).map((item) => item.number),
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card title="출현 빈도 분석" icon={BarChart2}>
        <AsyncState loading={frequent.loading} error={frequent.error} hasData={frequentList.length > 0} onRetry={frequent.retry} rows={5}>
          <div className="grid gap-3">
            {frequentList.map(({ number, frequency }) => (
              <div key={number} className="flex items-center gap-3 sm:gap-4">
                <NumberBall number={number} size="sm" />
                <div className="flex-1">
                  <div className="h-3 sm:h-4 bg-panel-strong rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-300 to-teal-600 transition-all duration-500"
                      style={{ width: `${(frequency / maxFrequency) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-body font-mono tabular-nums min-w-[3rem] sm:min-w-[4rem] text-sm sm:text-base">
                  {frequency}회
                </span>
              </div>
            ))}
          </div>
        </AsyncState>
      </Card>

      <Card title="자리별 빈도 분석" icon={ListOrdered}>
        <AsyncState loading={position.loading} error={position.error} hasData={positionList.length > 0} onRetry={position.retry} rows={6}>
          <div className="grid gap-3">
            {positionStats.map(({ position: pos, numbers }) => (
              <div key={pos} className="flex items-center gap-3 sm:gap-4 bg-panel border border-line p-3 rounded-xl">
                <span className="font-bold text-accent min-w-[3.5rem] text-sm sm:text-base">
                  {pos}번째
                </span>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  {numbers.map((num) => (
                    <NumberBall key={num} number={num} size="sm" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AsyncState>
      </Card>
    </div>
  );
};

export default Statistics;
