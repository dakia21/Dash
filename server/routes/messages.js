const express = require('express');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

const router = express.Router();

// Получение сообщений чата
router.get('/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, before } = req.query;

    // Проверка доступа к чату
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const query = { chat: chatId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении сообщений' });
  }
});

// Отправка сообщения
router.post('/', auth, async (req, res) => {
  try {
    const { chatId, content, type = 'text' } = req.body;

    // Проверка доступа к чату
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const message = new Message({
      chat: chatId,
      sender: req.userId,
      content,
      type
    });

    await message.save();

    // Обновление последнего сообщения в чате
    chat.lastMessage = message._id;
    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
});

// Пометка сообщений как прочитанных
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }

    if (!message.readBy.includes(req.userId)) {
      message.readBy.push(req.userId);
      await message.save();
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении статуса' });
  }
});

module.exports = router;
