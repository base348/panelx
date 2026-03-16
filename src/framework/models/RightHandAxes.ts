import {
  AxesHelper,
  BufferGeometry,
  CanvasTexture,
  Color,
  Line,
  LineBasicMaterial,
  Scene,
  Sprite,
  SpriteMaterial,
  Vector3
} from 'three'
import { Model } from '../model/Model'

/**
 * 右手坐标系模型：
 * 1. 继承框架 Model
 * 2. 内部构建一套独立的 Scene，包含：
 *    - AxesHelper
 *    - XYZ 三轴指针与文字标注
 *    - 简单比例尺线段与刻度文字
 *
 * 使用方式：通过模型注册表注册为内置类型（如 id: 'axes'），在 3D Editor 或其他模块中直接创建实例并添加到场景。
 */
export class RightHandAxes extends Model {
  constructor(name = 'RightHandAxes') {
    super(name)

    const scene = new Scene()

    const axesLength = 5
    const axes = new AxesHelper(axesLength)
    scene.add(axes)

    const pointerLength = axesLength * 1.1
    scene.add(this.createAxisPointer(new Color(0xff0000), new Vector3(0, 0, 0), new Vector3(pointerLength, 0, 0))) // X
    scene.add(this.createAxisPointer(new Color(0x00ff00), new Vector3(0, 0, 0), new Vector3(0, pointerLength, 0))) // Y
    scene.add(this.createAxisPointer(new Color(0x0088ff), new Vector3(0, 0, 0), new Vector3(0, 0, pointerLength))) // Z

    scene.add(this.createAxisLabel('X', new Color(0xff0000), new Vector3(pointerLength + 0.4, 0, 0)))
    scene.add(this.createAxisLabel('Y', new Color(0x00ff00), new Vector3(0, pointerLength + 0.4, 0)))
    scene.add(this.createAxisLabel('Z', new Color(0x0088ff), new Vector3(0, 0, pointerLength + 0.4)))

    const scaleLen = 2
    const scaleY = -0.1
    const scaleStart = new Vector3(0, scaleY, 0)
    const scaleEnd = new Vector3(scaleLen, scaleY, 0)
    const scaleGeom = new BufferGeometry().setFromPoints([scaleStart, scaleEnd])
    const scaleMat = new LineBasicMaterial({ color: 0xffffff })
    const scaleLine = new Line(scaleGeom, scaleMat)
    scene.add(scaleLine)

    scene.add(this.createAxisLabel('Scale: 1u', new Color(0xffffff), new Vector3(scaleLen + 0.4, scaleY, 0)))

    this.setScene(scene)
  }

  private createAxisPointer(color: Color, from: Vector3, to: Vector3): Line {
    const geom = new BufferGeometry().setFromPoints([from, to])
    const mat = new LineBasicMaterial({ color })
    return new Line(geom, mat)
  }

  private createAxisLabel(text: string, color: Color, position: Vector3): Sprite {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, size, size)
      ctx.fillStyle = 'rgba(0,0,0,0.0)'
      ctx.fillRect(0, 0, size, size)
      ctx.fillStyle = `#${color.getHexString()}`
      ctx.font = 'bold 120px system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, size / 2, size / 2)
    }
    const texture = new CanvasTexture(canvas)
    const material = new SpriteMaterial({ map: texture, depthTest: false })
    const sprite = new Sprite(material)
    sprite.position.copy(position)
    const baseScale = 0.5
    sprite.scale.set(baseScale, baseScale, baseScale)
    return sprite
  }
}

