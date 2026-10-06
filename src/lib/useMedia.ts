import { useEffect, useState } from 'react'

/**
 * 미디어쿼리 구독 — PC/모바일에서 레이아웃 자체가 달라지는 화면에서 사용한다.
 * (CSS로 숨기기만 하면 같은 data-tour 요소가 두 번 존재해 튜토리얼이 숨은 쪽을 가리킬 수 있다)
 */
export function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

/** Tailwind xl(1280px) 이상 — 목록과 상세를 나란히 놓을 수 있는 폭 */
export const useIsWide = () => useMedia('(min-width: 1280px)')
