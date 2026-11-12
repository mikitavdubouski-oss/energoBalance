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
  - zone      — зона уровня (для школы: class / corridor / canteen; для остальных — main)
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

  // ======================= Уровень 2. Школа =======================
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

  // ======================= Уровень 3. Мини-город =======================
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
