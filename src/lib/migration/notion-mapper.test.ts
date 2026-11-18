import type { RichTextItemResponse } from "@notionhq/client"
import { describe, expect, it } from "vitest"

import {
  mapNotionPages,
  NOTION_PROPERTY,
  type NotionTaskPage,
} from "./notion-mapper"

type Properties = NotionTaskPage["properties"]

// Notion 응답 형태를 흉내 낸 픽스처 생성 헬퍼
const richText = (text: string): RichTextItemResponse[] => [
  {
    type: "text",
    text: { content: text, link: null },
    plain_text: text,
    href: null,
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
    },
  },
]

const select = (name: string | null) => ({
  id: "select",
  type: "select" as const,
  select: name ? { id: name, name, color: "default" as const } : null,
})

const createProperties = (): Properties => ({
  [NOTION_PROPERTY.moduleName]: {
    id: "title",
    type: "title",
    title: richText("결제 페이지"),
  },
  [NOTION_PROPERTY.status]: select("진행중"),
  [NOTION_PROPERTY.sourceStack]: select("jQuery"),
  [NOTION_PROPERTY.targetStack]: select("React"),
  [NOTION_PROPERTY.assignees]: {
    id: "people",
    type: "people",
    people: [
      {
        id: "u1",
        object: "user",
        name: "김민준",
        avatar_url: null,
        type: "person",
        person: {},
      },
      // 이름을 읽을 수 없는 부분 사용자 객체는 제외되어야 한다
      { id: "u2", object: "user" },
    ],
  },
  [NOTION_PROPERTY.difficulty]: { id: "number", type: "number", number: 4 },
  [NOTION_PROPERTY.note]: {
    id: "note",
    type: "rich_text",
    rich_text: richText("PG사 SDK 교체 필요"),
  },
  [NOTION_PROPERTY.lastEditedAt]: {
    id: "edited",
    type: "last_edited_time",
    last_edited_time: "2026-11-17T08:00:00.000Z",
  },
})

const createPage = (
  overrides: Partial<Properties> = {},
  id = "page-1",
): NotionTaskPage => {
  const properties: Properties = { ...createProperties() }
  for (const [key, value] of Object.entries(overrides)) {
    if (value) properties[key] = value
  }
  return { id, properties, last_edited_time: "2026-11-16T00:00:00.000Z" }
}

describe("mapNotionPages", () => {
  it("Notion 속성을 MigrationTask로 변환한다", () => {
    const { tasks, skipped } = mapNotionPages([createPage()])

    expect(skipped).toEqual([])
    expect(tasks).toEqual([
      {
        id: "page-1",
        moduleName: "결제 페이지",
        status: "진행중",
        sourceStack: "jQuery",
        targetStack: "React",
        assignees: ["김민준"],
        difficulty: 4,
        note: "PG사 SDK 교체 필요",
        lastEditedAt: "2026-11-17T08:00:00.000Z",
      },
    ])
  })

  it("선택 속성이 비어 있으면 null / 빈 값으로 변환한다", () => {
    const page = createPage({
      [NOTION_PROPERTY.sourceStack]: select(null),
      [NOTION_PROPERTY.difficulty]: {
        id: "number",
        type: "number",
        number: null,
      },
      [NOTION_PROPERTY.assignees]: { id: "people", type: "people", people: [] },
      [NOTION_PROPERTY.note]: { id: "note", type: "rich_text", rich_text: [] },
    })

    const [task] = mapNotionPages([page]).tasks

    expect(task).toMatchObject({
      sourceStack: null,
      difficulty: null,
      assignees: [],
      note: "",
    })
  })

  it("Status 타입으로 만든 상태 속성도 읽는다", () => {
    const page = createPage({
      [NOTION_PROPERTY.status]: {
        id: "status",
        type: "status",
        status: { id: "done", name: "완료", color: "green" },
      },
    })

    expect(mapNotionPages([page]).tasks[0]?.status).toBe("완료")
  })

  it("수정일 속성이 없으면 페이지의 last_edited_time을 사용한다", () => {
    const page = createPage()
    delete page.properties[NOTION_PROPERTY.lastEditedAt]

    expect(mapNotionPages([page]).tasks[0]?.lastEditedAt).toBe(
      "2026-11-16T00:00:00.000Z",
    )
  })

  it("스키마에 맞지 않는 행은 건너뛰고 사유를 기록한다", () => {
    const invalidStatus = createPage(
      { [NOTION_PROPERTY.status]: select("취소") },
      "bad-status",
    )
    const emptyTitle = createPage(
      {
        [NOTION_PROPERTY.moduleName]: { id: "title", type: "title", title: [] },
      },
      "empty-title",
    )
    const outOfRange = createPage(
      {
        [NOTION_PROPERTY.difficulty]: {
          id: "number",
          type: "number",
          number: 7,
        },
      },
      "bad-difficulty",
    )

    const { tasks, skipped } = mapNotionPages([
      createPage(),
      invalidStatus,
      emptyTitle,
      outOfRange,
    ])

    expect(tasks.map((task) => task.id)).toEqual(["page-1"])
    expect(skipped.map((item) => item.id)).toEqual([
      "bad-status",
      "empty-title",
      "bad-difficulty",
    ])
    expect(skipped[0]?.reason).toContain("status")
  })
})
