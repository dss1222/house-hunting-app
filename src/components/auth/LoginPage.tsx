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
      <div className="flex flex-col items-center justify-center min-h-dvh p-6 bg-bg text-center">
        <div className="w-16 h-16 rounded-2xl bg-success-light flex items-center justify-center mb-4">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">가입 완료!</h1>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          이메일로 확인 링크가 전송되었습니다.<br />
          링크를 클릭한 후 로그인해주세요.
        </p>
        <button
          onClick={() => { setSignUpDone(false); setIsSignUp(false) }}
          className="w-full max-w-[320px] py-3.5 bg-primary text-white rounded-2xl font-semibold min-h-[48px] shadow-[var(--shadow-float)] active:scale-[0.98] transition-transform"
        >
          로그인하기
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4f6cff] via-[#7c5cfc] to-[#9f7afa]" />
      <div className="absolute top-[-20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-[360px] animate-fade-in">
        {/* Logo area */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 shadow-lg">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">우리집 찾기</h1>
          <p className="text-white/70 text-sm">신혼부부를 위한 부동산 기록장</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8"/><path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 border border-border rounded-xl min-h-[48px] bg-[#f8f9fc] text-sm transition-all"
              />
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <input
                type="password"
                placeholder="비밀번호 (6자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3.5 border border-border rounded-xl min-h-[48px] bg-[#f8f9fc] text-sm transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-danger-light rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="text-danger"/><path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-danger"/></svg>
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#4f6cff] to-[#7c5cfc] text-white rounded-xl font-semibold min-h-[48px] disabled:opacity-50 shadow-[0_4px_16px_rgba(79,108,255,0.3)] active:scale-[0.98] transition-transform text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="60" strokeDashoffset="15" className="opacity-30"/><path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/></svg>
                  처리 중...
                </span>
              ) : isSignUp ? '회원가입' : '로그인'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="text-sm text-text-secondary min-h-[44px] active:text-primary transition-colors"
            >
              {isSignUp ? (
                <span>이미 계정이 있나요? <span className="text-primary font-medium">로그인</span></span>
              ) : (
                <span>계정이 없나요? <span className="text-primary font-medium">회원가입</span></span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
