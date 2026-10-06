import { useEffect, useRef } from 'react'
import { useTour } from '../../components/tour/context'

/**
 * /presentation 은 별도 슬라이드 화면이 아니라
 * 실제 제품을 순서대로 안내하는 Guided Product Demo 런처다.
 * 투어 엔진이 첫 Step의 Route(/)로 직접 이동시키므로 여기서 별도 navigate 하지 않는다.
 */
export default function Presentation() {
  const { start } = useTour()
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    start('presentation')
  }, [start])
  return null
}
