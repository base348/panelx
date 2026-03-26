export { default as Editor } from './Editor.vue'
export { default as Editor3D } from './Editor3D.vue'
export {
  registerEditor2DConfigExtension,
  getEditor2DConfigExtension,
  mergeEditor2DConfig,
  type Editor2DConfigExtension
} from './editor2dConfigRegistration'
export { registerWidgetTypeExtension } from '../widgets/widgetRegistry'
