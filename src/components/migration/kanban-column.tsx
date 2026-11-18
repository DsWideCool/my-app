import { cn } from "@/lib/utils"
import type { MigrationStatus, MigrationTask } from "@/types/migration"

import { statusStyles } from "./status-config"
import { TaskCard } from "./task-card"

interface KanbanColumnProps {
  status: MigrationStatus
  tasks: MigrationTask[]
}

// 상태 하나에 해당하는 칸반 컬럼
export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const { icon: Icon, textClass, accentClass } = statusStyles[status]
  const headingId = `kanban-${status}`

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col overflow-hidden rounded-xl bg-muted/40 ring-1 ring-foreground/5"
    >
      <div className={cn("h-1 w-full", accentClass)} aria-hidden />
      <header className="flex items-center gap-2 px-3 pt-3 pb-2">
        <Icon className={cn("size-4", textClass)} aria-hidden />
        <h2 id={headingId} className="text-sm font-semibold">
          {status}
        </h2>
        <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
          {tasks.length}
        </span>
      </header>

      {tasks.length > 0 ? (
        <ul className="flex flex-col gap-2 px-3 pb-3">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard task={task} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mx-3 mb-3 rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
          해당 상태의 모듈이 없습니다
        </p>
      )}
    </section>
  )
}
