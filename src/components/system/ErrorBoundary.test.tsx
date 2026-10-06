// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

afterEach(cleanup)

let shouldThrow = true
function Flaky() {
  if (shouldThrow) throw new Error('boom')
  return <p>정상 화면</p>
}

describe('ErrorBoundary', () => {
  it('하위 화면 오류를 막고 안내 · 다시 시도를 보여준다', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    shouldThrow = true
    render(<ErrorBoundary><Flaky /></ErrorBoundary>)
    expect(screen.getByRole('alert').textContent).toContain('이 화면을 표시하지 못했습니다')
    shouldThrow = false
    fireEvent.click(screen.getByRole('button', { name: /다시 시도/ }))
    expect(screen.getByText('정상 화면')).toBeTruthy()
    spy.mockRestore()
  })

  it('resetKey 가 바뀌면(다른 화면으로 이동) 자동으로 풀린다', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    shouldThrow = true
    function Host() {
      const [k, setK] = useState('a')
      return <><button onClick={() => { shouldThrow = false; setK('b') }}>이동</button><ErrorBoundary resetKey={k}><Flaky /></ErrorBoundary></>
    }
    render(<Host />)
    expect(screen.getByRole('alert')).toBeTruthy()
    fireEvent.click(screen.getByText('이동'))
    expect(screen.getByText('정상 화면')).toBeTruthy()
  })
})
