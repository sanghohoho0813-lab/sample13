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
