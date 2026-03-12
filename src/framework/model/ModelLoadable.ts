import {Model} from "./Model.ts";
import {AnimationClip, Material, type Mesh, Object3D, type Scene} from "three";

export class ModelLoadable extends Model{

    source: string;// 资源地址
    modelCategory: string
    constructor(name: string, category: string, source: string) {
        super(name)
        this.modelCategory = category
        this.source = source
    }

    onLoad(scene: Scene, animations?: AnimationClip[]) {
        this.setScene(scene)
        if (animations) {
            // console.log('set animations', animations)
            this.setAnimations(animations)
        }
    }

    findMesh(name: string, h: (m: Mesh) => void) {
        if (!h) {
            return
        }
        if (!this.scene) {
            return
        }
        let sub: Object3D[] = this.scene.children
        for (const child of sub) {
            let mesh = child as Mesh
            if (mesh.name === name) {
                h(mesh)
                return
            }
        }
    }

    controlMaterial = (name: string, h: (mesh: Mesh, mat:Material)=>void) => {
        this.findMesh(name, (mesh:Mesh) => {
            let material = mesh.material as Material
            h(mesh, material)
        })
    }
}