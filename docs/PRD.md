# PRD: MigrateBoard — 마이그레이션 진행 현황 대시보드

## 1. 프로젝트 개요

- **프로젝트명:** MigrateBoard (마이그레이션 진행 현황 대시보드)
- **목적:** Notion을 CMS로 활용한 **레거시 → 신규 스택 전환(마이그레이션) 작업의 진행 현황 시각화 및 공유**
  - 팀이 Notion 데이터베이스에 전환 대상 모듈의 상태만 갱신하면, 웹 대시보드에 전체 진행률·상태별 현황이 자동 반영된다.
- **CMS 선택 이유:** Notion API를 활용하여 비개발자(PM, 기획자 등)도 콘텐츠 관리 가능
  - 별도 관리자 페이지 개발 없이 익숙한 Notion UI에서 데이터 입력·수정
  - 팀이 이미 사용하는 협업 도구와 자연스럽게 연동

### 대상 사용자

| 사용자 | 니즈 |
| --- | --- |
| 개발자 | 내가 맡은 모듈과 남은 작업을 한눈에 확인 |
| PM / 리더 | 전체 진행률과 병목(보류 항목)을 빠르게 파악 |
| 이해관계자 | Notion 접근 없이 공유 URL로 현황 확인 |

---

## 2. 주요 기능

1. **전체 진행률 표시** — 완료 모듈 수 / 전체 모듈 수를 진행률 바와 퍼센트로 표시하고, 상태별 개수 요약 카드 제공
2. **상태별 칸반 보드** — `대기 / 진행중 / 완료 / 보류` 4개 컬럼으로 모듈 카드를 분류해 표시 (모듈명, 스택 전환 정보, 담당자, 난이도)
3. **스택·담당자 필터** — 원본 스택 → 대상 스택 조합 및 담당자 기준으로 카드 필터링, 필터에 따라 진행률도 재계산

---

## 3. 기술 스택

- **Frontend:** Next.js 15 (App Router), TypeScript
- **CMS:** Notion API (`@notionhq/client`)
- **Styling:** Tailwind CSS, shadcn/ui
- **Icons:** Lucide React
- **데이터 검증:** Zod (Notion 응답 파싱 및 타입 안전성 확보)
- **렌더링 전략:** Server Component + ISR (`revalidate: 60`)

---

## 4. Notion 데이터베이스 구조

데이터베이스명: `Migration Tasks`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| 모듈명 | Title | 전환 대상 모듈/페이지/기능의 이름 (예: `결제 페이지`, `auth 모듈`) |
| 상태 | Select | 진행 상태 — `대기`, `진행중`, `완료`, `보류` 중 하나 |
| 원본 스택 | Select | 전환 전 기술 (예: `jQuery`, `Class Component`, `Pages Router`, `JavaScript`) |
| 대상 스택 | Select | 전환 후 기술 (예: `React`, `Hooks`, `App Router`, `TypeScript`) |
| 담당자 | People | 해당 모듈 전환 담당자 |
| 난이도 | Number | 1~5 정수, 작업 난이도 |
| 비고 | Rich Text | 보류 사유, 참고 사항 등 메모 (선택) |
| 수정일 | Last edited time | 마지막 수정 시각 (자동) |

### 환경 변수

```env
NOTION_API_KEY=secret_xxx        # Notion Integration 토큰
NOTION_DATABASE_ID=xxxxxxxx      # Migration Tasks 데이터베이스 ID
```

---

## 5. 화면 구성

- **대시보드 (`/`)** — 단일 메인 화면
  - **상단 헤더:** 프로젝트 제목, 마지막 동기화 시각
  - **진행률 섹션:** 전체 진행률 바(shadcn `Progress`) + 상태별 개수 요약 카드 4개
  - **필터 바:** 스택 전환 조합 / 담당자 선택(shadcn `Select`), 초기화 버튼
  - **칸반 보드:** 상태별 4개 컬럼, 각 컬럼에 모듈 카드(shadcn `Card`, `Badge`)
- **모듈 카드 (컴포넌트)** — 모듈명, `원본 → 대상` 스택 배지, 담당자, 난이도(★ 표시), 비고 요약
- **빈 상태 / 에러 화면** — 데이터 없음, Notion API 오류 시 안내 메시지

### 반응형 기준

| 화면 폭 | 레이아웃 |
| --- | --- |
| 모바일 (< 768px) | 칸반 컬럼 세로 스택, 요약 카드 2열 |
| 태블릿 (768px ~) | 칸반 2열, 요약 카드 4열 |
| 데스크톱 (1024px ~) | 칸반 4열 가로 배치 |

---

## 6. MVP 범위

### 포함

- Notion 데이터베이스 조회 및 Zod 기반 타입 파싱
- 전체 진행률 바 + 상태별 개수 요약
- 상태별 칸반 보드 (읽기 전용)
- 스택 전환 조합 / 담당자 필터 (클라이언트 사이드)
- ISR로 60초 주기 자동 갱신
- 반응형 레이아웃

### 제외 (향후 확장)

- 웹에서 상태 변경(쓰기) 및 드래그 앤 드롭
- 진행률 추이 차트 (일자별 히스토리)
- 로그인 / 권한 관리
- Slack 등 알림 연동
- 여러 마이그레이션 프로젝트 동시 관리

---

## 7. 구현 단계 (약 30분)

1. **Notion 연동 및 데이터 계층 (10분)**
   - Notion Integration 생성, DB 연결, `.env.local` 설정
   - `@notionhq/client`, `zod` 설치
   - `src/lib/notion.ts`: DB 조회 함수 작성
   - `src/types/migration.ts`: `MigrationTask` Zod 스키마 및 타입 정의
2. **대시보드 UI (10분)**
   - shadcn 컴포넌트 추가: `card`, `badge`, `progress`, `select`
   - `ProgressSummary`, `KanbanBoard`, `KanbanColumn`, `TaskCard` 컴포넌트 분리 구현
   - `src/app/page.tsx`에서 Server Component로 데이터 조회 후 전달
3. **필터 및 마무리 (10분)**
   - `FilterBar` 클라이언트 컴포넌트 구현 (필터 결과로 진행률 재계산)
   - `revalidate = 60` 설정, 빈 상태·에러 처리
   - 모바일/데스크톱 반응형 확인

---

## 8. 성공 기준

- Notion에서 상태를 변경하면 최대 60초 이내 대시보드에 반영된다.
- 필터 적용 시 칸반 카드와 진행률이 일관되게 갱신된다.
- 모바일(375px)부터 데스크톱까지 가로 스크롤 없이 표시된다.
- `any` 타입 없이 Notion 응답이 타입 안전하게 처리된다.
