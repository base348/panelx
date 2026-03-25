<template>
  <div
    ref="containerRef"
    class="panelx-marquee"
    :class="{ 'is-exiting': phase === 'exiting', 'is-hidden': phase === 'done' }"
    :style="rootStyle"
    @animationend="onFadeEnd"
  >
    <div
      ref="trackRef"
      class="panelx-marquee-track"
      :class="{ 'is-looping': phase === 'looping' && ready }"
      :style="trackStyle"
      @animationend="onLoopEnd"
    >
      <span ref="firstItemRef" class="panelx-marquee-item">
        <template v-for="(seg, idx) in segments" :key="`a-${idx}`">
          <span v-if="seg.hl" class="panelx-marquee-hl">{{ seg.text }}</span>
          <span v-else>{{ seg.text }}</span>
        </template>
      </span>
      <span class="panelx-marquee-item" aria-hidden="true">
        <template v-for="(seg, idx) in segments" :key="`b-${idx}`">
          <span v-if="seg.hl" class="panelx-marquee-hl">{{ seg.text }}</span>
          <span v-else>{{ seg.text }}</span>
        </template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

type TextSeg = { text: string; hl: boolean }

const props = withDefaults(
  defineProps<{
    text?: string
    speedSec?: number
    loopCount?: number
    highlightColor?: string
    color?: string
    fontSize?: string
    fontWeight?: number | string
    gap?: string
    background?: string
  }>(),
  {
    text: '滚动文字示例：支持一行横向走马灯显示',
    speedSec: 12,
    loopCount: 0,
    highlightColor: '#ffffff',
    color: '#d7ecff',
    fontSize: '0.875rem',
    fontWeight: 500,
    gap: '3rem',
    background: 'transparent'
  }
)

function parseTextSegments(line: string): TextSeg[] {
  const parts = line.split(/(\[\[[\s\S]*?\]\])/g).filter(Boolean)
  if (parts.length === 0) return [{ text: line, hl: false }]
  return parts.map((part) => {
    const hl = part.startsWith('[[') && part.endsWith(']]')
    return { text: hl ? part.slice(2, -2) : part, hl }
  })
}

const displayText = computed(() => (props.text && props.text.trim()) || ' ')
const segments = computed(() => parseTextSegments(displayText.value))
const durationSec = computed(() => Math.max(2, Number(props.speedSec) || 12))
const iterationCount = computed(() => {
  const n = Math.floor(Number(props.loopCount) || 0)
  return n <= 0 ? 'infinite' : String(n)
})

const containerRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const firstItemRef = ref<HTMLElement | null>(null)

/** 容器宽度：文字从右侧进入 = 轨道起点在视口右侧 */
const startPx = ref(0)
/** 单份文字宽度（含 padding-right），无缝循环位移 */
const copyPx = ref(0)
const ready = ref(false)

let ro: ResizeObserver | null = null

const phase = ref<'looping' | 'exiting' | 'done'>('looping')

/** Vue scoped 会给 @keyframes 名加后缀，AnimationEvent.animationName 需前缀匹配 */
function matchesKeyframeName(runtimeName: string, logicalName: string): boolean {
  const n = runtimeName.replace(/^-webkit-/, '')
  return n === logicalName || n.startsWith(`${logicalName}-`)
}

const FADE_OUT_MS = 1200
let fadeDoneTimer: ReturnType<typeof setTimeout> | null = null

function clearFadeDoneTimer(): void {
  if (fadeDoneTimer != null) {
    clearTimeout(fadeDoneTimer)
    fadeDoneTimer = null
  }
}

function scheduleFadeDoneFallback(): void {
  clearFadeDoneTimer()
  fadeDoneTimer = setTimeout(() => {
    fadeDoneTimer = null
    if (phase.value === 'exiting') phase.value = 'done'
  }, FADE_OUT_MS + 80)
}

function measure(): void {
  const el = containerRef.value
  const first = firstItemRef.value
  if (!el || !first) {
    ready.value = false
    return
  }
  const w = el.clientWidth
  const c = first.offsetWidth
  startPx.value = w
  copyPx.value = c
  ready.value = w > 0 && c > 0
}

function startFlow(): void {
  clearFadeDoneTimer()
  phase.value = 'looping'
  void nextTick(() => measure())
}

function onLoopEnd(event: AnimationEvent): void {
  const n = Math.floor(Number(props.loopCount) || 0)
  if (n <= 0) return
  if (event.target !== trackRef.value) return
  if (!matchesKeyframeName(event.animationName, 'panelx-marquee-loop')) return
  phase.value = 'exiting'
  scheduleFadeDoneFallback()
}

function onFadeEnd(event: AnimationEvent): void {
  if (phase.value !== 'exiting') return
  if (event.target !== containerRef.value) return
  if (!matchesKeyframeName(event.animationName, 'panelx-marquee-fade-out')) return
  clearFadeDoneTimer()
  phase.value = 'done'
}

watch(
  () =>
    [
      props.text,
      props.speedSec,
      props.loopCount,
      props.highlightColor,
      props.color,
      props.fontSize,
      props.fontWeight,
      props.gap,
      props.background
    ] as const,
  () => startFlow(),
  { immediate: true }
)

watch(
  () => segments.value,
  () => void nextTick(() => measure()),
  { deep: true }
)

watch(containerRef, (el) => {
  ro?.disconnect()
  ro = null
  if (!el) return
  ro = new ResizeObserver(() => measure())
  ro.observe(el)
  void nextTick(() => measure())
})

onUnmounted(() => {
  clearFadeDoneTimer()
  ro?.disconnect()
  ro = null
})

const rootStyle = computed(() => ({
  '--px-marquee-color': props.color,
  '--px-marquee-hl-color': props.highlightColor,
  '--px-marquee-size': props.fontSize,
  '--px-marquee-weight': String(props.fontWeight),
  '--px-marquee-gap': props.gap,
  '--px-marquee-bg': props.background
}))

const trackStyle = computed(() => ({
  '--marquee-start': `${startPx.value}px`,
  '--marquee-shift': `${-copyPx.value}px`,
  animationDuration: `${durationSec.value}s`,
  animationIterationCount: iterationCount.value
}))
</script>

<style scoped>
.panelx-marquee {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  background: var(--px-marquee-bg);
  opacity: 1;
}

.panelx-marquee.is-exiting {
  animation: panelx-marquee-fade-out 1.2s ease forwards;
}

.panelx-marquee.is-exiting .panelx-marquee-track {
  animation-play-state: paused;
}

.panelx-marquee.is-hidden {
  opacity: 0;
  pointer-events: none;
}

.panelx-marquee-track {
  display: inline-flex;
  align-items: center;
  min-width: max-content;
  white-space: nowrap;
  will-change: transform;
}

.panelx-marquee-track.is-looping {
  animation-name: panelx-marquee-loop;
  animation-timing-function: linear;
}

.panelx-marquee-item {
  color: var(--px-marquee-color);
  font-size: var(--px-marquee-size);
  font-weight: var(--px-marquee-weight);
  letter-spacing: 0.02em;
  padding-right: var(--px-marquee-gap);
}

.panelx-marquee-hl {
  color: var(--px-marquee-hl-color);
  font-weight: 650;
  text-shadow: 0 0 12px color-mix(in srgb, var(--px-marquee-hl-color) 36%, transparent);
}

/* 起点 = 容器宽（整段从右侧进入），位移 = -单份宽（无缝循环） */
@keyframes panelx-marquee-loop {
  from {
    transform: translateX(var(--marquee-start, 0px));
  }
  to {
    transform: translateX(calc(var(--marquee-start, 0px) + var(--marquee-shift, 0px)));
  }
}

@keyframes panelx-marquee-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
