# 우리집 찾기 - 프로젝트 가이드

## 기술 스택
- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Supabase (DB, Auth, Storage)
- Kakao Maps SDK
- Vercel 배포 (master push 시 자동 배포)

## 빌드 & 배포
```bash
npm run build        # tsc -b && vite build
git push origin master  # Vercel 자동 배포
```

## 작업 규칙
- 모든 작업 완료 후 반드시 커밋 + push까지 실행
- `PropertyForm.tsx`, `useNaverImport.ts`는 별도 작업 중일 수 있으므로 수정 전 확인 필요

---

## UI 디자인 가이드 (Toss Dark Style)

### 디자인 철학
- **다크 모드 기본** — 토스 앱의 다크 테마를 기반
- **플랫 디자인** — 그림자, 그라데이션 최소화. border도 최소
- **큰 타이포그래피** — 제목은 크고 굵게, 금액은 압도적으로 크게
- **넉넉한 여백** — 콘텐츠가 숨 쉴 공간. 밀도보다 가독성
- **섹션 디바이더** — 카드 대신 8px 두께의 어두운 구분선으로 섹션 분리
- **네이티브 터치 피드백** — 버튼/리스트 아이템 터치 시 `scale(0.97)` 축소

### 색상 시스템

#### 배경
| 용도 | 색상 | HEX |
|------|------|-----|
| 앱 배경 | 가장 어두운 배경 | `#17171c` |
| 카드/서피스 | 약간 밝은 배경 | `#212127` |
| 입력 필드/칩 | 인터랙티브 서피스 | `#2c2c35` |
| 섹션 디바이더 | 구분선 배경 | `#111115` |

#### 텍스트
| 용도 | 색상 | HEX |
|------|------|-----|
| 기본 텍스트 | 흰색 | `#ffffff` |
| 보조 텍스트 | 회색 | `#8b95a1` |
| 비활성/힌트 | 어두운 회색 | `#4e5968` |

#### 액센트
| 용도 | 색상 | HEX | 다크 배경 |
|------|------|-----|-----------|
| 프라이머리 (링크, 버튼) | 토스 블루 | `#3182f6` | `#1a3a5c` |
| 위험/삭제 | 레드 | `#f04452` | `#3d1c22` |
| 성공/주차가능/풀옵션 | 그린 | `#00b76a` | `#0d2e20` |
| 별점 | 골드 | `#ffb800` | — |

### 타이포그래피

#### 폰트
```
-apple-system, BlinkMacSystemFont, "Pretendard Variable", Pretendard, "Noto Sans KR", system-ui, sans-serif
```
- `letter-spacing: -0.025em` (한글 최적화 타이트 자간)
- `word-break: keep-all`

#### 크기 규칙
| 용도 | 크기 | 굵기 |
|------|------|------|
| 페이지 제목 (로그인 등) | 26px | bold |
| 섹션 제목 (리스트 "N개의 매물") | 22px | bold |
| 헤더 타이틀 | 20px | bold |
| 세부 섹션 제목 | 18px | bold |
| 카드 이름 / 본문 | 16px | bold / normal |
| 본문 보조 텍스트 | 15px | normal |
| 서브 정보 (주소 등) | 14px | normal |
| 라벨/캡션 | 13px | semibold |
| 칩/태그 텍스트 | 12px | medium |
| 탭바 라벨 | 10px | bold(활성) / medium(비활성) |

#### 금액 표시 패턴
```
<가격유형 13px 블루> <금액 22~32px 볼드 흰색> <"만원" 13~16px 회색>
```
- 리스트 카드: 금액 20px
- 디테일 히어로: 금액 32px (압도적으로 크게)

### 컴포넌트 패턴

#### 버튼
```
높이: 52~54px
모서리: rounded-2xl (16px)
기본: bg-[#3182f6] text-white
비활성: bg-[#4e5968] text-white
터치: scale(0.97), opacity 0.85
```

#### 입력 필드
```
높이: 52px
배경: bg-[#2c2c35]
모서리: rounded-2xl
포커스: border-2 border-[#3182f6]
플레이스홀더: text-[#4e5968]
```

#### 태그/칩
```
일반 정보: text-[#8b95a1] bg-[#2c2c35]
카테고리 태그: text-[#3182f6] bg-[#1a3a5c]
풀옵션: text-[#00b76a] bg-[#0d2e20]
모서리: rounded-md
패딩: px-2.5 py-1
폰트: text-[12px] font-medium
```

#### 리스트 아이템
```
패딩: px-5 py-5
터치 피드백: toss-press (scale 0.97, bg-[#2c2c35])
구분선: border-b border-[#2c2c35]
```

#### 섹션 디바이더
```css
height: 8px;
background: #111115;
/* 카드 대신 이것으로 섹션 구분 */
```

#### 별점
```
활성: fill #ffb800, stroke #ffb800
비활성: fill none, stroke #4e5968
```

#### 탭바
```
배경: bg-[#17171c]
상단 선: 1px #2c2c35
활성 아이콘: 흰색 filled
비활성 아이콘: #4e5968 outlined
활성 라벨: 흰색 bold
비활성 라벨: #4e5968 medium
```

### 인터랙션

#### 터치 피드백 (toss-press)
```css
transition: transform 0.12s cubic-bezier(0.2, 0, 0, 1);
active: scale(0.97), bg-[#2c2c35];
```

#### 버튼 피드백 (toss-btn)
```css
active: scale(0.97), opacity 0.85;
```

#### 애니메이션
```css
/* 페이드 인 */
fadeIn: opacity 0→1, translateY 6px→0, 0.25s ease-out

/* 리스트 stagger */
각 아이템 0.03s 간격으로 순차 fadeIn
```

### 레이아웃

#### 전체 구조
```
┌─ Header (56px, sticky, bg #17171c) ─┐
│  좌: 제목 20px bold                   │
│  우: 유저명 + 로그아웃 버튼            │
├─────────────────────────────────────────┤
│  Main content                          │
│  좌우 패딩: px-5 (20px)               │
│  하단 패딩: pb-[88px]                  │
├─────────────────────────────────────────┤
│  TabBar (56px, fixed bottom)           │
│  + safe-area-inset-bottom              │
└─────────────────────────────────────────┘
```

#### 상태바
```html
<meta name="theme-color" content="#17171c" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="color-scheme" content="dark" />
```

### 빈 상태 패턴
```
큰 이모지 (48px) + 볼드 제목 (20px) + 보조 텍스트 (14px) + CTA 버튼
세로 중앙 정렬, min-h-[65vh]
```

### 로딩 패턴
```
스켈레톤: linear-gradient(#212127 → #2c2c35 → #212127) shimmer
스피너: border-2 border-[#2c2c35] border-t-[#3182f6] rounded-full animate-spin
```
