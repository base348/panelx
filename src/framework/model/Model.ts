import {AnimationAction, AnimationClip, AnimationMixer, Object3D, Scene} from "three";
import {ModelInstanceStore} from "../ModelInstanceStore.ts";
import type { PropDefinition } from "./ModelRegistry";

export class Model extends Object3D{
    modelName: string
    scene?: Scene
    animationsClips?: AnimationClip[]
    updateEnable: boolean = false
    isCss3d: boolean = false
    modelStore?: ModelInstanceStore
    actions!: Map<string, AnimationAction>
    actionMixer!: AnimationMixer
    layer: number[] = []
    /** 模型自定义属性，由编辑器或配置传入，暂不在 Model 内部逻辑中使用 */
    props?: Record<string, unknown>
    /** 子类可覆盖：该模型支持的 prop 列表，用于编辑器展示与枚举/自由输入 */
    static supportedProps?: PropDefinition[]
    constructor(name: string) {
        super()
        this.modelName = name
    }

    setScene(scene: Scene) {
        this.scene = scene
    }
    setAnimations(animations?: AnimationClip[]) {
        if (animations) {
            this.animations = animations
            this.animationsClips = animations
        }
    }

    initActions(): void {
        this.actions = new Map()
        if (!this.animationsClips || !this.scene) {
            return
        }
        this.actionMixer = new AnimationMixer(this.scene)
        for (let i = 0; i < this.animationsClips.length; i++) {
            const clip = this.animationsClips[i] as AnimationClip
            const action = this.actionMixer.clipAction(clip)
            console.log('action', clip.name)
            this.actions.set(clip.name, action)
        }
        this.scene.traverse((child) => {
            const skinned = child as { isSkinnedMesh?: boolean; bind?: (s: unknown, m: unknown) => void; skeleton?: { needsUpdate: boolean }; bindMatrix?: unknown }
            if (skinned.isSkinnedMesh && skinned.bind && skinned.skeleton) {
                skinned.bind(skinned.skeleton, skinned.bindMatrix)
                skinned.skeleton.needsUpdate = true
            }
        })
    }



    setPosition(x: number, y: number, z: number) {
        this.scene?.position.set(x,y,z)
    }

    update(_delta: number) {
        // 什么也不做
    }

    /**
     * 编辑器或外部更新某个 prop 时调用，子类可覆盖以响应（如切 preset、改颜色）。
     * 基类仅打 log，不修改内部状态。
     */
    propUpdate(key: string, value: unknown): void {
        console.log(`[Model] propUpdate ${this.modelName} key=${key} value=`, value)
    }

}