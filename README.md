# 💬 Web Messenger - Современный мессенджер

![Status](https://img.shields.io/badge/status-ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

Полнофункциональный веб-мессенджер с поддержкой текстовых сообщений, изображений, видео, голосовых сообщений и файлов. Работает в реальном времени через WebSocket.

## ✨ Возможности

- 💬 **Мгновенные сообщения** - отправка и получение в реальном времени
- 🖼️ **Медиа файлы** - фото, видео, документы
- 🎤 **Голосовые сообщения** - запись и отправка аудио
- 👥 **Поиск пользователей** - найдите друзей по имени
- 🎨 **Темная/светлая тема** - переключение темы оформления
- 👤 **Профили** - настройка аватара, имени и статуса
- 📱 **Адаптивный дизайн** - работает на всех устройствах
- 🔒 **Безопасность** - JWT аутентификация, bcrypt шифрование

## 🚀 Быстрый старт

### Локальный запуск

1. **Клонируйте репозиторий**
   ```bash
   git clone https://github.com/ваш-username/messenger-app.git
   cd messenger-app
   ```

2. **Установите зависимости**
   ```bash
   npm run install-all
   ```

3. **Запустите сервер**
   ```bash
   cd server
   npm start
   ```

4. **Запустите клиент** (в новом терминале)
   ```bash
   cd client
   npm run dev
   ```

5. **Откройте в браузере**
   ```
   http://localhost:5173
   ```

### Деплой в продакшн

📖 **Подробная инструкция:** [ДЕПЛОЙ.md](ДЕПЛОЙ.md) или [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**Кратко:**
1. Загрузите код на GitHub
2. Настройте GitHub Pages для клиента
3. Задеплойте сервер на Render.com
4. Обновите URL в конфигурации

## 🛠️ Технологии

### Frontend
- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик
- **Socket.io Client** - WebSocket
- **Zustand** - управление состоянием
- **Axios** - HTTP клиент
- **Lucide React** - иконки

### Backend
- **Node.js** - runtime
- **Express** - веб-фреймворк
- **Socket.io** - WebSocket сервер
- **JWT** - аутентификация
- **bcrypt** - хеширование паролей

## 📁 Структура проекта

```
messenger-app/
├── client/                 # Frontend приложение
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы
│   │   ├── store/         # Zustand stores
│   │   ├── hooks/         # Custom hooks
│   │   └── api/           # API конфигурация
│   └── package.json
├── server/                # Backend приложение
│   ├── models/           # Модели данных
│   ├── middleware/       # Middleware
│   ├── routes/           # API routes
│   ├── server-simple.js  # Сервер (in-memory)
│   └── package.json
├── .github/
│   └── workflows/        # GitHub Actions
├── ДЕПЛОЙ.md            # Инструкция по деплою (RU)
├── DEPLOYMENT_GUIDE.md  # Deployment guide (EN)
└── README.md
```

## 🎯 Основные функции

### Аутентификация
- Регистрация с email и паролем
- Вход в систему
- JWT токены
- Защищенные маршруты

### Чаты
- Приватные чаты 1-на-1
- Поиск пользователей
- История сообщений
- Онлайн статусы

### Сообщения
- Текстовые сообщения
- Изображения (с автосжатием)
- Видео файлы
- Голосовые сообщения
- Документы и файлы
- Временные метки

### Профиль
- Редактирование имени
- Загрузка аватара
- Статус и био
- Настройки темы

## 🔧 Конфигурация

### Переменные окружения

**Client** (`client/.env.production`):
```env
VITE_API_URL=https://your-backend.com/api
VITE_SOCKET_URL=https://your-backend.com
```

**Server** (на Render.com):
```env
NODE_ENV=production
JWT_SECRET=your_secret_key
PORT=5001
```

## 📊 API Endpoints

### Auth
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

### Users
- `GET /api/users/search?query=` - Поиск пользователей
- `PUT /api/users/profile` - Обновление профиля

### Chats
- `GET /api/chats` - Список чатов
- `POST /api/chats/private` - Создать приватный чат
- `GET /api/chats/:id` - Получить чат

### Messages
- `GET /api/messages/:chatId` - История сообщений
- `POST /api/messages` - Отправить сообщение

### WebSocket Events
- `user-online` - Пользователь онлайн
- `join-chat` - Присоединиться к чату
- `send-message` - Отправить сообщение
- `receive-message` - Получить сообщение
- `user-status` - Статус пользователя

## 🌐 Деплой

### Рекомендуемые платформы

**Frontend:**
- ✅ GitHub Pages (бесплатно)
- Vercel (бесплатно)
- Netlify (бесплатно)

**Backend:**
- ✅ Render.com (750 часов/месяц бесплатно)
- Railway.app ($5 кредитов/месяц)
- Fly.io (бесплатный план)

## 🐛 Известные ограничения

### Бесплатный план Render.com
- Сервер "засыпает" после 15 минут неактивности
- Первый запрос после сна занимает ~30 секунд
- Решение: платный план ($7/месяц) или использовать Railway

### In-Memory хранилище
- Данные теряются при перезапуске сервера
- Решение: подключить MongoDB Atlas (бесплатно)

## 🔜 Планы развития

- [ ] Групповые чаты
- [ ] Видео/аудио звонки (WebRTC)
- [ ] Эмодзи и стикеры
- [ ] Редактирование сообщений
- [ ] Удаление сообщений
- [ ] Прочитанные/непрочитанные
- [ ] Уведомления
- [ ] MongoDB интеграция
- [ ] Загрузка файлов на S3/Cloudinary
- [ ] PWA поддержка

## 📝 Лицензия

MIT License - используйте свободно для личных и коммерческих проектов.

## 🤝 Вклад

Pull requests приветствуются! Для больших изменений сначала откройте issue.

## 📧 Контакты

Если у вас есть вопросы или предложения, создайте issue в репозитории.

---

**Сделано с ❤️ и React**
