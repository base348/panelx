/**
 * 3D 模型预设：供 3D 编辑器「可用模型」列表展示与预加载使用。
 * source 为以 / 开头的路径时，会从站点根目录请求（Vite 下即 public 目录）。
 * 请将对应 .glb/.fbx 文件放入 public 目录，否则请求会 404 并触发 "Unexpected token '<'"（返回 index.html）。
 */
export interface ModelPresetItem {
  id: string
  label: string
  /** 对应 ModelRegistry 的 typeId，如 gltf、fbx */
  typeId: string
  /** 模型资源地址（可加载类型必填） */
  source: string
  /** 实例名称，不填则用 id */
  name?: string
}

/** 预加载的 3D 模型预设列表 */
export const modelPresets: ModelPresetItem[] = [
  {
    id: 'robot',
    label: 'Robot',
    typeId: 'gltf',
    source: '/RobotExpressive.glb',
    name: 'robot'
  },
  {
    id: 'product-line',
    label: 'Product Line',
    typeId: 'gltf',
    source: '/product-line.glb',
    name: 'product-line'
  }
]
