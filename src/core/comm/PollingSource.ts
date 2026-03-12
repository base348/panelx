import type { DataSource } from '../../types/comm'
import type { PollingSourceConfig } from '../../types/comm'
import { request } from '../../api/request'

export class PollingSource<T = unknown> implements DataSource<T> {
  private config: PollingSourceConfig
  private timer: ReturnType<typeof setInterval> | null = null
  private listeners: Array<(data: T) => void> = []

  constructor(config: PollingSourceConfig) {
    this.config = config
  }

  getKey(): string {
    return this.config.key
  }

  start(): void {
    if (this.timer) return
    const fetchData = async () => {
      try {
        const res = this.config.method === 'POST'
          ? await request.post<T>(this.config.url, this.config.body)
          : await request.get<T>(this.config.url)
        const data = res.data as T
        this.listeners.forEach((cb) => cb(data as T))
      } catch (_e) {
        // 可在此上报错误
      }
    }
    fetchData()
    this.timer = setInterval(fetchData, this.config.interval)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  onData(callback: (data: T) => void): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }
}
