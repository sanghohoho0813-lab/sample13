// ─────────────────────────────────────────────────────────
// AI Intelligence 시드 (DEMO · 규칙 기반 Demo Logic)
// 실제 LLM API 미연결 — AI READY 상태. 향후 aiService Adapter로 교체.
// ─────────────────────────────────────────────────────────
import type {
  AIInsight, ActionItem, UpsellOpportunity, CustomerHealth,
  ProfitabilityRow, QualityIssue, EvidenceLog, CustomerRequest, ServiceReport,
} from '../../types'

export const SEED_ACTIONS: ActionItem[] = [
  { id: 'A-01', engine: 'risk', title: '성수 B오피스 재배정 검토', target: '성수 B오피스', detail: '이전 작업 32분 지연 — 15:30 방문 지연 위험. 대체팀 재배정 또는 고객 사전 안내.', status: '추천됨', owner: '정승원', createdAt: '오늘 08:40' },
  { id: 'A-02', engine: 'retention', title: '라온메디컬센터 담당자 사전 미팅', target: '라온메디컬센터', detail: '계약 종료 D-32. 최근 60일 일정변경 3회·품질문의 2회·만족도 하락 — 이번 주 내 사전 미팅 권장.', status: '확인', owner: '김도윤', createdAt: '오늘 08:41' },
  { id: 'A-03', engine: 'upsell', title: '에이원교육센터 유리 집중관리 제안', target: '에이원교육센터', detail: '최근 작업기록 유리 오염 특이사항 4회 — 외부 유리 집중관리 제안 (예상 85만원/회).', status: '추천됨', owner: '오세영', createdAt: '오늘 08:42' },
  { id: 'A-04', engine: 'risk', title: '강남 C클리닉 미완료 보고 확인', target: '강남 C클리닉', detail: '08:30 작업 완료 보고 미제출 — 체크리스트·사진 확인 필요.', status: '실행중', owner: '이준호', createdAt: '오늘 11:20' },
  { id: 'A-05', engine: 'retention', title: '서초 E의원 품질문의 대응', target: '서초 E의원', detail: '계약 종료 D-21. 최근 문의 3회 — 품질 개선 조치 및 재계약 협의 착수.', status: '실행중', owner: '이준호', createdAt: '어제 16:05' },
  { id: 'A-06', engine: 'profit', title: '누리컨벤션 서비스 범위 재협의', target: '누리컨벤션', detail: '실제 작업시간 평균 21% 초과·월 2회 긴급 추가방문 — 재계약 시 범위/단가 재협의 필요.', status: '보류', owner: '문성재', createdAt: '2일 전' },
  { id: 'A-07', engine: 'upsell', title: '그랜드타워 에어컨 세척 시즌 제안', target: '그랜드타워', detail: '하절기 종료 전 공용부 에어컨 세척 패키지 제안 (예상 140만원).', status: '완료', owner: '정승원', createdAt: '5일 전', result: '9월 정기작업에 패키지 계약 추가 (DEMO)' },
  { id: 'A-08', engine: 'dispatch', title: '강남 C클리닉 15:00 유리창 배정', target: '강남 C클리닉', detail: '미배정 일정 — AI 추천 1순위 Clean Team E (이동 18분 · 적합도 96%).', status: '추천됨', owner: '관리자', createdAt: '오늘 08:45' },
]

export const SEED_INSIGHTS: AIInsight[] = [
  {
    id: 'I-01', engine: 'risk', severity: 'risk', title: '방문지연 위험', target: '성수 B오피스', customerId: 'C02',
    found: '15:30 방문 예정 현장의 담당팀(Team C) 이전 작업이 32분 지연되고 있습니다. 예상 도착 15:47.',
    dataViewed: ['오늘 일정', '팀별 진행상황', '작업 예상시간', '현장 간 이동시간'],
    why: '고객 사무실 마감시간(18:00) 전 작업 완료가 어려워질 수 있고, 반복 지연은 만족도 하락으로 이어집니다.',
    recommendation: '다른 팀 재배정 검토 또는 고객에게 방문시간 사전 안내',
    impact: '지연 방지 시 당일 작업 완료율 유지 · 클레임 예방',
    actionId: 'A-01',
  },
  {
    id: 'I-02', engine: 'retention', severity: 'risk', title: '계약갱신 위험', target: '라온메디컬센터', customerId: 'C01',
    found: '계약 종료 D-32. 최근 60일간 일정변경 3회, 품질문의 2회, 만족도 4.6 → 4.1 하락.',
    dataViewed: ['계약기간·갱신 예정일', '작업이력', '민원·문의', '만족도 추이', '일정변경 기록'],
    why: '병의원 고객은 이탈 시 연 3,800만원 규모 계약 손실이며, 갱신 협의 없이 D-30을 넘기면 경쟁 견적 노출 가능성이 높아집니다.',
    recommendation: '이번 주 내 담당자 사전 미팅 권장',
    impact: '연 계약 3,840만원 유지 (DEMO)',
    actionId: 'A-02',
  },
  {
    id: 'I-03', engine: 'upsell', severity: 'opportunity', title: '추가매출 기회', target: '에이원교육센터', customerId: 'C03',
    found: '현재 주 3회 정기청소 계약. 최근 작업기록에서 유리 오염 관련 특이사항 4회 반복.',
    dataViewed: ['현재 계약 서비스', '현장 특이사항 기록', '작업 사진 메모', '고객 요청 이력'],
    why: '정기청소 범위 밖 오염이 반복되면 고객 불만이 누적되고, 선제 제안 시 추가 매출과 만족도를 동시에 얻을 수 있습니다.',
    recommendation: '외부 유리 집중관리 제안 (예상 매출: DEMO 85만원)',
    impact: '추가 매출 85만원/회 + 특이사항 재발 방지',
    actionId: 'A-03',
  },
  {
    id: 'I-04', engine: 'profit', severity: 'info', title: '수익성 관찰 필요', target: '누리컨벤션', customerId: 'C11',
    found: '월 계약금액 420만원, 표면 마진 34% — 그러나 실제 운영 기여마진은 18%.',
    dataViewed: ['계약금액', '투입인원·실제 작업시간', '이동시간·교통비', '소모품', '긴급 추가방문', '클레임 대응시간'],
    why: '예정시간보다 실제 작업시간이 평균 21% 길고 월 2회 이상 긴급 추가방문이 발생하고 있습니다.',
    recommendation: '서비스 범위 재협의 · 투입인원 조정 · 재계약 가격 검토',
    impact: '기여마진 18% → 26% 개선 여지 (DEMO)',
    actionId: 'A-06',
  },
  {
    id: 'I-05', engine: 'dispatch', severity: 'info', title: 'AI 배정 추천', target: '강남 C클리닉', customerId: 'C04',
    found: '15:00 유리창 집중청소 일정이 미배정 상태입니다. 추천 1순위: Clean Team E (강병철·서준일).',
    dataViewed: ['현장 위치·방문시간', '서비스 종류·예상 작업시간', '직원 현재 일정·근무가능시간', '직원별 숙련서비스', '예상 이동시간', '고객 중요도'],
    why: '유리창 전문팀이 인근 현장에서 18분 거리에 있으며 일정 충돌이 없습니다.',
    recommendation: 'Clean Team E 배정 적용',
    impact: '이동 최소화 · 이후 일정 영향 없음',
    actionId: 'A-08',
  },
  {
    id: 'I-06', engine: 'retention', severity: 'risk', title: '재계약 협의 착수', target: '서초 E의원', customerId: 'C09',
    found: '계약 종료 D-21. 최근 문의 3회 · 만족도 3.9로 하락 구간.',
    dataViewed: ['계약기간', '문의 이력', '만족도', '품질 기록'],
    why: 'D-21은 재계약 협의 골든타임입니다. 품질 이슈 미해결 상태로 협상 시 단가 인하 압박 가능성이 있습니다.',
    recommendation: '품질 개선 조치 완료 후 재계약 미팅 진행',
    impact: '연 계약 3,360만원 유지 (DEMO)',
    actionId: 'A-05',
  },
  {
    id: 'I-07', engine: 'upsell', severity: 'opportunity', title: '소독 정기화 제안', target: '해온아동병원', customerId: 'C12',
    found: '월 2회 스팟 소독 요청이 3개월 연속 발생 — 정기 소독 패키지 전환 여지.',
    dataViewed: ['추가 요청 이력', '서비스 이용 패턴', '계약 구성'],
    why: '스팟 요청의 정기 전환은 매출 안정화와 일정 운영 효율을 동시에 높입니다.',
    recommendation: '월 정기 소독 패키지 제안 (예상 +60만원/월)',
    impact: '연 720만원 매출 안정화 (DEMO)',
  },
  {
    id: 'I-08', engine: 'risk', severity: 'risk', title: '직원 결원 영향', target: 'Clean Team G',
    found: '신우철(Team G) 결원 — 오늘 소독 일정 2건이 배정호 단독 작업으로 진행됩니다.',
    dataViewed: ['직원 근태', '팀별 오늘 일정', '작업 예상시간'],
    why: '단독 작업 시 16:30 해온아동병원 작업시간이 30분 이상 길어질 수 있습니다.',
    recommendation: 'Team H 오후 일정 여유 활용한 지원 배치 검토',
    impact: '작업 지연 예방',
  },
]

export const SEED_UPSELL: UpsellOpportunity[] = [
  { id: 'U-01', customerId: 'C03', currentService: '주 3회 정기청소', signal: '유리 오염 특이사항 4회', recommendedService: '유리창 집중청소', expectedRevenue: 85, reason: '최근 3개월 작업기록에서 외부 유리 오염 반복 확인', status: '발견됨' },
  { id: 'U-02', customerId: 'C12', currentService: '주 4회 소독·정기관리', signal: '스팟 소독 요청 3개월 연속', recommendedService: '정기 소독 패키지', expectedRevenue: 60, reason: '월 2회 스팟 요청의 정기 전환 여지', status: '제안됨' },
  { id: 'U-03', customerId: 'C05', currentService: '주 5회 공용부 관리', signal: '하절기 종료 시즌', recommendedService: '에어컨 세척', expectedRevenue: 140, reason: '공용부 에어컨 세척 시즌 패키지', status: '성사' },
  { id: 'U-04', customerId: 'C07', currentService: '주 3회 정기청소', signal: '바닥 마모 기록 2회', recommendedService: '바닥 집중관리', expectedRevenue: 95, reason: '로비 바닥 왁스 마모 — 분기 1회 집중관리 제안', status: '발견됨' },
  { id: 'U-05', customerId: 'C06', currentService: '주 2회 공용부 관리', signal: '입주 변경 예정 문의', recommendedService: '입주·퇴거 특수청소', expectedRevenue: 120, reason: '3층 임차인 교체 예정 — 특수청소 수요', status: '협의중' },
]

export const SEED_HEALTH: CustomerHealth[] = [
  { customerId: 'C01', score: 68, positives: ['정기방문 정상 진행', '결제 지연 없음'], watch: ['최근 품질문의 증가 (2회)', '계약 종료 D-32', '만족도 4.6 → 4.1 하락'], aiStatus: 'Retention Watch' },
  { customerId: 'C02', score: 88, positives: ['정기방문 정상', '요청 응답시간 양호'], watch: ['금일 방문지연 위험 1건'], aiStatus: '안정' },
  { customerId: 'C03', score: 82, positives: ['정기방문 정상', '요청 응답시간 양호', '최근 추가서비스 관심'], watch: ['유리 오염 특이사항 반복'], aiStatus: '안정' },
  { customerId: 'C04', score: 84, positives: ['만족도 안정', '장기계약 이력'], watch: ['금일 작업보고 미제출 1건'], aiStatus: '안정' },
  { customerId: 'C05', score: 93, positives: ['만족도 4.7', '추가서비스 성사', '장기계약'], watch: ['계약 종료 D-60 접근'], aiStatus: '안정' },
  { customerId: 'C06', score: 86, positives: ['정기방문 정상'], watch: ['임차인 교체 예정'], aiStatus: '안정' },
  { customerId: 'C07', score: 95, positives: ['만족도 4.8', '문의 없음', '결제 정상'], watch: [], aiStatus: '안정' },
  { customerId: 'C08', score: 89, positives: ['정기방문 정상'], watch: [], aiStatus: '안정' },
  { customerId: 'C09', score: 54, positives: ['장기계약 이력'], watch: ['만족도 3.9 하락', '최근 문의 3회', '계약 종료 D-21'], aiStatus: 'Risk' },
  { customerId: 'C10', score: 90, positives: ['만족도 4.6', '정기방문 정상'], watch: [], aiStatus: '안정' },
  { customerId: 'C11', score: 76, positives: ['대형 계약 유지'], watch: ['수익성 악화 관찰', '긴급 추가방문 반복'], aiStatus: 'Retention Watch' },
  { customerId: 'C12', score: 96, positives: ['만족도 4.9', '추가 요청 활발'], watch: [], aiStatus: '안정' },
]

export const SEED_PROFITABILITY: ProfitabilityRow[] = [
  { customerId: 'C05', contractAmt: 480, visitsPerMonth: 22, avgCrew: 2, avgWorkMin: 145, plannedMin: 150, avgTravelMin: 24, suppliesCost: 28, urgentVisits: 0, surfaceMarginPct: 38, contributionMarginPct: 31, grade: '고수익', aiNote: '작업시간·이동 안정. 현재 구조 유지 권장.' },
  { customerId: 'C12', contractAmt: 390, visitsPerMonth: 17, avgCrew: 2, avgWorkMin: 105, plannedMin: 110, avgTravelMin: 25, suppliesCost: 32, urgentVisits: 1, surfaceMarginPct: 36, contributionMarginPct: 29, grade: '고수익', aiNote: '소독 정기 패키지 전환 시 수익 안정성 추가 상승.' },
  { customerId: 'C01', contractAmt: 320, visitsPerMonth: 13, avgCrew: 2, avgWorkMin: 118, plannedMin: 110, avgTravelMin: 18, suppliesCost: 22, urgentVisits: 1, surfaceMarginPct: 34, contributionMarginPct: 24, grade: '정상', aiNote: '진료시간 제약으로 작업시간 소폭 초과 — 허용 범위.' },
  { customerId: 'C07', contractAmt: 240, visitsPerMonth: 13, avgCrew: 2, avgWorkMin: 112, plannedMin: 120, avgTravelMin: 22, suppliesCost: 15, urgentVisits: 0, surfaceMarginPct: 35, contributionMarginPct: 28, grade: '고수익', aiNote: '효율 우수 현장.' },
  { customerId: 'C04', contractAmt: 260, visitsPerMonth: 9, avgCrew: 2, avgWorkMin: 122, plannedMin: 120, avgTravelMin: 15, suppliesCost: 18, urgentVisits: 0, surfaceMarginPct: 33, contributionMarginPct: 26, grade: '정상', aiNote: '안정 운영.' },
  { customerId: 'C09', contractAmt: 280, visitsPerMonth: 9, avgCrew: 2, avgWorkMin: 96, plannedMin: 80, avgTravelMin: 23, suppliesCost: 20, urgentVisits: 2, surfaceMarginPct: 32, contributionMarginPct: 19, grade: '관찰', aiNote: '클레임 대응시간 증가 — 품질 이슈 해결이 수익성 개선의 선행조건.' },
  { customerId: 'C11', contractAmt: 420, visitsPerMonth: 18, avgCrew: 3, avgWorkMin: 157, plannedMin: 130, avgTravelMin: 26, suppliesCost: 41, urgentVisits: 2, surfaceMarginPct: 34, contributionMarginPct: 18, grade: '수익성 악화', aiNote: '예정시간 대비 실제 작업 +21% · 긴급방문 월 2회 — 범위 재협의 권장.' },
  { customerId: 'C02', contractAmt: 180, visitsPerMonth: 9, avgCrew: 2, avgWorkMin: 98, plannedMin: 100, avgTravelMin: 17, suppliesCost: 11, urgentVisits: 0, surfaceMarginPct: 34, contributionMarginPct: 27, grade: '정상', aiNote: '안정 운영.' },
  { customerId: 'C03', contractAmt: 210, visitsPerMonth: 13, avgCrew: 2, avgWorkMin: 88, plannedMin: 90, avgTravelMin: 21, suppliesCost: 13, urgentVisits: 0, surfaceMarginPct: 35, contributionMarginPct: 28, grade: '정상', aiNote: '유리 집중관리 추가 시 수익 개선 여지.' },
  { customerId: 'C06', contractAmt: 150, visitsPerMonth: 9, avgCrew: 2, avgWorkMin: 78, plannedMin: 80, avgTravelMin: 28, suppliesCost: 9, urgentVisits: 0, surfaceMarginPct: 33, contributionMarginPct: 22, grade: '정상', aiNote: '이동시간 비중 높음 — 인근 현장 묶음 배정 권장.' },
  { customerId: 'C08', contractAmt: 160, visitsPerMonth: 9, avgCrew: 2, avgWorkMin: 82, plannedMin: 90, avgTravelMin: 22, suppliesCost: 10, urgentVisits: 0, surfaceMarginPct: 34, contributionMarginPct: 26, grade: '정상', aiNote: '안정 운영.' },
  { customerId: 'C10', contractAmt: 190, visitsPerMonth: 13, avgCrew: 2, avgWorkMin: 84, plannedMin: 90, avgTravelMin: 30, suppliesCost: 12, urgentVisits: 1, surfaceMarginPct: 33, contributionMarginPct: 23, grade: '정상', aiNote: '이동 30분 — 강남권 오전 동선과 묶음 배정 권장.' },
]

export const SEED_QUALITY: QualityIssue[] = [
  { id: 'Q-01', customerId: 'C01', date: '6일 전', category: '품질문의', detail: '진료실 바닥 얼룩 잔여 문의', status: '해결' },
  { id: 'Q-02', customerId: 'C01', date: '2일 전', category: '품질문의', detail: '대기실 유리 얼룩 재발 문의', status: '조치중' },
  { id: 'Q-03', customerId: 'C09', date: '5일 전', category: '클레임', detail: '화장실 소모품 미보충', status: '해결' },
  { id: 'Q-04', customerId: 'C09', date: '3일 전', category: '품질문의', detail: '왁스 처리 후 미끄러움 문의', status: '조치중' },
  { id: 'Q-05', customerId: 'C03', date: '어제', category: '특이사항', detail: '외부 유리 오염 반복 확인 (4회차)', status: '접수' },
  { id: 'Q-06', customerId: 'C11', date: '4일 전', category: '긴급방문', detail: '행사 후 긴급 청소 요청 (월 2회차)', status: '해결' },
]

export const SEED_REQUESTS: CustomerRequest[] = [
  { id: 'R-01', customerId: 'C01', type: '문의', detail: '다음 주 화요일 방문시간 앞당길 수 있는지 문의', createdAt: '오늘 09:12', status: '처리중' },
  { id: 'R-02', customerId: 'C06', type: '추가서비스', detail: '3층 공실 입주 전 특수청소 견적 요청', createdAt: '어제 15:40', status: '접수' },
  { id: 'R-03', customerId: 'C12', type: '긴급방문', detail: '놀이방 소독 추가 요청 (감염 예방 차원)', createdAt: '어제 11:02', status: '완료' },
]

export const SEED_EVIDENCE: EvidenceLog[] = [
  { id: 'EV-01', date: 'TODAY', time: '08:40', engine: 'risk', text: 'AI 방문지연 가능성 감지 — 성수 B오피스 15:30 일정', result: undefined },
  { id: 'EV-02', date: 'TODAY', time: '08:41', engine: 'retention', text: 'AI 계약갱신 위험 감지 — 라온메디컬센터 D-32' },
  { id: 'EV-03', date: 'TODAY', time: '08:42', engine: 'upsell', text: 'AI 추가매출 기회 발견 — 에이원교육센터 유리 집중관리' },
  { id: 'EV-04', date: 'D-1', time: '16:05', engine: 'retention', text: '서초 E의원 재계약 협의 착수 — 담당자 조치 실행 중' },
  { id: 'EV-05', date: 'D-5', time: '10:30', engine: 'upsell', text: '그랜드타워 에어컨 세척 시즌 제안 → 담당자 제안 완료', result: '9월 정기작업 패키지 계약 추가 (DEMO)' },
  { id: 'EV-06', date: 'D-7', time: '09:12', engine: 'dispatch', text: 'AI 재배정 추천 적용 — 원효빌딩 방문지연 예방', result: '방문지연 방지 · 당일 완료율 100% 유지' },
]

export const SEED_REPORTS: ServiceReport[] = [
  { id: 'RP-01', scheduleId: 'SC-01', customerId: 'C07', date: '오늘', team: 'Clean Team B', completedAt: '11:05', itemsDone: 6, itemsTotal: 6, note: '로비 바닥 왁스 마모 확인 — 분기 집중관리 검토 권장' },
  { id: 'RP-02', scheduleId: 'SC-02', customerId: 'C08', date: '오늘', team: 'Clean Team B', completedAt: '13:10', itemsDone: 6, itemsTotal: 6, note: '특이사항 없음' },
  { id: 'RP-03', scheduleId: 'SC-05', customerId: 'C12', date: '오늘', team: 'Clean Team G', completedAt: '09:48', itemsDone: 6, itemsTotal: 6, note: '놀이방 소독 완료 · 다음 방문 시 공기청정 필터 점검 권장' },
  { id: 'RP-04', scheduleId: 'PREV-1', customerId: 'C03', date: '어제', team: 'Clean Team B', completedAt: '11:42', itemsDone: 6, itemsTotal: 6, note: '회의실 외부 유리 오염 확인 (4회차)', nextRecommend: '유리 집중관리 검토' },
  { id: 'RP-05', scheduleId: 'PREV-2', customerId: 'C01', date: '2일 전', team: 'Clean Team B', completedAt: '15:52', itemsDone: 6, itemsTotal: 6, note: '대기실 유리 얼룩 재청소 진행' },
]

// AI Executive Daily Briefing (규칙 기반 종합 — DEMO)
export const DAILY_BRIEFING = {
  summary: [
    '오늘 예정된 24개 현장 중 3곳에 확인이 필요합니다.',
    '성수 B오피스는 이전 일정 지연으로 방문시간을 초과할 가능성이 있습니다.',
    '라온메디컬센터는 계약갱신 D-32이며 최근 품질문의가 증가했습니다.',
    '추가매출 관점에서는 에이원교육센터의 유리 집중관리 제안 가능성이 높습니다.',
  ],
  counters: [
    { label: '오늘의 위험', value: 3, tone: 'danger' as const },
    { label: '매출 기회', value: 5, tone: 'success' as const },
    { label: '재계약 조치', value: 2, tone: 'warning' as const },
    { label: '배정 추천', value: 4, tone: 'info' as const },
  ],
}

// Dashboard 차트용 주간 작업 추이 (DEMO)
export const WEEKLY_TREND = [
  { day: '월', 예정: 22, 완료: 21, 지연: 1 },
  { day: '화', 예정: 25, 완료: 24, 지연: 2 },
  { day: '수', 예정: 23, 완료: 23, 지연: 0 },
  { day: '목', 예정: 26, 완료: 24, 지연: 2 },
  { day: '금', 예정: 24, 완료: 11, 지연: 1 },
]

export const MONTH_REVENUE = {
  total: 21870, // 만원 (누적)
  target: 26000,
  yoyPct: 8.2,
  contribMarginPct: 26.4,
}
