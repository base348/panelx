import { computed, defineComponent, h } from 'vue'

export default defineComponent({
  name: 'ExampleTestWidget',
  props: {
    title: { type: String, default: '测试组件' },
    message: { type: String, default: '这是 examples 注入的自定义 2D 组件' },
    color: { type: String, default: '#36a3ff' },
    background: { type: String, default: 'rgba(10, 24, 40, 0.75)' }
  },
  setup(props) {
    const rootStyle = computed<Record<string, string>>(() => ({
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      border: `1px solid ${props.color}`,
      background: props.background,
      color: '#e8f3ff',
      borderRadius: '6px',
      padding: '8px 10px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }))

    const titleStyle = computed<Record<string, string>>(() => ({
      fontSize: '12px',
      color: props.color,
      fontWeight: '600'
    }))

    const msgStyle = computed<Record<string, string>>(() => ({
      fontSize: '12px',
      lineHeight: '1.4',
      opacity: '0.9',
      wordBreak: 'break-all'
    }))

    return () =>
      h('div', { style: rootStyle.value }, [
        h('div', { style: titleStyle.value }, props.title),
        h('div', { style: msgStyle.value }, props.message)
      ])
  }
})

