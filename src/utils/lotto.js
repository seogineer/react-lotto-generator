export const LOTTO_MAX = 45;
export const PICK_COUNT = 6;
export const MAX_FIXED = 5;
export const MAX_GAMES = 5;

export const BALL_RANGES = [
  { tone: 'yellow', label: '1~10' },
  { tone: 'blue', label: '11~20' },
  { tone: 'red', label: '21~30' },
  { tone: 'gray', label: '31~40' },
  { tone: 'green', label: '41~45' },
];

export const getBallTone = (num) => {
  if (num <= 10) return 'yellow';
  if (num <= 20) return 'blue';
  if (num <= 30) return 'red';
  if (num <= 40) return 'gray';
  return 'green';
};

export const sortNumbers = (numbers) => [...numbers].sort((a, b) => a - b);

export const gameLabel = (index) => String.fromCharCode(65 + index);

const allNumbers = () => Array.from({ length: LOTTO_MAX }, (_, i) => i + 1);

export const validateOptions = ({ fixed = [], excluded = [] }) => {
  if (fixed.length > MAX_FIXED) return `고정 번호는 최대 ${MAX_FIXED}개까지 고를 수 있어요.`;
  const pool = allNumbers().filter((n) => !fixed.includes(n) && !excluded.includes(n));
  if (pool.length < PICK_COUNT - fixed.length) {
    return '제외한 번호가 너무 많아 번호를 만들 수 없어요.';
  }
  return null;
};

export const generateRandomSet = ({ fixed = [], excluded = [] } = {}, rng = Math.random) => {
  const error = validateOptions({ fixed, excluded });
  if (error) throw new Error(error);

  const pool = allNumbers().filter((n) => !fixed.includes(n) && !excluded.includes(n));
  const picked = [...fixed];
  while (picked.length < PICK_COUNT) {
    const index = Math.floor(rng() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return sortNumbers(picked);
};

export const generateRandomSets = (count, options = {}, rng = Math.random) =>
  Array.from({ length: count }, () => generateRandomSet(options, rng));

// 5게임 생성과 번호 고정/제외(고급 옵션)는 보상형 광고를 끝까지 본 경우에만 이용할 수 있다. 1게임은 무료.
// 추천 모드는 서버가 번호를 정하므로 고정/제외 옵션은 적용되지 않는다.
export const requiresAd = ({ mode, games, options }) =>
  games > 1 || (mode === 'random' && (options.fixed.length > 0 || options.excluded.length > 0));

export const nextPickState = (state) => {
  if (state === undefined) return 'fixed';
  if (state === 'fixed') return 'excluded';
  return undefined;
};

export const formatTicket = (sets) =>
  sets.length === 1
    ? sets[0].join(', ')
    : sets.map((set, i) => `${gameLabel(i)}  ${set.join(', ')}`).join('\n');
