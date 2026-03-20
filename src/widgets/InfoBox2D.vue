<template>
  <div
    class="panelx-infobox2d"
    :class="props.className"
    :data-fx="props.fx"
    :style="{
      '--accent': theme.accentColor,
      '--bg': theme.bg,
      '--border': theme.border,
      '--glow': theme.glow
    }"
  >
    <div class="panelx-infobox2d__glow" />
    <div class="panelx-infobox2d__border" />
    <span class="panelx-infobox2d__corner tl" />
    <span class="panelx-infobox2d__corner tr" />
    <span class="panelx-infobox2d__corner bl" />
    <span class="panelx-infobox2d__corner br" />
    <div class="panelx-infobox2d__tail" />
    <div class="panelx-infobox2d__inner">
      <div class="panelx-infobox2d__titleRow">
        <div v-if="title" class="panelx-infobox2d__title">{{ title }}</div>
        <div v-if="subtitle" class="panelx-infobox2d__subtitle">{{ subtitle }}</div>
      </div>

      <div class="panelx-infobox2d__meta">
        <span v-if="metaLeft" class="panelx-infobox2d__metaLeft">{{ metaLeft }}</span>
        <span v-if="metaRight" class="panelx-infobox2d__metaRight">{{ metaRight }}</span>
      </div>

      <div class="panelx-infobox2d__content">
        <div v-for="(line, idx) in contentLines" :key="idx" class="panelx-infobox2d__contentLine">
          {{ line }}
        </div>
      </div>

      <div v-if="note" class="panelx-infobox2d__note">
        {{ note }}
      </div>
    </div>

    <div v-if="props.fx === 'scanlines'" class="panelx-infobox2d__scanlines" />
    <div v-if="props.fx === 'scanlines'" class="panelx-infobox2d__glowSweep" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { InfoBox2DProps } from '../types/components'

const props = defineProps<InfoBox2DProps>()

const contentLines = computed(() => {
  const raw = props.content ?? ''
  return raw
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
})

const theme = computed(() => {
  const preset = props.colorPreset ?? 'cyan'
  // 尽量与 3D preset 对齐（info/success/warning/error），同时兼容你在 2D 里用的 cyan/green/yellow/red
  const normalizedPreset =
    preset === 'cyan' ? 'info' : preset === 'green' ? 'success' : preset === 'yellow' ? 'warning' : preset === 'red' ? 'error' : preset

  const themes: Record<string, { bg: string; border: string; glow: string; accentColor: string }> = {
    info: {
      bg: 'rgba(20, 60, 100, 0.88)',
      border: 'rgba(0, 212, 255, 0.75)',
      glow: '0 0 18px rgba(0, 180, 220, 0.45), inset 0 0 30px rgba(0,0,0,0.2)',
      accentColor: 'rgb(120, 200, 255)'
    },
    success: {
      bg: 'rgba(20, 80, 60, 0.88)',
      border: 'rgba(80, 255, 180, 0.75)',
      glow: '0 0 16px rgba(60, 220, 160, 0.45), inset 0 0 30px rgba(0,0,0,0.2)',
      accentColor: 'rgb(160, 255, 200)'
    },
    warning: {
      bg: 'rgba(140, 100, 20, 0.88)',
      border: 'rgba(255, 200, 80, 0.9)',
      glow: '0 0 20px rgba(255, 180, 60, 0.5), inset 0 0 30px rgba(0,0,0,0.2)',
      accentColor: 'rgb(255, 220, 120)'
    },
    error: {
      bg: 'rgba(140, 30, 30, 0.88)',
      border: 'rgba(255, 80, 80, 0.9)',
      glow: '0 0 20px rgba(255, 60, 60, 0.6), inset 0 0 30px rgba(0,0,0,0.2)',
      accentColor: 'rgb(255, 120, 120)'
    }
  }

  if (normalizedPreset in themes) return themes[normalizedPreset]

  // 兜底：允许直接传 hex 作为 border/accent
  const hex = normalizedPreset.startsWith('#') ? normalizedPreset : '#6EE7B7'
  return {
    bg: 'rgba(20, 60, 100, 0.88)',
    border: 'rgba(0, 212, 255, 0.75)',
    glow: '0 0 18px rgba(0, 180, 220, 0.45), inset 0 0 30px rgba(0,0,0,0.2)',
    accentColor: hex
  }
})
</script>

<style scoped>
.panelx-infobox2d {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.92);
  padding: 14px 14px 12px;
  box-sizing: border-box;
  background: var(--bg);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: var(--glow);
  overflow: hidden;
}

.panelx-infobox2d__glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle at 30% 10%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 55%);
  filter: blur(12px);
  opacity: 0.85;
  pointer-events: none;
}

.panelx-infobox2d__border {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 0 1px color-mix(in srgb, var(--accent) 25%, transparent);
  pointer-events: none;
}

.panelx-infobox2d__corner {
  position: absolute;
  width: 10px;
  height: 10px;
  border-style: solid;
  border-color: var(--border);
  opacity: 0.95;
}

.panelx-infobox2d__corner.tl {
  top: 6px;
  left: 6px;
  border-width: 1px 0 0 1px;
  border-radius: 2px;
}
.panelx-infobox2d__corner.tr {
  top: 6px;
  right: 6px;
  border-width: 1px 1px 0 0;
  border-radius: 2px;
}
.panelx-infobox2d__corner.bl {
  bottom: 6px;
  left: 6px;
  border-width: 0 0 1px 1px;
  border-radius: 2px;
}
.panelx-infobox2d__corner.br {
  bottom: 6px;
  right: 6px;
  border-width: 0 1px 1px 0;
  border-radius: 2px;
}

.panelx-infobox2d__tail {
  position: absolute;
  left: 50%;
  bottom: -8px;
  width: 0;
  height: 0;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid var(--border);
  opacity: 0.95;
  pointer-events: none;
}

.panelx-infobox2d__inner {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.panelx-infobox2d__titleRow {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.1;
}

.panelx-infobox2d__title {
  font-weight: 800;
  letter-spacing: 0.06em;
  font-size: 14px;
  text-shadow: 0 0 14px color-mix(in srgb, var(--accent) 40%, transparent);
}

.panelx-infobox2d__subtitle {
  font-weight: 600;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.68);
}

.panelx-infobox2d__meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.panelx-infobox2d__metaLeft,
.panelx-infobox2d__metaRight {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panelx-infobox2d__metaRight {
  color: var(--accent);
  font-weight: 650;
}

.panelx-infobox2d__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.88);
}

.panelx-infobox2d__contentLine {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panelx-infobox2d__note {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.62);
}

.panelx-infobox2d__scanlines {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.08) 0px,
    rgba(255, 255, 255, 0.08) 1px,
    transparent 2px,
    transparent 4px
  );
  mix-blend-mode: overlay;
  opacity: 0.24;
  animation: panelxScanlines 3.8s linear infinite;
}

.panelx-infobox2d__glowSweep {
  position: absolute;
  inset: -40% -60%;
  z-index: 3;
  pointer-events: none;
  opacity: 0;
  transform: rotate(18deg);
  background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(120, 200, 255, 0.35) 50%, rgba(0, 0, 0, 0) 100%);
  animation: panelxGlowSweep 5.5s ease-in-out infinite;
}

@keyframes panelxScanlines {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(12px);
  }
}

@keyframes panelxGlowSweep {
  0% {
    opacity: 0;
    transform: translateX(-18%) rotate(18deg);
  }
  45% {
    opacity: 1;
    transform: translateX(6%) rotate(18deg);
  }
  100% {
    opacity: 0;
    transform: translateX(18%) rotate(18deg);
  }
}
</style>

