import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, Download, ScrollText } from 'lucide-react'
import { Badge, Btn, Card, DemoBadge, EmptyState, PageHeader } from '../../components/ui'
import { AuditTrail } from '../../components/ops'
import { useDemo } from '../../lib/data/context'
import { ENGINE_LABEL, ROLE_LABEL, type AuditEntity, type AuditEntry } from '../../types'
import { cx, nowDateShort, pastDayLabel } from '../../lib/utils'

type Tab = 'evidence' | 'audit'
const ENTITIES: Array<'전체' | AuditEntity> = ['전체', '배정', '요청', '조치', '현장 작업', '현장 이슈', '매출 기회', '고객 평가']
const WHO: Array<{ id: string; label: string; match: (e: AuditEntry) => boolean }> = [
  { id: 'all', label: '모든 처리자', match: () => true },
  { id: 'hq', label: '본사', match: (e) => e.role === 'ceo' || e.role === 'manager' },
  { id: 'field', label: '현장', match: (e) => e.role === 'field' },
  { id: 'customer', label: '고객', match: (e) => e.role === 'customer' },
  { id: 'system', label: 'AI · 시스템', match: (e) => e.role === 'system' },
]

/** 변경 이력 CSV — 내부감사 · 정부지원 결과보고에 그대로 첨부할 수 있는 형식 */
function downloadCsv(rows: AuditEntry[]) {
  const head = ['일자', '시각', '처리자', '역할', '대상 구분', '대상 ID', '대상', '처리', '변경 전', '변경 후', '사유 · 메모']
  const esc = (v?: string) => `"${(v ?? '').replace(/"/g, '""')}"`
  const body = rows.map((e) => [e.day === 'TODAY' ? nowDateShort() : e.day, e.at, e.actor, e.role === 'system' ? 'AI · 시스템' : ROLE_LABEL[e.role], e.entity, e.entityId, e.target, e.action, e.from, e.to, e.note].map(esc).join(','))
  const blob = new Blob(['﻿' + [head.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'cleanway-변경이력-DEMO.csv'
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export default function Evidence() {
  const { evidence, audit } = useDemo()
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'audit' ? 'audit' : 'evidence'
  const [entity, setEntity] = useState<'전체' | AuditEntity>('전체')
  const [who, setWho] = useState('all')
  const rows = audit.filter((e) => (entity === '전체' || e.entity === entity) && WHO.find((w) => w.id === who)!.match(e))
  const human = audit.filter((e) => e.role !== 'system').length

  return (
    <div className="fade-up">
      <PageHeader
        title="실증 기록 · 변경 이력"
        desc="AI 추천 → 사람의 결정 → 실행 → 결과(실증 기록)와, 누가 · 언제 · 무엇을 · 왜 바꿨는지(변경 이력)를 함께 남깁니다. 내부통제 · 감사 · 결과보고의 근거 데이터입니다."
        right={<DemoBadge />}
      />

      <div role="tablist" aria-label="기록 종류" className="mb-4 flex w-fit gap-1 rounded-xl border border-line bg-card p-1">
        {([['evidence', 'AX 실증 기록', evidence.length], ['audit', '변경 이력', audit.length]] as Array<[Tab, string, number]>).map(([id, label, n]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setParams(id === 'evidence' ? {} : { tab: id }, { replace: true })}
            className={cx('flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[0.88rem] font-bold', tab === id ? 'bg-primary text-white' : 'text-ink-soft hover:text-primary')}>
            {label}<span className={cx('tnum text-[0.74rem]', tab === id ? 'text-white/80' : 'text-ink-faint')}>{n}</span>
          </button>
        ))}
      </div>

      {tab === 'evidence' ? (
        evidence.length === 0 ? <EmptyState title="기록된 실증 기록이 없습니다." /> : (
          <Card tour="evidence" className="p-5">
            {/* 날짜별로 묶는다 — 오늘 · 어제 · n일 전 */}
            <div className="space-y-6">
            {[...new Set(evidence.map((e) => e.date))].map((day) => (
              <section key={day} aria-label={pastDayLabel(day)}>
            <p className="mb-3 flex items-baseline gap-2 text-[0.86rem] font-extrabold">
              {pastDayLabel(day)}
              {day === 'TODAY' && <span className="text-[0.76rem] font-bold text-ink-faint">{nowDateShort()}</span>}
              <span className="tnum text-[0.74rem] font-bold text-ink-faint">{evidence.filter((e) => e.date === day).length}건</span>
            </p>
            <ol className="relative ml-2 space-y-5 border-l-2 border-line pl-6">
              {evidence.filter((e) => e.date === day).map((e) => (
                <li key={e.id} className="relative">
                  <span className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card ${e.result ? 'bg-success' : 'bg-aqua'}`} />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tnum text-[0.8rem] font-extrabold text-primary">{e.time}</span>
                    <Badge tone="ai">{ENGINE_LABEL[e.engine]}</Badge>
                  </div>
                  <p className="mt-1 text-[0.92rem] font-semibold leading-relaxed">{e.text}</p>
                  {e.result && (
                    <p className="mt-1.5 flex w-fit items-center gap-1.5 rounded-lg bg-success-soft px-3 py-1.5 text-[0.82rem] font-bold text-success">
                      <CheckCircle2 size={14} /> 결과 — {e.result}
                    </p>
                  )}
                </li>
              ))}
            </ol>
              </section>
            ))}
            </div>
          </Card>
        )
      ) : (
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.84rem] text-ink-soft">전체 <b className="tnum text-ink">{audit.length}</b>건 · 사람의 결정 <b className="tnum text-ink">{human}</b>건 · AI · 시스템 <b className="tnum text-ink">{audit.length - human}</b>건</p>
            <Btn size="sm" variant="outline" onClick={() => downloadCsv(rows)}><Download size={13} className="mr-1 inline" />CSV 내보내기 ({rows.length})</Btn>
          </div>
          <div className="mb-2 flex flex-wrap gap-1.5" aria-label="대상 구분">
            {ENTITIES.map((e) => (
              <button key={e} onClick={() => setEntity(e)} aria-pressed={entity === e}
                className={cx('rounded-full border px-3 py-1 text-[0.8rem] font-bold', entity === e ? 'border-primary bg-mint text-primary-strong' : 'border-line text-ink-soft hover:border-primary/60')}>
                {e}
              </button>
            ))}
          </div>
          <div className="mb-4 flex flex-wrap gap-1.5" aria-label="처리자">
            {WHO.map((w) => (
              <button key={w.id} onClick={() => setWho(w.id)} aria-pressed={who === w.id}
                className={cx('rounded-full border px-3 py-1 text-[0.78rem] font-bold', who === w.id ? 'border-ink bg-ink text-white' : 'border-line text-ink-faint hover:border-ink/40')}>
                {w.label}
              </button>
            ))}
          </div>
          <AuditTrail entries={rows} empty="조건에 맞는 변경 이력이 없습니다." limit={30} />
        </Card>
      )}
      <p className="mt-5 flex items-center gap-1.5 text-[0.76rem] text-ink-faint">
        <ScrollText size={13} /> 기록은 지울 수 없고 추가만 됩니다(append-only). 실서비스에서는 서버 감사 로그로 저장됩니다. (현재 DEMO 기록)
      </p>
    </div>
  )
}
