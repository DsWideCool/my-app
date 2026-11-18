"use client"

import { useMemo, useState } from "react"

import {
  filterTasks,
  getFilterOptions,
  summarizeTasks,
} from "@/lib/migration/stats"
import type { MigrationFilter, MigrationTask } from "@/types/migration"

import { FilterBar } from "./filter-bar"
import { KanbanBoard } from "./kanban-board"
import { ProgressSummary } from "./progress-summary"

interface MigrationDashboardProps {
  tasks: MigrationTask[]
}

const initialFilter: MigrationFilter = { stackPair: null, assignee: null }

// 필터 상태를 관리하고 진행률·칸반을 함께 갱신하는 대시보드 본문
export function MigrationDashboard({ tasks }: MigrationDashboardProps) {
  const [filter, setFilter] = useState<MigrationFilter>(initialFilter)

  const options = useMemo(() => getFilterOptions(tasks), [tasks])
  const filteredTasks = useMemo(() => filterTasks(tasks, filter), [tasks, filter])
  const summary = useMemo(() => summarizeTasks(filteredTasks), [filteredTasks])

  return (
    <div className="space-y-6">
      <FilterBar options={options} filter={filter} onChange={setFilter} />
      <ProgressSummary summary={summary} />
      {filteredTasks.length > 0 ? (
        <KanbanBoard tasks={filteredTasks} />
      ) : (
        <p className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          조건에 맞는 모듈이 없습니다. 필터를 변경해 보세요.
        </p>
      )}
    </div>
  )
}
