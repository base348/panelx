import {PCFSoftShadowMap, REVISION, SRGBColorSpace, Vector2, WebGLRenderer} from 'three'
import type {StoryBoard} from "./StoryBoard.ts";
import {FrequencyManager} from "./FrequencyManager.ts";
import {StatsWrapper} from "./StatsWrapper.ts";
import {bindConfig} from "./util.ts";
import {CSS3DRenderer} from "three/examples/jsm/Addons.js";

const defaultUpdateFrequency = 1

export class World {
    private storyBoardStore: StoryBoard[] = []
    private windowSize: Vector2 = new Vector2()
    private renderer!: WebGLRenderer
    private cssRenderer!: CSS3DRenderer
    private stats: StatsWrapper = new StatsWrapper()
    private container!: Element

    private frequencyManager: FrequencyManager = new FrequencyManager(defaultUpdateFrequency)

    private windowSizeVersion = 0
    private boundResizeHandler = () => this.onWindowResize()

    constructor(selector: string) {
        let c = document.querySelector(selector)
        if (c == null) {
            console.log("no target", selector)
            return
        }
        this.container = c!
        let size = this.getSize()
        console.log("world size", size.x, size.y)

        this.init()
        this.animateLoop()

        bindConfig()
    }

    /**
     * world scene 的物理尺寸：优先使用容器自身尺寸，保证 canvas 与容器一致并占满
     */
    getSize(): Vector2 {
        const el = this.container as HTMLElement
        const w = el.clientWidth || (el.parentElement?.clientWidth ?? 0)
        const h = el.clientHeight || (el.parentElement?.clientHeight ?? 0)
        return new Vector2(w, h)
    }

    private init() {
        // 初始化渲染器
        this.initRender()
        // 监听场景大小改变，重新渲染尺寸
        window.addEventListener('resize', this.boundResizeHandler)


    }

    /**
     * 0.hide 1.show(fps) 2.showAll
     */
    statsStyle(style: number) {
        this.stats.statsStyle(style)
    }

    private animateLoop() {
        this.animate()
    }

    private initRender() {
        let size = this.getSize()
        this.renderer = new WebGLRenderer({antialias:true,alpha:true})//设置抗锯齿
        this.renderer.setClearAlpha(0)

        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.outputColorSpace = SRGBColorSpace
        this.renderer.setSize(size.x, size.y)
        this.renderer.autoClear = false
        // this.renderer.setClearAlpha(0.1)
        // this.renderer.setClearColor(0x000000, 1)
        this.renderer.domElement.style.display = 'block'
        this.renderer.domElement.style.width = '100%'
        this.renderer.domElement.style.height = '100%'
        this.renderer.domElement.style.position = 'absolute'
        this.renderer.domElement.style.left = '0'
        this.renderer.domElement.style.top = '0'
        // 添加到容器
        this.container.appendChild(this.renderer.domElement)

        // ---------------------------------------------
        this.cssRenderer = new CSS3DRenderer()
        this.cssRenderer.setSize(size.x,size.y)
        this.cssRenderer.domElement.style.position = 'absolute'
        this.cssRenderer.domElement.style.top = '0'
        this.cssRenderer.domElement.style.left = '0'
        this.cssRenderer.domElement.style.right = '0'
        this.cssRenderer.domElement.style.bottom = '0'
        this.cssRenderer.domElement.style.width = '100%'
        this.cssRenderer.domElement.style.height = '100%'
        this.cssRenderer.domElement.style.pointerEvents = 'none'
        this.container.appendChild(this.cssRenderer.domElement)

        console.log('THREE.REVISION:', REVISION);

        console.log('WebGL支持级别:', this.renderer.getContext().getParameter(this.renderer.getContext().VERSION))
        this.renderer.debug.checkShaderErrors = true; // 启用着色器错误检查
        this.renderer.shadowMap.type = PCFSoftShadowMap; // 激活高级渲染特性
        this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
            console.error("WebGL 上下文丢失！")
            console.log(e)
        })
    }

    /**
     * 切换场景, 切换前的场景将会变成旧场景, 旧场景可以指定一个处理器做处理(destroy), 如果不指定处理器将默认执行destroy
     * @param storyBoard 新的场景
     * @param handleOldSb 旧场景处理器
     */
    sceneTo(storyBoard: StoryBoard, _handleOldSb?: (sb: StoryBoard)=>void) {
        this.storyBoardStore.push(storyBoard)
    }

    /** 供外部挂载 OrbitControls 等使用 */
    getRendererDom(): HTMLCanvasElement {
        return this.renderer.domElement
    }

    /** 停止渲染并释放资源，组件卸载时调用 */
    destroy(): void {
        window.removeEventListener('resize', this.boundResizeHandler)
        this.renderer.setAnimationLoop(null)
        this.renderer.dispose()
        this.cssRenderer.domElement.remove()
        this.renderer.domElement.remove()
    }

    /**
     * 当前的场景
     * @private
     */
    private getSb(): StoryBoard|undefined {
        if (this.storyBoardStore.length == 0) {
            return undefined
        } else {
            return this.storyBoardStore[0]
        }
    }

    private render() {
        this.stats.update()
        let delta = this.frequencyManager.update()
        if (delta <= 0) {
            return
        }
        this.renderer.clear()
        let sb = this.getSb()
        if (!sb) {
            return
        }
        this.renderStoryboard(sb, delta)
        // 如果有子界面, 渲染子界面, 只嵌套处理一层
        let children = sb.getInnerStoryBoards()
        if (children != undefined && children.length > 0) {
            for (let i=0; i<children.length; i++) {
                let innerSb = children[i]
                this.renderStoryboard(innerSb, delta)
                this.renderer.clearDepth()
            }
        }

        this.windowSizeVersion = 0 // 重置resize标记

        // 执行"切换场景"命令后,下一帧执行切换
        if (this.storyBoardStore.length > 1) { // has old
            let sb = this.storyBoardStore.shift()
            if (!sb) {
                return
            }
        }
    }

    private renderStoryboard(sb: StoryBoard, delta: number) {
        if (this.windowSizeVersion > 0) {
            sb.onWindowResize(this.windowSize)
        }
        sb.update(delta)
        if (!sb.fullScreen) {
            let size = sb.getSize()
            let pos = sb.position
            this.renderer.setViewport(pos?.x ?? 0, pos?.y ?? 0, size.x, size.y)
        } else {
            let size = this.getSize()
            this.renderer.setViewport(0, 0, size.x, size.y)
        }
        this.renderer.render(sb.scene, sb.camera)
        this.cssRenderer.render(sb.scene, sb.camera)
    }

    private animate() {
        this.renderer.setAnimationLoop(this.render.bind(this))
    }

    private onWindowResize() {
        let size = this.getSize()
        this.renderer.setSize(size.x, size.y)
        this.cssRenderer.setSize(size.x, size.y)
        this.windowSize = size
        this.windowSizeVersion++
    }

    /** 供外部在容器尺寸变化时调用，使 3D 画布与容器一致并居中 */
    notifyResize(): void {
        this.onWindowResize()
    }
}
