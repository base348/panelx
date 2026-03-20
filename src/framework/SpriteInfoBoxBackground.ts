/**
 * Sprite 信息框：底纹层（repeat 纹理）+ material.color 着色。
 * 默认使用程序生成的 16×16 tile（同步）；可选用内嵌 PNG base64 同步绘制到 canvas 再建 Texture。
 */

import {
  CanvasTexture,
  Color,
  DataTexture,
  RepeatWrapping,
  RGBAFormat,
  SpriteMaterial,
  SRGBColorSpace,
  type Texture
} from 'three'

/** 可选：8×8 浅灰 tile（PNG base64）。若需使用，在 createTileTexture 内 drawImage 即可 */
export const SPRITE_INFOBOX_TILE_PNG_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAIElEQVQYV2NkYGD4z0ABYBw1xv9BjEhDiG0Q1QAAOw4F3a2s3AAAAABJRU5ErkJggg=='

const TILE_SIZE = 16
/** 与 SPRITE_CANVAS_W/H 一致：512×320 */
const CANVAS_W = 512
const CANVAS_H = 320

function forceOpaqueRgba(css: string): string {
  const m = css.match(/^rgba\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)$/i)
  if (!m) return css
  return `rgba(${m[1]},${m[2]},${m[3]},1)`
}

function createDataTileTextureFallback(): DataTexture {
  const w = TILE_SIZE
  const h = TILE_SIZE
  const data = new Uint8Array(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    data[i * 4] = 234
    data[i * 4 + 1] = 234
    data[i * 4 + 2] = 242
    data[i * 4 + 3] = 255
  }
  const tex = new DataTexture(data, w, h, RGBAFormat)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(CANVAS_W / w, CANVAS_H / h)
  tex.colorSpace = SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

function createTileTextureSync(): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = TILE_SIZE
  c.height = TILE_SIZE
  const ctx = c.getContext('2d')
  if (!ctx) {
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return t
  }

  // 偏亮中性底，便于与 material.color 相乘得到饱和主题色
  ctx.fillStyle = '#eaeaf2'
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE)
  for (let i = 0; i < 96; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.08})`
    ctx.fillRect((Math.random() * TILE_SIZE) | 0, (Math.random() * TILE_SIZE) | 0, 1, 1)
  }

  const tex = new CanvasTexture(c)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(CANVAS_W / TILE_SIZE, CANVAS_H / TILE_SIZE)
  tex.colorSpace = SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

let tileTexture: Texture | null = null

export function getSpriteInfoBoxTileTexture(): Texture {
  if (tileTexture) return tileTexture
  if (typeof document === 'undefined') {
    tileTexture = createDataTileTextureFallback()
    return tileTexture
  }
  tileTexture = createTileTextureSync()
  return tileTexture
}

const backgroundMaterialCache = new Map<string, SpriteMaterial>()

/**
 * 按背景色字符串缓存 SpriteMaterial（共享 map，不同 color 不同材质实例）
 */
export function getSpriteInfoBoxBackgroundMaterial(backgroundTintCss: string): SpriteMaterial {
  const opaque = forceOpaqueRgba(backgroundTintCss)
  let mat = backgroundMaterialCache.get(opaque)
  if (mat) return mat

  const col = new Color()
  try {
    col.setStyle(opaque)
  } catch {
    col.setHex(0x3a6ea5)
  }

  mat = new SpriteMaterial({
    map: getSpriteInfoBoxTileTexture(),
    color: col,
    transparent: true,
    depthTest: false,
    opacity: 1
  })
  backgroundMaterialCache.set(opaque, mat)
  return mat
}
