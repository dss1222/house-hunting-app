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
        <h1 className="text-3xl font-bold text-primary mb-4">우리집 찾기</h1>
        <p className="text-lg font-semibold text-text mb-2">가입 완료!</p>
        <p className="text-sm text-text-secondary mb-6">
          이메일로 확인 링크가 전송되었습니다.<br />
          링크를 클릭한 후 로그인해주세요.
        </p>
        <button
          onClick={() => { setSignUpDone(false); setIsSignUp(false) }}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold min-h-[44px]"
        >
          로그인하기
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh p-6 bg-bg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">우리집 찾기</h1>
        <p className="text-text-secondary">신혼부부를 위한 부동산 기록장</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-[320px] space-y-3">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-border rounded-xl min-h-[44px] bg-white"
        />
        <input
          type="password"
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 border border-border rounded-xl min-h-[44px] bg-white"
        />

        {error && (
          <p className="text-danger text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold min-h-[44px] disabled:opacity-50"
        >
          {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
        </button>
      </form>

      <button
        onClick={() => { setIsSignUp(!isSignUp); setError('') }}
        className="mt-4 text-sm text-text-secondary min-h-[44px]"
      >
        {isSignUp ? '이미 계정이 있나요? 로그인' : '계정이 없나요? 회원가입'}
      </button>
    </div>
  )
}
