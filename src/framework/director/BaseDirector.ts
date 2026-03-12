import type { Director } from '../Director.ts'
import type { World } from '../World.ts'
import type { StoryBoard } from '../StoryBoard.ts'
import { debugEnabled } from '../util.ts'

/**
 * 管理 timer，实现 Director 基础能力；场景相关方法为 abstract，由子类实现
 */
export abstract class BaseDirector implements Director {
    protected _world: World
    private _timer: ReturnType<typeof setInterval> | number = -1
    protected timerInterval: number = 100

    protected constructor(world: World) {
        this._world = world
    }

    get world(): World {
        return this._world
    }

    abstract lockScene(lock: boolean, seq?: number): void
    abstract sceneTo(seq: number): void
    abstract show(sb: StoryBoard, duration: number): void
    abstract registerFrame(sb: StoryBoard, duration: number): void

    protected startDirectorProcess(): void {

    }

    public start(): void {
        if (this._timer !== -1) {
            if (debugEnabled()) {
                console.log('director has been started')
            }
            return
        }
        this._timer = setInterval(() => {
            this.startDirectorProcess()
        }, this.timerInterval)
    }

    public stop(): void {
        if (this._timer !== -1) {
            clearInterval(this._timer)
            this._timer = -1
        }
    }
}