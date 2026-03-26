import type { EditorConfig } from '../../types/editor'
import { editorBuiltinDatasources } from './datasources'
import { editorBuiltinRegisteredWidgets } from './registeredWidgets'
import { editorBuiltinDefaultParams } from './defaultParams'

export const editorBuiltinConfig: EditorConfig = {
  datasources: editorBuiltinDatasources,
  registeredWidgets: editorBuiltinRegisteredWidgets,
  widgetPropData: {
    defaultParams: editorBuiltinDefaultParams
  }
}

