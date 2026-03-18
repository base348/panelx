/**
 * 从 demo 数据注册可加载模型类型，供 3D 编辑器与运行时使用。
 * 模型文件放在 public/models/，定义在 demo/loadableModels.json，由此处注册并执行加载。
 */
import { modelRegistry } from '../framework/model/ModelRegistry'
import type { ModelRegistryCreateConfig } from '../framework/model/ModelRegistry'
import { ModelLoadable } from '../framework/model/ModelLoadable'

import loadableModels from '../demo/loadableModels.json'

export interface LoadableModelDefinition {
  id: string
  label: string
  typeId: string
  source: string
  name?: string
}

const items = loadableModels as LoadableModelDefinition[]

let registered = false

export function registerLoadableModels(): void {
  if (registered) return
  registered = true
  for (const item of items) {
    if (!item.id || !item.source || !item.typeId) continue
    const source = item.source
    const typeId = item.typeId
    const label = item.label || item.id
    modelRegistry.register({
      id: item.id,
      label,
      category: 'loadable',
      group: 'loadable',
      create(config: ModelRegistryCreateConfig) {
        const name = config.name ?? config.id ?? item.id
        return new ModelLoadable(name, typeId, source)
      }
    })
  }
}

export function getLoadableModelDefinitions(): LoadableModelDefinition[] {
  return [...items]
}

