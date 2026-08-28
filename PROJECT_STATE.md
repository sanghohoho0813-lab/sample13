# PROJECT_STATE.md
## 클린웨이파트너스 Service Intelligence AX — 진행상황

PROJECT FINAL OBJECTIVE: docs/PROJECT_SPEC.md 참조

## 현재 상태
- **1차 Website Reference MVP 완료** (CORE + Demo 활성 CONDITIONAL 전체 구현)

## 완료
- PASS 1 설계 잠금 (docs/PROJECT_SPEC.md)
- Design System (Deep Teal Premium Service · Root 19px · Neutral 분리 고정)
- App Shell — 280px Sidebar · Champagne Wordmark · 실시간 날짜/시계 · Mobile Bottom Nav
- Executive Dashboard (KPI 6 · AI 오늘의 운영 브리핑 · 오늘 먼저 확인할 것 · Service Timeline · 진행현황 Chart · 팀 가동률 · 매출 Snapshot)
- 오늘의 AX (Action 우선순위 Card + Lifecycle)
- 일정/배정 3-Column (Today/Week/Team View) + AI Smart Dispatch (추천 1~3순위·이유·적용)
- 현장관리 + 현장 Detail (체크인 흐름·체크리스트·Before/After·Service Report·품질 이력)
- 작업현황 (상태 Filter Table + Report 목록)
- 직원/팀 (8팀 가동현황·결원 표시)
- 고객/계약 (검색·Type Filter·Health Score) + 고객 Detail (Health Ring·AI Insight·수익성[대표]·Upsell·요청)
- 요청/문의 (Portal Closed Loop 수신·상태 처리)
- 품질/만족도
- 재계약 관리 (Risk/D-7/D-30/D-60/안정 Stage + Retention Action)
- Upsell Center (발견→제안→협의→성사 + Evidence 기록)
- 수익성 분석 (대표 전용 · 기여마진 Table · AI Note)
- AI Operations Center (Today/Dispatch/Risk/Retention/Growth/Profit Tab · 발견/데이터/이유/추천/영향)
- AX Evidence Log (Timeline · Result)
- 기획의도 16 Section Story (Architecture Diagram · Before/After · Growth Loop)
- 설정 (Permission Matrix RLS Preview · Data Intake Ready · 데모 초기화 · 튜토리얼)
- Presentation Mode (12 Step Navigation Layer)
- Employee Mobile `/field` (체크인→작업시작→체크리스트→사진→특이사항→완료→Report 자동생성)
- Customer Portal `/care` (Landing Hero · 고객 Home · AI 시설관리 제안 · 선택형 요청 Modal 3종 · Report · 요청 추적)
- Role Switcher 4역할 + Surface Switcher (AX↔고객) + Device Preview (iframe 실제 Responsive)
- Tutorial 4 Step · Demo Reset · Data Freshness · AI READY Modal · Loading/Empty/Error/Toast
- QA: 24 라우트 렌더 OK · Scenario A~F 동작 확인 · 360/390/430 가로 Overflow 0px · 빌드 Green

## 미완료 (PLUS — 범위 외, 향후)
- 고급 Map UX / Route Visualization
- 자동견적 Simulation · 직원 Performance · Satisfaction Survey
- 고급 Motion 고도화

## 현재 Demo 기능 (실연결 아님)
- 6 AI Engine = 규칙 기반 Demo Logic (AI READY)
- 이동시간·GPS·지도·문자·Push = Integration Ready 표시만
- 데이터 = src/lib/demo Seed + localStorage (Demo Reset 가능)

## 실제 연결된 기능
- 없음 (전체 DEMO MODE)

## 알려진 문제
- 번들 단일 chunk ~794KB (Reference 데모 용도로 허용, 필요 시 code-splitting)

## 다음 우선작업 (실서비스 전환 시)
1. Supabase Auth/RLS + Data Adapter 교체
2. LLM API 1개 고가치 기능 연결 (Executive Briefing 권장)
3. 지도/이동시간 API · 알림 채널

## USER ACTION QUEUE
(이번 Reference MVP에서는 불필요 — 실서비스 전환 시)
- [ASSET] 실제 회사 Logo / 현장 사진
- [DATA] 실제 고객·서비스·직원·일정 데이터 (CSV 1~3종이면 시작 가능)
- [ENV] NEXT/VITE Supabase URL·ANON KEY
- [ENV] LLM API Key (OpenAI 또는 Anthropic)
- [ENV] 지도 API Key
- [EXT] 문자/알림 API 계약

## 최근 주요 변경
- 2026-08-28: PASS 1 설계 잠금 → PASS 2 전체 CORE 구현 → QA(스모크·모바일 Overflow) → 1차 MVP 완료
