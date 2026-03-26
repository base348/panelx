import { registerEditor2DConfigExtension, registerWidgetTypeExtension } from '../../editor'
import ExampleTestWidget from '../widgets/ExampleTestWidget'

let registered = false

export function register(): void {
  if (registered) return
  registered = true

  registerWidgetTypeExtension({
    type: 'exampleTestWidget',
    component: ExampleTestWidget,
    defaultProps: {
      title: '测试组件',
      message: '这是 examples 注入的自定义 2D 组件',
      color: '#36a3ff',
      background: 'rgba(10, 24, 40, 0.75)'
    },
    propConfig: [
      { key: 'title', label: '标题', type: 'string', default: '测试组件' },
      { key: 'message', label: '内容', type: 'string', default: '这是 examples 注入的自定义 2D 组件' },
      { key: 'color', label: '强调色', type: 'color', default: '#36a3ff' },
      { key: 'background', label: '背景色', type: 'color', default: 'rgba(10, 24, 40, 0.75)' }
    ]
  })

  registerEditor2DConfigExtension({
    registeredWidgets: [
      {
        type: 'exampleTestWidget',
        label: '测试组件(示例注入)',
        group: '示例扩展/测试组件',
        defaultSize: { width: 360, height: 120 },
        sampleImage: ''
      }
    ],
    widgetPropData: {
      defaultParams: {
        exampleTestWidget: {
          title: '测试组件',
          message: '这是 examples 注入的自定义 2D 组件',
          color: '#36a3ff',
          background: 'rgba(10, 24, 40, 0.75)'
        }
      }
    }
  })
}

