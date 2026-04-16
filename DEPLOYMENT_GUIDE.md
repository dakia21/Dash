# 🚀 Руководство по деплою мессенджера

## 📋 Содержание
1. [Деплой клиента на GitHub Pages](#деплой-клиента-на-github-pages)
2. [Деплой сервера на Render.com](#деплой-сервера-на-rendercom)
3. [Альтернативы для сервера](#альтернативы-для-сервера)
4. [Финальная настройка](#финальная-настройка)

---

## 🌐 Деплой клиента на GitHub Pages

### Шаг 1: Создайте репозиторий на GitHub
1. Перейдите на [GitHub](https://github.com)
2. Нажмите **New repository**
3. Назовите репозиторий (например, `messenger-app`)
4. Сделайте его **Public**
5. Нажмите **Create repository**

### Шаг 2: Загрузите код в GitHub
```bash
# Инициализируйте git (если еще не сделано)
git init

# Добавьте все файлы
git add .

# Создайте коммит
git commit -m "Initial commit"

# Добавьте удаленный репозиторий (замените YOUR_USERNAME и YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Отправьте код
git branch -M main
git push -u origin main
```

### Шаг 3: Настройте GitHub Pages
1. Перейдите в **Settings** вашего репозитория
2. Выберите **Pages** в левом меню
3. В разделе **Source** выберите **GitHub Actions**
4. Готово! GitHub автоматически задеплоит ваш сайт

### Шаг 4: Получите URL
После деплоя ваш сайт будет доступен по адресу:
```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

---

## 🖥️ Деплой сервера на Render.com

### Вариант 1: Через GitHub (Рекомендуется)

1. **Зарегистрируйтесь на [Render.com](https://render.com)**
   - Можно войти через GitHub

2. **Создайте новый Web Service**
   - Нажмите **New +** → **Web Service**
   - Подключите ваш GitHub репозиторий
   - Выберите ваш репозиторий

3. **Настройте сервис**
   ```
   Name: messenger-backend
   Region: Frankfurt (EU Central) или ближайший к вам
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: node server-simple.js
   Instance Type: Free
   ```

4. **Добавьте переменные окружения**
   - Нажмите **Advanced** → **Add Environment Variable**
   ```
   NODE_ENV = production
   JWT_SECRET = your_super_secret_key_here_change_this
   PORT = 5001
   ```

5. **Нажмите Create Web Service**
   - Render автоматически задеплоит ваш сервер
   - Получите URL (например: `https://messenger-backend-xxxx.onrender.com`)

### Вариант 2: Через Git URL

Если не хотите подключать GitHub:
1. Нажмите **New +** → **Web Service**
2. Выберите **Public Git repository**
3. Вставьте URL вашего репозитория
4. Следуйте шагам выше

---

## 🔄 Альтернативы для сервера

### Railway.app
```bash
# Установите Railway CLI
npm install -g @railway/cli

# Войдите
railway login

# Инициализируйте проект
cd server
railway init

# Задеплойте
railway up
```

### Vercel (для serverless)
```bash
# Установите Vercel CLI
npm install -g vercel

# Войдите
vercel login

# Задеплойте сервер
cd server
vercel --prod
```

**Примечание:** Vercel может иметь ограничения с WebSocket. Render.com лучше подходит для этого проекта.

### Heroku
```bash
# Установите Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Войдите
heroku login

# Создайте приложение
heroku create messenger-backend

# Задеплойте
git subtree push --prefix server heroku main
```

---

## ⚙️ Финальная настройка

### 1. Обновите URL сервера в клиенте

После деплоя сервера, обновите файл `client/.env.production`:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

### 2. Обновите CORS на сервере

Откройте `server/server-simple.js` и обновите CORS:

```javascript
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://YOUR_USERNAME.github.io"
    ],
    methods: ["GET", "POST"]
  }
});
```

### 3. Пересоберите и задеплойте клиент

```bash
# Закоммитьте изменения
git add .
git commit -m "Update production URLs"
git push

# GitHub Actions автоматически пересоберет сайт
```

### 4. Проверьте работу

1. Откройте ваш сайт: `https://YOUR_USERNAME.github.io/YOUR_REPO/`
2. Зарегистрируйтесь
3. Попробуйте отправить сообщение
4. Откройте в другой вкладке и проверьте получение сообщений

---

## 🐛 Решение проблем

### Клиент не подключается к серверу
- Проверьте URL в `.env.production`
- Убедитесь, что сервер запущен (откройте URL сервера в браузере)
- Проверьте CORS настройки на сервере

### Сервер не запускается на Render
- Проверьте логи в Render Dashboard
- Убедитесь, что `Start Command` правильный: `node server-simple.js`
- Проверьте, что `Root Directory` установлен в `server`

### GitHub Pages показывает 404
- Убедитесь, что GitHub Actions успешно выполнился (вкладка Actions)
- Проверьте настройки Pages (Settings → Pages)
- Подождите 2-3 минуты после деплоя

### WebSocket не работает
- Render.com поддерживает WebSocket на всех планах
- Vercel имеет ограничения - используйте Render или Railway
- Проверьте, что используете `https://` (не `http://`) для production

---

## 📊 Мониторинг

### Render.com
- Dashboard показывает логи в реальном времени
- Автоматический перезапуск при падении
- Метрики использования CPU и памяти

### GitHub Pages
- Вкладка **Actions** показывает статус деплоя
- Автоматический деплой при каждом push в main

---

## 💰 Стоимость

### Бесплатные планы:
- **GitHub Pages**: Бесплатно для публичных репозиториев
- **Render.com**: 750 часов/месяц бесплатно (достаточно для одного сервиса 24/7)
- **Railway**: $5 бесплатно каждый месяц
- **Vercel**: Бесплатно для hobby проектов

### Ограничения бесплатных планов:
- Render: Сервер "засыпает" после 15 минут неактивности (первый запрос будет медленным)
- GitHub Pages: 100GB bandwidth/месяц
- Railway: $5 кредитов/месяц

---

## 🎉 Готово!

Ваш мессенджер теперь доступен онлайн!

**Клиент:** `https://YOUR_USERNAME.github.io/YOUR_REPO/`  
**Сервер:** `https://your-backend.onrender.com`

Поделитесь ссылкой с друзьями и начните общаться! 🚀

---

## 📝 Дополнительные улучшения

После деплоя вы можете:
1. Добавить свой домен (GitHub Pages и Render поддерживают custom domains)
2. Настроить MongoDB Atlas для постоянного хранения данных
3. Добавить SSL сертификат (автоматически на GitHub Pages и Render)
4. Настроить CDN для быстрой загрузки
5. Добавить Google Analytics для отслеживания посещений

---

## 🆘 Нужна помощь?

- [Документация GitHub Pages](https://docs.github.com/en/pages)
- [Документация Render](https://render.com/docs)
- [Документация Railway](https://docs.railway.app)
- [Документация Vercel](https://vercel.com/docs)
