<template>
  <div class="panelx-device-card">
    <div class="panelx-device-card-title">当前设备</div>
    <div class="panelx-device-card-border" />
    <ul class="panelx-device-card-list">
      <li
        v-for="(item, i) in items"
        :key="i"
        class="panelx-device-card-row"
      >
        <span class="icon">{{ item.icon || '▸' }}</span>
        <span class="label">{{ item.label }}</span>
        <span class="value">{{ item.value }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{ label: string; value: string; icon?: string }>
}>()
</script>

<style scoped>
.panelx-device-card {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 14px 16px;
  background: rgba(10, 25, 47, 0.85);
  border: 1px solid rgba(0, 212, 255, 0.5);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2), inset 0 0 40px rgba(0, 212, 255, 0.05);
}
.panelx-device-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(0, 212, 255, 0.95);
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
}
.panelx-device-card-border {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: 0 0 1px rgba(0, 212, 255, 0.3);
}
.panelx-device-card-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.panelx-device-card-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.9);
}
.panelx-device-card-row .icon {
  color: rgba(0, 212, 255, 0.8);
  flex-shrink: 0;
}
.panelx-device-card-row .label {
  color: rgba(255, 255, 255, 0.7);
  min-width: 90px;
}
.panelx-device-card-row .value {
  color: rgba(255, 255, 255, 0.95);
}
</style>
