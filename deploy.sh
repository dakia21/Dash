#!/bin/bash

echo "🚀 Подготовка к деплою мессенджера"
echo ""

# Проверка git
if ! command -v git &> /dev/null; then
    echo "❌ Git не установлен. Установите Git: https://git-scm.com/"
    exit 1
fi

echo "📦 Шаг 1: Инициализация Git репозитория"
if [ ! -d .git ]; then
    git init
    echo "✅ Git репозиторий инициализирован"
else
    echo "✅ Git репозиторий уже существует"
fi

echo ""
echo "📝 Шаг 2: Добавление файлов"
git add .
git status

echo ""
echo "💾 Шаг 3: Создание коммита"
git commit -m "Prepare for deployment" || echo "⚠️  Нет изменений для коммита"

echo ""
echo "🌐 Шаг 4: Настройка удаленного репозитория"
echo ""
echo "Введите URL вашего GitHub репозитория:"
echo "Формат: https://github.com/USERNAME/REPO.git"
read -p "URL: " repo_url

if [ -z "$repo_url" ]; then
    echo "❌ URL не может быть пустым"
    exit 1
fi

# Проверка существования remote
if git remote | grep -q "origin"; then
    echo "⚠️  Remote 'origin' уже существует. Обновляем..."
    git remote set-url origin "$repo_url"
else
    git remote add origin "$repo_url"
fi

echo "✅ Remote репозиторий настроен"

echo ""
echo "📤 Шаг 5: Отправка кода на GitHub"
git branch -M main
git push -u origin main

echo ""
echo "✅ Код успешно загружен на GitHub!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Перейдите в Settings → Pages вашего репозитория"
echo "2. В Source выберите 'GitHub Actions'"
echo "3. Зарегистрируйтесь на Render.com и задеплойте сервер"
echo "4. Обновите URL в client/.env.production"
echo "5. Сделайте git push для обновления"
echo ""
echo "📖 Подробная инструкция: см. DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Готово!"
