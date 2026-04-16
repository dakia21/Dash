import { useState } from 'react'
import { X, Palette, Type, Moon, Sun, Volume2, Bell, Shield } from 'lucide-react'
import { useThemeStore, Theme, ChatColor } from '../store/themeStore'
import './Settings.css'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

const chatColors: { value: ChatColor; name: string; color: string; darkColor: string }[] = [
  { value: 'blue', name: 'Синий', color: '#007AFF', darkColor: '#0A84FF' },
  { value: 'purple', name: 'Фиолетовый', color: '#5856D6', darkColor: '#BF5AF2' },
  { value: 'green', name: 'Зеленый', color: '#34C759', darkColor: '#32D74B' },
  { value: 'pink', name: 'Розовый', color: '#FF2D92', darkColor: '#FF375F' },
  { value: 'orange', name: 'Оранжевый', color: '#FF9500', darkColor: '#FF9F0A' }
]

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const { theme, chatColor, fontSize, setTheme, setChatColor, setFontSize } = useThemeStore()
  const [notifications, setNotifications] = useState(true)
  const [sounds, setSounds] = useState(true)

  if (!isOpen) return null

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Настройки</h2>
          <button onClick={onClose} className="btn-ghost">
            <X size={24} />
          </button>
        </div>

        <div className="settings-content">
          {/* Внешний вид */}
          <div className="settings-section">
            <h3>
              <Palette size={20} />
              Внешний вид
            </h3>
            
            {/* Тема */}
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Тема</span>
                <span className="setting-description">Светлая или темная тема</span>
              </div>
              <div className="theme-toggle">
                <button
                  className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun size={16} />
                  Светлая
                </button>
                <button
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={16} />
                  Темная
                </button>
              </div>
            </div>

            {/* Цвет чата */}
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Цвет чата</span>
                <span className="setting-description">Основной цвет интерфейса</span>
              </div>
              <div className="color-picker">
                {chatColors.map((color) => (
                  <button
                    key={color.value}
                    className={`color-btn ${chatColor === color.value ? 'active' : ''}`}
                    style={{ backgroundColor: color.color }}
                    onClick={() => setChatColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Размер шрифта */}
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Размер шрифта</span>
                <span className="setting-description">Размер текста в приложении</span>
              </div>
              <div className="font-size-controls">
                <button
                  className="btn-ghost"
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                  disabled={fontSize <= 12}
                >
                  <Type size={14} />
                </button>
                <span className="font-size-value">{fontSize}px</span>
                <button
                  className="btn-ghost"
                  onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                  disabled={fontSize >= 24}
                >
                  <Type size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Уведомления */}
          <div className="settings-section">
            <h3>
              <Bell size={20} />
              Уведомления
            </h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Push-уведомления</span>
                <span className="setting-description">Получать уведомления о новых сообщениях</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Звуки</span>
                <span className="setting-description">Звуковые уведомления</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={sounds}
                  onChange={(e) => setSounds(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* Приватность */}
          <div className="settings-section">
            <h3>
              <Shield size={20} />
              Приватность
            </h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Статус "в сети"</span>
                <span className="setting-description">Показывать другим когда вы онлайн</span>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Время прочтения</span>
                <span className="setting-description">Показывать время прочтения сообщений</span>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* Предварительный просмотр */}
          <div className="settings-section">
            <h3>Предварительный просмотр</h3>
            <div className="preview-container">
              <div className="preview-message own">
                <div className="preview-bubble">
                  Пример сообщения с выбранным цветом
                </div>
              </div>
              <div className="preview-message other">
                <div className="preview-bubble">
                  Ответное сообщение
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}