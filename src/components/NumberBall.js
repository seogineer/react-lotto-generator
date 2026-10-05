import React from 'react';
import { getBallTone } from '../utils/lotto';

// 연구실의 시료 칸(주기율표의 원소 칸)처럼, 얇은 테두리와 연한 색 바탕의 타일로 번호를 보여 준다.
// 번호 구간(1~10, 11~20, ...)별 색 구분은 그대로 유지한다.
export const TONE_TILE = {
  yellow: 'bg-yellow-100 border-yellow-500 text-yellow-900 dark:bg-yellow-400/15 dark:border-yellow-400/60 dark:text-yellow-200',
  blue: 'bg-blue-100 border-blue-500 text-blue-900 dark:bg-blue-400/15 dark:border-blue-400/60 dark:text-blue-200',
  red: 'bg-rose-100 border-rose-500 text-rose-900 dark:bg-rose-400/15 dark:border-rose-400/60 dark:text-rose-200',
  gray: 'bg-slate-200 border-slate-500 text-slate-800 dark:bg-slate-400/15 dark:border-slate-400/60 dark:text-slate-200',
  green: 'bg-emerald-100 border-emerald-500 text-emerald-900 dark:bg-emerald-400/15 dark:border-emerald-400/60 dark:text-emerald-200',
};

const SIZE = {
  sm: 'w-7 h-7 text-xs sm:w-8 sm:h-8 sm:text-sm rounded-md border',
  md: 'w-10 h-10 text-base sm:w-12 sm:h-12 sm:text-lg rounded-lg border-2',
  lg: 'w-11 h-11 text-lg sm:w-16 sm:h-16 sm:text-2xl rounded-lg border-2',
};

const NumberBall = ({ number, size = 'md' }) => (
  <div
    className={`${SIZE[size]} ${TONE_TILE[getBallTone(number)]}
               flex items-center justify-center font-mono font-bold tabular-nums animate-ball-in`}
  >
    {number}
  </div>
);

export default NumberBall;
