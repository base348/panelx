/**
 * Dashboard 大屏尺寸计算
 * - 屏幕实际尺寸、设计(design)尺寸
 * - 设计宽高比 >= 1 则宽度占满，否则高度占满
 */

export interface DashboardSizeInput {
  /** 屏幕（容器）宽度 */
  screenWidth: number
  /** 屏幕（容器）高度 */
  screenHeight: number
  /** 设计稿宽度 */
  designWidth: number
  /** 设计稿高度 */
  designHeight: number
}

export interface DashboardSizeResult {
  /** 计算后的实际宽度（用于 SizeManager2D.actualWidth） */
  actualWidth: number
  /** 计算后的实际高度（actualWidth / designRatio） */
  actualHeight: number
  /** 缩放比例 scale = actualWidth / designWidth */
  scale: number
}

const LOG_PREFIX = '[DashboardSize]'

/**
 * 根据屏幕尺寸与设计尺寸，计算大屏实际宽高。
 * 设计宽高比 >= 1 时以宽度占满屏幕，< 1 时以高度占满屏幕。
 */
export function computeDashboardActualSize(input: DashboardSizeInput): DashboardSizeResult {
  const { screenWidth, screenHeight, designWidth, designHeight } = input

  const screenRatio = screenWidth / screenHeight
  const designRatio = designWidth / designHeight

  let actualWidth: number
  if (designRatio >= 1) {
    actualWidth = Math.max(1, Math.floor(screenWidth))
  } else {
    actualWidth = Math.max(1, Math.floor(screenHeight * designRatio))
  }

  const actualHeight = actualWidth / designRatio
  const scale = actualWidth / designWidth
  const actualRatio = actualWidth / actualHeight

  console.log(LOG_PREFIX, '屏幕尺寸:', { width: screenWidth, height: screenHeight })
  console.log(LOG_PREFIX, '屏幕宽高比:', screenRatio.toFixed(4))
  console.log(LOG_PREFIX, 'design 尺寸:', { width: designWidth, height: designHeight })
  console.log(LOG_PREFIX, 'design 宽高比:', designRatio.toFixed(4))
  console.log(LOG_PREFIX, '计算后尺寸:', { width: actualWidth, height: Math.round(actualHeight) })
  console.log(LOG_PREFIX, '计算后宽高比:', actualRatio.toFixed(4))

  return {
    actualWidth,
    actualHeight,
    scale
  }
}
