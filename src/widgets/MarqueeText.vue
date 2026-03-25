<template>
  <div class="panelx-marquee" :class="{ 'is-exiting': phase === 'exiting' }" :style="rootStyle">
    <div
      class="panelx-marquee-track"
      :class="{ 'is-entering': phase === 'entering', 'is-looping': phase === 'looping', 'is-hidden': phase === 'done' }"
      :style="trackStyle"
      @animationend="onLoopEnd"
    >
      <span class="panelx-marquee-item">
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
import { computed, onUnmounted, ref, watch } from 'vue'

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

const phase = ref<'entering' | 'looping' | 'exiting' | 'done'>('entering')
let tEnterStart: ReturnType<typeof setTimeout> | null = null
let tEnterDone: ReturnType<typeof setTimeout> | null = null
let tExitDone: ReturnType<typeof setTimeout> | null = null

function clearTimers(): void {
  if (tEnterStart) clearTimeout(tEnterStart)
  if (tEnterDone) clearTimeout(tEnterDone)
  if (tExitDone) clearTimeout(tExitDone)
  tEnterStart = null
  tEnterDone = null
  tExitDone = null
}

function startFlow(): void {
  clearTimers()
  phase.value = 'entering'
  // Force one frame in entering state, then switch to looping
  tEnterStart = setTimeout(() => {
    tEnterDone = setTimeout(() => {
      phase.value = 'looping'
      tEnterDone = null
    }, 900)
    tEnterStart = null
  }, 0)
}

function onLoopEnd(event: AnimationEvent): void {
  const n = Math.floor(Number(props.loopCount) || 0)
  if (n <= 0) return
  if (event.animationName !== 'panelx-marquee-loop') return
  phase.value = 'exiting'
  if (tExitDone) clearTimeout(tExitDone)
  tExitDone = setTimeout(() => {
    phase.value = 'done'
    tExitDone = null
  }, 1200)
}

watch(
  () => [props.text, props.speedSec, props.loopCount, props.highlightColor, props.color, props.fontSize, props.fontWeight, props.gap] as const,
  () => startFlow(),
  { immediate: true }
)

onUnmounted(() => clearTimers())

const rootStyle = computed(() => ({
  '--px-marquee-color': props.color,
  '--px-marquee-hl-color': props.highlightColor,
  '--px-marquee-size': props.fontSize,
  '--px-marquee-weight': String(props.fontWeight),
  '--px-marquee-gap': props.gap,
  '--px-marquee-bg': props.background
}))

const trackStyle = computed(() => ({
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
}

.panelx-marquee.is-exiting {
  animation: panelx-marquee-fade-out 1.2s ease forwards;
}

.panelx-marquee-track {
  display: inline-flex;
  align-items: center;
  min-width: max-content;
  white-space: nowrap;
}

.panelx-marquee-track.is-entering {
  transform: translateX(100%);
  transition: transform 0.9s ease-out;
  animation-name: none;
}

.panelx-marquee-track.is-looping {
  transform: translateX(0);
  animation-name: panelx-marquee-loop;
  animation-timing-function: linear;
  will-change: transform;
}
.panelx-marquee-track.is-hidden {
  opacity: 0;
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

@keyframes panelx-marquee-loop {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
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