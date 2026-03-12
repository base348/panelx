import type {StoryBoardController} from "../StoryBoard.ts";
import {Object3D} from "three";


/**
 * 管理css3d object. (切换场景的时候保证本场景下css3d obj可见)
 */
export class CSS3DObjManager implements StoryBoardController {
    objMap: Map<string, Object3D> = new Map()

    register(obj: Object3D): void {
        this.objMap.set(obj.uuid, obj)
    }
    remove(uuid: string): void {
        this.objMap.delete(uuid)
    }
    onActivate(): void {
        this.objMap.forEach((obj: Object3D): void => {
            obj.visible = true
        })
    }
    onDeactivate(): void {
        this.objMap.forEach((obj: Object3D): void => {
            obj.visible = false
        })
    }
}