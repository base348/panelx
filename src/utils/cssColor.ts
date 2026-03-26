/** 解析/格式化 CSS 颜色，供取色器与 Editor 使用 */

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)))
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

function toHex2(n: number): string {
  return clampByte(n).toString(16).padStart(2, '0')
}

export type Rgba = { r: number; g: number; b: number; a: number }

/**
 * 将常见 CSS 颜色字符串解析为 RGBA（失败返回 null）
 */
export function parseCssColorToRgba(input: string): Rgba | null {
  const s = String(input ?? '').trim()
  if (!s) return null

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(s)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('')
    }
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
    return { r, g, b, a: clamp01(a) }
  }

  const rgba =
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+%?)\s*)?\)$/i.exec(
      s.replace(/\s+/g, ' ')
    )
  if (rgba) {
    let a = 1
    if (rgba[4] !== undefined) {
      const raw = rgba[4].trim()
      a = raw.endsWith('%') ? parseFloat(raw) / 100 : parseFloat(raw)
    }
    return {
      r: clampByte(Number(rgba[1])),
      g: clampByte(Number(rgba[2])),
      b: clampByte(Number(rgba[3])),
      a: clamp01(a)
    }
  }

  if (typeof document !== 'undefined') {
    const el = document.createElement('div')
    el.style.color = s
    document.body.appendChild(el)
    const cs = getComputedStyle(el).color
    document.body.removeChild(el)
    const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(cs)
    if (m) {
      return {
        r: Number(m[1]),
        g: Number(m[2]),
        b: Number(m[3]),
        a: m[4] !== undefined ? clamp01(Number(m[4])) : 1
      }
    }
  }

  return null
}

/**
 * 将 RGBA 格式化为简短 CSS：不透明 → #rrggbb；其它统一输出 rgba(...)
 */
export function formatRgbaToCss({ r, g, b, a }: Rgba): string {
  const rr = clampByte(r)
  const gg = clampByte(g)
  const bb = clampByte(b)
  if (a >= 1) return `#${toHex2(rr)}${toHex2(gg)}${toHex2(bb)}`
  const aa = Math.round(a * 1000) / 1000
  return `rgba(${rr}, ${gg}, ${bb}, ${aa})`
}

/** 供 `<input type="color">` 使用（忽略透明度） */
export function rgbaToHex6({ r, g, b }: Rgba): string {
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`
}
