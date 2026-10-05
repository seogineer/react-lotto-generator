import { createAdController } from './ads';
import { requiresAd } from './lotto';

// 광고 SDK를 흉내 낸다. loaded/보상/종료 이벤트를 테스트가 직접 일으킨다.
const makeSdk = ({ supported = true } = {}) => {
  const state = { loadCalls: 0, showCalls: 0, loadHandlers: null, showHandlers: null };
  const loadFullScreenAd = Object.assign(
    (params) => {
      state.loadCalls += 1;
      state.loadHandlers = params;
      return () => {};
    },
    { isSupported: () => supported },
  );
  const showFullScreenAd = Object.assign(
    (params) => {
      state.showCalls += 1;
      state.showHandlers = params;
      return () => {};
    },
    { isSupported: () => supported },
  );
  return { sdk: { loadFullScreenAd, showFullScreenAd }, state };
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const GROUP = 'ait-ad-test-interstitial-id';

describe('createAdController', () => {
  test('광고 그룹 ID가 없으면 비활성이고 바로 진행한다', async () => {
    const { sdk, state } = makeSdk();
    const ad = createAdController({ loadSdk: async () => sdk, adGroupId: '' });
    expect(ad.isEnabled()).toBe(false);
    expect(await ad.run()).toBe(true);
    expect(state.loadCalls).toBe(0);
  });

  test('SDK를 불러올 수 없는 환경(웹)이면 비활성이고 바로 진행한다', async () => {
    const ad = createAdController({ loadSdk: null, adGroupId: GROUP });
    expect(ad.isEnabled()).toBe(false);
    expect(await ad.run()).toBe(true);
  });

  test('SDK 로딩이 실패하면 광고 없이 진행한다', async () => {
    const ad = createAdController({ loadSdk: async () => { throw new Error('bridge'); }, adGroupId: GROUP });
    expect(await ad.run()).toBe(true);
  });

  test('지원하지 않는 환경이면 광고 없이 진행하고 로드하지 않는다', async () => {
    const { sdk, state } = makeSdk({ supported: false });
    const ad = createAdController({ loadSdk: async () => sdk, adGroupId: GROUP });
    expect(await ad.run()).toBe(true);
    expect(state.loadCalls).toBe(0);
    expect(state.showCalls).toBe(0);
  });

  test('광고가 아직 로드되지 않았으면 보여 주지 않고 진행한다', async () => {
    const { sdk, state } = makeSdk();
    const ad = createAdController({ loadSdk: async () => sdk, adGroupId: GROUP });
    expect(await ad.run()).toBe(true);
    await flush();
    expect(state.showCalls).toBe(0);
    expect(state.loadCalls).toBe(1); // 다음을 위해 로드를 시작한다
  });

  test('전면형: 로드된 광고를 보여 주고 닫힌 뒤에 진행하며 다음 광고를 로드한다', async () => {
    const { sdk, state } = makeSdk();
    const ad = createAdController({ loadSdk: async () => sdk, adGroupId: GROUP });
    await ad.preload();
    state.loadHandlers.onEvent({ type: 'loaded' });

    let result;
    const pending = ad.run().then((v) => { result = v; });
    await flush();
    expect(state.showCalls).toBe(1);
    expect(state.showHandlers.options.adGroupId).toBe(GROUP);
    expect(result).toBeUndefined(); // 광고가 떠 있는 동안에는 진행하지 않는다

    state.showHandlers.onEvent({ type: 'dismissed' });
    await pending;
    expect(result).toBe(true);
    await flush();
    expect(state.loadCalls).toBe(2);
  });

  test('보상형: 보상을 받고 닫으면 진행한다', async () => {
    const { sdk, state } = makeSdk();
    const ad = createAdController({ loadSdk: async () => sdk, adGroupId: 'rewarded', type: 'rewarded' });
    await ad.preload();
    state.loadHandlers.onEvent({ type: 'loaded' });
    const pending = ad.run();
    await flush();
    state.showHandlers.onEvent({ type: 'userEarnedReward', data: { unitType: 'x', unitAmount: 1 } });
    state.showHandlers.onEvent({ type: 'dismissed' });
    expect(await pending).toBe(true);
  });

  test('보상형: 보상 없이 닫으면 진행하지 않는다', async () => {
    const { sdk, state } = makeSdk();
    const ad = createAdController({ loadSdk: async () => sdk, adGroupId: 'rewarded', type: 'rewarded' });
    await ad.preload();
    state.loadHandlers.onEvent({ type: 'loaded' });
    const pending = ad.run();
    await flush();
    state.showHandlers.onEvent({ type: 'dismissed' });
    expect(await pending).toBe(false);
  });

  test('표시에 실패하면(이벤트와 오류 콜백 모두) 진행한다', async () => {
    for (const fail of [(h) => h.onEvent({ type: 'failedToShow' }), (h) => h.onError(new Error('x'))]) {
      const { sdk, state } = makeSdk();
      const ad = createAdController({ loadSdk: async () => sdk, adGroupId: GROUP, type: 'rewarded' });
      await ad.preload();
      state.loadHandlers.onEvent({ type: 'loaded' });
      const pending = ad.run();
      await flush();
      fail(state.showHandlers);
      expect(await pending).toBe(true);
    }
  });

  test('showFullScreenAd가 예외를 던지면 진행한다', async () => {
    const { sdk, state } = makeSdk();
    sdk.showFullScreenAd = Object.assign(() => { throw new Error('native'); }, { isSupported: () => true });
    const ad = createAdController({ loadSdk: async () => sdk, adGroupId: GROUP });
    await ad.preload();
    state.loadHandlers.onEvent({ type: 'loaded' });
    expect(await ad.run()).toBe(true);
  });

  test('같은 광고에 종료 이벤트가 여러 번 와도 한 번만 진행한다', async () => {
    const { sdk, state } = makeSdk();
    const ad = createAdController({ loadSdk: async () => sdk, adGroupId: GROUP });
    await ad.preload();
    state.loadHandlers.onEvent({ type: 'loaded' });
    const pending = ad.run();
    await flush();
    state.showHandlers.onEvent({ type: 'dismissed' });
    state.showHandlers.onEvent({ type: 'dismissed' });
    await pending;
    await flush();
    expect(state.loadCalls).toBe(2); // 중복 종료로 로드가 여러 번 일어나지 않는다
  });

  test('everyN=2이면 두 번째 생성에서만 광고를 보여 준다', async () => {
    const { sdk, state } = makeSdk();
    const ad = createAdController({ loadSdk: async () => sdk, adGroupId: GROUP, everyN: 2 });
    await ad.preload();
    state.loadHandlers.onEvent({ type: 'loaded' });

    expect(await ad.run()).toBe(true); // 1번째: 광고 없음
    expect(state.showCalls).toBe(0);

    const second = ad.run(); // 2번째: 광고
    await flush();
    expect(state.showCalls).toBe(1);
    state.showHandlers.onEvent({ type: 'dismissed' });
    expect(await second).toBe(true);
  });

  test('광고를 보여 준 직후 다음 생성은 새로 로드되기 전까지 광고 없이 진행한다', async () => {
    const { sdk, state } = makeSdk();
    const ad = createAdController({ loadSdk: async () => sdk, adGroupId: GROUP });
    await ad.preload();
    state.loadHandlers.onEvent({ type: 'loaded' });
    const first = ad.run();
    await flush();
    state.showHandlers.onEvent({ type: 'dismissed' });
    await first;
    // 아직 두 번째 로드의 loaded 이벤트가 오지 않았다
    expect(await ad.run()).toBe(true);
    expect(state.showCalls).toBe(1);
  });
});

describe('requiresAd (무료 횟수 이후에만 보상형 광고 필요)', () => {
  test('처음 1회는 무료이고 그 이후부터 광고가 필요하다', () => {
    expect(requiresAd({ usedCount: 0, freeCount: 1 })).toBe(false);
    expect(requiresAd({ usedCount: 1, freeCount: 1 })).toBe(true);
    expect(requiresAd({ usedCount: 5, freeCount: 1 })).toBe(true);
  });

  test('무료 횟수가 3이면 3번까지 무료이고 네 번째부터 광고가 필요하다', () => {
    expect(requiresAd({ usedCount: 2, freeCount: 3 })).toBe(false);
    expect(requiresAd({ usedCount: 3, freeCount: 3 })).toBe(true);
  });

  test('무료 횟수가 0이면 처음부터 매번 광고가 필요하다', () => {
    expect(requiresAd({ usedCount: 0, freeCount: 0 })).toBe(true);
  });
});
