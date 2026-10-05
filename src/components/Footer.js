import React from 'react';
import { BALL_RANGES } from '../utils/lotto';
import { TONE_TILE } from './NumberBall';

const Footer = () => (
  <footer className="text-center text-xs sm:text-sm text-muted space-y-3 pb-6">
    <ul className="flex justify-center flex-wrap gap-x-4 gap-y-2" aria-label="공 색상 범례">
      {BALL_RANGES.map(({ tone, label }) => (
        <li key={tone} className="flex items-center gap-1.5">
          <span className={`w-3.5 h-3.5 rounded-sm border ${TONE_TILE[tone]}`} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
    <p>재미를 위한 번호 생성기이며 어떤 결과도 보장하지 않습니다. 통계 기반 추천도 확률을 높이지 않습니다. 과도한 구매는 삼가 주세요.</p>
  </footer>
);

export default Footer;
