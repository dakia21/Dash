import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Автоматически определяем URL сервера
const API_URL = import.meta.env.VITE_API_URL || 
                (import.meta.env.DEV 
                  ? 'http://localhost:5001/api' 
                  : 'https://your-backend-url.com/api') // Замените на ваш URL сервера

const api = axios.create({
  baseURL: API_URL
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
