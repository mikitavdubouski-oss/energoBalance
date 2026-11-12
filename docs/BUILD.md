# Финальная сборка и упаковка (этап 8.1)

## Перед упаковкой

- [ ] В `js/core/config.js`: `debug: false` (отладочные команды не создаются).
- [ ] В `js/core/config.js`: `hideUnverifiedFacts: true`, если остались непроверенные факты.
- [ ] Заглушки заменены: логотип (`assets/logo/logo.svg`), авторы и учреждение (`about.authors` в `texts.ru.js` и `texts.be.js`).
- [ ] Пройден `docs/test-checklist.md` хотя бы в Chrome и одном другом браузере.
- [ ] Нет обращений к сети. Проверка: в Git Bash в папке игры выполнить
      `grep -rnE "https?://|fetch\(|XMLHttpRequest" --include=*.js --include=*.html --include=*.css .`
      — допустимы только строки с `xmlns="http://www.w3.org/2000/svg"`.

## Что входит в архив

```
index.html  demo.html  README.txt  css/  js/  assets/  docs/
```

Не входят служебные файлы разработки: `CLAUDE.md`, `PROJECT-MAP.md`, `docs/PROMPTS.md`, папки `.git`, `.claude`.
Внутренние рабочие списки (`docs/facts-to-verify.md`, `docs/be-terms-to-check.md`) к моменту сдачи
должны быть отработаны; их тоже можно исключить — допишите в строку `Remove-Item` ниже.

## Команда упаковки (Windows PowerShell)

Откройте PowerShell в папке игры (Shift + правый клик по папке → «Открыть окно PowerShell здесь») и выполните:

```powershell
# 1. Собираем копию игры во временной папке
$out = "$env:TEMP\energobalans"
Remove-Item $out -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory $out | Out-Null
Copy-Item index.html, demo.html, README.txt, css, js, assets, docs -Destination $out -Recurse
# 2. Убираем служебные файлы разработки
Remove-Item "$out\docs\PROMPTS.md"
# 3. Упаковываем
Remove-Item energobalans.zip -ErrorAction SilentlyContinue
Compress-Archive -Path "$out\*" -DestinationPath energobalans.zip
```

Проверка: распакуйте `energobalans.zip` в другую папку и откройте `index.html` двойным кликом.

## Размер

Размер сборки — около 2,2 МБ: записанный голос Советника около 1,6 МБ, SVG-сцены около 190 КБ,
остальное — код и тексты на двух языках. mp3 почти не сжимается в zip, поэтому архив ≈ 1,8 МБ.
Если добавите музыку или звуки, следите, чтобы архив оставался в пределах нескольких МБ
(mp3 моно, 64–128 кбит/с).
