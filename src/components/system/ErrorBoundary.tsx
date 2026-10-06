import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw, LayoutDashboard } from 'lucide-react'

interface Props { children: ReactNode; /** 바뀌면 오류 상태를 초기화 (화면 이동 시) */ resetKey?: string }
interface State { error: Error | null }

/**
 * 화면 하나가 오류를 내도 앱 전체가 흰 화면이 되지 않게 막는다.
 * 사이드바·헤더는 그대로 두고 본문만 대체하며, 다른 화면으로 이동하면 자동으로 풀린다.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 실서비스에서는 이 지점에 오류 수집(Sentry 등)을 연결한다
    console.warn('[화면 오류]', error.message, info.componentStack?.split('\n')[1]?.trim())
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-soft text-warning"><AlertTriangle size={26} /></span>
        <h1 className="mt-4 text-[1.3rem] font-extrabold">이 화면을 표시하지 못했습니다</h1>
        <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-soft">
          일시적인 문제일 수 있습니다. 다시 시도해도 같다면 저장된 데모 데이터가 손상되었을 수 있어요.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => this.setState({ error: null })} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[0.9rem] font-bold text-white hover:bg-primary-strong">
            <RotateCcw size={16} /> 다시 시도
          </button>
          <a href="/" className="flex items-center gap-1.5 rounded-xl border border-line bg-card px-4 py-2.5 text-[0.9rem] font-bold hover:border-primary">
            <LayoutDashboard size={16} /> 대시보드로
          </a>
        </div>
      </div>
    )
  }
}
