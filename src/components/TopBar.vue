<template>
  <div class="panelx-topbar" :style="rootStyle">
    <div class="panelx-topbar-left">
      <span class="panelx-topbar-datetime">{{ datetime }}</span>
    </div>
    <div class="panelx-topbar-right">
      <span class="panelx-topbar-item">
        <span class="icon">🌡</span>
        <span>室内温度 {{ temperature }}</span>
      </span>
      <span class="panelx-topbar-item">
        <span class="icon">💧</span>
        <span>室内湿度 {{ humidity }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    datetime?: string
    temperature?: string
    humidity?: string
    /** 背景，支持 CSS 颜色或渐变，默认透明 */
    background?: string
  }>(),
  {
    datetime: '',
    temperature: '25℃',
    humidity: '50%rh',
    background: 'transparent'
  }
)

const rootStyle = computed(() => ({
  background: props.background
}))

const datetime = computed(() => {
  if (props.datetime) return props.datetime
  const d = new Date()
  const week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()]
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${week} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})
</script>

<style scoped>
/* 容器高度 = paddingTop + paddingBottom + fontSize×lineHeight；令三者之和 = 100% 高度 */
/* padding 各 15% 高度 → 行高占 70% 高度 → fontSize×1.2 = 0.7×H → fontSize = 58.33cqh */
.panelx-topbar {
  container-type: size;
  container-name: topbar;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 0.15cqh 24px;
  color: rgba(255, 255, 255, 0.85);
  font-size: clamp(10px, 58.33cqh, 28px);
  line-height: 1.2;
  box-sizing: border-box;
}
.panelx-topbar-left {
  display: flex;
  align-items: center;
}
.panelx-topbar-datetime {
  color: rgba(0, 212, 255, 0.9);
}
.panelx-topbar-right {
  display: flex;
  align-items: center;
  gap: 0.8em;
}
.panelx-topbar-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
}
.panelx-topbar-item .icon {
  opacity: 0.9;
  font-size: 1em;
}
</style>
