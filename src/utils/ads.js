// 앱인토스 인앱 광고(전면형/보상형) 제어.
// - 토스 앱 안의 미니앱 빌드(REACT_APP_AIT=1)에서만 SDK를 불러온다. 웹 페이지에서는 광고 없이 동작한다.
// - 광고는 미리 로드해 두고(load -> show -> 다음 load), 준비되지 않았거나 지원되지 않거나 실패하면
//   광고 없이 바로 진행한다. 광고 문제가 핵심 기능(번호 생성)을 막지 않게 하는 것이 원칙이다.
// - 광고 종류(전면형/보상형)는 콘솔에서 만든 광고 그룹 ID로 정해진다. 기본은 보상형이며(REACT_APP_AD_TYPE),
//   보상형은 광고를 끝까지 봐서 보상(userEarnedReward)을 받았을 때만 진행한다. 전면형 그룹을 쓰려면
//   REACT_APP_AD_TYPE=interstitial을 함께 지정해야 한다(종류가 어긋나면 보상이 무시되거나 영영 진행되지 않는다).
// - 운영 빌드에는 실제 광고 그룹 ID를, 테스트에는 테스트용 ID(ait-ad-test-rewarded-id,
//   ait-ad-test-interstitial-id)만 쓴다.

export const createAdController = ({ loadSdk, adGroupId, type = 'interstitial', everyN = 1 }) => {
  let sdk; // undefined: 아직 시도 안 함, null: 사용할 수 없음
  let loaded = false;
  let loading = false;
  let count = 0;

  const isEnabled = () => Boolean(adGroupId) && typeof loadSdk === 'function';

  const getSdk = async () => {
    if (sdk !== undefined) return sdk;
    try {
      sdk = (await loadSdk()) ?? null;
    } catch {
      sdk = null;
    }
    return sdk;
  };

  const isSupported = (s) => {
    try {
      return Boolean(s?.loadFullScreenAd?.isSupported?.() && s?.showFullScreenAd?.isSupported?.());
    } catch {
      return false;
    }
  };

  const preload = async () => {
    if (!isEnabled() || loaded || loading) return;
    const s = await getSdk();
    if (!s || !isSupported(s)) return;
    loading = true;
    try {
      s.loadFullScreenAd({
        options: { adGroupId },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            loaded = true;
            loading = false;
          }
        },
        onError: () => {
          loading = false;
        },
      });
    } catch {
      loading = false;
    }
  };

  // 번호를 만들어도 되면 true, 그렇지 않으면 false를 돌려준다.
  const run = async () => {
    if (!isEnabled()) return true;
    count += 1;
    if (count % everyN !== 0) {
      preload();
      return true;
    }
    const s = await getSdk();
    if (!s || !isSupported(s) || !loaded) {
      preload();
      return true;
    }
    loaded = false;

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
            if (event.type === 'failedToShow') finish(true);
          },
          onError: () => finish(true),
        });
      } catch {
        finish(true);
      }
    });
  };

  return { isEnabled, preload, run };
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

export const adController = createAdController({
  loadSdk: IS_MINI_APP ? () => import('@apps-in-toss/web-framework') : null,
  adGroupId: process.env.REACT_APP_AD_GROUP_ID || '',
  type: AD_TYPE,
  everyN: Math.max(1, Number(process.env.REACT_APP_AD_EVERY_N) || 1),
});
