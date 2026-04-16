import { useState } from 'react'
import { X, Camera, User, Mail, MessageSquare, Settings, LogOut, AtSign } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import './Profile.css'

interface ProfileProps {
  isOpen: boolean
  onClose: () => void
}

const avatarColors = [
  '#007AFF', '#5856D6', '#34C759', '#FF2D92', '#FF9500',
  '#FF3B30', '#00C7BE', '#5AC8FA', '#AF52DE', '#FF9F0A'
];

export default function Profile({ isOpen, onClose }: ProfileProps) {
  const { user, logout, setAuth } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [username, setUsername] = useState(user?.username || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [selectedColor, setSelectedColor] = useState(user?.avatar || avatarColors[0])
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!displayName.trim() || !username.trim()) return
    
    setLoading(true)
    try {
      const { data } = await api.put('/users/profile', {
        displayName: displayName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        avatar: selectedColor
      })
      
      setAuth(useAuthStore.getState().token!, data)
      setIsEditing(false)
    } catch (error: any) {
      console.error('Ошибка обновления профиля:', error)
      alert(error.response?.data?.error || 'Ошибка при обновлении профиля')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setDisplayName(user?.displayName || '')
    setUsername(user?.username || '')
    setBio(user?.bio || '')
    setSelectedColor(user?.avatar || avatarColors[0])
    setIsEditing(false)
  }

  if (!isOpen) return null

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <h2>Профиль</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="profile-content">
          {/* Аватар */}
          <div className="avatar-section">
            <div 
              className="large-avatar"
              style={{ background: selectedColor }}
            >
              {(displayName || user?.displayName || user?.username)?.[0]?.toUpperCase()}
            </div>
            {isEditing && (
              <div className="avatar-colors">
                <p>Выберите цвет аватара:</p>
                <div className="color-grid">
                  {avatarColors.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Информация о пользователе */}
          <div className="user-info-section">
            {isEditing ? (
              <>
                <div className="form-group">
                  <label>
                    <User size={18} />
                    Отображаемое имя
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Как вас будут видеть другие"
                    minLength={1}
                    maxLength={50}
                  />
                  <span className="help-text">Это имя будут видеть другие пользователи</span>
                </div>

                <div className="form-group">
                  <label>
                    <AtSign size={18} />
                    Имя пользователя (username)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    placeholder="username"
                    minLength={3}
                    maxLength={20}
                  />
                  <span className="help-text">По этому имени вас смогут найти (@{username})</span>
                </div>

                <div className="form-group">
                  <label>
                    <MessageSquare size={18} />
                    О себе
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Расскажите о себе..."
                    maxLength={200}
                    rows={3}
                  />
                  <span className="char-count">{bio.length}/200</span>
                </div>

                <div className="edit-actions">
                  <button 
                    onClick={handleCancel}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Отмена
                  </button>
                  <button 
                    onClick={handleSave}
                    className="btn-primary"
                    disabled={loading || !displayName.trim() || !username.trim()}
                  >
                    {loading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="info-item">
                  <User size={18} />
                  <div>
                    <label>Отображаемое имя</label>
                    <span>{user?.displayName}</span>
                  </div>
                </div>

                <div className="info-item">
                  <AtSign size={18} />
                  <div>
                    <label>Имя пользователя</label>
                    <span>@{user?.username}</span>
                  </div>
                </div>

                <div className="info-item">
                  <Mail size={18} />
                  <div>
                    <label>Email</label>
                    <span>{user?.email}</span>
                  </div>
                </div>

                <div className="info-item">
                  <MessageSquare size={18} />
                  <div>
                    <label>О себе</label>
                    <span>{user?.bio || 'Не указано'}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditing(true)}
                  className="edit-profile-btn"
                >
                  Редактировать профиль
                </button>
              </>
            )}
          </div>

          {/* Выход */}
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} />
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  )
}