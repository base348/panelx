import {Camera, Object3D, Scene, Vector2} from "three";

export interface StoryBoardController {
    /**
     * 进入激活状态
     */
    onActivate(): void

    /**
     * 进入非激活状态
     */
    onDeactivate(): void
}

/**
 * 故事板,维护场景逻辑
 */
export interface StoryBoard extends StoryBoardController {
    name: string
    scene: Scene
    camera: Camera
    fullScreen: boolean
    position?: Vector2

    onWindowResize(size: Vector2): void
    changeSize(position: Vector2, size: Vector2): void
    changeLight(lightName: string, intensity: number):void
    useFullScreen(): void
    add(obj: Object3D): void
    getSize(): Vector2
    update(delta: number): void
    updateControls(): void
    getInnerStoryBoards(): StoryBoard[]
    addStoryboard(sb: StoryBoard): void
    destroy(): void
}