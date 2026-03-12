/**
 * 3D 尺寸管理器
 * - 设计 3D 世界尺寸 (xyz)
 * - 比例尺：世界单位 ↔ 实际像素
 * - 实际视口尺寸与世界尺寸转换
 */

import type { WorldSize, ActualSize, Scale3D } from '../../types/size'

export interface SizeManager3DOptions {
  /** 3D 世界范围（世界单位） */
  worldSize: WorldSize
  /** 实际显示区域宽高（像素） */
  actualSize: ActualSize
  /** 可选：自定义比例尺，默认根据 worldSize 与 actualSize 推导 */
  scale?: Scale3D
}

export class SizeManager3D {
  private worldSize: WorldSize
  private actualSize: ActualSize
  /** 世界单位 → 像素 */
  private scale: number

  constructor(options: SizeManager3DOptions) {
    this.worldSize = options.worldSize
    this.actualSize = options.actualSize
    if (options.scale?.scale != null) {
      this.scale = options.scale.scale
    } else {
      this.scale = Math.min(
        options.actualSize.width / options.worldSize.x,
        options.actualSize.height / options.worldSize.y
      )
    }
  }

  getWorldSize(): WorldSize {
    return { ...this.worldSize }
  }

  getActualSize(): ActualSize {
    return { ...this.actualSize }
  }

  /** 世界单位 → 像素的比例 */
  getScale(): number {
    return this.scale
  }

  setActualSize(size: ActualSize): void {
    this.actualSize = size
    this.scale = Math.min(
      size.width / this.worldSize.x,
      size.height / this.worldSize.y
    )
  }

  /** 世界坐标 → 实际像素（以左下角为原点，与常见 2D 画布一致时可再转 y） */
  worldToActual(wx: number, wy: number, wz: number): { x: number; y: number; z: number } {
    return {
      x: wx * this.scale,
      y: wy * this.scale,
      z: wz * this.scale
    }
  }

  /** 实际像素 → 世界坐标 */
  actualToWorld(px: number, py: number, pz: number): { x: number; y: number; z: number } {
    const s = this.scale
    return {
      x: px / s,
      y: py / s,
      z: pz / s
    }
  }
}
