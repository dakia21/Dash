# 🗄️ Настройка MongoDB для мессенджера

У вас есть 2 варианта для работы с базой данных:

## ✅ Вариант 1: MongoDB Atlas (Облачная БД - РЕКОМЕНДУЕТСЯ)

Это самый простой способ - не требует установки!

### Шаги:

1. **Зарегистрируйтесь на MongoDB Atlas**
   - Перейдите на https://www.mongodb.com/cloud/atlas/register
   - Создайте бесплатный аккаунт

2. **Создайте кластер**
   - Выберите FREE tier (M0)
   - Выберите регион (например, AWS / Frankfurt)
   - Нажмите "Create Cluster"

3. **Настройте доступ**
   - Database Access → Add New Database User
   - Создайте пользователя (запомните username и password!)
   - Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

4. **Получите строку подключения**
   - Нажмите "Connect" на вашем кластере
   - Выберите "Connect your application"
   - Скопируйте строку подключения (выглядит так):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Обновите файл server/.env**
   ```env
   MONGODB_URI=mongodb+srv://ваш_username:ваш_password@cluster0.xxxxx.mongodb.net/messenger?retryWrites=true&w=majority
   ```
   
   ⚠️ Замените `<username>` и `<password>` на ваши данные!

6. **Перезапустите сервер**

---

## 🔧 Вариант 2: Локальная установка MongoDB

### Windows:

1. **Скачайте MongoDB**
   - https://www.mongodb.com/try/download/community
   - Выберите Windows, MSI installer

2. **Установите MongoDB**
   - Запустите установщик
   - Выберите "Complete" installation
   - Установите как Windows Service

3. **Проверьте установку**
   ```bash
   mongod --version
   ```

4. **Запустите MongoDB**
   - Если установлен как сервис, он уже запущен
   - Или запустите вручную: `mongod`

5. **Перезапустите сервер мессенджера**

### Linux/Mac:

```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# Mac (Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Запуск
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
```

---

## 🚀 После настройки

Перезапустите сервер:
```bash
cd server
npm run dev
```

Вы должны увидеть:
```
✅ MongoDB подключена
🚀 Сервер запущен на порту 5000
```

---

## ❓ Проблемы?

### Ошибка подключения к Atlas:
- Проверьте username и password в строке подключения
- Убедитесь что добавили IP адрес в Network Access
- Проверьте что заменили `<password>` на реальный пароль

### Локальный MongoDB не запускается:
- Windows: Проверьте Services → MongoDB Server
- Linux: `sudo systemctl status mongod`
- Mac: `brew services list`

### Все еще не работает?
Напишите мне и я помогу!
