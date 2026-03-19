import {
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Scene,
  Sprite,
  SpriteMaterial,
  Quaternion,
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

    // 缩短 + 加粗 + 带箭头：用 Cylinder（轴杆）+ Cone（箭头）
    const axesLength = 3
    const headLength = axesLength * 0.18
    const shaftRadius = 0.06
    const headRadius = shaftRadius * 1.8

    const xColor = new Color(0xff0000)
    const yColor = new Color(0x00ff00)
    const zColor = new Color(0x0088ff)

    scene.add(this.createAxisArrow(xColor, new Vector3(1, 0, 0), axesLength, shaftRadius, headLength, headRadius)) // X
    scene.add(this.createAxisArrow(yColor, new Vector3(0, 1, 0), axesLength, shaftRadius, headLength, headRadius)) // Y
    scene.add(this.createAxisArrow(zColor, new Vector3(0, 0, 1), axesLength, shaftRadius, headLength, headRadius)) // Z

    const labelEnd = axesLength + headLength + 0.25
    scene.add(this.createAxisLabel('X', xColor, new Vector3(labelEnd, 0, 0)))
    scene.add(this.createAxisLabel('Y', yColor, new Vector3(0, labelEnd, 0)))
    scene.add(this.createAxisLabel('Z', zColor, new Vector3(0, 0, labelEnd)))

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

  private createAxisArrow(
    color: Color,
    dir: Vector3,
    shaftLength: number,
    shaftRadius: number,
    headLength: number,
    headRadius: number
  ): Object3D {
    const d = dir.clone()
    if (d.lengthSq() === 0) return new Object3D()
    d.normalize()

    // three 的 Cylinder/Cone 默认沿 Y 轴
    const quat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d)

    const group = new Object3D()

    const shaftGeom = new CylinderGeometry(shaftRadius, shaftRadius, shaftLength, 8, 1)
    const shaftMat = new MeshBasicMaterial({ color })
    const shaft = new Mesh(shaftGeom, shaftMat)
    shaft.applyQuaternion(quat)
    shaft.position.copy(d).multiplyScalar(shaftLength / 2)
    group.add(shaft)

    const headGeom = new ConeGeometry(headRadius, headLength, 8, 1)
    const headMat = new MeshBasicMaterial({ color })
    const head = new Mesh(headGeom, headMat)
    head.applyQuaternion(quat)
    head.position.copy(d).multiplyScalar(shaftLength + headLength / 2)
    group.add(head)

    return group
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

