# 시간의 봉투 (Timefold) 인프라 구조

## 현재 인프라 구성 (MVP)

### 프론트엔드
- **기술 스택**: 순수 HTML/CSS/JavaScript
- **암호화**: CryptoJS 라이브러리 (클라이언트 측 AES 암호화)
- **공유 메커니즘**: URL 파라미터 기반 (Base64 인코딩)
- **데이터 저장**: 
  - 메인 데이터: URL 파라미터 내 암호화된 형태로 저장
  - 참조 메타데이터: 사용자 LocalStorage

### 호스팅 
- **플랫폼**: Cloudflare Pages
- **배포 방식**: Wrangler CLI 기반 직접 배포
- **웹 서버**: Cloudflare CDN
- **프로젝트 URL**: https://timefold-7i7.pages.dev/
- **도메인**: timefold.yetimates.com 

### 배포 상태
- **배포 방법**: `npx wrangler pages deploy public --project-name timefold`
- **프로젝트 생성**: `npx wrangler pages project create timefold --production-branch main`
- **최근 배포**: 성공 (Cloudflare Pages 배포 내역 확인)
- **Node.js 버전**: v18 (.nvmrc로 지정)

### 보안 구조
- **E2E 암호화**: 클라이언트에서 생성된 무작위 키로 암호화
- **서버 지식 없음**: 서버는 암호화된 데이터만 전달, 내용 알 수 없음
- **시간 잠금**: 클라이언트 측 JavaScript 타임스탬프 검증

### 확장성 고려사항
- **스토리지 한계**: URL 길이 제한으로 텍스트만 지원 (현재)
- **영구 저장 부재**: 공유 링크 유실 시 데이터 복구 불가능
- **서버리스 아키텍처**: 초기 사용자에 적합한 확장 가능한 구조

## 향후 계획된 인프라 확장

### Cloudflare 통합 서비스
- **R2 Storage**: 대용량 미디어 파일 저장 (이미지, 음성, 영상)
- **Workers**: 서버리스 API 엔드포인트 구현
- **KV/D1**: 메타데이터 및 사용자 정보 저장
- **Durable Objects**: 상태 저장 기능 (알림 시스템 등)

### 보안 강화
- **Workers 기반 시간 검증**: 클라이언트 시간 조작 방지
- **암호화 키 백업 메커니즘**: 안전한 키 복구 옵션
- **액세스 제어**: 추가 인증 메커니즘

### 모니터링 및 분석
- **Cloudflare Analytics**: 기본 사용 통계
- **사용자 동의 기반 익명 통계**: 서비스 개선용
