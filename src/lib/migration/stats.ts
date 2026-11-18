import {
  migrationStatuses,
  type MigrationFilter,
  type MigrationStatus,
  type MigrationTask,
} from "@/types/migration"

// 스택 정보가 비어 있을 때 표시할 값
const UNKNOWN_STACK = "미정"

// 담당자가 없는 작업을 필터링할 때 사용하는 값
export const UNASSIGNED = "미배정"

export interface MigrationSummary {
  total: number
  completed: number
  progressPercent: number
  counts: Record<MigrationStatus, number>
}

export interface MigrationFilterOptions {
  stackPairs: string[]
  assignees: string[]
}

// "원본 → 대상" 형태의 스택 전환 키
export function getStackPair(task: MigrationTask): string {
  return `${task.sourceStack ?? UNKNOWN_STACK} → ${task.targetStack ?? UNKNOWN_STACK}`
}

// 필터 조건에 맞는 작업만 남긴다 (null 조건은 무시)
export function filterTasks(
  tasks: MigrationTask[],
  filter: MigrationFilter,
): MigrationTask[] {
  return tasks.filter((task) => {
    if (filter.stackPair && getStackPair(task) !== filter.stackPair) return false
    if (filter.assignee) {
      const matches =
        filter.assignee === UNASSIGNED
          ? task.assignees.length === 0
          : task.assignees.includes(filter.assignee)
      if (!matches) return false
    }
    return true
  })
}

// 전체 진행률과 상태별 개수를 계산한다
export function summarizeTasks(tasks: MigrationTask[]): MigrationSummary {
  const counts = Object.fromEntries(
    migrationStatuses.map((status) => [status, 0]),
  ) as Record<MigrationStatus, number>

  for (const task of tasks) counts[task.status] += 1

  const total = tasks.length
  const completed = counts["완료"]
  const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return { total, completed, progressPercent, counts }
}

// 상태별로 작업을 묶는다 (모든 상태 키를 항상 포함)
export function groupTasksByStatus(
  tasks: MigrationTask[],
): Record<MigrationStatus, MigrationTask[]> {
  const groups = Object.fromEntries(
    migrationStatuses.map((status) => [status, [] as MigrationTask[]]),
  ) as Record<MigrationStatus, MigrationTask[]>

  for (const task of tasks) groups[task.status].push(task)
  return groups
}

// 필터 선택지 목록 (가나다순 정렬, 미배정 작업이 있으면 마지막에 추가)
export function getFilterOptions(tasks: MigrationTask[]): MigrationFilterOptions {
  const stackPairs = new Set<string>()
  const assignees = new Set<string>()
  let hasUnassigned = false

  for (const task of tasks) {
    stackPairs.add(getStackPair(task))
    if (task.assignees.length === 0) hasUnassigned = true
    for (const assignee of task.assignees) assignees.add(assignee)
  }

  const sortKo = (a: string, b: string) => a.localeCompare(b, "ko")
  const sortedAssignees = [...assignees].sort(sortKo)
  if (hasUnassigned) sortedAssignees.push(UNASSIGNED)

  return { stackPairs: [...stackPairs].sort(sortKo), assignees: sortedAssignees }
}
