# ROADMAP: MigrateBoard 개발 로드맵

> 기준 문서: [`docs/PRD.md`](./PRD.md)
> 최종 갱신: 2026-11-18 · 브랜치: `feat/migration-kanban-board`

## 개요

MigrateBoard는 Notion 데이터베이스(`Migration Tasks`)를 CMS로 사용해 마이그레이션 진행 현황을 시각화하는 대시보드입니다.
이 로드맵은 **골격 → 공통 → 핵심 → 추가 → 최적화/배포** 순서로 개발하며, 각 단계는 앞 단계의 결과물 위에 쌓이도록 구성했습니다.

| 단계 | 내용 | 예상 소요 | 상태 |
| --- | --- | --- | --- |
| 1 | 프로젝트 초기 설정 (골격 구축) | 1시간 | ✅ 완료 |
| 2 | 공통 모듈/컴포넌트 개발 | 2시간 | 🟡 대부분 완료 |
| 3 | 핵심 기능 개발 (Notion 연동 · 진행률 · 칸반) | 3시간 | 🟡 진행중 (코드 완료, 실데이터 검증 남음) |
| 4 | 추가 기능 개발 (필터 · 빈 상태/에러) | 2시간 | 🟡 진행중 |
| 5 | 최적화 및 배포 | 2시간 | ⬜ 대기 |
| | **합계** | **약 10시간** | |

> PRD의 "약 30분"은 숙련자가 MVP 화면만 빠르게 구성하는 기준입니다. 이 로드맵은 테스트·에러 처리·배포 검증까지 포함한 현실적인 추정치입니다.

### 상태 표기

- ✅ 완료 · 🟡 진행중 · ⬜ 대기
- 체크박스 `[x]`는 현재 코드베이스에 이미 반영된 항목입니다.

---

## 1단계: 프로젝트 초기 설정 (골격 구축)

**예상 소요:** 1시간 · **상태:** ✅ 완료

### 왜 먼저 해야 하나요?

빌드·린트·테스트 환경과 폴더 구조가 정해지지 않은 상태에서 기능을 만들면, 나중에 설정을 바꿀 때 모든 코드를 다시 손봐야 합니다.
모든 이후 작업이 기대는 **토대**이므로 가장 먼저 고정합니다.

### 작업 목록

- [x] Next.js 15 (App Router) + TypeScript + React 19 프로젝트 생성
- [x] Tailwind CSS v4, shadcn/ui 초기화 (`components.json`)
- [x] ESLint, Prettier 설정
- [x] Vitest + Testing Library 테스트 환경 구성 (`vitest.config.mts`, `vitest.setup.ts`)
- [x] 핵심 의존성 설치: `@notionhq/client`, `zod`, `lucide-react`
- [x] 폴더 구조 확정
  ```
  src/
  ├── app/                  # 라우트 (page.tsx = 대시보드)
  ├── components/
  │   ├── layout/           # 헤더, 푸터, PageHeader 등 공통 레이아웃
  │   ├── migration/        # 대시보드 도메인 컴포넌트
  │   └── ui/               # shadcn/ui 컴포넌트
  ├── config/               # 사이트 설정
  ├── lib/migration/        # 데이터 조회, 통계 계산
  └── types/                # Zod 스키마 및 타입
  ```
- [x] GitHub Actions 배포 워크플로 골격 (`.github/workflows/deploy.yml`)
- [x] `.env.example` 추가 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`)
- [ ] 스타터 킷 예제 라우트 정리 (`/counter`, `/form`, `/dashboard` 및 관련 컴포넌트·스토어 제거 여부 결정)

### 완료 기준

- `npm run dev`, `npm run build`, `npm run lint`, `npm test`가 모두 오류 없이 실행된다.
- 폴더 구조와 경로 별칭(`@/*`)이 확정되어 이후 단계에서 변경이 없다.
- 필요한 환경 변수 목록이 `.env.example`로 문서화되어 있다.

---

## 2단계: 공통 모듈/컴포넌트 개발

**예상 소요:** 2시간 · **상태:** 🟡 대부분 완료

### 왜 이 순서인가요?

핵심 기능(진행률, 칸반, 필터)은 모두 **같은 타입(`MigrationTask`)과 같은 UI 부품(Card, Badge, Progress, Select)**을 사용합니다.
공통 부품을 먼저 만들어 두면 기능별로 중복 구현하지 않고, 타입이 하나로 통일되어 Notion 응답 형식이 바뀌어도 한 곳만 수정하면 됩니다.

### 작업 목록

**데이터 타입 / 스키마**

- [x] `src/types/migration.ts` — `MigrationTask` Zod 스키마, `MigrationStatus`(`대기/진행중/완료/보류`), `MigrationFilter` 타입
- [x] 상태별 표시 설정 분리 (`src/components/migration/status-config.ts` — 라벨, 색상, 아이콘)

**UI 컴포넌트**

- [x] shadcn/ui 추가: `card`, `badge`, `select`, `button`
- [ ] shadcn/ui 추가: `progress` (PRD 명시 컴포넌트)
- [ ] shadcn/ui 추가: `skeleton` (로딩 상태용, 선택)
- [x] 공통 레이아웃: `PageHeader`, `Header`, `Footer`, 테마 토글

**유틸리티**

- [x] 진행률·상태별 개수 계산 로직 (`src/lib/migration/stats.ts`) + 단위 테스트
- [x] 개발용 샘플 데이터 (`src/lib/migration/sample-tasks.ts`)

### 완료 기준

- `MigrationTask` 타입이 Zod 스키마에서 추론되며, 코드 어디에도 `any` 타입이 없다.
- PRD에 명시된 shadcn 컴포넌트(`card`, `badge`, `progress`, `select`)가 모두 `src/components/ui/`에 존재한다.
- `stats.ts` 단위 테스트가 통과한다 (빈 배열, 전체 완료, 혼합 상태 케이스 포함).

---

## 3단계: 핵심 기능 개발

**예상 소요:** 3시간 · **상태:** 🟡 진행중 (코드 완료, 실데이터 검증 남음)

### 왜 이 순서인가요?

PRD의 존재 이유는 **"Notion 데이터를 대시보드로 보여주는 것"**입니다. 데이터 조회 → 진행률 → 칸반이 동작해야 제품으로서 의미가 생기므로, 필터 같은 부가 기능보다 먼저 완성합니다.
또한 필터는 칸반·진행률 컴포넌트가 이미 있어야 그 위에 얹을 수 있습니다.

### 작업 목록

**3-1. Notion 연동 (데이터 계층)** — 🟡 코드 완료, 실제 DB 연결 필요

- [ ] Notion Integration 생성 및 `Migration Tasks` 데이터베이스에 연결
- [ ] `.env.local`에 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 설정
- [x] `src/lib/notion.ts` — Notion 클라이언트 생성 및 데이터베이스 전체 조회 (`server-only`)
  - `@notionhq/client` v5: `databases.retrieve`로 데이터 소스 ID 확인 → `collectAllDataSourceRows`로 페이지네이션 자동 처리
- [x] Notion 페이지 속성 → `MigrationTask` 변환 함수 작성 (`src/lib/migration/notion-mapper.ts`) (`모듈명`, `상태`, `원본 스택`, `대상 스택`, `담당자`, `난이도`, `비고`, `수정일`)
- [x] 변환 결과를 `migrationTaskSchema`로 검증, 잘못된 행은 제외하고 경고 로그 출력
- [x] `getMigrationTasks()` 교체: 환경 변수가 있으면 Notion, 없으면 샘플 데이터로 폴백 (`source: "notion" | "sample"`)
- [x] 변환 함수 단위 테스트 (Notion 응답 픽스처 기반, `notion-mapper.test.ts`)

**3-2. 진행률 섹션** — ✅ UI 완료

- [x] `ProgressSummary` — 전체 진행률(완료/전체, %) + 상태별 개수 요약 카드 4개
- [ ] 진행률 바를 shadcn `Progress` 컴포넌트로 통일

**3-3. 상태별 칸반 보드** — ✅ UI 완료

- [x] `KanbanBoard`, `KanbanColumn` — `대기 / 진행중 / 완료 / 보류` 4개 컬럼
- [x] `TaskCard` — 모듈명, `원본 → 대상` 스택 배지, 담당자, 난이도(★), 비고 요약
- [x] `src/app/page.tsx` — Server Component에서 데이터 조회 후 `MigrationDashboard`로 전달
- [x] 헤더에 마지막 동기화 시각 및 데이터 출처(샘플/Notion) 배지 표시

### 완료 기준

- 실제 Notion 데이터베이스의 행이 대시보드 칸반 카드로 표시된다.
- Notion 응답 처리 경로에 `any` 타입이 없고, 스키마에 맞지 않는 행이 있어도 페이지가 깨지지 않는다.
- 진행률(%)이 `완료 수 / 전체 수`와 정확히 일치한다.
- 환경 변수가 없는 로컬 환경에서도 샘플 데이터로 화면이 정상 동작한다.

---

## 4단계: 추가 기능 개발

**예상 소요:** 2시간 · **상태:** 🟡 진행중

### 왜 이 순서인가요?

필터와 예외 화면은 **핵심 기능이 이미 동작한다는 전제** 위에서만 의미가 있습니다.
필터는 칸반·진행률이 받는 데이터를 걸러내는 계층이고, 빈 상태/에러 화면은 실제 Notion 연동 후에야 어떤 오류가 발생하는지 정확히 알 수 있기 때문에 3단계 이후에 진행합니다.

### 작업 목록

**4-1. 스택·담당자 필터**

- [x] `FilterBar` 클라이언트 컴포넌트 — 스택 전환 조합(`원본 → 대상`) / 담당자 `Select`, 초기화 버튼
- [x] 필터 결과에 따라 칸반 카드와 진행률 재계산
- [ ] 필터 옵션이 실제 데이터에서 동적으로 생성되는지 Notion 데이터로 재검증
- [ ] (선택) 필터 상태를 URL 쿼리(`?stack=...&assignee=...`)와 동기화해 공유 URL로 같은 화면 재현

**4-2. 빈 상태 / 에러 처리**

- [ ] 데이터 0건일 때 안내 메시지 (전체 비어 있음 / 필터 결과 없음 구분)
- [ ] Notion API 오류 시 `src/app/error.tsx` 에러 화면 및 재시도 버튼
- [ ] 인증 실패(잘못된 API 키), DB 미공유 등 주요 오류별 안내 문구
- [ ] (선택) `src/app/loading.tsx` 스켈레톤 UI

### 완료 기준

- 필터 적용 시 칸반 카드와 진행률 수치가 항상 같은 데이터 집합을 기준으로 계산된다.
- 초기화 버튼으로 전체 보기로 즉시 복귀한다.
- Notion API 키를 일부러 틀리게 설정해도 앱이 크래시하지 않고 에러 안내 화면이 표시된다.
- 필터 결과가 없을 때 빈 컬럼만 남지 않고 안내 메시지가 보인다.

---

## 5단계: 최적화 및 배포

**예상 소요:** 2시간 · **상태:** ⬜ 대기

### 왜 마지막인가요?

기능이 확정되기 전에 최적화하면 바뀔 코드를 다듬는 데 시간을 낭비하게 됩니다.
기능이 모두 갖춰진 뒤 **실제 데이터·실제 환경 기준으로** 성능과 반응형을 점검하고 배포해야 정확한 검증이 가능합니다.

### 작업 목록

**5-1. 렌더링 / 성능**

- [x] `revalidate = 60` ISR 설정 (`src/app/page.tsx`)
- [ ] 빌드 결과에서 `/` 라우트가 ISR(○/●)로 생성되는지 확인
- [ ] Notion API 호출이 요청마다가 아닌 재검증 주기마다만 발생하는지 확인
- [ ] 클라이언트 컴포넌트 범위 최소화 (`FilterBar`·대시보드 상호작용 부분만 `"use client"`)

**5-2. 반응형 / 접근성 검증**

- [ ] 모바일 375px — 칸반 세로 스택, 요약 카드 2열, 가로 스크롤 없음
- [ ] 태블릿 768px — 칸반 2열, 요약 카드 4열
- [ ] 데스크톱 1024px 이상 — 칸반 4열
- [ ] 라이트/다크 테마 대비, 키보드로 필터 조작 가능 여부 확인

**5-3. 품질 점검**

- [ ] `npm run lint`, `npm test`, `npm run build` 통과
- [ ] 스타터 킷 잔여 코드 정리 및 README를 MigrateBoard 기준으로 갱신

**5-4. 배포**

> ⚠️ 현재 `next.config.ts`는 `output: "export"` + GitHub Pages 워크플로입니다. 정적 export에서는 Notion 데이터가 **빌드 시점에 한 번만** 반영되므로 PRD의 "60초 이내 반영" 기준을 만족할 수 없습니다.

- [ ] 배포 방식 결정: Vercel 등 서버 런타임(ISR 지원)으로 전환, 또는 정적 export 유지 시 예약 빌드(cron)로 대체
- [ ] 배포 환경(Vercel 또는 `deploy.yml` 대상)에 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 등록
- [ ] 프로덕션 배포 후 Notion에서 상태 변경 → 60초 이내 반영 확인
- [ ] 이해관계자 공유용 URL 확정

### 완료 기준 (= PRD 성공 기준)

- Notion에서 상태를 변경하면 최대 60초 이내 대시보드에 반영된다.
- 필터 적용 시 칸반 카드와 진행률이 일관되게 갱신된다.
- 모바일(375px)부터 데스크톱까지 가로 스크롤 없이 표시된다.
- `any` 타입 없이 Notion 응답이 타입 안전하게 처리된다.

---

## 다음 작업 (우선순위)

1. **배포 방식 결정** — 현재 `next.config.ts`가 `output: "export"`(GitHub Pages 정적 배포)라서 ISR(`revalidate = 60`)이 동작하지 않음. Vercel 등 서버 런타임으로 전환할지 결정 필요 (5-4 참고)
2. 3-1 잔여: 실제 Notion DB 연결 후 데이터 표시 확인
3. 2단계 잔여: shadcn `progress` 추가 및 진행률 바 교체
4. 4-2 빈 상태 / 에러 처리
5. 5단계 반응형 검증 및 배포

---

## 향후 확장 (MVP 이후)

PRD에서 MVP 제외로 명시한 항목입니다. MVP 배포 및 사용 피드백 이후 우선순위를 정합니다.

| 기능 | 비고 |
| --- | --- |
| 웹에서 상태 변경 + 드래그 앤 드롭 | Notion 쓰기 API, 낙관적 업데이트 필요 |
| 진행률 추이 차트 | 일자별 스냅샷 저장소 필요 (Notion은 이력 미제공) |
| 로그인 / 권한 관리 | 공유 URL 접근 제어 |
| Slack 알림 연동 | 상태 변경·보류 발생 시 알림 |
| 다중 마이그레이션 프로젝트 관리 | 데이터베이스 ID 복수 지원, 프로젝트 전환 UI |
