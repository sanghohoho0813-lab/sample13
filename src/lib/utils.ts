export const fmtManwon = (v: number) =>
  v >= 10000 ? `${(v / 10000).toFixed(1)}억원` : `${v.toLocaleString('ko-KR')}만원`

export const fmtWon = (manwon: number) => `${(manwon * 10000).toLocaleString('ko-KR')}원`

export const nowClock = () =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(new Date())

export const nowDateLong = () =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  }).format(new Date())

/** 모바일용 압축 날짜 — 정보를 삭제하지 않고 압축한다 (예: 08.29 토) */
export const nowDateCompact = () => {
  const d = new Date()
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit', weekday: 'short',
  }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return `${get('month')}.${get('day')} ${get('weekday').replace(/요일/, '')}`
}

export const nowDateShort = () =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', weekday: 'short',
  }).format(new Date())

export const nowTimeHM = () =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date())

export const dateWithOffset = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', weekday: 'short',
  }).format(d)
}

export const cx = (...parts: Array<string | false | undefined | null>) =>
  parts.filter(Boolean).join(' ')

/**
 * 지난 날짜 표기 — 저장 데이터의 'TODAY' · 'D-1' · 'D-5' 를 사람이 읽는 말로.
 * (미래의 D-n 은 '남은 날', 지난 날을 같은 D-n 으로 쓰면 헷갈린다 — 표시만 바꾸고 저장 형식은 그대로)
 */
export const pastDayLabel = (day: string) => {
  if (day === 'TODAY' || day === '오늘') return '오늘'
  const m = /^D-(\d+)$/.exec(day)
  if (!m) return day
  const n = Number(m[1])
  return n === 1 ? '어제' : `${n}일 전`
}

