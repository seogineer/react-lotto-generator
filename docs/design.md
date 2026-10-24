# 토스 추천 미니앱 노출 정책 미충족 항목 수정 설계

기준: https://developers-apps-in-toss.toss.im/guide/exposure (추천 미니앱 UX 원칙·지표·성능)
범위 밖: 2회차부터 매번 광고 필수인 구조(정책 결정 필요, 변경 금지).

## 1. 광고를 보고도 결과를 못 받는 경로 (Critical)
- `src/components/Generator.js`의 추천 요청(`fetchRecommendSet`, axios)에 `{ timeout: 5000 }`을 넣는다.
- 추천 요청이 실패·시간 초과되면 `generateRandomSets(1)`로 대체해 항상 결과를 보여주고, "추천 서버 응답이 없어 랜덤으로 만들었어요" 안내를 표시한다.
- 광고 보상 크레딧(`adCreditRef`)과 무료 횟수는 결과를 화면에 보여준 뒤에만 소모한다. 결과가 안 나온 시도 때문에 광고를 다시 요구하지 않는다.

## 2. CRA 템플릿 잔존물 정리 (Critical)
- `public/logo192.png`, `logo512.png`, `favicon.ico`를 `store-assets/logo-numberlab-600.png`를 리사이즈해 교체한다 (python3 Pillow 사용 가능하면 사용, 없으면 ImageMagick).
- `public/manifest.json`: short_name/name을 "로또 번호 연구소", theme_color를 `#0f766e`, background_color를 앱 배경에 맞춘다.
- `public/index.html`: CRA 템플릿 안내 주석을 삭제하고, `<title>`·`og:title` 등 이름이 들어간 메타를 "로또 번호 연구소"로 통일한다 (description 메타도 앱 설명으로).
- 미사용 `src/App.css`, `src/logo.svg`, `reportWebVitals` 참조는 안전하게 제거 가능하면 제거한다 (빌드·테스트가 깨지면 되돌린다).

## 3. 전환 이벤트 로깅 (Major)
- `src/utils/analytics.js` 신설: ads.js와 같은 방식(`IS_MINI_APP`일 때만 `@apps-in-toss/web-framework`를 동적 import)으로 `Analytics`를 감싸고, 실패해도 앱 동작에 영향 없도록 try/catch로 삼킨다. 웹 빌드에서는 no-op.
- 기록 이벤트: 화면 진입(`screen`, log_name `home`), 번호 생성 버튼 클릭(`click`, log_name `generate`, mode·ad 여부), 광고 노출/보상 지급/중도 종료, 생성 완료, 복사.
- SDK의 정확한 시그니처는 `node_modules/@apps-in-toss/web-framework`의 타입 정의(`Analytics.screen/click/impression/log`)를 확인해 맞춘다.

## 4. 안정성 (Major)
- `src/hooks/useFetch.js`의 `axios.get`에 `{ timeout: 8000 }`을 넣는다.
- `src/App.js`를 ErrorBoundary로 감싸고, 카드 단위로도 fallback("불러오지 못했어요" + 다시 시도)을 둔다.
- `LatestDraw.js`, `WinningNumbers.js`에서 서버 데이터 접근을 방어적으로 바꾼다 (`date?.split`, `firstWinPrize?.toLocaleString?.() ?? '-'`, `data?.content?.map` 등).

## 5. 빈 화면·완료 안내 (Major)
- `src/components/AsyncState.js`: 데이터가 비어 있으면 null 대신 "아직 표시할 회차가 없어요" 안내를 렌더링한다.
- 번호 생성 전 보드 아래에 "버튼을 누르면 6개 번호가 만들어져요" 안내를 둔다.
- 생성 직후 결과 카드에 보이는 완료 문구("번호를 만들었어요. 복사해서 저장해 보세요")를 표시한다.

## 6. 문구·소소한 정리 (Minor)
- `Generator.js`의 부제 "역대 회차 데이터를 분석해 번호를 만들어 드려요"를 두 모드 모두에 맞는 문구("추천 또는 랜덤으로 번호를 만들어 드려요")로 바꾼다.
- 광고 안내 "지금은 광고를 불러올 수 없어 바로 만들어 드려요"를 내부 상태를 드러내지 않는 문구로 다듬는다.
- `apps-in-toss.config.ts`의 `primaryColor`를 앱 CTA 색(`#0f766e`)과 맞춘다.
- 금지 단어(당첨, 추첨, 상금, 1등, 확률, 예측, 적중, 베팅)를 화면 문구에 새로 넣지 않는다. 기존 문구는 이번에 건드리지 않는다.

## 제약
- 기존 디자인·레이아웃·광고 흐름(처음 1회 무료 후 보상형)은 유지한다.
- 변경 후 `npm run build`와 기존 테스트(`CI=true npm test`)가 통과해야 한다.
- 커밋하지 않는다.
