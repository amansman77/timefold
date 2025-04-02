-- 봉투 정보 테이블
CREATE TABLE IF NOT EXISTS envelopes (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,  -- Unix timestamp
    unlock_at INTEGER NOT NULL,   -- Unix timestamp
    password_protected INTEGER NOT NULL DEFAULT 0,
    encrypted_message TEXT NOT NULL,
    created_by TEXT NOT NULL,  -- 익명 사용자 식별자
    version TEXT NOT NULL DEFAULT '1.0'
);

-- 이벤트 로그 테이블
CREATE TABLE IF NOT EXISTS log_envelope_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    envelope_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    user_token TEXT NOT NULL,
    timestamp INTEGER NOT NULL,  -- Unix timestamp
    metadata TEXT,
    FOREIGN KEY (envelope_id) REFERENCES envelopes(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_envelopes_unlock_at ON envelopes(unlock_at);
CREATE INDEX IF NOT EXISTS idx_envelopes_created_by ON envelopes(created_by);
CREATE INDEX IF NOT EXISTS idx_log_events_envelope_id ON log_envelope_events(envelope_id);
CREATE INDEX IF NOT EXISTS idx_log_events_timestamp ON log_envelope_events(timestamp); 