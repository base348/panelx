import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { ModelRegistry, ModelTypeDefinition } from '../../framework'

const MODEL_GROUP_ORDER = ['loadable', 'example', 'decoration', 'equipment', 'infrastructure'] as const
const MODEL_GROUP_LABELS: Record<string, string> = {
  loadable: '可加载模型',
  example: '二次开发模型',
  decoration: '装饰物',
  equipment: '设备',
  infrastructure: '基建'
}
const MODEL_GROUP_OTHER = '其他'

export function useModelTypesByGroup(modelRegistry: ModelRegistry): ComputedRef<
  Array<{ groupKey: string; groupLabel: string; items: ModelTypeDefinition[] }>
> {
  return computed(() => {
    const all = modelRegistry.getTypes()
    const map = new Map<string, ModelTypeDefinition[]>()
    for (const def of all) {
      const categoryKey = def.category === 'example' ? 'example' : undefined
      const keyRaw = categoryKey ?? def.group
      const key =
        keyRaw && MODEL_GROUP_ORDER.includes(keyRaw as (typeof MODEL_GROUP_ORDER)[number]) ? keyRaw : MODEL_GROUP_OTHER
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(def)
    }
    const result: { groupKey: string; groupLabel: string; items: ModelTypeDefinition[] }[] = []
    for (const key of MODEL_GROUP_ORDER) {
      const items = map.get(key)
      if (items?.length) result.push({ groupKey: key, groupLabel: MODEL_GROUP_LABELS[key] ?? key, items })
    }
    const other = map.get(MODEL_GROUP_OTHER)
    if (other?.length) result.push({ groupKey: MODEL_GROUP_OTHER, groupLabel: MODEL_GROUP_OTHER, items: other })
    return result
  })
}

