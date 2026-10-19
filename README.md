# smartkopo — 스마트소프트웨어과 홍보 사이트

한국폴리텍대학 대전캠퍼스 스마트소프트웨어과를 소개하는 독립적인 리디자인 프로젝트입니다. 공식 학사 시스템이나 다른 프로젝트의 데이터베이스를 수정하지 않습니다.

디자인·개발 NaMee

## 구성

- Frontend: Next.js 16 App Router, React 19, TypeScript
- Backend: NestJS 12, 입력 검증, 요청 제한, 보안 헤더
- Database: MongoDB, Mongoose 9
- 디자인: AI·Web·Cloud·Computer 인터랙티브 히어로, 기술별 화면 전환, 반응형 화면, 모션 줄이기 및 일시정지
- 메뉴: 대학소개 / 학과소개 / 차별화된 우수성 / News / CampusLife / 입학안내
- 각 메뉴의 펼침 하위 링크, 16개 소개 상세 페이지, 검색, 교육 분야 탭
- CampusLife: 회원가입, ID/비밀번호 로그인, 서버 세션, 개인 프로젝트 생성/조회/상태 변경/삭제

## 이 PC에서 바로 실행

설치된 작업 폴더에서 Start-KOPO.cmd를 더블클릭한 뒤 http://127.0.0.1:3100/ 을 여세요. 현재 PC의 Codex 내장 Node.js도 자동으로 찾습니다. 실행 창은 유지하고 종료 시 Ctrl+C를 누르세요.

온라인 홍보 미리보기: https://kopo-code-your-next.indigobread2049.chatgpt.site

## 빠른 실행

Node.js 24와 pnpm 11.25.0을 사용합니다.

~~~sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
~~~

브라우저에서 http://127.0.0.1:3100/ 을 여세요. API는 127.0.0.1:4100, 개발 전용 MongoDB는 127.0.0.1:37017을 사용합니다. 포트 충돌 시 기존 서버를 종료하지 말고 scripts/dev.mjs의 포트와 허용 Origin을 함께 바꾸세요.

첫 실행에서는 mongodb-memory-server가 MongoDB 공식 배포 서버에서 로컬 실행 바이너리를 내려받습니다(Windows 패키지 약 600MB). 개발 데이터는 .local/db에 저장되고 종료 후에도 유지됩니다. 이름과 달리 실제 mongod 프로세스이며 본 프로젝트에서는 WiredTiger 디스크 저장을 사용합니다. 개발 DB는 인증 없이 루프백에만 바인딩되므로 인터넷에 노출하지 마세요. 이미 MongoDB가 있다면 MONGODB_URI 환경 변수로 별도 데이터베이스를 지정할 수 있습니다.

CampusLife에서 새로운 프로젝트 계정을 만드세요. 아이디: 영문 소문자/숫자/밑줄 4–32자, 비밀번호: 12–128자. 공식 대학 계정과 별개이며 기본 관리자나 공용 비밀번호를 만들지 않았습니다. 개발 서버를 중단하려면 실행한 터미널에서 Ctrl+C를 누르세요.

## 검증

~~~sh
pnpm typecheck
pnpm build
pnpm test
~~~

테스트는 별도의 임시 MongoDB와 4101 포트를 사용하며 개발 DB와 분리됩니다. test 이전에 API를 build해야 합니다. 실제 HTTP 요청으로 비밀번호 검증, 중복 ID, 입력 검증, 세션 만료/로그아웃, 사용자별 데이터 격리, CSRF Origin 검사와 로그인 요청 제한을 확인합니다. 세부 결과는 docs/VERIFICATION.md에 기록했습니다.

## 디렉터리

~~~text
apps/web/app/                 Next.js 페이지와 전역 스타일
apps/web/components/         헤더, 검색, 푸터, 기술별 히어로와 미디어
apps/web/lib/content.ts       대학 소개, 하위 메뉴, 교육 로드맵 콘텐츠
apps/web/lib/api.ts           인증을 포함한 API 클라이언트
apps/api/src/main.ts          NestJS 컨트롤러, 세션 가드, DTO, 서버 설정
apps/api/src/store.ts         MongoDB 컬렉션과 인덱스
scripts/dev.mjs              개발 환경 통합 실행
scripts/test-api.mjs         실제 MongoDB 기반 통합 테스트
scripts/export-site.mjs      온라인 홍보 미리보기용 정적 내보내기
~~~

## 관리자 계정

API 빌드 후 `node scripts/create-admin.cjs`를 실행하면 `.env`의 `MONGODB_URI`에 관리자 `admin` 계정을 생성합니다. 임의로 생성한 비밀번호는 Git에서 제외된 `.local/admin-account.json`에 저장합니다. 기존 동명 계정을 승격하거나 비밀번호를 덮어쓰지 않습니다.

CampusLife에서 관리자 계정으로 로그인한 뒤 **관리자 화면 · 사용자 관리**를 선택하세요. `/campuslife/admin/`에서 사용자 목록, 권한, 가입일과 사용자·프로젝트 수를 조회할 수 있습니다. 일반 가입자는 `user` 권한이며, 기존에 권한 필드가 없는 사용자도 일반 사용자로 처리합니다. 관리자 API는 매 요청마다 서버에서 세션과 현재 권한을 검사합니다.

## 인증 구조

비밀번호는 매번 다른 16바이트 salt와 scrypt 64바이트 해시로 저장합니다. 세션 토큰은 암호학적 난수 32바이트이며 DB에는 SHA-256 해시만 저장합니다. HttpOnly/SameSite=Strict 쿠키를 사용하고 운영 환경에서는 Secure를 추가합니다. 만료 8시간, 로그아웃 시 서버에서 폐기합니다. TTL 정리와 별도로 각 요청에서 만료 시각을 검사합니다. 모든 프로젝트 조회/수정/삭제는 서버가 인증한 ownerId로 제한하며 클라이언트가 보내는 소유자 값은 허용하지 않습니다.

변경 요청에는 허용된 Origin이 필요합니다. 프런트엔드는 /api를 NestJS로 프록시하므로 같은 출처의 쿠키로 동작합니다. NEXT_PUBLIC_API_URL은 별도 API 원점을 사용할 때만 지정하며, SameSite=Strict 쿠키 조건 때문에 같은 사이트의 HTTPS 구성 또는 동일 출처 리버스 프록시를 권장합니다.

## 운영 배포

전체 기능은 Node.js 서버와 MongoDB를 실행할 수 있는 환경에 배포해야 합니다. Dockerfile과 compose.yaml을 제공했습니다.

1. .env.example을 .env로 복사하고 MONGO_USER, 강력한 URL-safe MONGO_PASSWORD, 실제 HTTPS FRONTEND_ORIGINS를 설정합니다. .env는 Git에서 제외됩니다.
2. docker compose up --build -d
3. TLS 리버스 프록시에서 웹 서버 127.0.0.1:3100으로 연결합니다. MongoDB와 API는 호스트에 공개하지 않습니다.
4. 실제 운영 주체/개인정보 연락처/보관·탈퇴 정책을 확정하고 개인정보 안내를 갱신합니다. 백업, 비밀번호 복구, 운영 모니터링, 다중 서버용 공유 요청 제한은 별도 운영 요구사항입니다.

Docker 구성은 제공했으나 이 Windows 환경에서 Docker 실행 검증은 하지 않았습니다. HTTPS 없이 production 쿠키로 로그인할 수 없습니다. 프록시 뒤의 IP 기반 제한은 배포 환경의 신뢰 프록시 설정과 함께 검토해야 합니다.

## 온라인 미리보기

~~~sh
pnpm export:site
~~~

Next.js 정적 결과물을 out/으로 생성합니다. Sites 호스팅은 Worker 기반이며 일반 NestJS 서버와 MongoDB TCP 연결을 직접 실행할 수 없어 **온라인 미리보기는 홍보 화면과 로그인 UI만 제공합니다**. 서버 미연결 안내를 표시하고 가입·로그인 제출을 비활성화하므로 가짜 인증으로 성공 처리하지 않습니다. 실제 개인 공간은 위 전체 프로젝트 실행 또는 별도 서버 배포로 사용합니다.

## 콘텐츠와 참고 출처

- https://www.kopo.ac.kr/index.do#sec1 — 대학 정보 구조와 실무 교육 방향
- https://www.korea.ac.kr/sites/ko/index.do — 전체 화면 미디어 인트로의 시각적 구성 참고
- https://www.kopo.ac.kr/daejeon/content.do?menu=8075 — 스마트소프트웨어과 공식 교육과정 위치와 과정 분류 참고

사용자가 제공한 로고 이미지를 헤더와 푸터에 사용합니다. 학교 사이트의 사진·영상은 복제하지 않았으며 나머지 그래픽과 카피는 본 프로젝트를 위해 구성했습니다. 제안형 풀스택 로드맵/프로젝트 예시/에디토리얼은 공식 교과 편성이나 실제 학생 성과로 표시하지 않았습니다. 모집·지원 자격은 공식 사이트로 연결하고 임의의 취업률/수상 실적/모집 일정을 넣지 않았습니다.

외부 글꼴은 Google Fonts의 Manrope와 Noto Sans KR을 사용하며 로딩 실패 시 시스템 sans-serif로 표시합니다. 검색 엔진 색인은 콘셉트 사이트라 기본 비활성화되어 있습니다.
