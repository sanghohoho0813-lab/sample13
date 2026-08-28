// ─────────────────────────────────────────────────────────
// CLEANWAY PARTNERS — DEMO DATA (가상의 회사 · Sample Data)
// 실제 회사·고객·직원 정보가 아닙니다.
// 향후 실데이터 연결 시 이 Repository Layer만 교체합니다.
// ─────────────────────────────────────────────────────────
import type { Team, Employee, Customer, Site } from '../../types'

export const COMPANY = {
  name: '클린웨이파트너스㈜',
  nameEn: 'CLEANWAY PARTNERS',
  product: 'Service Intelligence AX',
  annualRevenue: '약 26억원',
  headcount: 28,
  teams: 8,
  regularCustomers: 76,
  monthlyRegularJobs: 520,
  monthlyExtraJobs: '60~90건',
}

export const TEAMS: Team[] = [
  { id: 'T-A', name: 'Clean Team A', memberIds: ['E01', 'E02'], specialty: ['병의원', '사무실'] },
  { id: 'T-B', name: 'Clean Team B', memberIds: ['E03', 'E04'], specialty: ['병의원', '학원'] },
  { id: 'T-C', name: 'Clean Team C', memberIds: ['E05', 'E06'], specialty: ['사무실', '빌딩'] },
  { id: 'T-D', name: 'Clean Team D', memberIds: ['E07', 'E08'], specialty: ['상가', '프랜차이즈'] },
  { id: 'T-E', name: 'Clean Team E', memberIds: ['E09', 'E10'], specialty: ['유리', '외벽'] },
  { id: 'T-F', name: 'Clean Team F', memberIds: ['E11', 'E12'], specialty: ['바닥', '왁스'] },
  { id: 'T-G', name: 'Clean Team G', memberIds: ['E13', 'E14'], specialty: ['소독', '위생'] },
  { id: 'T-H', name: 'Clean Team H', memberIds: ['E15', 'E16'], specialty: ['특수청소', '입퇴거'] },
]

export const EMPLOYEES: Employee[] = [
  { id: 'E01', name: '이준호', position: '팀장', teamId: 'T-A', skills: ['병의원 관리', '정기청소'], status: '근무', todayJobs: 3 },
  { id: 'E02', name: '최민석', position: '현장직원', teamId: 'T-A', skills: ['정기청소', '소독'], status: '근무', todayJobs: 3 },
  { id: 'E03', name: '김도윤', position: '팀장', teamId: 'T-B', skills: ['병의원 관리', '품질점검'], status: '근무', todayJobs: 4 },
  { id: 'E04', name: '박현우', position: '현장직원', teamId: 'T-B', skills: ['정기청소', '바닥관리'], status: '근무', todayJobs: 4 },
  { id: 'E05', name: '정승원', position: '팀장', teamId: 'T-C', skills: ['빌딩 공용부', '사무실'], status: '근무', todayJobs: 4 },
  { id: 'E06', name: '한지훈', position: '현장직원', teamId: 'T-C', skills: ['사무실', '유리'], status: '근무', todayJobs: 4 },
  { id: 'E07', name: '오세영', position: '팀장', teamId: 'T-D', skills: ['상가', '프랜차이즈'], status: '근무', todayJobs: 3 },
  { id: 'E08', name: '임태규', position: '현장직원', teamId: 'T-D', skills: ['상가', '폐기물'], status: '휴무', todayJobs: 0 },
  { id: 'E09', name: '강병철', position: '팀장', teamId: 'T-E', skills: ['유리창', '고소작업'], status: '근무', todayJobs: 2 },
  { id: 'E10', name: '서준일', position: '현장직원', teamId: 'T-E', skills: ['유리창', '외벽'], status: '근무', todayJobs: 2 },
  { id: 'E11', name: '문성재', position: '팀장', teamId: 'T-F', skills: ['바닥 세척', '왁스'], status: '근무', todayJobs: 3 },
  { id: 'E12', name: '조영민', position: '현장직원', teamId: 'T-F', skills: ['바닥 세척'], status: '근무', todayJobs: 3 },
  { id: 'E13', name: '배정호', position: '팀장', teamId: 'T-G', skills: ['소독', '위생관리'], status: '근무', todayJobs: 2 },
  { id: 'E14', name: '신우철', position: '현장직원', teamId: 'T-G', skills: ['소독', '에어컨 세척'], status: '결원', todayJobs: 0 },
  { id: 'E15', name: '황인규', position: '팀장', teamId: 'T-H', skills: ['특수청소', '입퇴거'], status: '근무', todayJobs: 2 },
  { id: 'E16', name: '유창현', position: '현장직원', teamId: 'T-H', skills: ['특수청소'], status: '근무', todayJobs: 2 },
]

const iso = (offsetDays: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export const CUSTOMERS: Customer[] = [
  {
    id: 'C01', name: '라온메디컬센터', type: '병의원', district: '강남구',
    address: '서울 강남구 테헤란로 128', satisfaction: 4.1, lastVisit: '오늘 14:00 예정', recentInquiries: 2,
    contract: { serviceSummary: '병의원 정기관리 주 3회', visitsPerWeek: 3, monthlyFee: 320, startDate: iso(-330), endDate: iso(32), renewalDDay: 32, customerManager: '김수연 실장', internalManager: '김도윤', teamId: 'T-B' },
  },
  {
    id: 'C02', name: '성수 B오피스', type: '사무실', district: '성동구',
    address: '서울 성동구 왕십리로 83', satisfaction: 4.5, lastVisit: '2일 전', recentInquiries: 0,
    contract: { serviceSummary: '사무실 정기청소 주 2회', visitsPerWeek: 2, monthlyFee: 180, startDate: iso(-200), endDate: iso(165), renewalDDay: 165, customerManager: '이가람 매니저', internalManager: '정승원', teamId: 'T-C' },
  },
  {
    id: 'C03', name: '에이원교육센터', type: '학원', district: '송파구',
    address: '서울 송파구 올림픽로 240', satisfaction: 4.6, lastVisit: '어제', recentInquiries: 1,
    contract: { serviceSummary: '학원 정기청소 주 3회', visitsPerWeek: 3, monthlyFee: 210, startDate: iso(-410), endDate: iso(120), renewalDDay: 120, customerManager: '박세진 원장', internalManager: '김도윤', teamId: 'T-B' },
  },
  {
    id: 'C04', name: '강남 C클리닉', type: '병의원', district: '강남구',
    address: '서울 강남구 도산대로 55', satisfaction: 4.3, lastVisit: '오늘 완료', recentInquiries: 1,
    contract: { serviceSummary: '병의원 정기관리 주 2회', visitsPerWeek: 2, monthlyFee: 260, startDate: iso(-150), endDate: iso(215), renewalDDay: 215, customerManager: '정하윤 실장', internalManager: '이준호', teamId: 'T-A' },
  },
  {
    id: 'C05', name: '그랜드타워', type: '빌딩', district: '서초구',
    address: '서울 서초구 서초대로 301', satisfaction: 4.7, lastVisit: '오늘 진행중', recentInquiries: 0,
    contract: { serviceSummary: '공용부 관리 주 5회', visitsPerWeek: 5, monthlyFee: 480, startDate: iso(-520), endDate: iso(60), renewalDDay: 60, customerManager: '한상묵 소장', internalManager: '정승원', teamId: 'T-C' },
  },
  {
    id: 'C06', name: '한빛프라자', type: '상가', district: '마포구',
    address: '서울 마포구 월드컵북로 21', satisfaction: 4.2, lastVisit: '오늘 17:00 예정', recentInquiries: 0,
    contract: { serviceSummary: '상가 공용부 주 2회', visitsPerWeek: 2, monthlyFee: 150, startDate: iso(-95), endDate: iso(270), renewalDDay: 270, customerManager: '오민재 관리인', internalManager: '오세영', teamId: 'T-D' },
  },
  {
    id: 'C07', name: '테크노밸리 D오피스', type: '사무실', district: '구로구',
    address: '서울 구로구 디지털로 300', satisfaction: 4.8, lastVisit: '오늘 완료', recentInquiries: 0,
    contract: { serviceSummary: '사무실 정기청소 주 3회', visitsPerWeek: 3, monthlyFee: 240, startDate: iso(-260), endDate: iso(105), renewalDDay: 105, customerManager: '차은우 총무', internalManager: '김도윤', teamId: 'T-B' },
  },
  {
    id: 'C08', name: '리버뷰어학원', type: '학원', district: '광진구',
    address: '서울 광진구 아차산로 402', satisfaction: 4.4, lastVisit: '오늘 완료', recentInquiries: 0,
    contract: { serviceSummary: '학원 정기청소 주 2회', visitsPerWeek: 2, monthlyFee: 160, startDate: iso(-180), endDate: iso(185), renewalDDay: 185, customerManager: '민지원 부원장', internalManager: '김도윤', teamId: 'T-B' },
  },
  {
    id: 'C09', name: '서초 E의원', type: '병의원', district: '서초구',
    address: '서울 서초구 반포대로 89', satisfaction: 3.9, lastVisit: '3일 전', recentInquiries: 3,
    contract: { serviceSummary: '병의원 정기관리 주 2회', visitsPerWeek: 2, monthlyFee: 280, startDate: iso(-340), endDate: iso(21), renewalDDay: 21, customerManager: '윤소희 실장', internalManager: '이준호', teamId: 'T-A' },
  },
  {
    id: 'C10', name: '청담 F뷰티라운지', type: '프랜차이즈', district: '강남구',
    address: '서울 강남구 압구정로 442', satisfaction: 4.6, lastVisit: '어제', recentInquiries: 0,
    contract: { serviceSummary: '매장 정기관리 주 3회', visitsPerWeek: 3, monthlyFee: 190, startDate: iso(-120), endDate: iso(245), renewalDDay: 245, customerManager: '홍다연 점장', internalManager: '오세영', teamId: 'T-D' },
  },
  {
    id: 'C11', name: '누리컨벤션', type: '빌딩', district: '영등포구',
    address: '서울 영등포구 여의대로 108', satisfaction: 4.0, lastVisit: '오늘 진행중', recentInquiries: 1,
    contract: { serviceSummary: '행사장·공용부 주 4회', visitsPerWeek: 4, monthlyFee: 420, startDate: iso(-450), endDate: iso(48), renewalDDay: 48, customerManager: '전영섭 팀장', internalManager: '문성재', teamId: 'T-F' },
  },
  {
    id: 'C12', name: '해온아동병원', type: '병의원', district: '송파구',
    address: '서울 송파구 백제고분로 77', satisfaction: 4.9, lastVisit: '오늘 완료', recentInquiries: 0,
    contract: { serviceSummary: '병원 소독·정기관리 주 4회', visitsPerWeek: 4, monthlyFee: 390, startDate: iso(-280), endDate: iso(85), renewalDDay: 85, customerManager: '남궁철 행정실장', internalManager: '배정호', teamId: 'T-G' },
  },
]

export const SITES: Site[] = CUSTOMERS.map((c, i) => ({
  id: `S${String(i + 1).padStart(2, '0')}`,
  customerId: c.id,
  name: `${c.name} ${c.type === '빌딩' ? '전관' : '본점'}`,
  address: c.address,
  areaPyeong: [180, 120, 95, 140, 420, 210, 160, 88, 130, 75, 380, 260][i],
  note: i === 0 ? '진료시간 외 작업 필수 (평일 13:00~15:00 휴게)' : i === 2 ? '외부 유리 오염 반복 확인됨' : undefined,
}))

export const customerById = (id: string) => CUSTOMERS.find((c) => c.id === id)
export const teamById = (id: string | null) => (id ? TEAMS.find((t) => t.id === id) : undefined)
export const employeeById = (id: string) => EMPLOYEES.find((e) => e.id === id)
export const teamMembers = (teamId: string) =>
  EMPLOYEES.filter((e) => e.teamId === teamId)
export const teamMemberNames = (teamId: string | null) =>
  teamId ? teamMembers(teamId).map((e) => e.name).join(' · ') : '미배정'
export const siteByCustomer = (customerId: string) => SITES.find((s) => s.customerId === customerId)
