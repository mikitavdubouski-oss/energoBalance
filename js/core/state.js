/*
  state.js — состояние текущей партии: уровень, шкалы и счётчики.

  Что хранится в EB.state.data:
  - level         — id текущего уровня ('apartment', 'school', 'city');
  - consumption   — шкала «Потребление» 0..100 (чем меньше, тем лучше);
  - budget        — шкала «Бюджет» 0..100 (условные единицы, в минус не уходит);
  - comfort       — шкала «Комфорт» 0..100;
  - kwh, gcal, liters — сколько электроэнергии, тепла и воды потрачено впустую (условные единицы);
  - ecoCoins      — эко-коины, заработанные на уровне;
  - errors        — число ошибок;
  - hintsLeft     — сколько подсказок осталось;
  - timeLeft      — сколько секунд осталось;
  - solved        — список id решённых проблем;
  - saved         — сэкономлено по ресурсам {electricity, heat, water, waste} (очки экономии);
  - mistakes      — список ошибок [{hotspot, action}] для персональных советов.

  ПРАВИЛО: менять состояние только через функции ниже, например
    EB.state.change('comfort', -5, 'лампа выключена');
  Каждое изменение генерирует событие 'state:changed' {key, value, delta, reason} —
  на него подписаны HUD, Советник и проверка конца уровня.
*/

EB.state = {
  data: {},

  // Ключи, которые всегда держим в пределах 0..100
  SCALES: ['consumption', 'budget', 'comfort'],

  // Начать уровень с чистого листа
  reset: function (levelId) {
    var cfg = EB.config.levels[levelId] || {};
    EB.state.data = {
      level: levelId,
      consumption: EB.config.start.consumptionBase,
      budget: EB.config.start.budget,
      comfort: EB.config.start.comfort,
      kwh: 0,
      gcal: 0,
      liters: 0,
      ecoCoins: 0,
      errors: 0,
      hintsLeft: cfg.hints || 0,
      timeLeft: cfg.timeSec || 0,
      solved: [],
      saved: { electricity: 0, heat: 0, water: 0, waste: 0 },
      mistakes: []
    };
    EB.events.emit('state:reset', EB.state.data);
  },

  get: function (key) {
    return EB.state.data[key];
  },

  // Изменить число на delta (можно отрицательное). Шкалы не выходят за 0..100.
  change: function (key, delta, reason) {
    var d = EB.state.data;
    if (typeof d[key] !== 'number') {
      console.warn('EB.state.change: неизвестный ключ', key);
      return;
    }
    var old = d[key];
    var value = old + delta;
    if (EB.state.SCALES.indexOf(key) !== -1) {
      value = EB.utils.clamp(value, EB.config.scaleMin, EB.config.scaleMax);
    } else if (value < 0) {
      value = 0;
    }
    d[key] = value;
    if (value !== old) {
      EB.events.emit('state:changed', { key: key, value: value, delta: value - old, reason: reason });
    }
  },

  // Установить значение напрямую (для таймера и подсказок)
  set: function (key, value, reason) {
    var old = EB.state.data[key];
    EB.state.data[key] = value;
    EB.events.emit('state:changed', { key: key, value: value, delta: value - old, reason: reason });
  },

  // Записать сэкономленное по ресурсу
  addSaved: function (resource, amount) {
    EB.state.data.saved[resource] = (EB.state.data.saved[resource] || 0) + amount;
    EB.events.emit('state:changed', { key: 'saved', value: EB.state.data.saved, delta: amount, reason: resource });
  },

  markSolved: function (hotspotId) {
    if (EB.state.data.solved.indexOf(hotspotId) === -1) {
      EB.state.data.solved.push(hotspotId);
      EB.events.emit('state:changed', { key: 'solved', value: EB.state.data.solved, delta: 1, reason: hotspotId });
    }
  },

  isSolved: function (hotspotId) {
    return EB.state.data.solved.indexOf(hotspotId) !== -1;
  },

  addMistake: function (hotspotId, actionKey) {
    EB.state.data.mistakes.push({ hotspot: hotspotId, action: actionKey });
    EB.state.change('errors', 1, hotspotId);
  }
};
