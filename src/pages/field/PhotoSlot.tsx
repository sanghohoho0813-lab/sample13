import { useRef, useState } from 'react'
import { AlertTriangle, Camera, CheckCircle2, ImagePlus, Loader2, RotateCcw, XCircle } from 'lucide-react'
import { Photo } from '../../components/ui/Photo'
import { altOf } from '../../lib/demo/photos'
import { judge, readPhoto, type PhotoMetrics, type PhotoVerdict } from '../../lib/field/photoCheck'
import { cx } from '../../lib/utils'
import type { PhotoRecord } from '../../types'

const LABEL = { before: '작업 전', after: '작업 후' } as const

type Draft = { dataUrl: string; metrics: PhotoMetrics; verdict: PhotoVerdict }

/**
 * 사진 한 칸 — 촬영(또는 앨범) → 화질 검사 → 저장
 * 같은 장면 · 렌즈 가림은 다시 찍어야 하고, 어두움 · 흔들림 · 저해상도는 확인 후 그대로 쓸 수 있다(경고가 리포트에 남는다).
 */
export default function PhotoSlot({ kind, record, otherHash, exampleSrc, now, onSave, onRetake }: {
  kind: 'before' | 'after'
  record?: PhotoRecord
  otherHash?: string
  exampleSrc: string
  now: () => string
  onSave: (p: PhotoRecord) => void
  onRetake: () => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [error, setError] = useState<string | null>(null)
  const label = LABEL[kind]

  const pick = () => { setError(null); input.current?.click() }
  const onFile = async (file?: File) => {
    if (!file) return
    setBusy(true); setDraft(null); setError(null)
    try {
      const { dataUrl, metrics } = await readPhoto(file)
      const verdict = judge(metrics, otherHash)
      if (verdict.ok) save(dataUrl, metrics, [])
      else setDraft({ dataUrl, metrics, verdict })
    } catch (e) {
      setError(e instanceof Error ? e.message : '사진을 읽지 못했습니다')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = '' // 같은 파일을 다시 골라도 동작
    }
  }
  const save = (dataUrl: string | undefined, m: Pick<PhotoMetrics, 'width' | 'height' | 'brightness' | 'sharpness'> & { hash?: string }, flags: string[]) => {
    onSave({ dataUrl, at: now(), width: m.width, height: m.height, brightness: m.brightness, sharpness: m.sharpness, hash: m.hash, flags: flags.length ? flags : undefined })
    setDraft(null)
  }

  const fileInput = (
    <input
      ref={input}
      type="file"
      accept="image/*"
      capture="environment"
      aria-label={`${label} 사진 파일`}
      className="sr-only"
      tabIndex={-1}
      onChange={(e) => onFile(e.target.files?.[0])}
    />
  )

  // 저장된 사진
  if (record && !draft) {
    return (
      <figure className="space-y-1.5">
        <div className={cx('relative aspect-[4/3] overflow-hidden rounded-xl border', record.flags?.length ? 'border-warning' : 'border-primary')}>
          {record.dataUrl
            ? <img src={record.dataUrl} alt={`${label} 현장 사진`} className="h-full w-full object-cover" />
            : <Photo sizes="240px" src={exampleSrc} alt={altOf(exampleSrc)} width={1448} height={1086} className="h-full w-full object-cover" />}
          <figcaption className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-ink/75 px-2 py-0.5 text-[0.72rem] font-extrabold text-white">
            <Camera size={11} /> {label} · {record.at}
          </figcaption>
        </div>
        <div className="flex items-start justify-between gap-1.5">
          <p className={cx('text-[0.72rem] font-bold leading-snug', record.flags?.length ? 'text-warning' : 'text-success')}>
            {record.flags?.length ? <><AlertTriangle size={11} className="mr-0.5 inline" />{record.flags[0]}</> : <><CheckCircle2 size={11} className="mr-0.5 inline" />{record.dataUrl ? '화질 정상' : '예시 사진 (데모)'}</>}
          </p>
          <button onClick={onRetake} className="flex shrink-0 items-center gap-0.5 text-[0.74rem] font-bold text-ink-soft hover:text-primary">
            <RotateCcw size={12} /> 다시 찍기
          </button>
        </div>
        {fileInput}
      </figure>
    )
  }

  // 검사 결과 확인
  if (draft) {
    const blocked = draft.verdict.blocking.length > 0
    return (
      <div className="space-y-1.5" role="alert">
        <div className={cx('relative aspect-[4/3] overflow-hidden rounded-xl border-2', blocked ? 'border-danger' : 'border-warning')}>
          <img src={draft.dataUrl} alt={`${label} 사진 — 검사 결과 확인 필요`} className="h-full w-full object-cover opacity-80" />
        </div>
        <ul className="space-y-0.5">
          {[...draft.verdict.blocking, ...draft.verdict.warnings].map((m) => (
            <li key={m} className={cx('flex gap-1 text-[0.74rem] font-bold leading-snug', draft.verdict.blocking.includes(m) ? 'text-danger' : 'text-warning')}>
              {draft.verdict.blocking.includes(m) ? <XCircle size={12} className="mt-0.5 shrink-0" /> : <AlertTriangle size={12} className="mt-0.5 shrink-0" />}{m}
            </li>
          ))}
        </ul>
        <div className="grid gap-1">
          <button onClick={pick} className="rounded-lg bg-primary px-2 py-2 text-[0.8rem] font-extrabold text-white">다시 찍기</button>
          {!blocked && (
            <button onClick={() => save(draft.dataUrl, draft.metrics, draft.verdict.warnings)} className="rounded-lg border border-line bg-card px-2 py-1.5 text-[0.76rem] font-bold text-ink-soft">
              확인했음 · 그대로 사용
            </button>
          )}
        </div>
        {fileInput}
      </div>
    )
  }

  // 빈 칸
  return (
    <div className="space-y-1.5">
      <button
        onClick={pick}
        disabled={busy}
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-primary/40 bg-card text-[0.86rem] font-extrabold text-primary-strong active:bg-mint"
      >
        {busy ? <><Loader2 size={22} className="animate-spin" /> 화질 검사 중…</> : <><ImagePlus size={24} /> {label} 사진 촬영</>}
        {!busy && <span className="text-[0.72rem] font-semibold text-ink-faint">밝기 · 흔들림 · 중복 자동 검사</span>}
      </button>
      {error && <p role="alert" className="text-[0.74rem] font-bold text-danger">{error}</p>}
      <button
        onClick={() => save(undefined, { width: 1448, height: 1086, brightness: 128, sharpness: 200 }, [])}
        className="w-full text-center text-[0.72rem] font-bold text-ink-faint underline-offset-2 hover:text-primary hover:underline"
      >
        카메라 없이 예시 사진 사용 (데모)
      </button>
      {fileInput}
    </div>
  )
}
