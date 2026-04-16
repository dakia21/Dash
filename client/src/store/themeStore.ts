import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'
export type ChatColor = 'blue' | 'purple' | 'green' | 'pink' | 'orange'

interface ThemeState {
  theme: Theme
  chatColor: ChatColor
  fontSize: number
  setTheme: (theme: Theme) => void
  setChatColor: (color: ChatColor) => void
  setFontSize: (size: number) => void
  applyTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      chatColor: 'blue',
      fontSize: 16,
      
      setTheme: (theme) => {
        set({ theme })
        get().applyTheme()
      },
      
      setChatColor: (chatColor) => {
        set({ chatColor })
        get().applyTheme()
      },
      
      setFontSize: (fontSize) => {
        set({ fontSize })
        get().applyTheme()
      },
      
      applyTheme: () => {
        const { theme, chatColor, fontSize } = get()
        const root = document.documentElement
        
        // Применяем тему
        root.setAttribute('data-theme', theme)
        root.setAttribute('data-chat-color', chatColor)
        root.style.fontSize = `${fontSize}px`
        
        // Применяем цвета в зависимости от темы
        const colorMap = {
          blue: { light: '#007AFF', dark: '#0A84FF' },
          purple: { light: '#5856D6', dark: '#BF5AF2' },
          green: { light: '#34C759', dark: '#32D74B' },
          pink: { light: '#FF2D92', dark: '#FF375F' },
          orange: { light: '#FF9500', dark: '#FF9F0A' }
        }
        
        const primaryColor = theme === 'dark' 
          ? colorMap[chatColor].dark 
          : colorMap[chatColor].light
        
        root.style.setProperty('--primary-color', primaryColor)
      }
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Применяем тему после загрузки из localStorage
        if (state) {
          state.applyTheme()
        }
      }
    }
  )
)