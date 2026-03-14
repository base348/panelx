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
            v-bind="(getWidgetProps(w)) as Record<string, unknown>"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, provide } from 'vue'
import { SizeManager2D } from '../core/size'
import { getViewportAndScale, pxToVw, pxToVh, pxToRem } from '../utils/viewport'
import type {
  DashboardConfig,
  WidgetConfig2D,
  WidgetType2D,
  BackgroundLayerImage
} from '../types/dashboard'
import type { DesignRect } from '../types/size'
import { WidgetDataKey, SetWidgetDataKey } from '../types/injections'
import Scene3DFramework from './Scene3DFramework.vue'
import { getWidgetComponent } from '../widgets'

const props = defineProps<{
  config: DashboardConfig
}>()

const config = computed(() => props.config)

/** 向子组件提供 dashboard 级主题（整屏默认），widget 内 props.theme 可单独覆盖 */
provide('dashboardTheme', computed(() => config.value.theme))
/** 向子组件提供视口与比例尺，供比例尺等 widget 使用 */
provide(
  'dashboardViewport',
  computed(() => ({
    viewportSize: viewportSize.value,
    scale: sizeManager.value?.scale ?? 0,
    designWidth: getDesignSize().width,
    designHeight: getDesignSize().height
  }))
)

const containerRef = ref<HTMLElement | null>(null)
const sizeManager = ref<SizeManager2D | null>(null)
const sizeVersion = ref(0)
const actualWidthUsed = ref<number | null>(null)
/** 视口尺寸，用于 px → vw/vh 换算 */
const viewportSize = ref<{ width: number; height: number }>({ width: 0, height: 0 })

const design = computed(() => config.value.design)
const visibleWidgets = computed(() =>
  (config.value.widgets2D || []).filter((w) => w.visible !== false)
)

/** 按 widget id 预置的数据，配置加载后从 config 填充，便于后续数据更新 */
const widgetData = ref<Record<string, Record<string, unknown>>>({})

/** 配置加载后同步 widgetData：为每个 widget id 写入其 props，便于后续数据更新只改 widgetData 而不动 config */
function syncWidgetDataFromConfig() {
  const list = config.value.widgets2D || []
  const next: Record<string, Record<string, unknown>> = {}
  for (const w of list) {
    next[w.id] = { ...(w.props ?? {}) }
  }
  widgetData.value = next
}

watch(
  () => config.value.widgets2D?.length ?? 0,
  () => syncWidgetDataFromConfig(),
  { immediate: true }
)
watch(
  () => config.value.widgets2D?.map((w) => w.id).join(',') ?? '',
  () => syncWidgetDataFromConfig()
)

/** 供模板使用：优先取 widgetData[id]，无则回退到 config 中的 props */
function getWidgetProps(w: WidgetConfig2D): Record<string, unknown> {
  const data = widgetData.value[w.id]
  if (data && Object.keys(data).length > 0) return data
  return (w.props ?? {}) as Record<string, unknown>
}

/** 按 widget id 的数据供外部注入使用；配置加载后已填充，便于后续数据更新 */
provide(WidgetDataKey, widgetData)
provide(SetWidgetDataKey, (id: string, patch: Record<string, unknown>) => {
  const cur = widgetData.value[id]
  widgetData.value = { ...widgetData.value, [id]: { ...(cur ?? {}), ...patch } }
})

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
  const vp = viewportSize.value
  const base = {
    background: config.value.background ?? 'transparent',
    position: 'relative' as const,
    boxSizing: 'border-box' as const
  }
  if (!sm) {
    return {
      ...base,
      width: '100%',
      maxWidth: '100%',
      minHeight: '25rem'
    }
  }
  const w = actualWidthUsed.value ?? (containerRef.value?.offsetWidth ?? 0)
  const h = sm.actualHeight
  const useVwVh = vp.width > 0 && vp.height > 0
  return {
    ...base,
    width: w > 0 ? (useVwVh ? pxToVw(w, vp.width) : pxToRem(w)) : '100%',
    maxWidth: '100%',
    height: useVwVh ? pxToVh(h, vp.height) : pxToRem(h),
    maxHeight: '100%',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
})

function ensureSizeManager() {
  const d = getDesignSize()
  const vs = getViewportAndScale(containerRef.value, d.width, d.height)
  if (!vs) return

  if (!sizeManager.value) {
    sizeManager.value = new SizeManager2D({
      designWidth: d.width,
      designHeight: d.height,
      actualWidth: vs.actualWidth
    })
  } else {
    sizeManager.value.setActualWidth(vs.actualWidth)
  }
  actualWidthUsed.value = vs.actualWidth
  viewportSize.value = vs.viewportSize
  sizeVersion.value++
}

/** widget 展示：layoutUnit=percent 时用配置转换后的 0-100；否则用 sizeManager（px 换算为 vw/vh/rem） */
function getActualRect(w: WidgetConfig2D): { x: number; y: number; width: number; height: number } | null {
  if (!w.layout) return null
  if (config.value.layoutUnit === 'percent') return w.layout as DesignRect
  const sm = sizeManager.value
  if (!sm) return null
  return sm.designToActual(w.layout as DesignRect)
}

function getWidgetStyle(w: WidgetConfig2D): Record<string, string> {
  const rect = getActualRect(w)
  if (!rect) return {}
  if (config.value.layoutUnit === 'percent') {
    return {
      position: 'absolute',
      left: `${rect.x}%`,
      top: `${rect.y}%`,
      width: `${rect.width}%`,
      height: `${rect.height}%`,
      boxSizing: 'border-box'
    }
  }
  const vp = viewportSize.value
  const useVwVh = vp.width > 0 && vp.height > 0
  return {
    position: 'absolute',
    left: useVwVh ? pxToVw(rect.x, vp.width) : pxToRem(rect.x),
    top: useVwVh ? pxToVh(rect.y, vp.height) : pxToRem(rect.y),
    width: useVwVh ? pxToVw(rect.width, vp.width) : pxToRem(rect.width),
    height: useVwVh ? pxToVh(rect.height, vp.height) : pxToRem(rect.height),
    boxSizing: 'border-box'
  }
}

function getComponent(type: WidgetType2D) {
  return getWidgetComponent(type)
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
