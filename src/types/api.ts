import type { AxiosRequestConfig } from 'axios'

export interface PanelXRequestConfig<T = any> extends AxiosRequestConfig {
  params?: Record<string, any>
  data?: T
}

export interface PanelXResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

export interface PanelXError {
  code: number
  message: string
  details?: any
}