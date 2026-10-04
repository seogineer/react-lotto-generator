import {
  MAX_FIXED,
  getBallTone,
  sortNumbers,
  generateRandomSet,
  generateRandomSets,
  validateOptions,
  nextPickState,
  formatTicket,
  gameLabel,
} from './lotto';

const seeded = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

describe('getBallTone', () => {
  test('번호 구간별로 다른 톤을 반환한다', () => {
    const tones = [1, 10, 11, 20, 21, 30, 31, 40, 41, 45].map(getBallTone);
    expect(tones[0]).toBe(tones[1]);
    expect(tones[2]).toBe(tones[3]);
    expect(new Set([tones[0], tones[2], tones[4], tones[6], tones[8]]).size).toBe(5);
  });
});

describe('sortNumbers', () => {
  test('원본을 바꾸지 않고 오름차순 정렬한다', () => {
    const src = [30, 2, 11];
    expect(sortNumbers(src)).toEqual([2, 11, 30]);
    expect(src).toEqual([30, 2, 11]);
  });
});

describe('generateRandomSet', () => {
  test('1~45 사이의 중복 없는 6개를 오름차순으로 만든다', () => {
    for (let i = 0; i < 50; i += 1) {
      const set = generateRandomSet({}, seeded(i + 1));
      expect(set).toHaveLength(6);
      expect(new Set(set).size).toBe(6);
      expect(set).toEqual(sortNumbers(set));
      expect(Math.min(...set)).toBeGreaterThanOrEqual(1);
      expect(Math.max(...set)).toBeLessThanOrEqual(45);
    }
  });

  test('고정 번호는 반드시 포함한다', () => {
    for (let i = 0; i < 30; i += 1) {
      const set = generateRandomSet({ fixed: [7, 45] }, seeded(i + 1));
      expect(set).toContain(7);
      expect(set).toContain(45);
      expect(set).toHaveLength(6);
    }
  });

  test('제외 번호는 절대 포함하지 않는다', () => {
    const excluded = Array.from({ length: 30 }, (_, i) => i + 1);
    for (let i = 0; i < 30; i += 1) {
      const set = generateRandomSet({ excluded }, seeded(i + 1));
      expect(set.every((n) => n > 30)).toBe(true);
    }
  });

  test('조건이 불가능하면 에러를 던진다', () => {
    const excluded = Array.from({ length: 40 }, (_, i) => i + 1);
    expect(() => generateRandomSet({ excluded })).toThrow();
  });
});

describe('generateRandomSets', () => {
  test('요청한 개수만큼 만든다', () => {
    expect(generateRandomSets(5)).toHaveLength(5);
    expect(generateRandomSets(1)).toHaveLength(1);
  });
});

describe('validateOptions', () => {
  test('정상 조건은 null', () => {
    expect(validateOptions({ fixed: [1], excluded: [2] })).toBeNull();
  });
  test(`고정은 최대 ${MAX_FIXED}개`, () => {
    expect(validateOptions({ fixed: [1, 2, 3, 4, 5, 6], excluded: [] })).not.toBeNull();
  });
  test('남는 번호가 부족하면 에러 메시지', () => {
    const excluded = Array.from({ length: 40 }, (_, i) => i + 1);
    expect(validateOptions({ fixed: [], excluded })).not.toBeNull();
  });
});

describe('nextPickState', () => {
  test('없음 -> 고정 -> 제외 -> 없음 순환', () => {
    expect(nextPickState(undefined)).toBe('fixed');
    expect(nextPickState('fixed')).toBe('excluded');
    expect(nextPickState('excluded')).toBeUndefined();
  });
});

describe('formatTicket / gameLabel', () => {
  test('게임 라벨은 A부터', () => {
    expect(gameLabel(0)).toBe('A');
    expect(gameLabel(4)).toBe('E');
  });
  test('1게임이면 라벨 없이 번호만', () => {
    expect(formatTicket([[1, 2, 3, 4, 5, 6]])).toBe('1, 2, 3, 4, 5, 6');
  });
  test('티켓 텍스트를 만든다', () => {
    expect(formatTicket([[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12]])).toBe(
      'A  1, 2, 3, 4, 5, 6\nB  7, 8, 9, 10, 11, 12'
    );
  });
});
