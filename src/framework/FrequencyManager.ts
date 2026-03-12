import {Clock} from "three";

/**
 * 世界帧率减速器, 对世界更新降频, 不建议大于3(默认60帧,降3倍变成20帧), 低于24帧不清晰
 */
export class FrequencyManager {
    private readonly updateFrequency: number
    private clock: Clock

    private updateCount: number = 0
    private updateDelta: number = 0

    constructor(frequency: number) {
        this.updateFrequency = frequency
        this.clock = new Clock()
    }

    /**
     * 更新世界帧间隔, 返回值>0说明有1个有效帧, 即可做一次渲染
     */
    update(): number {
        let delta = this.clock.getDelta()
        this.updateDelta += delta
        this.updateCount++
        if (this.updateCount < this.updateFrequency) {
            return 0
        }
        delta = this.updateDelta
        this.updateDelta = 0
        this.updateCount = 0
        return delta
    }
}