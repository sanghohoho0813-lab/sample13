import { useEffect } from 'react'

/** 전역 검색 단축키 — ⌘K / Ctrl+K, 또는 입력 중이 아닐 때 '/' */
export function useCommandHotkey(open: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 다른 대화상자(시트 · 확인창)가 열려 있으면 그 위에 겹쳐 열지 않는다
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return
      const typing = e.target instanceof HTMLElement && (e.target.closest('input, textarea, select, [contenteditable="true"]'))
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open() }
      else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); open() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
}
