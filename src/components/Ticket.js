import React from 'react';
import { Copy, Share2 } from 'lucide-react';
import { gameLabel } from '../utils/lotto';
import NumberBall from './NumberBall';

const IconButton = ({ label, onClick, children }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="inline-flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-2 rounded-lg text-sm text-amber-300 hover:bg-amber-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
  >
    {children}
  </button>
);

const Ticket = ({ title, sets, onCopy, onShare, canShare }) => (
  <div className="bg-black/30 border border-amber-500/30 rounded-xl p-3 sm:p-4 text-left">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-bold text-white text-sm sm:text-base">{title}</h3>
      <div className="flex">
        <IconButton label="전체 복사" onClick={() => onCopy(sets)}>
          <Copy className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">복사</span>
        </IconButton>
        {canShare && (
          <IconButton label="공유" onClick={() => onShare(sets)}>
            <Share2 className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">공유</span>
          </IconButton>
        )}
      </div>
    </div>
    <ul className="space-y-2">
      {sets.map((set, i) => (
        <li key={i} className="flex items-center gap-2 sm:gap-3">
          {sets.length > 1 && (
            <span className="w-5 font-display font-bold text-amber-400">{gameLabel(i)}</span>
          )}
          <div className="flex gap-1.5 sm:gap-2 flex-1 flex-wrap">
            {set.map((n) => (
              <NumberBall key={n} number={n} size="sm" />
            ))}
          </div>
          <IconButton label={`${gameLabel(i)}게임 복사`} onClick={() => onCopy([set])}>
            <Copy className="w-4 h-4" aria-hidden="true" />
          </IconButton>
        </li>
      ))}
    </ul>
  </div>
);

export default Ticket;
