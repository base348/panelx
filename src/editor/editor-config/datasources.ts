import type { EditorConfig } from '../../types/editor'

export const editorBuiltinDatasources: NonNullable<EditorConfig['datasources']> = [
  { type: 'sse', key: 'sse_realtime', enable: true, host: '', path: '/api/sse' },
  { type: 'polling', key: 'polling_stats', host: '', path: '/api/stats', interval: 5000 }
]

