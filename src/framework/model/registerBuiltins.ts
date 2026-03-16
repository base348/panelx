import { modelRegistry } from './ModelRegistry'
import type { ModelRegistryCreateConfig } from './ModelRegistry'
import { ModelLoadable } from './ModelLoadable'
import { SimpleModel } from './SimpleModel'
import { RightHandAxes } from '../models/RightHandAxes'

function registerBuiltins(): void {
  modelRegistry.register({
    id: 'gltf',
    label: 'GLB/GLTF',
    category: 'loadable',
    create(config: ModelRegistryCreateConfig) {
      const name = config.name ?? config.id ?? 'gltf'
      const source = config.source ?? ''
      return new ModelLoadable(name, 'gltf', source)
    }
  })

  modelRegistry.register({
    id: 'fbx',
    label: 'FBX',
    category: 'loadable',
    create(config: ModelRegistryCreateConfig) {
      const name = config.name ?? config.id ?? 'fbx'
      const source = config.source ?? ''
      return new ModelLoadable(name, 'fbx', source)
    }
  })

  modelRegistry.register({
    id: 'simple',
    label: 'Simple',
    category: 'builtin',
    create(config: ModelRegistryCreateConfig) {
      const name = config.name ?? config.id ?? 'simple'
      return new SimpleModel(name)
    }
  })

  modelRegistry.register({
    id: 'axes',
    label: 'Right-hand Axes',
    category: 'builtin',
    create(config: ModelRegistryCreateConfig) {
      const name = config.name ?? config.id ?? 'RightHandAxes'
      return new RightHandAxes(name)
    }
  })
}

registerBuiltins()
