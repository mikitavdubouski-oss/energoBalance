/*
  save.js — сохранение прогресса и настроек в localStorage браузера.

  Каждое открытие игры — НОВЫЙ ИГРОК (новая сессия): эко-коины, звёзды и открытые уровни
  обнуляются, начинать нужно с квартиры. Так честно для соревнования в классе.
  Постоянно хранятся только рекорды уровней и настройки.

  Что сохраняем (EB.save.data):
  - progress.unlocked   — открытые в этой сессии уровни, например ['apartment', 'school'];
  - progress.stars      — лучшие звёзды по уровням в этой сессии {apartment: 2};
  - progress.levelCoins — лучшие эко-коины по уровням в этой сессии {apartment: 17};
  - progress.ecoCoins   — эко-коины игрока за сессию (сумма levelCoins: переигрывание уровня
                          не накручивает монеты, в зачёт идёт лучший результат уровня);
  - progress.levelScores — лучшие очки по уровням в этой сессии (общий счёт в финале);
  - progress.best       — рекорды очков по уровням за всё время (не обнуляются при открытии);
  - settings            — звук, музыка, голос, язык (см. EB.config.defaultSettings).

  Когда сохраняем: при завершении уровня и при смене настроек (автоматически).
  Если localStorage недоступен (приватный режим, запрет браузера) — игра просто
  работает без сохранения и не падает: все обращения обёрнуты в try/catch.

  Как менять: если меняешь формат данных — увеличь номер в KEY (…v2),
  тогда старые сохранения не сломают игру.
*/

EB.save = {
  KEY: 'energobalans.save.v1',
  available: false,
  data: null,

  // Пустое сохранение «по умолчанию»
  _defaults: function () {
    return {
      progress: {
        unlocked: [EB.config.levelOrder[0]],
        best: {},
        stars: {},
        levelCoins: {},
        levelScores: {},
        ecoCoins: 0
      },
      settings: Object.assign({}, EB.config.defaultSettings)
    };
  },

  // Проверить, можно ли пользоваться localStorage
  _check: function () {
    try {
      var test = '__eb_test__';
      window.localStorage.setItem(test, '1');
      window.localStorage.removeItem(test);
      return true;
    } catch (err) {
      return false;
    }
  },

  load: function () {
    EB.save.available = EB.save._check();
    var data = EB.save._defaults();
    if (EB.save.available) {
      try {
        var raw = window.localStorage.getItem(EB.save.KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          // Аккуратно объединяем, чтобы новые поля из _defaults не потерялись
          data.progress = Object.assign(data.progress, parsed.progress || {});
          data.settings = Object.assign(data.settings, parsed.settings || {});
        }
      } catch (err) {
        console.warn('Сохранение повреждено, начинаем заново', err);
      }
    }
    EB.save.data = data;
    EB.save.newSession();
    return data;
  },

  // Новая сессия (новый игрок): обнуляем монеты, звёзды и открытые уровни. Рекорды и настройки остаются.
  newSession: function () {
    var p = EB.save.data.progress;
    var fresh = EB.save._defaults().progress;
    p.unlocked = fresh.unlocked;
    p.stars = fresh.stars;
    p.levelCoins = fresh.levelCoins;
    p.levelScores = fresh.levelScores;
    p.ecoCoins = 0;
    EB.save.write();
  },

  write: function () {
    if (!EB.save.available) return false;
    try {
      window.localStorage.setItem(EB.save.KEY, JSON.stringify(EB.save.data));
      return true;
    } catch (err) {
      console.warn('Не удалось сохранить игру', err);
      return false;
    }
  },

  // Есть ли что продолжать: в этой сессии пройден хотя бы один уровень
  hasProgress: function () {
    return Object.keys(EB.save.data.progress.stars).length > 0;
  },

  isUnlocked: function (levelId) {
    return EB.save.data.progress.unlocked.indexOf(levelId) !== -1;
  },

  // Записать результат уровня и открыть следующий
  recordLevel: function (levelId, result) {
    var p = EB.save.data.progress;
    if (!p.best[levelId] || result.score > p.best[levelId]) p.best[levelId] = result.score;
    if (!p.stars[levelId] || result.stars > p.stars[levelId]) p.stars[levelId] = result.stars;
    // Эко-коины: за уровень засчитывается лучший результат этой сессии
    var before = p.ecoCoins;
    if (!p.levelCoins[levelId] || result.coins > p.levelCoins[levelId]) p.levelCoins[levelId] = result.coins;
    p.ecoCoins = Object.keys(p.levelCoins).reduce(function (sum, id) { return sum + p.levelCoins[id]; }, 0);
    result.coinsAdded = p.ecoCoins - before;   // сколько монет реально прибавилось к сумме
    result.coinsTotal = p.ecoCoins;
    // Лучшие очки уровня в этой сессии (для общего счёта в финале)
    if (!p.levelScores[levelId] || result.score > p.levelScores[levelId]) p.levelScores[levelId] = result.score;
    var next = EB.save.nextLevel(levelId);
    if (next && result.stars > 0 && p.unlocked.indexOf(next) === -1) p.unlocked.push(next);
    EB.save.write();
  },

  // Следующий уровень по порядку (или null, если это последний)
  nextLevel: function (levelId) {
    var order = EB.config.levelOrder;
    var i = order.indexOf(levelId);
    return i >= 0 && i < order.length - 1 ? order[i + 1] : null;
  },

  // Какой уровень предложить по кнопке «Продолжить»: первый без звёзд или последний открытый
  continueLevel: function () {
    var p = EB.save.data.progress;
    var order = EB.config.levelOrder;
    for (var i = 0; i < order.length; i++) {
      if (p.unlocked.indexOf(order[i]) !== -1 && !p.stars[order[i]]) return order[i];
    }
    return p.unlocked[p.unlocked.length - 1];
  },

  allCompleted: function () {
    var p = EB.save.data.progress;
    return EB.config.levelOrder.every(function (id) { return p.stars[id] > 0; });
  },

  setSetting: function (name, value) {
    EB.save.data.settings[name] = value;
    EB.save.write();
    EB.events.emit('settings:changed', { name: name, value: value });
  },

  getSetting: function (name) {
    return EB.save.data.settings[name];
  },

  // Сбросить прогресс и рекорды (настройки оставляем)
  resetProgress: function () {
    EB.save.data.progress = EB.save._defaults().progress;
    EB.save.write();
  }
};
