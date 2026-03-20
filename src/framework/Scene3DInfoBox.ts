import { CanvasTexture, Group, Sprite, SpriteMaterial, SRGBColorSpace } from 'three'
import { getSpriteInfoBoxBackgroundMaterial } from './SpriteInfoBoxBackground'
import { CSS3DObject } from 'three/examples/jsm/Addons.js'
import type {
  Scene3DInfoBoxConfig,
  Scene3DInfoBoxColorPreset
} from '../types/dashboard'

type ThemeColors = { bg: string; border: string; glow: string; accentColor: string }

function ensureInfoBoxFxStyles(): void {
  if (typeof document === 'undefined') return
  const id = 'panelx-scene3d-infobox-fx'
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = `
/* 科幻显示器常见效果：scanlines / noise / glitch（轻量，不改 transform） */
.panelx-scene3d-infobox { overflow: hidden; }
.panelx-scene3d-infobox .panelx-infobox-fx-scanlines,
.panelx-scene3d-infobox .panelx-infobox-fx-noise,
.panelx-scene3d-infobox .panelx-infobox-fx-glitch {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 8px;
  mix-blend-mode: screen;
}
.panelx-scene3d-infobox .panelx-infobox-fx-scanlines {
  opacity: 0;
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(255,255,255,0.05) 0px,
    rgba(255,255,255,0.05) 1px,
    rgba(0,0,0,0) 3px,
    rgba(0,0,0,0) 6px
  );
  animation: panelxScanlines 3.8s linear infinite;
}
.panelx-scene3d-infobox .panelx-infobox-fx-noise {
  opacity: 0;
  background-image:
    radial-gradient(rgba(255,255,255,0.12) 1px, rgba(0,0,0,0) 1.5px),
    radial-gradient(rgba(0,212,255,0.10) 1px, rgba(0,0,0,0) 1.5px);
  background-size: 3px 3px, 5px 5px;
  background-position: 0 0, 2px 1px;
  animation: panelxNoise 0.9s steps(2) infinite;
}
.panelx-scene3d-infobox .panelx-infobox-fx-glitch {
  opacity: 0;
  background:
    linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(120,200,255,0.32) 35%, rgba(0,0,0,0) 100%),
    linear-gradient(90deg, rgba(255,70,70,0.18) 0%, rgba(0,0,0,0) 55%),
    linear-gradient(90deg, rgba(80,200,255,0.20) 45%, rgba(0,0,0,0) 100%);
  filter: saturate(1.45) contrast(1.12);
  animation: panelxGlitch 1.35s steps(2) infinite;
}
.panelx-scene3d-infobox .panelx-infobox-fx-glowSweep {
  position: absolute;
  inset: -40% -60%;
  pointer-events: none;
  opacity: 0;
  transform: rotate(18deg);
  background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(120,200,255,0.35) 50%, rgba(0,0,0,0) 100%);
  animation: panelxGlowSweep 5.5s ease-in-out infinite;
}

/* 按 data-fx 开关各特效（all 打开全部） */
.panelx-scene3d-infobox[data-fx="scanlines"] .panelx-infobox-fx-scanlines,
.panelx-scene3d-infobox[data-fx="all"] .panelx-infobox-fx-scanlines { opacity: 0.28; }
.panelx-scene3d-infobox[data-fx="scanlines"] .panelx-infobox-fx-glowSweep,
.panelx-scene3d-infobox[data-fx="all"] .panelx-infobox-fx-glowSweep { opacity: 0.14; }

.panelx-scene3d-infobox[data-fx="noise"] .panelx-infobox-fx-noise,
.panelx-scene3d-infobox[data-fx="all"] .panelx-infobox-fx-noise { opacity: 0.10; }

.panelx-scene3d-infobox[data-fx="glitch"] .panelx-infobox-fx-glitch,
.panelx-scene3d-infobox[data-fx="all"] .panelx-infobox-fx-glitch { opacity: 0.34; }

@keyframes panelxScanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(12px); }
}
@keyframes panelxNoise {
  0% { transform: translate(0,0); filter: blur(0px); }
  25% { transform: translate(-1px, 1px); }
  50% { transform: translate(1px, 0px); filter: blur(0.2px); }
  75% { transform: translate(0px, -1px); }
  100% { transform: translate(0,0); }
}
@keyframes panelxGlowSweep {
  0% { transform: translateX(-18%) rotate(18deg); }
  45% { transform: translateX(6%) rotate(18deg); }
  100% { transform: translateX(18%) rotate(18deg); }
}
@keyframes panelxGlitch {
  0% { transform: translate(0,0) skewX(0deg); clip-path: inset(0 0 0 0); }
  6% { transform: translate(-2px, 0px) skewX(-4deg); clip-path: inset(8% 0 70% 0); }
  9% { transform: translate(3px, -1px) skewX(3deg); clip-path: inset(58% 0 14% 0); }
  12% { transform: translate(-1px, 1px) skewX(-2deg); clip-path: inset(35% 0 38% 0); }
  15% { transform: translate(0,0) skewX(0deg); clip-path: inset(0 0 0 0); }
  38% { transform: translate(0,0) skewX(0deg); clip-path: inset(0 0 0 0); }
  42% { transform: translate(2px, 0px) skewX(2deg); clip-path: inset(22% 0 52% 0); }
  45% { transform: translate(-3px, 1px) skewX(-3deg); clip-path: inset(66% 0 8% 0); }
  49% { transform: translate(0,0) skewX(0deg); clip-path: inset(0 0 0 0); }
  72% { transform: translate(0,0) skewX(0deg); clip-path: inset(0 0 0 0); }
  76% { transform: translate(1px, -1px) skewX(2deg); clip-path: inset(28% 0 44% 0); }
  80% { transform: translate(-2px, 0px) skewX(-2deg); clip-path: inset(50% 0 18% 0); }
  84% { transform: translate(0,0) skewX(0deg); clip-path: inset(0 0 0 0); }
  100% { transform: translate(0,0) skewX(0deg); clip-path: inset(0 0 0 0); }
}
`
  document.head.appendChild(style)
}

function forceAlphaTo1(rgbaCss: string): string {
  // 只处理 rgba(r,g,b,a)，其它格式直接原样返回
  const m = rgbaCss.match(/^rgba\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)$/i)
  if (!m) return rgbaCss
  const r = m[1]
  const g = m[2]
  const b = m[3]
  return `rgba(${r},${g},${b},1)`
}

/** 预制颜色：info=蓝青、success=绿、warning=黄、error=红 */
export const INFO_BOX_PRESET_THEMES: Record<Scene3DInfoBoxColorPreset, ThemeColors> = {
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

function resolveTheme(config: Scene3DInfoBoxConfig): ThemeColors {
  const preset: Scene3DInfoBoxColorPreset = config.colorPreset ?? 'info'
  const base = INFO_BOX_PRESET_THEMES[preset]
  const over = config.color ?? {}
  return {
    bg: over.bg ?? base.bg,
    border: over.border ?? base.border,
    glow: over.glow ?? base.glow,
    accentColor: over.accentColor ?? base.accentColor
  }
}

/** 供外部在不重建 element 的情况下更新主题色 */
export function resolveScene3DInfoBoxTheme(config: Scene3DInfoBoxConfig): ThemeColors {
  return resolveTheme(config)
}

/** 创建 3D 场景内科技感信息框的 DOM 并包装为 CSS3DObject，需调用方设置 position 并 add 到 scene */
export function createScene3DInfoBox(config: Scene3DInfoBoxConfig): CSS3DObject {
  ensureInfoBoxFxStyles()
  const theme = resolveTheme(config)

  const wrap = document.createElement('div')
  wrap.className = 'panelx-scene3d-infobox'
  wrap.dataset.fx = config.fx ?? 'scanlines'
  wrap.style.cssText = `
    position: relative;
    width: 280px;
    box-sizing: border-box;
    padding: 12px 14px;
    background: ${theme.bg};
    border: 1px solid ${theme.border};
    box-shadow: ${theme.glow};
    border-radius: 8px;
    color: #fff;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 12px;
    line-height: 1.4;
    backdrop-filter: blur(8px);
    pointer-events: auto;
  `

  const corner = (pos: string) =>
    `<span style="position:absolute;width:10px;height:10px;border-color:${theme.border};border-style:solid;border-width:0;${pos}"></span>`
  const corners =
    corner('top:6px;left:6px;border-top-width:1px;border-left-width:1px') +
    corner('top:6px;right:6px;border-top-width:1px;border-right-width:1px') +
    corner('bottom:6px;left:6px;border-bottom-width:1px;border-left-width:1px') +
    corner('bottom:6px;right:6px;border-bottom-width:1px;border-right-width:1px')

  wrap.innerHTML = `
    ${corners}
    <div class="panelx-infobox-fx-glowSweep"></div>
    <div class="panelx-infobox-fx-scanlines"></div>
    <div class="panelx-infobox-fx-noise"></div>
    <div class="panelx-infobox-fx-glitch"></div>
    <div style="position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${theme.border};"></div>
    <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: rgba(255,255,255,0.95); letter-spacing: 0.02em;">${escapeHtml(config.title)}</div>
    ${config.subtitle ? `<div style="margin-bottom: 8px; color: rgba(255,255,255,0.75); font-size: 11px;">${escapeHtml(config.subtitle)}</div>` : ''}
    ${(config.metaLeft || config.metaRight) ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px; gap: 10px;">
        <span style="color: rgba(255,255,255,0.85);">${escapeHtml(config.metaLeft ?? '')}</span>
        <span style="color: ${theme.accentColor}; font-weight: 600;">${escapeHtml(config.metaRight ?? '')}</span>
      </div>
    ` : ''}
    ${config.content ? `<div style="margin-top: 2px; color: rgba(255,255,255,0.9);">${toMultiLineHtml(config.content)}</div>` : ''}
    ${config.note ? `<div style="margin-top: 8px; padding: 6px 8px; background: rgba(0,0,0,0.25); border-radius: 4px; color: ${theme.accentColor}; font-size: 11px;">${escapeHtml(config.note)}</div>` : ''}
  `

  const css3d = new CSS3DObject(wrap)
  // 让 1 单位 ≈ 100px 显示尺寸，便于在 3D 中与场景比例协调
  css3d.scale.setScalar(0.01)
  return css3d
}

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

/**
 * Editor 中用单个字段输入多行正文：
 * - 使用 "|" 作为分隔符，例如 "line1|line2|line3"
 * - 兼容直接输入换行
 */
function toMultiLineHtml(s: string): string {
  return s
    .split(/\r?\n|\|/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => escapeHtml(line))
    .join('<br/>')
}

const SPRITE_CANVAS_W = 512
const SPRITE_CANVAS_H = 320

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2))
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function splitInfoLines(content?: string): string[] {
  return String(content ?? '')
    .split(/\r?\n|\|/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

/**
 * Sprite 信息框前景层：透明底，仅边框角/文字/备注/FX（底纹由独立 repeat 纹理 Sprite 负责）
 */
export function renderScene3DSpriteInfoBoxContentToCanvas(canvas: HTMLCanvasElement, config: Scene3DInfoBoxConfig): void {
  const theme = resolveTheme(config)
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = SPRITE_CANVAS_W
  canvas.height = SPRITE_CANVAS_H

  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  const pad = 20
  const radius = 18

  const opaqueBorder = forceAlphaTo1(theme.border)

  ctx.save()
  roundRectPath(ctx, 0, 0, w, h, radius)
  ctx.clip()

  // corners
  const cornerSize = 10
  ctx.save()
  ctx.strokeStyle = opaqueBorder
  ctx.lineWidth = 2
  ctx.beginPath()
  // top-left
  ctx.moveTo(pad, pad + cornerSize)
  ctx.lineTo(pad, pad)
  ctx.lineTo(pad + cornerSize, pad)
  // top-right
  ctx.moveTo(w - pad - cornerSize, pad)
  ctx.lineTo(w - pad, pad)
  ctx.lineTo(w - pad, pad + cornerSize)
  // bottom-left
  ctx.moveTo(pad, h - pad - cornerSize)
  ctx.lineTo(pad, h - pad)
  ctx.lineTo(pad + cornerSize, h - pad)
  // bottom-right
  ctx.moveTo(w - pad - cornerSize, h - pad)
  ctx.lineTo(w - pad, h - pad)
  ctx.lineTo(w - pad, h - pad - cornerSize)
  ctx.stroke()
  ctx.restore()

  // title / subtitle
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.font = 'bold 22px system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(String(config.title ?? ''), w / 2, 18)

  if (config.subtitle) {
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.font = '14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillText(String(config.subtitle ?? ''), w / 2, 48)
  }
  ctx.restore()

  // meta line
  if (config.metaLeft || config.metaRight) {
    ctx.save()
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = '14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillText(String(config.metaLeft ?? ''), pad, config.subtitle ? 72 : 62)

    ctx.textAlign = 'right'
    ctx.fillStyle = theme.accentColor
    ctx.font = 'bold 14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillText(String(config.metaRight ?? ''), w - pad, config.subtitle ? 72 : 62)
    ctx.restore()
  }

  // content
  const contentLines = splitInfoLines(config.content)
  if (contentLines.length) {
    ctx.save()
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = '14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    const startY = config.subtitle ? 92 : 82
    const lineH = 18
    for (let i = 0; i < contentLines.length; i++) {
      const y = startY + i * lineH
      if (y > h - 72) break
      ctx.fillText(contentLines[i], pad, y)
    }
    ctx.restore()
  }

  // note box
  if (config.note) {
    ctx.save()
    const noteY = h - 58
    // 使用相对低透明底以避免在 sprite 里把红色边缘再“抬亮”为粉
    ctx.fillStyle = 'rgba(0,0,0,0.20)'
    roundRectPath(ctx, pad, noteY, w - pad * 2, 36, 10)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = theme.accentColor
    ctx.font = '14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(config.note ?? ''), pad + 10, noteY + 18)
    ctx.restore()
  }

  // FX overlays
  const fx = config.fx ?? 'scanlines'
  const isAll = fx === 'all'
  const enableScanlines = isAll || fx === 'scanlines'
  const enableNoise = isAll || fx === 'noise'
  const enableGlitch = isAll || fx === 'glitch'

  /**
   * 为了尽量贴近 CSS3D 的显示方式：
   * - CSS 里特效元素挂了 mix-blend-mode: screen
   * - scanlines/noise/glitch 的 opacity 也有固定目标值（见 ensureInfoBoxFxStyles）
   * - sprite 版本这里做同样的“屏幕混合 + 透明度缩放”，让最终颜色更接近
   */
  if (enableScanlines) {
    // 轻量 glow sweep（CSS scanlines 会叠加 glowSweep，且 opacity=0.14）
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = 0.10
    const grad = ctx.createLinearGradient(0, h * 0.1, w, h * 0.9)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(0.5, 'rgba(120,200,255,0.35)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(-w * 0.2, -h * 0.2, w * 1.4, h * 1.4)
    ctx.restore()

    // scanlines：CSS 用 repeating-linear-gradient + opacity 0.28
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 0.20
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    // 大致对应：周期 6px 左右、1px 强度
    for (let y = 0; y < h; y += 7) ctx.fillRect(0, y, w, 1)
    ctx.restore()
  }

  if (enableNoise) {
    // noise：CSS opacity 0.10（屏幕混合）
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 0.06
    const count = 1800
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      const a = Math.random() * 0.04
      ctx.fillStyle = `rgba(255,255,255,${a})`
      ctx.fillRect(x, y, 1, 1)
    }
    ctx.restore()
  }

  if (enableGlitch) {
    // glitch：CSS opacity 0.34（屏幕混合）
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 0.22
    const bars = 4
    for (let i = 0; i < bars; i++) {
      const bh = 6 + Math.random() * 16
      const by = 24 + Math.random() * (h - 94)
      const shift = (Math.random() - 0.5) * 18
      ctx.fillStyle = `rgba(120,200,255,${0.10 + Math.random() * 0.12})`
      ctx.fillRect(0, by, w, bh)
      // 简单错位影
      ctx.globalAlpha = 0.18
      ctx.fillStyle = `rgba(255,70,70,${0.06 + Math.random() * 0.10})`
      ctx.fillRect(shift, by + 2, w, bh)
      ctx.globalAlpha = 0.22
    }
    ctx.restore()
  }

  ctx.restore()
}

/** @deprecated 使用 renderScene3DSpriteInfoBoxContentToCanvas；底纹已拆到 SpriteInfoBoxBackground */
export function renderScene3DSpriteInfoBoxToCanvas(canvas: HTMLCanvasElement, config: Scene3DInfoBoxConfig): void {
  renderScene3DSpriteInfoBoxContentToCanvas(canvas, config)
}

/**
 * sprite-info-box：底纹 repeat Sprite + 前景 canvas Sprite，组成 Group。
 */
export function createScene3DSpriteInfoBox(config: Scene3DInfoBoxConfig): Group {
  const theme = resolveScene3DInfoBoxTheme(config)
  const group = new Group()

  const backMat = getSpriteInfoBoxBackgroundMaterial(theme.bg)
  const back = new Sprite(backMat)

  const canvas = document.createElement('canvas')
  renderScene3DSpriteInfoBoxContentToCanvas(canvas, config)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true

  const front = new Sprite(
    new SpriteMaterial({
      map: texture,
      depthTest: false,
      transparent: true
    })
  )

  const widthWorld = 280 * 0.01
  const heightWorld = widthWorld * (SPRITE_CANVAS_H / SPRITE_CANVAS_W)
  back.scale.set(widthWorld, heightWorld, 1)
  front.scale.set(widthWorld, heightWorld, 1)
  back.position.z = -0.001
  back.renderOrder = 0
  front.renderOrder = 1

  group.add(back, front)
  return group
}
