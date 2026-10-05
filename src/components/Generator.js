import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BarChart2, FlaskConical, Shuffle, Trash2 } from 'lucide-react';
import Card from './Card';
import ToggleButton from './ToggleButton';
import NumberBoard from './NumberBoard';
import NumberPicker from './NumberPicker';
import Ticket from './Ticket';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { adController } from '../utils/ads';
import {
  PICK_COUNT,
  MAX_GAMES,
  formatTicket,
  generateRandomSets,
  sortNumbers,
  requiresAd,
  validateOptions,
} from '../utils/lotto';

const LOTTO_API_URL = process.env.REACT_APP_LOTTO_API_URL;
const MAX_HISTORY = 10;
const REEL_STOP_INTERVAL = 350;
const MIN_SPIN_TIME = 900;
const MODE_HELP = {
  recommend: '역대 당첨 통계를 분석해 서버가 번호를 제안해요.',
  random: '1~45 중에서 무작위로 뽑아요. 번호 고정/제외도 쓸 수 있어요.',
};

const fetchRecommendSet = async () => {
  const { data } = await axios.get(`${LOTTO_API_URL}/drawings/generate`);
  return sortNumbers([data.one, data.two, data.three, data.four, data.five, data.six]);
};

const Generator = () => {
  const [mode, setMode] = useState('recommend');
  const [games, setGames] = useState(1);
  const [options, setOptions] = useState({ fixed: [], excluded: [] });
  const [reelValues, setReelValues] = useState([]);
  const [runId, setRunId] = useState(0);
  const [spinning, setSpinning] = useState(Array(PICK_COUNT).fill(false));
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useLocalStorage('lotto-history', []);
  const [toast, setToast] = useState('');
  const [announce, setAnnounce] = useState('');
  const [adBusy, setAdBusy] = useState(false);
  const toastTimer = useRef(null);

  const isGenerating = spinning.some(Boolean);
  const optionsError = mode === 'random' ? validateOptions(options) : null;
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  // 광고 그룹이 설정된 빌드에서만, 5게임 생성과 번호 고정/제외에 보상형 광고를 요구한다.
  const adEnabled = adController.isEnabled();
  const adRequired = adEnabled && requiresAd({ mode, games, options });
  const adNotice = !adEnabled
    ? ''
    : adRequired
      ? '광고를 끝까지 보면 이용할 수 있어요'
      : '5게임 생성과 번호 고정·제외는 광고를 끝까지 보면 이용할 수 있어요';

  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // 광고는 미리 로드해 둔다(로드 -> 표시 순서가 필수).
  useEffect(() => { adController.preload(); }, []);

  const finish = useCallback((sets) => {
    const entry = { id: Date.now(), sets };
    setCurrent(entry);
    setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
    setAnnounce(`생성된 번호. ${formatTicket(sets)}`);
  }, [setHistory]);

  const startGeneration = useCallback(() => {
    setCurrent(null);
    setAnnounce('');
    setSpinning(Array(PICK_COUNT).fill(true));

    const make = mode === 'random'
      ? async () => generateRandomSets(games, options)
      : () => Promise.all(Array.from({ length: games }, fetchRecommendSet));
    const minSpin = new Promise((resolve) => setTimeout(resolve, MIN_SPIN_TIME));

    Promise.all([make(), minSpin]).then(([sets]) => {
      setReelValues(sets[0]);
      setRunId((id) => id + 1);
      sets[0].forEach((_, index) => {
        setTimeout(() => {
          setSpinning((prev) => prev.map((s, i) => (i === index ? false : s)));
          if (index === sets[0].length - 1) finish(sets);
        }, index * REEL_STOP_INTERVAL);
      });
    }).catch((error) => {
      console.error('데이터 요청 실패:', error);
      setSpinning(Array(PICK_COUNT).fill(false));
      showToast('번호를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
    });
  }, [mode, games, options, finish, showToast]);

  // 번호 생성을 누르면 (설정된 경우) 광고를 먼저 보여 주고, 끝나면 생성을 시작한다.
  // 광고가 준비되지 않았거나 실패하면 광고 없이 바로 생성한다.
  const handleSpin = useCallback(() => {
    if (isGenerating || adBusy) return;
    if (optionsError) {
      showToast(optionsError);
      return;
    }
    if (!adRequired) {
      startGeneration();
      return;
    }
    setAdBusy(true);
    adController.run().then((proceed) => {
      setAdBusy(false);
      if (proceed) startGeneration();
      else showToast('광고를 끝까지 보면 이용할 수 있어요');
    });
  }, [isGenerating, adBusy, adRequired, optionsError, showToast, startGeneration]);

  // 키보드 단축키는 항상 최신 handleSpin을 호출한다.
  const spinRef = useRef(handleSpin);
  spinRef.current = handleSpin;
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.code === 'Space' || e.key === 'Enter') && document.activeElement === document.body) {
        e.preventDefault();
        spinRef.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const copySets = async (sets) => {
    try {
      await navigator.clipboard.writeText(formatTicket(sets));
      showToast('복사했어요');
    } catch {
      showToast('복사에 실패했어요');
    }
  };

  const shareSets = async (sets) => {
    try {
      await navigator.share({ title: '로또 번호', text: formatTicket(sets) });
    } catch {
      // 사용자가 공유를 취소한 경우 등은 무시한다.
    }
  };

  const pastHistory = history.filter((entry) => entry.id !== current?.id);

  return (
    <Card className="text-center relative overflow-hidden">
      <div className="flex justify-center mb-2 text-accent" aria-hidden="true">
        <FlaskConical className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>
      <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight mb-2 text-heading">
        {process.env.REACT_APP_BRAND_NAME || '로또 번호 생성기'}
      </h1>
      <p className="text-muted text-sm sm:text-base mb-5">역대 당첨 데이터를 분석해 번호를 만들어 드려요</p>

      <div className="flex justify-center flex-wrap gap-x-3 gap-y-2 mb-2">
        <div className="flex gap-2">
          <ToggleButton active={mode === 'recommend'} onClick={() => setMode('recommend')}>
            <BarChart2 className="w-4 h-4" aria-hidden="true" />
            추천
          </ToggleButton>
          <ToggleButton active={mode === 'random'} onClick={() => setMode('random')}>
            <Shuffle className="w-4 h-4" aria-hidden="true" />
            랜덤
          </ToggleButton>
        </div>
        <span className="hidden sm:block w-px bg-line" aria-hidden="true" />
        <div className="flex gap-2">
          <ToggleButton active={games === 1} onClick={() => setGames(1)}>1게임</ToggleButton>
          <ToggleButton active={games === MAX_GAMES} onClick={() => setGames(MAX_GAMES)}>
            {MAX_GAMES}게임
            {adEnabled && <span className="text-[10px] leading-none font-semibold rounded border border-current px-1 py-0.5 opacity-80">광고</span>}
          </ToggleButton>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-muted mb-5">{MODE_HELP[mode]}</p>

      <NumberPicker
        fixed={options.fixed}
        excluded={options.excluded}
        onChange={setOptions}
        disabled={mode !== 'random'}
        error={optionsError}
      />

      <NumberBoard values={reelValues} spinning={spinning} runId={runId} onSpin={handleSpin} busy={adBusy} adRequired={adRequired} adNotice={adNotice} />

      {current && (
        <div className="mt-6 max-w-xl mx-auto">
          <Ticket
            title="이번 결과"
            sets={current.sets}
            onCopy={copySets}
            onShare={shareSets}
            canShare={canShare}
          />
        </div>
      )}

      {pastHistory.length > 0 && (
        <div className="mt-8 pt-6 border-t border-line max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted">최근 생성 기록</h3>
            <button
              onClick={() => { setHistory([]); setCurrent(null); }}
              className="inline-flex items-center gap-1 min-h-[44px] px-2 text-sm text-muted hover:text-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              기록 지우기
            </button>
          </div>
          <div className="space-y-3">
            {pastHistory.map((entry) => (
              <Ticket
                key={entry.id}
                title={new Date(entry.id).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                sets={entry.sets}
                onCopy={copySets}
                onShare={shareSets}
                canShare={canShare}
              />
            ))}
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">{announce}</p>
      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/95 border border-white/10 text-white text-sm shadow-lg">
          {toast}
        </div>
      )}
    </Card>
  );
};

export default Generator;
