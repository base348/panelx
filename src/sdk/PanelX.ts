import type { ThemeConfig } from '../types/theme'
import { request } from '../api/request'

class PanelX {
  private static instance: PanelX
  private theme: ThemeConfig
  private baseURL: string

  private constructor() {
    this.theme = {
      colors: {
        primary: '#1890ff',
        secondary: '#6c757d',
        success: '#52c41a',
        warning: '#faad14',
        error: '#f5222d',
        info: '#13c2c2',
        background: '#f5f5f5',
        text: '#333333',
        border: '#e8e8e8'
      },
      fontSize: {
        small: '0.875rem',
        medium: '1rem',
        large: '1.125rem'
      },
      spacing: {
        small: '0.5rem',
        medium: '1rem',
        large: '1.5rem'
      },
      borderRadius: {
        small: '0.25rem',
        medium: '0.5rem',
        large: '0.75rem'
      }
    }
    this.baseURL = ''
  }

  public static getInstance(): PanelX {
    if (!PanelX.instance) {
      PanelX.instance = new PanelX()
    }
    return PanelX.instance
  }

  public init(options: {
    baseURL?: string
    theme?: Partial<ThemeConfig>
  } = {}) {
    if (options.baseURL) {
      this.baseURL = options.baseURL
    }
    if (options.theme) {
      this.theme = {
        ...this.theme,
        ...options.theme,
        colors: {
          ...this.theme.colors,
          ...options.theme.colors
        },
        fontSize: {
          ...this.theme.fontSize,
          ...options.theme.fontSize
        },
        spacing: {
          ...this.theme.spacing,
          ...options.theme.spacing
        },
        borderRadius: {
          ...this.theme.borderRadius,
          ...options.theme.borderRadius
        }
      }
    }
    return this
  }

  public getTheme(): ThemeConfig {
    return this.theme
  }

  public setTheme(theme: Partial<ThemeConfig>) {
    this.theme = {
      ...this.theme,
      ...theme,
      colors: {
        ...this.theme.colors,
        ...theme.colors
      },
      fontSize: {
        ...this.theme.fontSize,
        ...theme.fontSize
      },
      spacing: {
        ...this.theme.spacing,
        ...theme.spacing
      },
      borderRadius: {
        ...this.theme.borderRadius,
        ...theme.borderRadius
      }
    }
    return this
  }

  public getBaseURL(): string {
    return this.baseURL
  }

  public setBaseURL(baseURL: string) {
    this.baseURL = baseURL
    return this
  }

  public api() {
    return request
  }
}

export const panelx = PanelX.getInstance()
export default panelx