import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// URL сервера
const API_URL = import.meta.env.VITE_API_URL || 'https://dash-qzzz.onrender.com/api'

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
