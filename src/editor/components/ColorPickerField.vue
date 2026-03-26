<template>
  <div class="panelx-color-picker">
    <div class="panelx-color-picker-row">
      <input
        type="color"
        class="panelx-color-picker-swatch"
        :value="hex6"
        title="色相（不透明 RGB）；透明度请用下方滑块"
        @input="onHexPick(($event.target as HTMLInputElement).value)"
      />
      <div class="panelx-color-picker-alpha-wrap" title="透明度（0% 完全透明）">
        <div class="panelx-color-picker-alpha-bg" aria-hidden="true" />
        <div
          class="panelx-color-picker-alpha-fg"
          aria-hidden="true"
          :style="{
            background: `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1))`
          }"
        />
        <input
          v-model.number="alphaPercent"
          class="panelx-color-picker-alpha-range"
          type="range"
          min="0"
          max="100"
          step="1"
          @input="onAlphaInput"
        />
      </div>
    </div>
    <div class="panelx-color-picker-meta">
      <span class="panelx-color-picker-alpha-label">{{ alphaPercent }}%</span>
    </div>
    <input
      type="text"
      class="panelx-color-picker-text"
      spellcheck="false"
      placeholder="transparent、#rrggbb、rgba(…)"
      :value="textValue"
      @input="onTextInput(($event.target as HTMLInputElement).value)"
    />
    <div class="panelx-color-picker-actions">
      <button
        type="button"
        class="panelx-color-picker-btn"
        title="设为 transparent"
        @click="setTransparent"
      >
        透明
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  formatRgbaToCss,
  parseCssColorToRgba,
  rgbaToHex6,
  type Rgba
} from '../../utils/cssColor'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const r = ref(0)
const g = ref(0)
const b = ref(0)
const a = ref(1)

/** 与 props 同步的展示文本（用户直接改文本时先反映在这里由 watch 解析） */
const textValue = ref('')

function applyParsed(parsed: Rgba | null): void {
  if (!parsed) return
  r.value = parsed.r
  g.value = parsed.g
  b.value = parsed.b
  a.value = parsed.a
}

function syncFromModel(v: string): void {
  textValue.value = v
  const parsed = parseCssColorToRgba(v)
  if (parsed) applyParsed(parsed)
}

watch(
  () => props.modelValue,
  (v) => {
    syncFromModel(String(v ?? ''))
  },
  { immediate: true }
)

const hex6 = computed(() => rgbaToHex6({ r: r.value, g: g.value, b: b.value, a: 1 }))

const alphaPercent = computed({
  get: () => Math.round(a.value * 100),
  set: (pct: number) => {
    a.value = Math.max(0, Math.min(1, pct / 100))
  }
})

function emitCurrent(): void {
  const css = formatRgbaToCss({
    r: r.value,
    g: g.value,
    b: b.value,
    a: a.value
  })
  textValue.value = css
  emit('update:modelValue', css)
}

function onHexPick(hex: string): void {
  const parsed = parseCssColorToRgba(hex)
  if (parsed) {
    r.value = parsed.r
    g.value = parsed.g
    b.value = parsed.b
    if (a.value === 0) a.value = 1
    emitCurrent()
  }
}

function onAlphaInput(): void {
  emitCurrent()
}

function onTextInput(raw: string): void {
  textValue.value = raw
  const parsed = parseCssColorToRgba(raw)
  if (parsed) {
    applyParsed(parsed)
    emit('update:modelValue', formatRgbaToCss(parsed))
  } else {
    emit('update:modelValue', raw)
  }
}

function setTransparent(): void {
  r.value = 0
  g.value = 0
  b.value = 0
  a.value = 0
  textValue.value = 'transparent'
  emit('update:modelValue', 'transparent')
}
</script>

<style scoped>
.panelx-color-picker {
  width: 100%;
}
.panelx-color-picker-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.panelx-color-picker-swatch {
  width: 2.25rem;
  height: 1.875rem;
  padding: 0;
  border: 0.0625rem solid #ddd;
  border-radius: 0.25rem;
  cursor: pointer;
  flex-shrink: 0;
  box-sizing: border-box;
}
.panelx-color-picker-alpha-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 1.25rem;
  border-radius: 0.25rem;
  overflow: hidden;
  border: 0.0625rem solid #ddd;
}
.panelx-color-picker-alpha-bg {
  position: absolute;
  inset: 0;
  background-color: #fff;
  background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position:
    0 0,
    0 4px,
    4px -4px,
    -4px 0;
}
.panelx-color-picker-alpha-fg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.panelx-color-picker-alpha-range {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
  opacity: 0.88;
  accent-color: #333;
}
.panelx-color-picker-meta {
  display: flex;
  justify-content: flex-end;
  margin: 0.2rem 0 0.25rem;
}
.panelx-color-picker-alpha-label {
  font-size: 0.6875rem;
  color: #888;
}
.panelx-color-picker-text {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 0.0625rem solid #ddd;
  border-radius: 0.25rem;
  font-size: 0.8125rem;
  box-sizing: border-box;
}
.panelx-color-picker-actions {
  margin-top: 0.35rem;
}
.panelx-color-picker-btn {
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  border: 0.0625rem solid #ccc;
  border-radius: 0.25rem;
  background: #f8f8f8;
  cursor: pointer;
}
.panelx-color-picker-btn:hover {
  background: #eee;
}
</style>
