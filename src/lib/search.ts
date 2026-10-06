/** 검색 비교용 정규화 — 공백과 대소문자를 무시한다 ("강남c" 로 "강남 C클리닉" 을 찾는다) */
export const normalizeQuery = (v: string) => v.replace(/\s+/g, '').toLowerCase()

/** 검색어가 비어 있으면 모두 통과, 아니면 필드 중 하나라도 포함하면 통과 */
export function matchesQuery(fields: Array<string | undefined | null>, query: string): boolean {
  const q = normalizeQuery(query)
  if (!q) return true
  return fields.some((f) => !!f && normalizeQuery(f).includes(q))
}
