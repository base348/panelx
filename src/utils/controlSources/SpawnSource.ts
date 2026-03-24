import type { ControlPush, ControlSource, ControlSourceStatus } from '../../types'
import { normalizeControlEnvelope } from './normalizers'

export type SpawnSourceOptions = {
  sourceId: string
  intervalMs?: number
  produce: () => unknown | unknown[] | Promise<unknown | unknown[]>
  logger?: (entry: Record<string, unknown>) => void
}

export class SpawnSource implements ControlSource {
  readonly id: string
  private readonly intervalMs: number
  private readonly produce: SpawnSourceOptions['produce']
  private readonly logger: (entry: Record<string, unknown>) => void
  private timer: ReturnType<typeof setInterval> | null = null
  private push: ControlPush | null = null
  private currentStatus: ControlSourceStatus = 'idle'

  constructor(options: SpawnSourceOptions) {
    this.id = options.sourceId
    this.intervalMs = Math.max(10, Math.trunc(options.intervalMs ?? 1000))
    this.produce = options.produce
    this.logger = options.logger ?? ((entry) => console.log('[SpawnSource]', entry))
  }

  async start(push: ControlPush): Promise<void> {
    await this.stop()
    this.push = push
    this.currentStatus = 'running'
    this.timer = setInterval(() => {
      void this.tick()
    }, this.intervalMs)
    await this.tick()
  }

  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    this.push = null
    this.currentStatus = 'stopped'
  }

  status(): ControlSourceStatus {
    return this.currentStatus
  }

  private async tick(): Promise<void> {
    if (!this.push || this.currentStatus !== 'running') return
    try {
      const out = await this.produce()
      const list = Array.isArray(out) ? out : [out]
      for (const item of list) {
        const env = normalizeControlEnvelope(this.id, item)
        if (!env) continue
        const p = this.push
        if (!p) break
        p(env)
      }
    } catch (err) {
      this.currentStatus = 'error'
      this.logger({ type: 'produce_error', sourceId: this.id, error: String(err) })
    }
  }
}

