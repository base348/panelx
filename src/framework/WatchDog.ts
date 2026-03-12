export interface IWatchDog {
    start: ()=>void
    stop: ()=>void
    feed: ()=>void
}

export class WatchDog {
    callback: () => void
    constructor(h: () => void) {
        this.callback = h
    }
}