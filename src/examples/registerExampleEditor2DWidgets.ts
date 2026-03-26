/**
 * Examples（二次开发）Editor2D 扩展入口：
 * - 约定在 `src/examples/editor2d` 目录的 `*.local.ts` 导出 `register()`；
 * - 在 `register()` 内可调用 `registerWidgetTypeExtension` / `registerEditor2DConfigExtension`。
 */

let registered = false

type LocalEditor2DModule = { register?: () => void }

export function registerExampleEditor2DWidgets(): void {
  if (registered) return
  registered = true
  const localModules = import.meta.glob('./editor2d/**/*.local.ts', { eager: true }) as Record<
    string,
    LocalEditor2DModule
  >
  for (const mod of Object.values(localModules)) {
    try {
      mod.register?.()
    } catch (e) {
      console.warn('[examples] register Editor2D local widgets failed:', e)
    }
  }
}

