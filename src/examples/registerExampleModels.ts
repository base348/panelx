/**
 * Examples（二次开发）模型注册入口。
 *
 * 说明：
 * - 框架（framework）只提供少量内置模型；
 * - 二次开发模型放在 src/examples/models/ 下，并由 examples 在启动时显式注册。
 */
import { modelRegistry } from '../framework/model/ModelRegistry'

let registered = false

export function registerExampleModels(): void {
  if (registered) return
  registered = true

  // 可选：加载本地（被 gitignore）测试模型的注册逻辑
  // 约定：在 src/examples/models/ 下创建任意 `*.local.ts` 文件，并导出 `register(modelRegistry)` 函数
  const localModules = import.meta.glob('./models/**/*.local.ts', { eager: true }) as Record<
    string,
    { register?: (r: typeof modelRegistry) => void }
  >
  for (const mod of Object.values(localModules)) {
    try {
      mod.register?.(modelRegistry)
    } catch (e) {
      console.warn('[examples] register local models failed:', e)
    }
  }

}

