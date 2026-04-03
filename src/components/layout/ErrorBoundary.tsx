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
        <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center bg-[#17171c]">
          <p className="text-[48px] mb-5">😵</p>
          <p className="text-[20px] font-bold text-white mb-2">문제가 발생했어요</p>
          <p className="text-[15px] text-[#8b95a1] mb-8">페이지를 새로고침해 주세요</p>
          <button
            onClick={() => window.location.reload()}
            className="toss-btn h-[52px] px-8 bg-[#3182f6] text-white rounded-2xl text-[15px]"
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
