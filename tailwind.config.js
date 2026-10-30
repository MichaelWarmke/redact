/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        jb: {
          bg: '#1e1f22',
          surface: '#2b2d30',
          surfaceLight: '#313438',
          surfaceHover: '#393b40',
          border: '#393b40',
          borderLight: '#4e5157',
          active: '#3574f0',
          activeBg: '#25324d',
          text: '#bcbec4',
          textMuted: '#707278',
          textDim: '#5a5d63',
          redactBg: '#3d2528',
          redactBorder: '#84383e',
          redactText: '#f87171',
          diffChanged: '#3e3523',
          diffChangedBorder: '#856424',
          diffInserted: '#23382c',
          diffInsertedBorder: '#356e4e',
          gutter: '#1e1f22',
          gutterText: '#4b5059',
          gutterActiveText: '#a1a3ab',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
