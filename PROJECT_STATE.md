# PROJECT_STATE.md
## 클린웨이파트너스 Service Intelligence AX — 진행상황

PROJECT FINAL OBJECTIVE: docs/PROJECT_SPEC.md 참조

## 현재 상태
- **1차 MVP + v1.1 Product Shell Upgrade 완료** (Business Core 보존, 주변 UX 완성)

## 완료 — 1차 MVP (Business Core)
- Executive Dashboard · 오늘의 AX · 일정/배정 + AI Smart Dispatch
- 현장관리/현장 Detail · 작업현황 · 직원/팀
- 고객/계약 + Customer Health · 요청/문의 · 품질/만족도
- 재계약 관리 · Upsell Center · 수익성 분석(대표 전용)
- AI Operations Center(6 Engine) · AX Evidence · Action Lifecycle
- Employee Mobile(/field) 체크인→체크리스트→사진→완료→Report 자동생성
- Customer Care Portal(/care) + Customer → AX Closed Loop 2종

## 완료 — v1.1 Product Shell Upgrade
- **Date/Time Parity**: Mobile에서도 날짜 표시(압축 `08.29 토`) + 초 단위 시각. Field/Care 헤더도 동일
- **Device Preview 재구현**: 동일 Route/Data/State/Role/Theme를 iframe으로 렌더
  - PC→Mobile(390×844 Fit), Mobile→PC(1440×900 세로맞춤 + 가로 Pan, `폭 맞춤` 토글)
  - 현재 Device와 같은 Preview 버튼 미노출 + Preview 내부 Device Switch 숨김 (재귀 차단)
  - `document.body` portal — Header `backdrop-filter`가 fixed containing block이 되던 문제 해결
  - 종료: X / Backdrop / ESC → overlay·scroll lock·Route 원복
- **Guided Tour 엔진**: 실제 Route 이동 + 실제 Component Spotlight + 설명 Card
  - Tutorial 5 Step (Dashboard→Schedule→Customer→Upsell→Evidence)
  - Presentation 11 Step (Role 전환 포함, Field·Customer Portal까지 순회)
  - 종료 시 overlay/scroll/pointer 완전 정리
- **Navigation Semantics**: `더보기` = Bottom Sheet 추가 메뉴 15항목 (Route 직행 제거)
  - Hamburger = 전체 Navigation Drawer (역할 분리)
- **Theme 6종 실제 구현**: signature / navy / tealchampagne / graphite / indigo / forest
  - Sidebar·Header·Button·KPI·AI Card·Bottom Nav·Drawer 실제 반영, Neutral 가독성 분리 고정
  - Font Scale 3단계 · 모션 줄이기 · PC/Mobile 상태 공유
- **Sidebar/Drawer Icon Color**: 13색 Module Mapping (Desktop·Mobile 동일)
- **Why AX 전면 재설계**: Hero + 16 Section, `CLEANWAY라면` 회사 맞춤 해석 5개소,
  Before/After · Revenue · 6 AI Engine · Data 자산화 · 5개 성장경로 · Escape Path
- **Settings 재구성**: 화면 / 사용자·권한 / Demo / Data / AI / 연결 6그룹
- **Surface Round-trip**: Desktop·Mobile 양방향 AX ↔ Customer ↔ Field

## QA 결과 (Whole-App Acceptance Run)
- 자동 검증 **51 PASS / 0 FAIL** (Playwright)
- Gate A~N 전부 충족 · P0 Bug 0건
- 360 / 390 / 430px 가로 스크롤 0 (More Sheet 포함)
- Desktop·Mobile pageerror 0 · 빌드 Green

## 미완료 (PLUS — 범위 외)
- 고급 Map UX / Route Visualization
- 자동견적 Simulation · 직원 Performance · Satisfaction Survey

## 현재 Demo 기능 (실연결 아님)
- 6 AI Engine = 규칙 기반 Demo Logic (AI READY)
- GPS·지도·문자·Push·결제 = Integration Ready 표시만
- 데이터 = src/lib/demo Seed + localStorage (Demo Reset 가능)

## 알려진 문제
- 번들 단일 chunk ~830KB (Reference 데모 용도로 허용, 필요 시 code-splitting)

## 다음 우선작업 (실서비스 전환 시)
1. Supabase Auth/RLS + Data Adapter 교체
2. LLM API 1개 고가치 기능 연결 (Executive Briefing 권장)
3. 지도/이동시간 API · 알림 채널

## USER ACTION QUEUE
(이번 Reference MVP에서는 불필요 — 실서비스 전환 시)
- [ASSET] 실제 회사 Logo / 현장 사진
- [DATA] 실제 고객·서비스·직원·일정 데이터 (CSV 1~3종이면 시작 가능)
- [ENV] Supabase URL·ANON KEY
- [ENV] LLM API Key (OpenAI 또는 Anthropic)
- [ENV] 지도 API Key
- [EXT] 문자/알림 API 계약

## 최근 주요 변경
- 2026-08-28: PASS 1 설계 잠금 → PASS 2 CORE 구현 → 1차 MVP 완료
- 2026-08-29: v1.1 Product Shell Upgrade (Tutorial·Preview·Theme·Navigation·Why AX·Parity) 완료
