import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ClipboardList, Inbox, ShieldCheck, Shuffle, Sparkles, Wrench } from 'lucide-react'
import { Btn, Card, DemoBadge, EmptyState, PageHeader, SectionTitle, StatusPill } from '../../components/ui'
import { useToast } from '../../components/ui/toast-context'
import { ActionLifecycle } from '../../components/ai'
import { AuditTrail } from '../../components/ops'
import { useDemo } from '../../lib/data/context'
import { STAFF, customerById, teamById } from '../../lib/demo/company'
import { can, needsSecondApprover } from '../../lib/ops/governance'
import { cx } from '../../lib/utils'
import { toneBg, type Tone } from '../../lib/tone'

type Kind = '배정' | '요청' | '이슈' | '조치'
interface Item {
  id: string
  kind: Kind
  title: string
  sub: string
  status: string
  owner?: string
  due?: string
  /** 낮을수록 먼저 — 승인 대기 · 신규 요청 · 긴급 이슈 순 */
  rank: number
  tone: Tone
  controls: ReactNode
}

const KIND_ICON: Record<Kind, ReactNode> = {
  배정: <Shuffle size={16} />, 요청: <Inbox size={16} />, 이슈: <Wrench size={16} />, 조치: <Sparkles size={16} />,
}
const KIND_TONE: Record<Kind, Tone> = { 배정: 'ai', 요청: 'warning', 이슈: 'danger', 조치: 'info' }
const FILTERS: Array<'전체' | Kind> = ['전체', '배정', '요청', '이슈', '조치']
const KIND_LABEL: Record<Kind, string> = { 배정: '배정', 요청: '고객 요청', 이슈: '현장 이슈', 조치: 'AI 조치' }

// 급한 정도로 묶는다 — rank 0~1 지금 결정 · 2~5 오늘 처리 · 6~ 이후 · 보류
const GROUPS: Array<{ key: string; label: string; hint: string; test: (rank: number) => boolean }> = [
  { key: 'now', label: '지금 결정', hint: '승인 대기 · 신규 접수 · 긴급', test: (r) => r <= 1 },
  { key: 'today', label: '오늘 처리', hint: '진행 중 · 오늘 기한', test: (r) => r >= 2 && r <= 5 },
  { key: 'later', label: '이후 · 보류', hint: '이번 주 · 다시 진행할 항목', test: (r) => r >= 6 },
]
const name = (customerId: string) => customerById(customerId)?.name ?? customerId

/**
 * 운영 처리함 — 운영관리자가 하루 종일 여는 처리 화면
 * 배정안 · 고객 요청 · 현장 이슈 · AI 조치를 한 줄로 세우고, 담당 · 상태 · 기한과 바로 할 수 있는 결정을 붙인다.
 * 판단 근거가 더 필요한 결정(배정 검토 · 요청 회신)은 상세 화면으로 이어진다.
 */
export default function TodayAx() {
  const store = useDemo()
  const { proposals, schedules, requests, issues, actions, audit, role, actor } = store
  const nav = useNavigate()
  const toast = useToast()
  const [filter, setFilter] = useState<'전체' | Kind>('전체')
  const [mine, setMine] = useState(false)

  const items = useMemo<Item[]>(() => {
    const list: Item[] = []
    // 배정안 — AI 조치와 묶인 것은 배정안 한 줄로만 보여준다
    for (const p of proposals.filter((x) => ['추천', '검토', '보류'].includes(x.status))) {
      const s = schedules.find((x) => x.id === p.scheduleId)
      if (!s) continue
      const self = p.status === '검토' && needsSecondApprover(p.kind) && p.reviewer === actor
      list.push({
        id: p.id, kind: '배정',
        title: `${s.dayOffset === 0 ? '' : `D+${s.dayOffset} `}${s.time} ${name(s.customerId)} — ${p.kind}`,
        sub: p.status === '검토' ? `${p.reviewer} 검토 · ${teamById(p.toTeamId ?? null)?.name} 선택${p.reviewNote ? ` — ${p.reviewNote}` : ''}` : p.status === '보류' ? `보류 사유 — ${p.holdReason}` : p.reason,
        status: p.status === '검토' ? '승인 대기' : p.status === '추천' ? '검토 필요' : '보류',
        owner: p.reviewer, due: s.dayOffset === 0 ? `오늘 ${s.time} 전` : undefined,
        rank: p.status === '검토' ? 0 : p.status === '추천' ? (s.dayOffset === 0 ? 1 : 3) : 6,
        tone: p.status === '검토' ? 'warning' : 'ai',
        controls: p.status === '검토' && can(role, 'dispatch.approve') && !self ? (
          <>
            <Btn size="sm" onClick={() => { store.approveProposal(p.id); toast(`승인 — ${teamById(p.toTeamId ?? null)?.name} 일정 반영 · 현장 앱 알림`) }}>승인 · 반영</Btn>
            <Btn size="sm" variant="outline" onClick={() => nav(`/schedule?id=${s.id}`)}>근거 보기</Btn>
          </>
        ) : (
          <>
            {self && <span className="flex items-center gap-1 text-[0.76rem] font-bold text-warning"><ShieldCheck size={13} />직무 분리 — 다른 승인권자 필요</span>}
            <Btn size="sm" variant={self ? 'outline' : 'ai'} onClick={() => nav(`/schedule?id=${s.id}`)}>{p.status === '검토' ? '배정안 보기' : '검토하기'}</Btn>
          </>
        ),
      })
    }
    // 고객 요청
    for (const r of requests.filter((x) => ['접수', '검토중', '처리중'].includes(x.status))) {
      list.push({
        id: r.id, kind: '요청', title: `${name(r.customerId)} — ${r.type}`, sub: r.detail,
        status: r.status, owner: r.assignee, due: r.type === '긴급방문' ? '즉시' : r.status === '접수' ? '오늘 응답' : undefined,
        rank: r.status === '접수' ? (r.type === '긴급방문' ? 0 : 1) : 4, tone: r.type === '긴급방문' ? 'danger' : 'warning',
        controls: (
          <>
            {r.status === '접수' && can(role, 'request.handle') && (
              <Btn size="sm" variant="outline" onClick={() => { store.assignRequest(r.id, actor); toast(`${r.id} 담당자로 지정되었습니다 — 고객 화면에 표시됩니다.`) }}>내가 담당</Btn>
            )}
            <Btn size="sm" onClick={() => nav(`/requests?id=${r.id}`)}>처리하기</Btn>
          </>
        ),
      })
    }
    // 현장 이슈
    for (const i of issues.filter((x) => x.status !== '해결')) {
      list.push({
        id: i.id, kind: '이슈', title: `${name(i.customerId)} — ${i.type}`, sub: `${i.detail} · 보고 ${i.reportedBy} ${i.at}`,
        status: i.status, owner: i.owner, due: i.severity === '긴급' ? '즉시' : undefined,
        rank: i.severity === '긴급' ? 0 : i.status === '접수' ? 2 : 5, tone: i.severity === '긴급' ? 'danger' : 'warning',
        controls: !can(role, 'issue.handle') ? null : i.status === '접수' ? (
          <Btn size="sm" variant="outline" onClick={() => { store.updateIssue(i.id, '조치중', actor); toast('이슈 담당을 맡았습니다.') }}>내가 조치</Btn>
        ) : (
          <Btn size="sm" variant="success" onClick={() => { store.updateIssue(i.id, '해결'); toast('조치 완료 — 고객 건강도에 반영됩니다.') }}>조치 완료</Btn>
        ),
      })
    }
    // AI 조치 — 배정안과 묶인 것은 위 배정 줄에서 처리
    const linked = new Set(proposals.filter((p) => ['추천', '검토', '보류'].includes(p.status)).map((p) => p.actionId))
    for (const a of actions.filter((x) => !['완료', '무시'].includes(x.status) && !linked.has(x.id))) {
      list.push({
        id: a.id, kind: '조치', title: a.title, sub: a.detail,
        status: a.status, owner: a.owner, due: a.due,
        rank: a.status === '보류' ? 8 : a.due?.startsWith('오늘') ? 2 : 7, tone: 'info',
        controls: (
          <>
            <ActionLifecycle actionId={a.id} status={a.status} compact />
            {can(role, 'action.update') && (
              <label className="flex items-center gap-1 text-[0.76rem] font-bold text-ink-faint">
                담당
                <select
                  value={a.owner}
                  onChange={(e) => { store.setActionOwner(a.id, e.target.value); toast(`담당자를 ${e.target.value}(으)로 변경했습니다.`, 'info') }}
                  className="rounded-lg border border-line bg-card px-1.5 py-1 text-[0.78rem] font-bold text-ink"
                >
                  {[...new Set([a.owner, ...STAFF])].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
            )}
          </>
        ),
      })
    }
    return list.sort((a, b) => a.rank - b.rank)
  }, [proposals, schedules, requests, issues, actions, role, actor, store, nav, toast])

  const isMine = (i: Item) => !i.owner || i.owner === actor
  const shown = items.filter((i) => (filter === '전체' || i.kind === filter) && (!mine || isMine(i)))
  const handledToday = audit.filter((a) => a.day === 'TODAY' && a.role !== 'system' && a.role !== 'customer')

  return (
    <div className="fade-up">
      <PageHeader
        title="운영 처리함"
        desc="배정안 · 고객 요청 · 현장 이슈 · AI 조치를 담당 · 상태 · 기한과 함께 한 줄로 처리합니다. 모든 결정은 변경 이력에 남습니다."
        right={<DemoBadge />}
      />

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-3">
          {/* 폰 · 태블릿 — 오른쪽 칸의 처리 현황을 목록 위 한 줄로 */}
          <dl className="grid grid-cols-4 gap-1.5 xl:hidden">
            {[
              ['남은', items.length, 'text-ink'],
              ['승인 대기', items.filter((i) => i.status === '승인 대기').length, 'text-warning'],
              ['미지정', items.filter((i) => !i.owner).length, 'text-danger'],
              ['오늘 처리', handledToday.length, 'text-success'],
            ].map(([l, v, c]) => (
              <div key={l as string} className="rounded-xl border border-line bg-card px-2.5 py-1.5 text-center">
                <dt className="truncate text-[0.7rem] font-bold text-ink-faint">{l}</dt>
                <dd className={cx('tnum text-[1.05rem] font-extrabold leading-tight', c as string)}>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center gap-2">
            <div role="tablist" aria-label="처리 항목 종류" className="scroll-row -mx-4 flex max-w-[calc(100%+2rem)] gap-1 overflow-x-auto px-4 sm:mx-0 sm:max-w-full sm:flex-wrap sm:overflow-visible sm:px-0">
              <div className="flex shrink-0 gap-1 rounded-xl border border-line bg-card p-1">
              {FILTERS.map((f) => {
                const n = f === '전체' ? items.length : items.filter((i) => i.kind === f).length
                return (
                  <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
                    className={cx('flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-[0.84rem] font-bold', filter === f ? 'bg-primary text-white' : 'text-ink-soft hover:text-primary')}>
                    {f === '전체' ? '전체' : KIND_LABEL[f]}
                    <span className={cx('tnum text-[0.74rem]', filter === f ? 'text-white/80' : 'text-ink-faint')}>{n}</span>
                  </button>
                )
              })}
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-1.5 text-[0.84rem] font-bold text-ink-soft">
              <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
              내 담당 · 미지정만
            </label>
          </div>

          {shown.length === 0 ? (
            <EmptyState title="처리할 항목이 없습니다." desc="새 배정안 · 고객 요청 · 현장 이슈가 생기면 이곳에 바로 쌓입니다." />
          ) : (
            <div className="space-y-4">
              {GROUPS.map((g) => {
                const rows = shown.filter((i) => g.test(i.rank))
                if (rows.length === 0) return null
                return (
                  <section key={g.key} aria-label={`${g.label} ${rows.length}건`}>
                    <p className="mb-1.5 flex items-baseline gap-2 px-1">
                      <span className={cx('text-[0.86rem] font-extrabold', g.key === 'now' ? 'text-danger' : 'text-ink')}>{g.label}</span>
                      <span className="tnum text-[0.78rem] font-bold text-ink-faint">{rows.length}</span>
                      <span className="hidden text-[0.74rem] text-ink-faint sm:inline">— {g.hint}</span>
                    </p>
                    {/* 받은편지함 행 — 한 카드 안에 줄로. 메타와 결정 버튼을 한 줄에 두어 높이를 줄인다 */}
                    <ul className="divide-y divide-line/80 overflow-hidden rounded-2xl border border-line bg-card shadow-card">
                      {rows.map((i) => {
                        const urgent = i.due === '즉시' || i.status === '승인 대기'
                        // AI 조치는 오른쪽 결정 영역에 상태와 담당 선택이 이미 있다 — 같은 정보를 두 번 쓰지 않는다
                        const selfManaged = i.kind === '조치' && can(role, 'action.update')
                        return (
                          <li key={`${i.kind}-${i.id}`} className={cx('relative flex gap-3 px-3.5 py-3 sm:px-4', urgent && 'before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-danger/70')}>
                            <span className={cx('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', toneBg[KIND_TONE[i.kind]])} title={KIND_LABEL[i.kind]}>
                              {KIND_ICON[i.kind]}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p className="min-w-0 text-[0.95rem] font-extrabold leading-snug">
                                  <span className="sr-only">{KIND_LABEL[i.kind]} · </span>{i.title}
                                </p>
                                {!selfManaged && <span className="shrink-0 pt-0.5 text-[0.76rem] font-bold text-ink-faint">담당 {i.owner ?? <span className="text-warning">미지정</span>}</span>}
                              </div>
                              <p className="mt-0.5 line-clamp-2 text-[0.84rem] leading-relaxed text-ink-soft [overflow-wrap:anywhere]">{i.sub}</p>
                              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {i.kind !== '조치' && <StatusPill status={i.status} />}
                                  {i.due && <span className={cx('text-[0.76rem] font-bold', i.due === '즉시' ? 'text-danger' : 'text-ink-faint')}>기한 {i.due}</span>}
                                  <span className="tnum text-[0.72rem] font-semibold text-ink-faint">{i.id}</span>
                                </div>
                                {i.controls && <div className="flex flex-wrap items-center gap-2">{i.controls}</div>}
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20">
          <Card className="hidden p-4 xl:block">
            <p className="flex items-center gap-1.5 text-[0.92rem] font-extrabold"><ClipboardList size={16} className="text-primary" /> 오늘 처리 현황</p>
            <dl className="mt-3 grid grid-cols-2 gap-2">
              {[
                ['남은 항목', items.length, 'text-ink'],
                ['승인 대기', items.filter((i) => i.status === '승인 대기').length, 'text-warning'],
                ['담당 미지정', items.filter((i) => !i.owner).length, 'text-danger'],
                ['오늘 처리', handledToday.length, 'text-success'],
              ].map(([l, v, c]) => (
                <div key={l as string} className="rounded-xl bg-ivory px-3 py-2">
                  <dt className="text-[0.74rem] font-bold text-ink-faint">{l}</dt>
                  <dd className={cx('tnum text-[1.2rem] font-extrabold', c as string)}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2.5 flex items-center gap-1.5 text-[0.78rem] text-ink-faint"><CheckCircle2 size={13} /> 지금 처리자 — <b className="text-ink-soft">{actor}</b></p>
          </Card>
          <Card className="p-4">
            <SectionTitle className="mb-2.5" right={role === 'ceo' ? <button onClick={() => nav('/evidence?tab=audit')} className="text-[0.78rem] font-bold text-primary hover:underline">전체 <ArrowRight size={12} className="inline" /></button> : undefined}>
              <span className="text-[0.98rem]">최근 변경 이력</span>
            </SectionTitle>
            <AuditTrail entries={audit.filter((a) => a.day === 'TODAY')} limit={6} compact />
          </Card>
        </aside>
      </div>
    </div>
  )
}
