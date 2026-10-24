// 웹 빌드(REACT_APP_AIT 미설정)에서는 no-op이어야 한다.
describe('analytics (웹 빌드)', () => {
  test('모든 로그 함수가 예외 없이 undefined를 반환한다', async () => {
    jest.resetModules();
    delete process.env.REACT_APP_AIT;
    const a = require('./analytics');
    expect(() => a.logScreen('home')).not.toThrow();
    expect(() => a.logClick('generate', { mode: 'random' })).not.toThrow();
    expect(() => a.logImpression('reward_ad')).not.toThrow();
    expect(() => a.logEvent('generate_done')).not.toThrow();
    expect(a.logEvent('x')).toBeUndefined();
  });
});

describe('analytics (미니앱 빌드)', () => {
  const load = (sdkFactory) => {
    jest.resetModules();
    process.env.REACT_APP_AIT = '1';
    jest.doMock('@apps-in-toss/web-framework', sdkFactory, { virtual: true });
    return require('./analytics');
  };
  const flush = () => new Promise((r) => setTimeout(r, 0));
  afterEach(() => { delete process.env.REACT_APP_AIT; jest.dontMock('@apps-in-toss/web-framework'); });

  test('SDK 메서드가 동기 예외를 던져도 삼킨다', async () => {
    const unhandled = jest.fn();
    process.on('unhandledRejection', unhandled);
    const a = load(() => ({ Analytics: { screen: () => { throw new Error('x'); }, click: () => Promise.reject(new Error('y')), impression: () => {}, log: () => {} } }));
    expect(() => a.logScreen('home')).not.toThrow();
    expect(() => a.logClick('c')).not.toThrow();
    await flush(); await flush();
    process.off('unhandledRejection', unhandled);
    expect(unhandled).not.toHaveBeenCalled();
  });

  test('SDK 로드 실패나 Analytics 부재도 삼킨다', async () => {
    const a = load(() => { throw new Error('load fail'); });
    expect(() => a.logEvent('e')).not.toThrow();
    await flush();
    const b = load(() => ({}));
    expect(() => b.logImpression('i')).not.toThrow();
    await flush();
  });

  test('정상 SDK에는 log_name과 파라미터를 전달한다', async () => {
    const log = jest.fn(); const screen = jest.fn();
    const a = load(() => ({ Analytics: { screen, click: jest.fn(), impression: jest.fn(), log } }));
    a.logScreen('home'); a.logEvent('generate_done', { mode: 'random' });
    await flush(); await flush();
    expect(screen).toHaveBeenCalledWith({ log_name: 'home' });
    expect(log).toHaveBeenCalledWith({ log_name: 'generate_done', log_type: 'event', params: { mode: 'random' } });
  });
});
