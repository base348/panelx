<template>
  <div class="panelx-glass-panel" :class="`panelx-glass-panel-theme-${theme}`">
    <!-- 顶部色条 -->
    <div
      v-if="showTab"
      class="panelx-glass-panel-tab"
      :class="`panelx-glass-panel-tab-${tabColor}`"
    />

    <!-- 头部 -->
    <div class="panelx-glass-panel-header">
      <div class="panelx-glass-panel-title">
        <div class="panelx-glass-panel-title-cn">{{ title }}</div>
        <div v-if="subTitle" class="panelx-glass-panel-sub-title">
          {{ subTitle }}
        </div>
      </div>

      <!-- 折叠按钮 -->
      <div v-if="showFold" class="panelx-glass-panel-fold">
        <span></span>
        <span></span>
      </div>
    </div>

    <!-- 内容插槽 -->
    <div class="panelx-glass-panel-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">

// TS 接口定义
interface Props {
  title?: string
  subTitle?: string
  /** 统一壳主题：同主题下配色/线条一致 */
  theme?: 'hud'
  tabColor?: 'blue' | 'cyan' | 'yellow' | 'green' | 'orange' | 'purple'
  showTab?: boolean
  showFold?: boolean
}

// ✅ 使用 withDefaults 设置默认值
withDefaults(defineProps<Props>(), {
  title: '',
  subTitle: '',
  theme: 'hud',
  tabColor: 'blue',       // 默认蓝色
  showTab: false,         // 默认不显示顶部色条
  showFold: true          // 默认显示折叠按钮
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 核心卡片 + theme token（CSS 变量） */
.panelx-glass-panel {
  /* theme tokens（默认 hud） */
  --px-panel-bg: rgba(12, 26, 54, 0.75);
  --px-panel-blur: 4px;
  --px-panel-border: rgba(30, 59, 106, 0.6);
  --px-panel-radius: 4px;
  --px-panel-shadow-1: 0 0 0 1px rgba(82, 152, 255, 0.2);
  --px-panel-shadow-2: 0 0 8px rgba(82, 152, 255, 0.25);
  --px-panel-shadow-3: 0 0 18px rgba(30, 70, 130, 0.15);

  --px-panel-title-cn: #ffffff;
  --px-panel-title-en: #6586b5;
  --px-panel-fold: #6586b5;

  --px-panel-title-underline: #5298ff;
  --px-panel-title-underline-shadow: 0 1px 2px rgba(82, 152, 255, 0.2);

  --px-panel-tab-blue: #2584ff;
  --px-panel-tab-cyan: #00e0f7;
  --px-panel-tab-yellow: #f9d03f;
  --px-panel-tab-green: #36cc85;
  --px-panel-tab-orange: #ff9535;
  --px-panel-tab-purple: #7c7cff;

  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--px-panel-bg);
  backdrop-filter: blur(var(--px-panel-blur));
  -webkit-backdrop-filter: blur(var(--px-panel-blur));
  border: 1px solid var(--px-panel-border);
  border-radius: var(--px-panel-radius);
  overflow: hidden;
  box-shadow:
    var(--px-panel-shadow-1),
    var(--px-panel-shadow-2),
    var(--px-panel-shadow-3);
  container-type: size;
  container-name: glass-panel;
}

/* 顶部色条 */
.panelx-glass-panel-tab {
  height: 6px;
  width: 100%;
}
.panelx-glass-panel-tab-blue { background: var(--px-panel-tab-blue); }
.panelx-glass-panel-tab-cyan { background: var(--px-panel-tab-cyan); }
.panelx-glass-panel-tab-yellow { background: var(--px-panel-tab-yellow); }
.panelx-glass-panel-tab-green { background: var(--px-panel-tab-green); }
.panelx-glass-panel-tab-orange { background: var(--px-panel-tab-orange); }
.panelx-glass-panel-tab-purple { background: var(--px-panel-tab-purple); }

/* 头部 */
.panelx-glass-panel-header {
  flex-shrink: 0;
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 标题区域 + 高亮下划线 */
.panelx-glass-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  width: calc(100% - 50px);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--px-panel-title-underline);
  box-shadow: var(--px-panel-title-underline-shadow);
}

/* 主标题 */
.panelx-glass-panel-title-cn {
  font-size: 15px;
  color: var(--px-panel-title-cn);
  font-weight: 400;
  letter-spacing: 0.5px;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 副标题 */
.panelx-glass-panel-sub-title {
  font-size: 11px;
  color: var(--px-panel-title-en);
  text-transform: uppercase;
  font-family: "Roboto", "Arial", sans-serif;
  font-weight: 300;
  letter-spacing: 1px;
}

/* 折叠按钮 */
.panelx-glass-panel-fold {
  width: 14px;
  height: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
}
.panelx-glass-panel-fold span {
  width: 100%;
  height: 2px;
  background: var(--px-panel-fold);
}

/* 内容区域 */
.panelx-glass-panel-body {
  flex: 1;
  min-height: 0;
  padding: 24px 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>