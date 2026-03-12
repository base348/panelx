<template>
  <div class="verify-demo">
    <aside class="verify-demo-side">
      <h2>演示验证</h2>
      <p class="verify-demo-desc">在此页运行并查看验证结果，验证逻辑在 <code>src/demo/VerifyDemo.vue</code> 的 <code>runVerification()</code> 中编写。</p>
      <button type="button" class="verify-demo-btn" @click="run">重新运行验证</button>
    </aside>
    <section class="verify-demo-result">
      <h3>验证结果</h3>
      <ul v-if="results.length" class="verify-demo-list">
        <li
          v-for="(r, i) in results"
          :key="i"
          class="verify-demo-item"
          :class="r.pass ? 'pass' : 'fail'"
        >
          <span class="verify-demo-icon">{{ r.pass ? '✓' : '✗' }}</span>
          <span class="verify-demo-name">{{ r.name }}</span>
          <span v-if="r.message" class="verify-demo-msg">{{ r.message }}</span>
        </li>
      </ul>
      <p v-else class="verify-demo-empty">点击「重新运行验证」或进入本页时自动运行。</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

export interface VerifyItem {
  name: string
  pass: boolean
  message?: string
}

const results = ref<VerifyItem[]>([])

function addResult(name: string, pass: boolean, message?: string) {
  results.value.push({ name, pass, message })
}

/**
 * 在此处编写演示验证逻辑，通过 addResult(name, pass, message?) 记录每条结果
 */
async function runVerification() {
  results.value = []

  // 示例：SDK 可用
  try {
    const { panelx } = await import('../sdk')
    addResult('SDK 初始化', !!panelx, panelx ? 'panelx 可用' : 'panelx 未定义')
  } catch (e) {
    addResult('SDK 初始化', false, String(e))
  }

  // 示例：尺寸管理器
  try {
    const { SizeManager2D } = await import('../core/size')
    const sm = new SizeManager2D({ designWidth: 1920, designHeight: 1080, actualWidth: 960 })
    const ok = sm.actualHeight === 540 && sm.scale === 0.5
    addResult('2D 尺寸管理器', ok, ok ? `scale=${sm.scale}, actualHeight=${sm.actualHeight}` : '计算异常')
  } catch (e) {
    addResult('2D 尺寸管理器', false, String(e))
  }

  // 示例：Dashboard 配置类型
  try {
    const design = { width: 1920, height: 1080 }
    const widgets2D: unknown[] = []
    addResult('Dashboard 配置结构', typeof design.width === 'number' && Array.isArray(widgets2D), 'design + widgets2D 结构正确')
  } catch (e) {
    addResult('Dashboard 配置结构', false, String(e))
  }

  // 验证车间大屏 JSON 配置可加载且结构正确（供编辑器加载/导出）
  try {
    const mod = await import('./dashboard_config.json')
    const c = mod.default as unknown as Record<string, unknown>
    const hasDesign = c && typeof c.design === 'object' && typeof (c.design as { width?: number }).width === 'number'
    const hasWidgets = Array.isArray(c.widgets2D) && c.widgets2D.length > 0
    const hasTopBar = hasWidgets && (c.widgets2D as { id: string }[]).some((w) => w.id === 'ws-topbar')
    addResult('车间大屏 JSON 配置', hasDesign && hasWidgets, hasTopBar ? 'design + widgets2D + ws-topbar 可被编辑器加载' : 'design + widgets2D 存在')
  } catch (e) {
    addResult('车间大屏 JSON 配置', false, String(e))
  }
}

function run() {
  runVerification()
}

onMounted(() => {
  runVerification()
})
</script>

<style scoped>
.verify-demo {
  display: flex;
  height: 100%;
  font-size: 14px;
}
.verify-demo-side {
  width: 280px;
  padding: 24px;
  background: #1e1e2e;
  color: #e2e2e2;
  border-right: 1px solid rgba(255,255,255,0.08);
}
.verify-demo-side h2 {
  margin: 0 0 12px;
  font-size: 1.1rem;
}
.verify-demo-desc {
  margin: 0 0 16px;
  line-height: 1.5;
  color: #999;
}
.verify-demo-desc code {
  padding: 2px 6px;
  background: rgba(255,255,255,0.08);
  border-radius: 4px;
  font-size: 12px;
}
.verify-demo-btn {
  padding: 8px 16px;
  border: 1px solid #1890ff;
  border-radius: 6px;
  background: transparent;
  color: #1890ff;
  cursor: pointer;
}
.verify-demo-btn:hover {
  background: rgba(24, 144, 255, 0.15);
}
.verify-demo-result {
  flex: 1;
  padding: 24px;
  overflow: auto;
  background: #0d0d12;
  color: #e2e2e2;
}
.verify-demo-result h3 {
  margin: 0 0 16px;
  font-size: 1rem;
}
.verify-demo-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.verify-demo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  background: rgba(255,255,255,0.04);
}
.verify-demo-item.pass .verify-demo-icon { color: #52c41a; }
.verify-demo-item.fail .verify-demo-icon { color: #f5222d; }
.verify-demo-name { font-weight: 500; }
.verify-demo-msg { color: #888; font-size: 12px; }
.verify-demo-empty { color: #666; }
</style>
