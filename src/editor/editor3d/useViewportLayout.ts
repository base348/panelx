import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'

type HasGetSize = { getSize: () => { x: number; y: number } }

export function useViewportLayout(
  designSize: { width: number; height: number },
  worldRef: Ref<HasGetSize | null>
): {
  dpr: ComputedRef<number>
  viewportSize: ComputedRef<{ x: number; y: number }>
  canvasPixelSize: ComputedRef<{ x: number; y: number }>
  worldOuterStyle: ComputedRef<Record<string, string>>
} {
  const dpr = computed(() => Number(window.devicePixelRatio) || 1)
  const viewportSize = computed(() => worldRef.value?.getSize() ?? { x: 0, y: 0 })
  const canvasPixelSize = computed(() => ({
    x: Math.max(0, Math.round(viewportSize.value.x * dpr.value)),
    y: Math.max(0, Math.round(viewportSize.value.y * dpr.value))
  }))
  const worldOuterStyle = computed(() => {
    const w = Math.max(1, Number(designSize.width) || 1920)
    const h = Math.max(1, Number(designSize.height) || 1080)
    return {
      aspectRatio: `${w} / ${h}`,
      maxWidth: '100%',
      maxHeight: '100%'
    }
  })
  return { dpr, viewportSize, canvasPixelSize, worldOuterStyle }
}

