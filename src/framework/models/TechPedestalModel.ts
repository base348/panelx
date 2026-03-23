/**
 * 科技底座（数字孪生风格）
 * - 下层：半透明平面 + 青色外轮廓辉光（可走 Bloom 层）
 * - 上层：指定基色薄台体 + 顶面科技网格（高亮中心）+ 边线
 * - 下层周长：流光 Shader
 *
 * 霓虹/泛光：边线、网格、流光默认走 Bloom 层（需场景 Bloom + 相机勾选 Bloom 层）
 */
import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshPhysicalMaterial,
  NormalBlending,
  Object3D,
  PlaneGeometry,
  Shape,
  ShapeGeometry,
  Scene,
  ShaderMaterial
} from 'three'
import { Model } from '../model/Model'
import type { PropDefinition } from '../model/ModelRegistry'
import { LayerDef } from '../LayerDef'

/** 整体点缀/下层填充混合、流光辅助色（可调） */
const DEFAULT_TECH_BLUE = '#00bfff'

/** 上层顶面网格线色 */
const TOP_GRID_COLOR = '#41A9FF'
/** 下层外轮廓高亮 */
const BOTTOM_OUTLINE_COLOR = '#00d8ff'

const BOTTOM_MESH_NAME = '__panelx_tech_ped_bottom__'
const TOP_MESH_NAME = '__panelx_tech_ped_top__'
const TOP_GRID_NAME = '__panelx_tech_ped_top_grid__'
const BOTTOM_EDGES_NAME = '__panelx_tech_ped_bottom_edges__'
const TOP_EDGES_NAME = '__panelx_tech_ped_top_edges__'
const BOTTOM_RUN_LIGHT_NAME = '__panelx_tech_ped_bottom_run_light__'

const BASE_BOTTOM_W = 5
const BASE_BOTTOM_D = 4
const BASE_TOP_W = 4
const BASE_TOP_H = 0.08
const BASE_TOP_D = 3

function normalizeHexColorInput(value: string): string {
  const s = value.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s
  if (/^[0-9a-fA-F]{6}$/.test(s)) return `#${s}`
  return s
}

function clampCornerRadius(radius: number, halfW: number, halfH: number): number {
  const r = Number.isFinite(radius) ? radius : 0
  const maxR = Math.max(0, Math.min(halfW, halfH))
  return Math.max(0, Math.min(r, maxR))
}

function buildRoundedRectPlaneGeometry(
  halfW: number,
  halfH: number,
  radius: number,
  curveSegments = 12
): BufferGeometry {
  const r = clampCornerRadius(radius, halfW, halfH)

  // three 的 ShapeGeometry 默认在 XY 平面生成，后续仍沿用 TechPedestal 的 rotation.x 把它放到 XZ 平面。
  const shape = new Shape()
  const x0 = -halfW
  const y0 = -halfH
  const x1 = halfW
  const y1 = halfH

  // 起点：底边左切点 (-halfW + r, -halfH)
  shape.moveTo(x0 + r, y0)
  shape.lineTo(x1 - r, y0)

  if (r > 0) shape.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false) // bottom-right
  shape.lineTo(x1, y1 - r)

  if (r > 0) shape.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false) // top-right
  shape.lineTo(x0 + r, y1)

  if (r > 0) shape.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false) // top-left
  shape.lineTo(x0, y0 + r)

  if (r > 0) shape.absarc(x0 + r, y0 + r, r, Math.PI, (3 * Math.PI) / 2, false) // bottom-left
  shape.closePath()

  return new ShapeGeometry(shape, Math.max(4, Math.trunc(curveSegments)))
}

function buildBottomRunLightRoundedRectLoopGeometry(
  halfW: number,
  halfH: number,
  radius: number,
  zOffset: number,
  segmentsTotal: number
): BufferGeometry {
  const r = clampCornerRadius(radius, halfW, halfH)

  const bottomStraight = Math.max(0, 2 * (halfW - r))
  const rightStraight = Math.max(0, 2 * (halfH - r))
  const arcQuarter = (Math.PI * r) / 2

  // 起点：底边左切点 (-halfW + r, -halfH)
  const parts = [
    { len: bottomStraight, kind: 'bottom' as const },
    { len: arcQuarter, kind: 'arcBR' as const },
    { len: rightStraight, kind: 'right' as const },
    { len: arcQuarter, kind: 'arcTR' as const },
    { len: bottomStraight, kind: 'top' as const },
    { len: arcQuarter, kind: 'arcTL' as const },
    { len: rightStraight, kind: 'left' as const },
    { len: arcQuarter, kind: 'arcBL' as const }
  ]

  const total = parts.reduce((s, p) => s + p.len, 0)
  const safeTotal = total > 1e-6 ? total : 1

  function pointAt(d: number): [number, number, number] {
    let dist = d % safeTotal
    if (dist < 0) dist += safeTotal

    for (const p of parts) {
      if (p.len <= 1e-6) continue
      if (dist <= p.len) {
        const t = p.len > 0 ? dist / p.len : 0
        const cx = halfW - r
        const cy = halfH - r
        const cxL = -halfW + r
        const cyB = -halfH + r

        switch (p.kind) {
          case 'bottom':
            return [-halfW + t * (2 * (halfW - r)), -halfH, zOffset]
          case 'arcBR': {
            // center: (halfW - r, -halfH + r), angle -90 -> 0
            const ang = -Math.PI / 2 + t * (Math.PI / 2)
            const x = (halfW - r) + r * Math.cos(ang)
            const y = (-halfH + r) + r * Math.sin(ang)
            return [x, y, zOffset]
          }
          case 'right':
            return [halfW, -halfH + r + t * (2 * (halfH - r)), zOffset]
          case 'arcTR': {
            // center: (halfW - r, halfH - r), angle 0 -> 90
            const ang = t * (Math.PI / 2)
            const x = cx + r * Math.cos(ang)
            const y = cy + r * Math.sin(ang)
            return [x, y, zOffset]
          }
          case 'top':
            return [halfW - t * (2 * (halfW - r)), halfH, zOffset]
          case 'arcTL': {
            // center: (-halfW + r, halfH - r), angle 90 -> 180
            const ang = Math.PI / 2 + t * (Math.PI / 2)
            const x = cxL + r * Math.cos(ang)
            const y = cy + r * Math.sin(ang)
            return [x, y, zOffset]
          }
          case 'left':
            return [-halfW, halfH - r - t * (2 * (halfH - r)), zOffset]
          case 'arcBL': {
            // center: (-halfW + r, -halfH + r), angle 180 -> 270
            const ang = Math.PI + t * (Math.PI / 2)
            const x = cxL + r * Math.cos(ang)
            const y = cyB + r * Math.sin(ang)
            return [x, y, zOffset]
          }
          default:
            return [-halfW, -halfH, zOffset]
        }
      }
      dist -= p.len
    }

    return [-halfW + r, -halfH, zOffset]
  }

  const positions: number[] = []
  const lineAlong: number[] = []
  for (let k = 0; k < segmentsTotal; k++) {
    const d = (k / segmentsTotal) * safeTotal
    const p = pointAt(d)
    positions.push(p[0], p[1], p[2])
    lineAlong.push(k / segmentsTotal)
  }

  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(new Float32Array(positions), 3))
  geo.setAttribute('lineAlong', new Float32BufferAttribute(new Float32Array(lineAlong), 1))
  return geo
}

const RUN_LIGHT_VERTEX = `
  attribute float lineAlong;
  varying float vAlong;
  void main() {
    vAlong = lineAlong;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const RUN_LIGHT_FRAGMENT = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uLoopPerSec;
  uniform float uSigma;
  uniform float uDim;
  varying float vAlong;
  void main() {
    float head = mod(uTime * uLoopPerSec, 1.0);
    float d = abs(vAlong - head);
    d = min(d, 1.0 - d);
    float glow = exp(-(d * d) / (2.0 * uSigma * uSigma));
    float a = uDim + (1.0 - uDim) * glow;
    gl_FragColor = vec4(uColor * a, a);
  }
`

const TOP_GRID_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const TOP_GRID_FRAG = `
  precision highp float;
  uniform vec3 uLineColor;
  uniform float uCells;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    vec2 cuv = uv * uCells;
    vec2 f = fract(cuv);
    float lx = min(f.x, 1.0 - f.x);
    float ly = min(f.y, 1.0 - f.y);
    float line = clamp(step(lx, 0.038) + step(ly, 0.038), 0.0, 1.0);
    vec2 cen = uv - vec2(0.5);
    float r = length(cen) * 1.45;
    float core = 1.0 - smoothstep(0.0, 0.78, r);
    float a = line * (0.22 + 0.78 * core);
    a *= 0.32 + 0.68 * core;
    vec3 col = uLineColor * (0.5 + 0.5 * core);
    gl_FragColor = vec4(col, a * 0.92);
  }
`

type PedestalConfig = {
  /** 整体辅助色（下层体、流光等） */
  color: string
  topBaseColor: string
  topGridColor: string
  bottomOutlineColor: string
  topWidth: number
  topDepth: number
  topHeight: number
  bottomWidth: number
  bottomDepth: number
  topOpacity: number
  bottomOpacity: number
  edgeBrightness: number
  gap: number
  bottomYOffset: number
  /** 下层圆角半径（会随 bottomWidth/bottomDepth 一起缩放） */
  bottomCornerRadius: number
  showEdges: boolean
  /** 霓虹/边线/网格/流光走 Bloom 层（推荐 true） */
  bloomEdges: boolean
  edgeRunLight: boolean
  edgeRunSpeed: number
  topGridCells: number
}

type RunLightUniforms = {
  uColor: { value: Color }
  uTime: { value: number }
  uLoopPerSec: { value: number }
  uSigma: { value: number }
  uDim: { value: number }
}

type TopGridUniforms = {
  uLineColor: { value: Color }
  uCells: { value: number }
}

export class TechPedestalModel extends Model {
  static supportedProps: PropDefinition[] = [
    { key: 'color', label: '辅助点缀色', default: DEFAULT_TECH_BLUE, type: 'color' },
    { key: 'topBaseColor', label: '上层基色', default: '#0a1a2f', type: 'color' },
    { key: 'topGridColor', label: '上层网格色', default: TOP_GRID_COLOR, type: 'color' },
    { key: 'bottomOutlineColor', label: '下层轮廓色', default: BOTTOM_OUTLINE_COLOR, type: 'color' },
    { key: 'topWidth', label: '上层台面宽(X)', default: 4 },
    { key: 'topDepth', label: '上层台面深(Z)', default: 3 },
    { key: 'topHeight', label: '上层厚度(Y)', default: 0.08 },
    { key: 'bottomWidth', label: '下层平面宽', default: 5 },
    { key: 'bottomDepth', label: '下层平面深', default: 4 },
    { key: 'bottomCornerRadius', label: '下层圆角半径', default: 0.4, type: 'number' },
    { key: 'topOpacity', label: '上层透明度', default: 0.85 },
    { key: 'bottomOpacity', label: '下层透明度', default: 0.12 },
    { key: 'edgeBrightness', label: '边线亮度(0~1)', default: 0.9 },
    { key: 'gap', label: '上下层间距', default: 0.02 },
    { key: 'bottomYOffset', label: '下层 Y 偏移', default: 0 },
    { key: 'showEdges', label: '显示线框边', default: true, type: 'boolean' },
    { key: 'bloomEdges', label: '霓虹/Bloom 层', default: true, type: 'boolean' },
    { key: 'edgeRunLight', label: '下层边缘流光', default: true, type: 'boolean' },
    { key: 'edgeRunSpeed', label: '流光速度(圈/秒)', default: 0.35 },
    { key: 'topGridCells', label: '上层网格密度', default: 18 }
  ]

  private cfg: PedestalConfig

  private bottomGroup = new Group()
  private topGroup = new Group()

  private bottomMesh!: Mesh
  private topMesh!: Mesh
  private topGridMesh!: Mesh
  private bottomEdges!: LineSegments
  private topEdges!: LineSegments
  private bottomRunLight!: LineLoop

  private bottomMat!: MeshPhysicalMaterial
  private topMat!: MeshPhysicalMaterial
  private bottomEdgeMat!: LineBasicMaterial
  private topEdgeMat!: LineBasicMaterial
  private topGridMat!: ShaderMaterial
  private topGridUniforms!: TopGridUniforms
  private runLightMat!: ShaderMaterial
  private runLightUniforms!: RunLightUniforms

  constructor(name = 'TechPedestal') {
    super(name)

    const defMap = Object.fromEntries(
      TechPedestalModel.supportedProps
        .filter((p) => p.default !== undefined)
        .map((p) => [p.key, p.default])
    ) as Record<string, unknown>

    const getNum = (k: string, fallback: number) => {
      const v = Number(defMap[k])
      return Number.isFinite(v) ? v : fallback
    }

    const defTopBase = typeof defMap.topBaseColor === 'string' ? defMap.topBaseColor : '#0a1a2f'

    this.cfg = {
      color: typeof defMap.color === 'string' ? defMap.color : DEFAULT_TECH_BLUE,
      topBaseColor: defTopBase,
      topGridColor: typeof defMap.topGridColor === 'string' ? defMap.topGridColor : TOP_GRID_COLOR,
      bottomOutlineColor:
        typeof defMap.bottomOutlineColor === 'string' ? defMap.bottomOutlineColor : BOTTOM_OUTLINE_COLOR,
      topWidth: Math.max(0.01, getNum('topWidth', 4)),
      topDepth: Math.max(0.01, getNum('topDepth', 3)),
      topHeight: Math.max(0.01, getNum('topHeight', 0.08)),
      bottomWidth: Math.max(0.01, getNum('bottomWidth', 5)),
      bottomDepth: Math.max(0.01, getNum('bottomDepth', 4)),
      bottomCornerRadius: Math.max(0, getNum('bottomCornerRadius', 0.4)),
      topOpacity: Math.min(1, Math.max(0, getNum('topOpacity', 0.85))),
      bottomOpacity: Math.min(1, Math.max(0, getNum('bottomOpacity', 0.12))),
      edgeBrightness: Math.min(1, Math.max(0, getNum('edgeBrightness', 0.9))),
      gap: Math.max(0, getNum('gap', 0.02)),
      bottomYOffset: getNum('bottomYOffset', 0),
      showEdges: defMap.showEdges !== false,
      bloomEdges: defMap.bloomEdges !== false,
      edgeRunLight: defMap.edgeRunLight !== false,
      edgeRunSpeed: Math.max(0.01, getNum('edgeRunSpeed', 0.35)),
      topGridCells: Math.max(4, getNum('topGridCells', 18))
    }

    const planeHalfW = BASE_BOTTOM_W / 2
    const planeHalfH = BASE_BOTTOM_D / 2
    const planeCornerRadius = clampCornerRadius(this.cfg.bottomCornerRadius, planeHalfW, planeHalfH)
    const planeGeom = buildRoundedRectPlaneGeometry(planeHalfW, planeHalfH, planeCornerRadius, 14)
    const boxGeom = new BoxGeometry(BASE_TOP_W, BASE_TOP_H, BASE_TOP_D, 1, 1, 1)
    const topGridGeom = new PlaneGeometry(BASE_TOP_W, BASE_TOP_D, 1, 1)

    this.bottomMat = this.createFillMaterial(true)
    this.topMat = this.createFillMaterial(false)

    this.bottomEdgeMat = new LineBasicMaterial({
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: NormalBlending
    })
    this.topEdgeMat = new LineBasicMaterial({
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: NormalBlending
    })

    this.bottomMesh = new Mesh(planeGeom, this.bottomMat)
    this.bottomMesh.name = BOTTOM_MESH_NAME
    this.bottomMesh.rotation.x = -Math.PI / 2

    this.bottomEdges = new LineSegments(new EdgesGeometry(planeGeom), this.bottomEdgeMat)
    this.bottomEdges.name = BOTTOM_EDGES_NAME
    this.bottomEdges.rotation.x = -Math.PI / 2

    this.topMesh = new Mesh(boxGeom, this.topMat)
    this.topMesh.name = TOP_MESH_NAME

    this.topEdges = new LineSegments(new EdgesGeometry(boxGeom), this.topEdgeMat)
    this.topEdges.name = TOP_EDGES_NAME

    this.topGridUniforms = {
      uLineColor: { value: new Color() },
      uCells: { value: this.cfg.topGridCells }
    }
    this.topGridMat = new ShaderMaterial({
      uniforms: this.topGridUniforms as unknown as Record<string, { value: unknown }>,
      vertexShader: TOP_GRID_VERT,
      fragmentShader: TOP_GRID_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: AdditiveBlending,
      side: DoubleSide
    })
    this.topGridMesh = new Mesh(topGridGeom, this.topGridMat)
    this.topGridMesh.name = TOP_GRID_NAME
    this.topGridMesh.rotation.x = -Math.PI / 2
    this.topGridMesh.position.y = BASE_TOP_H / 2 + 0.002

    const hw = BASE_BOTTOM_W / 2
    const hh = BASE_BOTTOM_D / 2
    const cornerRadius = clampCornerRadius(this.cfg.bottomCornerRadius, hw, hh)
    const runGeo = buildBottomRunLightRoundedRectLoopGeometry(hw, hh, cornerRadius, 0.002, 160)
    this.runLightUniforms = {
      uColor: { value: new Color() },
      uTime: { value: 0 },
      uLoopPerSec: { value: this.cfg.edgeRunSpeed },
      uSigma: { value: 0.045 },
      uDim: { value: 0.1 }
    }
    this.runLightMat = new ShaderMaterial({
      uniforms: this.runLightUniforms as unknown as Record<string, { value: unknown }>,
      vertexShader: RUN_LIGHT_VERTEX,
      fragmentShader: RUN_LIGHT_FRAGMENT,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: AdditiveBlending
    })
    this.bottomRunLight = new LineLoop(runGeo, this.runLightMat)
    this.bottomRunLight.name = BOTTOM_RUN_LIGHT_NAME
    this.bottomRunLight.rotation.x = -Math.PI / 2

    this.bottomGroup.add(this.bottomMesh, this.bottomEdges, this.bottomRunLight)
    this.topGroup.add(this.topMesh, this.topEdges, this.topGridMesh)

    const scene = new Scene()
    scene.add(this.bottomGroup, this.topGroup)
    this.setScene(scene)

    this.applyAll()
  }

  private rebuildBottomRoundedGeometry(): void {
    const halfW = BASE_BOTTOM_W / 2
    const halfH = BASE_BOTTOM_D / 2
    const radius = clampCornerRadius(this.cfg.bottomCornerRadius, halfW, halfH)

    const newPlaneGeom = buildRoundedRectPlaneGeometry(halfW, halfH, radius, 14)
    const newEdgesGeom = new EdgesGeometry(newPlaneGeom)
    const newRunGeo = buildBottomRunLightRoundedRectLoopGeometry(halfW, halfH, radius, 0.002, 160)

    try { (this.bottomMesh.geometry as any)?.dispose?.() } catch { /* ignore */ }
    try { (this.bottomEdges.geometry as any)?.dispose?.() } catch { /* ignore */ }
    try { (this.bottomRunLight.geometry as any)?.dispose?.() } catch { /* ignore */ }

    this.bottomMesh.geometry = newPlaneGeom
    this.bottomEdges.geometry = newEdgesGeom
    this.bottomRunLight.geometry = newRunGeo
  }

  private createFillMaterial(isBottom: boolean): MeshPhysicalMaterial {
    return new MeshPhysicalMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: DoubleSide,
      blending: NormalBlending,
      metalness: 0.1,
      roughness: 0.42,
      clearcoat: 0.2,
      clearcoatRoughness: 0.45,
      emissiveIntensity: isBottom ? 0.08 : 0.06
    })
  }

  private applyMaterials(): void {
    const accent = new Color().setStyle(normalizeHexColorInput(this.cfg.color))
    const bgTint = new Color(0x0f172a)
    const bottomFill = accent.clone().lerp(bgTint, 0.26)

    const topBase = new Color().setStyle(normalizeHexColorInput(this.cfg.topBaseColor))
    this.topMat.color.copy(topBase)
    this.topMat.opacity = this.cfg.topOpacity
    this.topMat.emissive.copy(topBase)
    this.topMat.emissiveIntensity = 0.04 + this.cfg.edgeBrightness * 0.08

    this.bottomMat.color.copy(bottomFill)
    this.bottomMat.opacity = this.cfg.bottomOpacity
    this.bottomMat.emissive.copy(bottomFill)
    this.bottomMat.emissiveIntensity = 0.08 + this.cfg.edgeBrightness * 0.12

    const edgeAlpha = Math.min(1, Math.max(0, this.cfg.edgeBrightness))

    const outline = new Color().setStyle(normalizeHexColorInput(this.cfg.bottomOutlineColor))
    this.bottomEdgeMat.color.copy(outline)
    this.bottomEdgeMat.opacity = edgeAlpha

    const gridLine = new Color().setStyle(normalizeHexColorInput(this.cfg.topGridColor))
    this.topEdgeMat.color.copy(gridLine)
    this.topEdgeMat.opacity = edgeAlpha

    this.topGridUniforms.uLineColor.value.copy(gridLine)
    this.topGridUniforms.uCells.value = this.cfg.topGridCells

    this.runLightUniforms.uColor.value.copy(outline).multiplyScalar(1.05)
    this.runLightUniforms.uLoopPerSec.value = this.cfg.edgeRunSpeed
    this.runLightUniforms.uDim.value = 0.08 + (1 - edgeAlpha) * 0.12
  }

  private applyLayout(): void {
    const { bottomWidth, bottomDepth, topWidth, topDepth, topHeight, gap, bottomYOffset } = this.cfg

    this.bottomGroup.position.set(0, bottomYOffset + 0.001, 0)
    this.bottomGroup.scale.set(bottomWidth / BASE_BOTTOM_W, 1, bottomDepth / BASE_BOTTOM_D)

    const topY = bottomYOffset + gap + topHeight / 2
    this.topGroup.position.set(0, topY, 0)
    this.topGroup.scale.set(topWidth / BASE_TOP_W, topHeight / BASE_TOP_H, topDepth / BASE_TOP_D)
  }

  private applyEdgeVisibility(): void {
    const v = this.cfg.showEdges
    this.bottomEdges.visible = v
    this.topEdges.visible = v
    this.topGridMesh.visible = v
  }

  private applyRunLightVisibility(): void {
    this.bottomRunLight.visible = this.cfg.edgeRunLight
  }

  /** 霓虹：同时参与默认层（可见）与 Bloom 层（泛光叠加） */
  private applyBloomLayers(): void {
    const setNeon = (obj: Object3D) => {
      obj.layers.disableAll()
      obj.layers.enable(LayerDef.default)
      if (this.cfg.bloomEdges) {
        obj.layers.enable(LayerDef.bloom)
      }
    }
    setNeon(this.bottomEdges)
    setNeon(this.topEdges)
    setNeon(this.bottomRunLight)
    setNeon(this.topGridMesh)
    this.bottomMesh.layers.set(LayerDef.default)
    this.topMesh.layers.set(LayerDef.default)
  }

  private applyAll(): void {
    this.applyMaterials()
    this.applyLayout()
    this.applyEdgeVisibility()
    this.applyRunLightVisibility()
    this.applyBloomLayers()
  }

  override update(delta: number): void {
    super.update(delta)
    if (this.runLightUniforms && this.cfg.edgeRunLight) {
      this.runLightUniforms.uTime.value += delta
    }
  }

  override setScene(scene: Scene) {
    super.setScene(scene)

    const b = scene.getObjectByName(BOTTOM_MESH_NAME)
    const t = scene.getObjectByName(TOP_MESH_NAME)
    const tgrid = scene.getObjectByName(TOP_GRID_NAME)
    const be = scene.getObjectByName(BOTTOM_EDGES_NAME)
    const te = scene.getObjectByName(TOP_EDGES_NAME)
    const br = scene.getObjectByName(BOTTOM_RUN_LIGHT_NAME)

    if (b instanceof Mesh && b.material instanceof MeshPhysicalMaterial) {
      this.bottomMesh = b
      this.bottomMat = b.material
    }
    if (t instanceof Mesh && t.material instanceof MeshPhysicalMaterial) {
      this.topMesh = t
      this.topMat = t.material
    }
    if (tgrid instanceof Mesh && tgrid.material instanceof ShaderMaterial) {
      this.topGridMesh = tgrid
      this.topGridMat = tgrid.material
      this.topGridUniforms = tgrid.material.uniforms as unknown as TopGridUniforms
    }
    if (be instanceof LineSegments && be.material instanceof LineBasicMaterial) {
      this.bottomEdges = be
      this.bottomEdgeMat = be.material
    }
    if (te instanceof LineSegments && te.material instanceof LineBasicMaterial) {
      this.topEdges = te
      this.topEdgeMat = te.material
    }
    if (br instanceof LineLoop && br.material instanceof ShaderMaterial) {
      this.bottomRunLight = br
      this.runLightMat = br.material
      this.runLightUniforms = br.material.uniforms as unknown as RunLightUniforms
    }

    const bg = this.bottomMesh.parent
    const tg = this.topMesh.parent
    if (bg instanceof Group) this.bottomGroup = bg
    if (tg instanceof Group) this.topGroup = tg

    this.applyAll()
  }

  override propUpdate(key: string, value: unknown): void {
    if (key === 'color' && typeof value === 'string') {
      this.cfg.color = normalizeHexColorInput(value)
      this.applyMaterials()
      return
    }
    if (key === 'topBaseColor' && typeof value === 'string') {
      this.cfg.topBaseColor = normalizeHexColorInput(value)
      this.applyMaterials()
      return
    }
    if (key === 'topGridColor' && typeof value === 'string') {
      this.cfg.topGridColor = normalizeHexColorInput(value)
      this.applyMaterials()
      return
    }
    if (key === 'bottomOutlineColor' && typeof value === 'string') {
      this.cfg.bottomOutlineColor = normalizeHexColorInput(value)
      this.applyMaterials()
      return
    }
    if (key === 'topWidth') {
      this.cfg.topWidth = Math.max(0.01, Number(value))
      this.applyLayout()
      return
    }
    if (key === 'topDepth') {
      this.cfg.topDepth = Math.max(0.01, Number(value))
      this.applyLayout()
      return
    }
    if (key === 'topHeight') {
      this.cfg.topHeight = Math.max(0.01, Number(value))
      this.applyLayout()
      return
    }
    if (key === 'bottomWidth') {
      this.cfg.bottomWidth = Math.max(0.01, Number(value))
      this.applyLayout()
      return
    }
    if (key === 'bottomDepth') {
      this.cfg.bottomDepth = Math.max(0.01, Number(value))
      this.applyLayout()
      return
    }
    if (key === 'bottomCornerRadius') {
      this.cfg.bottomCornerRadius = Math.max(0, Number(value))
      this.rebuildBottomRoundedGeometry()
      return
    }
    if (key === 'topOpacity') {
      this.cfg.topOpacity = Math.min(1, Math.max(0, Number(value)))
      this.applyMaterials()
      return
    }
    if (key === 'bottomOpacity') {
      this.cfg.bottomOpacity = Math.min(1, Math.max(0, Number(value)))
      this.applyMaterials()
      return
    }
    if (key === 'edgeBrightness') {
      this.cfg.edgeBrightness = Math.min(1, Math.max(0, Number(value)))
      this.applyMaterials()
      return
    }
    if (key === 'gap') {
      this.cfg.gap = Math.max(0, Number(value))
      this.applyLayout()
      return
    }
    if (key === 'bottomYOffset') {
      this.cfg.bottomYOffset = Number(value)
      this.applyLayout()
      return
    }
    if (key === 'showEdges') {
      this.cfg.showEdges = value === true || value === 'true' || value === 1 || value === '1'
      this.applyEdgeVisibility()
      return
    }
    if (key === 'bloomEdges') {
      this.cfg.bloomEdges = value !== false && value !== 'false' && value !== 0 && value !== '0'
      this.applyBloomLayers()
      return
    }
    if (key === 'edgeRunLight') {
      this.cfg.edgeRunLight = value !== false && value !== 'false' && value !== 0 && value !== '0'
      this.applyRunLightVisibility()
      return
    }
    if (key === 'edgeRunSpeed') {
      const n = Number(value)
      this.cfg.edgeRunSpeed = Number.isFinite(n) ? Math.max(0.01, n) : 0.35
      this.runLightUniforms.uLoopPerSec.value = this.cfg.edgeRunSpeed
      return
    }
    if (key === 'topGridCells') {
      const n = Number(value)
      this.cfg.topGridCells = Number.isFinite(n) ? Math.max(4, n) : 18
      this.topGridUniforms.uCells.value = this.cfg.topGridCells
      return
    }

    super.propUpdate(key, value)
  }
}
