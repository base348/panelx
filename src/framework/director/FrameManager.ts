import {BaseDirector} from "./BaseDirector.ts";
import type {World} from "../World.ts";
import type {Director} from "../Director.ts";
import type {StoryBoard} from "../StoryBoard.ts";

/**
 * 场景序列
 */
export class FrameItem {
    sb!: StoryBoard
    duration!: number
}

/**
 * 管理场景计时/切换/锁定(private变量不能直接操作,防止越界)
 */
export abstract class FrameManager extends BaseDirector implements Director {
    protected frames: FrameItem[] = []
    private currentIndex: number = -1 // 当前帧编号
    private currentDuration: number = -1 // 当前帧已经播放时长
    private frameDuration: number = -1 // 当前帧应该播放时长
    private sceneLocked: boolean = false // true:停止调度

    protected constructor(world: World) {
        super(world)
    }

    protected startDirectorProcess(): void {
        super.startDirectorProcess()
        if (this.sceneLocked) { // 不调度
            return
        }
        if (this.frames.length == 0 || this.frames.length <= this.currentIndex) {
            return // 无需调度
        }
        if (this.currentIndex < 0) { // 首次开启场景调度,进入第一个
            this.setCurrentIndex(0)
            this.sceneTo(0)
            return
        }
        if (this.frames.length < 2) { // 不需要切换
            return
        }
        this.durationIncrement()
        // console.log('cur:', this.currentDuration, 'frame:', this.frameDuration)
        if (this.currentFrameCompleted()) {// 到达duration, 切换下一个场景
            let nextIndex: number = this.nextSeq()
            this.sceneTo(nextIndex)
        }
    }

    override lockScene(lock: boolean, seq?: number): void {
        this.sceneLocked = lock
        if (seq !== undefined) {
            this.sceneTo(seq)
        }
    }
    private currentFrameCompleted() {
        return this.currentDuration >= this.frameDuration
    }
    private durationIncrement() {
        this.currentDuration += this.timerInterval
    }
    private nextSeq(): number {
        let nextIndex: number = this.currentIndex+1
        nextIndex%=this.frames.length
        return nextIndex
    }

    /**
     * 重置后当前已播放时间为0
     * @protected
     */
    protected resetDuration(): void {
        this.currentDuration = 0
    }

    /**
     * 设置播放时长
     * @param duration ms
     * @private
     */
    protected setFrameDuration(duration: number): void {
        this.frameDuration = duration
    }

    /**
     * 仅设置当前帧索引，不执行切换（供子类或内部调度使用）
     */
    protected setCurrentIndex(seq: number): void {
        this.currentIndex = seq
    }

    /**
     * 立刻切换到指定帧（Director 接口），由子类实现并完成实际场景切换
     */
    abstract override sceneTo(seq: number): void
}