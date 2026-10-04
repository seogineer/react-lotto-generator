# 로또 번호 생성기_프론트엔드

## 소개
- 랜덤으로 생성되는 번호뿐만 아니라 통계에 기반한 로또 번호 생성기
- 역대 당첨 번호와 가장 빈도 높은 번호의 통계를 조회

## 주요 기능
- 슬롯머신 연출의 번호 생성 (릴이 돌다가 왼쪽부터 차례로 멈춤)
  - 랜덤 번호 생성 (번호 고정/제외 옵션 지원)
  - 통계에 기반한 번호 생성
  - 1게임 / 5게임 선택, 결과 복사·공유, 최근 기록 저장(브라우저 localStorage)
- 최신 당첨 번호와 역대 당첨 번호 조회 (페이지 이동 지원)
- 가장 많이 뽑힌 번호 조회
- 자리별 가장 많이 뽑힌 번호 조회
- 효과음(기본 꺼짐), 키보드 단축키(Space/Enter), 모션 감소 설정 대응

## 학습 목표
- React를 이용한 프론트엔드 개발
- Github pages를 이용한 배포

## 기술 스택
- 언어: Javascript
- 라이브러리: React, Tailwind CSS, axios, lucide-react
- 기타: HTML, CSS, Github pages

## 스크린샷
![슬롯머신 번호 생성 (5게임 티켓)](screenshot1.png)
![최신 당첨 번호, 통계, 당첨 내역](screenshot2.png)
![랜덤 번호 고정/제외 옵션](screenshot3.png)

## 링크
https://seogineer.github.io/react-lotto-generator/

## 프로젝트 구조
```
src/
├── App.js          # 화면 배치
├── components/     # Generator, SlotMachine, Statistics 등 UI 컴포넌트
├── hooks/          # useFetch(로딩/에러/재시도), useLocalStorage
└── utils/          # 번호 생성 로직(lotto.js), 효과음(sound.js)
```

## 설치 및 실행
https://github.com/seogineer/kotlin-spring-lotto-generator

위 백엔드 서버가 동작하는 상태에서 아래 방법으로 프로젝트를 실행해야 정상 작동합니다.

```bash
git clone https://github.com/seogineer/react-lotto-generator.git
cd react-lotto-generator
npm install
npm run start
```

API 주소는 `.env.development`(개발), `.env.production`(배포)의 `REACT_APP_LOTTO_API_URL`로 설정합니다.

## 테스트 및 배포
```bash
npm test          # 번호 생성 로직 단위 테스트
npm run deploy    # 빌드 후 Github pages(gh-pages 브랜치)에 배포
```