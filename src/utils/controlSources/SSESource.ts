import type { ControlPush, ControlSource, ControlSourceStatus } from '../../types'
import { normalizeControlEnvelope } from './normalizers'

export type SSESourceOptions = {
  sourceId: string
  url: string
  eventName?: string
  reconnectMs?: number
  maxReconnectMs?: number
  parseMessage?: (message: MessageEvent<string>, eventName?: string) => unknown | unknown[]
  logger?: (entry: Record<string, unknown>) => void
}

export class SSESource implements ControlSource {
  readonly id: string
  private readonly url: string
  private readonly eventName?: string
  private readonly reconnectMs: number
  private readonly maxReconnectMs: number
  private readonly parseMessage: (message: MessageEvent<string>, eventName?: string) => unknown | unknown[]
  private readonly logger: (entry: Record<string, unknown>) => void

  private es: EventSource | null = null
  private push: ControlPush | null = null
  private currentStatus: ControlSourceStatus = 'idle'
  private retryMs: number
  private retryTimer: ReturnType<typeof setTimeout> | null = null

  constructor(options: SSESourceOptions) {
    this.id = options.sourceId
    this.url = options.url
    this.eventName = options.eventName
    this.reconnectMs = Math.max(200, Math.trunc(options.reconnectMs ?? 1000))
    this.maxReconnectMs = Math.max(this.reconnectMs, Math.trunc(options.maxReconnectMs ?? 15000))
    this.retryMs = this.reconnectMs
    this.parseMessage =
      options.parseMessage ??
      ((msg) => {
        try {
          return JSON.parse(msg.data)
        } catch {
          return null
        }
      })
    this.logger = options.logger ?? ((entry) => console.log('[SSESource]', entry))
  }

  async start(push: ControlPush): Promise<void> {
    await this.stop()
    this.push = push
    this.currentStatus = 'running'
    this.retryMs = this.reconnectMs
    this.logger({ type: 'sse_client_status', sourceId: this.id, status: 'starting', url: this.url })
    this.connect()
  }

  async stop(): Promise<void> {
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.retryTimer = null
    if (this.es) this.es.close()
    this.es = null
    this.push = null
    this.currentStatus = 'stopped'
    this.logger({ type: 'sse_client_status', sourceId: this.id, status: 'stopped' })
  }

  status(): ControlSourceStatus {
    return this.currentStatus
  }

  private connect(): void {
    if (!this.push || this.currentStatus === 'stopped') return
    const es = new EventSource(this.url)
    this.es = es
    this.logger({
      type: 'sse_client_status',
      sourceId: this.id,
      status: 'connecting',
      url: this.url,
      eventName: this.eventName ?? 'message'
    })

    es.onopen = () => {
      this.currentStatus = 'running'
      this.retryMs = this.reconnectMs
      this.logger({ type: 'sse_client_status', sourceId: this.id, status: 'connected' })
    }

    const handler = (event: MessageEvent<string>): void => {
      if (!this.push) return
      const mapped = this.parseMessage(event, this.eventName)
      const list = Array.isArray(mapped) ? mapped : [mapped]
      let receivedCount = 0
      for (const item of list) {
        const env = normalizeControlEnvelope(this.id, item)
        if (!env) continue
        const p = this.push
        if (!p) break
        p(env)
        receivedCount += 1
      }
      this.logger({
        type: 'sse_data_received',
        sourceId: this.id,
        eventName: this.eventName ?? 'message',
        rawLength: typeof event.data === 'string' ? event.data.length : 0,
        envelopeCount: receivedCount
      })
    }

    if (this.eventName) es.addEventListener(this.eventName, handler as EventListener)
    else es.onmessage = handler

    es.onerror = () => {
      if (this.currentStatus === 'stopped') return
      this.currentStatus = 'error'
      this.logger({ type: 'sse_client_status', sourceId: this.id, status: 'error', retryMs: this.retryMs })
      this.logger({ type: 'sse_error', sourceId: this.id, retryMs: this.retryMs })
      es.close()
      this.es = null
      this.retryTimer = setTimeout(() => {
        this.currentStatus = 'running'
        this.logger({ type: 'sse_client_status', sourceId: this.id, status: 'reconnecting', retryMs: this.retryMs })
        this.retryMs = Math.min(this.retryMs * 2, this.maxReconnectMs)
        this.connect()
      }, this.retryMs)
    }
  }
}

