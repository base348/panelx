<template>
  <div class="panelx-screen-title">
    <span class="panelx-screen-title-line line-l" />
    <div class="panelx-screen-title-wrap">
      <div class="panelx-screen-title-bg" />
      <h1 class="panelx-screen-title-text">{{ text }}</h1>
    </div>
    <span class="panelx-screen-title-line line-r" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<style scoped>
.panelx-screen-title {
  position: relative;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 14px 0;
  width: 100%;
}
.panelx-screen-title-line {
  flex: 1;
  max-width: 240px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 212, 255, 0.5),
    rgba(0, 212, 255, 0.8),
    transparent
  );
}
.panelx-screen-title-line.line-r {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 212, 255, 0.8),
    rgba(0, 212, 255, 0.5),
    transparent
  );
}
.panelx-screen-title-wrap {
  position: relative;
  padding: 0 20px;
}
.panelx-screen-title-bg {
  position: absolute;
  inset: -6px -12px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, transparent 50%, rgba(0, 212, 255, 0.05) 100%);
  border: 1px solid rgba(0, 212, 255, 0.35);
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
}
.panelx-screen-title-text {
  position: relative;
  margin: 0;
  font-size: clamp(1.35rem, 2.4vw, 2.1rem);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.98);
  text-shadow: 0 0 24px rgba(0, 212, 255, 0.6), 0 0 48px rgba(0, 212, 255, 0.35);
  letter-spacing: 0.12em;
  white-space: nowrap;
}
</style>
