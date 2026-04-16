const express = require('express');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Получение всех чатов пользователя
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.userId
    })
      .populate('participants', '-password')
      .populate('lastMessage')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username avatar' }
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении чатов' });
  }
});

// Создание или получение личного чата
router.post('/private', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    // Проверка существующего чата
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [req.userId, userId] }
    }).populate('participants', '-password');

    if (chat) {
      return res.json(chat);
    }

    // Создание нового чата
    chat = new Chat({
      isGroupChat: false,
      participants: [req.userId, userId]
    });

    await chat.save();
    chat = await Chat.findById(chat._id).populate('participants', '-password');

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании чата' });
  }
});

// Создание группового чата
router.post('/group', auth, async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!participants || participants.length < 2) {
      return res.status(400).json({ error: 'Группа должна содержать минимум 2 участников' });
    }

    const chat = new Chat({
      name,
      isGroupChat: true,
      participants: [...participants, req.userId],
      admin: req.userId
    });

    await chat.save();
    const populatedChat = await Chat.findById(chat._id).populate('participants', '-password');

    res.status(201).json(populatedChat);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании группы' });
  }
});

// Получение информации о чате
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', '-password')
      .populate('admin', '-password');

    if (!chat) {
      return res.status(404).json({ error: 'Чат не найден' });
    }

    // Проверка доступа
    if (!chat.participants.some(p => p._id.toString() === req.userId)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении чата' });
  }
});

module.exports = router;
