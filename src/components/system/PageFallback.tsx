/** 화면 코드를 받는 짧은 순간의 자리표시 — 실제 화면 골격(제목 · 요약 · 카드)과 같은 배치로 흔들림을 줄인다 */
export function PageFallback({ full }: { full?: boolean }) {
  return (
    <div aria-busy="true" aria-label="화면을 불러오는 중" className={full ? 'min-h-screen bg-ivory px-4 py-8' : ''}>
      <div className={full ? 'mx-auto max-w-3xl' : ''}>
        <div className="skeleton h-9 w-48" />
        <div className="skeleton mt-3 h-4 w-72 max-w-full" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-20" />)}
        </div>
        <div className="skeleton mt-5 h-56 w-full" />
      </div>
    </div>
  )
}
