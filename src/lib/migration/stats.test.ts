import { describe, expect, it } from "vitest"

import type { MigrationTask } from "@/types/migration"

import {
  filterTasks,
  getFilterOptions,
  getStackPair,
  groupTasksByStatus,
  summarizeTasks,
  UNASSIGNED,
} from "./stats"

// 테스트용 작업 생성 헬퍼
const createTask = (overrides: Partial<MigrationTask>): MigrationTask => ({
  id: "task",
  moduleName: "모듈",
  status: "대기",
  sourceStack: "JavaScript",
  targetStack: "TypeScript",
  assignees: ["김민준"],
  difficulty: 1,
  note: "",
  lastEditedAt: "2026-11-17T00:00:00+09:00",
  ...overrides,
})

const tasks: MigrationTask[] = [
  createTask({ id: "1", status: "완료" }),
  createTask({ id: "2", status: "진행중", assignees: ["이서연"] }),
  createTask({
    id: "3",
    status: "보류",
    sourceStack: "jQuery",
    targetStack: "React",
    assignees: [],
  }),
  createTask({ id: "4", status: "완료", sourceStack: null }),
]

describe("getStackPair", () => {
  it("원본과 대상 스택을 화살표로 잇는다", () => {
    expect(getStackPair(tasks[0])).toBe("JavaScript → TypeScript")
  })

  it("비어 있는 스택은 미정으로 표시한다", () => {
    expect(getStackPair(tasks[3])).toBe("미정 → TypeScript")
  })
})

describe("summarizeTasks", () => {
  it("상태별 개수와 진행률을 계산한다", () => {
    const summary = summarizeTasks(tasks)
    expect(summary.total).toBe(4)
    expect(summary.completed).toBe(2)
    expect(summary.progressPercent).toBe(50)
    expect(summary.counts).toEqual({ 대기: 0, 진행중: 1, 완료: 2, 보류: 1 })
  })

  it("작업이 없으면 진행률은 0이다", () => {
    expect(summarizeTasks([]).progressPercent).toBe(0)
  })
})

describe("filterTasks", () => {
  it("필터가 없으면 전체를 반환한다", () => {
    expect(filterTasks(tasks, { stackPair: null, assignee: null })).toHaveLength(4)
  })

  it("스택 전환 조합으로 필터링한다", () => {
    const result = filterTasks(tasks, { stackPair: "jQuery → React", assignee: null })
    expect(result.map((task) => task.id)).toEqual(["3"])
  })

  it("담당자로 필터링한다", () => {
    const result = filterTasks(tasks, { stackPair: null, assignee: "이서연" })
    expect(result.map((task) => task.id)).toEqual(["2"])
  })

  it("미배정 필터는 담당자가 없는 작업만 남긴다", () => {
    const result = filterTasks(tasks, { stackPair: null, assignee: UNASSIGNED })
    expect(result.map((task) => task.id)).toEqual(["3"])
  })

  it("여러 조건은 모두 만족해야 한다", () => {
    const result = filterTasks(tasks, {
      stackPair: "JavaScript → TypeScript",
      assignee: "김민준",
    })
    expect(result.map((task) => task.id)).toEqual(["1"])
  })
})

describe("groupTasksByStatus", () => {
  it("작업이 없는 상태도 빈 배열로 포함한다", () => {
    const groups = groupTasksByStatus(tasks)
    expect(groups["대기"]).toEqual([])
    expect(groups["완료"].map((task) => task.id)).toEqual(["1", "4"])
  })
})

describe("getFilterOptions", () => {
  it("중복 없이 정렬된 선택지를 만들고 미배정은 마지막에 둔다", () => {
    const options = getFilterOptions(tasks)
    expect(options.assignees).toEqual(["김민준", "이서연", UNASSIGNED])
    // 한국어 정렬 규칙: 한글 → 영문(대소문자 무시) 순
    expect(options.stackPairs).toEqual([
      "미정 → TypeScript",
      "JavaScript → TypeScript",
      "jQuery → React",
    ])
  })
})
