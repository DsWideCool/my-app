import { ArrowRight, Star, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { MigrationTask } from "@/types/migration"

interface TaskCardProps {
  task: MigrationTask
}

const MAX_DIFFICULTY = 5

// 서버/클라이언트 렌더링 결과가 같도록 시간대를 고정
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "numeric",
  day: "numeric",
  timeZone: "Asia/Seoul",
})

// 난이도를 별 아이콘으로 표시
function DifficultyStars({ difficulty }: { difficulty: number }) {
  return (
    <span
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`난이도 ${difficulty} / ${MAX_DIFFICULTY}`}
    >
      {Array.from({ length: MAX_DIFFICULTY }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          className={cn(
            "size-3",
            index < difficulty
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  )
}

// 칸반 보드의 모듈 카드
export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card size="sm" className="gap-3">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{task.moduleName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="outline">{task.sourceStack ?? "미정"}</Badge>
          <ArrowRight className="size-3 text-muted-foreground" aria-hidden />
          <span className="sr-only">에서</span>
          <Badge variant="secondary">{task.targetStack ?? "미정"}</Badge>
        </div>

        {task.note && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{task.note}</p>
        )}

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1">
            <User className="size-3 shrink-0" aria-hidden />
            <span className="truncate">
              {task.assignees.length > 0 ? task.assignees.join(", ") : "미배정"}
            </span>
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {task.difficulty !== null && (
              <DifficultyStars difficulty={task.difficulty} />
            )}
            <time dateTime={task.lastEditedAt} className="tabular-nums">
              {dateFormatter.format(new Date(task.lastEditedAt))}
            </time>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
