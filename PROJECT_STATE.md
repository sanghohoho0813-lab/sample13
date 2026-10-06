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

## 완료 — 현장 사진 반영 (2026-09-02)
- 실제 현장 사진 **20장 원본(1448×1086 PNG, 재인코딩 없음)** 을 `public/photos/`에 반영
- `src/lib/demo/photos.ts` — 서비스명 → 사진, Before/After 쌍 선택, 한국어 alt 매핑 Layer
- Customer Portal: Hero 배경 · 서비스 10종 그리드 · 관리 전·후 · 현장 기록 3장 · Portal 안내
- 고객 리포트: Before/After 실사진 + "작업 전/후" 캡션 (유리/바닥 자동 선택)
- 고객 Home: 다음 방문 배너 + **AI 제안 근거 사진**(반복 지적된 유리 오염)
- Business AX: 현장관리 카드 썸네일 · 현장 Detail 배너 + Before/After 실사진
- Field Mobile: 사진 등록 시 실제 Before/After 렌더
- Why AX: Hero 배경(AX 연결) + Section 08-1 현장 기록 3단계 + Section 10 유리 전·후
- 데이터 UI 화면(Dashboard·오늘의 AX·작업현황·Upsell·Evidence 등)에는 사진 미적용
- 접근성/성능: 전 이미지 한국어 alt · width/height(CLS 방지) · Hero 외 lazy loading

## 완료 — 제작사 브랜드(미래AI랩) 반영 (2026-09-02)
- 원본 로고를 `public/brand/`에 보존 (`mirae-ai-lab-logo.png` 828×250 · `mirae-mark.png` 256×256)
- 투명 픽셀의 흰색 잔여 RGB를 alpha bleed로 제거 — **보이는 픽셀은 원본과 100% 동일**
- `src/components/brand/MiraeLogo.tsx` — `MiraeLogo` / `MiraeMark` / `MiraeCredit(tone)` 단일 참조점
- 다크 배경(사이드바)에서는 로고 재가공 없이 **흰색 칩 위 원본** 방식으로 판독성 확보
- 노출 4곳 + favicon: AX 사이드바·Drawer 하단 / Customer Portal Footer / Field 내 정보 / Why AX 하단
- 설정 Footer는 로고 중복을 피해 `POWERED BY 미래AI랩` 텍스트로 대체
- favicon·apple-touch-icon을 M 심볼로 교체

## 완료 — 향후 확장 로드맵 · 모바일 헤더 (2026-09-03)
- 전체 메뉴(Desktop Sidebar · Mobile Drawer) 하단에 `향후 확장 · ROADMAP` 10항목 추가
- 업 적합 항목만 선별: 다지점 통합관리 / 구독형 관리 / 협력사 네트워크 / 소모품·자재 /
  위생·방역 증빙 / 채용·교육 관리 / 견적·전자계약 / 종합 시설관리 / IoT 스마트 현장 / ESG·친환경
- 단계 배지 NEXT · Preview · Long-term — Route 없이 인라인 설명만 펼침 (DEMO 정직성)
- `src/lib/demo/roadmap.ts` 단일 원본 — Business AX(10개, 운영자 문구)와
  Customer Portal(9개, 고객 문구)이 같은 데이터를 읽음 (`채용·교육 관리`는 내부 전용으로 제외)
- Customer Portal `/care`에 `앞으로 준비 중인 서비스` 카드 그리드 추가 (랜딩 하단)
- Customer Portal 헤더에 `전체 메뉴` Drawer 추가 — 서비스 이동 · 준비 중인 서비스 9종 ·
  상담 CTA · DEMO/ADMIN 이동 · 제작사 크레딧 (하단 섹션은 그대로 유지, 진입점만 추가)
- 고객 포털 헤더 아이콘 압축 — 360px에서 브랜드가 잘리던 문제 해결
- AX 사이드바 로드맵 섹션 접기/펼치기 — 선택은 localStorage 유지 (데모 초기화 영향 없음)
- 모바일 헤더에 `고객 화면 보기` 아이콘 버튼 노출 (기존에는 sm 미만에서 숨겨져 진입 경로 없음)
- `PC 보기`도 모바일에서 아이콘만으로 압축 · 좌측 시계 그룹 클리핑으로 겹침 제거

## 완료 — 미래AI랩 브릿지 CTA (2026-09-18)
- `src/lib/mirae.ts` — 링크 3종(consult/samples/home) + CTA 문구 단일 수정 지점
- `src/components/brand/SampleBridgeCTA.tsx` — `SampleBridgeCTA`(섹션) / `SampleBridgeMini`(축약형)
- 배치: AX 전 화면 하단 · 고객 포털 전 화면 하단 · AX 사이드바 좌하단 ·
  고객 포털 전체 메뉴 Drawer · Field Mobile 내 정보 (총 5곳)
- 메인 CTA 문구 전 화면 통일 — `우리 회사도 만들어보기`
- 외부 링크 전부 `target="_blank"` + `rel="noopener noreferrer"`
- 아주 약한 light sweep(5.5s 중 64% 정지) + 배지 glow(7s) · motion-reduce에서 완전 차단
- 로고는 CTA에 넣지 않음 (사이드바·푸터에 이미 상시 노출)

## 완료 — UI/UX 안정화 (2026-09-30)
- AX 메뉴 1차 노출 15 → 7 (현장 운영 · 고객 관리 · 성장·분석 · AI 센터 · 소개·설정 …), 삭제 기능 0 · route 변경 0
- 아이콘 색 13색 → 카테고리 5계열
- 햄버거 왼쪽 통일(AX · 고객 플랫폼), 좌측 Drawer 86vw/max 370px, 그룹 접이식, 자체 스크롤
- 모바일 헤더 2층(데모 툴바 + 메인 헤더)
- 명칭 통일: 고객 플랫폼 보기 / AX 운영화면 보기 — 툴바 + Drawer 하단 full-width CTA
- 영문 UI 한글화 + 상태 표기 통일(예정 / 미리보기 / 장기), AI 엔진명 한글화
- 12px 미만 글자 0 · 넘침 0 · 세로깨짐 0 · 단어 중간 끊김 0 · 헤더 겹침 0 (360~1440px)
- 긴 회사명/금액 stress test 통과

## 완료 — 한 단계 고도화 (2026-10-06)
- 대시보드 정보 재배치(중복 차트·카운터 제거, 브리핑 칩 → AI 센터 해당 탭)
- 일정/배정: 모바일 하단 시트 상세 · 미배정 배너 · 컴팩트 목록 · 넓은 화면 2단
- 고객 요청 폼(유형별 필수 입력 · 검증 · 접수번호 · 회신 안내), 고객 홈 주요 동작 상단 배치, 계약 정보 모달
- AX 요청함 상태 탭(처리 필요 · 처리중 · 완료 · 전체), 고객 요청 현황 3단계 진행
- 현장 앱 4단계 진행 표시 + 남은 항목 안내, 고객 검색(공백·대소문자 무시 · 초기화)
- 데스크톱 사이드바 접이식(스크롤 없음), 시연 종료 시 역할 복원, 확인 대화상자, Modal 접근성
- 남은 영문 문구 정리, CSS `min-width` 레이어 버그 수정, 360px 단어 중간 끊김 0
- 미래AI랩 공용 뒤로·앞으로 버튼과 공존 — 시트·드로어·대화상자·투어 중에는 숨김

## 완료 — 2차 고도화 (2026-10-07)
- 처음 쓰는 사용자 동선 점검: 대시보드·오늘의 AX·팀 → 해당 일정 바로 열기, 고객 "서비스 상담" → 문의 폼 바로(내용 미리 채움), 수익성 권한 안내 → 대표 전환 버튼
- 숫자 일관성: 브리핑 칩 = AI 센터 탭 건수, AI 센터 중복 숫자 타일 제거
- 작업현황 목록형(PC 상태 열 잘림·모바일 상태 화면 밖 해결) · 수익성 모바일 목록 + 조치 카드 우선
- 고객 플랫폼 헤더 태블릿(768/1024) 깨짐 수정
- 실행 단계 버튼 동사화(검토 시작·실행 시작·완료 처리), 오늘의 AX 진행률·완료 표시·맥락형 이동 버튼
- 현장 상세 작업 전 빈 상태, 현장 앱 전체 완료 상태, 404 안내 화면
- 공통: StatTile, 카드 키보드 접근, Modal 포커스 관리, AX 레이아웃 route 공유
- 검증 뷰포트에 태블릿 768·1024 추가

## QA 결과 (Whole-App Acceptance Run)
- 자동 검증 **51 PASS / 0 FAIL** (Playwright)
- Gate A~N 전부 충족 · P0 Bug 0건
- 360 / 390 / 430px 가로 스크롤 0 (More Sheet 포함)
- Desktop·Mobile pageerror 0 · 빌드 Green
- 사진 반영 후 재검증: 51 PASS / 0 FAIL · 이미지 404 0건 · 깨진 이미지 0건
- 로고 반영 후 재검증: 51 PASS / 0 FAIL · tsc·build Green
- 로드맵·헤더 반영 후 재검증: 57 PASS / 0 FAIL · 360/390px 가로 스크롤 0 · 라벨 잘림 0
- 고도화 후 재검증(2026-10-06): flows 38 · qa 37 · regress 26 PASS / 0 FAIL · 360~1440px 넘침·겹침·12px 미만·단어 중간 끊김 0 · 콘솔 오류 0 · tsc·build Green
- 2차 고도화 후 재검증(2026-10-07): flows 38 · flows2 36 · qa 37 · regress 26 PASS / 0 FAIL · 360/390/412/430/768/1024/1280/1440 넘침·겹침·12px 미만·단어 중간 끊김 0 · stress 0 · 콘솔 오류 0

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
- [ASSET] 실제 회사(고객사) Logo — 제작사 로고·현장 사진은 반영 완료
- [DATA] 실제 고객·서비스·직원·일정 데이터 (CSV 1~3종이면 시작 가능)
- [ENV] Supabase URL·ANON KEY
- [ENV] LLM API Key (OpenAI 또는 Anthropic)
- [ENV] 지도 API Key
- [EXT] 문자/알림 API 계약

## 최근 주요 변경
- 2026-08-28: PASS 1 설계 잠금 → PASS 2 CORE 구현 → 1차 MVP 완료
- 2026-08-29: v1.1 Product Shell Upgrade (Tutorial·Preview·Theme·Navigation·Why AX·Parity) 완료
- 2026-09-02: 실제 현장 사진 20장 반영 (Customer Portal·리포트·현장·Field·Why AX)
- 2026-09-02: 제작사 브랜드(미래AI랩) 로고 반영 — 사이드바·Portal·Field·Why AX·favicon
- 2026-09-03: 향후 확장 로드맵 10항목 + 모바일 헤더 고객 화면 진입 버튼
- 2026-09-03: 로드맵 고객 포털 확장 + AX 사이드바 접기/펼치기
- 2026-09-03: 고객 포털 상단 전체 메뉴 Drawer
- 2026-09-18: 미래AI랩 브릿지 CTA 5곳 적용 (상담·다른 샘플·홈페이지)
- 2026-09-30: UI/UX 안정화 — 메뉴 IA 재분류 · 한글 UI · 햄버거 왼쪽 · 반응형 overflow 0
- 2026-10-06: 한 단계 고도화 — 화면 우선순위 재배치 · 요청 폼 검증 · 모바일 상세 시트 · 요청함 상태 탭 · E2E 플로우 검증
- 2026-10-07: 2차 고도화 — 동선 단축(딥링크) · 숫자 일관성 · 목록형 표 · 태블릿 헤더 · 상태/빈 화면 · 접근성
