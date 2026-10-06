import { useLocation, useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Btn } from '../components/ui'

/** 잘못된 주소 — 조용히 첫 화면으로 보내면 무엇이 잘못됐는지 알 수 없어, 이유와 갈 곳을 보여준다 */
export default function NotFound() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const care = pathname.startsWith('/care')
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-primary"><Compass size={26} /></span>
        <h1 className="mt-4 text-[1.4rem] font-extrabold">페이지를 찾을 수 없습니다</h1>
        <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink-soft">주소가 바뀌었거나 잘못 입력되었습니다.<br />아래에서 이동할 화면을 선택해 주세요.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Btn size="lg" onClick={() => nav(care ? '/care/home' : '/', { replace: true })}>{care ? '내 관리현황으로' : '대시보드로'}</Btn>
          <Btn size="lg" variant="outline" onClick={() => nav(care ? '/' : '/care', { replace: true })}>{care ? 'AX 운영화면' : '고객 플랫폼'}</Btn>
        </div>
      </div>
    </div>
  )
}
