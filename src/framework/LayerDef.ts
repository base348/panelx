/**
 * Layer类型定义
 */
export class LayerDef {
    static readonly default = 0
    static readonly helper = 1
    static readonly environment = 2
    static readonly construct = 4

    static readonly ui = 8
    static readonly sprite = 16

    /** 仅此层参与 Bloom 后处理（three.js layer 仅支持 0..31） */
    static readonly bloom = 30

    static readonly rayCast = 31

    /** 兼容旧配置：历史上错误使用了 layer=32 作为 Bloom */
    static normalize(layer: number): number {
        return layer === 32 ? LayerDef.bloom : layer
    }

    private static layerNameMap = new Map<number, string>()

    private static initHelperName() {
        LayerDef.layerNameMap.set(LayerDef.default, "Default")
        LayerDef.layerNameMap.set(LayerDef.helper, "Helper")
        LayerDef.layerNameMap.set(LayerDef.environment, "Environment")
        LayerDef.layerNameMap.set(LayerDef.construct, "Construct")
        LayerDef.layerNameMap.set(LayerDef.ui, "UI")
        LayerDef.layerNameMap.set(LayerDef.sprite, "Sprite")
        LayerDef.layerNameMap.set(LayerDef.bloom, "Bloom")
        LayerDef.layerNameMap.set(LayerDef.rayCast, "RayCast")
    }

    /**
     * 所有支持的Layer
     */
    public static getAllLayers(): number[] {
        this.ensureInit()
        const keys = LayerDef.layerNameMap.keys()
        const res: number[] = []
        for (const k of keys) {
            res.push(k)
        }
        return res
    }

    private static ensureInit() {
        if (LayerDef.layerNameMap.size == 0) {
            LayerDef.initHelperName()
        }
    }

    /**
     * Layer名称
     * @param layerName
     */
    public static getHelperName(layerName: number): string {
        this.ensureInit()
        let name = LayerDef.layerNameMap.get(layerName)
        if (!name) {
            name = ''
        }
        return name
    }
}