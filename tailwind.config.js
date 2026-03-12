/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1890ff',
        secondary: '#6c757d',
        success: '#52c41a',
        warning: '#faad14',
        error: '#f5222d',
        info: '#13c2c2',
        background: '#f5f5f5',
        text: '#333333',
        border: '#e8e8e8',
      },
      fontSize: {
        small: '0.875rem',
        medium: '1rem',
        large: '1.125rem',
      },
      spacing: {
        small: '0.5rem',
        medium: '1rem',
        large: '1.5rem',
      },
      borderRadius: {
        small: '0.25rem',
        medium: '0.5rem',
        large: '0.75rem',
      },
    },
  },
  plugins: [],
}