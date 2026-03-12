<template>
  <div class="panelx-editor">
    <aside class="panelx-editor-sidebar">
      <h3>组件</h3>
      <div
        v-for="item in widgetList"
        :key="item.type"
        class="panelx-editor-widget-item"
        draggable="true"
        @dragstart="onDragStart($event, item)"
      >
        {{ item.label }}
      </div>
      <h3 class="mt-4">操作</h3>
      <button type="button" class="panelx-editor-btn" @click="exportConfig">
        导出配置
      </button>
      <button type="button" class="panelx-editor-btn" @click="loadDemo">
        加载示例
      </button>
    </aside>
    <main class="panelx-editor-main" ref="dropRef" @dragover.prevent @drop="onDrop">
      <div class="panelx-editor-preview-wrap">
        <Dashboard v-if="config.widgets2D.length" :config="config" />
        <div v-else class="panelx-editor-empty">
          从左侧拖入组件到此处
        </div>
      </div>
    </main>
    <div v-if="config.widgets2D.length" class="panelx-editor-props">
      <h3>属性</h3>
      <div class="panelx-editor-widget-list">
        <button
          v-for="w in config.widgets2D"
          :key="w.id"
          type="button"
          class="panelx-editor-widget-tab"
          :class="{ active: selectedId === w.id }"
          @click="selectedId = w.id"
        >
          {{ widgetLabel(w) }}
        </button>
      </div>
      <template v-if="selectedConfig">
        <div class="panelx-editor-prop-group">
          <h4>布局（设计稿像素）</h4>
          <div class="panelx-editor-field">
            <label>X</label>
            <input
              v-model.number="selectedConfig.layout.x"
              type="number"
              min="0"
              step="1"
            />
          </div>
          <div class="panelx-editor-field">
            <label>Y</label>
            <input
              v-model.number="selectedConfig.layout.y"
              type="number"
              min="0"
              step="1"
            />
          </div>
          <div class="panelx-editor-field">
            <label>宽度</label>
            <input
              v-model.number="selectedConfig.layout.width"
              type="number"
              min="1"
              step="1"
            />
          </div>
          <div class="panelx-editor-field">
            <label>高度</label>
            <input
              v-model.number="selectedConfig.layout.height"
              type="number"
              min="1"
              step="1"
            />
          </div>
        </div>
        <details class="panelx-editor-json-detail">
          <summary>完整配置 (JSON)</summary>
          <pre class="panelx-editor-pre">{{ selectedConfig }}</pre>
        </details>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import Dashboard from '../components/Dashboard.vue'
import type { DashboardConfig, WidgetConfig2D, WidgetType2D } from '../types/dashboard'

const DESIGN = { width: 1920, height: 1080 }

const widgetList: { type: WidgetType2D; label: string }[] = [
  { type: 'chart', label: '图表' },
  { type: 'table', label: '表格' },
  { type: 'decoration', label: '装饰' },
  { type: 'stat', label: '指标' },
  { type: 'card', label: '卡片' },
  { type: 'panel', label: '面板' }
]

const config = reactive<DashboardConfig>({
  design: { ...DESIGN },
  widgets2D: []
})

const dropRef = ref<HTMLElement | null>(null)
const selectedId = ref<string | null>(null)

let dragItem: { type: WidgetType2D; label: string } | null = null

function onDragStart(e: DragEvent, item: { type: WidgetType2D; label: string }) {
  dragItem = item
  e.dataTransfer!.setData('text/plain', item.type)
  e.dataTransfer!.effectAllowed = 'copy'
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  if (!dragItem) return
  const id = `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  const layout = defaultLayout(dragItem.type, config.widgets2D.length)
  const w: WidgetConfig2D = {
    id,
    type: dragItem.type,
    layout,
    visible: true,
    props: defaultProps(dragItem.type)
  }
  config.widgets2D.push(w)
  selectedId.value = id
  dragItem = null
}

function defaultLayout(_type: WidgetType2D, index: number): { x: number; y: number; width: number; height: number } {
  const cols = 4
  const c = index % cols
  const r = Math.floor(index / cols)
  const pad = 20
  const w = (DESIGN.width - pad * (cols + 1)) / cols
  const h = 200
  return {
    x: pad + c * (w + pad),
    y: pad + r * (h + pad),
    width: w,
    height: h
  }
}

function defaultProps(type: WidgetType2D): Record<string, unknown> {
  switch (type) {
    case 'chart':
      return {
        options: {
          xAxis: { type: 'category', data: ['A', 'B', 'C'] },
          yAxis: { type: 'value' },
          series: [{ data: [120, 200, 150], type: 'bar' }]
        },
        height: '100%',
        width: '100%'
      }
    case 'table':
      return {
        columns: [
          { key: 'name', title: '名称' },
          { key: 'value', title: '数值' }
        ],
        data: [
          { name: '项目1', value: 100 },
          { name: '项目2', value: 200 }
        ]
      }
    case 'decoration':
      return { variant: 'corner' }
    case 'stat':
      return { value: 0, label: '指标' }
    case 'card':
      return { title: '卡片' }
    case 'panel':
      return { title: '面板' }
    default:
      return {}
  }
}

const selectedConfig = computed(() => {
  if (!selectedId.value) return null
  return config.widgets2D.find((w) => w.id === selectedId.value) ?? null
})

const typeLabels: Record<WidgetType2D, string> = {
  chart: '图表',
  table: '表格',
  decoration: '装饰',
  stat: '指标',
  card: '卡片',
  panel: '面板'
}
function widgetLabel(w: WidgetConfig2D) {
  return typeLabels[w.type] || w.type
}

watch(
  () => config.widgets2D.length,
  (len) => {
    if (len > 0 && !selectedId.value) selectedId.value = config.widgets2D[0].id
  },
  { immediate: true }
)
watch(selectedConfig, (cur) => {
  if (!cur && config.widgets2D.length > 0) selectedId.value = config.widgets2D[0].id
})

function exportConfig() {
  const json = JSON.stringify(config, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'dashboard-config.json'
  a.click()
  URL.revokeObjectURL(url)
}

function loadDemo() {
  config.widgets2D = [
    {
      id: 'stat1',
      type: 'stat',
      layout: { x: 20, y: 20, width: 300, height: 100 },
      visible: true,
      props: { value: 123456, label: '总销售额', prefix: '¥', trend: 'up', trendValue: '12.5%' }
    },
    {
      id: 'chart1',
      type: 'chart',
      layout: { x: 20, y: 140, width: 600, height: 400 },
      visible: true,
      props: {
        options: {
          xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
          yAxis: { type: 'value' },
          series: [{ data: [120, 132, 101, 134, 90, 230], type: 'line', smooth: true }]
        },
        height: '100%',
        width: '100%'
      }
    },
    {
      id: 'decoration1',
      type: 'decoration',
      layout: { x: 640, y: 140, width: 200, height: 120 },
      visible: true,
      props: { variant: 'corner' }
    }
  ]
}
</script>

<style scoped>
.panelx-editor {
  display: flex;
  height: 100vh;
  font-size: 14px;
}
.panelx-editor-sidebar {
  width: 200px;
  padding: 16px;
  border-right: 1px solid var(--color-border, #e8e8e8);
  background: var(--color-background, #f5f5f5);
}
.panelx-editor-sidebar h3 {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--color-secondary);
  text-transform: uppercase;
}
.panelx-editor-widget-item {
  padding: 8px 12px;
  margin-bottom: 4px;
  background: white;
  border-radius: 4px;
  cursor: grab;
  border: 1px solid transparent;
}
.panelx-editor-widget-item:hover {
  border-color: var(--color-primary, #1890ff);
}
.mt-4 {
  margin-top: 16px;
}
.panelx-editor-btn {
  display: block;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: white;
  cursor: pointer;
}
.panelx-editor-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
.panelx-editor-main {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background: #1a1a2e;
}
.panelx-editor-preview-wrap {
  width: 100%;
  min-width: 400px;
  max-width: 100%;
  margin: 0 auto;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  min-height: 500px;
}
.panelx-editor-empty {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}
.panelx-editor-props {
  width: 280px;
  padding: 16px;
  border-left: 1px solid var(--color-border);
  background: #fafafa;
  overflow: auto;
}
.panelx-editor-props h3 {
  margin: 0 0 12px;
  font-size: 12px;
  text-transform: uppercase;
  color: #666;
}
.panelx-editor-widget-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}
.panelx-editor-widget-tab {
  padding: 4px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
}
.panelx-editor-widget-tab.active {
  border-color: #1890ff;
  background: #e6f7ff;
  color: #1890ff;
}
.panelx-editor-prop-group {
  margin-bottom: 16px;
}
.panelx-editor-prop-group h4 {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
}
.panelx-editor-field {
  margin-bottom: 8px;
}
.panelx-editor-field label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #666;
}
.panelx-editor-field input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  box-sizing: border-box;
}
.panelx-editor-json-detail {
  margin-top: 12px;
  font-size: 12px;
}
.panelx-editor-json-detail summary {
  cursor: pointer;
  color: #666;
}
.panelx-editor-pre {
  margin: 8px 0 0;
  padding: 8px;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-all;
  background: #f0f0f0;
  border-radius: 4px;
  max-height: 200px;
  overflow: auto;
}
</style>
