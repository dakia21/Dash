const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://daaash.netlify.app",
      "https://dash-qzzz.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// In-memory хранилище (временное решение)
const users = new Map();
const chats = new Map();
const messages = new Map();

const JWT_SECRET = 'super_secret_jwt_key';

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://daaash.netlify.app"
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Увеличиваем лимит для base64 файлов
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Требуется аутентификация' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.user = users.get(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Неверный токен' });
  }
};

// Функция генерации уникального username
const generateUniqueUsername = (baseUsername) => {
  let username = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
  let counter = 1;
  let finalUsername = username;
  
  while (Array.from(users.values()).some(u => u.username === finalUsername)) {
    finalUsername = `${username}${counter}`;
    counter++;
  }
  
  return finalUsername;
};

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('🔥 РЕГИСТРАЦИЯ. Данные:', { username, email });

    // Проверка существования email
    for (let user of users.values()) {
      if (user.email === email) {
        console.log('❌ Email уже существует:', email);
        return res.status(400).json({ error: 'Email уже используется' });
      }
    }

    const userId = Date.now().toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const uniqueUsername = generateUniqueUsername(username);
    
    const user = {
      id: userId,
      username: uniqueUsername,
      displayName: username, // Отображаемое имя
      email,
      password: hashedPassword,
      avatar: '',
      bio: '',
      status: 'online',
      createdAt: new Date()
    };

    users.set(userId, user);
    console.log('✅ ПОЛЬЗОВАТЕЛЬ СОЗДАН:', { id: userId, username: uniqueUsername, displayName: username });
    console.log('📊 Всего пользователей теперь:', users.size);

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = null;
    for (let u of users.values()) {
      if (u.email === email) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при входе' });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.displayName,
      email: req.user.email,
      avatar: req.user.avatar,
      bio: req.user.bio,
      status: req.user.status
    }
  });
});

// USER ROUTES
app.get('/api/users/search', auth, (req, res) => {
  try {
    const { query } = req.query;
    console.log('🔍 Поиск пользователей. Запрос:', query);
    console.log('📊 Всего пользователей в системе:', users.size);
    
    if (!query || query.length < 1) {
      console.log('❌ Пустой запрос');
      return res.json([]);
    }
    
    const results = [];
    const searchQuery = query.toLowerCase().trim();
    console.log('🎯 Ищем по запросу:', searchQuery);

    for (let user of users.values()) {
      if (user.id !== req.userId) {
        const matchesUsername = user.username && user.username.toLowerCase().includes(searchQuery);
        const matchesDisplayName = user.displayName && user.displayName.toLowerCase().includes(searchQuery);
        const matchesEmail = user.email && user.email.toLowerCase().includes(searchQuery);
        
        console.log(`👤 Проверяем пользователя: ${user.displayName} (@${user.username})`);
        console.log(`   - Username match: ${matchesUsername}`);
        console.log(`   - DisplayName match: ${matchesDisplayName}`);
        console.log(`   - Email match: ${matchesEmail}`);
        
        if (matchesUsername || matchesDisplayName || matchesEmail) {
          results.push({
            _id: user.id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio
          });
          console.log(`✅ Найден: ${user.displayName} (@${user.username})`);
        }
      }
    }

    console.log(`📋 Найдено пользователей: ${results.length}`);
    res.json(results.slice(0, 20));
  } catch (error) {
    console.error('❌ Ошибка поиска:', error);
    res.status(500).json({ error: 'Ошибка при поиске' });
  }
});

app.put('/api/users/profile', auth, (req, res) => {
  try {
    const { displayName, username, bio, avatar } = req.body;
    const user = users.get(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    console.log('🔄 Обновление профиля:', { displayName, username, bio, avatar });

    // Проверка уникальности username если он изменился
    if (username && username !== user.username) {
      for (let u of users.values()) {
        if (u.id !== req.userId && u.username === username) {
          console.log('❌ Username уже занят:', username);
          return res.status(400).json({ error: 'Это имя пользователя уже занято' });
        }
      }
      user.username = username;
      console.log('✅ Username обновлен:', username);
    }

    if (displayName !== undefined) {
      user.displayName = displayName;
      console.log('✅ DisplayName обновлен:', displayName);
    }
    if (bio !== undefined) {
      user.bio = bio;
      console.log('✅ Bio обновлен');
    }
    if (avatar !== undefined) {
      user.avatar = avatar;
      console.log('✅ Avatar обновлен:', avatar);
    }

    users.set(req.userId, user);
    console.log('✅ Профиль сохранен в системе');

    res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio
    });
  } catch (error) {
    console.error('❌ Ошибка обновления профиля:', error);
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
});

// CHAT ROUTES
app.get('/api/chats', auth, (req, res) => {
  try {
    const userChats = [];
    
    for (let chat of chats.values()) {
      if (chat.participants.includes(req.userId)) {
        const populatedChat = {
          ...chat,
          participants: chat.participants.map(id => {
            const u = users.get(id);
            return { _id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar };
          })
        };
        userChats.push(populatedChat);
      }
    }

    res.json(userChats);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении чатов' });
  }
});

app.post('/api/chats/private', auth, (req, res) => {
  try {
    const { userId } = req.body;

    // Поиск существующего чата
    for (let chat of chats.values()) {
      if (!chat.isGroupChat && 
          chat.participants.includes(req.userId) && 
          chat.participants.includes(userId)) {
        const populatedChat = {
          ...chat,
          participants: chat.participants.map(id => {
            const u = users.get(id);
            return { _id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar };
          })
        };
        return res.json(populatedChat);
      }
    }

    // Создание нового чата
    const chatId = Date.now().toString();
    const chat = {
      _id: chatId,
      isGroupChat: false,
      participants: [req.userId, userId],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    chats.set(chatId, chat);

    const populatedChat = {
      ...chat,
      participants: chat.participants.map(id => {
        const u = users.get(id);
        return { _id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar };
      })
    };

    res.status(201).json(populatedChat);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании чата' });
  }
});

app.get('/api/chats/:chatId', auth, (req, res) => {
  try {
    const chat = chats.get(req.params.chatId);
    
    if (!chat || !chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const populatedChat = {
      ...chat,
      participants: chat.participants.map(id => {
        const u = users.get(id);
        return { _id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar };
      })
    };

    res.json(populatedChat);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении чата' });
  }
});

// MESSAGE ROUTES
app.get('/api/messages/:chatId', auth, (req, res) => {
  try {
    const chat = chats.get(req.params.chatId);
    
    if (!chat || !chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const chatMessages = [];
    for (let msg of messages.values()) {
      if (msg.chat === req.params.chatId) {
        const sender = users.get(msg.sender);
        chatMessages.push({
          ...msg,
          sender: {
            _id: sender.id,
            username: sender.username,
            displayName: sender.displayName,
            avatar: sender.avatar
          }
        });
      }
    }

    chatMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json(chatMessages);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении сообщений' });
  }
});

app.post('/api/messages', auth, (req, res) => {
  try {
    const { chatId, content, type = 'text', fileUrl, fileName, duration } = req.body;

    console.log('📨 Получен запрос на создание сообщения:');
    console.log('   chatId:', chatId);
    console.log('   type:', type);
    console.log('   content:', content?.substring(0, 50) || '(пусто)');
    console.log('   fileName:', fileName);
    console.log('   fileUrl length:', fileUrl?.length || 0);
    console.log('   duration:', duration);

    const chat = chats.get(chatId);
    if (!chat || !chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const messageId = Date.now().toString();
    const message = {
      _id: messageId,
      chat: chatId,
      sender: req.userId,
      content,
      type, // 'text', 'image', 'file', 'voice', 'video'
      fileUrl,
      fileName,
      duration, // для голосовых сообщений
      createdAt: new Date()
    };

    console.log('💾 Сохраняем сообщение с типом:', message.type);

    messages.set(messageId, message);

    // Обновляем lastMessage в чате
    chat.lastMessage = {
      content: type === 'text' ? content : 
               type === 'image' ? (content || '📷 Фото') :
               type === 'file' ? (content || `📎 ${fileName}`) :
               type === 'voice' ? '🎤 Голосовое сообщение' :
               type === 'video' ? (content || '📹 Видео') : content,
      createdAt: new Date()
    };
    chat.updatedAt = new Date();
    chats.set(chatId, chat);

    const sender = users.get(req.userId);
    const populatedMessage = {
      ...message,
      sender: {
        _id: sender.id,
        username: sender.username,
        displayName: sender.displayName,
        avatar: sender.avatar
      }
    };

    console.log('✅ Отправляем ответ с типом:', populatedMessage.type);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('❌ Ошибка при отправке сообщения:', error);
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
});

// Socket.IO
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('👤 Пользователь подключился:', socket.id);

  socket.on('user-online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('user-status', { userId, status: 'online' });
  });

  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('send-message', (data) => {
    console.log('🔄 WebSocket: получено сообщение для отправки');
    console.log('   type:', data.type);
    console.log('   _id:', data._id);
    console.log('   chatId:', data.chatId);
    console.log('   sender:', data.sender._id);
    
    // Отправляем всем в комнате, КРОМЕ отправителя
    socket.to(data.chatId).emit('receive-message', data);
    console.log('✅ WebSocket: сообщение отправлено другим участникам комнаты', data.chatId);
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('user-status', { userId, status: 'offline' });
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`✅ Работает в режиме in-memory (без MongoDB)`);
  console.log(`⚠️  Данные будут потеряны при перезапуске сервера`);
});
