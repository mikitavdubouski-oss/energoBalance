/*
  game.js — «движок» уровня: общий для квартиры, школы и города.

  Как проходит уровень:
  1. EB.game.start('apartment') — экран загрузки уровня с фактом, потом кнопка «Начать».
  2. EB.game.begin() — рисуем сцену (или несколько зон), случайно выбираем проблемы из пула
     (EB.data.hotspots.<уровень>), включаем их вид «проблема» и тикающие триггеры, запускаем таймер.
  3. Клик/тап по объекту → карточка с действиями (js/ui/modals.js → EB.ui.card).
  4. EB.game.chooseAction(...) — применяем эффект, считаем экономию или ошибку.
  5. Конец: решены все проблемы, вышло время или кончился бюджет → EB.game.end() → экран итогов.

  Пауза: EB.game.pause('причина') / EB.game.resume('причина').
  Причин может быть несколько сразу (меню паузы, открытая карточка, мини-игра) —
  игра продолжится, только когда сняты все.

  События, которые отправляет движок (на них подписаны Советник, звук, HUD):
  game:start, game:correct, game:wrong, game:end, game:zone, game:paused, game:resumed.

  Как менять: новый уровень добавляется файлом в js/levels/ и пулом в js/data/hotspots.js,
  этот файл трогать не нужно.
*/

EB.game = {
  levelId: null,
  level: null,        // описание уровня из js/levels/*.js
  active: [],         // выбранные на этот раз проблемы
  running: false,
  zone: null,         // текущая зона (для уровней с несколькими зонами)
  _pauseReasons: {},
  _ending: false,

  // ---------- Запуск уровня ----------
  start: function (levelId) {
    EB.game.stop();
    EB.game.levelId = levelId;
    EB.game.level = EB.levels[levelId];
    EB.ui.levelIntro.show(levelId);
  },

  begin: function () {
    var levelId = EB.game.levelId;
    var level = EB.game.level;
    var cfg = EB.config.levels[levelId];

    EB.state.reset(levelId);
    EB.game._pauseReasons = {};
    EB.game._ending = false;
    EB.triggers.clear();
    EB.triggers.resume();

    // 1) Рисуем сцену: каждая зона — свой блок с SVG
    var sceneBox = document.getElementById('scene');
    sceneBox.innerHTML = '';
    level.zones.forEach(function (zone) {
      var box = EB.utils.el('div', { 'class': 'zone', 'data-zone': zone.id, html: EB.scenes[zone.scene] || '' });
      sceneBox.appendChild(box);
    });
    // Все объекты сначала «в порядке»
    sceneBox.querySelectorAll('.obj').forEach(function (obj) {
      obj.setAttribute('data-state', 'ok');
      obj.setAttribute('tabindex', '0');            // можно выбрать клавишей Tab
      obj.setAttribute('role', 'button');
    });

    // 2) Случайно выбираем проблемы из пула
    var pool = EB.data.hotspots[levelId] || [];
    var count = EB.utils.randomInt(cfg.problems[0], Math.min(cfg.problems[1], pool.length));
    EB.game.active = EB.utils.pickRandom(pool, count);

    // 3) Включаем вид «проблема», нагрузку на потребление и тиканье
    EB.game.active.forEach(function (hs) {
      var obj = EB.game.objectEl(hs);
      if (obj) obj.setAttribute('data-state', 'problem');
      else console.warn('В сцене нет объекта obj-' + hs.object + ' для проблемы ' + hs.id);
      EB.state.change('consumption', hs.load, hs.id);
      EB.triggers.add('hs:' + hs.id, { everyMs: hs.tick.everyMs, effect: hs.tick.effect, reason: hs.id });
    });
    EB.game.updateObjectLabels();

    // 4) Таймер уровня — тоже триггер, раз в секунду
    EB.triggers.add('timer', {
      everyMs: 1000,
      effect: function () {
        var left = EB.state.get('timeLeft') - 1;
        EB.state.set('timeLeft', Math.max(0, left), 'timer');
        if (left <= 0) EB.game.end('time');
      }
    });

    EB.game.running = true;
    EB.ui.hud.build(level);
    EB.game.showZone(level.zones[0].id);
    EB.screens.show('game', { noHistory: true, clearHistory: true });
    EB.events.emit('game:start', { levelId: levelId, count: count });
  },

  // ---------- Зоны (класс / коридор / столовая) ----------
  showZone: function (zoneId) {
    EB.game.zone = zoneId;
    document.querySelectorAll('#scene .zone').forEach(function (box) {
      box.hidden = box.getAttribute('data-zone') !== zoneId;
    });
    EB.events.emit('game:zone', zoneId);
  },

  // ---------- Поиск объектов и проблем ----------
  objectEl: function (hs) {
    return document.getElementById('obj-' + hs.object);
  },

  hotspotByObject: function (objectId) {
    for (var i = 0; i < EB.game.active.length; i++) {
      if (EB.game.active[i].object === objectId) return EB.game.active[i];
    }
    return null;
  },

  unsolved: function () {
    return EB.game.active.filter(function (hs) { return !EB.state.isSolved(hs.id); });
  },

  // Подписи объектов для экранного диктора (aria-label)
  updateObjectLabels: function () {
    document.querySelectorAll('#scene .obj').forEach(function (obj) {
      var name = obj.id.replace(/^obj-/, '');
      obj.setAttribute('aria-label', EB.t('obj.' + name));
    });
  },

  // ---------- Клик по объекту ----------
  onObjectClick: function (objEl) {
    if (!EB.game.running || EB.game.isPaused()) return;
    var objectId = objEl.id.replace(/^obj-/, '');
    var hs = EB.game.hotspotByObject(objectId);
    EB.audio.play(hs && hs.resource === 'water' && !EB.state.isSolved(hs.id) ? 'water' : 'click');
    if (!hs) {
      // Здесь проблемы нет — всё в порядке (ложная тревога, без штрафа)
      EB.ui.toast(EB.t('game.allGood', { name: EB.t('obj.' + objectId) }), 'ok', objEl);
      return;
    }
    if (EB.state.isSolved(hs.id)) {
      EB.ui.toast(EB.t('game.alreadySolved'), 'ok', objEl);
      return;
    }
    EB.ui.card.show(hs);
  },

  // ---------- Выбор действия ----------
  // Возвращает {correct, hs, action} — карточка показывает по нему пояснение.
  chooseAction: function (hs, action, done) {
    if (!EB.game.running || EB.state.isSolved(hs.id)) return;
    if (action.minigame) {
      EB.game.pause('minigame');
      EB.ui.minigame.open(action.minigame, function (result) {
        EB.game.resume('minigame');
        var quality = EB.utils.clamp(result.quality, 0, 1);
        var good = quality >= EB.config.minigameGoodQuality;
        // scoreFactor — множитель очков (например, лёгкий уровень сортировки даёт меньше очков)
        var factor = result.scoreFactor || 1;
        EB.game._applyResult(hs, action, good, quality, factor);
        if (done) done({ correct: good, hs: hs, action: action, quality: quality, factor: factor });
      });
      return;
    }
    EB.game._applyResult(hs, action, !!action.correct, 1);
    if (done) done({ correct: !!action.correct, hs: hs, action: action, quality: 1 });
  },

  _applyResult: function (hs, action, correct, quality, factor) {
    factor = factor || 1;
    var effect = action.effect || (action.correct ? {} : EB.config.wrongActionDefault);
    Object.keys(effect).forEach(function (key) {
      // Хорошие эффекты мини-игры масштабируются качеством прохождения
      var k = action.minigame && effect[key] > 0 ? quality : 1;
      EB.state.change(key, effect[key] * k, hs.id);
    });
    var obj = EB.game.objectEl(hs);

    // Мини-игра считается решением проблемы при любом результате (игрок её настроил),
    // а обычное неправильное действие оставляет проблему активной.
    if (correct || action.minigame) {
      EB.triggers.remove('hs:' + hs.id);
      EB.state.change('consumption', -hs.load, hs.id);
      EB.state.addSaved(hs.resource, (action.save || 0) * quality * factor);
      EB.state.markSolved(hs.id);
      if (obj) {
        obj.setAttribute('data-state', 'ok');
        EB.ui.fx.pop(obj);
      }
    }
    if (correct) {
      EB.audio.play('correct');
      if (obj) EB.ui.fx.float(obj, '✔ +' + Math.round((action.save || 0) * quality * factor), 'good');
      EB.events.emit('game:correct', { hs: hs, action: action });
    } else {
      EB.state.addMistake(hs.id, action.key);
      EB.audio.play('error');
      if (obj) {
        EB.ui.fx.shake(obj);
        EB.ui.fx.float(obj, '✘', 'bad');
      }
      EB.events.emit('game:wrong', { hs: hs, action: action });
    }
  },

  // Вызывается после закрытия карточки с пояснением — проверяем, не пора ли заканчивать
  checkEnd: function () {
    if (!EB.game.running) return;
    if (EB.game.unsolved().length === 0) EB.game.end('done');
  },

  // ---------- Подсказка ----------
  useHint: function () {
    if (!EB.game.running || EB.game.isPaused()) return;
    if (EB.state.get('hintsLeft') <= 0) {
      EB.ui.toast(EB.t('game.noHints'), 'warn');
      return;
    }
    var list = EB.game.unsolved();
    if (!list.length) return;
    // Сначала ищем в текущей зоне, иначе переключаемся в зону с проблемой
    var inZone = list.filter(function (hs) { return hs.zone === EB.game.zone || EB.game.level.zones.length === 1; });
    var hs = (inZone.length ? inZone : list)[EB.utils.randomInt(0, (inZone.length ? inZone : list).length - 1)];
    if (EB.game.level.zones.length > 1 && hs.zone !== EB.game.zone) {
      EB.game.showZone(hs.zone);
      EB.ui.hud.setZone(hs.zone);
    }
    EB.state.change('hintsLeft', -1, 'hint');
    EB.audio.play('hint');
    var obj = EB.game.objectEl(hs);
    if (obj) {
      obj.classList.add('is-hinted');
      setTimeout(function () { obj.classList.remove('is-hinted'); }, EB.config.hintHighlightMs);
    }
  },

  // ---------- Пауза ----------
  pause: function (reason) {
    var wasPaused = EB.game.isPaused();
    EB.game._pauseReasons[reason || 'menu'] = true;
    EB.triggers.pause();
    EB.game._svgAnimations(false);
    if (!wasPaused) EB.events.emit('game:paused', reason);
  },

  resume: function (reason) {
    delete EB.game._pauseReasons[reason || 'menu'];
    if (!EB.game.isPaused()) {
      EB.triggers.resume();
      EB.game._svgAnimations(true);
      EB.events.emit('game:resumed', reason);
    }
  },

  isPaused: function () {
    return Object.keys(EB.game._pauseReasons).length > 0;
  },

  // Остановить/продолжить SMIL-анимации в сценах (капли, пар и т.п.)
  _svgAnimations: function (play) {
    document.querySelectorAll('#scene svg').forEach(function (svg) {
      try {
        if (play) svg.unpauseAnimations(); else svg.pauseAnimations();
      } catch (err) { /* старые браузеры — не страшно */ }
    });
  },

  // ---------- Конец уровня ----------
  end: function (reason) {
    if (!EB.game.running || EB.game._ending) return;
    EB.game._ending = true;
    EB.game.running = false;
    EB.triggers.clear();
    EB.ui.card.hide();

    var result = EB.scoring.compute(EB.game.levelId, EB.state.data, EB.game.active, reason);
    EB.save.recordLevel(EB.game.levelId, result);   // автосохранение
    EB.events.emit('game:end', result);
    EB.audio.play(result.stars > 0 ? 'win' : 'error');

    setTimeout(function () {
      EB.ui.results.show(result);
    }, EB.config.endDelayMs);
  },

  restart: function () {
    var id = EB.game.levelId;
    EB.game.stop();
    EB.game.start(id);
  },

  // Полностью остановить уровень без подсчёта очков (выход в меню, перезапуск)
  stop: function () {
    EB.game.running = false;
    EB.game._ending = false;
    EB.game._pauseReasons = {};
    EB.triggers.clear();
    EB.triggers.resume();
    if (EB.ui.card) EB.ui.card.hide();
    if (EB.ui.minigame) EB.ui.minigame.close();
    if (EB.ui.pause) EB.ui.pause.hide();
  }
};

// Конец уровня, если кончился бюджет
EB.events.on('state:changed', function (e) {
  if (e.key === 'budget' && e.value <= 0 && EB.config.budgetZeroEndsLevel && EB.game.running) {
    EB.game.end('budget');
  }
});
