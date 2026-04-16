@echo off
cd /d "%~dp0"
git add .
git commit -m "Fix: Use PORT env variable for Render"
git push origin main
echo.
echo ========================================
echo ГОТОВО! Изменения загружены
echo ========================================
echo.
echo Render.com автоматически пересоберет сервер (2-3 минуты)
echo.
pause
