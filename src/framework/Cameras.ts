import type {Camera, Vector3} from "three";
import {OrthographicCamera} from "three";

/**
 * 创建正交相机
 * @param positionA 立方体左上角位置
 * @param positionB 立方体对角位置
 */
export const genOrthographicCamera = (positionA: Vector3, positionB: Vector3): Camera => {
    const camera: Camera = new OrthographicCamera(
        positionA.x, positionB.x,
        positionA.y, positionB.y,
        positionA.z, positionB.z);
    camera.layers.enableAll()
    return camera
}