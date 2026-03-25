/**
 * 测试用 SSE 服务：读取 server/data/*_enable.json 后按策略推送。
 * 启动：pnpm run sse
 * 前端 /api/sse 通过 Vite proxy 转发到本服务
 */

import { createServer } from 'http'
import { readdirSync, readFileSync, existsSync, watch } from 'fs'
import { join, basename } from 'path'
import { fileURLToPath } from 'url'

const PORT = Number(process.env.SSE_PORT) || 3001
const LOG_PREFIX = '[DataChain]'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DATA_DIR = join(__dirname, 'data')

function toFinite(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function resolveEventName(route) {
  const domain = String(route?.domain ?? '').trim().toLowerCase()
  const action = String(route?.action ?? '').trim().toLowerCase()
  if (domain && action) return `${domain}_${action}`
  return 'message'
}

function normalizeDataset(fileName, raw) {
  const rec = raw && typeof raw === 'object' ? raw : {}
  const header = rec.header && typeof rec.header === 'object' ? rec.header : {}
  const strategy = header.strategy && typeof header.strategy === 'object' ? header.strategy : {}
  const route = header.route && typeof header.route === 'object' ? header.route : {}
  const payload = Array.isArray(rec.payload) ? rec.payload : []
  return {
    fileName,
    event: resolveEventName(route),
    header: {
      route: {
        domain: String(route.domain ?? '').trim() || '2d',
        action: String(route.action ?? '').trim() || 'other'
      },
      strategy: {
        intervalMs: Math.max(100, toFinite(strategy.intervalMs, 3000)),
        emitMode: strategy.emitMode === 'all' ? 'all' : 'rotate',
        startDelayMs: Math.max(0, toFinite(strategy.startDelayMs, 0))
      }
    },
    payload
  }
}

function loadDatasets() {
  if (!existsSync(DATA_DIR)) return []
  const files = readdirSync(DATA_DIR).filter((name) => {
    const lower = name.toLowerCase()
    return lower.endsWith('_enable.json')
  })
  const list = []
  for (const file of files) {
    const fullPath = join(DATA_DIR, file)
    try {
      const text = readFileSync(fullPath, 'utf8')
      const parsed = JSON.parse(text)
      list.push(normalizeDataset(file, parsed))
    } catch (err) {
      console.warn(`[SSE] Skip invalid json: ${file} (${String(err)})`)
    }
  }
  return list
}

/** 当前内存中的数据集；文件变更后会 reload */
let datasets = loadDatasets()

/** 已建立的 SSE 长连接：重载时停旧定时器并重新 startDatasetStream */
const activeSseConnections = new Set()

let reloadDebounceTimer = null
const RELOAD_DEBOUNCE_MS = 250

function isDataEnableFile(name) {
  return String(name ?? '')
    .toLowerCase()
    .endsWith('_enable.json')
}

function reloadDatasetsAndRestartStreams() {
  datasets = loadDatasets()
  console.log(`[SSE] Datasets reloaded: ${datasets.length} file(s)`)

  for (const conn of [...activeSseConnections]) {
    if (conn.res.writableEnded) {
      activeSseConnections.delete(conn)
      continue
    }
    for (const stop of conn.stoppers) {
      try {
        stop()
      } catch (_) {
        /* ignore */
      }
    }
    conn.stoppers = []
    try {
      sendSSE(conn.res, 'open', {
        header: {
          route: { domain: 'meta', action: 'connected' },
          strategy: { datasetCount: datasets.length, reloaded: true }
        },
        payload: [{ message: 'SSE datasets reloaded', ts: Date.now() }]
      })
    } catch (err) {
      console.warn(`[SSE] Reload notify failed, dropping connection: ${String(err)}`)
      try {
        conn.res.end()
      } catch (_) {
        /* ignore */
      }
      activeSseConnections.delete(conn)
      continue
    }
    conn.stoppers = datasets.map((dataset) => startDatasetStream(conn.res, dataset))
  }
}

function scheduleReloadFromWatch(eventType, filename) {
  if (filename != null && filename !== '' && !isDataEnableFile(filename)) {
    return
  }
  if (process.env.DATA_CHAIN_LOG !== '0') {
    console.log(`${LOG_PREFIX} data/watch ${eventType} ${filename ?? '(dir)'}`)
  }
  if (reloadDebounceTimer) clearTimeout(reloadDebounceTimer)
  reloadDebounceTimer = setTimeout(() => {
    reloadDebounceTimer = null
    reloadDatasetsAndRestartStreams()
  }, RELOAD_DEBOUNCE_MS)
}

if (existsSync(DATA_DIR)) {
  try {
    const watcher = watch(DATA_DIR, { persistent: true }, (eventType, filename) => {
      scheduleReloadFromWatch(eventType, filename)
    })
    watcher.on('error', (err) => {
      console.error('[SSE] fs.watch error:', err)
    })
  } catch (err) {
    console.warn('[SSE] fs.watch not available:', err)
  }
}

function sendSSE(res, event, data) {
  const encoded = JSON.stringify(data)
  if (process.env.DATA_CHAIN_LOG !== '0') {
    console.log(`${LOG_PREFIX} SSE.send event=${event} dataLength=${encoded.length}`)
  }
  res.write(`event: ${event}\n`)
  res.write(`data: ${encoded}\n\n`)
}

/**
 * 下发给客户端的 header：3d/command 不附带 strategy（仅服务端调度用）；2d 等仍附带便于联调观察。
 */
function buildClientHeader(dataset, strategy, cursor, totalLen) {
  const route = dataset.header.route
  if (dataset.event === '3d_command') {
    return { route: { ...route } }
  }
  return {
    route: { ...route },
    strategy: {
      ...strategy,
      source: basename(dataset.fileName),
      cursor,
      total: totalLen
    }
  }
}

function startDatasetStream(res, dataset) {
  const { strategy } = dataset.header
  let cursor = 0
  const sendByStrategy = () => {
    const sourcePayload = dataset.payload
    const nextPayload =
      strategy.emitMode === 'all'
        ? sourcePayload
        : sourcePayload.length > 0
          ? [sourcePayload[cursor % sourcePayload.length]]
          : []

    sendSSE(res, dataset.event, {
      header: buildClientHeader(dataset, strategy, cursor, sourcePayload.length),
      payload: nextPayload
    })
    cursor += 1
  }

  const timeoutId = setTimeout(() => {
    sendByStrategy()
  }, strategy.startDelayMs)
  const intervalId = setInterval(sendByStrategy, strategy.intervalMs)
  return () => {
    clearTimeout(timeoutId)
    clearInterval(intervalId)
  }
}

const server = createServer((req, res) => {
  if (req.url === '/api/sse' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    })
    if (process.env.DATA_CHAIN_LOG !== '0') {
      console.log(`${LOG_PREFIX} SSE.client connected`)
    }

    sendSSE(res, 'open', {
      header: {
        route: { domain: 'meta', action: 'connected' },
        strategy: { datasetCount: datasets.length }
      },
      payload: [{ message: 'SSE connected', ts: Date.now() }]
    })

    const conn = { res, stoppers: datasets.map((dataset) => startDatasetStream(res, dataset)) }
    activeSseConnections.add(conn)
    req.on('close', () => {
      if (process.env.DATA_CHAIN_LOG !== '0') {
        console.log(`${LOG_PREFIX} SSE.client closed`)
      }
      activeSseConnections.delete(conn)
      conn.stoppers.forEach((stop) => stop())
    })
    return
  }

  if (req.url === '/api/sse' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        ok: true,
        sse: 'GET /api/sse for SSE stream',
        dataDir: DATA_DIR,
        datasetCount: datasets.length,
        datasets: datasets.map((d) => ({
          file: d.fileName,
          event: d.event,
          intervalMs: d.header.strategy.intervalMs,
          emitMode: d.header.strategy.emitMode,
          payloadSize: d.payload.length
        }))
      })
    )
    return
  }

  res.writeHead(404)
  res.end('Not Found')
})

server.listen(PORT, () => {
  console.log(`[SSE] Test server: http://localhost:${PORT}`)
  console.log(`[SSE] Stream: GET http://localhost:${PORT}/api/sse`)
  console.log(`[SSE] Data directory: ${DATA_DIR}`)
  console.log(`[SSE] Loaded datasets: ${datasets.length}`)
})
