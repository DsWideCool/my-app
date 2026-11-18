import { getNotionConfig, queryMigrationPages } from "@/lib/notion"
import { migrationTaskListSchema, type MigrationTask } from "@/types/migration"

import { mapNotionPages } from "./notion-mapper"
import { sampleTasks } from "./sample-tasks"

export interface MigrationTasksResult {
  tasks: MigrationTask[]
  source: "notion" | "sample"
}

// 대시보드에 표시할 마이그레이션 작업 목록을 가져온다.
// NOTION_API_KEY / NOTION_DATABASE_ID가 있으면 Notion, 없으면 샘플 데이터를 사용한다.
export async function getMigrationTasks(): Promise<MigrationTasksResult> {
  const config = getNotionConfig()

  if (!config) {
    // 외부 데이터와 동일하게 Zod로 검증해 타입 안전성을 보장
    const tasks = migrationTaskListSchema.parse(sampleTasks)
    return { tasks, source: "sample" }
  }

  // Notion API 오류는 그대로 throw해 에러 화면에서 처리 (ISR 재검증 실패 시 기존 페이지 유지)
  const pages = await queryMigrationPages(config)
  const { tasks, skipped } = mapNotionPages(pages)

  if (skipped.length > 0) {
    console.warn(
      `[notion] 스키마에 맞지 않는 ${skipped.length}개 행을 제외했습니다.`,
      skipped,
    )
  }

  return { tasks, source: "notion" }
}
