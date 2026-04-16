import { useState, useEffect, useRef } from 'react'
import { Send, Smile, Paperclip, Mic, Phone, Video, Image as ImageIcon, File, X, Play } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useSocket } from '../hooks/useSocket'
import api from '../api/axios'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import './ChatWindow.css'

interface Message {
  _id: string
  content: string
  type: 'text' | 'image' | 'file' | 'voice' | 'video'
  fileUrl?: string
  fileName?: string
  duration?: number
  sender: {
    _id: string
    username: string
    displayName?: string
    avatar: string
  }
  createdAt: string
}

interface ChatWindowProps {
  chatId: string | null
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [chat, setChat] = useState<any>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const user = useAuthStore(state => state.user)
  const socket = useSocket()

  useEffect(() => {
    if (chatId) {
      loadChat()
      loadMessages()
      if (socket) {
        socket.emit('join-chat', chatId)
      }
    }
  }, [chatId, socket])

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (message: Message) => {
        console.log('📨 Получено сообщение через WebSocket:');
        console.log('   _id:', message._id);
        console.log('   type:', message.type);
        console.log('   content:', message.content?.substring(0, 50) || '(пусто)');
        console.log('   fileUrl length:', message.fileUrl?.length || 0);
        console.log('   sender:', message.sender._id);
        console.log('   Полное сообщение:', message);
        
        // Добавляем сообщение только если оно от другого пользователя
        if (message && message.sender._id !== user?.id) {
          setMessages(prev => {
            // Проверяем, нет ли уже такого сообщения
            const exists = prev.some(m => m._id === message._id);
            if (!exists) {
              console.log('✅ Добавляем новое сообщение в чат');
              return [...prev, message];
            }
            console.log('⚠️ Сообщение уже есть в чате, пропускаем');
            return prev;
          });
        } else {
          console.log('⚠️ Сообщение от себя, пропускаем');
        }
      };

      socket.on('receive-message', handleReceiveMessage);

      return () => {
        socket.off('receive-message', handleReceiveMessage);
      };
    }
  }, [socket, user?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChat = async () => {
    try {
      const { data } = await api.get(`/chats/${chatId}`)
      setChat(data)
    } catch (error) {
      console.error('Ошибка загрузки чата:', error)
    }
  }

  const loadMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${chatId}`)
      setMessages(data)
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error)
    }
  }

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Максимальный размер 1920x1920
          const maxSize = 1920
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize
              width = maxSize
            } else {
              width = (width / height) * maxSize
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Конвертируем в JPEG с качеством 0.8
          const base64 = canvas.toDataURL('image/jpeg', 0.8)
          console.log('✅ Изображение сжато:', 
            `${img.width}x${img.height} → ${width}x${height}`,
            `размер: ${base64.length} символов`)
          resolve(base64)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if ((!newMessage.trim() && !selectedFile) || !chatId) {
      console.log('❌ Не могу отправить: нет текста/файла или chatId')
      return
    }

    const messageText = newMessage
    setNewMessage('')

    try {
      console.log('📤 Начинаем отправку сообщения')
      console.log('   chatId:', chatId)
      console.log('   текст:', messageText)
      console.log('   файл:', selectedFile?.name)
      
      let messageData: any = {
        chatId,
        content: messageText || '',
        type: 'text'
      }

      // Если есть файл, конвертируем в base64
      if (selectedFile) {
        console.log('📎 Обрабатываем файл...')
        console.log('   Размер оригинала:', selectedFile.size, 'bytes')
        
        let base64: string
        
        // Для изображений используем сжатие
        if (selectedFile.type.startsWith('image/')) {
          console.log('🖼️ Сжимаем изображение...')
          base64 = await compressImage(selectedFile)
          messageData.type = 'image'
          console.log('✅ Изображение сжато')
        } else {
          // Для других файлов просто конвертируем
          console.log('📄 Конвертируем файл в base64...')
          const reader = new FileReader()
          base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              console.log('✅ Файл сконвертирован в base64')
              resolve(reader.result as string)
            }
            reader.onerror = () => {
              console.error('❌ Ошибка чтения файла')
              reject(reader.error)
            }
            reader.readAsDataURL(selectedFile)
          })
          
          if (selectedFile.type.startsWith('video/')) {
            messageData.type = 'video'
            console.log('🎬 Тип: видео')
          } else {
            messageData.type = 'file'
            console.log('📄 Тип: файл')
          }
        }
        
        messageData.fileUrl = base64
        messageData.fileName = selectedFile.name
        console.log('📊 Размер base64:', base64.length, 'символов')
        
        setSelectedFile(null)
        setPreviewUrl(null)
      }

      console.log('🌐 Отправляем на сервер...')
      const { data } = await api.post('/messages', messageData)
      console.log('✅ Сообщение создано на сервере:', data._id)

      // Добавляем сообщение в локальный чат сразу
      setMessages(prev => [...prev, data])

      // Отправляем через WebSocket другим пользователям
      if (socket) {
        console.log('🔄 Отправляем через WebSocket')
        socket.emit('send-message', {
          ...data,
          chatId
        })
      }
    } catch (error: any) {
      console.error('❌ Ошибка отправки сообщения:', error)
      console.error('   Детали:', error.response?.data || error.message)
      alert('Ошибка отправки: ' + (error.response?.data?.error || error.message))
      setNewMessage(messageText)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 handleFileSelect вызван')
    const file = e.target.files?.[0]
    console.log('   Файл:', file?.name, file?.type, file?.size, 'bytes')
    
    if (file) {
      // Проверяем размер файла (макс 10MB для видео и файлов)
      const maxSize = file.type.startsWith('image/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024)
        alert(`Файл слишком большой! Максимальный размер: ${maxSizeMB}MB`)
        console.log('❌ Файл слишком большой:', file.size, 'bytes, макс:', maxSize)
        return
      }
      
      setSelectedFile(file)
      console.log('✅ Файл выбран:', file.name)
      
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        console.log('🖼️ Создан URL для превью')
      }
      setShowAttachMenu(false)
    } else {
      console.log('❌ Файл не выбран')
    }
  }

  const startVoiceRecording = async () => {
    if (!chatId) {
      alert('Ошибка: чат не выбран')
      return
    }

    console.log('🎤 Начинаем запись голосового сообщения')
    console.log('   chatId:', chatId)

    try {
      console.log('🎤 Запрашиваем доступ к микрофону...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('✅ Доступ к микрофону получен')

      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        console.log('📊 Получены аудио данные:', event.data.size, 'bytes')
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        console.log('⏹️ Запись остановлена')
        console.log('📦 Всего чанков:', audioChunks.length)
        
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        console.log('📦 Размер аудио:', audioBlob.size, 'bytes')
        
        if (audioBlob.size === 0) {
          console.error('❌ Аудио пустое!')
          alert('Ошибка: не удалось записать аудио')
          stream.getTracks().forEach(track => track.stop())
          return
        }

        // Конвертируем в base64
        console.log('🔄 Конвертируем аудио в base64...')
        const reader = new FileReader()
        
        reader.onload = async () => {
          const base64 = reader.result as string
          console.log('✅ Аудио сконвертировано в base64')
          console.log('   Длина base64:', base64.length)
          
          // Отправляем голосовое сообщение
          const messageData = {
            chatId: chatId!,
            content: '',
            type: 'voice' as const,
            fileUrl: base64,
            fileName: `voice-${Date.now()}.webm`,
            duration: recordingTime
          }

          console.log('🌐 Отправляем голосовое сообщение на сервер...')
          console.log('   Длительность:', recordingTime, 'сек')

          try {
            const { data } = await api.post('/messages', messageData)
            console.log('✅ Голосовое сообщение создано:', data._id)
            
            setMessages(prev => [...prev, data])
            
            if (socket) {
              console.log('🔄 Отправляем через WebSocket')
              socket.emit('send-message', { ...data, chatId })
            }
          } catch (error: any) {
            console.error('❌ Ошибка отправки голосового:', error)
            console.error('   Детали:', error.response?.data || error.message)
            alert('Ошибка отправки голосового: ' + (error.response?.data?.error || error.message))
          }
        }
        
        reader.onerror = () => {
          console.error('❌ Ошибка конвертации аудио в base64')
          alert('Ошибка конвертации аудио')
        }
        
        reader.readAsDataURL(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      console.log('🔴 Запись началась')

      // Таймер записи
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          console.log('⏱️ Время записи:', newTime, 'сек')
          return newTime
        })
      }, 1000)
    } catch (error: any) {
      console.error('❌ Ошибка доступа к микрофону:', error)
      console.error('   Имя ошибки:', error.name)
      console.error('   Сообщение:', error.message)
      
      if (error.name === 'NotAllowedError') {
        alert('Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.')
      } else if (error.name === 'NotFoundError') {
        alert('Микрофон не найден. Подключите микрофон и попробуйте снова.')
      } else {
        alert('Ошибка доступа к микрофону: ' + error.message)
      }
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingTime(0)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      // Останавливаем поток
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const startCall = (type: 'audio' | 'video') => {
    alert(`${type === 'audio' ? 'Аудио' : 'Видео'}звонок будет доступен в следующей версии!`)
    // TODO: Реализовать WebRTC звонки
  }

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'image':
        return (
          <div className="message-image">
            {message.fileUrl && <img src={message.fileUrl} alt="Изображение" />}
            {message.content && <div className="message-text">{message.content}</div>}
          </div>
        )
      case 'video':
        return (
          <div className="message-video">
            {message.fileUrl && (
              <video controls>
                <source src={message.fileUrl} />
              </video>
            )}
            {message.content && <div className="message-text">{message.content}</div>}
          </div>
        )
      case 'voice':
        return (
          <div className="message-voice">
            <button className="voice-play-btn" onClick={() => playVoiceMessage(message.fileUrl)}>
              <Play size={16} />
            </button>
            <div className="voice-waveform">
              <div className="voice-duration">{message.duration || 0}s</div>
            </div>
          </div>
        )
      case 'file':
        return (
          <div className="message-file" onClick={() => downloadFile(message.fileUrl, message.fileName)}>
            <File size={24} />
            <div className="file-info">
              <div className="file-name">{message.fileName || 'Файл'}</div>
              <div className="file-size">Нажмите для скачивания</div>
            </div>
          </div>
        )
      default:
        return <div className="message-text">{message.content}</div>
    }
  }

  const playVoiceMessage = (fileUrl?: string) => {
    if (!fileUrl) return
    const audio = new Audio(fileUrl)
    audio.play()
  }

  const downloadFile = (fileUrl?: string, fileName?: string) => {
    if (!fileUrl) return
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName || 'file'
    link.click()
  }

  const getChatName = () => {
    if (!chat) return ''
    if (chat.isGroupChat) return chat.name
    const otherUser = chat.participants.find((p: any) => p._id !== user?.id)
    return otherUser?.displayName || otherUser?.username || 'Неизвестный'
  }

  if (!chatId) {
    return (
      <div className="chat-window empty">
        <div className="empty-chat">
          <h2>Выберите чат</h2>
          <p>Выберите чат из списка или начните новый</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <h3>{getChatName()}</h3>
          <span className="status">онлайн</span>
        </div>
        <div className="chat-header-actions">
          <button onClick={() => startCall('audio')} className="icon-btn" title="Аудиозвонок">
            <Phone size={20} />
          </button>
          <button onClick={() => startCall('video')} className="icon-btn" title="Видеозвонок">
            <Video size={20} />
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`message ${message.sender._id === user?.id ? 'own' : 'other'}`}
          >
            {message.sender._id !== user?.id && (
              <div 
                className="message-avatar"
                style={{ background: message.sender.avatar || 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' }}
              >
                {(message.sender.displayName || message.sender.username)[0].toUpperCase()}
              </div>
            )}
            <div className="message-content">
              {message.sender._id !== user?.id && (
                <div className="message-sender">{message.sender.displayName || message.sender.username}</div>
              )}
              {renderMessageContent(message)}
              <div className="message-time">
                {format(new Date(message.createdAt), 'HH:mm', { locale: ru })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {selectedFile && previewUrl && (
        <div className="file-preview">
          <button onClick={() => { setSelectedFile(null); setPreviewUrl(null) }} className="preview-close">
            <X size={20} />
          </button>
          {selectedFile.type.startsWith('image/') ? (
            <img src={previewUrl} alt="Preview" />
          ) : selectedFile.type.startsWith('video/') ? (
            <video src={previewUrl} controls />
          ) : (
            <div className="file-preview-info">
              <File size={48} />
              <span>{selectedFile.name}</span>
            </div>
          )}
        </div>
      )}

      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-dot"></div>
          <span>Запись... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
          <button onClick={cancelRecording} className="btn-secondary">Отмена</button>
          <button onClick={stopVoiceRecording} className="btn-primary">Отправить</button>
        </div>
      )}

      <form className="message-input-container" onSubmit={(e) => sendMessage(e)}>
        <button 
          type="button" 
          className="icon-btn"
          onClick={() => setShowAttachMenu(!showAttachMenu)}
        >
          <Paperclip size={22} />
        </button>

        {showAttachMenu && (
          <div className="attach-menu">
            <button 
              type="button" 
              onClick={() => {
                console.log('📷 Клик на "Фото"')
                imageInputRef.current?.click()
              }}
              className="attach-menu-item"
            >
              <ImageIcon size={20} />
              <span>Фото</span>
            </button>
            <button 
              type="button" 
              onClick={() => {
                console.log('📎 Клик на "Файл"')
                fileInputRef.current?.click()
              }}
              className="attach-menu-item"
            >
              <File size={20} />
              <span>Файл</span>
            </button>
          </div>
        )}

        <input
          type="file"
          ref={imageInputRef}
          onChange={handleFileSelect}
          accept="image/*,video/*"
          style={{ display: 'none' }}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <button type="button" className="icon-btn">
          <Smile size={22} />
        </button>
        
        <input
          type="text"
          placeholder="Введите сообщение..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isRecording}
        />

        {newMessage.trim() || selectedFile ? (
          <button type="submit" className="send-btn">
            <Send size={20} />
          </button>
        ) : (
          <button 
            type="button" 
            className="send-btn voice-btn"
            onClick={() => {
              console.log('🎤 Клик на кнопку микрофона, isRecording:', isRecording)
              if (isRecording) {
                stopVoiceRecording()
              } else {
                startVoiceRecording()
              }
            }}
          >
            <Mic size={20} />
          </button>
        )}
      </form>
    </div>
  )
}
