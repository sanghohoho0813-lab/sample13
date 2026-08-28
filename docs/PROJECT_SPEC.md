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
