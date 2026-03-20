<template>
  <div class="panelx-parkstats-root">
    <GlassPanel :title="title" :sub-title="subTitle">
      <div class="panelx-parkstats">
      <div class="panelx-parkstats-fx" aria-hidden="true"></div>

      <div class="panelx-parkstats-left">
        <div class="panelx-parkstats-pill">{{ ringLabel }}</div>
        <div class="panelx-parkstats-ring" :style="{ ['--rate' as any]: `${clampedRate}%` }">
          <div class="panelx-parkstats-ring-core">
            <div class="panelx-parkstats-ring-value">
              <span class="num">{{ Math.round(clampedRate) }}</span><span class="pct">%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panelx-parkstats-right">
        <div v-for="(it, idx) in items" :key="idx" class="panelx-parkstats-row">
          <div class="panelx-parkstats-row-head">
            <span class="label">
              <span class="dot" :style="{ '--dot-color': resolveColor(it, idx) }" />
              {{ it.label }}
            </span>
            <span class="value">
              {{ it.value }}
              <span v-if="it.unit" class="unit">{{ it.unit }}</span>
            </span>
          </div>
          <div class="panelx-parkstats-bar">
            <div
              class="panelx-parkstats-bar-fill"
              :style="{
                width: `${resolvePercent(it)}%`,
                background: `linear-gradient(90deg, ${resolveColor(it, idx)} 0%, transparent 100%)`,
                boxShadow: `0 0 8px color-mix(in srgb, ${resolveColor(it, idx)} 40%, transparent)`
              }"
            />
          </div>
        </div>
      </div>
    </div>
    </GlassPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GlassPanel from './GlassPanel.vue'

export type ParkScaleStatsItem = {
  label: string
  value: string | number
  unit?: string
  /** 0-100 */
  percent?: number
  /** 覆盖默认配色 */
  color?: string
}

const props = withDefaults(
  defineProps<{
    title?: string
    subTitle?: string
    /** 左侧圆环百分比 0-100 */
    rate?: number
    /** 左侧 pill 文案 */
    ringLabel?: string
    /** 右侧三行指标 */
    items?: ParkScaleStatsItem[]
    /** 默认三色（蓝/青/黄） */
    palette?: [string, string, string]
  }>(),
  {
    title: '园区规模统计',
    subTitle: 'STATISTICS OF PARK SCALE',
    rate: 82,
    ringLabel: '入驻率',
    palette: () => ['#70a1ff', '#48dbfb', '#feca57'],
    items: () => [
      { label: '园区总面积', value: 5790, unit: 'm²', percent: 78 },
      { label: '楼栋数量', value: 4, unit: '栋', percent: 46 },
      { label: '办公区域', value: 264, unit: '个', percent: 62 }
    ]
  }
)

const clampedRate = computed(() => clamp01to100(props.rate))

function clamp01to100(v: number | undefined): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, n))
}

function resolvePercent(it: ParkScaleStatsItem): number {
  return clamp01to100(it.percent ?? 0)
}

function resolveColor(it: ParkScaleStatsItem, idx: number): string {
  if (it.color) return it.color
  const pal = props.palette
  return pal[idx % pal.length] ?? '#6FA8FF'
}
</script>

<style scoped>
.panelx-parkstats-root {
  width: 100%;
  height: 100%;
  min-height: 0;
}
.panelx-parkstats-root :deep(.panelx-glass-panel) {
  background: rgba(35, 45, 53, 0.92);
  border-color: rgba(0, 229, 255, 0.45);
  box-shadow: 0 0 0.75rem rgba(0, 229, 255, 0.12), inset 0 0 3rem rgba(0, 0, 0, 0.2);
}
.panelx-parkstats-root :deep(.panelx-glass-panel-head) {
  border-bottom-color: rgba(255, 255, 255, 0.12);
}
.panelx-parkstats-root :deep(.panelx-glass-panel-subtitle) {
  color: rgba(0, 229, 255, 0.9);
}
.panelx-parkstats-root :deep(.panelx-glass-panel-corner) {
  border-color: rgba(0, 229, 255, 0.65);
}

.panelx-parkstats {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 38% 62%;
  gap: 10px;
  padding: 6px 10px 10px;
  box-sizing: border-box;
}

/* 贴近截图：深灰蓝底 + 轻微横纹 */
.panelx-parkstats-fx {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.28;
  background:
    radial-gradient(circle at 20% 10%, rgba(255,255,255,0.06) 0%, transparent 45%),
    repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 3px, transparent 6px);
  mix-blend-mode: screen;
}

.panelx-parkstats-left {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  gap: 10px;
}

.panelx-parkstats-pill {
  align-self: flex-start;
  padding: 5px 12px;
  margin-left: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.95);
  background: transparent;
  border: 1px solid rgba(0, 229, 255, 0.6);
  box-shadow: none;
  border-radius: 6px;
  letter-spacing: 0.06em;
}

.panelx-parkstats-ring {
  width: min(140px, 100%);
  aspect-ratio: 1 / 1;
  border-radius: 999px;
  position: relative;
  background: conic-gradient(
    from 210deg,
    rgba(0, 229, 255, 0.85) var(--rate, 0%),
    rgba(255, 255, 255, 0.08) 0
  );
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.2), inset 0 0 16px rgba(0, 229, 255, 0.06);
  filter: saturate(1.05);
}

.panelx-parkstats-ring::before {
  content: '';
  position: absolute;
  inset: 8%;
  border-radius: 999px;
  background: rgba(35, 45, 53, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.4);
}

.panelx-parkstats-ring-core {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.panelx-parkstats-ring-value {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  gap: 2px;
  color: #fff;
  text-shadow: 0 0 16px rgba(0, 229, 255, 0.35);
}
.panelx-parkstats-ring-value .num {
  font-size: 26px;
  font-weight: 700;
}
.panelx-parkstats-ring-value .pct {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.95;
}

.panelx-parkstats-right {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.panelx-parkstats-row {
  min-width: 0;
}

.panelx-parkstats-row-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
  min-width: 0;
}

.panelx-parkstats-row-head .label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panelx-parkstats-row-head .dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: var(--dot-color, rgba(255,255,255,0.3));
  box-shadow: none;
  border: none;
  flex-shrink: 0;
}

.panelx-parkstats-row-head .value {
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}
.panelx-parkstats-row-head .unit {
  margin-left: 4px;
  font-size: 11px;
  opacity: 0.85;
  font-weight: 600;
}

.panelx-parkstats-bar {
  position: relative;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.panelx-parkstats-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 240ms ease-out;
}
</style>

