import { z } from "zod"

// 마이그레이션 진행 상태 (Notion Select 옵션과 동일한 값)
export const migrationStatuses = ["대기", "진행중", "완료", "보류"] as const

export const migrationStatusSchema = z.enum(migrationStatuses)

// 전환 대상 모듈 1건 (Notion 데이터베이스의 한 행)
export const migrationTaskSchema = z.object({
  id: z.string().min(1),
  moduleName: z.string().trim().min(1),
  status: migrationStatusSchema,
  sourceStack: z.string().nullable(),
  targetStack: z.string().nullable(),
  assignees: z.array(z.string()),
  difficulty: z.number().int().min(1).max(5).nullable(),
  note: z.string(),
  lastEditedAt: z.iso.datetime({ offset: true }),
})

export const migrationTaskListSchema = z.array(migrationTaskSchema)

export type MigrationStatus = z.infer<typeof migrationStatusSchema>
export type MigrationTask = z.infer<typeof migrationTaskSchema>

// 대시보드 필터 조건 (null이면 전체)
export interface MigrationFilter {
  stackPair: string | null
  assignee: string | null
}
