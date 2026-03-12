<template>
  <div
    ref="containerRef"
    class="panelx-dashboard"
    :style="containerStyle"
  >
    <!-- 第 1 层：背景层（图片或 3D 场景） -->
    <div v-if="config.backgroundLayer" class="panelx-dashboard-layer panelx-dashboard-layer-bg">
      <template v-if="config.backgroundLayer.type === 'image'">
        <img
          :src="config.backgroundLayer.url"
          :style="backgroundImageStyle"
          class="panelx-dashboard-bg-image"
          alt=""
        />
      </template>
      <Scene3DFramework
        v-else-if="config.backgroundLayer.type === 'scene3d'"
        :config="config.backgroundLayer.config"
        class="panelx-dashboard-bg-scene3d"
      />
    </div>
    <!-- 第 2 层：内容层（透明背景，图表等） -->
    <div class="panelx-dashboard-layer panelx-dashboard-layer-content">
      <template v-for="w in visibleWidgets" :key="w.id">
        <div
          v-if="getActualRect(w)"
          class="panelx-dashboard-widget"
          :style="getWidgetStyle(w)"
        >
          <component
            :is="getComponent(w.type)"
            v-bind="(w.props || {}) as Record<string, unknown>"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { SizeManager2D, computeDashboardActualSize } from '../core/size'
import type {
  DashboardConfig,
  WidgetConfig2D,
  WidgetType2D,
  BackgroundLayerImage
} from '../types/dashboard'
import type { DesignRect } from '../types/size'
import Chart from './Chart.vue'
import Table from './Table.vue'
import Decoration from './Decoration.vue'
import Stat from './Stat.vue'
import Card from './Card.vue'
import Panel from './Panel.vue'
import Scene3DFramework from './Scene3DFramework.vue'
import ScreenTitle from './ScreenTitle.vue'
import TopBar from './TopBar.vue'
import GlassChart from './GlassChart.vue'
import DeviceCard from './DeviceCard.vue'
import BottomNav from './BottomNav.vue'
import ProgressList from './ProgressList.vue'

const props = defineProps<{
  config: DashboardConfig
}>()

const config = computed(() => props.config)

const containerRef = ref<HTMLElement | null>(null)
const sizeManager = ref<SizeManager2D | null>(null)
const sizeVersion = ref(0)
const actualWidthUsed = ref<number | null>(null)

const design = computed(() => config.value.design)
const visibleWidgets = computed(() =>
  (config.value.widgets2D || []).filter((w) => w.visible !== false)
)

const backgroundImageStyle = computed((): Record<string, string> => {
  const bg = config.value.backgroundLayer
  if (!bg || bg.type !== 'image') return {}
  const fit = (bg as BackgroundLayerImage).fit ?? 'cover'
  return {
    objectFit: fit,
    objectPosition: 'center center'
  }
})

function getDesignSize() {
  const d = design.value
  return d && d.width > 0 && d.height > 0 ? d : { width: 1920, height: 1080 }
}

const containerStyle = computed((): Record<string, string> => {
  sizeVersion.value
  const sm = sizeManager.value
  if (!sm) {
    return { width: '100%', maxWidth: '100%', minHeight: '400px', position: 'relative', boxSizing: 'border-box' }
  }
  const w = actualWidthUsed.value ?? (containerRef.value?.offsetWidth ?? 0)
  return {
    width: w > 0 ? `${w}px` : '100%',
    maxWidth: '100%',
    height: `${sm.actualHeight}px`,
    maxHeight: '100%',
    position: 'relative',
    boxSizing: 'border-box',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
})

function ensureSizeManager() {
  if (!containerRef.value) return
  const d = getDesignSize()
  const parent = containerRef.value.parentElement
  let screenW = parent ? parent.clientWidth : 0
  let screenH = parent ? parent.clientHeight : 0
  if (typeof window !== 'undefined' && (screenW <= 0 || screenH <= 0)) {
    screenW = screenW > 0 ? screenW : window.innerWidth
    screenH = screenH > 0 ? screenH : window.innerHeight
  }
  if (!screenW || !screenH) return

  const { actualWidth: actualW } = computeDashboardActualSize({
    screenWidth: screenW,
    screenHeight: screenH,
    designWidth: d.width,
    designHeight: d.height
  })

  if (!sizeManager.value) {
    sizeManager.value = new SizeManager2D({
      designWidth: d.width,
      designHeight: d.height,
      actualWidth: actualW
    })
  } else {
    sizeManager.value.setActualWidth(actualW)
  }
  actualWidthUsed.value = actualW
  sizeVersion.value++
}

/** widget 展示 v1：与迁移 JSON 时一致，用 sizeManager.designToActual */
function getActualRect(w: WidgetConfig2D): { x: number; y: number; width: number; height: number } | null {
  const sm = sizeManager.value
  if (!sm || !w.layout) return null
  return sm.designToActual(w.layout as DesignRect)
}

function getWidgetStyle(w: WidgetConfig2D): Record<string, string> {
  const rect = getActualRect(w)
  if (!rect) return {}
  return {
    position: 'absolute',
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    boxSizing: 'border-box'
  }
}

const componentMap: Record<WidgetType2D, unknown> = {
  chart: Chart,
  table: Table,
  decoration: Decoration,
  stat: Stat,
  card: Card,
  panel: Panel,
  screenTitle: ScreenTitle,
  topBar: TopBar,
  glassChart: GlassChart,
  deviceCard: DeviceCard,
  bottomNav: BottomNav,
  progressList: ProgressList
}

function getComponent(type: WidgetType2D) {
  return componentMap[type] || Panel
}

let ro: ResizeObserver | null = null
let roParent: ResizeObserver | null = null
onMounted(() => {
  const run = () => nextTick(ensureSizeManager)
  run()
  if (containerRef.value) {
    ro = new ResizeObserver(run)
    ro.observe(containerRef.value)
    const parent = containerRef.value.parentElement
    if (parent) {
      roParent = new ResizeObserver(run)
      roParent.observe(parent)
    }
  }
})
onUnmounted(() => {
  ro?.disconnect()
  roParent?.disconnect()
})
</script>

<style scoped>
.panelx-dashboard {
  overflow: hidden;
  position: relative;
  max-width: 100%;
  box-sizing: border-box;
}
/* 分层：两层绝对定位叠放，层 1 在下、层 2 在上；内容层需高于 WebGL canvas */
.panelx-dashboard-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.panelx-dashboard-layer-bg {
  z-index: 0;
  isolation: isolate;
}
.panelx-dashboard-layer-content {
  z-index: 10;
  background: transparent;
  pointer-events: none;
  isolation: isolate;
  transform: translateZ(0);
}
.panelx-dashboard-layer-content .panelx-dashboard-widget {
  pointer-events: auto;
}
.panelx-dashboard-bg-image {
  width: 100%;
  height: 100%;
  display: block;
}
.panelx-dashboard-bg-scene3d {
  width: 100%;
  height: 100%;
}
.panelx-dashboard-widget {
  overflow: hidden;
}
</style>
