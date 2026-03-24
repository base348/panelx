<template>
  <div
    class="panelx-example-workshop"
    :style="{ background: workshopDemoConfig?.background ?? 'transparent' }"
  >
    <div class="panelx-example-workshop-wrap panelx-dashboard-wrap">
      <Dashboard :config="workshopDemoConfig" :datasources="datasources" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Dashboard } from '../components'
import { convertDashboardConfigPxToPercent } from '../core/size'
import { setDebugFromConfig } from '../utils/logManager'
import type { DashboardConfig } from '../types/dashboard'
import type { BackendDataSourceConfig } from '../types'

defineProps<{
  datasources?: BackendDataSourceConfig[]
}>()

/** 车间大屏配置：先空白，由异步加载 JSON（模拟 API）填充 */
const workshopBaseConfig = ref<DashboardConfig>({
  design: { width: 2560, height: 1080 },
  widgets2D: []
})

/** 模拟 API：异步加载车间大屏 JSON 配置；加载后立刻将 layout 从 px 转为 percent，并同步 debug 到 localStorage */
async function loadWorkshopConfig() {
  const mod = await import('../demo/dashboard_config.json')
  const base = mod.default as unknown as DashboardConfig
  setDebugFromConfig(base.debug ?? false)
  workshopBaseConfig.value = convertDashboardConfigPxToPercent({ ...base } as DashboardConfig)
}

/** TopBar 业务数据：时间、温湿度 */
const topBarDateTime = ref('')
const topBarTemperature = ref('25℃')
const topBarHumidity = ref('50%rh')

const WEEK_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
function formatTopBarTime(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const week = WEEK_NAMES[d.getDay()]
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${week} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function refreshTopBar() {
  topBarDateTime.value = formatTopBarTime()
}

let topBarRefreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  loadWorkshopConfig()
  refreshTopBar()
  topBarRefreshTimer = setInterval(refreshTopBar, 2300)
})

onUnmounted(() => {
  if (topBarRefreshTimer) {
    clearInterval(topBarRefreshTimer)
    topBarRefreshTimer = null
  }
})

/** 车间大屏展示用配置：在 base 上注入 TopBar 时间/温湿度 */
const workshopDemoConfig = computed<DashboardConfig>(() => {
  const base = workshopBaseConfig.value
  return {
    ...base,
    widgets2D: base.widgets2D.map((w) =>
      w.id === 'ws-topbar'
        ? { ...w, props: { ...w.props, datetime: topBarDateTime.value, temperature: topBarTemperature.value, humidity: topBarHumidity.value } }
        : w
    )
  }
})
</script>

<style scoped>
.panelx-example-workshop {
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 0;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  overflow: hidden;
  box-sizing: border-box;
}
.panelx-example-workshop-wrap {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
}
</style>
