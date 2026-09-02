# CLEANWAY PARTNERS · Service Intelligence AX

미래AI랩 **서비스업 대표 AX Reference MVP** — 가상의 기업·상가 정기청소/시설관리 회사
**클린웨이파트너스㈜**를 위한 AI Service Operations System 데모입니다.

> 모든 데이터는 가상의 **DEMO DATA**입니다. 실제 회사·고객·직원 정보가 아닙니다.

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

## 주요 화면

| 영역 | 경로 | 내용 |
|---|---|---|
| Business AX | `/` | Executive Dashboard + AI 오늘의 운영 브리핑 |
| | `/today` | 오늘의 AX (행동 우선순위) |
| | `/schedule` | 일정/배정 + **AI Smart Dispatch** |
| | `/sites` `/work` `/team` | 현장·작업·직원/팀 |
| | `/customers` | 고객/계약 + Customer Health |
| | `/renewals` `/upsell` `/profitability` | 재계약 · Upsell · 수익성(대표 전용) |
| | `/ai` | AI Operations Center (6 Engine) |
| | `/evidence` `/why-ax` | AX Evidence Log · 기획의도 16 Section |
| | `/presentation` | 시연 모드 (Guided Demo 11 Step) |
| Employee Mobile | `/field` | 현장직원 Action UX (체크인→체크리스트→사진→완료) |
| Customer Portal | `/care` | Public Landing |
| | `/care/home` | 고객 Home + Quick Action (Closed Loop) |
| | `/care/reports` `/care/requests` | Service Report · 요청 현황 |

## 현장 사진

- `public/photos/` — 실제 현장 사진 20장 (1448×1086 PNG **원본 그대로**, 재인코딩 없음)
- `src/lib/demo/photos.ts` — 서비스명 → 사진, Before/After 쌍, 한국어 alt 매핑
- 배치: Customer Portal(Hero·서비스 10종·관리 전후·현장 기록) · 고객 리포트 Before/After ·
  현장관리/현장 Detail · Field Mobile 사진 등록 · Why AX Hero 및 Story
- Dashboard·오늘의 AX·작업현황·Upsell·Evidence 등 운영 판단 화면은 데이터 UI를 유지

## Product Shell (v1.1)

- **Theme 6종** — Settings → 화면에서 전환. `html[data-theme]` 토큰 교체 방식이라 본문·표 가독성은 고정
- **Guided Tutorial (5 Step) / 시연 모드 (11 Step)** — 실제 Route를 이동하며 실제 화면을 Spotlight
- **Device Preview** — PC에서 `모바일 보기`, 모바일에서 `PC 보기`. 동일 Route·데이터·설정을 다른 Viewport로 렌더 (재귀 Preview 차단, ESC/닫기/Backdrop 종료)
- **모바일 `더보기`** — Bottom Sheet 추가 메뉴 15항목 (기획의도·설정·고객화면·데모 초기화 등)
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
