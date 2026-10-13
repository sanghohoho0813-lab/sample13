import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION, initialState, parseStoredState } from './state'

const stored = (patch: Record<string, unknown>) => JSON.stringify({ ...initialState(), ...patch })

describe('parseStoredState — 저장된 데모 상태 복원', () => {
  it('저장된 값이 없으면 초기 상태', () => {
    expect(parseStoredState(null)).toEqual(initialState())
  })

  it('JSON 이 깨져 있어도 예외 없이 초기 상태', () => {
    expect(parseStoredState('{not json')).toEqual(initialState())
    expect(parseStoredState('"문자열"')).toEqual(initialState())
    expect(parseStoredState('[1,2]')).toEqual(initialState())
  })

  it('정상 데이터는 그대로 복원한다', () => {
    const s = parseStoredState(stored({ role: 'manager', theme: 'navy', requests: [] }))
    expect(s.role).toBe('manager')
    expect(s.theme).toBe('navy')
    expect(s.requests).toEqual([])
  })

  it('업무 데이터가 손상되면 업무만 초기화하고 화면 설정은 지킨다', () => {
    const s = parseStoredState(stored({ theme: 'forest', fontScale: 'lg', schedules: '손상' }))
    expect(s.schedules).toEqual(initialState().schedules)
    expect(s.theme).toBe('forest')
    expect(s.fontScale).toBe('lg')
  })

  it('알 수 없는 설정값은 기본값으로 되돌린다', () => {
    const s = parseStoredState(stored({ role: 'admin', theme: 'neon', fontScale: 'xl', reduceMotion: 'yes' }))
    expect(s.role).toBe('ceo')
    expect(s.theme).toBe('signature')
    expect(s.fontScale).toBe('md')
    expect(s.reduceMotion).toBe(false)
  })

  it('일정 구조가 다른 옛 버전(v1 · v2)은 업무 데이터를 새로 시작하고 화면 설정만 옮긴다', () => {
    const { version: _v, ...legacy } = { ...initialState(), tutorialSeen: true, theme: 'navy' as const, requests: [] }
    const s = parseStoredState(JSON.stringify({ ...legacy, version: 2 }))
    expect(s.version).toBe(SCHEMA_VERSION)
    expect(s).toMatchObject({ tutorialSeen: true, theme: 'navy' })
    expect(s.requests).toEqual(initialState().requests)
  })

  it('앞으로 나올 버전의 데이터는 업무 상태를 쓰지 않는다', () => {
    const s = parseStoredState(stored({ version: SCHEMA_VERSION + 1, requests: [], theme: 'graphite' }))
    expect(s.requests).toEqual(initialState().requests)
    expect(s.theme).toBe('graphite')
  })
})
