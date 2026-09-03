import {
  Building2, RefreshCcw, Handshake, Package, FileCheck2, GraduationCap,
  FileSignature, Wrench, Cpu, Leaf, type LucideIcon,
} from 'lucide-react'

/**
 * 향후 확장 로드맵 — Business AX와 Customer Portal이 함께 쓰는 단일 원본.
 *
 * 사업시설 유지관리·현장 서비스 업에서 현재 Core(일정·현장·품질·계약·수익성) 위에
 * 실제로 얹을 수 있는 확장만 담는다. 아직 구현되지 않은 영역이므로 Route를 만들지 않는다.
 *
 * 같은 항목이라도 보는 사람이 다르므로 두 개의 목소리를 갖는다.
 *  - label / desc            : 운영자(대표·관리자)가 보는 내부 관점 — "우리 운영이 어떻게 바뀌나"
 *  - customerLabel / customerDesc : 고객사가 보는 관점 — "우리가 무엇을 더 받게 되나"
 * customerDesc가 없는 항목(내부 인사·조직 영역)은 고객 화면에 노출하지 않는다.
 */

export type RoadmapStage = 'NEXT' | 'Preview' | 'Long-term'

export interface RoadmapItem {
  key: string
  label: string
  desc: string
  stage: RoadmapStage
  icon: LucideIcon
  color: string
  /** 고객 화면 노출용 — 없으면 내부 전용 항목 */
  customerLabel?: string
  customerDesc?: string
}

export const ROADMAP: RoadmapItem[] = [
  {
    key: 'multi-site',
    label: '다지점 통합관리', icon: Building2, color: '#C58AA8', stage: 'NEXT',
    desc: '지점이 여러 곳인 고객사를 한 계약·한 리포트로 묶어 본사가 전 지점 품질을 한 번에 봅니다.',
    customerLabel: '여러 지점 한 번에',
    customerDesc: '지점마다 따로 연락하지 않고, 본사에서 전 지점의 관리 상태를 한 화면에서 확인합니다.',
  },
  {
    key: 'subscription',
    label: '구독형 관리', icon: RefreshCcw, color: '#D98899', stage: 'NEXT',
    desc: '정기청소 + 주기별 특수관리(왁스·유리·소독)를 월 구독 상품으로 묶어 매출을 반복화합니다.',
    customerLabel: '정기 관리 플랜',
    customerDesc: '정기청소와 왁스·유리·소독 같은 주기 관리를 하나의 월 플랜으로 묶어, 그때그때 견적 없이 이용합니다.',
  },
  {
    key: 'partner',
    label: '협력사 네트워크', icon: Handshake, color: '#37B0A8', stage: 'NEXT',
    desc: '성수기·원거리 물량을 협력업체에 배정하고, 자사 현장과 동일한 품질 기준으로 검수합니다.',
    customerLabel: '서비스 지역 확대',
    customerDesc: '검증된 협력사를 통해 지방 지점까지 같은 품질 기준과 같은 리포트 양식으로 관리합니다.',
  },
  {
    key: 'supply',
    label: '소모품 · 자재', icon: Package, color: '#DFAE5E', stage: 'NEXT',
    desc: '세제·소모품 재고와 현장별 사용량을 기록해 수익성 분석의 원가에 그대로 연결합니다.',
    customerLabel: '소모품 자동 보충',
    customerDesc: '화장지·세제 같은 소모품 사용량을 기록해, 떨어지기 전에 방문 일정에 맞춰 채웁니다.',
  },
  {
    key: 'hygiene-doc',
    label: '위생 · 방역 증빙', icon: FileCheck2, color: '#4FB985', stage: 'NEXT',
    desc: '병의원·식품시설 고객이 점검 때 바로 제출할 수 있도록 소독·위생 증빙을 자동 축적합니다.',
    customerLabel: '위생 점검 증빙',
    customerDesc: '소독·방역 기록이 자동으로 쌓여, 위생 점검이나 인증 심사 때 바로 내려받아 제출할 수 있습니다.',
  },
  {
    key: 'hr',
    // 내부 인사·조직 영역 — 고객 화면에는 노출하지 않는다
    label: '채용 · 교육 관리', icon: GraduationCap, color: '#4FB6A0', stage: 'NEXT',
    desc: '현장 인력 채용 파이프라인과 교육·자격 이수를 관리해 배정 가능 인력을 정확히 셉니다.',
  },
  {
    key: 'quote',
    label: '견적 · 전자계약', icon: FileSignature, color: '#E0973F', stage: 'Preview',
    desc: '현장 조건(면적·주기·난이도)을 입력하면 견적이 산출되고 전자계약·자동청구까지 이어집니다.',
    customerLabel: '온라인 견적 · 전자계약',
    customerDesc: '면적과 주기만 입력하면 견적이 바로 나오고, 방문 없이 전자계약으로 시작합니다.',
  },
  {
    key: 'fm',
    label: '종합 시설관리', icon: Wrench, color: '#3FBF8F', stage: 'Preview',
    desc: '청소를 넘어 설비·경비·조경까지 한 건물에서 묶어 받는 종합 시설관리로 계약 단가를 올립니다.',
    customerLabel: '종합 시설관리',
    customerDesc: '청소뿐 아니라 설비·경비·조경까지 한 곳에 맡기고, 관리 창구를 하나로 줄입니다.',
  },
  {
    key: 'iot',
    label: 'IoT 스마트 현장', icon: Cpu, color: '#8C93EA', stage: 'Preview',
    desc: '이용량 센서를 붙여 "정해진 주기"가 아니라 "필요한 시점"에 인력을 투입합니다.',
    customerLabel: '필요한 시점 관리',
    customerDesc: '이용량 센서를 붙여 정해진 요일이 아니라 실제로 더러워진 시점에 맞춰 방문합니다.',
  },
  {
    key: 'esg',
    label: 'ESG · 친환경', icon: Leaf, color: '#4FC3D9', stage: 'Long-term',
    desc: '친환경 자재·폐기물·에너지 사용량을 고객사 ESG 보고에 그대로 넣을 수 있게 제공합니다.',
    customerLabel: 'ESG · 친환경 리포트',
    customerDesc: '친환경 자재 사용과 폐기물 배출량을 정리해, 귀사 ESG 보고에 그대로 넣을 수 있게 드립니다.',
  },
]

/** 고객 화면에 노출할 항목 (내부 전용 제외) */
export const CUSTOMER_ROADMAP = ROADMAP.filter(
  (r): r is RoadmapItem & { customerLabel: string; customerDesc: string } =>
    Boolean(r.customerLabel && r.customerDesc),
)

export const STAGE_NOTE: Record<RoadmapStage, string> = {
  'NEXT': '다음 단계',
  'Preview': '개념 검증',
  'Long-term': '장기 과제',
}
