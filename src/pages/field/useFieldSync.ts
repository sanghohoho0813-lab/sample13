import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDemo } from '../../lib/data/context'
import type { DemoAction } from '../../lib/data/reducer'
import { OUTBOX_KEY, enqueue, overlay, parseOutbox, type Net } from '../../lib/field/outbox'
import { nowTimeHM } from '../../lib/utils'

const NET_KEY = 'cleanway-field-net'
const FLUSH_DELAY: Record<Net, number> = { online: 250, weak: 1800, offline: Infinity }

const read = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }
const write = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* 저장 불가 — 메모리 대기열로 계속 */ } }

/**
 * 현장 앱 동기화 — 화면은 view 를 그리고, 동작은 send 로 보낸다.
 * 네트워크 상태는 실제 브라우저 온라인 여부 + 데모용 시뮬레이션(약한 신호 · 오프라인)을 함께 본다.
 */
export function useFieldSync() {
  const store = useDemo()
  const [net, setNetState] = useState<Net>(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline'
    const saved = read(NET_KEY)
    return saved === 'weak' || saved === 'offline' ? saved : 'online'
  })
  const [outbox, setOutbox] = useState<DemoAction[]>(() => parseOutbox(read(OUTBOX_KEY)))
  const [lastSync, setLastSync] = useState<string | null>(null)
  const dispatchRef = useRef(store.dispatchField)
  dispatchRef.current = store.dispatchField

  // 대기열 최신값 — 동작을 보낼지 쌓을지는 상태 갱신 함수 밖에서 정한다 (갱신 함수가 두 번 불려도 한 번만 전송)
  const boxRef = useRef(outbox)
  boxRef.current = outbox

  const setNet = useCallback((n: Net) => { setNetState(n); write(NET_KEY, n) }, [])

  useEffect(() => { write(OUTBOX_KEY, JSON.stringify(outbox)) }, [outbox])

  // 실제 기기의 연결 끊김 · 복구
  useEffect(() => {
    const off = () => setNetState('offline')
    const on = () => setNetState((n) => (n === 'offline' ? 'online' : n))
    window.addEventListener('offline', off)
    window.addEventListener('online', on)
    return () => { window.removeEventListener('offline', off); window.removeEventListener('online', on) }
  }, [])

  // 연결되어 있으면 쌓인 순서대로 전송 — 약한 신호는 늦게 도착한다
  useEffect(() => {
    if (!outbox.length || net === 'offline') return
    const t = window.setTimeout(() => {
      for (const a of outbox) dispatchRef.current(a)
      boxRef.current = []
      setOutbox([])
      setLastSync(nowTimeHM())
    }, FLUSH_DELAY[net])
    return () => window.clearTimeout(t)
  }, [outbox, net])

  const send = useCallback((a: DemoAction) => {
    // 대기열이 비어 있고 신호가 정상일 때만 바로 보낸다 — 순서가 뒤바뀌지 않게
    if (net === 'online' && boxRef.current.length === 0) {
      dispatchRef.current(a)
      setLastSync(nowTimeHM())
      return
    }
    boxRef.current = enqueue(boxRef.current, a)
    setOutbox(boxRef.current)
  }, [net])

  const view = useMemo(() => overlay(store, outbox), [store, outbox])

  return { view, send, net, setNet, pending: outbox.length, lastSync, meta: store.fieldMeta }
}
