
const css = `border: solid #0e93b7 2px;
    z-index: 99999;
    background: black;
    opacity: 0.7;
    font-family: cursive;
    min-width: 300px;
    min-height: 200px;
    position: fixed;
    bottom: 50px;
    left: 50px;
    color: green;
    padding: 8px 8px;
    border-radius: 4px;
    font-size: 13px;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    pointer-events: none;`

// 页面上打印显式日志,方便调试
export class WebConsole {

    private static instance: WebConsole
    private lines: string[] = []
    private maxLines: number = 12
    container: HTMLDivElement;
    private constructor() {
        this.container = document.createElement('div')
    }

    static getInstance() {
        if (!WebConsole.instance) {
            WebConsole.instance = new WebConsole()
            WebConsole.instance.init()
        }
        return WebConsole.instance
    }

    private init(): void {
        this.container.id = 'web-console'
        this.container.style.cssText = css
        this.container.style.display = 'none'
        document.body.appendChild(this.container)
    }

    style(h: (style: CSSStyleDeclaration)=>void): void {
        if (!h) {
            return
        }
        h(this.container.style)
    }

    hide(): void {
        this.container.style.display = 'none'
    }
    show():void {
        this.container.style.display = 'block'
    }

    private update(): void {
        let c = ''
        for (let i=0;i<this.lines.length;i++) {
            if (i > 0) {
                c += '<br/>'
            }
            c += this.lines[i]
        }
        this.container.innerHTML = c
    }

    log(msg: string): void {
        this.lines.push(msg)
        if (this.maxLines < this.lines.length) {
            let removeLen = this.lines.length - this.maxLines
            for (let i = 0; i < removeLen; i++) {
                this.lines.shift()
            }
        }
        this.update()
    }
    process(msg: string): void {
        if (this.lines.length > 0) {
            this.lines.pop()
        }
        this.lines.push(msg)
        this.update()
    }
}