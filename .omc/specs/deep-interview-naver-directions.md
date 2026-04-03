# Deep Interview Spec: 네이버 지도 길찾기 링크 버튼

## Metadata
- Interview ID: di-naver-directions-001
- Rounds: 6
- Final Ambiguity Score: 10%
- Type: brownfield
- Generated: 2026-04-03
- Threshold: 20%
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.95 | 0.35 | 0.333 |
| Constraint Clarity | 0.90 | 0.25 | 0.225 |
| Success Criteria | 0.85 | 0.25 | 0.213 |
| Context Clarity | 0.85 | 0.15 | 0.128 |
| **Total Clarity** | | | **0.898** |
| **Ambiguity** | | | **0.102** |

## Goal
PropertyDetail 페이지의 주소 바로 아래에 네이버 지도 길찾기 링크 버튼 2개를 추가한다. 각 버튼은 매물 주소에서 하드코딩된 목적지(여의도동 10, 서울 강남구 논현로72길 13)까지의 대중교통 길찾기를 네이버 지도 앱/웹에서 바로 보여준다.

## Constraints
- API 키 불필요: 네이버 지도 URL 스킴만 사용 (외부 링크)
- 목적지 하드코딩: 여의도동 10, 서울 강남구 논현로72길 13 (추후 설정 기능 추가 가능)
- 교통수단: 대중교통 기준
- 출발지: 매물의 address (또는 latitude/longitude 좌표)
- 표시 위치: PropertyDetail 페이지의 주소 바로 아래
- 소요시간/거리 표시 없음: 링크만 제공, 클릭 시 네이버 지도에서 확인

## Non-Goals
- 앱 내 지도 임베드 (이번 버전에서는 제외)
- 소요시간/거리 실시간 표시 (Naver Directions API 필요, 이번 버전 제외)
- 사용자 목적지 설정/변경 기능 (추후 구현)
- 자동차/도보 등 다른 교통수단 지원

## Acceptance Criteria
- [ ] PropertyDetail 페이지에서 주소 아래에 "🚌 여의도 길찾기" 버튼이 표시된다
- [ ] PropertyDetail 페이지에서 주소 아래에 "🚌 논현 길찾기" 버튼이 표시된다
- [ ] 버튼 클릭 시 네이버 지도 길찾기 페이지가 새 탭/앱으로 열린다
- [ ] 출발지는 해당 매물의 주소로 설정된다
- [ ] 도착지는 각각 여의도동 10 / 논현로72길 13으로 설정된다
- [ ] 대중교통 모드로 길찾기가 열린다
- [ ] 좌표(latitude/longitude)가 없는 매물에서도 주소 기반으로 동작한다

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| 네이버 지도 임베드 필요 | 링크만으로도 충분한가? | 링크만으로 충분 — API 키 없이 구현 가능 |
| 목적지를 사용자가 설정 가능해야 함 | 하드코딩으로 시작하면 안 되나? | 하드코딩 먼저, 설정은 나중에 |
| 소요시간을 앱 내에서 보여줘야 함 | 네이버 지도에서 확인하면 안 되나? | 네이버 지도에서 확인으로 충분 |

## Technical Context
- **수정 대상 파일**: `src/components/property/PropertyDetail.tsx`
- **네이버 지도 길찾기 URL**: `https://map.naver.com/v5/directions/-/-/-/transit?c=...` 또는 `nmap://route/public-transit?slat=...&slng=...&sname=...&dlat=...&dlng=...&dname=...` (앱 스킴)
- **매물 데이터**: `address`, `latitude`, `longitude` 필드 사용 가능
- **기존 지도**: Kakao Maps 사용 중 (별도 기능, 영향 없음)
- **하드코딩 목적지 좌표**: 여의도동 10 (위도/경도 조회 필요), 논현로72길 13 (위도/경도 조회 필요)

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| 매물(Property) | core domain | address, latitude, longitude | 길찾기의 출발지 |
| 목적지(Destination) | supporting | name, address, latitude, longitude | 길찾기의 도착지 (하드코딩) |
| 가는길(Directions) | core feature | 출발지, 도착지, 교통수단, URL | Property → Destination 경로 |
| 교통수단(TransportMode) | supporting | type=대중교통 | Directions의 모드 |

## Ontology Convergence

| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 3 | 3 | - | - | N/A |
| 2 | 4 | 1 | 0 | 3 | 75% |
| 3 | 5 | 1 | 0 | 4 | 80% |
| 4 | 4 | 0 | 0 | 4 | 100% (DestinationSettings removed) |
| 5 | 4 | 0 | 0 | 4 | 100% |
| 6 | 4 | 0 | 0 | 4 | 100% |

## Interview Transcript
<details>
<summary>Full Q&A (6 rounds)</summary>

### Round 1
**Q:** 네이버 지도 '가는길'을 어떤 방식으로 보여주고 싶으세요? 앱 내 임베드 vs 외부 링크?
**A:** 둘 다
**Ambiguity:** 69% (Goal: 0.50, Constraints: 0.20, Criteria: 0.10, Context: 0.40)

### Round 2
**Q:** 앱 내 임베드 미리보기에서 구체적으로 무엇을 보여주고 싶으세요?
**A:** 소요시간/거리 + 링크
**Ambiguity:** 55% (Goal: 0.75, Constraints: 0.25, Criteria: 0.20, Context: 0.50)

### Round 3
**Q:** 목적지 하드코딩 vs 사용자 설정? 교통수단은?
**A:** 사용자 설정 가능, 대중교통
**Ambiguity:** 44% (Goal: 0.80, Constraints: 0.55, Criteria: 0.25, Context: 0.50)

### Round 4 (Contrarian Mode)
**Q:** 처음부터 사용자 설정이 필요한가? 하드코딩으로 시작하면?
**A:** 하드코딩 먼저, 설정은 나중에
**Ambiguity:** 34% (Goal: 0.85, Constraints: 0.70, Criteria: 0.40, Context: 0.60)

### Round 5
**Q:** PropertyDetail에서 길찾기 정보가 어디에 표시되면 좋겠어요?
**A:** 주소 바로 아래
**Ambiguity:** 24% (Goal: 0.90, Constraints: 0.75, Criteria: 0.60, Context: 0.75)

### Round 6 (Simplifier Mode)
**Q:** 소요시간을 앱에서 직접 보여줄까 (API 키 필요), 링크만 둘까?
**A:** 링크만
**Ambiguity:** 10% (Goal: 0.95, Constraints: 0.90, Criteria: 0.85, Context: 0.85)

</details>
