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
      if (error) setError(error)
    } else {
      const { error } = await signIn(email, password)
      if (error) setError(error)
    }
    setLoading(false)
  }

  if (signUpDone) {
    return (
      <div className="flex flex-col min-h-dvh bg-[#17171c] px-6 pt-20">
        <p className="text-[26px] font-bold text-white leading-tight mb-3">
          가입이 완료되었어요
        </p>
        <p className="text-[15px] text-[#8b95a1] leading-relaxed mb-12">
          이메일로 전송된 확인 링크를 클릭한 후<br />로그인해주세요.
        </p>
        <button
          onClick={() => { setSignUpDone(false); setIsSignUp(false) }}
          className="toss-btn w-full h-[54px] bg-[#3182f6] text-white rounded-2xl text-[16px]"
        >
          로그인하기
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#17171c]">
      <div className="px-6 pt-20 pb-10">
        <p className="text-[26px] font-bold text-white leading-snug">
          {isSignUp ? '회원가입' : '로그인'}
        </p>
        <p className="text-[15px] text-[#8b95a1] mt-2 leading-relaxed">
          신혼부부를 위한 부동산 기록장
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-6">
        <div className="mb-5">
          <label className="text-[13px] font-semibold text-[#8b95a1] block mb-2">이메일</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-[52px] px-4 bg-[#2c2c35] rounded-2xl text-[16px] text-white placeholder:text-[#4e5968] border-2 border-transparent focus:border-[#3182f6] transition-all"
          />
        </div>
        <div className="mb-4">
          <label className="text-[13px] font-semibold text-[#8b95a1] block mb-2">비밀번호</label>
          <input
            type="password"
            placeholder="6자 이상 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full h-[52px] px-4 bg-[#2c2c35] rounded-2xl text-[16px] text-white placeholder:text-[#4e5968] border-2 border-transparent focus:border-[#3182f6] transition-all"
          />
        </div>

        {error && (
          <p className="text-[#f04452] text-[13px] mb-4">{error}</p>
        )}
      </form>

      <div className="px-6 pb-10 pt-4">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="toss-btn w-full h-[54px] bg-[#3182f6] text-white rounded-2xl text-[16px] disabled:bg-[#4e5968] mb-4"
        >
          {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
        </button>
        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setError('') }}
          className="w-full text-center text-[14px] text-[#8b95a1] py-2"
        >
          {isSignUp ? (
            <>이미 계정이 있나요? <span className="text-[#3182f6] font-semibold">로그인</span></>
          ) : (
            <>계정이 없나요? <span className="text-[#3182f6] font-semibold">회원가입</span></>
          )}
        </button>
      </div>
    </div>
  )
}
