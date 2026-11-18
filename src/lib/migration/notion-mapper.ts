import type { PageObjectResponse } from "@notionhq/client"

import { migrationTaskSchema, type MigrationTask } from "@/types/migration"

// Notion 페이지 속성 값 (SDK가 개별 타입을 export하지 않아 인덱스 접근으로 추출)
type NotionPropertyValue = PageObjectResponse["properties"][string]

// 매퍼가 사용하는 페이지 필드만 요구해 테스트 픽스처를 간결하게 유지
export type NotionTaskPage = Pick<
  PageObjectResponse,
  "id" | "properties" | "last_edited_time"
>

// Notion 데이터베이스 `Migration Tasks`의 속성 이름 (PRD 4장)
export const NOTION_PROPERTY = {
  moduleName: "모듈명",
  status: "상태",
  sourceStack: "원본 스택",
  targetStack: "대상 스택",
  assignees: "담당자",
  difficulty: "난이도",
  note: "비고",
  lastEditedAt: "수정일",
} as const

export interface SkippedNotionPage {
  id: string
  reason: string
}

export interface NotionMappingResult {
  tasks: MigrationTask[]
  skipped: SkippedNotionPage[]
}

function getProperty(
  page: NotionTaskPage,
  name: string,
): NotionPropertyValue | undefined {
  return page.properties[name]
}

// Title / Rich Text 속성을 일반 문자열로 변환
function readText(property: NotionPropertyValue | undefined): string {
  if (property?.type === "title") {
    return property.title.map((item) => item.plain_text).join("")
  }
  if (property?.type === "rich_text") {
    return property.rich_text.map((item) => item.plain_text).join("")
  }
  return ""
}

// Select 속성 (Notion에서 Status 타입으로 만든 경우도 허용)
function readSelect(property: NotionPropertyValue | undefined): string | null {
  if (property?.type === "select") return property.select?.name ?? null
  if (property?.type === "status") return property.status?.name ?? null
  return null
}

function readNumber(property: NotionPropertyValue | undefined): number | null {
  return property?.type === "number" ? property.number : null
}

// People 속성에서 이름만 추출 (이름 권한이 없는 부분 사용자 객체는 제외)
function readPeople(property: NotionPropertyValue | undefined): string[] {
  if (property?.type !== "people") return []
  return property.people.flatMap((person) =>
    "name" in person && person.name ? [person.name] : [],
  )
}

function readLastEditedTime(
  property: NotionPropertyValue | undefined,
  fallback: string,
): string {
  return property?.type === "last_edited_time"
    ? property.last_edited_time
    : fallback
}

// Notion 페이지 1건을 검증 전 원시 객체로 변환
export function toRawMigrationTask(page: NotionTaskPage) {
  return {
    id: page.id,
    moduleName: readText(getProperty(page, NOTION_PROPERTY.moduleName)),
    status: readSelect(getProperty(page, NOTION_PROPERTY.status)),
    sourceStack: readSelect(getProperty(page, NOTION_PROPERTY.sourceStack)),
    targetStack: readSelect(getProperty(page, NOTION_PROPERTY.targetStack)),
    assignees: readPeople(getProperty(page, NOTION_PROPERTY.assignees)),
    difficulty: readNumber(getProperty(page, NOTION_PROPERTY.difficulty)),
    note: readText(getProperty(page, NOTION_PROPERTY.note)),
    lastEditedAt: readLastEditedTime(
      getProperty(page, NOTION_PROPERTY.lastEditedAt),
      page.last_edited_time,
    ),
  }
}

// Notion 페이지 목록을 Zod로 검증하며 변환. 잘못된 행은 건너뛰고 사유를 기록한다.
export function mapNotionPages(pages: NotionTaskPage[]): NotionMappingResult {
  const tasks: MigrationTask[] = []
  const skipped: SkippedNotionPage[] = []

  for (const page of pages) {
    const result = migrationTaskSchema.safeParse(toRawMigrationTask(page))
    if (result.success) {
      tasks.push(result.data)
    } else {
      const reason = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ")
      skipped.push({ id: page.id, reason })
    }
  }

  return { tasks, skipped }
}
