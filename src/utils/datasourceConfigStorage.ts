import type { BackendDataSourceConfig } from '../types'

export const DATASOURCE_CONFIG_STORAGE_KEY = 'PanelX_DATASOURCE_CONFIG'

function normalizeList(input: unknown): BackendDataSourceConfig[] {
  if (!Array.isArray(input)) return []
  const out: BackendDataSourceConfig[] = []
  for (const item of input) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    const type = rec.type === 'sse' || rec.type === 'polling' ? rec.type : null
    const key = String(rec.key ?? '').trim()
    if (!type || !key) continue
    if (type === 'sse') {
      out.push({
        type,
        key,
        enable: rec.enable === true,
        url: typeof rec.url === 'string' ? rec.url : undefined,
        host: typeof rec.host === 'string' ? rec.host : undefined,
        path: typeof rec.path === 'string' ? rec.path : undefined
      })
    } else {
      out.push({
        type,
        key,
        enable: rec.enable === true,
        url: typeof rec.url === 'string' ? rec.url : undefined,
        host: typeof rec.host === 'string' ? rec.host : undefined,
        path: typeof rec.path === 'string' ? rec.path : undefined,
        interval: Number.isFinite(Number(rec.interval)) ? Number(rec.interval) : undefined,
        method: rec.method === 'POST' ? 'POST' : 'GET',
        body: rec.body && typeof rec.body === 'object' ? (rec.body as Record<string, unknown>) : undefined
      })
    }
  }
  return out
}

export function loadDatasourceConfigFromStorage(): BackendDataSourceConfig[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(DATASOURCE_CONFIG_STORAGE_KEY)
    if (!raw) return []
    return normalizeList(JSON.parse(raw))
  } catch {
    return []
  }
}

export function saveDatasourceConfigToStorage(list: BackendDataSourceConfig[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(DATASOURCE_CONFIG_STORAGE_KEY, JSON.stringify(list))
}

export function clearDatasourceConfigStorage(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(DATASOURCE_CONFIG_STORAGE_KEY)
}

