import { groupTasksByStatus } from "@/lib/migration/stats"
import { migrationStatuses, type MigrationTask } from "@/types/migration"

import { KanbanColumn } from "./kanban-column"

interface KanbanBoardProps {
  tasks: MigrationTask[]
}

// 상태별 4개 컬럼 칸반 보드 (모바일 1열 → 태블릿 2열 → 데스크톱 4열)
export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const groups = groupTasksByStatus(tasks)

  return (
    <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-4">
      {migrationStatuses.map((status) => (
        <KanbanColumn key={status} status={status} tasks={groups[status]} />
      ))}
    </div>
  )
}
