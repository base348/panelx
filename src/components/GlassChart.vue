<template>
  <div class="panelx-glass-chart">
    <div class="panelx-glass-chart-head">
      <div class="panelx-glass-chart-titles">
        <span class="panelx-glass-chart-title">{{ title }}</span>
        <span v-if="subTitle" class="panelx-glass-chart-subtitle">{{ subTitle }}</span>
      </div>
      <span class="panelx-glass-chart-corner corner-tl" />
      <span class="panelx-glass-chart-corner corner-tr" />
      <span class="panelx-glass-chart-corner corner-bl" />
      <span class="panelx-glass-chart-corner corner-br" />
    </div>
    <div class="panelx-glass-chart-body">
      <Chart
        :options="chartOptions"
        width="100%"
        :height="chartHeight || '100%'"
        :theme="chartTheme"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import Chart from './Chart.vue'

const props = withDefaults(
  defineProps<{
    title: string
    /** 英文副标题，如 ORDER REVIEW */
    subTitle?: string
    options: EChartsOption
    chartHeight?: string
    theme?: 'dark' | 'light'
  }>(),
  {
    chartHeight: '100%',
    theme: 'dark'
  }
)

const chartOptions = computed(() => props.options)
const chartHeight = computed(() => props.chartHeight ?? '100%')
const chartTheme = computed(() => (props.theme === 'dark' ? 'dark' : undefined))
</script>

<style scoped>
.panelx-glass-chart {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(10, 25, 47, 0.75);
  border: 1px solid rgba(0, 212, 255, 0.4);
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.15), inset 0 0 60px rgba(0, 212, 255, 0.03);
  overflow: hidden;
}
.panelx-glass-chart-head {
  flex-shrink: 0;
  padding: 4px 14px 4px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.25);
}
.panelx-glass-chart-titles {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 8px;
  flex-wrap: nowrap;
}
.panelx-glass-chart-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}
.panelx-glass-chart-subtitle {
  font-size: 0.6875rem;
  font-weight: 500;
  color: rgba(0, 212, 255, 0.75);
  letter-spacing: 0.06em;
  flex-shrink: 0;
}
.panelx-glass-chart-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: rgba(0, 212, 255, 0.6);
  border-style: solid;
  border-width: 0;
}
.corner-tl {
  top: 6px;
  left: 6px;
  border-top-width: 2px;
  border-left-width: 2px;
}
.corner-tr {
  top: 6px;
  right: 6px;
  border-top-width: 2px;
  border-right-width: 2px;
}
.corner-bl {
  bottom: 6px;
  left: 6px;
  border-bottom-width: 2px;
  border-left-width: 2px;
}
.corner-br {
  bottom: 6px;
  right: 6px;
  border-bottom-width: 2px;
  border-right-width: 2px;
}
.panelx-glass-chart-body {
  flex: 1;
  min-height: 0;
  padding: 8px;
}
.panelx-glass-chart-body :deep(div) {
  width: 100% !important;
  height: 100% !important;
}
</style>
