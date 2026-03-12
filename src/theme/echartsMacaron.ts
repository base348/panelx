import * as echarts from 'echarts'

/** 马卡龙配色（柔和粉彩，适配深色底） */
const MACARON_COLORS = [
  '#7dd3fc', // 天空蓝
  '#f9a8d4', // 粉
  '#86efac', // 薄荷绿
  '#fde047', // 鹅黄
  '#c4b5fd', // 薰衣草紫
  '#fdba74', // 蜜桃
  '#67e8f9', // 青
  '#f472b6', // 玫粉
]

/** 注册 ECharts 马卡龙主题（仅注册一次） */
let registered = false
export function registerEchartsMacaronTheme(): void {
  if (registered) return
  registered = true
  echarts.registerTheme('macaron', {
    color: MACARON_COLORS,
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    title: {
      textStyle: { color: 'rgba(255,255,255,0.9)' },
    },
    legend: {
      textStyle: { color: 'rgba(255,255,255,0.85)' },
      itemGap: 12,
    },
    categoryAxis: {
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } },
      axisLabel: { color: 'rgba(255,255,255,0.8)' },
      splitLine: { show: false },
    },
    valueAxis: {
      axisLine: { show: false },
      axisLabel: { color: 'rgba(255,255,255,0.8)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    line: {
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2 },
    },
    bar: {
      barMaxWidth: 24,
    },
    pie: {
      itemStyle: {
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
      },
    },
  })
}

/** 为 option 合并圆角与马卡龙风格（不覆盖已有配置） */
export function mergeMacaronRoundOptions(option: echarts.EChartsOption): echarts.EChartsOption {
  if (!option || typeof option !== 'object') return option
  const out = { ...option }
  const series = (out.series as echarts.SeriesOption[]) ?? []
  if (series.length) {
    out.series = series.map((s) => {
      if (!s || typeof s !== 'object') return s
      const item = { ...s } as Record<string, unknown>
      if (item.type === 'bar') {
        if (item.barBorderRadius == null) item.barBorderRadius = [6, 6, 0, 0]
        if (item.itemStyle && typeof item.itemStyle === 'object') {
          const is = item.itemStyle as Record<string, unknown>
          if (is.borderRadius == null) is.borderRadius = 4
        } else if (item.itemStyle == null) {
          item.itemStyle = { borderRadius: 4 }
        }
      }
      if (item.type === 'pie') {
        if (item.itemStyle && typeof item.itemStyle === 'object') {
          const is = item.itemStyle as Record<string, unknown>
          if (is.borderRadius == null) is.borderRadius = 6
        } else if (item.itemStyle == null) {
          item.itemStyle = { borderRadius: 6 }
        }
        if (item.radius && Array.isArray(item.radius)) {
          // 保持内外半径，仅补圆角
        }
      }
      if (item.type === 'line') {
        if (item.lineStyle && typeof item.lineStyle === 'object') {
          const ls = item.lineStyle as Record<string, unknown>
          if (ls.cap == null) ls.cap = 'round'
          if (ls.join == null) ls.join = 'round'
        } else if (item.lineStyle == null) {
          item.lineStyle = { cap: 'round', join: 'round' }
        }
      }
      return item as echarts.SeriesOption
    })
  }
  return out
}
