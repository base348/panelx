import type { DataSource } from '../../types/comm'
import type { PollingSourceConfig } from '../../types/comm'
import { request } from '../../api/request'
import { dataChainLog } from './dataChainLog'

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
    dataChainLog('PollingSource.start', {
      key: this.config.key,
      url: this.config.url,
      interval: this.config.interval
    })
    const fetchData = async () => {
      try {
        const res = this.config.method === 'POST'
          ? await request.post<unknown>(this.config.url, this.config.body)
          : await request.get<unknown>(this.config.url)
        const data = res.data
        dataChainLog('PollingSource.fetch', {
          key: this.config.key,
          genericListeners: this.listeners.length
        })
        this.listeners.forEach((cb) => cb(data as T))
      } catch (e) {
        dataChainLog('PollingSource.fetch.error', {
          key: this.config.key,
          message: String(e)
        })
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
