import { Database, FlaskConical } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { MigrationDashboard } from "@/components/migration/migration-dashboard"
import { Badge } from "@/components/ui/badge"
import { getMigrationTasks } from "@/lib/migration/get-migration-tasks"

// Notion 변경 사항을 60초마다 반영 (ISR)
export const revalidate = 60

const syncTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
})

export default async function HomePage() {
  const { tasks, source } = await getMigrationTasks()
  const syncedAt = syncTimeFormatter.format(new Date())

  return (
    <div className="container mx-auto space-y-8 px-4 py-8 md:py-12">
      <PageHeader
        title="마이그레이션 현황"
        description="레거시 → 신규 스택 전환 작업의 진행 상황을 한눈에 확인합니다."
      >
        <div className="flex flex-col items-start gap-1 sm:items-end">
          {source === "sample" ? (
            <Badge variant="outline">
              <FlaskConical />
              샘플 데이터
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Database />
              Notion 연동
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            마지막 동기화 {syncedAt}
          </span>
        </div>
      </PageHeader>

      {tasks.length > 0 ? (
        <MigrationDashboard tasks={tasks} />
      ) : (
        <p className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          아직 등록된 모듈이 없습니다. Notion 데이터베이스에 전환 대상을 추가해 주세요.
        </p>
      )}
    </div>
  )
}
