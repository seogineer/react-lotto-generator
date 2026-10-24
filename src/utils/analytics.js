// 앱인토스 분석 로그(Analytics) 래퍼.
// - 토스 앱 안의 미니앱 빌드(REACT_APP_AIT=1)에서만 SDK를 동적으로 불러온다. 웹 빌드에서는 아무 일도 하지 않는다.
// - 로그 실패는 앱 동작에 영향을 주지 않도록 모두 삼킨다.

const IS_MINI_APP = process.env.REACT_APP_AIT === '1';

let sdkPromise;
const getAnalytics = () => {
  if (!IS_MINI_APP) return Promise.resolve(null);
  if (!sdkPromise) {
    sdkPromise = import('@apps-in-toss/web-framework')
      .then((sdk) => sdk?.Analytics ?? null)
      .catch(() => null);
  }
  return sdkPromise;
};

const send = (call) => {
  if (!IS_MINI_APP) return;
  getAnalytics()
    .then((analytics) => (analytics ? call(analytics) : undefined))
    .catch(() => {});
};

export const logScreen = (logName, params = {}) =>
  send((a) => a.screen({ log_name: logName, ...params }));

export const logClick = (logName, params = {}) =>
  send((a) => a.click({ log_name: logName, ...params }));

export const logImpression = (logName, params = {}) =>
  send((a) => a.impression({ log_name: logName, ...params }));

export const logEvent = (logName, params = {}) =>
  send((a) => a.log({ log_name: logName, log_type: 'event', params }));
