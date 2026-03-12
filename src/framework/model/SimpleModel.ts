import {Model} from "./Model.ts";
import {Scene} from "three";

export class SimpleModel extends Model {
    constructor(name: string) {
        super(name);
        let scene = new Scene();
        this.setScene(scene)
    }
}