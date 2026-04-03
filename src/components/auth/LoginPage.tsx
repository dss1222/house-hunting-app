import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [signUpDone, setSignUpDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isSignUp) {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error)
      }
      // 가입+로그인 자동 처리됨 (AuthContext에서)
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error)
      }
    }
    setLoading(false)
  }

  if (signUpDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-5 bg-card text-center">
        <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mb-5">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" stroke="#00b76a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h1 className="text-[22px] font-bold text-text mb-2">가입 완료!</h1>
        <p className="text-[15px] text-text-secondary mb-10 leading-relaxed">
          이메일로 확인 링크가 전송되었습니다.<br />
          링크를 클릭한 후 로그인해주세요.
        </p>
        <button
          onClick={() => { setSignUpDone(false); setIsSignUp(false) }}
          className="w-full py-4 bg-primary text-white rounded-2xl font-semibold text-[16px] min-h-[52px] active:bg-primary-dark transition-colors"
        >
          로그인하기
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh bg-card">
      <div className="flex-1 flex flex-col justify-center px-5 pb-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[28px] font-bold text-text leading-tight mb-2">
            우리집 찾기
          </h1>
          <p className="text-[15px] text-text-secondary leading-relaxed">
            신혼부부를 위한 부동산 기록장
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[13px] font-medium text-text-secondary mb-1.5 block">이메일</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-[#f2f4f6] rounded-xl min-h-[50px] text-[15px] border-0 placeholder:text-text-tertiary"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-text-secondary mb-1.5 block">비밀번호</label>
            <input
              type="password"
              placeholder="6자 이상 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3.5 bg-[#f2f4f6] rounded-xl min-h-[50px] text-[15px] border-0 placeholder:text-text-tertiary"
            />
          </div>

          {error && (
            <p className="text-danger text-[13px] px-1">{error}</p>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-semibold text-[16px] min-h-[52px] disabled:opacity-40 active:bg-primary-dark transition-colors"
            >
              {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
            </button>
          </div>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError('') }}
          className="mt-5 text-[14px] text-text-secondary min-h-[44px] self-center"
        >
          {isSignUp ? (
            <span>이미 계정이 있나요? <span className="text-primary font-semibold">로그인</span></span>
          ) : (
            <span>계정이 없나요? <span className="text-primary font-semibold">회원가입</span></span>
          )}
        </button>
      </div>
    </div>
  )
}
