# 검증 기록

2026-10-18 (Asia/Seoul)

- Next.js 프로덕션 빌드: 성공 (최종 정적 빌드 결과는 배포 기록 참조)
- Next.js / NestJS TypeScript 검사: 통과
- pnpm install --frozen-lockfile: 통과
- pnpm audit --prod: 알려진 취약점 없음
- 실제 MongoDB/NestJS HTTP 통합 테스트: 18개 통과
- 브라우저: 펼침 메뉴, 검색, 학습 분야 탭, 상세 페이지 이동 확인
- 브라우저: 실제 로그인, 프로젝트 생성, 상태 변경, 새로고침 후 유지, 로그아웃 확인
- 390px iframe으로 모바일 레이아웃 확인

## 통합 테스트 상세

- PASS unauthenticated project access rejected
- PASS registration and HttpOnly session
- PASS duplicate username rejected
- PASS incorrect password rejected
- PASS NoSQL operator injection rejected
- PASS empty project title rejected
- PASS client-supplied ownership rejected
- PASS authenticated project creation
- PASS cross-account list/update/delete blocked
- PASS owner can update project status
- PASS invalid status rejected
- PASS cross-origin mutation blocked
- PASS passwords and session tokens stored as hashes
- PASS expired sessions denied immediately
- PASS project persists after re-login
- PASS owner can delete own project
- PASS logout invalidates server-side session
- PASS login rate limit enforced
- ALL 18 INTEGRATION CHECKS PASSED

## 검증 범위

Docker 실행, 실제 도메인의 TLS, 운영 MongoDB 연결, 대규모 부하, 모든 보조기기/브라우저 조합은 검증하지 않았습니다. 온라인 Sites 미리보기는 정적 홍보 화면이며 인증 백엔드는 별도 배포가 필요합니다.

최종 정적 프로덕션 빌드 성공: 소개 상세 16개, 홈, CampusLife, 개인정보 안내, 404 포함. 이미지 생성/외부 영상 의존 없이 SVG 입자 그래픽을 서버 렌더링하고 CSS로 애니메이션합니다.
