import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import axios from 'axios';
import Generator from './Generator';

jest.mock('axios', () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('../utils/ads', () => ({
  AD_DEBUG: false,
  FREE_GENERATIONS: 1,
  adController: {
    isEnabled: () => true,
    preload: jest.fn(),
    getStatus: () => 'ready',
    getLastError: () => '',
    subscribe: () => () => {},
    run: jest.fn(() => Promise.resolve(true)),
  },
}));

jest.mock('../utils/analytics', () => ({
  logClick: jest.fn(), logEvent: jest.fn(), logImpression: jest.fn(), logScreen: jest.fn(),
}));

global.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const text = () => container.textContent;
const spinButton = () => [...container.querySelectorAll('button')].find((b) => /번호 생성하기/.test(b.textContent));
// 마이크로태스크 사이에 새 타이머가 예약되므로 조금씩 나눠 진행한다.
const advance = async (ms) => {
  for (let t = 0; t < ms; t += 100) {
    await act(async () => { jest.advanceTimersByTime(100); });
  }
};
const click = async () => { await act(async () => { spinButton().click(); }); };

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => { root.unmount(); });
  container.remove();
  jest.useRealTimers();
  jest.restoreAllMocks();
  axios.get.mockReset();
});

const render = async () => { await act(async () => { root.render(<Generator />); }); };

describe('Generator', () => {
  test('생성 전에는 안내 문구를 보여 준다', async () => {
    await render();
    expect(text()).toContain('버튼을 누르면 6개 번호가 만들어져요');
    expect(text()).not.toContain('번호를 만들었어요');
  });

  test('추천 요청에 timeout 5000을 지정한다', async () => {
    axios.get.mockResolvedValue({ data: { one: 6, two: 5, three: 4, four: 3, five: 2, six: 1 } });
    await render();
    await click();
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get.mock.calls[0][1]).toEqual({ timeout: 5000 });
  });

  test('추천 성공 시 결과와 완료 문구를 보여 주고 대체 안내는 없다', async () => {
    axios.get.mockResolvedValue({ data: { one: 6, two: 5, three: 4, four: 3, five: 2, six: 1 } });
    await render();
    await click();
    await advance(5000);
    expect(text()).toContain('번호를 만들었어요. 복사해서 저장해 보세요');
    expect(text()).not.toContain('추천 서버 응답이 없어');
  });

  test('추천 요청이 실패해도 랜덤 결과와 안내 문구를 보여 준다', async () => {
    axios.get.mockRejectedValue(new Error('timeout of 5000ms exceeded'));
    await render();
    await click();
    expect(text()).not.toContain('번호를 만들었어요');
    await advance(5000);
    expect(text()).toContain('번호를 만들었어요. 복사해서 저장해 보세요');
    expect(text()).toContain('추천 서버 응답이 없어 랜덤으로 만들었어요');
    expect(text()).toContain('이번 결과');
    expect(JSON.parse(localStorage.getItem('lotto-history'))).toHaveLength(1);
  });

  test('추천 응답 필드가 비정상이어도 크래시하지 않고 결과를 보여 준다', async () => {
    axios.get.mockResolvedValue({ data: null });
    await render();
    await click();
    await advance(5000);
    expect(text()).toContain('번호를 만들었어요');
  });

  test.each([
    ['빈 객체', {}],
    ['문자열', 'html'],
    ['범위 밖 숫자', { one: 0, two: 5, three: 4, four: 3, five: 2, six: 46 }],
    ['소수', { one: 1.5, two: 2, three: 3, four: 4, five: 5, six: 6 }],
    ['중복 숫자', { one: 1, two: 1, three: 3, four: 4, five: 5, six: 6 }],
    ['숫자 문자열', { one: '1', two: '2', three: '3', four: '4', five: '5', six: '6' }],
  ])('200 응답이어도 추천 형식이 잘못되면(%s) 랜덤으로 대체하고 안내한다', async (_name, data) => {
    axios.get.mockResolvedValue({ data });
    await render();
    await click();
    await advance(5000);
    expect(text()).toContain('번호를 만들었어요. 복사해서 저장해 보세요');
    expect(text()).toContain('추천 서버 응답이 없어 랜덤으로 만들었어요');
  });

  test('무료 횟수는 결과를 보여 준 뒤에만 소모된다', async () => {
    const { adController } = require('../utils/ads');
    axios.get.mockResolvedValue({ data: { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 } });
    await render();
    expect(spinButton().textContent).toContain('번호 생성하기');
    expect(spinButton().textContent).not.toContain('광고 보고');
    await click();
    expect(adController.run).not.toHaveBeenCalled(); // 첫 회는 광고 없이 시작
    await advance(5000);
    expect(text()).toContain('번호를 만들었어요');
    expect(spinButton().textContent).toContain('광고 보고 번호 생성하기');
  });

  describe('광고 구조(랜덤 무료, 추천만 광고)', () => {
    const REC = { data: { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 } };
    const modeButton = (label) => [...container.querySelectorAll('button')].find((b) => b.textContent.trim() === label);
    const switchTo = async (label) => { await act(async () => { modeButton(label).click(); }); };
    const generate = async () => { await click(); await advance(5000); };

    beforeEach(() => {
      require('../utils/ads').adController.run.mockReset().mockImplementation(() => Promise.resolve(true));
      const a = require('../utils/analytics');
      a.logImpression.mockClear();
      a.logEvent.mockClear();
      require('../utils/ads').adController.preload.mockClear();
    });

    test('랜덤은 광고 없이 연속으로 생성하고 버튼 문구가 바뀌지 않는다', async () => {
      const { adController } = require('../utils/ads');
      await render();
      await switchTo('랜덤');
      for (let i = 0; i < 3; i += 1) {
        expect(spinButton().textContent).not.toContain('광고 보고');
        await generate();
        expect(text()).toContain('번호를 만들었어요');
      }
      expect(adController.run).not.toHaveBeenCalled();
    });

    test('랜덤 생성은 추천의 무료 횟수를 소모하지 않는다', async () => {
      const { adController } = require('../utils/ads');
      axios.get.mockResolvedValue(REC);
      await render();
      await switchTo('랜덤');
      await generate();
      await generate();
      await switchTo('추천');
      expect(spinButton().textContent).not.toContain('광고 보고');
      await click();
      expect(adController.run).not.toHaveBeenCalled();
    });

    test('추천은 1회 무료 후 광고를 요구하고 모드 전환 시 버튼 문구가 즉시 바뀐다', async () => {
      const { adController } = require('../utils/ads');
      axios.get.mockResolvedValue(REC);
      await render();
      await generate();
      expect(spinButton().textContent).toContain('광고 보고 번호 생성하기');
      await switchTo('랜덤');
      expect(spinButton().textContent).not.toContain('광고 보고');
      await switchTo('추천');
      expect(spinButton().textContent).toContain('광고 보고 번호 생성하기');
      await click();
      expect(adController.run).toHaveBeenCalledTimes(1);
    });

    test('광고가 표시되지 않으면 노출·완료 로그를 남기지 않고, 표시되면 남긴다', async () => {
      const { adController } = require('../utils/ads');
      const { logImpression, logEvent } = require('../utils/analytics');
      axios.get.mockResolvedValue(REC);
      await render();
      await generate();
      await click(); // run이 onShown 없이 true: 광고 없이 진행
      expect(logImpression).not.toHaveBeenCalled();
      expect(logEvent).not.toHaveBeenCalledWith('ad_completed', expect.anything());
      await advance(5000);
      adController.run.mockImplementationOnce(({ onShown }) => { onShown(); return Promise.resolve(true); });
      await click();
      expect(logImpression).toHaveBeenCalledWith('reward_ad', { mode: 'recommend' });
      expect(logEvent).toHaveBeenCalledWith('ad_completed', { mode: 'recommend' });
    });

    test('랜덤 모드에서는 preload를 부르지 않고 추천 모드에서는 무료 구간에도 부른다', async () => {
      const { adController } = require('../utils/ads');
      await render();
      expect(adController.preload).toHaveBeenCalled(); // 추천(무료 구간)
      adController.preload.mockClear();
      await switchTo('랜덤');
      await generate();
      expect(adController.preload).not.toHaveBeenCalled();
      await switchTo('추천');
      expect(adController.preload).toHaveBeenCalled();
    });

    test('랜덤 모드에서는 무료 안내 문구를 보여 준다', async () => {
      await render();
      await switchTo('랜덤');
      expect(text()).toContain('랜덤 번호는 언제나 무료예요');
    });

    test('추천 광고 중도 종료 시 ad_dismissed는 광고가 표시된 경우에만 기록한다', async () => {
      const { adController } = require('../utils/ads');
      const { logEvent } = require('../utils/analytics');
      axios.get.mockResolvedValue(REC);
      await render();
      await generate();
      adController.run.mockImplementationOnce(() => Promise.resolve(false)); // 표시 없이 종료
      await click();
      expect(logEvent).not.toHaveBeenCalledWith('ad_dismissed', expect.anything());
      adController.run.mockImplementationOnce(({ onShown }) => { onShown(); return Promise.resolve(false); });
      await click();
      expect(logEvent).toHaveBeenCalledWith('ad_dismissed', { mode: 'recommend' });
      expect(logEvent).not.toHaveBeenCalledWith('ad_completed', expect.anything());
    });
  });
});
