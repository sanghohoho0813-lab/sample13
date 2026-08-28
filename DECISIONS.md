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
