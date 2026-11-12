/*
  hotspots.js — пулы «проблемных зон» (hotspots) для всех уровней.

  При старте уровня из пула случайно выбирается несколько проблем
  (сколько — задаёт EB.config.levels.<уровень>.problems).
  Остальные объекты сцены остаются «в порядке» — по ним можно кликнуть,
  но там всё хорошо (режим детектива).

  Поля одной проблемы:
  - id        — уникальное имя проблемы. Тексты ищутся по ключам в texts.ru.js:
                hs.<id>.title, hs.<id>.problem, hs.<id>.<action>, hs.<id>.<action>.why, hs.<id>.tip
  - object    — id объекта в SVG-сцене (без приставки obj-), см. js/scenes/*.scene.js
  - zone      — зона уровня (для колледжа: class / corridor / canteen; для остальных — main)
  - resource  — electricity | heat | water | waste
  - load      — насколько проблема поднимает шкалу «Потребление» (снимается при решении)
  - tick      — что происходит, пока проблема не решена: каждые everyMs мс применяется effect
                (kwh / gcal / liters — потери в условных единицах, budget — расходы)
  - actions   — 2–4 действия:
      key      — короткое имя действия (текст: hs.<id>.<key>; если его нет — action.<key>)
      correct  — true, если это хорошее решение
      effect   — сразу меняет шкалы {budget, comfort, consumption}
      save     — сколько «очков экономии» даёт (для подсчёта Score)
      minigame — (необязательно) имя мини-игры, которая запускается вместо мгновенного эффекта

  Как добавить новую проблему: скопируй любой блок, поменяй id и object,
  добавь тексты в texts.ru.js (и texts.be.js). Логику трогать не нужно.
*/

EB.data.hotspots = {

  // ======================= Уровень 1. Квартира =======================
  apartment: [
    {
      id: 'light-day', object: 'chandelier', zone: 'main', resource: 'electricity', load: 8,
      tick: { everyMs: 3000, effect: { kwh: 0.06, budget: -0.5 } },
      actions: [
        { key: 'off', correct: true, effect: {}, save: 10 },
        { key: 'led', correct: true, effect: { budget: -8, comfort: 3 }, save: 14 },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'old-bulb', object: 'floorlamp', zone: 'main', resource: 'electricity', load: 7,
      tick: { everyMs: 3000, effect: { kwh: 0.05, budget: -0.5 } },
      actions: [
        { key: 'led', correct: true, effect: { budget: -6, comfort: 2 }, save: 14 },
        { key: 'dark', correct: false, effect: { comfort: -10 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'tv-standby', object: 'tv', zone: 'main', resource: 'electricity', load: 4,
      tick: { everyMs: 4000, effect: { kwh: 0.02, budget: -0.3 } },
      actions: [
        { key: 'off', correct: true, effect: {}, save: 8 },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'pc-idle', object: 'computer', zone: 'main', resource: 'electricity', load: 6,
      tick: { everyMs: 3500, effect: { kwh: 0.04, budget: -0.4 } },
      actions: [
        { key: 'sleep', correct: true, effect: {}, save: 10 },
        { key: 'dim', correct: false, effect: { budget: -1 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'charger', object: 'charger', zone: 'main', resource: 'electricity', load: 2,
      tick: { everyMs: 5000, effect: { kwh: 0.01, budget: -0.2 } },
      actions: [
        { key: 'unplug', correct: true, effect: {}, save: 5 },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'fridge-open', object: 'fridge', zone: 'main', resource: 'electricity', load: 7,
      tick: { everyMs: 3000, effect: { kwh: 0.05, budget: -0.5 } },
      actions: [
        { key: 'close', correct: true, effect: {}, save: 10 },
        { key: 'colder', correct: false, effect: { consumption: 4, budget: -3 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'washer-half', object: 'washer', zone: 'main', resource: 'electricity', load: 8,
      tick: { everyMs: 3000, effect: { kwh: 0.06, liters: 1, budget: -0.6 } },
      actions: [
        { key: 'full', correct: true, effect: {}, save: 14 },
        { key: 'nowash', correct: false, effect: { comfort: -12 } },
        { key: 'run', correct: false, effect: { budget: -4 } }
      ]
    },
    {
      id: 'kettle-full', object: 'kettle', zone: 'main', resource: 'electricity', load: 6,
      tick: { everyMs: 3000, effect: { kwh: 0.05, budget: -0.4 } },
      actions: [
        { key: 'cup', correct: true, effect: {}, save: 10 },
        { key: 'notea', correct: false, effect: { comfort: -8 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'tap-drip', object: 'tap-kitchen', zone: 'main', resource: 'water', load: 5,
      tick: { everyMs: 2000, effect: { liters: 1, budget: -0.4 } },
      actions: [
        { key: 'fix', correct: true, effect: { budget: -3 }, save: 12 },
        { key: 'bucket', correct: false, effect: { budget: -1 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'tap-teeth', object: 'tap-bath', zone: 'main', resource: 'water', load: 5,
      tick: { everyMs: 2000, effect: { liters: 2, budget: -0.5 } },
      actions: [
        { key: 'close', correct: true, effect: {}, save: 10 },
        { key: 'noteeth', correct: false, effect: { comfort: -15 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'radiator-hot', object: 'radiator', zone: 'main', resource: 'heat', load: 9,
      tick: { everyMs: 3000, effect: { gcal: 0.002, budget: -0.6 } },
      actions: [
        { key: 'thermostat', correct: true, effect: { comfort: 4 }, save: 16, minigame: 'thermostat' },
        { key: 'window', correct: false, effect: { consumption: 4, budget: -4 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'window-draft', object: 'window', zone: 'main', resource: 'heat', load: 8,
      tick: { everyMs: 3000, effect: { gcal: 0.002, budget: -0.5 } },
      actions: [
        { key: 'seal', correct: true, effect: { budget: -5, comfort: 6 }, save: 14 },
        { key: 'heater', correct: false, effect: { consumption: 5, budget: -5, comfort: 3 } },
        { key: 'leave', correct: false, effect: { comfort: -4 } }
      ]
    }
  ],

  // ======================= Уровень 2. Колледж (id school) =======================
  school: [
    // --- Класс ---
    {
      id: 'class-lights', object: 'class-lights', zone: 'class', resource: 'electricity', load: 8,
      tick: { everyMs: 2500, effect: { kwh: 0.08, budget: -0.6 } },
      actions: [
        { key: 'off', correct: true, effect: {}, save: 10 },
        { key: 'sensor', correct: true, effect: { budget: -8, comfort: 2 }, save: 14 },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'class-window', object: 'class-window', zone: 'class', resource: 'heat', load: 9,
      tick: { everyMs: 2500, effect: { gcal: 0.003, budget: -0.7 } },
      actions: [
        { key: 'airing', correct: true, effect: { comfort: 4 }, save: 12 },
        { key: 'heatup', correct: false, effect: { consumption: 5, budget: -5 } },
        { key: 'leave', correct: false, effect: { comfort: -5 } }
      ]
    },
    {
      id: 'projector', object: 'projector', zone: 'class', resource: 'electricity', load: 4,
      tick: { everyMs: 3500, effect: { kwh: 0.03, budget: -0.3 } },
      actions: [
        { key: 'off', correct: true, effect: {}, save: 7 },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'computers', object: 'computers', zone: 'class', resource: 'electricity', load: 7,
      tick: { everyMs: 2500, effect: { kwh: 0.06, budget: -0.5 } },
      actions: [
        { key: 'shutdown', correct: true, effect: {}, save: 10 },
        { key: 'monitors', correct: false, effect: { budget: -1 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'class-radiator', object: 'class-radiator', zone: 'class', resource: 'heat', load: 6,
      tick: { everyMs: 3000, effect: { gcal: 0.002, budget: -0.5 } },
      actions: [
        { key: 'free', correct: true, effect: { comfort: 5 }, save: 10 },
        { key: 'heater', correct: false, effect: { consumption: 5, budget: -5, comfort: 2 } },
        { key: 'leave', correct: false, effect: { comfort: -3 } }
      ]
    },
    // --- Коридор ---
    {
      id: 'corridor-lights', object: 'corridor-lights', zone: 'corridor', resource: 'electricity', load: 7,
      tick: { everyMs: 2500, effect: { kwh: 0.07, budget: -0.5 } },
      actions: [
        { key: 'daylight', correct: true, effect: { budget: -5 }, save: 12 },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'corridor-door', object: 'corridor-door', zone: 'corridor', resource: 'heat', load: 9,
      tick: { everyMs: 2500, effect: { gcal: 0.003, budget: -0.7 } },
      actions: [
        { key: 'closer', correct: true, effect: { budget: -5, comfort: 5 }, save: 14 },
        { key: 'heater', correct: false, effect: { consumption: 5, budget: -5 } },
        { key: 'leave', correct: false, effect: { comfort: -5 } }
      ]
    },
    {
      id: 'corridor-window', object: 'corridor-window', zone: 'corridor', resource: 'heat', load: 5,
      tick: { everyMs: 3000, effect: { gcal: 0.002, budget: -0.4 } },
      actions: [
        { key: 'seal', correct: true, effect: { budget: -3, comfort: 3 }, save: 9 },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'fountain', object: 'fountain', zone: 'corridor', resource: 'water', load: 5,
      tick: { everyMs: 2000, effect: { liters: 2, budget: -0.5 } },
      actions: [
        { key: 'fix', correct: true, effect: { budget: -2 }, save: 9 },
        { key: 'remove', correct: false, effect: { comfort: -10 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'vending', object: 'vending', zone: 'corridor', resource: 'electricity', load: 4,
      tick: { everyMs: 3500, effect: { kwh: 0.03, budget: -0.3 } },
      actions: [
        { key: 'eco', correct: true, effect: {}, save: 7 },
        { key: 'unplug', correct: false, effect: { comfort: -6 } },
        { key: 'leave', correct: false }
      ]
    },
    // --- Столовая ---
    {
      id: 'canteen-tap', object: 'canteen-tap', zone: 'canteen', resource: 'water', load: 6,
      tick: { everyMs: 1800, effect: { liters: 3, budget: -0.6 } },
      actions: [
        { key: 'basin', correct: true, effect: {}, save: 10 },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'dishwasher', object: 'dishwasher', zone: 'canteen', resource: 'electricity', load: 7,
      tick: { everyMs: 2500, effect: { kwh: 0.06, liters: 1, budget: -0.6 } },
      actions: [
        { key: 'full', correct: true, effect: {}, save: 12 },
        { key: 'hand', correct: false, effect: { consumption: 3, budget: -3 } },
        { key: 'run', correct: false, effect: { budget: -3 } }
      ]
    },
    {
      id: 'canteen-fridge', object: 'canteen-fridge', zone: 'canteen', resource: 'electricity', load: 7,
      tick: { everyMs: 2500, effect: { kwh: 0.06, budget: -0.5 } },
      actions: [
        { key: 'close', correct: true, effect: {}, save: 10 },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'stove', object: 'stove', zone: 'canteen', resource: 'electricity', load: 8,
      tick: { everyMs: 2500, effect: { kwh: 0.08, budget: -0.6 } },
      actions: [
        { key: 'lid', correct: true, effect: {}, save: 12 },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'waste-bins', object: 'waste-bins', zone: 'canteen', resource: 'waste', load: 5,
      tick: { everyMs: 4000, effect: { budget: -0.5 } },
      actions: [
        { key: 'sort', correct: true, effect: {}, save: 16, minigame: 'sorting' },
        { key: 'bigger', correct: false, effect: { budget: -4 } },
        { key: 'leave', correct: false }
      ]
    }
  ],

  // ======================= Уровень: Дом в агрогородке =======================
  agro: [
    {
      id: 'agro-boiler', object: 'agro-boiler', zone: 'main', resource: 'heat', load: 10,
      tick: { everyMs: 2500, effect: { gcal: 0.004, budget: -0.8 } },
      actions: [
        { key: 'regulate', correct: true, effect: { budget: -3, comfort: 4 }, save: 18 },
        { key: 'vent', correct: false, effect: { consumption: 4, budget: -4 } },
        { key: 'stop', correct: false, effect: { comfort: -15 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'agro-attic', object: 'agro-attic', zone: 'main', resource: 'heat', load: 9,
      tick: { everyMs: 2500, effect: { gcal: 0.004, budget: -0.7 } },
      actions: [
        { key: 'insulate', correct: true, effect: { budget: -10, comfort: 6 }, save: 20 },
        { key: 'heatup', correct: false, effect: { consumption: 5, budget: -6 } },
        { key: 'leave', correct: false, effect: { comfort: -4 } }
      ]
    },
    {
      id: 'agro-window', object: 'agro-window', zone: 'main', resource: 'heat', load: 7,
      tick: { everyMs: 3000, effect: { gcal: 0.002, budget: -0.5 } },
      actions: [
        { key: 'seal', correct: true, effect: { budget: -4, comfort: 6 }, save: 12 },
        { key: 'heater', correct: false, effect: { consumption: 5, budget: -5, comfort: 3 } },
        { key: 'leave', correct: false, effect: { comfort: -4 } }
      ]
    },
    {
      id: 'agro-radiator', object: 'agro-radiator', zone: 'main', resource: 'heat', load: 8,
      tick: { everyMs: 3000, effect: { gcal: 0.003, budget: -0.6 } },
      actions: [
        { key: 'thermostat', correct: true, effect: { comfort: 4 }, save: 16, minigame: 'thermostat' },
        { key: 'window', correct: false, effect: { consumption: 4, budget: -4 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'agro-waterheater', object: 'agro-waterheater', zone: 'main', resource: 'electricity', load: 7,
      tick: { everyMs: 3000, effect: { kwh: 0.06, budget: -0.5 } },
      actions: [
        { key: 'eco', correct: true, effect: { comfort: 2 }, save: 12 },
        { key: 'off', correct: false, effect: { comfort: -12 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'agro-yard-lamp', object: 'agro-yard-lamp', zone: 'main', resource: 'electricity', load: 6,
      tick: { everyMs: 2500, effect: { kwh: 0.05, budget: -0.5 } },
      actions: [
        { key: 'sensor', correct: true, effect: { budget: -5 }, save: 12 },
        { key: 'remove', correct: false, effect: { comfort: -12 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'agro-shed-light', object: 'agro-shed-light', zone: 'main', resource: 'electricity', load: 5,
      tick: { everyMs: 3000, effect: { kwh: 0.04, budget: -0.4 } },
      actions: [
        { key: 'motion', correct: true, effect: { budget: -4, comfort: 2 }, save: 10 },
        { key: 'unscrew', correct: false, effect: { comfort: -8 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'agro-freezer', object: 'agro-freezer', zone: 'main', resource: 'electricity', load: 7,
      tick: { everyMs: 3000, effect: { kwh: 0.07, budget: -0.5 } },
      actions: [
        { key: 'merge', correct: true, effect: {}, save: 14 },
        { key: 'colder', correct: false, effect: { consumption: 3, budget: -3 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'agro-hose', object: 'agro-hose', zone: 'main', resource: 'water', load: 6,
      tick: { everyMs: 2000, effect: { liters: 3, budget: -0.5 } },
      actions: [
        { key: 'rain', correct: true, effect: { budget: -3 }, save: 12 },
        { key: 'nowater', correct: false, effect: { comfort: -6 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'agro-pump', object: 'agro-pump', zone: 'main', resource: 'water', load: 6,
      tick: { everyMs: 2000, effect: { liters: 2, kwh: 0.02, budget: -0.6 } },
      actions: [
        { key: 'fix', correct: true, effect: { budget: -2 }, save: 12 },
        { key: 'off', correct: false, effect: { comfort: -12 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'agro-compost', object: 'agro-compost', zone: 'main', resource: 'waste', load: 5,
      tick: { everyMs: 4000, effect: { budget: -0.4 } },
      actions: [
        { key: 'compost', correct: true, effect: { budget: -2 }, save: 12 },
        { key: 'burn', correct: false, effect: { comfort: -8, budget: -2 } },
        { key: 'leave', correct: false }
      ]
    }
  ],

  // ======================= Уровень: Супермаркет =======================
  shop: [
    {
      id: 'shop-entrance', object: 'shop-entrance', zone: 'main', resource: 'heat', load: 9,
      tick: { everyMs: 2500, effect: { gcal: 0.004, budget: -0.7 } },
      actions: [
        { key: 'repair', correct: true, effect: { budget: -8, comfort: 6 }, save: 18 },
        { key: 'heater', correct: false, effect: { consumption: 5, budget: -6 } },
        { key: 'leave', correct: false, effect: { comfort: -4 } }
      ]
    },
    {
      id: 'shop-window-lights', object: 'shop-window-lights', zone: 'main', resource: 'electricity', load: 6,
      tick: { everyMs: 3000, effect: { kwh: 0.06, budget: -0.5 } },
      actions: [
        { key: 'sensor', correct: true, effect: { budget: -5, comfort: 2 }, save: 12 },
        { key: 'dark', correct: false, effect: { comfort: -12 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'shop-fridge', object: 'shop-fridge', zone: 'main', resource: 'electricity', load: 10,
      tick: { everyMs: 2500, effect: { kwh: 0.1, budget: -0.8 } },
      actions: [
        { key: 'doors', correct: true, effect: { budget: -10, comfort: 3 }, save: 20 },
        { key: 'curtain', correct: true, effect: { budget: -4 }, save: 10 },
        { key: 'colder', correct: false, effect: { consumption: 5, budget: -4 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'shop-freezer', object: 'shop-freezer', zone: 'main', resource: 'electricity', load: 7,
      tick: { everyMs: 3000, effect: { kwh: 0.07, budget: -0.5 } },
      actions: [
        { key: 'close', correct: true, effect: {}, save: 12 },
        { key: 'off', correct: false, effect: { comfort: -10, budget: -4 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'shop-oven', object: 'shop-oven', zone: 'main', resource: 'electricity', load: 7,
      tick: { everyMs: 2500, effect: { kwh: 0.08, budget: -0.6 } },
      actions: [
        { key: 'close', correct: true, effect: { comfort: 3 }, save: 12 },
        { key: 'fan', correct: false, effect: { consumption: 3, budget: -3 } },
        { key: 'leave', correct: false, effect: { comfort: -3 } }
      ]
    },
    {
      id: 'shop-tap', object: 'shop-tap', zone: 'main', resource: 'water', load: 5,
      tick: { everyMs: 2000, effect: { liters: 3, budget: -0.5 } },
      actions: [
        { key: 'repair', correct: true, effect: { budget: -2 }, save: 10 },
        { key: 'bucket', correct: false, effect: { budget: -1 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'shop-storage-door', object: 'shop-storage-door', zone: 'main', resource: 'heat', load: 6,
      tick: { everyMs: 3000, effect: { gcal: 0.003, budget: -0.5 } },
      actions: [
        { key: 'closer', correct: true, effect: { budget: -4, comfort: 4 }, save: 12 },
        { key: 'lock', correct: false, effect: { comfort: -8 } },
        { key: 'leave', correct: false, effect: { comfort: -3 } }
      ]
    },
    {
      id: 'shop-conveyor', object: 'shop-conveyor', zone: 'main', resource: 'electricity', load: 5,
      tick: { everyMs: 3000, effect: { kwh: 0.04, budget: -0.4 } },
      actions: [
        { key: 'sensor', correct: true, effect: { budget: -4 }, save: 10 },
        { key: 'close', correct: false, effect: { comfort: -10 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'shop-bags', object: 'shop-bags', zone: 'main', resource: 'waste', load: 4,
      tick: { everyMs: 4000, effect: { budget: -0.4 } },
      actions: [
        { key: 'reusable', correct: true, effect: { budget: -2, comfort: 2 }, save: 10 },
        { key: 'double', correct: false, effect: { budget: -3 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'shop-cardboard', object: 'shop-cardboard', zone: 'main', resource: 'waste', load: 6,
      tick: { everyMs: 4000, effect: { budget: -0.5 } },
      actions: [
        { key: 'sort', correct: true, effect: {}, save: 16, minigame: 'sorting' },
        { key: 'bigger', correct: false, effect: { budget: -4 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'shop-food-waste', object: 'shop-food-waste', zone: 'main', resource: 'waste', load: 5,
      tick: { everyMs: 4000, effect: { budget: -0.5 } },
      actions: [
        { key: 'discount', correct: true, effect: { budget: -2, comfort: 2 }, save: 14 },
        { key: 'overstock', correct: false, effect: { budget: -4 } },
        { key: 'leave', correct: false }
      ]
    }
  ],

  // ======================= Уровень: Офис =======================
  office: [
    {
      id: 'office-pcs', object: 'office-pcs', zone: 'main', resource: 'electricity', load: 7,
      tick: { everyMs: 3000, effect: { kwh: 0.05, budget: -0.5 } },
      actions: [
        { key: 'sleep', correct: true, effect: {}, save: 12 },
        { key: 'unplug', correct: false, effect: { comfort: -8, budget: -2 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'office-meeting-light', object: 'office-meeting-light', zone: 'main', resource: 'electricity', load: 6,
      tick: { everyMs: 3000, effect: { kwh: 0.05, budget: -0.4 } },
      actions: [
        { key: 'sensor', correct: true, effect: { budget: -5 }, save: 12 },
        { key: 'remove', correct: false, effect: { comfort: -12 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'office-blinds', object: 'office-blinds', zone: 'main', resource: 'electricity', load: 6,
      tick: { everyMs: 3000, effect: { kwh: 0.04, budget: -0.4 } },
      actions: [
        { key: 'daylight', correct: true, effect: { comfort: 3 }, save: 10 },
        { key: 'brighter', correct: false, effect: { consumption: 4, budget: -4 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'office-ac', object: 'office-ac', zone: 'main', resource: 'electricity', load: 8,
      tick: { everyMs: 2500, effect: { kwh: 0.07, budget: -0.6 } },
      actions: [
        { key: 'close', correct: true, effect: {}, save: 14 },
        { key: 'max', correct: false, effect: { consumption: 5, budget: -4 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'office-heater', object: 'office-heater', zone: 'main', resource: 'heat', load: 9,
      tick: { everyMs: 3000, effect: { kwh: 0.05, gcal: 0.002, budget: -0.6 } },
      actions: [
        { key: 'free', correct: true, effect: { comfort: 4 }, save: 16 },
        { key: 'second', correct: false, effect: { consumption: 5, budget: -5, comfort: 2 } },
        { key: 'leave', correct: false, effect: { comfort: -4 } }
      ]
    },
    {
      id: 'office-printer', object: 'office-printer', zone: 'main', resource: 'waste', load: 5,
      tick: { everyMs: 4000, effect: { kwh: 0.02, budget: -0.5 } },
      actions: [
        { key: 'duplex', correct: true, effect: {}, save: 12 },
        { key: 'ban', correct: false, effect: { comfort: -10 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'office-paper-bin', object: 'office-paper-bin', zone: 'main', resource: 'waste', load: 5,
      tick: { everyMs: 4000, effect: { budget: -0.4 } },
      actions: [
        { key: 'recycle', correct: true, effect: { budget: -3 }, save: 12 },
        { key: 'bigger', correct: false, effect: { budget: -2 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'office-cartridges', object: 'office-cartridges', zone: 'main', resource: 'waste', load: 5,
      tick: { everyMs: 4000, effect: { budget: -0.5 } },
      actions: [
        { key: 'collect', correct: true, effect: { budget: -2 }, save: 12 },
        { key: 'drawer', correct: false, effect: { budget: -1 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'office-coffee', object: 'office-coffee', zone: 'main', resource: 'electricity', load: 5,
      tick: { everyMs: 3000, effect: { kwh: 0.04, budget: -0.4 } },
      actions: [
        { key: 'cup', correct: true, effect: {}, save: 10 },
        { key: 'nocoffee', correct: false, effect: { comfort: -8 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'office-tap', object: 'office-tap', zone: 'main', resource: 'water', load: 5,
      tick: { everyMs: 2000, effect: { liters: 1, budget: -0.4 } },
      actions: [
        { key: 'fix', correct: true, effect: { budget: -3 }, save: 12 },
        { key: 'mug', correct: false, effect: { budget: -1 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'office-chargers', object: 'office-chargers', zone: 'main', resource: 'electricity', load: 4,
      tick: { everyMs: 5000, effect: { kwh: 0.01, budget: -0.2 } },
      actions: [
        { key: 'unplug', correct: true, effect: {}, save: 6 },
        { key: 'tape', correct: false, effect: { budget: -1 } },
        { key: 'leave', correct: false }
      ]
    }
  ],

  // ======================= Уровень: Больница =======================
  // Главная мысль: экономим там, где это НЕ мешает лечению и комфорту пациентов.
  // Неправильные варианты часто «выключить совсем — пациенты потерпят» (бьют по комфорту).
  // Монитор у кровати и холодильник для лекарств — объекты «всё в порядке», в пуле их нет.
  hospital: [
    {
      id: 'hosp-window', object: 'hosp-window', zone: 'main', resource: 'heat', load: 9,
      tick: { everyMs: 2500, effect: { gcal: 0.004, budget: -0.7 } },
      actions: [
        { key: 'airing', correct: true, effect: { comfort: 5 }, save: 16 },
        { key: 'heatoff', correct: false, effect: { comfort: -12 } },
        { key: 'leave', correct: false, effect: { comfort: -4 } }
      ]
    },
    {
      id: 'hosp-door', object: 'hosp-door', zone: 'main', resource: 'heat', load: 7,
      tick: { everyMs: 3000, effect: { gcal: 0.003, budget: -0.5 } },
      actions: [
        { key: 'closer', correct: true, effect: { budget: -3, comfort: 3 }, save: 12 },
        { key: 'lock', correct: false, effect: { comfort: -10 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'hosp-pipes', object: 'hosp-pipes', zone: 'main', resource: 'heat', load: 8,
      tick: { everyMs: 2500, effect: { gcal: 0.004, budget: -0.6 } },
      actions: [
        { key: 'insulate', correct: true, effect: { budget: -6 }, save: 16 },
        { key: 'heatup', correct: false, effect: { consumption: 5, budget: -6 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'hosp-roof', object: 'hosp-roof', zone: 'main', resource: 'heat', load: 6,
      tick: { everyMs: 4000, effect: { gcal: 0.002, budget: -0.4 } },
      actions: [
        { key: 'collectors', correct: true, effect: { budget: -10, comfort: 2 }, save: 18 },
        { key: 'boiler', correct: false, effect: { consumption: 4, budget: -8 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'hosp-office-light', object: 'hosp-office-light', zone: 'main', resource: 'electricity', load: 6,
      tick: { everyMs: 3000, effect: { kwh: 0.05, budget: -0.4 } },
      actions: [
        { key: 'sensor', correct: true, effect: { budget: -4 }, save: 12 },
        { key: 'unscrew', correct: false, effect: { comfort: -8 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'hosp-lamps', object: 'hosp-lamps', zone: 'main', resource: 'electricity', load: 7,
      tick: { everyMs: 2500, effect: { kwh: 0.07, budget: -0.5 } },
      actions: [
        { key: 'led', correct: true, effect: { budget: -8, comfort: 3 }, save: 15 },
        { key: 'off', correct: false, effect: { comfort: -12 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'hosp-lift', object: 'hosp-lift', zone: 'main', resource: 'electricity', load: 6,
      tick: { everyMs: 3000, effect: { kwh: 0.06, budget: -0.5 } },
      actions: [
        { key: 'smart', correct: true, effect: { budget: -5 }, save: 12 },
        { key: 'stop', correct: false, effect: { comfort: -15 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'hosp-tap', object: 'hosp-tap', zone: 'main', resource: 'water', load: 5,
      tick: { everyMs: 2000, effect: { liters: 2, budget: -0.5 } },
      actions: [
        { key: 'repair', correct: true, effect: { budget: -2 }, save: 10 },
        { key: 'nohot', correct: false, effect: { comfort: -10 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'hosp-laundry', object: 'hosp-laundry', zone: 'main', resource: 'water', load: 6,
      tick: { everyMs: 3000, effect: { liters: 3, kwh: 0.03, budget: -0.6 } },
      actions: [
        { key: 'fullload', correct: true, effect: {}, save: 14 },
        { key: 'rarely', correct: false, effect: { comfort: -10 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'hosp-med-waste', object: 'hosp-med-waste', zone: 'main', resource: 'waste', load: 5,
      tick: { everyMs: 4000, effect: { budget: -0.5 } },
      actions: [
        { key: 'special', correct: true, effect: { budget: -3 }, save: 12 },
        { key: 'common', correct: false, effect: { budget: -4, comfort: -8 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'hosp-bins', object: 'hosp-bins', zone: 'main', resource: 'waste', load: 4,
      tick: { everyMs: 4000, effect: { budget: -0.4 } },
      actions: [
        { key: 'separate', correct: true, effect: { budget: -4 }, save: 12 },
        { key: 'bigger', correct: false, effect: { budget: -3 } },
        { key: 'leave', correct: false }
      ]
    }
  ],

  // ======================= Уровень: Завод =======================
  factory: [
    {
      id: 'fac-air-leak', object: 'fac-air-hose', zone: 'main', resource: 'electricity', load: 8,
      tick: { everyMs: 2500, effect: { kwh: 0.08, budget: -0.6 } },
      actions: [
        { key: 'fix', correct: true, effect: { budget: -3 }, save: 16 },
        { key: 'boost', correct: false, effect: { consumption: 5, budget: -5 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'fac-compressor', object: 'fac-compressor', zone: 'main', resource: 'electricity', load: 7,
      tick: { everyMs: 3000, effect: { kwh: 0.07, budget: -0.5 } },
      actions: [
        { key: 'schedule', correct: true, effect: { budget: -3 }, save: 14 },
        { key: 'unplug', correct: false, effect: { comfort: -10 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'fac-conveyor', object: 'fac-conveyor', zone: 'main', resource: 'electricity', load: 6,
      tick: { everyMs: 3000, effect: { kwh: 0.05, budget: -0.4 } },
      actions: [
        { key: 'autostop', correct: true, effect: { budget: -5 }, save: 14 },
        { key: 'manual', correct: false, effect: { comfort: -10 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'fac-skylights', object: 'fac-skylights', zone: 'main', resource: 'electricity', load: 8,
      tick: { everyMs: 2500, effect: { kwh: 0.08, budget: -0.6 } },
      actions: [
        { key: 'clean', correct: true, effect: { budget: -4, comfort: 3 }, save: 16 },
        { key: 'brighter', correct: false, effect: { consumption: 5, budget: -6 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'fac-gate', object: 'fac-gate', zone: 'main', resource: 'heat', load: 9,
      tick: { everyMs: 2500, effect: { gcal: 0.004, budget: -0.7 } },
      actions: [
        { key: 'fastgate', correct: true, effect: { budget: -8, comfort: 6 }, save: 18 },
        { key: 'heaters', correct: false, effect: { consumption: 5, budget: -6 } },
        { key: 'block', correct: false, effect: { comfort: -10 } },
        { key: 'leave', correct: false, effect: { comfort: -4 } }
      ]
    },
    {
      id: 'fac-furnace', object: 'fac-furnace', zone: 'main', resource: 'heat', load: 9,
      tick: { everyMs: 2500, effect: { gcal: 0.004, budget: -0.7 } },
      actions: [
        { key: 'recover', correct: true, effect: { budget: -10 }, save: 20 },
        { key: 'taller', correct: false, effect: { budget: -6 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'fac-pipes', object: 'fac-pipes', zone: 'main', resource: 'heat', load: 7,
      tick: { everyMs: 3000, effect: { gcal: 0.003, budget: -0.6 } },
      actions: [
        { key: 'insulate', correct: true, effect: { budget: -5, comfort: 2 }, save: 16 },
        { key: 'paint', correct: false, effect: { budget: -2 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'fac-cooling', object: 'fac-cooling', zone: 'main', resource: 'water', load: 6,
      tick: { everyMs: 2000, effect: { liters: 3, budget: -0.5 } },
      actions: [
        { key: 'loop', correct: true, effect: { budget: -8 }, save: 16 },
        { key: 'less', correct: false, effect: { comfort: -6, budget: -4 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'fac-scrap', object: 'fac-scrap', zone: 'main', resource: 'waste', load: 5,
      tick: { everyMs: 4000, effect: { budget: -0.5 } },
      actions: [
        { key: 'recycle', correct: true, effect: { budget: -2 }, save: 14 },
        { key: 'landfill', correct: false, effect: { budget: -3 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'fac-pallets', object: 'fac-pallets', zone: 'main', resource: 'waste', load: 4,
      tick: { everyMs: 4000, effect: { budget: -0.4 } },
      actions: [
        { key: 'reuse', correct: true, effect: { budget: -2 }, save: 12 },
        { key: 'bigger', correct: false, effect: { budget: -3 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'fac-fan', object: 'fac-fan', zone: 'main', resource: 'electricity', load: 6,
      tick: { everyMs: 3000, effect: { kwh: 0.06, budget: -0.5 } },
      actions: [
        { key: 'motor', correct: true, effect: { budget: -8, comfort: 3 }, save: 16 },
        { key: 'oil', correct: false, effect: { budget: -2 } },
        { key: 'off', correct: false, effect: { comfort: -10 } },
        { key: 'leave', correct: false }
      ]
    }
  ],

  // ======================= Уровень 8. Мини-город =======================
  city: [
    {
      id: 'street-lamps', object: 'street-lamps', zone: 'main', resource: 'electricity', load: 8,
      tick: { everyMs: 2500, effect: { kwh: 0.1, budget: -0.6 } },
      actions: [
        { key: 'sensor', correct: true, effect: { budget: -6 }, save: 14 },
        { key: 'remove', correct: false, effect: { comfort: -15 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'old-lamp', object: 'old-lamp', zone: 'main', resource: 'electricity', load: 7,
      tick: { everyMs: 2500, effect: { kwh: 0.08, budget: -0.5 } },
      actions: [
        { key: 'led', correct: true, effect: { budget: -8, comfort: 3 }, save: 16 },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'facade', object: 'facade', zone: 'main', resource: 'heat', load: 10,
      tick: { everyMs: 2500, effect: { gcal: 0.004, budget: -0.8 } },
      actions: [
        { key: 'insulate', correct: true, effect: { budget: -12, comfort: 8 }, save: 20 },
        { key: 'heatup', correct: false, effect: { consumption: 5, budget: -6 } },
        { key: 'leave', correct: false, effect: { comfort: -4 } }
      ]
    },
    {
      id: 'heat-pipe', object: 'heat-pipe', zone: 'main', resource: 'heat', load: 9,
      tick: { everyMs: 2500, effect: { gcal: 0.004, budget: -0.7 } },
      actions: [
        { key: 'repair', correct: true, effect: { budget: -4 }, save: 16 },
        { key: 'cover', correct: false, effect: { budget: -2 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'roof', object: 'roof', zone: 'main', resource: 'electricity', load: 6,
      tick: { everyMs: 4000, effect: { kwh: 0.05, budget: -0.4 } },
      actions: [
        { key: 'solar', correct: true, effect: { comfort: 2 }, save: 18, minigame: 'solar' },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'entrance-door', object: 'entrance-door', zone: 'main', resource: 'heat', load: 6,
      tick: { everyMs: 3000, effect: { gcal: 0.002, budget: -0.5 } },
      actions: [
        { key: 'closer', correct: true, effect: { budget: -3, comfort: 3 }, save: 10 },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'stair-light', object: 'stair-light', zone: 'main', resource: 'electricity', load: 5,
      tick: { everyMs: 3000, effect: { kwh: 0.04, budget: -0.4 } },
      actions: [
        { key: 'motion', correct: true, effect: { budget: -4, comfort: 2 }, save: 10 },
        { key: 'off', correct: false, effect: { comfort: -10 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'sprinkler', object: 'sprinkler', zone: 'main', resource: 'water', load: 5,
      tick: { everyMs: 2000, effect: { liters: 3, budget: -0.5 } },
      actions: [
        { key: 'evening', correct: true, effect: {}, save: 10 },
        { key: 'nowater', correct: false, effect: { comfort: -6 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'garbage', object: 'garbage', zone: 'main', resource: 'waste', load: 5,
      tick: { everyMs: 4000, effect: { budget: -0.5 } },
      actions: [
        { key: 'separate', correct: true, effect: { budget: -4 }, save: 14 },
        { key: 'landfill', correct: false, effect: { budget: -3 } },
        { key: 'leave', correct: false }
      ]
    },
    {
      id: 'wind-site', object: 'wind-site', zone: 'main', resource: 'electricity', load: 6,
      tick: { everyMs: 4000, effect: { kwh: 0.05, budget: -0.4 } },
      actions: [
        { key: 'hill', correct: true, effect: { budget: -10 }, save: 16 },
        { key: 'yard', correct: false, effect: { budget: -8, comfort: -5 } },
        { key: 'leave', correct: false }
      ]
    }
  ]
};
