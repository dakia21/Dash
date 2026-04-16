import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useSocket } from '../hooks/useSocket'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import './Chat.css'

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const user = useAuthStore(state => state.user)
  const socket = useSocket()

  useEffect(() => {
    if (socket && user) {
      socket.emit('user-online', user.id)
    }
  }, [socket, user])

  return (
    <div className="chat-container">
      <Sidebar 
        selectedChat={selectedChat} 
        onSelectChat={setSelectedChat} 
      />
      <ChatWindow chatId={selectedChat} />
    </div>
  )
}
