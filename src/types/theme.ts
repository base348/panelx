export type ThemeColorType = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

export interface ThemeColors {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
  background: string
  text: string
  border: string
}

export interface ThemeConfig {
  colors: ThemeColors
  fontSize: {
    small: string
    medium: string
    large: string
  }
  spacing: {
    small: string
    medium: string
    large: string
  }
  borderRadius: {
    small: string
    medium: string
    large: string
  }
}