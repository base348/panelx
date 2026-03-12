import {BaseStoryBoard} from "./BaseStoryBoard.ts";
import type {StoryBoard} from "../StoryBoard.ts";
import {Camera, Group} from "three";
import type {Model} from "../model/Model.ts";
import {OrbitControls} from "three/examples/jsm/Addons.js";
import {debugEnabled} from "../util.ts";

export class GamePad {
    inner!: Gamepad
    axes: number[] = []
    pressedBtn: number[] = []
}
export class SpriteObject {
    inner: Model
    innerGroup: Group

    constructor(obj: Model) {
        this.inner = obj
        this.innerGroup = new Group()
        if (obj.scene) this.innerGroup.add(obj.scene)
    }
    update(_delta: number, _pad: GamePad) {

    }
}

export class SpriteStoryBoard extends BaseStoryBoard implements StoryBoard {
    pad?: Gamepad
    controls!: OrbitControls
    private list: SpriteObject[] = []
    constructor(name: string, camera: Camera) {
        super(name, camera);
    }
    enableControls(rendererElem: HTMLCanvasElement) {
        this.controls = new OrbitControls(this.camera, rendererElem)

    }

    update(delta: number) {
        super.update(delta);
        const pad= this.getPad()
        if (pad) {
            this.updateChildren(delta, pad)
        } else {
            if (debugEnabled()) {
                console.log('no pad')
            }
        }
    }

    getPad(): GamePad | null {
        const pads = navigator.getGamepads()
        if (!pads || pads.length === 0) {
            return null
        }
        let pad: Gamepad | null = pads[0]
        if (!pad) {
            for (let i = 0; i < pads.length; i++) {
                if (pads[i]) {
                    pad = pads[i]
                    break
                }
            }
            if (!pad) {
                this.pad = undefined
                return null
            }
        }
        this.pad = pad
        let validPad = new GamePad()
        validPad.inner = pad
        for (let i = 0; i < pad.axes.length; i++) {
            let v = pad.axes[i]
            if (Math.abs(v) < 0.001) {
                v = 0
            }
            validPad.axes.push(v)
        }
        for (let i = 0; i < pad.buttons.length; i++) {
            if (pad.buttons[i].pressed) {
                validPad.pressedBtn.push(i)
            }
        }
        return validPad
    }

    addSprite(s: SpriteObject) {
        this.list.push(s)
        this.scene.add(s.innerGroup)
    }

    updateChildren(delta: number, pad: GamePad) {
        for (let i = 0; i < this.list.length; i++) {
            let item = this.list[i]
            item.update(delta, pad)
        }
    }
}