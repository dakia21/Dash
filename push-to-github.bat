@echo off
echo ========================================
echo Загрузка изменений на GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Добавляем все файлы...
git add .

echo.
echo [2/3] Создаем коммит...
git commit -m "Update: Fix CORS and TypeScript errors"

echo.
echo [3/3] Загружаем на GitHub...
git push origin main

echo.
echo ========================================
echo ГОТОВО! Изменения загружены на GitHub
echo ========================================
echo.
echo Теперь:
echo 1. Открой https://dashboard.render.com/
echo    Проверь что сервер "Live" (зеленый)
echo.
echo 2. Открой https://app.netlify.com/
echo    Подожди пока сайт пересоберется (2-3 минуты)
echo.
echo 3. Открой https://daaash.netlify.app
echo    Попробуй зарегистрироваться!
echo.
pause
