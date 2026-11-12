/*
  waste.js — данные для мини-игры «Сортировка отходов».

  bins  — контейнеры. Различаются ЦВЕТОМ, ЗНАЧКОМ и ПОДПИСЬЮ (для дальтоников),
          подпись — ключ waste.bin.<id> в texts.ru.js.
          Цвета контейнеров здесь игровые. Правила раздельного сбора в разных городах Беларуси
          могут отличаться [ПРОВЕРИТЬ] — уточните у местного коммунального предприятия.
  items — предметы: id, значок (emoji), в какой контейнер (bin).
          Название предмета — ключ waste.<id>, пояснение при ошибке — waste.<id>.why.

  Как добавить предмет: допиши строку в items и два текста в texts.ru.js (и texts.be.js).
  Значок можно заменить картинкой: вместо эмодзи укажи путь, например icon: 'assets/svg/waste/newspaper.svg'
  (список имён — в assets/README.md).
*/

EB.data.waste = {
  bins: [
    { id: 'paper',     icon: '📄', color: '#4f8fe8' },
    { id: 'plastic',   icon: '🧴', color: '#f2c230' },
    { id: 'glass',     icon: '🍯', color: '#3fb58a' },
    { id: 'metal',     icon: '🥫', color: '#9aa6b2' },
    { id: 'mixed',     icon: '🗑️', color: '#6b6f78' },
    { id: 'batteries', icon: '🔋', color: '#e8590c' },
    { id: 'hazardous', icon: '☣️', color: '#9b59d0' }
  ],

  items: [
    // Бумага
    { id: 'newspaper',  icon: '📰', bin: 'paper' },
    { id: 'cardboard',  icon: '📦', bin: 'paper' },
    { id: 'notebook',   icon: '📓', bin: 'paper' },
    { id: 'envelope',   icon: '✉️', bin: 'paper' },
    { id: 'magazines',  icon: '📚', bin: 'paper' },
    // Пластик
    { id: 'shampoo',    icon: '🧴', bin: 'plastic' },
    { id: 'cup',        icon: '🥤', bin: 'plastic' },
    { id: 'bag',        icon: '🛍️', bin: 'plastic' },
    // Стекло
    { id: 'bottle',     icon: '🍾', bin: 'glass' },
    { id: 'jar',        icon: '🍯', bin: 'glass' },
    // Металл
    { id: 'can',        icon: '🥫', bin: 'metal' },
    { id: 'bolts',      icon: '🔩', bin: 'metal' },
    { id: 'spoon',      icon: '🥄', bin: 'metal' },
    // Смешанные (несортируемые) отходы
    { id: 'peel',       icon: '🍌', bin: 'mixed' },
    { id: 'pizza',      icon: '🍕', bin: 'mixed' },
    { id: 'wrapper',    icon: '🍬', bin: 'mixed' },
    { id: 'napkin',     icon: '🧻', bin: 'mixed' },
    { id: 'toothbrush', icon: '🪥', bin: 'mixed' },
    // Батарейки
    { id: 'battery',    icon: '🔋', bin: 'batteries' },
    { id: 'accu',       icon: '🔋', bin: 'batteries' },
    // Опасные отходы
    { id: 'cfl',        icon: '💡', bin: 'hazardous' },
    { id: 'thermometer', icon: '🌡️', bin: 'hazardous' }
  ]
};
