/**
 * 数据链路日志：用于排查「数据未刷新」等环节
 * 过滤控制台关键字：[DataChain]
 * 开关由 logManager.isDebugEnabled() 控制
 */

import { isDebugEnabled } from '../../utils/logManager'

const DEFAULT_DETAIL_MAX = 16000

/**
 * 将任意数据格式化为可打印字符串（过长则截断），供 [DataChain] 详细日志使用。
 */
export function formatDataChainDetail(value: unknown, maxLen: number = DEFAULT_DETAIL_MAX): string {
  try {
    if (typeof value === 'string') {
      return value.length <= maxLen ? value : `${value.slice(0, maxLen)}… [truncated ${value.length - maxLen} chars]`
    }
    const s = JSON.stringify(value, null, 0)
    if (s.length <= maxLen) return s
    return `${s.slice(0, maxLen)}… [truncated ${s.length - maxLen} chars]`
  } catch {
    return String(value)
  }
}

export function dataChainLog(
  step: string,
  detail: Record<string, unknown> & { message?: string }
): void {
  if (!isDebugEnabled()) return
  const msg = detail.message ?? ''
  const rest = { ...detail }
  delete rest.message
  console.log(
    `[DataChain] ${step}`,
    msg ? `${msg} ` : '',
    Object.keys(rest).length ? rest : ''
  )
}
