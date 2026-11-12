# Как изменить игру: пошаговые инструкции

Для работы нужен только текстовый редактор (например, VS Code или Notepad++) и браузер.
После каждого изменения сохраните файл и обновите страницу с игрой (F5).
Если что-то сломалось — откройте консоль (F12 → Console) и прочитайте красное сообщение:
там написано имя файла и номер строки.

## Где что лежит

| Что | Файл |
|---|---|
| Все числа баланса (время, бюджет, штрафы, сколько проблем) | `js/core/config.js` |
| Все тексты на русском / белорусском | `js/data/texts.ru.js`, `js/data/texts.be.js` |
| Проблемы (hotspots) всех уровней | `js/data/hotspots.js` |
| Факты «А ты знал?» | `js/data/facts.js` |
| Предметы для сортировки | `js/data/waste.js` |
| Описание уровней (зоны, сцены) | `js/levels/*.js` |
| Рисунки сцен (SVG) | `js/scenes/*.scene.js` |
| Логика уровня (трогать не нужно) | `js/core/game.js` |
| Внешний вид (цвета, размеры) | `css/style.css`, блок `:root` |

Правило: **новое добавляется правкой данных, а не логики.**

---

## 1. Добавить новую проблему (hotspot)

Пример: в квартире добавим «Бойлер нагревает воду на максимум» (объект `obj-boiler` в сцене уже есть).

**Шаг 1.** Откройте `js/data/hotspots.js`, найдите массив `apartment: [` и добавьте перед закрывающей `]` блок
(не забудьте запятую после предыдущего блока):

```js
{
  id: 'boiler-max',          // уникальное имя проблемы
  object: 'boiler',          // id объекта в сцене без приставки obj-
  zone: 'main',              // зона (у квартиры одна — main)
  resource: 'heat',          // electricity | heat | water | waste
  load: 6,                   // насколько поднимает шкалу «Потребление»
  tick: { everyMs: 3000, effect: { kwh: 0.05, budget: -0.5 } }, // что «тикает», пока не решено
  actions: [
    { key: 'eco', correct: true, effect: {}, save: 10 },
    { key: 'cold', correct: false, effect: { comfort: -10 } },
    { key: 'leave', correct: false }
  ]
}
```

**Шаг 2.** Откройте `js/data/texts.ru.js` и добавьте тексты (ключи начинаются с `hs.` + id):

```js
'hs.boiler-max.title': 'Бойлер на максимуме',
'hs.boiler-max.problem': 'Стрелка бойлера стоит на самом горячем режиме.',
'hs.boiler-max.eco': 'Включить экономичный режим',
'hs.boiler-max.eco.why': 'Вода всё равно горячая, а нагревать её до кипения незачем.',
'hs.boiler-max.cold': 'Выключить бойлер навсегда',
'hs.boiler-max.cold.why': 'Мыться холодной водой некомфортно. Мы оптимизируем, а не запрещаем.',
'hs.boiler-max.tip': 'Ставь бойлер в экономичный режим.',
```

Текст для `leave` писать не обязательно — возьмётся общий «Оставить как есть».

**Шаг 3.** Добавьте те же ключи в `js/data/texts.be.js` с переводом (если не успели — игра покажет русский текст).

**Шаг 4.** Обновите страницу и сыграйте несколько раз (проблемы выбираются случайно).
Чтобы проблема попадалась чаще, временно увеличьте `problems` в `config.js`.

**Если объекта ещё нет на сцене** — сначала нарисуйте его по правилам из `assets/README.md`, раздел 5.

**Проблема с мини-игрой:** добавьте действию поле `minigame: 'thermostat'` (или `'sorting'`, `'solar'`).

---

## 2. Добавить факт

Откройте `js/data/facts.js` и добавьте строку в массив:

```js
{ id: 'my-fact', resource: 'water', source: 'https://energoeffekt.gov.by/...',
  text: 'Текст факта на русском.' },
```

- `resource`: `electricity`, `heat`, `water`, `waste`, `renewable` или `general`.
- Если число или утверждение ещё не проверено — допишите в конец текста `[ПРОВЕРИТЬ]` и оставьте `source: ''`.
  Такие факты не показываются игрокам, пока в `config.js` стоит `hideUnverifiedFacts: true`.
- Перевод: в `texts.be.js` добавьте `'fact.my-fact': 'Тэкст на беларускай мове.',`

---

## 3. Добавить предмет для сортировки

**Шаг 1.** В `js/data/waste.js` в массив `items` добавьте строку:

```js
{ id: 'juice-bottle', icon: '🧃', bin: 'plastic' },
```

`bin` — один из контейнеров: `paper`, `plastic`, `glass`, `metal`, `mixed`, `batteries`, `hazardous`.
Вместо эмодзи можно указать картинку: `icon: 'assets/svg/waste/juice-bottle.svg'`.

**Шаг 2.** В `texts.ru.js` (и `texts.be.js`) добавьте название и пояснение при ошибке:

```js
'waste.juice-bottle': 'Бутылка из-под сока',
'waste.juice-bottle.why': 'Пластиковая бутылка — в пластик. Сначала сполосни её.',
```

Сколько предметов, какая скорость и множитель очков на каждом уровне сложности — `minigames.sorting.levels` в `config.js`.

---

## 4. Добавить новый уровень

Пример: уровень «Дача» (`dacha`).

**Шаг 1. Сцена.** Создайте `js/scenes/dacha.scene.js`:

```js
/* dacha.scene.js — SVG-сцена дачи. */
EB.scenes = EB.scenes || {};
EB.scenes.dacha = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" class="scene-svg"> ... </svg>`;
```

Правила рисования объектов — в `assets/README.md`, раздел 5.

**Шаг 2. Описание уровня.** Создайте `js/levels/dacha.js`:

```js
/* dacha.js — уровень «Дача». */
EB.levels.dacha = {
  id: 'dacha',
  factTopic: 'water',
  zones: [ { id: 'main', scene: 'dacha' } ]
};
```

Несколько зон, как в колледже (уровень school): `zones: [{id: 'house', scene: 'dachaHouse'}, {id: 'garden', scene: 'dachaGarden'}]`
и тексты `zone.house`, `zone.garden`.

**Шаг 3. Проблемы.** В `js/data/hotspots.js` добавьте пул `dacha: [ ... ]` (см. раздел 1).

**Шаг 4. Настройки.** В `js/core/config.js`:

```js
levels: {
  ...,
  dacha: { problems: [5, 7], timeSec: 180, hints: 3, difficulty: 1.2 }
},
levelOrder: ['apartment', 'school', 'agro', 'shop', 'office', 'hospital', 'factory', 'city', 'dacha'],
```

При изменении числа уровней поправьте пороги званий в `ranks` (максимум звёзд = число уровней × 3) и медалей в `medals`
(идеальная игра на 8 уровнях даёт ≈ 224 эко-коина). Чтобы ключи текстов не пересекались с другими уровнями,
начинайте id объектов и проблем с приставки уровня (`dacha-…`), как у agro-, shop-, office-, hosp-, fac-.
Пока реплики Советника нового уровня не записаны, впишите их id в `voiceNotRecorded` (config.js).

**Шаг 5. Тексты.** В `texts.ru.js`: `level.dacha`, `level.dacha.desc`, `level.dacha.task`,
`advisor.start.dacha`, `advisor.tip.dacha`, тексты проблем. Иконку карточки уровня можно задать в
`EB.ui.menu.LEVEL_ICONS` (`js/ui/menu.js`).

**Шаг 6. Подключение.** В `index.html` добавьте две строки рядом с похожими:

```html
<script src="js/scenes/dacha.scene.js"></script>   <!-- в блок «SVG-сцены» -->
<script src="js/levels/dacha.js"></script>         <!-- в блок «Уровни» -->
```

---

## 5. Поменять баланс

Всё в `js/core/config.js`. Примеры:
- время на квартиру: `levels.apartment.timeSec`;
- сколько проблем выбирать: `levels.apartment.problems: [6, 8]`;
- штраф за ошибку: `scoring.errorPenalty`;
- пороги звёзд: `scoring.stars`;
- насколько быстро «тикают» все проблемы: `tickScale` (0.5 — вдвое медленнее).

## 6. Отладка

Поставьте в `config.js` `debug: true`, обновите страницу, откройте консоль (F12) и используйте:
`EB.debug.state()`, `EB.debug.problems()`, `EB.debug.solveAll()`, `EB.debug.time(5)`, `EB.debug.unlockAll()`.
Перед сдачей верните `debug: false`.
