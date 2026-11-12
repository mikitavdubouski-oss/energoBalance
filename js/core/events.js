/*
  events.js — шина событий и «тикающие» триггеры.

  1) Шина событий: одни части игры сообщают о чём-то, другие подписываются.
     EB.events.on('state:changed', function (data) { ... });   // подписаться
     EB.events.off('state:changed', handler);                    // отписаться
     EB.events.emit('state:changed', {key: 'comfort'});          // сообщить

  2) Триггеры: действие, которое повторяется каждые N миллисекунд, пока его не удалят.
     Пример — открытый кран: каждые 2 с +1 л воды и −1 к бюджету.
       EB.triggers.add('tap', {everyMs: 2000, effect: {liters: 1, budget: -1}});
       EB.triggers.remove('tap');
     effect может быть объектом {ключ: изменение} (применяется через EB.state.change)
     или функцией function () { ... }.

  Пауза: EB.triggers.pause() / resume() — все триггеры замирают и продолжают с того же места.
  Часы тикают раз в EB.config.tickMs мс.
*/

EB.events = {
  _handlers: {},

  on: function (name, handler) {
    (EB.events._handlers[name] = EB.events._handlers[name] || []).push(handler);
  },

  off: function (name, handler) {
    var list = EB.events._handlers[name];
    if (!list) return;
    var i = list.indexOf(handler);
    if (i !== -1) list.splice(i, 1);
  },

  emit: function (name, data) {
    var list = (EB.events._handlers[name] || []).slice();
    list.forEach(function (handler) {
      try {
        handler(data);
      } catch (err) {
        // Ошибка в одном подписчике не должна ломать остальные
        console.error('Ошибка в обработчике события', name, err);
      }
    });
  }
};

EB.triggers = {
  _list: {},        // id → {everyMs, effect, elapsed}
  _timer: null,
  _lastTime: 0,
  paused: false,

  add: function (id, options) {
    EB.triggers._list[id] = {
      everyMs: options.everyMs,
      effect: options.effect,
      reason: options.reason || id,
      elapsed: 0
    };
    EB.triggers._ensureClock();
  },

  remove: function (id) {
    delete EB.triggers._list[id];
  },

  has: function (id) {
    return !!EB.triggers._list[id];
  },

  // Удалить все триггеры (при выходе из уровня или перезапуске)
  clear: function () {
    EB.triggers._list = {};
  },

  pause: function () {
    EB.triggers.paused = true;
  },

  resume: function () {
    EB.triggers.paused = false;
    EB.triggers._lastTime = Date.now(); // чтобы время паузы не засчиталось
  },

  // Запустить «часы», если они ещё не идут
  _ensureClock: function () {
    if (EB.triggers._timer) return;
    EB.triggers._lastTime = Date.now();
    EB.triggers._timer = setInterval(EB.triggers._tick, EB.config.tickMs);
  },

  _tick: function () {
    var now = Date.now();
    var dt = now - EB.triggers._lastTime;
    EB.triggers._lastTime = now;
    if (EB.triggers.paused) return;
    // Если вкладка «спала» долго — не засчитываем огромный скачок времени
    if (dt > 1000) dt = EB.config.tickMs;

    Object.keys(EB.triggers._list).forEach(function (id) {
      var trigger = EB.triggers._list[id];
      if (!trigger) return; // мог удалиться, пока перебирали
      trigger.elapsed += dt;
      while (trigger.elapsed >= trigger.everyMs && EB.triggers._list[id] === trigger) {
        trigger.elapsed -= trigger.everyMs;
        EB.triggers._apply(trigger);
      }
    });
  },

  _apply: function (trigger) {
    if (typeof trigger.effect === 'function') {
      trigger.effect();
      return;
    }
    Object.keys(trigger.effect).forEach(function (key) {
      EB.state.change(key, trigger.effect[key] * EB.config.tickScale, trigger.reason);
    });
  }
};
