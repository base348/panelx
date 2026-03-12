import {AnimationAction, AnimationClip, AnimationMixer, Object3D, Scene} from "three";
import {ModelInstanceStore} from "../ModelInstanceStore.ts";

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

}