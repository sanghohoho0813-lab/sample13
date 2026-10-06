# CLEANWAY PARTNERS · Service Intelligence AX

미래AI랩 **서비스업 대표 AX Reference MVP** — 가상의 기업·상가 정기청소/시설관리 회사
**클린웨이파트너스㈜**를 위한 AI Service Operations System 데모입니다.

> 모든 데이터는 가상의 **DEMO DATA**입니다. 실제 회사·고객·직원 정보가 아닙니다.

## 실행

```bash
npm install
npm run dev        # 개발 서버
npm run build      # 타입체크 + 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
```

## 개발자 가이드

### 품질 게이트 — CI(`.github/workflows/ci.yml`)가 매 push마다 같은 순서로 돌린다

| 명령 | 내용 |
|---|---|
| `npm run typecheck` | `strict` + 미사용 변수·인자 금지, 앱 코드와 테스트·설정 코드(`tsconfig.node.json`) 모두 |
| `npm run lint` | ESLint 9 — TypeScript · React Hooks · Fast Refresh · **jsx-a11y**(접근성) 규칙, 경고 0 |
| `npm test` | Vitest 단위 테스트 — 상태 변경 규칙 · 저장 데이터 복원 · 폼 검증 · 검색 · 오류 경계 |
| `npm run build` | 화면 단위 코드 분할 빌드 (번들 경고 0) |
| `npm run e2e` | Playwright — 실제 빌드를 띄워 PC(1440)·모바일(390) 두 환경에서 사용자 흐름 · 360/768/1024px 넘침 검사 · 콘솔 오류 0 |

로컬에 Playwright 브라우저 대신 다른 Chromium 을 쓰려면 `PW_CHROMIUM=/path/to/chrome npm run e2e`.

### 폴더 구조

```
src/
  App.tsx                 라우트 — AX 화면은 레이아웃 route 하나를 공유, 화면마다 lazy 로딩
  pages/ax · care · field 화면 (AX 운영 · 고객 플랫폼 · 현장직원 앱)
  components/
    ui/                   Card · Modal · Field · StatTile · Photo … 공통 부품
    system/               ErrorBoundary · PageFallback
    layout/ tour/ ai/ charts/ brand/
  lib/
    data/                 state.ts(모양·저장 검증) · reducer.ts(변경 규칙) · context.ts(useDemo) · store.tsx(Provider)
    demo/                 가상 시드 데이터
    tone.ts status.ts search.ts photoSrcSet.ts routeTitles.ts lazyPage.ts
e2e/                      Playwright 시나리오
scripts/optimize-photos.mjs  현장 사진 WebP 파생본 생성 (npm run photos)
```

### 데이터 계층

화면은 `useDemo()` 하나로 상태와 동작을 받는다. 상태 변경은 전부 `lib/data/reducer.ts` 의 **순수 함수**에서 일어나고,
시각·ID 같은 바깥 값은 `meta` 로 주입해 테스트에서 고정한다. 저장된 데이터는 `parseStoredState` 가 검증하며
(버전 · 배열 모양 · 허용값), 손상되었으면 업무 데이터만 초기화하고 테마 · 글자 크기 같은 사용자 설정은 지킨다.
실서비스 전환 시 `store.tsx` 의 dispatch 자리를 API 호출로 바꾸면 화면 코드는 그대로다.

### 성능

| 항목 | 이전 | 현재 |
|---|---|---|
| 현장 사진 20장 | PNG 37.4MB | WebP 1.8MB (1448px) + 480/960px 반응형 — 원본 PNG 는 저장소에 보존 |
| 고객 서비스 소개 화면 이미지 전송량 (모바일) | 약 40MB | 535KB |
| 첫 화면 JS (gzip) | 241KB 단일 번들 | 약 95KB — 화면별 분할, 차트(108KB)는 대시보드 본문 뒤에 로딩 |
| 글꼴 | Pretendard 미로딩(시스템 글꼴로 대체) | Pretendard 자체 호스팅 · 쓰인 글자 조각만 로딩 · `font-display: swap` |

## 주요 화면

| 영역 | 경로 | 내용 |
|---|---|---|
| Business AX | `/` | Executive Dashboard + AI 오늘의 운영 브리핑 |
| | `/today` | 오늘의 AX (행동 우선순위) |
| | `/schedule` | 일정/배정 + **AI Smart Dispatch** · `?id=SC-14`로 특정 일정 바로 열기 |
| | `/sites` `/work` `/team` | 현장·작업·직원/팀 |
| | `/customers` | 고객/계약 + Customer Health |
| | `/renewals` `/upsell` `/profitability` | 재계약 · Upsell · 수익성(대표 전용) |
| | `/ai` | AI Operations Center (6 Engine) · `?tab=risk` 등 탭 딥링크 |
| | `/evidence` `/why-ax` | AX Evidence Log · 기획의도 16 Section |
| | `/presentation` | 시연 모드 (Guided Demo 11 Step) |
| Employee Mobile | `/field` | 현장직원 Action UX (체크인→체크리스트→사진→완료) |
| Customer Portal | `/care` | Public Landing |
| | `/care/home` | 고객 Home + Quick Action (Closed Loop) |
| | `/care/reports` `/care/requests` | Service Report · 요청 현황 (요청 폼: 유형별 필수 입력 · 접수번호) |

## 현장 사진

- `public/photos/` — 실제 현장 사진 20장 (1448×1086 PNG **원본 그대로**, 재인코딩 없음)
- `src/lib/demo/photos.ts` — 서비스명 → 사진, Before/After 쌍, 한국어 alt 매핑
- 배치: Customer Portal(Hero·서비스 10종·관리 전후·현장 기록) · 고객 리포트 Before/After ·
  현장관리/현장 Detail · Field Mobile 사진 등록 · Why AX Hero 및 Story
- Dashboard·오늘의 AX·작업현황·Upsell·Evidence 등 운영 판단 화면은 데이터 UI를 유지

## 제작사 브랜드 (미래AI랩)

- `public/brand/` — 로고 원본 (`mirae-ai-lab-logo.png` 828×250 · `mirae-mark.png` 256×256)
- 투명 픽셀에 남아 있던 흰색 RGB만 alpha bleed로 제거 — **보이는 픽셀은 원본과 100% 동일**
- `src/components/brand/MiraeLogo.tsx` 한 곳에서만 참조 (`MiraeLogo` / `MiraeMark` / `MiraeCredit`)
- 노출 4곳 + favicon: AX 사이드바·Drawer 하단 · Customer Portal Footer · Field 내 정보 ·
  Why AX 하단(`Designed & Built by`) · 브라우저 탭 아이콘
- 다크 배경에서는 로고를 재가공하지 않고 **흰색 칩 위에 원본**을 올려 판독성을 확보

## Product Shell (v1.1)

- **Theme 6종** — Settings → 화면에서 전환. `html[data-theme]` 토큰 교체 방식이라 본문·표 가독성은 고정
- **Guided Tutorial (5 Step) / 시연 모드 (11 Step)** — 실제 Route를 이동하며 실제 화면을 Spotlight
- **Device Preview** — PC에서 `모바일 보기`, 모바일에서 `PC 보기`. 동일 Route·데이터·설정을 다른 Viewport로 렌더 (재귀 Preview 차단, ESC/닫기/Backdrop 종료)
- **메뉴 정보구조** — 1차 7개(대시보드 · 오늘의 AX · 현장 운영 · 고객 관리 · 성장·분석 · AI 센터 · 소개·설정), 세부 기능은 그룹 안으로. 아이콘 색은 카테고리 5계열
- **모바일** — 햄버거 왼쪽 · 좌측 Drawer(그룹 접이식) · 2층 헤더(데모 툴바 + 메인) · `더보기`는 햄버거와 같은 그룹 구조
- **플랫폼 전환** — `고객 플랫폼 보기` / `AX 운영화면 보기`로 명칭 통일
- **Date/Time Parity** — 모바일에서도 날짜를 삭제하지 않고 압축 표시 (`08.29 토` + 초 단위 시각)

## 핵심 구조

- **6 AI Engines** — Smart Dispatch · Risk Radar · Retention · Upsell Finder · Profitability · Executive Briefing (규칙 기반 Demo Logic, `AI READY` 표시, `왜 이렇게 판단했나요?` Modal)
- **Role Switcher** — 대표/관리자/현장직원/고객 전환 시 메뉴·KPI·데이터가 실제로 변경 (RLS Preview)
- **Closed Loop** — Customer Portal 추가서비스 요청 → AX Opportunity 자동 생성 / 일정변경 요청 → Dispatch 재검토
- **Action Lifecycle** — 추천됨 → 확인 → 실행중 → 완료 (+보류/무시) → AX Evidence 기록
- **Data Adapter** — `src/lib/demo/` Seed + `DemoStore`(localStorage). 실서비스 전환 시 이 Layer만 Supabase/API로 교체

## 문서

- `docs/PROJECT_SPEC.md` — 프로젝트 설계도 (Final Objective · CORE/CONDITIONAL/PLUS · Routes · Data Model)
- `PROJECT_STATE.md` — 진행상황 · USER ACTION QUEUE
- `DECISIONS.md` — 주요 설계결정

기준 규격: 미래AI랩 AX Design & Development System v6.0 + AX/Platform Unified System v1.1

## 미래AI랩 브릿지 CTA

- `src/lib/mirae.ts` — **링크와 문구의 단일 수정 지점** (`MIRAE_LINKS` / `MIRAE_CTA_COPY`)
- `src/components/brand/SampleBridgeCTA.tsx` — `SampleBridgeCTA`(섹션) · `SampleBridgeMini`(축약형)
- 노출 5곳: AX 전 화면 하단 · 고객 포털 전 화면 하단 · AX 사이드바 좌하단 ·
  고객 포털 전체 메뉴 · Field Mobile 내 정보
- 메인 CTA는 전 화면 `우리 회사도 만들어보기`로 통일, 외부 링크는 새 탭
- 반짝임은 5.5s 주기 중 64%가 정지 구간인 light sweep 하나뿐이며 motion-reduce에서 꺼진다

## 고도화 (2026-10-06)

- 화면마다 "먼저 볼 것"이 위에 오도록 재배치 — 대시보드 · 일정/배정 · 요청함 · 고객 홈 · 현장 앱
- 고객 요청은 `RequestSheet` 하나로 — 유형별 필수 입력 · 제출 후 오류 표시 · 접수번호 → AX `처리 필요`로 연결
- 모바일 일정 상세는 하단 시트, 1280px 이상은 목록 + 상세 2단
- 공통 폼 부품 `Field` · `TextArea` · `ChoiceGroup` · `ConfirmDialog` (`src/components/ui`)
- 상세: `docs/PROJECT_SPEC.md` O절 · `DECISIONS.md` 51~62

## 2차 고도화 (2026-10-07)

- 처음 쓰는 사람의 동선 기준으로 클릭 단계 축소 — 특정 일정 바로 열기(`/schedule?id=`), 고객 상담 폼 바로 열기(`/care/requests?new=문의`)
- 눌렀을 때 숫자가 바뀌지 않게 브리핑 칩과 AI 센터 탭 건수 통일
- 표 화면은 좁을 때 목록형, 탭 6개 화면은 모바일 3×2, 고객 헤더 태블릿 대응
- 공통 부품 `StatTile`, 카드 키보드 접근, Modal 포커스 관리, 404 안내
- 상세: `docs/PROJECT_SPEC.md` P절 · `DECISIONS.md` 63~73

## 3차 고도화 (2026-10-07) — 개발 품질

- 이미지 95% 경량화(WebP + srcset), 화면 단위 코드 분할, 차트 지연 로딩, Pretendard 자체 호스팅
- 상태 계층을 순수 reducer + 저장 형식 검증으로 재구성, 단위 테스트 35 · E2E 26 · CI
- ESLint(jsx-a11y 포함) 경고 0, 미사용 코드 금지, 의존성 취약점 0 (react-router v7)
- 오류 경계 · 화면별 탭 제목 · 본문 바로가기 · 키보드 포커스 링 · 대화상자 포커스 관리 · 테마를 따르는 차트 색
- 상세: `docs/PROJECT_SPEC.md` Q절 · `DECISIONS.md` 74~85

