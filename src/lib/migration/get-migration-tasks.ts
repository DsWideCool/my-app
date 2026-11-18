import { migrationTaskListSchema, type MigrationTask } from "@/types/migration"

import { sampleTasks } from "./sample-tasks"

export interface MigrationTasksResult {
  tasks: MigrationTask[]
  source: "notion" | "sample"
}

// 대시보드에 표시할 마이그레이션 작업 목록을 가져온다.
// TODO: Notion 연동 단계에서 NOTION_API_KEY가 있으면 Notion 데이터를 조회하도록 교체
export async function getMigrationTasks(): Promise<MigrationTasksResult> {
  // 외부 데이터와 동일하게 Zod로 검증해 타입 안전성을 보장
  const tasks = migrationTaskListSchema.parse(sampleTasks)
  return { tasks, source: "sample" }
}
