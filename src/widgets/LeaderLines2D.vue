<template>
  <div class="panelx-leaderLines2d" :class="props.className">
    <svg class="panelx-leaderLines2d__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id="panelx-leaderLines2d-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur :stdDeviation="fxGlowStd" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g v-if="fx === 'glow'" filter="url(#panelx-leaderLines2d-glow)">
        <line
          class="panelx-leaderLines2d__glowPath"
          :x1="origin.x"
          :y1="origin.y"
          :x2="end.x"
          :y2="end.y"
          :style="{ stroke: lineColor, strokeWidth: lineGlowWidth }"
        />
      </g>

      <line
        class="panelx-leaderLines2d__mainPath"
        :x1="origin.x"
        :y1="origin.y"
        :x2="end.x"
        :y2="end.y"
        :style="{ stroke: lineColor, strokeWidth: lineWidth }"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LeaderLines2DProps } from '../types/components'

const props = defineProps<LeaderLines2DProps>()

function clamp(v: number) {
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(100, v))
}

function clampEnd(v: number) {
  if (!Number.isFinite(v)) return 0
  // 允许向外延伸一点点，避免严格裁剪导致“到中心但露不出来”
  return Math.max(-20, Math.min(120, v))
}

const origin = computed(() => ({
  x: clamp(props.origin?.x ?? 50),
  y: clamp(props.origin?.y ?? 50)
}))

const end = computed(() => {
  const angleDeg = Number.isFinite(props.angleDeg as number) ? (props.angleDeg as number) : -45
  const length = Number.isFinite(props.length as number) ? (props.length as number) : 70
  const a = (angleDeg * Math.PI) / 180
  const dx = Math.cos(a) * length
  const dy = Math.sin(a) * length
  // SVG y 轴向下为正
  return {
    x: clampEnd(origin.value.x + dx),
    y: clampEnd(origin.value.y + dy)
  }
})

const lineColor = computed(() => props.color ?? '#6EE7B7')
const lineWidth = computed(() => props.width ?? 0.8)
const lineGlowWidth = computed(() => props.glowWidth ?? 2.6)
const fx = computed(() => props.fx ?? 'glow')

const fxGlowStd = computed(() => {
  const g = lineGlowWidth.value
  // GaussianBlur stdDeviation 越大越“糊”，这里做个简单映射
  return Math.max(0.6, Math.min(6, g / 1.6))
})
</script>

<style scoped>
.panelx-leaderLines2d {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.panelx-leaderLines2d__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.panelx-leaderLines2d__glowPath {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.35;
}

.panelx-leaderLines2d__mainPath {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.95;
}

</style>

