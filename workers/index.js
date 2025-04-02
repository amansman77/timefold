// API 엔드포인트 정의
const API_ENDPOINTS = {
  CREATE_ENVELOPE: '/api/envelopes',
  GET_ENVELOPE: '/api/envelopes/:id',
  LOG_EVENT: '/api/events'
};

// CORS 헤더 설정
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Token',
    'Access-Control-Max-Age': '86400',
};

// OPTIONS 요청 처리
async function handleOptions(request) {
    if (request.headers.get('Origin') !== null) {
        return new Response(null, {
            headers: corsHeaders
        });
    } else {
        return new Response(null, {
            headers: {
                Allow: 'GET, POST, OPTIONS',
            }
        });
    }
}

// 봉투 생성 API
async function handleCreateEnvelope(request, env) {
  const data = await request.json();
  const id = crypto.randomUUID();
  const now = Date.now();
  const unlockAt = new Date(data.unlockAt).getTime();
  
  // 봉투 데이터 저장
  await env.DB.prepare(`
    INSERT INTO envelopes (id, created_at, unlock_at, password_protected, encrypted_message, created_by, version)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    now,
    unlockAt,
    data.passwordProtected,
    data.encryptedMessage,
    data.userToken,
    '3.0'
  ).run();

  // 이벤트 로깅
  await env.DB.prepare(`
    INSERT INTO log_envelope_events (envelope_id, event_type, user_token, timestamp, metadata)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    id,
    'create',
    data.userToken,
    now,
    JSON.stringify({
      password_protected: data.passwordProtected,
      unlock_at: unlockAt
    })
  ).run();

  return new Response(JSON.stringify({ id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 봉투 조회 API
async function handleGetEnvelope(request, env) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  
  // 이벤트 로깅
  await env.DB.prepare(`
    INSERT INTO log_envelope_events (envelope_id, event_type, user_token, timestamp, metadata)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    id,
    'view',
    'anonymous',
    Date.now(),
    JSON.stringify({})
  ).run();

  // 봉투 정보 조회
  const envelope = await env.DB.prepare(`
    SELECT * FROM envelopes WHERE id = ?
  `).bind(id).first();

  if (!envelope) {
    return new Response(JSON.stringify({ error: 'Envelope not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify(envelope), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 이벤트 로깅 API
async function handleLogEvent(request, env) {
  const data = await request.json();
  
  await env.DB.prepare(`
    INSERT INTO log_envelope_events (envelope_id, event_type, user_token, timestamp, metadata)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    data.envelopeId,
    data.eventType,
    data.userToken,
    Date.now(),
    JSON.stringify(data.metadata || {})
  ).run();

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 메인 핸들러
export default {
  async fetch(request, env, ctx) {
    // CORS preflight 요청 처리
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    const url = new URL(request.url);
    
    // API 라우팅
    if (url.pathname.startsWith('/api/envelopes')) {
      if (request.method === 'POST') {
        return handleCreateEnvelope(request, env);
      } else if (request.method === 'GET') {
        return handleGetEnvelope(request, env);
      }
    } else if (url.pathname === '/api/events' && request.method === 'POST') {
      return handleLogEvent(request, env);
    }

    // 정적 파일 서빙 (기존 Pages 기능)
    return env.ASSETS.fetch(request);
  }
}; 