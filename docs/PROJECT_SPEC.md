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

---

# J. 향후 확장 로드맵 (2026-09-03)

전체 메뉴(Desktop Sidebar · Mobile Drawer) 하단에 `향후 확장 · ROADMAP` 섹션을 둔다.
**사업시설 유지관리·현장 서비스 업에서 현재 Core 위에 실제로 얹을 수 있는 확장만** 담는다.
동작하지 않는 영역이므로 Route를 만들지 않고, 항목을 눌러 "무엇을·왜"만 펼쳐 보여준다.

| 항목 | 단계 | 현재 Core에서 무엇을 재사용하나 |
|---|---|---|
| 다지점 통합관리 | NEXT | 고객/계약 + 현장 — 지점을 한 계약·한 리포트로 묶음 |
| 구독형 관리 | NEXT | 계약 + 추가서비스 — 주기 특수관리를 월 구독으로 패키지화 |
| 협력사 네트워크 | NEXT | 일정/배정 + 품질 — 외주 물량을 동일 품질 기준으로 검수 |
| 소모품 · 자재 | NEXT | 수익성 — 현장별 사용량을 원가에 연결 |
| 위생 · 방역 증빙 | NEXT | AX Evidence + 작업 사진 — 점검 대응 문서 자동 축적 |
| 채용 · 교육 관리 | NEXT | 직원/팀 — 배정 가능 인력을 정확히 카운트 |
| 견적 · 전자계약 | Preview | 현장 조건 → 견적 → 전자계약 → 자동청구 |
| 종합 시설관리(FM) | Preview | 청소 → 설비·경비·조경으로 계약 범위 확장 |
| IoT 스마트 현장 | Preview | 일정/배정 — 주기 기반이 아닌 필요 시점 투입 |
| ESG · 친환경 | Long-term | 작업 기록 — 고객사 ESG 보고 연계 |

## 두 개의 목소리 — 단일 원본
데이터는 `src/lib/demo/roadmap.ts` 하나에서만 정의하고 두 화면이 함께 읽는다.
같은 항목이라도 보는 사람이 다르므로 문구를 두 벌 갖는다.

| | Business AX (전체 메뉴) | Customer Portal (`/care`) |
|---|---|---|
| 목소리 | `label` / `desc` — "우리 운영이 어떻게 바뀌나" | `customerLabel` / `customerDesc` — "우리가 무엇을 더 받게 되나" |
| 노출 | 10개 전부 | 9개 (`customerDesc`가 있는 항목만) |
| 형태 | 사이드바 목록 · 눌러서 설명 펼침 | 상단 `전체 메뉴` Drawer + 랜딩 하단 카드 그리드 |

`채용 · 교육 관리`는 내부 인사·조직 영역이라 `customerDesc`를 두지 않아 고객 화면에서 자동 제외된다.

## 규칙
- 단계 배지는 `NEXT`(다음 단계) / `Preview`(개념 검증) / `Long-term`(장기)로 고정한다.
- 라벨은 항상 한 줄(truncate) — 290px Drawer에서 3줄로 무너지지 않게 한다.
- 섹션 하단에 "아직 구현되지 않은 로드맵"임을 명시한다 (DEMO 정직성).
- AX 사이드바에서는 섹션 전체를 접을 수 있고, 선택은 `localStorage`(`cleanway.roadmapOpen`)에
  기억된다. 화면 설정이므로 `데모 초기화`의 영향을 받지 않는다.

# K. 모바일 헤더 액션 (2026-09-03)

`고객 화면 보기`가 `sm` 미만에서 숨겨져 모바일에서 고객 화면으로 갈 방법이 헤더에 없었다.
헤더 우측을 **아이콘 액션으로 압축**하는 규칙으로 통일한다 (기능 삭제가 아니라 압축).

| 컨트롤 | Mobile | sm 이상 |
|---|---|---|
| PC 보기 | 아이콘만 (`aria-label`·`title` 유지) | 아이콘 + 라벨 |
| 고객 화면 보기 | 아이콘만 (Primary 채움색으로 구분) | 아이콘 + 라벨 |
| Role Switcher | 라벨 유지 | 라벨 유지 |

좌측 그룹(햄버거 + 실시간 시계)은 `overflow-hidden`으로 클리핑해
우측 액션이 늘어나도 시계 위로 겹치지 않게 한다.

# L. 고객 포털 전체 메뉴 (2026-09-03)

랜딩 하단의 `앞으로 준비 중인 서비스`는 스크롤을 끝까지 내려야 보여 실제로는 잘 읽히지 않았다.
하단 섹션은 그대로 두고, 헤더에 `전체 메뉴` 햄버거를 두어 **상단에서도 전부 볼 수 있게** 한다.

## Drawer 구성 (우측 슬라이드)
1. **서비스** — 내 관리현황 / 작업 리포트 / 요청·문의 / 서비스 소개 (설명 한 줄 포함)
2. **앞으로 준비 중인 서비스** — `CUSTOMER_ROADMAP` 9종, 눌러서 설명 펼침 (랜딩과 동일 원본)
3. **상담 CTA** — Deep Teal 카드 + `서비스 상담 신청`
4. **DEMO · ADMIN** — Business AX 보기 / 고객 권한으로 보기 (고객 Role에는 미노출)
5. 제작사 크레딧

닫기: X 버튼 · 바깥 영역 · ESC · Route 이동 시 자동. 열려 있는 동안 body scroll lock.

## 고객 포털 헤더 압축 규칙 (AX 헤더와 동일)
| 컨트롤 | Mobile | sm 이상 |
|---|---|---|
| PC 보기 | 아이콘만 | 아이콘 + 라벨 |
| Business AX | 아이콘만 | 아이콘 + 라벨 |
| 전체 메뉴 | 아이콘만 | 아이콘 + 라벨 |
| 브랜드 | `0.82rem`로 축소 (말줄임 없이 전체 노출) | `1rem` |

360px에서 브랜드가 `CLEANWAY PA…`로 잘리던 문제는 액션을 아이콘으로 압축해 폭을 확보하고
브랜드 크기를 낮춰 해결했다. 정보를 지우지 않고 압축한다는 규칙을 그대로 따른다.

# M. 미래AI랩 브릿지 CTA (2026-09-18)

샘플을 다 본 사람이 "우리 회사도 이렇게 가능하겠다"까지 가도록 잇는 구간.
로고는 이미 사이드바·푸터에 상시 노출되므로 **여기서는 로고를 반복하지 않고**
브랜드명과 짧은 소개만 둔다.

## 수정 지점 (단 두 곳)
| 무엇 | 파일 |
|---|---|
| 링크 3종 (consult / samples / home) | `src/lib/mirae.ts` → `MIRAE_LINKS` |
| 문구 전체 (배지·헤드라인·본문·버튼) | `src/lib/mirae.ts` → `MIRAE_CTA_COPY` |
| 화면별 예외 링크 | `SampleBridgeCTA` props — `consultHref` / `samplesHref` / `homeHref` |

## 컴포넌트 — `src/components/brand/SampleBridgeCTA.tsx`
- `SampleBridgeCTA` — 화면 하단 공통 섹션 (배지 → 헤드라인 → 설명 → 메인 CTA → 보조 링크)
- `SampleBridgeMini` — 사이드바·모바일용 3버튼 축약형 (`tone: 'light' | 'dark'`)

## 배치
| 위치 | 형태 | 적용 범위 |
|---|---|---|
| `AxLayout` `<main>` 하단 | 섹션 | **모든 AX 화면** (대시보드·오늘의AX·현장·기획의도·설정 …) |
| `CareShell` `<main>` 하단 | 섹션 | **모든 고객 포털 화면** (`/care`, `/care/home`, `/care/reports`, `/care/requests`) |
| AX 사이드바 좌측 하단 | 축약형 (dark) | 전 AX 화면 상시 — 하단까지 내려가지 않아도 닿는다 |
| 고객 포털 `전체 메뉴` Drawer | 축약형 (light) | 상단 메뉴에서도 바로 |
| Field Mobile `내 정보` | 축약형 (light) | 좁은 화면이라 섹션 대신 축약형 |

## 애니메이션 — 광고처럼 보이지 않는 선
`.cta-sweep` : 5.5s 주기 중 **0~64% 구간은 정지**, 나머지에서 한 번만 스친다.
`.cta-glow`  : 7s 주기의 아주 옅은 glow (배지 전용).
`html[data-motion="reduce"]`와 `prefers-reduced-motion`에서는 `display:none` / `animation:none`으로 완전히 끈다.

금지: 빠른 깜빡임 · 지속적 번쩍임 · 네온 · attention-seeking.

## 접근성
- 메인 CTA 최소 높이 `3.1rem`, 모바일 full-width — 터치 타깃 확보
- 외부 링크는 전부 `target="_blank"` + `rel="noopener noreferrer"`
- 섹션에 `aria-labelledby`로 제목 연결
- 메인 CTA 문구는 전 화면 `우리 회사도 만들어보기`로 통일

# N. UI/UX 안정화 — 메뉴 정보구조 · 한글 UI · 반응형 (2026-09-30)

기능·route·데이터·business logic은 하나도 삭제하지 않고 **노출 구조만** 정리했다.

## AX 메뉴 정보구조 (1차 노출 15 → 7)
| 1차 메뉴 | 2차 (기존 route 그대로) | 아이콘 계열 |
|---|---|---|
| 대시보드 | `/` | 운영 (aqua) |
| 오늘의 AX | `/today` | 운영 |
| 현장 운영 | 일정/배정 `/schedule` · 현장관리 `/sites` · 작업현황 `/work` · 직원/팀 `/team` | 운영 |
| 고객 관리 | 고객/계약 `/customers` · 요청/문의 `/requests` · 품질/만족도 `/quality` · 재계약 관리 `/renewals` | 고객 (rose) |
| 성장 · 분석 | 추가서비스 `/upsell` · 수익성 분석 `/profitability` · AX 실증 기록 `/evidence` | 성장 (amber) |
| AI 센터 | `/ai` | AI (indigo) |
| 소개 · 설정 | 기획의도 `/why-ax` · 설정 `/settings` | 시스템 (slate) |

- 아이콘 색은 **카테고리당 1개, 전체 5계열** (`FAMILY` in `AxLayout.tsx`). 기존 13색 무지개 폐기.
- 모바일 Drawer: 좌측, `86vw / max 370px`, 그룹은 접이식(현재 화면이 속한 그룹만 열림), 자체 스크롤, body scroll lock.
- Desktop 사이드바: 그룹 접이식(여러 그룹 동시 펼침 가능, 현재 화면 그룹은 자동 펼침), 접힌 그룹은 하위 항목 수 표시. 1280×800에서도 스크롤 없이 전체가 보인다. (2026-10-06 변경)
- `더보기` Bottom Sheet: 햄버거와 같은 그룹 구조 + 데모 도구 + 고객 플랫폼 보기.
- 확장 기능(향후 로드맵 10종)은 핵심 메뉴와 같은 무게로 나열하지 않고 `확장 기능 보기` 한 줄로 접는다(기본 접힘).

## 플랫폼 전환 명칭
- AX → 고객: **고객 플랫폼 보기** (상단 툴바 + 햄버거 하단 full-width CTA + 더보기 하단)
- 고객 → AX: **AX 운영화면 보기** (DEMO 툴바 + 고객 Drawer 하단, 고객 Role에는 미노출)
- 현장직원 앱 → AX: **AX 운영화면**

## 모바일 헤더 2층 구조
- 1층 **데모 툴바**: (DEMO) · 역할 전환 · PC 보기 · 고객 플랫폼 보기/AX 운영화면 보기
- 2층 **메인 헤더**: [햄버거 44px] 날짜·시각 / 고객 플랫폼은 [햄버거] 브랜드
- 햄버거는 AX·고객 플랫폼 모두 **왼쪽**.

## 한글 UI 원칙
- 상태 표기 통일: `NEXT → 예정`, `Preview → 미리보기`, `Long-term → 장기` (`STAGE_NOTE`)
- 영문 그룹명·탭·배지 제거 (OVERVIEW→개요 구조로, Today/Week/Team→오늘/이번 주/팀별, BEFORE/AFTER→작업 전/후 …)
- AI 엔진명: 스마트 배정 · 서비스 위험 감지 · 재계약 관리 · 추가매출 발굴 · 서비스 수익성 · 경영 브리핑
- 고객 건강도 상태는 **데이터 값은 유지**하고 화면 표기만 한글 (`HEALTH_STATUS_LABEL`)
- 유지하는 영문: AI · AX · DEMO · RLS · API · CSV · GPS · 브랜드명(CLEANWAY) · 기술 스택명

## 줄바꿈 · 넘침 규칙 (`src/index.css`)
- `body { word-break: keep-all; overflow-wrap: anywhere; }` — 한글은 단어 단위, 띄어쓰기 없는 긴 회사명은 칸을 넘칠 때만 끊는다
- `.tnum { overflow-wrap: normal; flex-shrink: 0; }` — 숫자·금액·날짜·시간은 끊기거나 눌리지 않는다
- `Badge`는 `shrink-0` — 상태 배지는 절대 눌리지 않고 옆의 긴 이름이 줄바꿈된다
- 12px 미만 글자 금지 — 최소 `0.72rem`(13.7px)
- 표는 좁아지면 칸을 누르지 않고 가로 스크롤 (`min-w-[…]` + `overflow-x-auto`)

## 검증 스크립트 (scratchpad, Playwright)
- 뷰포트 360/390/412/430/1280/1440 × 22개 화면: 넘침 · 세로 깨짐 · 단어 중간 끊김 · 헤더 요소 겹침 · 12px 미만 · 가로 스크롤
- 긴 데이터 stress: 26자 회사명 · 1,254,540만원 금액 주입 후 동일 검사

# O. 고도화 — 화면 우선순위 · 입력 검증 · 흐름 안정화 (2026-10-06)

핵심 개념·route·데이터 구조는 그대로 두고, **같은 정보를 더 빨리 읽히게** 재배치하고 **입력·처리 흐름을 끝까지 닫았다.**

## 화면별 정보 우선순위
| 화면 | 변경 |
|---|---|
| 대시보드 `/` | KPI 6 → AI 브리핑(요약 1줄 + 근거 3줄 + 엔진별 건수 칩) → 오늘 먼저 확인할 것 → 오늘 일정(진행 막대 + 남은 일정) → 팀 · 추이 · 매출. KPI와 중복되던 파이차트·대형 카운터 4개 제거 (모바일 높이 5,496 → 4,613px) |
| 일정/배정 `/schedule` | 미배정 배너 → 위험 칩 → 탭(건수) → 컴팩트 목록. 1280px 이상은 목록 + 오른쪽 상세, 미만은 **하단 시트**로 상세 (모바일 높이 6,319 → 3,464px) |
| 요청/문의 `/requests` | 상태 탭 `처리 필요 · 처리중 · 완료 · 전체` + 건수, 긴급 방문은 같은 상태 안에서 맨 위 |
| 고객 홈 `/care/home` | 다음 방문 → **무엇을 도와드릴까요?(3×2)** → AI 제안 → 최근 리포트 · 내 요청. 계약 정보는 모달 |
| 현장 앱 `/field` | 4단계 진행 표시(도착 · 작업 시작 · 기록 · 완료) + 완료 전 `남은 항목` 안내 |
| AI 센터 `/ai` | 탭을 URL에 보존 `?tab=dispatch|risk|retention|upsell|profit` — 대시보드 칩에서 바로 해당 탭으로 |

## 고객 요청 폼 (`src/pages/care/RequestSheet.tsx`)
| 유형 | 필수 입력 | 선택 |
|---|---|---|
| 추가서비스 | 서비스 · 희망 시기 | 메모 |
| 일정변경 | 희망 날짜(다음 평일 4일) · 시간대 | 메모 |
| 긴급방문 | 상황 유형 · 현재 상황(5자 이상) | — (비용 안내 표시) |
| 문의 | 문의 유형 · 내용(5자 이상) | — |

- 오류는 **제출을 한 번 시도한 뒤에만** 표시하고, 첫 오류 위치로 스크롤한다 (`role="alert"`).
- 접수 완료 화면: 접수번호(`R-…`) · 회신 예정 시간 · `요청 현황 보기`.
- 접수된 요청은 AX `/requests`의 `처리 필요`로 바로 들어가며, AX에서 처리하면 고객 `/care/requests`의 3단계 진행(접수 · 처리중 · 완료)에 반영된다.

## 공통 부품 (`src/components/ui`)
- `Field` · `TextArea`(글자 수 표시) · `ChoiceGroup`(radiogroup) — 폼의 라벨 · 필수 표시 · 오류 위치를 화면마다 같게.
- `Modal` — ESC · 배경 스크롤 잠금 · `aria-modal` · 모바일 하단 시트 · 40px 닫기 버튼.
- `ConfirmDialog` — 브라우저 `confirm()` 대체 (데모 초기화). 미리보기 iframe에서도 동작.
- `useHideHistoryNav` (`src/lib/historyNav.ts`) — Modal · 드로어 · 더보기 시트 · 투어 · 기기 미리보기가 열린 동안 미래AI랩 공용 뒤로·앞으로 버튼을 숨긴다(시트 안 버튼 가림 방지).
- `StatusText` — 400px 미만 목록 행에서 상태 Pill 대신 보조줄 앞에 상태를 표시해, 띄어쓰기 없는 현장명이 단어 중간에서 끊기지 않게 한다.

## 셸 · 투어
- 헤더 중복 제거(데이터 갱신 시각은 대시보드 제목 옆으로).
- 시연 모드가 중간에 역할을 바꿔도, 종료하면 **시작 당시 역할로 복원**.
- 투어 대상은 화면에 실제로 보이는 요소만 찾는다(반응형으로 숨겨진 같은 `data-tour` 무시).

## CSS
- `* { min-width: 0 }`를 `@layer base`로 이동 — 레이어 밖에 있으면 모든 `min-w-[…]` 유틸리티를 무력화한다.

## 검증 (scratchpad, Playwright · 순차 실행)
- `flows.mjs` 38항목 — 요청 폼 검증 → 접수 → AX 처리 → 고객 화면 반영, 일정 시트 · AI 배정, 현장 완료 → 리포트, 시연 역할 복원, AI 탭 딥링크, 검색, 확인 대화상자, 24개 route 빈 화면, 콘솔 오류 0
- `qa.mjs` 37 · `regress.mjs` 26 · `audit.mjs`(360~1440 넘침 · 겹침 · 12px 미만 0) · `stress.mjs` · `midword.mjs`(단어 중간 끊김 0)

# P. 2차 고도화 — 처음 쓰는 사람의 동선 · 일관성 · 상태 처리 (2026-10-07)

1차에서 화면별 우선순위를 정리했다면, 2차는 **처음 들어온 사용자가 업무를 끝낼 때까지** 따라가며 막히는 지점을 고쳤다. 새 기능은 없다.

## 동선 단축 (딥링크)
| 출발 | 도착 |
|---|---|
| 대시보드 "오늘 먼저 확인할 것" · 오늘의 AX "일정 보기" | `/schedule?id=SC-14` — 해당 일정이 바로 선택(모바일은 시트로 열림) |
| 직원/팀 카드의 오늘 일정 줄 | `/schedule?id=…` |
| 고객 플랫폼 "서비스 상담" · 서비스 사진 | `/care/requests?new=문의&topic=기타&memo=…` — 문의 폼이 내용이 채워진 채로 열림, 바로 제출 가능 |
| 수익성 권한 안내(관리자) | "대표로 전환해서 보기" 버튼으로 즉시 전환 |
| 현장 상세(작업 전) | "현장직원 앱 보기" |
| 현장 앱(오늘 작업 모두 완료) | "내 작업 리포트 보기" |

딥링크 파라미터는 연 직후 주소에서 지운다(새로고침 시 시트가 다시 열리지 않게).

## 숫자 일관성
- 대시보드 브리핑 칩의 숫자 = AI 센터 해당 탭의 건수 (같은 `SEED_INSIGHTS`에서 계산). 이전에는 칩 "위험 3" → 탭 "위험 2"처럼 눌렀을 때 숫자가 달랐다.
- AI 센터 상단 숫자 타일 4개 제거 — 탭 건수와 중복.

## 화면 구조
- AX 화면은 하나의 레이아웃 route(`<Route element={<AxLayout><Outlet/></AxLayout>}>`)를 공유 — 화면 이동 때 사이드바·헤더를 다시 만들지 않는다(애니메이션 재생·펼친 그룹 초기화 없음).
- 작업현황: 표 → 일정/배정과 같은 목록 행(시간 · 현장 · 서비스·팀 · 상태). PC에서 상태 열이 잘리던 문제와 모바일에서 상태가 화면 밖에 있던 문제를 함께 해결. 상태 탭에 건수.
- 수익성: 조치가 필요한 현장 카드를 표 위로. 모바일은 표 대신 목록(현장 · 월 계약 · 실제/예정 작업 | 기여마진 · 분류).
- 탭이 6개인 화면(AI 센터 · 작업현황)은 모바일에서 3×2 격자 — 가로 스크롤에 숨는 탭이 없게.
- 고객 플랫폼 헤더: 1024px 미만은 2층(데모 도구 / 브랜드), 1024px부터 메뉴 탭 노출, 1280px부터 한 줄. 태블릿에서 탭이 글자 단위로 세로로 깨지던 문제 해결.
- 현장 상세: 진행 4단계(도착 · 작업 시작 · 작업 완료 · 체크아웃)를 막대로, 작업 전에는 빈 체크리스트·빈 사진칸 대신 한 줄 안내.

## 상태 · 문구
- 실행 단계 버튼: `확인으로 / 실행중으로` → **검토 시작 / 실행 시작 / 완료 처리** (주 버튼으로 강조). 상태 표기 `확인` → `검토 중`(데이터 값은 유지).
- 오늘의 AX: 완료 진행률 막대, 완료 카드는 흐리게, 모두 끝나면 "오늘 할 일을 모두 마쳤습니다". "상세보기" → 갈 곳을 말하는 버튼(일정 보기 · 고객 보기 · 매출 기회 보기 · 현장 보기 · 팀 일정 보기).
- 잘못된 주소: 대시보드로 조용히 보내지 않고 "페이지를 찾을 수 없습니다" + 이동 버튼(`src/pages/NotFound.tsx`).
- 페이지 머리의 `AI READY` 배지는 AI 센터에만 — 나머지 화면은 데모 배지 하나.

## 공통 부품
- `StatTile` — 화면 상단 요약 숫자(팀 · 품질 · 추가서비스 · 수익성) 크기·정렬 통일, 긴 금액은 칸 안에서 줄바꿈.
- `Card` — `onClick`이 있으면 `role="button"` · Tab 포커스 · Enter/Space 동작 · 포커스 링.
- `Modal` — 열릴 때 대화상자로 포커스 이동, Tab 순환을 대화상자 안으로 제한, 닫히면 연 버튼으로 포커스 복귀.

## 검증
- `flows2.mjs` 36항목(딥링크 · 진행률 · 목록형 표 · 상담 바로가기 · 키보드 · 레이아웃 유지 · 태블릿 헤더 768/1024/1280) + 기존 flows 38 · qa 37 · regress 26.
- `audit.mjs` 뷰포트에 **768 · 1024** 추가(총 8종), `midword.mjs`도 768 · 1024 추가.

