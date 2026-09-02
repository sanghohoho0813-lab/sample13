# PROJECT_SPEC.md
## 클린웨이파트너스㈜ Service Intelligence AX — Website Reference MVP

> 본 문서는 「미래AI랩 AX Design & Development System v6.0」 + 클린웨이파트너스 Master Prompt를 기반으로
> 이번 프로젝트에 실제 적용하는 내용만 추린 **프로젝트 전용 설계도**다.

---

## 1. PROJECT FINAL OBJECTIVE

고객·계약·일정·현장·직원·이동·작업·품질·수익성 데이터를 하나로 연결하여

- 오늘 어떤 현장을 먼저 챙겨야 하는지
- 누구를 어디에 배정해야 하는지
- 어떤 고객이 이탈할 가능성이 있는지
- 어디에서 추가매출을 만들 수 있는지

를 **데이터와 AI가 먼저 제안하는 Service Intelligence AX**를 만든다.

미래AI랩 웹사이트에서 이 Reference를 처음 본 서비스업 대표가
**"우리 회사도 이런 식으로 AX를 만들 수 있겠구나"를 3~5분 안에 이해**할 수 있어야 한다.

## 2. 회사 핵심정보 (가상 DEMO Company)

| 항목 | 값 |
|---|---|
| 회사명 | 클린웨이파트너스㈜ (CLEANWAY PARTNERS) |
| 업종 | 사업시설 유지관리 및 현장 서비스업 |
| 연매출 | 약 26억원 (DEMO) |
| 인력 | 임직원·현장인력 28명 / 현장팀 8개 |
| 정기관리 고객사 | 76곳 |
| 월 정기 작업 | 약 520건 / 추가서비스 60~90건 |

모든 데이터는 가상이며 화면에 `DEMO DATA` 표시를 유지한다.

## 3. 핵심 사용자 (Role)

| Role | 접근 범위 |
|---|---|
| 대표 (ceo) | 전체 매출·수익성·고객·직원·AI Strategy·재계약·Upsell·Evidence·설정 |
| 관리자/팀장 (manager) | 전체 일정·배정·현장·직원·고객·업무 AI (수익성/전략 제외) |
| 현장직원 (field) | 본인 일정·현장·체크인·체크리스트·사진·특이사항 (모바일 Action UX) |
| 고객 (customer) | 본인 계약·일정·Service Report·요청 (Customer Care Portal) |

Role Switch 시 Sidebar / KPI / Button / 데이터가 실제로 달라진다.

## 4. CORE (필수)

1. Premium Service AX Shell (Deep Teal Sidebar 280px + Wordmark Champagne Accent)
2. Executive Dashboard (KPI → AI Briefing → 오늘 확인할 것 → Timeline → 진행현황 → 팀 가동률 → 수익 Snapshot)
3. 일정 / 배정 (Left 리스트 · Center 상세 · Right AI Dispatch/Risk)
4. 현장관리 + 현장 Detail (체크인~리포트 연결)
5. Employee Mobile (별도 Action UX: 체크인→체크리스트→사진→완료)
6. 고객 / 계약 + Customer Health Score
7. AI Operations Center (Today/Dispatch/Risk/Retention/Growth/Profit Tab)
8. Retention / Upsell / Profitability
9. Customer Care Portal (Landing + 고객 Home + Report + 요청)
10. Closed Loop 2개 + AX Evidence + Why AX(16 Section) + Responsive

## 5. CONDITIONAL (이번 Demo 활성화)

- 대표/관리자/직원/고객 Role Switcher + RLS Preview (Permission Matrix)
- Customer Portal → Business AX Closed Loop (추가서비스 요청 / 일정변경)
- AI Smart Dispatch Preview (규칙 기반 Demo Logic + AI READY 표시)
- Service Report / Before·After Photo (Demo Placeholder)
- Presentation Mode (12 Step Navigation Layer)
- PC/Mobile Device Preview Switcher
- Demo Reset / Tutorial

### 실서비스에서만 (이번 미구현 — Integration Ready)
Supabase Auth/RLS · 실제 GPS/Geofence · 지도 API · 문자/알림 API · 실제 LLM API · 결제 · 전자계약 · 외부 Calendar

## 6. PLUS (CORE 완료 후 시간 허용 시)

고급 Map UX · Route Visualization · 자동견적 Simulation · 고급 품질분석 · 직원 Performance · Satisfaction Survey · 고급 Motion

## 7. 제외 범위

- 실제 백엔드/DB/외부 API 호출 (Data Adapter 구조만 준비)
- 실제 지도/GPS (Integration Ready 표시)
- 결제/전자계약

## 8. Information Architecture (Business AX Sidebar)

```text
OVERVIEW        대시보드 / 오늘의 AX
SERVICE         일정·배정 / 현장관리 / 작업현황 / 직원·팀
CUSTOMER        고객·계약 / 요청·문의 / 품질·만족도
GROWTH          재계약 관리 / 추가서비스 / 수익성 분석
AI              AI Operations Center
AX              AX Evidence / 기획의도
SYSTEM          설정
```

## 9. Routes

| Route | 화면 |
|---|---|
| `/` | Business AX Dashboard |
| `/today` | 오늘의 AX |
| `/schedule` | 일정 / 배정 + AI Smart Dispatch |
| `/sites` , `/sites/:id` | 현장관리 / 현장 Detail |
| `/work` | 작업현황 |
| `/team` | 직원 / 팀 |
| `/customers` , `/customers/:id` | 고객·계약 / Customer Health |
| `/requests` | 요청 / 문의 |
| `/quality` | 품질 / 만족도 |
| `/renewals` | 재계약 관리 (Renewal Center) |
| `/upsell` | 추가서비스 (Upsell Center) |
| `/profitability` | 수익성 분석 |
| `/ai` | AI Operations Center |
| `/evidence` | AX Evidence Log |
| `/why-ax` | 기획의도 (16 Section Story) |
| `/settings` | 설정 (RLS Preview, Tech·Data, Demo Reset) |
| `/presentation` | Presentation Mode |
| `/field` | Employee Mobile (현장직원 전용) |
| `/care` | Customer Front Public Landing |
| `/care/home` | Customer Portal Home |
| `/care/reports` | 고객 Service Report |
| `/care/requests` | 고객 요청 |

## 10. Data Model (Demo Repository — `src/lib/demo/`)

customers · sites · contracts · serviceTypes · schedules · assignments · employees · teams ·
workSessions · checklists · workPhotos · serviceReports · customerRequests · qualityIssues ·
customerHealth · renewalOpportunities · upsellOpportunities · profitabilitySnapshots ·
aiInsights · actions · evidenceLogs

- UI ↔ Data는 `DemoStore`(React Context + localStorage) 경유 — 향후 Supabase/API로 교체 가능한 Adapter 구조
- 상태 변경(Action Lifecycle, 배정, 요청, 체크인)은 localStorage에 유지, `데모 초기화`로 원복

## 11. SIX AI ENGINES 적용 위치

| Engine | 노출 위치 |
|---|---|
| 01 AI Smart Dispatch | 일정/배정 Right Panel, Dashboard |
| 02 AI Service Risk Radar | Dashboard, 오늘의 AX, 현장 Detail |
| 03 AI Customer Retention | 재계약 관리, 고객 Detail, Dashboard |
| 04 AI Upsell Finder | Upsell Center, 고객 Detail, Customer Portal |
| 05 AI Service Profitability | 수익성 분석, 고객 Detail |
| 06 AI Executive Daily Briefing | Dashboard 상단, 대표 Mobile |

모두 규칙 기반 Demo Logic + `AI READY` 표시 + `왜 이렇게 판단했나요?` Modal.

## 12. Demo / Live 전략

- 전체 `DEMO` Mode 명시 (Sidebar 하단 + Data Freshness 표시)
- Data Freshness: `DEMO DATA · 마지막 업데이트 HH:MM:SS`
- 실데이터/AI/GPS/지도는 Integration Ready로만 표시

## 13. 디자인 적용방향

- 컨셉: **Premium Service Operations SaaS** (Trust / Clean / Professional / Calm / Intelligence)
- Palette: Deep Teal `#08343A` · Premium Teal `#0E6D71` · Clean Aqua `#52A7A3` · Soft Mint `#DDEDEA` · Champagne Sand `#D7BC86` · Warm Ivory `#F7F5F0`
- Sidebar Deep Teal / Workspace White·Warm Ivory / AI Indigo Accent / Risk Amber·Soft Red / Success Emerald
- 본문·Table·Card Neutral은 테마와 분리 고정
- Typography: Root 19px · Body 18~19px · Sidebar 18~20px · Page Title 32~36px · KPI 36~44px
- `word-break: keep-all` · 숫자 `tabular-nums` · 물방울/빗자루/거품/캐릭터 금지

## 14. PC / Mobile

- Business AX: Desktop Sidebar 구조 / Mobile은 Bottom Nav(홈·일정·AI·고객·메뉴)
- Employee Mobile: 완전 별도 Action UX + Bottom Nav(오늘·현장·알림·리포트·내 정보)
- Customer Portal: 반응형 + 큰 Quick Action
- PC에서 `[PC] [Mobile]` Device Preview Switcher (Phone Frame, 실제 Responsive CSS)

## 15. 완료기준 (Closed Loop Acceptance Test)

- **A 운영**: 미배정 일정 → AI Dispatch → 배정 → 직원 Mobile 체크인 → 작업 → 완료 → Service Report
- **B Risk**: Dashboard Risk → 현장 Detail → AI 지연분석 → 재배정 Action → 실행중 → 완료 → Evidence
- **C Customer**: Portal 추가서비스 요청 → AX Opportunity 생성 → 담당자 확인 → Action
- **D Retention**: 갱신 Risk → Customer Health → AI Retention → Action → 완료 → 재계약 Result → Evidence
- **E Mobile**: 직원 오늘 일정 → 체크인 → 체크리스트 → 사진 → 완료
- **F Role**: 대표 전체 수익성 / 직원 본인 현장만 / 고객 본인 계약·Report만

추가: 실시간 시계 · Demo Reset · AI Ready Modal · Loading/Empty/Error · 한글 줄바꿈 · Mobile Overflow 없음

---

# v1.1 Product Shell Upgrade (2026-08-29)

기존 Business Core / Field / Customer 기능은 보존하고 Product Shell(주변 UX)을 완성한 작업.
Source of Truth: 「미래AI랩 AX + Platform Unified Design & Development System v1.1」

## A. CROSS-DEVICE FEATURE PARITY MATRIX

| 기능 | Desktop | 실제 Mobile | 반대 Device Preview | Discoverable | Behavior Parity |
|---|---|---|---|---|---|
| 날짜 | O (2026년 8월 29일 토요일) | O (08.29 토 — 압축) | O | Header 상시 | 필수 · 충족 |
| 현재시각(초) | O | O | O | Header 상시 | 필수 · 충족 |
| Theme 6종 | O | O | O (상태 공유) | 설정 / More Sheet | 필수 · 충족 |
| Font Scale | O | O | O | 설정 | 필수 · 충족 |
| Motion 줄이기 | O | O | O | 설정 | 필수 · 충족 |
| Tutorial | O | O | 미실행(의도) | Sidebar / More / 설정 | 필수 · 충족 |
| Presentation | O | O | 미실행(의도) | Sidebar / More / 설정 | 필수 · 충족 |
| Why AX | O | O | O | Sidebar + Drawer + More | 필수 · 충족 |
| Role Switch | O | O | O | Header / 설정 | 필수 · 충족 |
| Demo Reset | O | O | — | 설정 / More Sheet | 필수 · 충족 |
| Customer 전환 | O (Header) | O (More Sheet) | O | 양쪽 진입점 | 역할조건 · 충족 |
| AX 복귀 | O (Care Header) | O (Care Header) | O | 상시 | 필수 · 충족 |
| Device Preview | O → Mobile만 | O → PC만 | 차단(재귀 금지) | Header 상시 | 조건부 · 충족 |
| 전체 Navigation | O (Sidebar 280px) | O (Hamburger Drawer) | O | 상시 | 필수 · 충족 |
| 추가 메뉴 | Sidebar 전체 노출 | More Sheet 15항목 | O | Bottom Nav | 필수 · 충족 |

Preview 내부에서는 Device Switch Control을 렌더하지 않는다(재귀 Preview 금지).

## B. Device Preview 정의

- 동일 Route · 동일 Data · 동일 State · 동일 Role · 동일 Theme를 다른 Viewport에서 렌더
- 구현: `iframe src = 현재 pathname + ?preview=mobile|pc`, 상태는 localStorage 공유
- Mobile Preview 390×844 (Fit) / PC Preview 1440×900 (세로 맞춤 + 가로 Pan, `폭 맞춤` 토글 제공)
- 모달은 `document.body`로 portal — Header의 `backdrop-filter`가 fixed containing block이 되는 문제 회피
- 종료: X 버튼 / Backdrop / ESC → overlay·scroll lock·Route 원복

## C. Guided Tour 엔진 (Tutorial 5 / Presentation 11)

`src/components/tour/TourProvider.tsx` — 실제 Route 이동 → 대상 DOM(`data-tour`) 렌더 대기 →
`scrollIntoView` → Spotlight(주변 30% Dim) → 설명 Card → Next → 다음 Route 자동 이동.
Presentation은 Role 전환(field/customer)까지 포함해 Surface를 넘나든다.

### data-tour 앵커
`kpi` · `ai-briefing` · `dispatch` · `customer-health` · `renewal` · `upsell` ·
`requests` · `evidence` · `why-hero` · `field-next` · `care-quick`

## D. Theme System

`html[data-theme]`로 6개 토큰(Shell/Primary/Accent/Secondary/Soft/Canvas)을 교체.
Neutral(본문·Table·Card·Border)과 의미색(Success/Warning/Danger/Info)은 Theme와 분리 고정.

signature · navy · tealchampagne · graphite · indigo · forest

## E. Navigation Semantics

| Label | Behavior |
|---|---|
| 더보기 | Bottom Sheet 추가 메뉴 (Route 직접 이동 아님) |
| Hamburger | 전체 Navigation Drawer |
| 모바일 보기 / PC 보기 | 반대 Device Preview |
| 고객 화면 보기 | Customer Care Portal |
| 기획의도 | Why AX Story |
| 설정 · 테마 | Settings |

## F. Settings 구조

화면(Theme·Font·Motion) / 사용자·권한(Role·Permission Matrix) / Demo(초기화·Tutorial·Presentation) /
Data(Freshness·CSV·연결상태) / AI(동작방식·AI READY) / 연결(Portal·Field·알림)

## G. Why AX Story (16 Section)

Hero → 01 서비스업 변화 → 02 AX 정의 → 03 현장서비스 필요성 → 04 보유 Data → 05 문제 →
06 현재 Flow → 07 변화 Flow(Before/After) → 08 효율화가 끝이 아니다 → 09 재계약 → 10 추가서비스 →
11 AI 6 Engine → 12 Action Lifecycle → 13 Customer Platform → 14 Data 자산화 → 15 정책·사업화 →
16 5개 성장경로 + Escape Path(Dashboard 복귀)

일반론 뒤에 반드시 `CLEANWAY라면` 회사 맞춤 해석 블록을 배치(5개소).

---

# H. 현장 사진 배치 맵 (2026-09-02)

원본 20장(1448×1086 PNG)을 재인코딩 없이 `public/photos/`에 보존하고, `src/lib/demo/photos.ts`에서
서비스명·Before/After 매핑으로 참조한다. 모든 이미지에 한국어 `alt`와 `width/height`(CLS 방지),
Hero 외 전부 `loading="lazy"`를 적용한다.

| # | 파일 | 내용 | 배치 위치 |
|---|---|---|---|
| 01 | `01-hero-lobby-service.png` | 로비 전문 장비 바닥관리 | Customer Portal Landing **Hero 배경** |
| 02 | `02-office-regular.png` | 사무실 정기청소 | 서비스 그리드 · 현장 카드/배너 |
| 03 | `03-retail-regular.png` | 상가 정기관리 | 서비스 그리드 · 현장 카드/배너 |
| 04 | `04-clinic-care.png` | 병·의원 청소관리 | 서비스 그리드 · 고객 Home 배너 · 현장 |
| 05 | `05-academy-care.png` | 학원·교육시설 관리 | 서비스 그리드 · 현장 |
| 06 | `06-common-area.png` | 건물 공용부 관리 | 서비스 그리드 · 현장 (기본값) |
| 07 | `07-floor-wax.png` | 바닥 세척 / 왁스 | 서비스 그리드 · 현장 · Upsell 매핑 |
| 08 | `08-glass-cleaning.png` | 유리창 집중청소 | 서비스 그리드 · 현장 · Upsell 매핑 |
| 09 | `09-disinfection.png` | 소독 / 위생관리 | 서비스 그리드 · 현장 · Upsell 매핑 |
| 10 | `10-aircon-cleaning.png` | 에어컨 세척 | 서비스 그리드 · Upsell 매핑 |
| 11 | `11-move-in-out.png` | 입주·퇴거 특수청소 | 서비스 그리드 · Upsell 매핑 |
| 12 | `12-before-floor.png` | Before ① 바닥 | Landing 관리 전·후 · 현장 Detail · Field · 고객 리포트 |
| 13 | `13-after-floor.png` | After ① 바닥 | 〃 (12와 쌍) |
| 14 | `14-before-glass.png` | Before ② 유리/공용 | 〃 + 고객 Home **AI 제안 근거 사진** · Why AX 10 |
| 15 | `15-after-glass.png` | After ② 유리/공용 | 〃 (14와 쌍) |
| 16 | `16-field-mobile-report.png` | 현장 모바일 작업등록 | Landing 현장 기록 · Why AX 08-1 ① |
| 17 | `17-manager-inspection.png` | 관리자 품질점검 | Landing 현장 기록 · Why AX 08-1 ③ |
| 18 | `18-equipment-supplies.png` | 장비·소모품 관리 | Landing 현장 기록 |
| 19 | `19-completion-photo.png` | 작업 완료 증빙촬영 | Landing Portal 안내 · Why AX 08-1 ② |
| 20 | `20-ax-connect.png` | AX 연결 대표 | **Why AX Hero 배경** |

## 사진을 넣지 않는 화면 (데이터 UI 유지)
AX Dashboard · 오늘의 AX · 일정/배정 · 작업현황 · 고객/계약 · 재계약 · Upsell Center ·
수익성 · AI Operations Center · AX Evidence · 설정 — 운영 판단 화면은 데이터 밀도를 유지한다.

## 현장 카드/배너 매핑 규칙
현장 카드·배너는 **현장 유형**(`SITE_TYPE_PHOTO`)으로 매핑한다. "오늘의 작업" 기준으로 매핑하면
병원 현장에 엘리베이터 소독 사진이, 행사장 현장에 폴리셔 사진이 걸려 유형 배지와 의미가 어긋난다.
또한 현장 12곳 > 사진 10종이라 중복이 불가피하므로, 썸네일은 대형 히어로가 아니라
**카드 좌측 소형(4.1×3.1rem)** 으로 두어 데이터가 카드 상단을 차지하게 한다.

## Before / After 선택 규칙
`beforeAfterFor(note)` — 작업/특이사항 텍스트에 `유리·창·공용·로비`가 포함되면 유리 쌍(14/15),
그 외에는 바닥 쌍(12/13)을 사용한다.

---

# I. 제작사 브랜드(미래AI랩) 노출 규칙 (2026-09-02)

`public/brand/` 에 원본 로고를 보존하고, `src/components/brand/MiraeLogo.tsx` 한 곳에서만 참조한다.

| 파일 | 크기 | 용도 |
|---|---|---|
| `mirae-ai-lab-logo.png` | 828×250 | 가로형 로고 (크레딧 전용) |
| `mirae-mark.png` | 256×256 | M 심볼 — favicon · apple-touch-icon |

## 원본 보존 원칙
전달받은 로고는 이미 배경이 투명했으나 **투명 픽셀에 흰색 RGB가 남아 있어**
Deep Teal 위로 축소될 때 흰 테두리(fringe)가 생겼다. 이를 alpha bleed(투명 픽셀의 RGB를
인접 불투명 픽셀 색으로 채움)로 제거했고, **보이는(불투명) 픽셀은 원본과 바이트 단위로 동일**하다.
로고의 색·형태·비율은 어떤 화면에서도 재가공하지 않는다.

## 다크 배경 처리
로고 워드마크가 진한 남색이라 Deep Teal 사이드바에서는 판독이 되지 않는다.
로고를 흰색으로 바꾸는 대신 **흰색 칩(plate) 위에 원본을 그대로** 올린다 (`MiraeCredit tone="dark"`).

## 노출 위치 (의도적으로 절제 — 4곳 + favicon)
| 위치 | 형태 | 이유 |
|---|---|---|
| AX 사이드바 / 모바일 Drawer 하단 | `Powered by` + 흰 칩 로고 | 전 AX 화면에 상시 노출되는 단 하나의 지점 |
| Customer Portal Footer | `Powered by` (밝은 배경) | 고객 접점의 마지막 신뢰 요소 |
| Field Mobile · 내 정보 | `Powered by` (밝은 배경) | 직원 앱에서 유일한 제작사 표기 |
| Why AX 하단 | `Designed & Built by` | Story의 마지막 = 제작사 서명 |
| 브라우저 탭 / 홈 화면 | `mirae-mark.png` | favicon · apple-touch-icon |

## 넣지 않는 곳
AX 화면 본문(Dashboard·오늘의 AX·일정·현장·고객·AI·Evidence)·모든 카드 헤더·시연 모드 오버레이.
사이드바 크레딧이 이미 상시 노출되므로 같은 화면에 로고가 두 번 나오지 않게 한다.
설정 화면 Footer는 로고 대신 `POWERED BY 미래AI랩` 텍스트만 사용한다.
