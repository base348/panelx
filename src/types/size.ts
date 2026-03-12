/** 2D 设计稿/实际尺寸与转换 */

export interface DesignRect {
  x: number
  y: number
  width: number
  height: number
}

export interface ActualRect {
  x: number
  y: number
  width: number
  height: number
}

/** 3D 世界尺寸与比例尺 */

export interface WorldSize {
  x: number
  y: number
  z: number
}

export interface ActualSize {
  width: number
  height: number
}

export interface Scale3D {
  /** 世界单位到实际像素的比例，如 1 世界单位 = scale 像素 */
  scale: number
}
