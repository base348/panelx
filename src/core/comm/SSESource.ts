import type { DataSource } from '../../types/comm'
import type { SSESourceConfig } from '../../types/comm'

export class SSESource<T = unknown> implements DataSource<T> {
  private config: SSESourceConfig
  private eventSource: EventSource | null = null
  private listeners: Array<(data: T) => void> = []

  constructor(config: SSESourceConfig) {
    this.config = config
  }

  getKey(): string {
    return this.config.key
  }

  start(): void {
    if (this.eventSource) return
    const es = new EventSource(this.config.url)
    this.eventSource = es
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as T
        this.listeners.forEach((cb) => cb(data))
      } catch (_e) {
        // 非 JSON 时可按需把 event.data 当 T 传
        this.listeners.forEach((cb) => cb(event.data as unknown as T))
      }
    }
    es.onerror = () => {
      // 可重连或通知
    }
  }

  stop(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  onData(callback: (data: T) => void): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }
}
