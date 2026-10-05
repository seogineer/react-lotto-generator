// 앱인토스 인앱 광고(전면형/보상형) 제어.
// - 토스 앱 안의 미니앱 빌드(REACT_APP_AIT=1)에서만 SDK를 불러온다. 웹 페이지에서는 광고 없이 동작한다.
// - 광고는 미리 로드해 두고(load -> show -> 다음 load), 준비되지 않았거나 지원되지 않거나 실패하면
//   광고 없이 바로 진행한다. 광고 문제가 핵심 기능(번호 생성)을 막지 않게 하는 것이 원칙이다.
// - 로드가 실패하면 몇 번 다시 시도하고, 사용자가 누른 시점에 로드 중이면 잠깐 기다린다.
// - 상태(idle/loading/ready/failed/unsupported/disabled)와 마지막 오류를 노출해 화면이 광고가 실제로 나올지
//   알 수 있게 한다.
// - 광고 종류(전면형/보상형)는 콘솔에서 만든 광고 그룹 ID로 정해진다. 기본은 보상형이며(REACT_APP_AD_TYPE),
//   보상형은 광고를 끝까지 봐서 보상(userEarnedReward)을 받았을 때만 진행한다. 전면형 그룹을 쓰려면
//   REACT_APP_AD_TYPE=interstitial을 함께 지정해야 한다(종류가 어긋나면 보상이 무시되거나 영영 진행되지 않는다).
// - 운영 빌드에는 실제 광고 그룹 ID를, 테스트에는 테스트용 ID(ait-ad-test-rewarded-id,
//   ait-ad-test-interstitial-id)만 쓴다.

export const createAdController = ({
  loadSdk,
  adGroupId,
  type = 'interstitial',
  everyN = 1,
  loadWaitMs = 3000,
  retryDelaysMs = [2000, 5000, 15000],
}) => {
  let sdk; // undefined: 아직 시도 안 함, null: 사용할 수 없음
  let status = 'idle'; // idle | loading | ready | failed | unsupported
  let lastError = '';
  let count = 0;
  let retries = 0;
  const listeners = new Set();

  const isEnabled = () => Boolean(adGroupId) && typeof loadSdk === 'function';

  const setStatus = (next, error = '') => {
    status = next;
    if (error) lastError = error;
    listeners.forEach((listener) => listener());
  };

  const getStatus = () => (isEnabled() ? status : 'disabled');
  const getLastError = () => lastError;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const getSdk = async () => {
    if (sdk !== undefined) return sdk;
    try {
      sdk = (await loadSdk()) ?? null;
    } catch (error) {
      sdk = null;
      lastError = `SDK를 불러오지 못함: ${error?.message ?? error}`;
    }
    return sdk;
  };

  const supportDetail = (s) => {
    try {
      return `load=${Boolean(s?.loadFullScreenAd?.isSupported?.())}, show=${Boolean(s?.showFullScreenAd?.isSupported?.())}`;
    } catch (error) {
      return `지원 여부 확인 실패: ${error?.message ?? error}`;
    }
  };

  const isSupported = (s) => {
    try {
      return Boolean(s?.loadFullScreenAd?.isSupported?.() && s?.showFullScreenAd?.isSupported?.());
    } catch {
      return false;
    }
  };

  const onLoadFailed = (error) => {
    setStatus('failed', error?.message ?? String(error));
    if (retries < retryDelaysMs.length) {
      const delay = retryDelaysMs[retries];
      retries += 1;
      setTimeout(() => preload(), delay); // eslint-disable-line no-use-before-define
    }
  };

  const preload = async () => {
    if (!isEnabled() || status === 'ready' || status === 'loading') return;
    const s = await getSdk();
    if (!s) {
      setStatus('unsupported', lastError || 'SDK를 사용할 수 없음');
      return;
    }
    if (!isSupported(s)) {
      setStatus('unsupported', `이 환경에서는 광고를 지원하지 않음 (${supportDetail(s)})`);
      return;
    }
    if (status === 'ready' || status === 'loading') return; // 동시에 시작된 로드가 있으면 중복하지 않는다
    setStatus('loading');
    try {
      s.loadFullScreenAd({
        options: { adGroupId },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            retries = 0;
            setStatus('ready');
          }
        },
        onError: onLoadFailed,
      });
    } catch (error) {
      onLoadFailed(error);
    }
  };

  const waitForLoad = (ms) =>
    new Promise((resolve) => {
      if (status !== 'loading' || ms <= 0) {
        resolve();
        return;
      }
      let unsubscribe = () => {};
      const timer = setTimeout(() => {
        unsubscribe();
        resolve();
      }, ms);
      unsubscribe = subscribe(() => {
        if (status !== 'loading') {
          clearTimeout(timer);
          unsubscribe();
          resolve();
        }
      });
    });

  // 번호를 만들어도 되면 true, 그렇지 않으면 false를 돌려준다.
  const run = async () => {
    if (!isEnabled()) return true;
    count += 1;
    if (count % everyN !== 0) {
      preload();
      return true;
    }
    const s = await getSdk();
    if (s && isSupported(s) && status === 'loading') await waitForLoad(loadWaitMs);
    if (!s || !isSupported(s) || status !== 'ready') {
      preload();
      return true;
    }
    setStatus('idle'); // 이 광고는 이번에 쓴다. 다음 광고는 끝난 뒤에 로드한다.

    return new Promise((resolve) => {
      let earned = false;
      let settled = false;
      const finish = (proceed) => {
        if (settled) return;
        settled = true;
        preload();
        resolve(proceed);
      };
      try {
        s.showFullScreenAd({
          options: { adGroupId },
          onEvent: (event) => {
            if (event.type === 'userEarnedReward') earned = true;
            if (event.type === 'dismissed') finish(type === 'rewarded' ? earned : true);
            if (event.type === 'failedToShow') {
              lastError = '광고 표시에 실패함';
              finish(true);
            }
          },
          onError: (error) => {
            lastError = `광고 표시 오류: ${error?.message ?? error}`;
            finish(true);
          },
        });
      } catch (error) {
        lastError = `광고 표시 예외: ${error?.message ?? error}`;
        finish(true);
      }
    });
  };

  return { isEnabled, preload, run, getStatus, getLastError, subscribe };
};

const IS_MINI_APP = process.env.REACT_APP_AIT === '1';

// 앱을 열 때마다 처음 몇 번의 번호 생성은 광고 없이 쓸 수 있게 한다(기본 1회, 0이면 매번 광고).
const parseFreeCount = (raw) => {
  if (raw === undefined || raw === '') return 1;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 1;
};
export const FREE_GENERATIONS = parseFreeCount(process.env.REACT_APP_AD_FREE_GENERATIONS);

export const AD_TYPE = process.env.REACT_APP_AD_TYPE === 'interstitial' ? 'interstitial' : 'rewarded';

// 테스트 번들에서만 화면에 광고 상태와 오류를 보여 준다(운영 빌드에는 켜지 않는다).
export const AD_DEBUG = process.env.REACT_APP_AD_DEBUG === '1';

export const adController = createAdController({
  loadSdk: IS_MINI_APP ? () => import('@apps-in-toss/web-framework') : null,
  adGroupId: process.env.REACT_APP_AD_GROUP_ID || '',
  type: AD_TYPE,
  everyN: Math.max(1, Number(process.env.REACT_APP_AD_EVERY_N) || 1),
});
