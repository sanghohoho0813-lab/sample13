import { createContext, useContext } from 'react'
import type { Tone } from '../../lib/tone'

export type ToastFn = (msg: string, tone?: Tone) => void
export const ToastContext = createContext<ToastFn>(() => {})

/** 화면 하단 알림 — toast('저장했습니다') / toast('확인이 필요합니다', 'warning') */
export const useToast = () => useContext(ToastContext)
