/**
 * Dashboard 提供的 provide/inject 键与类型，供子组件或外部做类型安全的注入
 */

import type { InjectionKey, Ref } from 'vue'
import type { SetWidgetDataFn, WidgetDataMap } from './widgets'

/** widgetData：按 widget id 的 props 数据，配置加载后由 Dashboard 填充 */
export const WidgetDataKey: InjectionKey<Ref<WidgetDataMap>> = Symbol('widgetData')

/** setWidgetData：按 id 局部更新 widget 数据，便于后期配置数据更新 */
export const SetWidgetDataKey: InjectionKey<SetWidgetDataFn> = Symbol('setWidgetData')
