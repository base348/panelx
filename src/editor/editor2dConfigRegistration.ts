import type { EditorConfig, RegisteredWidgetDef, WidgetPropData } from '../types/editor'
import type { BackendDataSourceConfig } from '../types'

export interface Editor2DConfigExtension {
  registeredWidgets?: RegisteredWidgetDef[]
  widgetPropData?: WidgetPropData
  datasources?: BackendDataSourceConfig[]
}

let externalEditor2DConfig: Editor2DConfigExtension = {}

/** 外部注入 Editor2D 配置（可在 examples 二次开发启动阶段调用） */
export function registerEditor2DConfigExtension(ext: Editor2DConfigExtension): void {
  externalEditor2DConfig = {
    registeredWidgets: ext.registeredWidgets ? [...ext.registeredWidgets] : externalEditor2DConfig.registeredWidgets,
    widgetPropData: ext.widgetPropData
      ? {
          defaultParams: { ...(externalEditor2DConfig.widgetPropData?.defaultParams ?? {}), ...(ext.widgetPropData.defaultParams ?? {}) },
          dashboardData: { ...(externalEditor2DConfig.widgetPropData?.dashboardData ?? {}), ...(ext.widgetPropData.dashboardData ?? {}) }
        }
      : externalEditor2DConfig.widgetPropData,
    datasources: ext.datasources ? [...ext.datasources] : externalEditor2DConfig.datasources
  }
}

export function getEditor2DConfigExtension(): Editor2DConfigExtension {
  return {
    registeredWidgets: externalEditor2DConfig.registeredWidgets ? [...externalEditor2DConfig.registeredWidgets] : undefined,
    widgetPropData: externalEditor2DConfig.widgetPropData
      ? {
          defaultParams: { ...(externalEditor2DConfig.widgetPropData.defaultParams ?? {}) },
          dashboardData: { ...(externalEditor2DConfig.widgetPropData.dashboardData ?? {}) }
        }
      : undefined,
    datasources: externalEditor2DConfig.datasources ? [...externalEditor2DConfig.datasources] : undefined
  }
}

export function mergeEditor2DConfig(base: EditorConfig, ext?: Editor2DConfigExtension): EditorConfig {
  const injected = ext ?? getEditor2DConfigExtension()
  const baseWidgets = base.registeredWidgets ?? []
  const extWidgets = injected.registeredWidgets ?? []
  const mergedWidgetMap = new Map<string, RegisteredWidgetDef>()
  for (const item of baseWidgets) mergedWidgetMap.set(item.type, item)
  for (const item of extWidgets) mergedWidgetMap.set(item.type, item)

  const mergedWidgetPropData: WidgetPropData | undefined =
    base.widgetPropData || injected.widgetPropData
      ? {
          defaultParams: { ...(base.widgetPropData?.defaultParams ?? {}), ...(injected.widgetPropData?.defaultParams ?? {}) },
          dashboardData: { ...(base.widgetPropData?.dashboardData ?? {}), ...(injected.widgetPropData?.dashboardData ?? {}) }
        }
      : undefined

  const mergedDatasources =
    injected.datasources !== undefined ? [...injected.datasources] : base.datasources ? [...base.datasources] : undefined

  return {
    registeredWidgets: Array.from(mergedWidgetMap.values()),
    widgetPropData: mergedWidgetPropData,
    datasources: mergedDatasources
  }
}

