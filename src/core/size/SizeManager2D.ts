/**
 * 2D 尺寸管理器
 * - 固定宽高比，根据实际宽度计算高度
 * - 设计尺寸与实际尺寸互转
 * - 组件定位（按比例）
 */

import type { DesignRect, ActualRect } from '../../types/size'

export interface SizeManager2DOptions {
  /** 设计稿宽度 */
  designWidth: number
  /** 设计稿高度 */
  designHeight: number
  /** 当前容器实际宽度（可后续 setActualWidth 更新） */
  actualWidth: number
}

export class SizeManager2D {
  private designWidth: number
  private designHeight: number
  private actualWidth: number

  constructor(options: SizeManager2DOptions) {
    this.designWidth = options.designWidth
    this.designHeight = options.designHeight
    this.actualWidth = options.actualWidth
  }

  /** 宽高比 */
  get ratio(): number {
    return this.designWidth / this.designHeight
  }

  /** 根据当前实际宽度计算出的实际高度（保持设计稿比例） */
  get actualHeight(): number {
    return this.actualWidth / this.ratio
  }

  /** 设计尺寸 → 实际尺寸的缩放比例（按宽度） */
  get scale(): number {
    return this.actualWidth / this.designWidth
  }

  setActualWidth(w: number): void {
    this.actualWidth = w
  }

  /**
   * 设计稿矩形 → 实际像素矩形（按比例缩放）。
   * scale = actualWidth / designWidth，所以小屏时 scale<1，layout 里的宽高会等比缩小。
   */
  designToActual(rect: DesignRect): ActualRect {
    return {
      x: rect.x * this.scale,
      y: rect.y * this.scale,
      width: rect.width * this.scale,
      height: rect.height * this.scale
    }
  }

  /** 实际像素矩形 → 设计稿矩形 */
  actualToDesign(rect: ActualRect): DesignRect {
    const s = this.scale
    return {
      x: rect.x / s,
      y: rect.y / s,
      width: rect.width / s,
      height: rect.height / s
    }
  }

  /** 设计稿坐标点 → 实际像素点 */
  designPointToActual(x: number, y: number): { x: number; y: number } {
    return {
      x: x * this.scale,
      y: y * this.scale
    }
  }
}
