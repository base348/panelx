import {Camera} from "three";
import {BaseStoryBoard} from "./BaseStoryBoard.ts";
import type {StoryBoard} from "../StoryBoard.ts";

export class SimpleStoryBoard extends BaseStoryBoard implements StoryBoard {

    constructor(name: string, camera: Camera) {
        super(name, camera)
        this.scene.background = null
    }

}