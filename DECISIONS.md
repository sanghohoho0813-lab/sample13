# DECISIONS.md
## 클린웨이파트너스 Service Intelligence AX — 주요 설계결정

1. **B2B 현장서비스 AX로 정의** — 일반 서비스 예약앱/청소업체 홈페이지가 아니라 Service Intelligence AX (고객→계약→일정→직원→현장→품질→리포트→재계약→추가매출 Data Flow).
2. **기술 스택: Vite + React + TypeScript + Tailwind CSS v4** — Website Reference MVP로 정적 배포 가능, 서버 불필요. Data Adapter 구조로 향후 Supabase 전환 가능.
3. **Demo Store = React Context + localStorage** — Action Lifecycle·배정·요청·체크인 상태를 유지하고 `데모 초기화`로 원복. 실 DB 미사용.
4. **직원 Mobile은 Desktop 축소판이 아닌 별도 Action UX** — `/field` 전용 라우트, 체크인→체크리스트→사진→완료 흐름 중심.
5. **AI는 6개 Engine을 규칙 기반 Demo Logic으로 구현, `AI READY` 명시** — 실제 LLM API 미연결. `왜 이렇게 판단했나요?` Modal로 데이터/판단/향후 연결 설명.
6. **고객 Portal 요청 ↔ 내부 AX를 Closed Loop로 연결** — 추가서비스 요청 → Opportunity 생성, 일정변경 요청 → Schedule Request (Demo Store 공유).
7. **실제 GPS/지도/문자 API는 1차 Demo에서 Integration Ready 수준** — UI 상 연결 지점만 표시.
8. **테마는 단일 Deep Teal Premium Service 테마로 고정** — Reference MVP 목적상 9-Theme Picker보다 브랜드 완성도 우선. Neutral 가독성은 v6.0 규칙대로 분리 고정.

## v1.1 Product Shell Upgrade (2026-08-29)

9. **Tutorial은 슬라이드가 아닌 Guided In-App Tour로 구현** — 실제 Route를 이동하고 `data-tour` 앵커를 Spotlight 한다. 배경 App은 30% Dim으로 계속 보이게 유지.
10. **Presentation은 별도 화면이 아니라 Tour 엔진의 11 Step 변형** — 기존 화면을 최적 순서로 보여주는 Navigation Layer. `/presentation`은 런처 역할만 한다.
11. **Device Preview = 동일 Route iframe(`?preview=`)** — 별도 Mockup을 만들지 않는다. Preview 내부에서는 Device Switch를 렌더하지 않아 재귀 Preview를 원천 차단한다.
12. **Preview/Modal은 `document.body`로 portal** — Header의 `backdrop-filter`가 `position: fixed`의 containing block이 되어 모달이 헤더 크기로 갇히던 실제 버그를 구조적으로 제거.
13. **Mobile→PC Preview는 세로 맞춤 + 가로 Pan이 기본** — 1440px를 390px 폭에 맞추면 판독 불가라서, 읽을 수 있는 배율을 우선하고 `폭 맞춤`은 토글로 제공한다.
14. **Responsive는 정보 삭제가 아니라 압축** — 모바일 헤더의 날짜를 숨기지 않고 `08.29 토` 형태로 압축해 유지한다.
15. **Theme는 `html[data-theme]` 토큰 교체 방식** — Tailwind v4 `@theme` 토큰만 바꾸므로 컴포넌트 수정이 없다. Neutral·의미색은 Theme와 분리해 가독성을 고정한다.
16. **`더보기`는 Bottom Sheet 추가 메뉴** — Menu Label과 Behavior 일치(Navigation Semantics). Hamburger(전체 Navigation)와 역할을 분리한다.
17. **Demo Reset은 화면 설정(Theme/Font/Motion)을 보존** — 업무 Demo 상태만 원복한다.

## 현장 사진 반영 (2026-09-02)

18. **사진 원본을 재인코딩 없이 보존** — `public/photos/`에 1448×1086 PNG 원본 그대로 커밋한다. 화질 손실 없이 그대로 렌더하고, 대신 Hero를 제외한 전 이미지에 `loading="lazy"`와 `width/height`를 지정해 초기 로딩과 레이아웃 안정성을 확보한다.
19. **사진은 매핑 Layer로 참조** — 컴포넌트에 경로를 흩뿌리지 않고 `src/lib/demo/photos.ts`의 `photoOf(service)` / `beforeAfterFor(note)`로 해석한다. 서비스가 늘어나도 매핑만 추가하면 된다.
20. **Before/After는 작업 성격으로 자동 선택** — 특이사항 텍스트에 유리·공용공간 키워드가 있으면 유리 쌍, 아니면 바닥 쌍. 리포트마다 무관한 사진이 붙지 않게 한다.
21. **운영 판단 화면에는 사진을 넣지 않는다** — Dashboard·오늘의 AX·작업현황·Upsell·Evidence는 데이터 밀도가 곧 신뢰도이므로 기존 데이터 UI를 유지하고, 사진은 고객 접점(Portal·리포트)과 현장/Story 화면에 집중한다.
22. **사진 위 텍스트는 Deep Teal 그라디언트로 대비 확보** — 사진 톤을 어둡게 바꾸지 않고 브랜드 색 오버레이만 얹어 밝고 깨끗한 현장 리얼리즘을 유지한다.

23. **현장관리 카드는 데이터 우선, 사진은 소형 썸네일** — 현장 12곳에 사진 10종이라 대형 히어로로 쓰면 중복이 그대로 드러나고 운영 정보가 아래로 밀린다. 좌측 소형 썸네일로 낮춰 "유형 식별" 역할만 맡긴다.
24. **현장 사진은 "오늘의 작업"이 아니라 "현장 유형"으로 매핑** — 유형 배지(병의원/사무실/빌딩…)와 사진 의미를 일치시킨다. 작업 기준 매핑은 Before/After와 Field 화면에만 사용한다.
