# Timefold 사용자 지표 설계 문서

Timefold의 활성도 측정, 전환 흐름 분석, 수익화 기반 마련을 위해  
다음과 같은 사용자 지표를 수집합니다.  
모든 지표는 DB 기반 이벤트 로그로 적재되며, 익명 식별자 기반 추적 방식을 사용합니다.

## 지표 분류

### 1. 유입 및 전환 지표

| 이벤트 | 설명 |
|--------|------|
| `landing_page_visit` | 방문 경로, 유입 채널 분석 (referer, device) |
| `envelope_create_started` | 봉투 작성 시작 시점 |
| `envelope_create_completed` | 봉투 생성 완료 → 생성률 분석 |
| `timewind_share_clicked` | TimeWind 공유 버튼 클릭 여부 |

### 2. 봉투 생성 지표

| 이벤트 | 설명 |
|--------|------|
| `envelope_created` | 봉투 생성 정보 기록 (unlock_at, password_enabled 등) |
| `envelope_reason_selected` | 사용자가 선택한 “기다릴 이유” |
| `envelope_for_target` | 대상 지정 정보 (me/friend/anonymous) |
| `envelope_delivery_method` | 공유 방식 (link, sms, timewind 등) |

### 3. 열람 및 열쇠 사용 지표

| 이벤트 | 설명 |
|--------|------|
| `envelope_open_attempt` | 열람 시도 로그 (성공 여부, 실패 사유 포함) |
| `envelope_open_success` | 실제 열람 성공 로그 |
| `key_acquired` | 열쇠 획득 로그 (획득 이유: share, bonus, purchase 등) |
| `key_used` | 열쇠 사용 로그 (대상 봉투, 사용자 등) |

### 4. 사용자 참여 흐름 지표

| 이벤트 | 설명 |
|--------|------|
| `return_visit` | 반복 방문 여부 |
| `envelope_reopened` | 본인 봉투 재열람 여부 |
| `envelope_deleted_before_unlock` | 열람 전에 삭제된 봉투 (UX 개선 단서) |

## 추천 테이블 구조

### `log_envelope_events`

| 필드명 | 설명 |
|--------|------|
| `id` | PK |
| `envelope_id` | FK |
| `event_type` | enum: `created`, `reason_selected`, `open_attempt`, `open_success`, `reopened`, `deleted` |
| `user_token` | 익명 사용자 식별자 |
| `timestamp` | 이벤트 발생 시각 |
| `metadata` | JSON 확장 필드 |

### `log_key_events`

| 필드명 | 설명 |
|--------|------|
| `id` | PK |
| `key_id` | FK |
| `event_type` | `acquired`, `used` |
| `envelope_id` | 열쇠 사용 대상 봉투 |
| `user_token` | 익명 사용자 식별자 |
| `timestamp` | 발생 시각 |
| `source` | `share`, `purchase`, `bonus` 등 |

### `log_page_events`

| 필드명 | 설명 |
|--------|------|
| `id` | PK |
| `user_token` | 익명 사용자 식별자 |
| `event_type` | `landing`, `create_start`, `create_end`, `share_click` |
| `timestamp` | 발생 시각 |
| `referer` | 유입 채널 |
| `device` | 사용자 디바이스 정보 |

## 분석 가능한 지표 예시

| 인사이트 | 활용 지표 |
|----------|-----------|
| 봉투 생성 → 열람 전환율 | `envelope_created` vs `envelope_open_success` |
| 열쇠 사용 흐름 | `key_acquired` vs `key_used` |
| 열람 실패 원인 분석 | `fail_reason` 필터링 |
| 반복 사용자 비율 | `return_visit` 유무 |
| TimeWind 공유 사용률 | `delivery_method = timewind` 비율 |

## 구현 순서 제안

1. `log_envelope_events`, `log_key_events` 테이블 우선 구축  
2. 서비스단에서 주요 이벤트 발생 시점에 로그 삽입  
3. 추후 Metabase, Superset 등 시각화 툴 연동
