import React from 'react';
import { getBallTone } from '../utils/lotto';

export const TONE_BALL = {
  yellow: 'bg-yellow-400 text-slate-900 shadow-glow-yellow',
  blue: 'bg-blue-500 text-white shadow-glow-blue',
  red: 'bg-rose-500 text-white shadow-glow-red',
  gray: 'bg-slate-500 text-white shadow-glow-gray',
  green: 'bg-emerald-400 text-slate-900 shadow-glow-green',
};

export const TONE_TEXT = {
  yellow: 'text-yellow-300',
  blue: 'text-sky-400',
  red: 'text-rose-400',
  gray: 'text-slate-300',
  green: 'text-emerald-400',
};

const SIZE = {
  sm: 'w-7 h-7 text-xs sm:w-8 sm:h-8 sm:text-sm',
  md: 'w-10 h-10 text-base sm:w-12 sm:h-12 sm:text-lg',
  lg: 'w-11 h-11 text-lg sm:w-16 sm:h-16 sm:text-2xl',
};

const NumberBall = ({ number, size = 'md' }) => (
  <div
    className={`${SIZE[size]} ${TONE_BALL[getBallTone(number)]}
               rounded-full flex items-center justify-center ball-gloss
               font-bold ring-2 ring-white/40 animate-ball-in`}
  >
    {number}
  </div>
);

export default NumberBall;
