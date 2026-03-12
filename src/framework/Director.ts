import type {StoryBoard} from "./StoryBoard.ts";
import type {World} from "./World.ts";

/**
 * 导演
 */
export interface Director {
    readonly world: World

    /**
     * 开始
     */
    start(): void

    /**
     * 停止
     */
    stop(): void

    /**
     * 锁定Frame
     * @param lock 锁定/解锁
     * @param seq (可选)场景序列
     */
    lockScene(lock: boolean, seq?:number): void

    /**
     * 立刻切换到指定帧
     * @param seq 帧序列号
     */
    sceneTo(seq: number): void

    /**
     * 立刻显示
     * @param sb 故事板
     * @param duration 持续时间ms
     */
    show(sb: StoryBoard, duration: number): void

    /**
     * 注册一帧
     * @param sb 故事板
     * @param duration 持续时间(ms)
     */
    registerFrame(sb: StoryBoard, duration: number): void
}
