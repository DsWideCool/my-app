"use client"

import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MigrationFilterOptions } from "@/lib/migration/stats"
import type { MigrationFilter } from "@/types/migration"

// Select에서 "전체"를 나타내는 값
const ALL = "__all__"

interface FilterSelectProps {
  id: string
  label: string
  allLabel: string
  options: string[]
  value: string | null
  onChange: (value: string | null) => void
}

// 라벨이 붙은 단일 필터 Select
function FilterSelect({
  id,
  label,
  allLabel,
  options,
  value,
  onChange,
}: FilterSelectProps) {
  const items = [
    { label: allLabel, value: ALL },
    ...options.map((option) => ({ label: option, value: option })),
  ]

  return (
    <div className="flex w-full flex-col gap-1.5 sm:w-56">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Select
        items={items}
        value={value ?? ALL}
        onValueChange={(next) => onChange(!next || next === ALL ? null : next)}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface FilterBarProps {
  options: MigrationFilterOptions
  filter: MigrationFilter
  onChange: (filter: MigrationFilter) => void
}

// 스택 전환 조합·담당자 필터 바
export function FilterBar({ options, filter, onChange }: FilterBarProps) {
  const isFiltered = filter.stackPair !== null || filter.assignee !== null

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <FilterSelect
        id="filter-stack"
        label="스택 전환"
        allLabel="전체 스택"
        options={options.stackPairs}
        value={filter.stackPair}
        onChange={(stackPair) => onChange({ ...filter, stackPair })}
      />
      <FilterSelect
        id="filter-assignee"
        label="담당자"
        allLabel="전체 담당자"
        options={options.assignees}
        value={filter.assignee}
        onChange={(assignee) => onChange({ ...filter, assignee })}
      />
      <Button
        variant="ghost"
        disabled={!isFiltered}
        onClick={() => onChange({ stackPair: null, assignee: null })}
        className="self-start sm:self-auto"
      >
        <RotateCcw />
        필터 초기화
      </Button>
    </div>
  )
}
