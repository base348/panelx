import { CanvasTexture, Scene, Sprite, SpriteMaterial, SRGBColorSpace } from 'three'
import { Model } from '../model/Model'
import type { PropDefinition } from '../model/ModelRegistry'
import type { Scene3DInfoBoxColorPreset, Scene3DInfoBoxConfig } from '../../types/dashboard'
import {
  renderScene3DSpriteInfoBoxContentToCanvas,
  resolveScene3DInfoBoxTheme
} from '../Scene3DInfoBox'
import { getSpriteInfoBoxBackgroundMaterial } from '../SpriteInfoBoxBackground'

const PRESET_ENUM: Scene3DInfoBoxColorPreset[] = ['info', 'success', 'warning', 'error']
const FX_ENUM = ['none', 'scanlines', 'noise', 'glitch', 'all'] as const
type InfoBoxFx = (typeof FX_ENUM)[number]

const SPRITE_CANVAS_W = 512
const SPRITE_CANVAS_H = 320

export class SpriteInfoBoxModel extends Model {
  static supportedProps: PropDefinition[] = [
    { key: 'title', label: '标题' },
    { key: 'subtitle', label: '副标题' },
    { key: 'metaLeft', label: '顶部左侧信息' },
    { key: 'metaRight', label: '顶部右侧信息' },
    { key: 'content', label: '正文内容（用 | 分行）' },
    { key: 'note', label: '底部备注' },
    { key: 'colorPreset', label: '主题色', enum: PRESET_ENUM },
    { key: 'fx', label: '屏幕特效', enum: [...FX_ENUM] }
  ]

  private cfg: Scene3DInfoBoxConfig
  private readonly canvas: HTMLCanvasElement
  private readonly texture: CanvasTexture
  private readonly backSprite: Sprite
  private readonly frontSprite: Sprite

  constructor(name = 'SpriteInfoBox') {
    super(name)

    this.cfg = {
      id: name,
      title: 'InfoBox',
      subtitle: 'Universal panel',
      metaLeft: 'Left meta',
      metaRight: 'Right meta',
      content: 'General purpose information content.',
      note: 'Tip: customize text in Editor props.',
      colorPreset: 'info',
      fx: 'scanlines',
      visible: true,
      renderType: 'sprite'
    }

    const theme0 = resolveScene3DInfoBoxTheme(this.cfg)
    this.backSprite = new Sprite(getSpriteInfoBoxBackgroundMaterial(theme0.bg))

    this.canvas = document.createElement('canvas')
    this.canvas.width = SPRITE_CANVAS_W
    this.canvas.height = SPRITE_CANVAS_H
    renderScene3DSpriteInfoBoxContentToCanvas(this.canvas, this.cfg)
    this.texture = new CanvasTexture(this.canvas)
    this.texture.colorSpace = SRGBColorSpace

    this.frontSprite = new Sprite(
      new SpriteMaterial({
        map: this.texture,
        transparent: true,
        depthTest: false
      })
    )

    const widthWorld = 280 * 0.01
    const heightWorld = widthWorld * (SPRITE_CANVAS_H / SPRITE_CANVAS_W)
    this.backSprite.scale.set(widthWorld, heightWorld, 1)
    this.frontSprite.scale.set(widthWorld, heightWorld, 1)
    this.backSprite.position.z = -0.001
    this.backSprite.renderOrder = 0
    this.frontSprite.renderOrder = 1

    const scene = new Scene()
    scene.add(this.backSprite, this.frontSprite)
    this.setScene(scene)
  }

  private syncForegroundTexture(): void {
    renderScene3DSpriteInfoBoxContentToCanvas(this.canvas, this.cfg)
    this.texture.needsUpdate = true
  }

  override propUpdate(key: string, value: unknown): void {
    const v = value == null ? '' : String(value)
    if (key === 'title') this.cfg.title = v
    else if (key === 'subtitle') this.cfg.subtitle = v
    else if (key === 'metaLeft') this.cfg.metaLeft = v
    else if (key === 'metaRight') this.cfg.metaRight = v
    else if (key === 'content') this.cfg.content = v
    else if (key === 'note') this.cfg.note = v
    else if (key === 'colorPreset') {
      const p = v as Scene3DInfoBoxColorPreset
      if (PRESET_ENUM.includes(p)) this.cfg.colorPreset = p
    } else if (key === 'fx') {
      const fx = v as InfoBoxFx
      if (FX_ENUM.includes(fx)) this.cfg.fx = fx
    } else {
      super.propUpdate(key, value)
      return
    }

    if (key === 'colorPreset') {
      const t = resolveScene3DInfoBoxTheme(this.cfg)
      this.backSprite.material = getSpriteInfoBoxBackgroundMaterial(t.bg)
    }
    this.syncForegroundTexture()
  }
}
