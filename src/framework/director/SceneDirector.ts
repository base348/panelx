import type {Director} from "../Director.ts";
import type {World} from "../World.ts";
import type {StoryBoard} from "../StoryBoard.ts";
import {debugEnabled} from "../util.ts";
import {FrameItem, FrameManager} from "./FrameManager.ts";

/**
 * 实现完整场景切换（Director 完整功能）
 */
export class SceneDirector extends FrameManager implements Director {

    currentSb!: StoryBoard
    lastSb!: StoryBoard

    constructor(world: World) {
        super(world)
    }

    override sceneTo(seq: number): void {
        this.setCurrentIndex(seq)
        const item = this.frames[seq]
        if (!item) return
        if (debugEnabled()) {
            console.log("切换场景", item.sb.name)
        }
        this.show(item.sb, item.duration)
    }

    override show(sb: StoryBoard, duration: number): void {
        // 原理:
        // 重置duration, 让调度器重新计时
        // 并不改变调度器当前场景, 下次切换时继续切换到下一个
        // 相当于替换了当前场景

        if (this.currentSb != undefined) {// 将当前sb执行deactivate, 并备份当前sb
            this.currentSb.onDeactivate()
            this.lastSb = this.currentSb
        }
        sb.onActivate()
        this.currentSb = sb
        this.resetDuration()
        this.setFrameDuration(duration)
        this.world.sceneTo(sb)
    }

    override registerFrame(sb: StoryBoard, duration: number): void {
        let item = new FrameItem()
        item.sb = sb
        item.duration = duration
        this.frames.push(item)
    }
}