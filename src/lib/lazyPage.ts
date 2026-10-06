import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

type Loader = () => Promise<{ default: ComponentType }>
export type LazyPage = LazyExoticComponent<ComponentType> & { preload: Loader }

const loaders: Loader[] = []

/** 화면 단위 코드 분할 — 첫 화면은 필요한 코드만 받고, 나머지는 쉬는 시간에 미리 받아 이동은 즉시 열리게 한다 */
export function lazyPage(load: Loader): LazyPage {
  const page = lazy(load) as LazyPage
  page.preload = load
  loaders.push(load)
  return page
}

/** 첫 화면을 그린 뒤 브라우저가 한가할 때 나머지 화면 코드를 순서대로 미리 받는다 */
export function preloadAllPages() {
  const idle = (cb: () => void) => {
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(cb, { timeout: 2500 })
    else setTimeout(cb, 1200)
  }
  idle(() => {
    loaders.reduce<Promise<unknown>>((p, l) => p.then(() => l().catch(() => undefined)), Promise.resolve())
  })
}
