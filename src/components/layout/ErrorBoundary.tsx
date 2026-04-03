import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-dvh p-6 text-center">
          <p className="text-lg font-semibold text-text mb-2">문제가 발생했습니다</p>
          <p className="text-text-secondary mb-6">페이지를 새로고침해 주세요.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white rounded-xl text-base font-medium min-h-[44px]"
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
