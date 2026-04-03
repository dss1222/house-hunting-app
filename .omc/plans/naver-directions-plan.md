# Plan: 카카오 지도 길찾기 링크 버튼

## Source Spec
`.omc/specs/deep-interview-naver-directions.md` (목적지 변경: 네이버 → 카카오 지도)

## Requirements Summary
PropertyDetail 페이지의 주소 바로 아래에 카카오 지도 길찾기 링크 버튼 2개를 추가한다. 각 버튼은 매물 주소에서 하드코딩된 목적지(여의도동 10, 서울 강남구 논현로72길 13)까지의 대중교통 길찾기를 카카오 지도 앱/웹에서 보여준다.

## RALPLAN-DR Summary

### Principles
1. **Minimal change**: PropertyDetail.tsx + constants.ts만 수정
2. **No API dependency**: 카카오 지도 URL 스킴/링크만 사용 (추가 API 키 불필요)
3. **일관성**: 앱이 이미 Kakao Maps를 사용 중이므로 길찾기도 카카오로 통일
4. **Progressive enhancement**: 기존 UI에 영향 없는 additive 변경

### Decision Drivers
1. **앱 일관성** — 이미 Kakao Maps 사용 중 (useKakaoMap.ts, MapView.tsx)
2. **구현 속도** — URL 기반 링크만으로 빠르게 구현
3. **모바일 UX** — kakaomap:// 앱 스킴으로 네이티브 앱 직접 실행 가능

### Viable Options

**Option A (Recommended): kakaomap:// 앱 스킴 + 웹 폴백**
- Approach: `kakaomap://route?sp={slat},{slng}&ep={dlat},{dlng}&by=PUBLICTRANSIT` 우선 시도, 앱 미설치 시 `https://map.kakao.com/link/to/{name},{lat},{lng}` 웹 폴백
- Pros: 모바일에서 네이티브 앱 실행, 대중교통 모드 직접 지정 가능
- Cons: 폴백 로직 필요 (timeout 기반), 웹 폴백은 목적지만 표시 (경로 미표시)

**Option B: 웹 URL만 사용**
- Approach: `https://map.kakao.com/link/to/{name},{lat},{lng}` 웹 링크만
- Pros: 단순, 모든 환경에서 동작
- Cons: 대중교통 모드 직접 지정 불가, 경로가 아닌 목적지만 표시됨

**Invalidation rationale for Option B**: 카카오 지도 웹 링크 `/link/to/`는 목적지 위치만 보여주고 출발지 지정이 불가능하며, 대중교통 경로를 직접 보여주지 않음. 사용자가 수동으로 "길찾기" 버튼을 눌러야 하므로 UX 목표 미달.

**최종 선택: Option A** — kakaomap:// 앱 스킴을 우선 사용하되, 데스크톱/앱 미설치 환경을 위해 웹 폴백 제공. 폴백은 단순 timeout 방식이 아니라, 모바일 여부를 먼저 감지하여 분기.

## Acceptance Criteria
- [ ] PropertyDetail 페이지에서 주소 아래에 "🚌 여의도 길찾기" 버튼이 표시된다
- [ ] PropertyDetail 페이지에서 주소 아래에 "🚌 논현 길찾기" 버튼이 표시된다
- [ ] 모바일(카카오맵 앱 설치): 버튼 클릭 시 카카오맵 앱이 열리며 대중교통 길찾기가 표시된다
- [ ] 모바일(카카오맵 앱 미설치): 1.5초 후 카카오 지도 웹으로 자동 폴백한다
- [ ] 데스크톱: 카카오 지도 웹에서 목적지 위치가 표시된다 (경로는 사용자가 수동 클릭)
- [ ] 출발지는 해당 매물의 좌표(lat/lng)로 설정된다 (앱 스킴에서만)
- [ ] 좌표가 없는 매물에서는 버튼이 표시되지 않는다
- [ ] 도착지는 각각 여의도동 10 / 논현로72길 13의 좌표로 설정된다
- [ ] 기존 PropertyDetail UI가 깨지지 않는다

## Implementation Steps

### Step 1: `src/lib/constants.ts`에 목적지 상수 추가 (line 32 이후)

```typescript
export const COMMUTE_DESTINATIONS = [
  { name: '여의도', address: '여의도동 10', lat: 37.5219, lng: 126.9245 },
  { name: '논현', address: '서울 강남구 논현로72길 13', lat: 37.5110, lng: 127.0295 },
] as const
```

**File**: `src/lib/constants.ts:32` (파일 끝에 추가)
**Rationale**: 기존 상수 패턴(`as const`)과 일치. 추후 목적지 변경 시 이 파일만 수정.

### Step 2: `src/components/property/PropertyDetail.tsx`에 길찾기 버튼 추가

**2a. Import 추가** (line 8 이후):
```typescript
import { COMMUTE_DESTINATIONS } from '../../lib/constants'
```

**2b. URL 생성 헬퍼 함수** (component 내부, line 57 이후):
```typescript
const openDirections = (dest: typeof COMMUTE_DESTINATIONS[number]) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  // 카카오 지도 웹 URL (목적지 표시 — 경로는 사용자가 수동 클릭)
  const webUrl = `https://map.kakao.com/link/to/${encodeURIComponent(dest.name)},${dest.lat},${dest.lng}`
  
  if (isMobile && property.latitude && property.longitude) {
    // 카카오맵 앱 스킴: 대중교통 길찾기
    // NOTE: 앱 스킴 포맷은 실기기에서 검증 필요. sp=lat,lng 또는 별도 파라미터일 수 있음
    window.location.href = `kakaomap://route?sp=${property.latitude},${property.longitude}&ep=${dest.lat},${dest.lng}&by=PUBLICTRANSIT`
    // 앱 미설치 시 1.5초 후 웹 폴백
    setTimeout(() => {
      window.open(webUrl, '_blank', 'noopener,noreferrer')
    }, 1500)
  } else {
    // 데스크톱: 카카오 지도 웹
    window.open(webUrl, '_blank', 'noopener,noreferrer')
  }
}
```

**2c. 버튼 JSX** — `PropertyDetail.tsx:92` (주소 `<p>` 태그) 바로 아래, Price 섹션 위에 삽입:
```tsx
{/* 길찾기 버튼 */}
{property.latitude && property.longitude && (
  <div className="flex gap-2 mt-3 mb-6">
    {COMMUTE_DESTINATIONS.map((dest) => (
      <button
        key={dest.name}
        onClick={() => openDirections(dest)}
        className="text-[13px] text-[#3182f6] bg-[#e8f3ff] px-3 py-1.5 rounded-lg font-medium active:opacity-50 transition-opacity"
      >
        🚌 {dest.name} 길찾기
      </button>
    ))}
  </div>
)}
```

**File**: `src/components/property/PropertyDetail.tsx:92-93` (address와 price 사이)
**Rationale**: 
- 버튼 스타일은 기존 태그 스타일(`line 112`: `text-[13px] text-[#3182f6] bg-[#e8f3ff]`)과 동일하게 통일
- `property.latitude && property.longitude` 조건으로 좌표 없는 매물은 버튼 숨김
- 주소의 `mb-6`을 제거하고 버튼 div에 `mb-6`을 이동하여 간격 유지

### Step 3: 주소 마진 조정

기존 주소 `<p>` 태그의 `mb-6`을 제거 (버튼이 있을 때는 버튼 div가 마진 담당):
- 좌표 있을 때: address → `mt-3` gap → buttons (`mb-6`) → price
- 좌표 없을 때: address (`mb-6`) → price

```tsx
// Before:
<p className="text-[14px] text-text-secondary mb-6">{property.address}</p>

// After:
<p className={`text-[14px] text-text-secondary ${property.latitude && property.longitude ? '' : 'mb-6'}`}>{property.address}</p>
```

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 카카오맵 앱 미설치 시 모바일에서 오류 | Medium | setTimeout 1.5초 후 웹 URL 폴백. 앱이 열리면 타이머가 페이지 비활성으로 무시됨 |
| kakaomap:// URL 포맷 불확실 | Medium | 구현 시 실기기에서 경험적 검증 필수. sp 파라미터의 lat,lng 순서와 구분자 확인 |
| 하드코딩된 목적지 좌표 부정확 | Low | Google Maps에서 좌표 교차 검증 후 적용. 추후 설정 기능으로 대체 가능 |
| `navigator.userAgent` 모바일 감지 부정확 | Low | 태블릿 등 경계 케이스에서 웹 폴백이 동작하므로 최악의 경우에도 기능은 동작 |

## Verification Steps
1. PropertyDetail 페이지에서 버튼 2개가 주소 아래에 표시되는지 확인
2. 좌표가 있는 매물에서 버튼이 보이는지 확인
3. 좌표가 없는 매물에서 버튼이 숨겨지는지 확인
4. 모바일에서 버튼 클릭 시 카카오맵 앱이 열리는지 확인
5. 데스크톱에서 버튼 클릭 시 카카오 지도 웹이 새 탭으로 열리는지 확인
6. 기존 UI (가격, 평점, 태그 등)가 정상 표시되는지 확인

## ADR

### Decision
카카오 지도 앱 스킴(`kakaomap://route`) + 웹 폴백(`map.kakao.com/link/to/`)으로 길찾기 링크를 구현한다.

### Drivers
- 앱이 이미 Kakao Maps를 사용 중 (일관성)
- 사용자가 카카오 지도를 선택
- API 키 없이 URL 스킴만으로 구현 가능

### Alternatives Considered
1. **네이버 지도**: 대중교통 길찾기가 강점이나, 앱과의 일관성 떨어짐
2. **앱 내 지도 임베드**: 복잡도 높고 API 키 필요. 이번 버전 제외
3. **소요시간 표시**: Directions API 필요. 추후 구현

### Why Chosen
카카오 지도가 앱의 기존 지도 서비스와 일관되고, URL 스킴으로 대중교통 모드를 직접 지정할 수 있으며, 모바일에서 네이티브 앱 실행이 가능하여 UX가 우수.

### Consequences
- 대중교통 소요시간을 앱 내에서 직접 확인할 수 없음 (카카오 앱/웹에서 확인)
- 좌표 없는 매물에서는 길찾기 기능 사용 불가
- 추후 목적지 설정 기능 추가 시 constants.ts → DB 마이그레이션 필요

### Follow-ups
- 목적지 좌표 정확도 검증 (여의도동 10, 논현로72길 13)
- 추후: 사용자 목적지 설정 기능
- 추후: 소요시간 표시 (Kakao Mobility API)

## Critic Review Changelog
- [Fix] 앱 미설치 모바일 폴백: setTimeout 1.5초 후 웹 URL로 폴백하는 패턴 추가
- [Fix] 수락 기준 업데이트: 데스크톱은 목적지만 표시(경로는 수동 클릭)임을 명시
- [Fix] kakaomap:// URL 포맷 미검증 리스크 추가, 코드 코멘트에 검증 필요 명시
- [Fix] encodeURIComponent 적용 위치 코드에 명시 (dest.name in webUrl)
