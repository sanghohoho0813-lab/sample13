/** Tab 이 대화상자 밖으로 빠져나가지 않게 — 마지막에서 Tab 이면 처음으로, 처음에서 Shift+Tab 이면 마지막으로 */
export function trapTab(box: HTMLElement | null, e: KeyboardEvent) {
  if (!box) return
  const f = [...box.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')]
  if (!f.length) return
  const first = f[0], last = f[f.length - 1]
  if (e.shiftKey && (document.activeElement === first || document.activeElement === box)) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}
