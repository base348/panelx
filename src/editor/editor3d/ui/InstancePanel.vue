<template>
  <div
    v-if="widgets3D.length"
    class="panelx-editor3d-instance-float"
    :class="{ collapsed: !open }"
  >
    <div class="panelx-editor3d-instance-float-header" @click="emit('update:open', !open)">
      <span class="panelx-editor3d-instance-float-title">分组实例树 ({{ filteredWidgets.length }}/{{ widgets3D.length }})</span>
      <span class="panelx-editor3d-group-toggle">{{ open ? '−' : '+' }}</span>
    </div>
    <div v-show="open" class="panelx-editor3d-instance-float-body">
      <div class="panelx-editor3d-size-inputs">
        <input v-model.trim="newGroupName" type="text" class="panelx-editor3d-props-value" placeholder="新建分组名" />
        <button type="button" class="panelx-editor3d-btn panelx-editor3d-btn-inline" @click="createGroup">新建分组</button>
      </div>
      <input
        v-model.trim="filterText"
        type="text"
        class="panelx-editor3d-props-value"
        placeholder="筛选实例（id / 名称 / typeId）"
      />
      <ul class="panelx-editor3d-widget-list">
        <li v-for="group in groupedTree" :key="group.id" class="panelx-editor3d-group-node">
          <button
            type="button"
            class="panelx-editor3d-group-head"
            @click.stop="toggleGroup(group.id)"
            :title="`分组: ${formatGroupLabel(group.id)}`"
          >
            <span class="panelx-editor3d-group-toggle-icon">{{ isGroupCollapsed(group.id) ? '+' : '−' }}</span>
            <span class="panelx-editor3d-group-head-text">📁 分组: {{ formatGroupLabel(group.id) }} ({{ group.items.length }})</span>
          </button>
          <ul v-show="!isGroupCollapsed(group.id)" class="panelx-editor3d-widget-list">
            <li
              v-for="w in group.items"
              :key="w.id"
              class="panelx-editor3d-widget-tag"
              :class="{ active: selectedWidgetId === w.id }"
              :title="formatInstanceLabel(w)"
              @click="onSelectWidget(w)"
            >
              <span class="panelx-editor3d-widget-tag-text" :title="formatInstanceLabel(w)">
                {{ formatInstanceLabel(w) }}
              </span>
              <button
                type="button"
                class="panelx-editor3d-widget-clone"
                title="克隆一个实例（复制位置/缩放/旋转/属性）"
                @click.stop="cloneWidget(w)"
              >
                克隆
              </button>
              <button
                type="button"
                class="panelx-editor3d-widget-delete"
                title="从主区域删除"
                @click.stop="deleteWidget(w)"
              >
                删除
              </button>
            </li>
          </ul>
        </li>
      </ul>
      <p v-if="filteredWidgets.length === 0" class="panelx-editor3d-right-empty">无匹配实例</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import type { WidgetConfig3D } from '../../../types/dashboard'

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const filterText = ref('')
const newGroupName = ref('')
const collapsedGroups = ref<Record<string, boolean>>({})

const props = defineProps({
  widgets3D: { type: Array as PropType<WidgetConfig3D[]>, required: true },
  groupOptions: { type: Array as PropType<string[]>, required: true },
  // 允许 null（未选中时）
  selectedWidgetId: { type: [String, null] as unknown as PropType<string | null>, required: true },
  open: { type: Boolean, required: true },
  getWidgetDisplayName: { type: Function as PropType<(w: WidgetConfig3D) => string>, required: true },
  formatWidgetScale: { type: Function as PropType<(s: unknown) => string>, required: true },
  onSelectWidget: { type: Function as PropType<(w: WidgetConfig3D) => void>, required: true },
  cloneWidget: { type: Function as PropType<(w: WidgetConfig3D) => void>, required: true },
  deleteWidget: { type: Function as PropType<(w: WidgetConfig3D) => void>, required: true },
  onCreateGroup: { type: Function as PropType<(name: string) => void>, required: true }
})

const filteredWidgets = computed(() => {
  const q = filterText.value.trim().toLowerCase()
  if (!q) return props.widgets3D
  return props.widgets3D.filter((w) => {
    const name = String(props.getWidgetDisplayName(w) ?? '').toLowerCase()
    const id = String(w.id ?? '').toLowerCase()
    const typeId = String((w.props as Record<string, unknown> | undefined)?.typeId ?? '').toLowerCase()
    return id.includes(q) || name.includes(q) || typeId.includes(q)
  })
})

function formatInstanceLabel(w: WidgetConfig3D): string {
  const id = String(w.id ?? '')
  const name = String(props.getWidgetDisplayName(w) ?? '').trim()
  if (!name || name === id) return id
  return `${id}[${name}]`
}

const groupedTree = computed(() => {
  const map = new Map<string, WidgetConfig3D[]>()
  for (const gid of props.groupOptions) map.set(normalizeGroupId(gid), [])
  for (const w of filteredWidgets.value) {
    const gid = normalizeGroupId(String(w.groupId ?? 'default'))
    if (!map.has(gid)) map.set(gid, [])
    map.get(gid)!.push(w)
  }
  return Array.from(map.entries()).map(([id, items]) => ({ id, items }))
})

function createGroup(): void {
  const name = normalizeGroupId(newGroupName.value)
  if (!name) return
  props.onCreateGroup(name)
  collapsedGroups.value[name] = false
  newGroupName.value = ''
}

function normalizeGroupId(raw: string): string {
  const text = String(raw ?? '').trim()
  return text || 'default'
}

function isGroupCollapsed(groupId: string): boolean {
  return collapsedGroups.value[normalizeGroupId(groupId)] === true
}

function toggleGroup(groupId: string): void {
  const gid = normalizeGroupId(groupId)
  collapsedGroups.value[gid] = !isGroupCollapsed(gid)
}

function formatGroupLabel(groupId: string): string {
  const gid = normalizeGroupId(groupId)
  return gid || 'default'
}
</script>

<style scoped>
.panelx-editor3d-group-node {
  margin-bottom: 0.4rem;
}

.panelx-editor3d-group-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.45rem;
  border-radius: 0.5rem;
  border: 1px solid #475569;
  background: #334155;
  color: #e2e8f0;
  cursor: pointer;
}

.panelx-editor3d-group-head:hover {
  border-color: #64748b;
  background: #3b4b62;
}

.panelx-editor3d-group-toggle-icon {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #64748b;
  border-radius: 0.55rem;
  background: #3a4b63;
  line-height: 1;
  font-size: 1.1rem;
  color: #e2e8f0;
}

.panelx-editor3d-group-head-text {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
</style>

