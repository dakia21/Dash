import { useState, useEffect } from 'react'
import { LogOut, Search, Plus, MessageCircle, User, Settings as SettingsIcon } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Profile from './Profile'
import Settings from './Settings'
import api from '../api/axios'
import './Sidebar.css'

interface Chat {
  _id: string
  name?: string
  isGroupChat: boolean
  participants: any[]
  lastMessage?: any
  updatedAt: string
}

interface SidebarProps {
  selectedChat: string | null
  onSelectChat: (chatId: string) => void
}

export default function Sidebar({ selectedChat, onSelectChat }: SidebarProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { user, logout } = useAuthStore()

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      const { data } = await api.get('/chats')
      setChats(data)
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const { data } = await api.get(`/users/search?query=${query}`)
      setSearchResults(data)
    } catch (error) {
      console.error('Ошибка поиска:', error)
    }
  }

  const startChat = async (userId: string) => {
    try {
      const { data } = await api.post('/chats/private', { userId })
      setChats(prev => [data, ...prev.filter(c => c._id !== data._id)])
      onSelectChat(data._id)
      setShowSearch(false)
      setSearchQuery('')
      setSearchResults([])
    } catch (error) {
      console.error('Ошибка создания чата:', error)
    }
  }

  const getChatName = (chat: Chat) => {
    if (chat.isGroupChat) return chat.name
    const otherUser = chat.participants.find(p => p._id !== user?.id)
    return otherUser?.displayName || otherUser?.username || 'Неизвестный'
  }

  const getChatAvatar = (chat: Chat) => {
    if (chat.isGroupChat) return chat.name?.[0] || 'G'
    const otherUser = chat.participants.find(p => p._id !== user?.id)
    return otherUser?.displayName?.[0]?.toUpperCase() || otherUser?.username?.[0]?.toUpperCase() || '?'
  }

  const getChatAvatarColor = (chat: Chat) => {
    if (chat.isGroupChat) return 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)'
    const otherUser = chat.participants.find(p => p._id !== user?.id)
    return otherUser?.avatar || 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)'
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-info" onClick={() => setShowProfile(true)}>
          <div className="avatar" style={{ background: user?.avatar || 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' }}>
            {user?.displayName?.[0]?.toUpperCase() || user?.username[0]?.toUpperCase()}
          </div>
          <div className="user-details">
            <span className="username">{user?.displayName || user?.username}</span>
            <span className="user-status">@{user?.username}</span>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowSettings(true)} className="icon-btn" title="Настройки">
            <SettingsIcon size={20} />
          </button>
          <button onClick={() => setShowProfile(true)} className="icon-btn" title="Профиль">
            <User size={20} />
          </button>
          <button onClick={logout} className="icon-btn" title="Выйти">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setShowSearch(true)}
          />
        </div>

        {showSearch && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(user => (
              <div
                key={user._id}
                className="search-result-item"
                onClick={() => startChat(user._id)}
              >
                <div className="avatar" style={{ background: user.avatar || 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' }}>
                  {user.displayName?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
                </div>
                <div className="user-info-text">
                  <div className="username">{user.displayName || user.username}</div>
                  <div className="user-handle">@{user.username}</div>
                  {user.bio && <div className="email">{user.bio}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="chats-list">
        {chats.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={48} />
            <p>Нет чатов</p>
            <span>Найдите пользователей через поиск</span>
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat._id}
              className={`chat-item ${selectedChat === chat._id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat._id)}
            >
              <div className="avatar" style={{ background: getChatAvatarColor(chat) }}>
                {getChatAvatar(chat)}
              </div>
              <div className="chat-info">
                <div className="chat-name">{getChatName(chat)}</div>
                <div className="last-message">
                  {chat.lastMessage?.content || 'Нет сообщений'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Profile isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
