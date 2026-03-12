<template>
  <div class="panelx-progress-list">
    <div v-if="title || subTitle" class="panelx-progress-list-head">
      <span v-if="title" class="panelx-progress-list-title">{{ title }}</span>
      <span v-if="subTitle" class="panelx-progress-list-subtitle">{{ subTitle }}</span>
    </div>
    <div
      v-for="(item, i) in items"
      :key="i"
      class="panelx-progress-list-row"
    >
      <span class="label">{{ item.label }}</span>
      <div class="bar-wrap">
        <div
          class="bar-fill"
          :style="{ width: `${Math.min(100, Math.max(0, item.percent))}%` }"
        />
      </div>
      <span class="value">{{ item.value }}</span>
      <span class="percent">{{ item.percent }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subTitle?: string
  items: Array<{ label: string; value: string | number; percent: number }>
}>()
</script>

<style scoped>
.panelx-progress-list {
  width: 100%;
  height: 100%;
  padding: 12px 14px;
  background: rgba(10, 25, 47, 0.75);
  border: 1px solid rgba(0, 212, 255, 0.4);
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.1);
}
.panelx-progress-list-head {
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.25);
}
.panelx-progress-list-title {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}
.panelx-progress-list-subtitle {
  display: block;
  font-size: 0.6875rem;
  font-weight: 500;
  color: rgba(0, 212, 255, 0.75);
  letter-spacing: 0.06em;
  margin-top: 2px;
}
.panelx-progress-list-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.9);
}
.panelx-progress-list-row .label {
  min-width: 64px;
  color: rgba(255, 255, 255, 0.8);
}
.panelx-progress-list-row .bar-wrap {
  flex: 1;
  height: 8px;
  background: rgba(0, 212, 255, 0.15);
  border-radius: 4px;
  overflow: hidden;
}
.panelx-progress-list-row .bar-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.6), rgba(0, 212, 255, 0.9));
  border-radius: 4px;
  transition: width 0.3s ease;
}
.panelx-progress-list-row .value {
  min-width: 52px;
  text-align: right;
  color: rgba(0, 212, 255, 0.95);
}
.panelx-progress-list-row .percent {
  min-width: 44px;
  color: rgba(255, 255, 255, 0.8);
}
</style>
