type SharedSource<T> = {
  start: (emit: (data: T) => void) => void | Promise<void>
  stop: () => void | Promise<void>
}

type RegistryEntry<T> = {
  key: string
  configHash: string
  source: SharedSource<T>
  owners: Set<string>
  listeners: Set<(data: T) => void>
  started: boolean
}

class GlobalDatasourceRegistry<T = unknown> {
  private readonly entryMap = new Map<string, RegistryEntry<T>>()
  private readonly logger: (entry: Record<string, unknown>) => void

  constructor(logger?: (entry: Record<string, unknown>) => void) {
    this.logger = logger ?? ((entry) => console.log('[GlobalDatasourceRegistry]', entry))
  }

  async getOrCreate(key: string, factory: () => SharedSource<T>, configHash: string): Promise<SharedSource<T>> {
    const current = this.entryMap.get(key)
    if (!current) {
      const next: RegistryEntry<T> = {
        key,
        configHash,
        source: factory(),
        owners: new Set(),
        listeners: new Set(),
        started: false
      }
      this.entryMap.set(key, next)
      this.logger({ type: 'register', key })
      return next.source
    }
    if (current.configHash !== configHash) {
      await this.replace(key, factory, configHash)
    }
    return this.entryMap.get(key)!.source
  }

  async replace(key: string, nextFactory: () => SharedSource<T>, nextHash: string): Promise<void> {
    const current = this.entryMap.get(key)
    if (!current) return
    this.logger({ type: 'replace', key, policy: 'last_wins' })
    await current.source.stop()
    current.source = nextFactory()
    current.configHash = nextHash
    current.started = false
    await this.ensureStarted(current)
  }

  retain(key: string, ownerId: string): void {
    const entry = this.entryMap.get(key)
    if (!entry) return
    entry.owners.add(ownerId)
  }

  async release(key: string, ownerId: string): Promise<void> {
    const entry = this.entryMap.get(key)
    if (!entry) return
    entry.owners.delete(ownerId)
    if (entry.owners.size > 0) return
    await entry.source.stop()
    this.entryMap.delete(key)
    this.logger({ type: 'release', key })
  }

  async subscribe(key: string, listener: (data: T) => void): Promise<() => void> {
    const entry = this.entryMap.get(key)
    if (!entry) return () => {}
    entry.listeners.add(listener)
    await this.ensureStarted(entry)
    return () => {
      entry.listeners.delete(listener)
    }
  }

  list(): { key: string; owners: number; listeners: number; started: boolean }[] {
    return [...this.entryMap.values()].map((it) => ({
      key: it.key,
      owners: it.owners.size,
      listeners: it.listeners.size,
      started: it.started
    }))
  }

  private async ensureStarted(entry: RegistryEntry<T>): Promise<void> {
    if (entry.started) return
    entry.started = true
    await entry.source.start((data) => {
      for (const listener of entry.listeners) listener(data)
    })
  }
}

const registryGlobalKey = '__panelx_global_datasource_registry__'
const globalValue = globalThis as typeof globalThis & { [registryGlobalKey]?: GlobalDatasourceRegistry<unknown> }
export const globalDatasourceRegistry: GlobalDatasourceRegistry<unknown> =
  globalValue[registryGlobalKey] ?? (globalValue[registryGlobalKey] = new GlobalDatasourceRegistry<unknown>())

export { GlobalDatasourceRegistry }
export type { SharedSource }

