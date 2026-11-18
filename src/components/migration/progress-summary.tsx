import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MigrationSummary } from "@/lib/migration/stats"
import { cn } from "@/lib/utils"
import { migrationStatuses } from "@/types/migration"

import { statusStyles } from "./status-config"

interface ProgressSummaryProps {
  summary: MigrationSummary
}

// 전체 진행률 바 + 상태별 개수 요약 카드
export function ProgressSummary({ summary }: ProgressSummaryProps) {
  return (
    <section aria-label="진행 현황 요약" className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            전체 진행률
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-4xl font-bold tabular-nums">
              {summary.progressPercent}%
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              완료 {summary.completed} / 전체 {summary.total}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="전체 진행률"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={summary.progressPercent}
            className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
              style={{ width: `${summary.progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:col-span-2">
        {migrationStatuses.map((status) => {
          const { icon: Icon, textClass } = statusStyles[status]
          return (
            <Card key={status}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {status}
                </CardTitle>
                <Icon className={cn("size-4", textClass)} aria-hidden />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold tabular-nums">
                  {summary.counts[status]}
                </span>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
