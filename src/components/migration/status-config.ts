import {
  CircleCheck,
  CircleDashed,
  CirclePause,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react"

import type { MigrationStatus } from "@/types/migration"

interface StatusStyle {
  icon: LucideIcon
  // 아이콘·텍스트 색상
  textClass: string
  // 칸반 컬럼 상단 강조선 색상
  accentClass: string
}

// 상태별 아이콘과 색상 (라이트/다크 모드 대응)
export const statusStyles: Record<MigrationStatus, StatusStyle> = {
  대기: {
    icon: CircleDashed,
    textClass: "text-slate-500 dark:text-slate-400",
    accentClass: "bg-slate-400 dark:bg-slate-500",
  },
  진행중: {
    icon: LoaderCircle,
    textClass: "text-blue-600 dark:text-blue-400",
    accentClass: "bg-blue-500",
  },
  완료: {
    icon: CircleCheck,
    textClass: "text-emerald-600 dark:text-emerald-400",
    accentClass: "bg-emerald-500",
  },
  보류: {
    icon: CirclePause,
    textClass: "text-amber-600 dark:text-amber-400",
    accentClass: "bg-amber-500",
  },
}
