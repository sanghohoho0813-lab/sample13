import { createContext, useContext, useEffect, useRef } from 'react'
import { isInPreview } from '../../lib/preview'
import type { TourKind } from './steps'

interface TourCtx {
  active: TourKind | null
  start: (k: TourKind) => void
  stop: () => void
}

export const TourContext = createContext<TourCtx>({ active: null, start: () => {}, stop: () => {} })
export const useTour = () => useContext(TourContext)

/** 첫 진입 시 튜토리얼 자동 시작 (Preview iframe 안에서는 실행하지 않음) */
export function useAutoTutorial(seen: boolean, markSeen: () => void) {
  const { start } = useTour()
  const fired = useRef(false)
  useEffect(() => {
    if (seen || fired.current || isInPreview()) return
    fired.current = true
    const t = window.setTimeout(() => { markSeen(); start('tutorial') }, 700)
    return () => window.clearTimeout(t)
  }, [seen, markSeen, start])
}
