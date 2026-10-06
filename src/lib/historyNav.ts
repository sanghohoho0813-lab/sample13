import { useEffect } from 'react'

/**
 * 미래AI랩 공용 뒤로·앞으로 버튼(public/mirae-history-nav.js)은 화면 최상단 레이어에 떠 있다.
 * 시트·드로어·대화상자·투어가 열려 있는 동안에는 그 안의 버튼(요청 보내기 등)을 가리지 않도록 잠시 숨긴다.
 * 겹쳐 열리는 경우를 위해 열린 개수를 세고, 모두 닫히면 되돌린다.
 */
let holds = 0
const host = () => document.querySelector<HTMLElement>('[data-mirae-history-nav]')

export function useHideHistoryNav(active: boolean) {
  useEffect(() => {
    if (!active) return
    holds += 1
    const h = host()
    if (h) h.style.display = 'none'
    return () => {
      holds = Math.max(0, holds - 1)
      if (holds === 0) {
        const h2 = host()
        if (h2) h2.style.display = ''
      }
    }
  }, [active])
}
