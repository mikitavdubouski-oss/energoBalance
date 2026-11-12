# Ассеты игры: что есть, что можно заменить и как

Игра **полностью работает без файлов в этой папке**: звуки и музыка синтезируются кодом,
голос Советника — синтезатором речи браузера, графика нарисована в SVG внутри `.js`-файлов.
Всё ниже — **заглушки, которые можно заменить или дополнить** настоящими файлами.
Логику игры при этом менять не нужно: достаточно положить файл с нужным именем
и (где сказано) вписать путь в `js/core/config.js`.

> Почему графика лежит в `.js`, а не в `assets/svg`: игра запускается двойным кликом
> (протокол `file://`). В этом режиме браузер не даёт коду «заглянуть» внутрь SVG-файла,
> подключённого как картинка, а игре нужно переключать состояния объектов («проблема» / «решено»).
> Поэтому SVG-сцены вставлены в `js/scenes/*.scene.js` как текст.

---

## 1. Логотип конкурса

| Файл | Сейчас | Требования |
|---|---|---|
| `assets/logo/logo.svg` | заглушка с надписью «Логотип „Энергомарафона“» | SVG или PNG. Если PNG — назовите `logo.png` и поменяйте путь в `index.html` (тег `<img class="menu__logo">`). Показывается в главном меню в рамке 240×110 px, пропорции сохраняются. |

---

## 2. Звуковые эффекты — `assets/audio/sfx/`

Сейчас все звуки синтезируются в `js/core/audio.js`. Чтобы заменить звук файлом:
1. положите файл в `assets/audio/sfx/` с именем из таблицы;
2. в `js/core/config.js` в блоке `audioFiles` впишите строку, например
   `click: 'assets/audio/sfx/click.mp3',`.

Можно заменить один звук, а остальные оставить синтезированными.

| Имя (ключ) | Файл | Когда звучит | Длительность |
|---|---|---|---|
| `click` | `click.mp3` | нажатие кнопки, клик по объекту | до 0,1 с |
| `switch` | `switch.mp3` | выбор действия в карточке (щелчок выключателя) | до 0,2 с |
| `water` | `water.mp3` | клик по проблеме с водой (капли) | до 0,5 с |
| `correct` | `correct.mp3` | правильное решение | до 0,5 с |
| `error` | `error.mp3` | ошибка | до 0,5 с |
| `coin` | `coin.mp3` | эко-коины на экране итогов, пробный звук в настройках | до 0,5 с |
| `hint` | `hint.mp3` | подсказка | до 0,5 с |
| `pop` | `pop.mp3` | деталь встала на место (солнечная станция) | до 0,3 с |
| `win` | `win.mp3` | конец уровня со звёздами, запуск солнечной станции, финал | 1–2 с |

Формат: `.mp3` (работает во всех браузерах) или `.ogg`. Моно, 44,1 кГц, без тишины в начале.
Используйте только звуки, которые записали сами или которые разрешено использовать
(например, с лицензией CC0), и укажите их в титрах (`about.assets` в `js/data/texts.ru.js`).

---

## 3. Фоновая музыка — `assets/audio/music/`

| Файл | Как подключить | Требования |
|---|---|---|
| `theme.mp3` | в `config.js`: `musicFile: 'assets/audio/music/theme.mp3'` | спокойная позитивная мелодия, бесшовная петля 30–90 с, размер до 1–1,5 МБ |

Пока `musicFile: null`, играет мелодия, которую синтезирует код.

---

## 4. Голос Советника — `assets/audio/voice/`

| Файлы | Как подключить |
|---|---|
| `assets/audio/voice/<id>.mp3` — русский | в `config.js`: `voiceFiles: true` |
| `assets/audio/voice/be/<id>.mp3` — белорусский | то же |

**Статус:** все 14 реплик записаны на обоих языках и лежат здесь, `voiceFiles: true` включено (12.11.2026).
Монофонические mp3, 24 кГц, около 75 кбит/с, всего около 1,6 МБ.

Полный список реплик с `id` и текстами — в **`docs/voice-lines.md`**.
Если какого-то файла нет, эта реплика читается синтезатором речи (или показывается только текстом).

---

## 5. Сцены уровней — `js/scenes/`

| Файл | Что внутри | Объекты (id в SVG) |
|---|---|---|
| `js/scenes/apartment.scene.js` | `EB.scenes.apartment` — квартира | `obj-chandelier`, `obj-floorlamp`, `obj-tv`, `obj-computer`, `obj-charger`, `obj-fridge`, `obj-washer`, `obj-kettle`, `obj-tap-kitchen`, `obj-tap-bath`, `obj-radiator`, `obj-window`, `obj-boiler` |
| `js/scenes/school.scene.js` | `EB.scenes.schoolClass` — колледж: класс | `obj-class-lights`, `obj-class-window`, `obj-projector`, `obj-computers`, `obj-class-radiator` |
| | `EB.scenes.schoolCorridor` — коридор | `obj-corridor-lights`, `obj-corridor-door`, `obj-corridor-window`, `obj-fountain`, `obj-vending` |
| | `EB.scenes.schoolCanteen` — столовая | `obj-canteen-tap`, `obj-dishwasher`, `obj-canteen-fridge`, `obj-stove`, `obj-waste-bins` |
| `js/scenes/agro.scene.js` | `EB.scenes.agro` — дом в агрогородке | `obj-agro-attic`, `obj-agro-boiler`, `obj-agro-window`, `obj-agro-radiator`, `obj-agro-waterheater`, `obj-agro-woodpile`, `obj-agro-yard-lamp`, `obj-agro-shed-light`, `obj-agro-freezer`, `obj-agro-hose`, `obj-agro-pump`, `obj-agro-compost`, `obj-agro-dog` |
| `js/scenes/shop.scene.js` | `EB.scenes.shop` — супермаркет | `obj-shop-entrance`, `obj-shop-window-lights`, `obj-shop-fridge`, `obj-shop-oven`, `obj-shop-tap`, `obj-shop-storage-door`, `obj-shop-carts`, `obj-shop-conveyor`, `obj-shop-bags`, `obj-shop-scales`, `obj-shop-freezer`, `obj-shop-food-waste`, `obj-shop-cardboard` |
| `js/scenes/office.scene.js` | `EB.scenes.office` — офис | `obj-office-tap`, `obj-office-coffee`, `obj-office-blinds`, `obj-office-ac`, `obj-office-pcs`, `obj-office-heater`, `obj-office-printer`, `obj-office-meeting-light`, `obj-office-board`, `obj-office-plant`, `obj-office-chargers`, `obj-office-paper-bin`, `obj-office-cartridges` |
| `js/scenes/hospital.scene.js` | `EB.scenes.hospital` — больница | `obj-hosp-roof`, `obj-hosp-window`, `obj-hosp-monitor`, `obj-hosp-lift`, `obj-hosp-office-light`, `obj-hosp-tap`, `obj-hosp-med-fridge`, `obj-hosp-med-waste`, `obj-hosp-door`, `obj-hosp-bins`, `obj-hosp-lamps`, `obj-hosp-laundry`, `obj-hosp-pipes` |
| `js/scenes/factory.scene.js` | `EB.scenes.factory` — завод | `obj-fac-gate`, `obj-fac-furnace`, `obj-fac-skylights`, `obj-fac-pipes`, `obj-fac-safety-board`, `obj-fac-extinguisher`, `obj-fac-cooling`, `obj-fac-conveyor`, `obj-fac-pallets`, `obj-fac-scrap`, `obj-fac-air-hose`, `obj-fac-compressor`, `obj-fac-fan` |
| `js/scenes/city.scene.js` | `EB.scenes.city` — мини-город | `obj-street-lamps`, `obj-old-lamp`, `obj-facade`, `obj-roof`, `obj-entrance-door`, `obj-stair-light`, `obj-heat-pipe`, `obj-sprinkler`, `obj-garbage`, `obj-wind-site` |

### Как заменить сцену своим рисунком (например, из Inkscape или Figma)

Нарисуйте сцену и сохраните как «Простой SVG» (исходники удобно хранить в `assets/svg/`).
Чтобы игра поняла рисунок, в нём должны соблюдаться правила:

1. Корневой тег: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" class="scene-svg">`.
2. Каждый интерактивный объект — группа `<g id="obj-ИМЯ" class="obj">` с именем из таблицы выше. Внутри:
   - части, которые видны всегда;
   - `<g class="v-problem">…</g>` — как объект выглядит, пока проблема не решена;
   - `<g class="v-ok">…</g>` — как он выглядит в порядке;
   - последним — прозрачная область клика `<rect class="obj-hit" x=".." y=".." width=".." height=".." fill="transparent"/>`
     (не меньше 110×110, области разных объектов не должны пересекаться).
3. Без `<text>` (надписи берутся из файлов переводов), без внешних картинок и шрифтов.
4. id градиентов и фильтров начинайте с приставки сцены (`ap-`, `scl-`, `scr-`, `scn-`, `ct-`).
5. Смысл не передавайте только цветом: проблема должна отличаться формой или движением (свечение, капли, пар).

Затем откройте нужный `.scene.js` и замените текст между обратными кавычками `` ` `` на содержимое
вашего SVG-файла. Внутри SVG не должно быть символов `` ` `` и `${`.

Новый объект добавляется так: нарисуйте группу `obj-новоеимя`, добавьте проблему в `js/data/hotspots.js`
с `object: 'новоеимя'` и тексты в `texts.ru.js` (см. `docs/HOW-TO-MODIFY.md`).

---

## 6. Персонаж «Советник»

| Где | Что |
|---|---|
| `js/ui/advisor.js`, функция `svg(emotion)` | SVG подростка с тремя эмоциями: `normal`, `happy`, `think` |

Чтобы заменить персонажа своим рисунком, нарисуйте три варианта (обычный, радуется, задумался)
в рамке `viewBox="0 0 160 200"` и верните их из функции `svg` вместо текущей разметки.

---

## 7. Иконки интерфейса

| Где | Что |
|---|---|
| `js/ui/icons.js` | иконки шкал, ресурсов, кнопок (молния, капля, огонь, монета, звезда и т.д.), `viewBox="0 0 24 24"`, цвет `currentColor` |

---

## 8. Значки в мини-игре «Сортировка» — `assets/svg/waste/` (необязательно)

Сейчас предметы и контейнеры показаны системными эмодзи. Их можно заменить картинками:
положите файлы в `assets/svg/waste/` и впишите путь в поле `icon` в `js/data/waste.js`
(например, `icon: 'assets/svg/waste/newspaper.svg'`). Размер показа — 36×36 px.

| Контейнеры | Предметы |
|---|---|
| `bin-paper.svg`, `bin-plastic.svg`, `bin-glass.svg`, `bin-metal.svg`, `bin-mixed.svg`, `bin-batteries.svg`, `bin-hazardous.svg` | `newspaper.svg`, `cardboard.svg`, `notebook.svg`, `envelope.svg`, `magazines.svg`, `shampoo.svg`, `cup.svg`, `bag.svg`, `bottle.svg`, `jar.svg`, `can.svg`, `bolts.svg`, `spoon.svg`, `peel.svg`, `pizza.svg`, `wrapper.svg`, `napkin.svg`, `toothbrush.svg`, `battery.svg`, `accu.svg`, `cfl.svg`, `thermometer.svg` |

---

## Чек-лист после замены ассета

- [ ] Файл лежит по пути из таблицы, имя совпадает (маленькие буквы, без пробелов).
- [ ] Путь вписан в `config.js` (для звуков, музыки, голоса).
- [ ] Игра открывается двойным кликом по `index.html`, в консоли (F12) нет красных ошибок.
- [ ] Автор и лицензия ассета указаны в титрах (`about.assets` в `texts.ru.js` и `texts.be.js`).
- [ ] Общий размер папки игры — не больше нескольких МБ.
