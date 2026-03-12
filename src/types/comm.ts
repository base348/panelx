/** 数据通信：统一框架，轮询/SSE 等各自实现 */

export type DataSourceType = 'polling' | 'sse'

export interface DataSourceBaseConfig {
  type: DataSourceType
  /** 唯一标识 */
  key: string
}

/** API 轮询配置 */
export interface PollingSourceConfig extends DataSourceBaseConfig {
  type: 'polling'
  url: string
  interval: number
  /** 请求方法 */
  method?: 'GET' | 'POST'
  /** 请求体（POST） */
  body?: Record<string, unknown>
}

/** SSE 配置 */
export interface SSESourceConfig extends DataSourceBaseConfig {
  type: 'sse'
  url: string
}

export type DataSourceConfig = PollingSourceConfig | SSESourceConfig

export interface DataSource<T = unknown> {
  getKey(): string
  start(): void
  stop(): void
  /** 订阅数据更新 */
  onData(callback: (data: T) => void): () => void
}
