import "server-only"

import {
  Client,
  collectAllDataSourceRows,
  isFullDatabase,
  isFullPage,
  type PageObjectResponse,
} from "@notionhq/client"

export interface NotionConfig {
  apiKey: string
  databaseId: string
}

// 환경 변수가 모두 설정된 경우에만 Notion 설정을 반환 (없으면 샘플 데이터 사용)
export function getNotionConfig(): NotionConfig | null {
  const apiKey = process.env.NOTION_API_KEY?.trim()
  const databaseId = process.env.NOTION_DATABASE_ID?.trim()
  if (!apiKey || !databaseId) return null
  return { apiKey, databaseId }
}

// 데이터베이스의 첫 번째 데이터 소스 ID 조회
// (Notion API 2025-09 이후 행 조회는 database가 아닌 data source 단위로 수행)
async function resolveDataSourceId(
  notion: Client,
  databaseId: string,
): Promise<string> {
  const database = await notion.databases.retrieve({ database_id: databaseId })
  if (!isFullDatabase(database)) {
    throw new Error(
      "Notion 데이터베이스 정보를 읽을 수 없습니다. Integration이 데이터베이스에 연결되어 있는지 확인하세요.",
    )
  }

  const dataSource = database.data_sources[0]
  if (!dataSource) {
    throw new Error("Notion 데이터베이스에 데이터 소스가 없습니다.")
  }
  return dataSource.id
}

// `Migration Tasks` 데이터베이스의 모든 행(페이지)을 조회 (페이지네이션 자동 처리)
export async function queryMigrationPages(
  config: NotionConfig,
): Promise<PageObjectResponse[]> {
  const notion = new Client({ auth: config.apiKey })
  const dataSourceId = await resolveDataSourceId(notion, config.databaseId)
  const rows = await collectAllDataSourceRows(notion, {
    data_source_id: dataSourceId,
  })
  return rows.filter(isFullPage)
}
