import {Camera} from "three";
import {OrbitControls} from "three/examples/jsm/Addons.js";
import {BaseStoryBoard} from "./BaseStoryBoard.ts";
import type {Scene3DSceneOptions} from "./BaseStoryBoard.ts";
import type {StoryBoard} from "../StoryBoard.ts";

export class ControlsStoryBoard extends BaseStoryBoard implements StoryBoard {

    controls?: OrbitControls
    constructor(name: string, camera: Camera, options?: Scene3DSceneOptions) {
        super(name, camera, options)
    }

    enableControls(rendererElem: HTMLCanvasElement) {
        this.controls = new OrbitControls(this.camera, rendererElem)
    }

    updateControls() {
        this.controls?.update()
    }

    update(delta: number) {
        super.update(delta)
        this.updateControls()
    }
}