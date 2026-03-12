import {Mesh} from "three";

export class StaticConfig {
    enableDebug: boolean = false
}

const staticConfig: StaticConfig = { enableDebug: false }
export const debugEnabled = (): boolean =>  {
    return staticConfig.enableDebug
}

declare global {
    interface Window {
        __debug?: (enable: boolean) => void
    }
}
export const bindConfig = () => {
    window.__debug = (enable: boolean) => {
        staticConfig.enableDebug = enable
    }
}

export const releaseMesh= (mesh: Mesh) => {
    mesh.geometry.dispose()
    if (Array.isArray(mesh.material)) {
        // 处理材质数组的情况
        mesh.material.forEach(material => material.dispose());
    } else {
        // 处理单个材质的情况
        mesh.material.dispose();
    }
}

/** * 对Date的扩展，将 Date 转化为指定格式的String * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
 可以用 1-2 个占位符 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) * eg: * (new
 Date()).pattern("yyyy-MM-dd hh:mm:ss.S")==> 2006-07-02 08:09:04.423
 * (new Date()).pattern("yyyy-MM-dd E hh:mm:ss") ==> 2009-03-10 二 20:09:04
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
 */
export const Format = (data: Date, fmt: string) => { //author: meizz
    let o = {
        "M+": data.getMonth() + 1, //月份
        "d+": data.getDate(), //日
        "h+": data.getHours(), //小时
        "m+": data.getMinutes(), //分
        "s+": data.getSeconds(), //秒
        "q+": Math.floor((data.getMonth() + 3) / 3), //季度
        "S": data.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (data.getFullYear() + "").substring(4 - RegExp.$1.length));
    const oRecord: Record<string, number> = o
    for (const k in oRecord)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (String(oRecord[k])) : (("00" + oRecord[k]).substring(("" + oRecord[k]).length)));
    return fmt;
}