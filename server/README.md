# 测试用 SSE 服务

与 `src/editor/editor_config.json` 中 `datasources[].key === "sse_realtime"` 对应。

- **启动**：`pnpm run sse`（默认端口 3001，可通过环境变量 `SSE_PORT` 修改）
- **前端**：先启动本服务，再 `pnpm dev`；Vite 会将 `/api` 代理到本服务，前端连接 `url: '/api/sse'` 即可收到事件
- **数据目录**：`server/data`，服务启动时仅加载文件名以 **`_enable.json`** 结尾的数据文件（如 `2d-chart_enable.json`）；进程内对 `data` 目录 **`fs.watch`**，文件变更后 **重载 JSON 并对已连接的 SSE 客户端重启推送定时器**（并再发一条 `event: open` 含 `reloaded: true` 提示）
- **消息结构**：`header.route` + `payload`（数组）；2d 等事件另含 `header.strategy`（联调）；`3d_command` 仅含 `header.route`
- **数据链日志**：服务端默认输出 `[DataChain] SSE.send`；关闭可设环境变量 `DATA_CHAIN_LOG=0`

## 数据文件格式

`server/data/*_enable.json` 每个文件代表一个独立数据流：

```json
{
  "header": {
    "route": {
      "domain": "2d",
      "action": "chart"
    },
    "strategy": {
      "intervalMs": 3000,
      "emitMode": "rotate",
      "startDelayMs": 0
    }
  },
  "payload": [
    { "widgetId": "chart_1", "payload": { "series": [{ "data": [1, 2, 3] }] } },
    { "widgetId": "chart_1", "payload": { "series": [{ "data": [2, 3, 4] }] } }
  ]
}
```

说明：

- `header.route`：只需 `domain + action`；SSE `event` 由服务端自动拼接为 `domain_action`
- **下发给客户端**：`3d_command` 事件的 SSE 消息 **不包含** `header.strategy`（策略仅在服务端用于间隔/模式）；其它事件仍会在 `header.strategy` 中带 `source` / `cursor` / `total` 等便于联调
- 文件内 `header.strategy.intervalMs`：推送间隔（毫秒，仅服务端使用）
- `header.strategy.emitMode`：
  - `rotate`：每次推送 `payload` 中一条（循环）
  - `all`：每次推送完整 `payload` 数组
- `header.strategy.startDelayMs`：首次推送延迟（毫秒）
- `payload`：必须是数组；服务端输出时保持数组结构，数组元素可各自带不同 `widgetId/id`（支持单文件多实例）
