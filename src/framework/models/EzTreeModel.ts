import { Scene } from 'three'
import { Tree } from '@dgreenheck/ez-tree'
import { Model } from '../model/Model'
import type { PropDefinition } from '../model/ModelRegistry'

const EZ_TREE_PRESETS = [
  'Ash Small',
  'Ash Medium',
  'Ash Large',
  'Aspen Small',
  'Aspen Medium',
  'Aspen Large',
  'Oak Small',
  'Oak Medium',
  'Oak Large',
  'Pine Small',
  'Pine Medium',
  'Pine Large',
  'Bush 1',
  'Bush 2',
  'Bush 3'
] as const

const DEFAULT_PRESET = 'Ash Small'
const TREE_SCALE = 0.1

function createTreeWithPreset(presetName: string): Tree {
  console.log('[EzTreeModel] createTreeWithPreset', presetName)
  const tree = new Tree()
  try {
    tree.loadPreset(presetName)
  } catch {
    console.log('[EzTreeModel] loadPreset failed', presetName)
    tree.loadPreset(DEFAULT_PRESET)
  }
  tree.generate()
  tree.scale.set(TREE_SCALE, TREE_SCALE, TREE_SCALE)
  return tree
}

/** 使用 @dgreenheck/ez-tree 生成的程序化树模型，可与场景中其他模型同尺度使用 */
export class EzTreeModel extends Model {
  static supportedProps: PropDefinition[] = [
    { key: 'preset', label: 'Preset', enum: [...EZ_TREE_PRESETS] }
  ]

  tree: Tree
  constructor(name = 'EzTree') {
    super(name)
    const scene = new Scene()
    console.log('[EzTreeModel] constructor', DEFAULT_PRESET)
    this.tree = createTreeWithPreset(DEFAULT_PRESET)
    scene.add(this.tree)
    this.setScene(scene)
  }

  update(_delta: number) {
    super.update(_delta)
    this.tree.update(_delta)
  }

  override propUpdate(key: string, value: unknown): void {
    console.log('[EzTreeModel] propUpdate', key, value)
    if (key === 'preset' && typeof value === 'string' && value.trim() !== '') {
      const preset = value.trim()
      if (EZ_TREE_PRESETS.includes(preset as (typeof EZ_TREE_PRESETS)[number])) {
        try {
          const newTree = createTreeWithPreset(preset)
          if (this.scene) {
            this.scene.remove(this.tree)
            this.scene.add(newTree)
          }
          this.tree = newTree
        } catch (e) {
          console.warn('[EzTreeModel] createTreeWithPreset failed:', preset, e)
        }
      }
    } else {
      super.propUpdate(key, value)
    }
  }
}
