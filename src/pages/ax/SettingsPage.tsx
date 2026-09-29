import { useNavigate } from 'react-router-dom'
import {
  Check, Minus, X, RotateCcw, Upload, FileSpreadsheet, Database, HelpCircle,
  Palette, Type, Sparkles, Play, Users, Store, Smartphone, Bell, Zap, ShieldCheck,
} from 'lucide-react'
import { Card, PageHeader, Badge, Btn, DemoBadge, useToast, Freshness } from '../../components/ui'
import { useDemo, THEMES, type FontScale } from '../../lib/data/store'
import { useTour } from '../../components/tour/TourProvider'
import { ROLE_LABEL, type Role } from '../../types'
import { cx } from '../../lib/utils'

const MATRIX: Array<{ item: string; ceo: 0 | 1 | 2; manager: 0 | 1 | 2; field: 0 | 1 | 2; customer: 0 | 1 | 2 }> = [
  { item: '전체 매출 / 수익성', ceo: 2, manager: 0, field: 0, customer: 0 },
  { item: '전체 일정 / 배정', ceo: 2, manager: 2, field: 0, customer: 0 },
  { item: '전체 고객 / 계약', ceo: 2, manager: 2, field: 0, customer: 0 },
  { item: '직원 / 팀 관리', ceo: 2, manager: 2, field: 0, customer: 0 },
  { item: 'AI 전략 (Retention·Profit)', ceo: 2, manager: 1, field: 0, customer: 0 },
  { item: '본인 일정 / 현장 업무', ceo: 2, manager: 2, field: 2, customer: 0 },
  { item: '체크인 / 체크리스트 / 사진', ceo: 1, manager: 2, field: 2, customer: 0 },
  { item: '본인 계약 / 작업 리포트', ceo: 2, manager: 2, field: 0, customer: 2 },
  { item: '본인 요청 / 일정변경', ceo: 2, manager: 2, field: 0, customer: 2 },
  { item: 'AX Evidence / 설정', ceo: 2, manager: 0, field: 0, customer: 0 },
]

const Mark = ({ v }: { v: 0 | 1 | 2 }) =>
  v === 2 ? <Check size={17} className="mx-auto text-success" strokeWidth={3} />
  : v === 1 ? <Minus size={17} className="mx-auto text-warning" strokeWidth={3} />
  : <X size={16} className="mx-auto text-ink-faint/60" strokeWidth={3} />

function Group({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-3.5 flex items-start gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint text-primary">{icon}</span>
        <div>
          <h2 className="text-[1.05rem] font-extrabold leading-tight">{title}</h2>
          {desc && <p className="mt-0.5 text-[0.8rem] text-ink-soft">{desc}</p>}
        </div>
      </div>
      {children}
    </Card>
  )
}

export default function SettingsPage() {
  const {
    theme, setTheme, fontScale, setFontScale, reduceMotion, setReduceMotion,
    role, setRole, resetDemo,
  } = useDemo()
  const { start } = useTour()
  const toast = useToast()
  const nav = useNavigate()

  return (
    <div className="fade-up">
      <PageHeader
        title="설정"
        desc="화면 · 권한 · 데모 · 데이터 · AI · 연결 상태를 한곳에서 관리합니다."
        right={<DemoBadge />}
      />

      <div className="grid gap-5 xl:grid-cols-2">
        {/* ── 화면 ── */}
        <Group icon={<Palette size={19} />} title="화면" desc="테마 · 글자 크기 · 모션 — PC와 모바일에 동일하게 적용됩니다.">
          <p className="mb-2 text-[0.82rem] font-bold text-ink-soft">테마 <span className="font-semibold text-ink-faint">6종</span></p>
          <div className="grid gap-2 sm:grid-cols-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); toast(`테마를 ${t.name}로 변경했습니다.`, 'brand') }}
                className={cx(
                  'rounded-xl border p-3 text-left transition-colors',
                  theme === t.id ? 'border-primary bg-mint/60' : 'border-line hover:border-primary/60',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.82rem] font-extrabold leading-tight">{t.name}</p>
                  {theme === t.id && <Check size={15} className="shrink-0 text-primary" strokeWidth={3} />}
                </div>
                <p className="mt-0.5 text-[0.7rem] text-ink-faint">{t.desc}</p>
                <div className="mt-2 flex gap-1">
                  {t.dots.map((d) => <span key={d} className="h-4 w-4 rounded-full border border-black/5" style={{ background: d }} />)}
                </div>
              </button>
            ))}
          </div>

          <p className="mt-4 mb-2 flex items-center gap-1.5 text-[0.82rem] font-bold text-ink-soft"><Type size={14} /> 글자 크기</p>
          <div className="flex gap-1.5">
            {([['sm', '작게'], ['md', '기본'], ['lg', '크게']] as Array<[FontScale, string]>).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFontScale(id)}
                className={cx(
                  'flex-1 rounded-xl border px-3 py-2.5 text-[0.85rem] font-bold',
                  fontScale === id ? 'border-primary bg-primary text-white' : 'border-line hover:border-primary',
                )}
              >{label}</button>
            ))}
          </div>

          <label className="mt-3.5 flex cursor-pointer items-center justify-between rounded-xl border border-line px-3.5 py-3">
            <span className="text-[0.85rem] font-bold">모션 줄이기</span>
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
              className="h-5 w-5 accent-[var(--color-primary)]"
            />
          </label>
        </Group>

        {/* ── 사용자 / 권한 ── */}
        <Group icon={<ShieldCheck size={19} />} title="사용자 / 권한" desc="역할 미리보기 · 권한표 (RLS)">
          <p className="mb-2 text-[0.82rem] font-bold text-ink-soft">역할 미리보기 — 전환 시 메뉴·KPI·데이터가 실제로 달라집니다.</p>
          <div className="mb-4 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r)
                  if (r === 'field') nav('/field')
                  else if (r === 'customer') nav('/care/home')
                  else toast(`${ROLE_LABEL[r]} 권한으로 전환했습니다.`, 'info')
                }}
                className={cx(
                  'rounded-xl border px-2 py-2.5 text-[0.8rem] font-bold',
                  role === r ? 'border-primary bg-mint text-primary-strong' : 'border-line hover:border-primary',
                )}
              >{ROLE_LABEL[r]}</button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-[0.82rem]">
              <thead>
                <tr className="border-b border-line bg-ivory text-[0.72rem] text-ink-faint">
                  <th className="px-3 py-2.5 text-left font-bold">항목</th>
                  {['대표', '관리자', '직원', '고객'].map((r) => <th key={r} className="px-2 py-2.5 font-bold whitespace-nowrap">{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row) => (
                  <tr key={row.item} className="border-b border-line/60">
                    <td className="px-3 py-2.5 font-bold whitespace-nowrap">{row.item}</td>
                    <td className="px-2 py-2.5"><Mark v={row.ceo} /></td>
                    <td className="px-2 py-2.5"><Mark v={row.manager} /></td>
                    <td className="px-2 py-2.5"><Mark v={row.field} /></td>
                    <td className="px-2 py-2.5"><Mark v={row.customer} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 flex flex-wrap gap-3 text-[0.74rem] font-bold text-ink-faint">
            <span className="flex items-center gap-1"><Check size={13} className="text-success" /> 전체</span>
            <span className="flex items-center gap-1"><Minus size={13} className="text-warning" /> 부분</span>
            <span className="flex items-center gap-1"><X size={13} /> 불가</span>
            <span className="text-ink-faint">RLS <HelpCircle size={11} className="inline" /> = 사용자별로 볼 수 있는 데이터를 나누는 보안기능</span>
          </p>
        </Group>

        {/* ── Demo ── */}
        <Group icon={<Play size={19} />} title="데모" desc="데모 / 실서비스 구분 · 초기화 · 튜토리얼 · 시연 모드">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone="warning">데모 모드</Badge>
            <span className="text-[0.8rem] text-ink-soft">모든 데이터는 가상의 Sample Data입니다. 실제 운영처럼 위장하지 않습니다.</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Btn variant="outline" size="sm" className="justify-center" onClick={() => start('tutorial')}>
              <Sparkles size={14} className="mr-1 inline" /> 튜토리얼 다시보기
            </Btn>
            <Btn variant="outline" size="sm" className="justify-center" onClick={() => start('presentation')}>
              <Play size={14} className="mr-1 inline" /> 시연 모드 시작
            </Btn>
            <Btn variant="outline" size="sm" className="justify-center sm:col-span-2" onClick={() => {
              if (confirm('Action 상태·배정·고객 요청을 초기 시연 상태로 되돌릴까요? (테마·글자 설정은 유지됩니다)')) {
                resetDemo(); toast('데모를 초기화했습니다.')
              }
            }}>
              <RotateCcw size={14} className="mr-1 inline" /> 데모 초기화
            </Btn>
          </div>
        </Group>

        {/* ── Data ── */}
        <Group icon={<Database size={19} />} title="데이터" desc="데모 저장소 · 마지막 갱신 · 실데이터 연결 준비">
          <div className="mb-3"><Freshness /></div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Btn variant="outline" size="sm" className="justify-center" onClick={() => toast('CSV 가져오기는 실서비스 전환 시 활성화됩니다. (연동 준비 상태)', 'info')}>
              <Upload size={14} className="mr-1 inline" /> CSV 가져오기
            </Btn>
            <Btn variant="outline" size="sm" className="justify-center" onClick={() => toast('고객·일정·직원·계약 필드 구조는 docs/PROJECT_SPEC.md에 정의되어 있습니다.', 'info')}>
              <FileSpreadsheet size={14} className="mr-1 inline" /> 필드 구조 보기
            </Btn>
          </div>
          <div className="mt-3.5 space-y-1.5 border-t border-line pt-3 text-[0.8rem]">
            {[['데모 저장소 (localStorage)', '연결됨', 'success'], ['실데이터 저장소 · Supabase', '준비됨', 'neutral'], ['지도 / GPS / Geofence', '준비됨', 'neutral']].map(([l, s, t]) => (
              <div key={l} className="flex items-center justify-between gap-2">
                <span className="font-semibold text-ink-soft">{l}</span>
                <Badge tone={t as 'success'}>{s}</Badge>
              </div>
            ))}
          </div>
        </Group>

        {/* ── AI ── */}
        <Group icon={<Zap size={19} />} title="AI" desc="현재 AI 동작 방식과 향후 연결 지점">
          <div className="space-y-2 text-[0.84rem]">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ai-soft px-3.5 py-2.5">
              <span className="font-bold text-ai-strong">AI 엔진 6종 동작 방식</span>
              <Badge tone="ai">규칙 기반 데모 로직</Badge>
            </div>
            <p className="text-ink-soft">AI가 보는 데이터 — 일정 · 현장 위치 · 직원 상황 · 작업시간 · 고객/계약 · 품질 기록 · 수익성</p>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-3.5 py-2.5">
              <span className="font-bold">생성형 AI 연결 (GPT / Claude)</span>
              <Badge tone="ai">AI READY</Badge>
            </div>
            <p className="text-[0.78rem] text-ink-faint">실제 API Key가 없어도 완료 조건이 아닙니다. 연결 시 동일한 service interface로 교체됩니다.</p>
          </div>
        </Group>

        {/* ── 연결 ── */}
        <Group icon={<Store size={19} />} title="연결" desc="고객 플랫폼 · 현장직원 앱 · 알림">
          <div className="grid gap-2 sm:grid-cols-2">
            <Btn variant="outline" size="sm" className="justify-center" onClick={() => nav('/care')}>
              <Store size={14} className="mr-1 inline" /> 고객 플랫폼 보기
            </Btn>
            <Btn variant="outline" size="sm" className="justify-center" onClick={() => nav('/field')}>
              <Smartphone size={14} className="mr-1 inline" /> 현장직원 앱 보기
            </Btn>
          </div>
          <div className="mt-3.5 space-y-1.5 border-t border-line pt-3 text-[0.8rem]">
            {[['고객 요청 → AX 연결', '연결됨', 'success'], ['문자 / 앱 알림', '준비됨', 'neutral'], ['전자계약 / 결제', '준비됨', 'neutral']].map(([l, s, t]) => (
              <div key={l} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-semibold text-ink-soft"><Bell size={12} /> {l}</span>
                <Badge tone={t as 'success'}>{s}</Badge>
              </div>
            ))}
          </div>
        </Group>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <p className="flex items-center gap-1.5 text-[0.76rem] text-ink-faint">
          <Users size={13} /> 본 시스템은 Website Reference MVP입니다. 실제 회사·고객 정보가 아닙니다.
        </p>
        {/* 사이드바 하단에 이미 제작사 크레딧이 상시 노출되므로 여기서는 텍스트로만 표기한다 */}
        <p className="text-[0.7rem] font-bold tracking-[0.12em] text-ink-faint">
          POWERED BY 미래AI랩
        </p>
      </div>
    </div>
  )
}
