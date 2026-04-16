import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

let socket: Socket | null = null

// Автоматически определяем URL WebSocket сервера
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://dash-qzzz.onrender.com'

export const useSocket = () => {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null)
  const token = useAuthStore(state => state.token)

  useEffect(() => {
    if (token && !socket) {
      socket = io(SOCKET_URL, {
        auth: { token }
      })

      socket.on('connect', () => {
        console.log('✅ Подключено к серверу')
      })

      socket.on('disconnect', () => {
        console.log('❌ Отключено от сервера')
      })

      setSocketInstance(socket)
    }

    return () => {
      if (socket) {
        socket.disconnect()
        socket = null
        setSocketInstance(null)
      }
    }
  }, [token])

  return socketInstance
}
