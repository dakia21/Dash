# 📦 Установка Git - Пошаговая инструкция

## Шаг 1: Скачайте Git

1. Откройте в браузере: https://git-scm.com/download/win
2. Скачивание начнется автоматически
3. Или нажмите на ссылку "Click here to download manually"

## Шаг 2: Установите Git

1. **Запустите** скачанный файл (Git-2.xx.x-64-bit.exe)
2. **Нажимайте "Next"** на всех экранах (настройки по умолчанию подходят)
3. **Важно:** На экране "Adjusting your PATH environment" выберите:
   - ✅ "Git from the command line and also from 3rd-party software" (должно быть выбрано по умолчанию)
4. **Продолжайте нажимать "Next"** до конца
5. **Нажмите "Install"**
6. **Дождитесь окончания установки**
7. **Нажмите "Finish"**

## Шаг 3: Проверьте установку

1. **Закройте все окна терминала/PowerShell** (если открыты)
2. **Откройте новый терминал** в VS Code или PowerShell
3. **Выполните команду:**
   ```bash
   git --version
   ```
4. **Должно показать:** `git version 2.xx.x`

## Шаг 4: Настройте Git (первый раз)

Выполните эти команды (замените на свои данные):

```bash
git config --global user.name "Ваше Имя"
git config --global user.email "ваш-email@example.com"
```

Например:
```bash
git config --global user.name "dakia21"
git config --global user.email "dakia21@example.com"
```

## Готово! ✅

Теперь вернитесь в чат и скажите "готово" - я помогу загрузить код на GitHub!

---

**Время установки: 3-5 минут**
