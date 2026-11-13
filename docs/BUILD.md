# Финальная сборка и упаковка (этап 8.1)

## Перед упаковкой

- [ ] В `js/core/config.js`: `debug: false` (отладочные команды не создаются).
- [ ] В `js/core/config.js`: `hideUnverifiedFacts: true`, если остались непроверенные факты.
- [ ] Заглушки заменены: авторы (`about.authors` в `texts.ru.js` и `texts.be.js`: учащиеся и руководитель; логотип и учреждение уже стоят — колледж).
- [ ] Пройден `docs/test-checklist.md` хотя бы в Chrome и одном другом браузере.
- [ ] Нет обращений к сети. Проверка: в Git Bash в папке игры выполнить
      `grep -rnE "https?://|fetch\(|XMLHttpRequest" --include=*.js --include=*.html --include=*.css .`
      — допустимы только строки с `xmlns="http://www.w3.org/2000/svg"`.

## Что входит в архив

Только то, что нужно для запуска игры — код и ассеты:

```
index.html  demo.html  manifest.webmanifest  css/  js/  assets/
```

**Документация в архив не входит вовсе:** ни папка `docs/` (записка, инструкции, чек-листы, списки на проверку),
ни `README.txt`, ни `CLAUDE.md`, `PROJECT-MAP.md`, ни файлы `README.*` внутри `assets/`, ни папки `tools`, `.git`, `.claude`.
Пояснительную записку (`docs/poyasnitelnaya-zapiska.md`, оформленную в Word/PDF) и инструкцию для жюри (`README.txt`)
сдают **отдельными файлами рядом с архивом**, если их требует положение конкурса.

Внутри игры ссылок на документацию нет: в «Об игре → Источники» написано «Полный список источников — в пояснительной записке».

## Команда упаковки (Windows PowerShell)

Откройте PowerShell в папке игры (Shift + правый клик по папке → «Открыть окно PowerShell здесь») и выполните:

```powershell
# 1. Собираем копию игры во временной папке
$out = "$env:TEMP\energobalans"
Remove-Item $out -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory $out | Out-Null
Copy-Item index.html, demo.html, manifest.webmanifest, css, js, assets -Destination $out -Recurse
# 2. Убираем описания внутри assets (README.md / README.txt) — для запуска они не нужны
Get-ChildItem $out -Recurse -Include README.md, README.txt | Remove-Item
# 3. Упаковываем
Remove-Item energobalans.zip -ErrorAction SilentlyContinue
Compress-Archive -Path "$out\*" -DestinationPath energobalans.zip
```

Проверка: распакуйте `energobalans.zip` в другую папку и откройте `index.html` двойным кликом.
В архиве должны быть только `index.html`, `demo.html`, `manifest.webmanifest` и папки `css`, `js`, `assets` —
без `.md` и `.txt` файлов.

## Размер

Размер сборки — около 4,4 МБ: записанный голос Советника (48 файлов) около 3,1 МБ, SVG-сцены 8 уровней около 530 КБ,
остальное — код и тексты на двух языках. mp3 почти не сжимается в zip, поэтому архив ≈ 3,5 МБ.
Если добавите музыку или звуки, следите, чтобы архив оставался в пределах нескольких МБ
(mp3 моно, 64–128 кбит/с).
