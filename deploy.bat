@echo off
chcp 65001 >nul
echo 🚀 Подготовка к деплою мессенджера
echo.

REM Проверка git
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git не установлен. Установите Git: https://git-scm.com/
    pause
    exit /b 1
)

echo 📦 Шаг 1: Инициализация Git репозитория
if not exist .git (
    git init
    echo ✅ Git репозиторий инициализирован
) else (
    echo ✅ Git репозиторий уже существует
)

echo.
echo 📝 Шаг 2: Добавление файлов
git add .
git status

echo.
echo 💾 Шаг 3: Создание коммита
git commit -m "Prepare for deployment"
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Нет изменений для коммита
)

echo.
echo 🌐 Шаг 4: Настройка удаленного репозитория
echo.
echo Введите URL вашего GitHub репозитория:
echo Формат: https://github.com/USERNAME/REPO.git
set /p repo_url="URL: "

if "%repo_url%"=="" (
    echo ❌ URL не может быть пустым
    pause
    exit /b 1
)

REM Проверка существования remote
git remote | findstr "origin" >nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Remote 'origin' уже существует. Обновляем...
    git remote set-url origin "%repo_url%"
) else (
    git remote add origin "%repo_url%"
)

echo ✅ Remote репозиторий настроен

echo.
echo 📤 Шаг 5: Отправка кода на GitHub
git branch -M main
git push -u origin main

echo.
echo ✅ Код успешно загружен на GitHub!
echo.
echo 📋 Следующие шаги:
echo 1. Перейдите в Settings → Pages вашего репозитория
echo 2. В Source выберите 'GitHub Actions'
echo 3. Зарегистрируйтесь на Render.com и задеплойте сервер
echo 4. Обновите URL в client/.env.production
echo 5. Сделайте git push для обновления
echo.
echo 📖 Подробная инструкция: см. DEPLOYMENT_GUIDE.md
echo.
echo 🎉 Готово!
echo.
pause
