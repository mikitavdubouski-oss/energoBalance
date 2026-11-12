/*
  demo.js — скрытый «режим демо» для записи видео и скриншотов.

  Как включить: открыть index.html?demo=1 (дописать в адресной строке после index.html).
  Можно выбрать уровень: index.html?demo=1&level=school

  Что делает: сам запускает уровень и по очереди решает несколько проблем
  (открывает карточку → выбирает правильное действие → закрывает пояснение),
  с паузами EB.config.demo.stepMs. Сколько проблем — EB.config.demo.solveCount.
  Потом управление переходит к игроку. Прогресс в демо-режиме не сохраняется.
*/

EB.demo = {
  _params: function () {
    var result = {};
    (window.location.search || '').replace(/^\?/, '').split('&').forEach(function (pair) {
      var kv = pair.split('=');
      if (kv[0]) result[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return result;
  },

  isOn: function () {
    return EB.demo._params().demo === '1';
  },

  // Подождать ms миллисекунд, потом выполнить fn
  _wait: function (ms, fn) {
    setTimeout(fn, ms);
  },

  run: function () {
    var levelId = EB.demo._params().level;
    if (EB.config.levelOrder.indexOf(levelId) === -1) levelId = EB.config.levelOrder[0];
    // В демо не портим настоящее сохранение игрока
    EB.save.available = false;
    EB.save.data.progress.unlocked = EB.config.levelOrder.slice();
    document.body.appendChild(EB.utils.el('div', { 'class': 'demo-banner', text: EB.t('demo.banner') }));

    var step = EB.config.demo.stepMs;
    EB.game.start(levelId);
    EB.demo._wait(EB.config.levelIntroMinMs + step, function () {
      EB.game.begin();
      EB.demo._wait(step * 2, function () { EB.demo._solveNext(EB.config.demo.solveCount); });
    });
  },

  // Решить следующую проблему (без мини-игр — их лучше показывать вручную)
  _solveNext: function (left) {
    if (left <= 0 || !EB.game.running) return;
    var step = EB.config.demo.stepMs;
    var list = EB.game.unsolved().filter(function (hs) {
      return hs.actions.some(function (a) { return a.correct && !a.minigame; });
    });
    if (!list.length) return;
    var hs = list[0];
    if (hs.zone !== EB.game.zone && EB.game.level.zones.length > 1) {
      EB.game.showZone(hs.zone);
      EB.ui.hud.setZone(hs.zone);
    }
    var obj = EB.game.objectEl(hs);
    if (obj) obj.classList.add('is-hinted');
    EB.demo._wait(step, function () {
      if (obj) obj.classList.remove('is-hinted');
      EB.game.onObjectClick(obj);
      EB.demo._wait(step, function () {
        var action = hs.actions.filter(function (a) { return a.correct && !a.minigame; })[0];
        var btn = document.querySelector('#card [data-action-key="' + action.key + '"]');
        if (btn) btn.classList.add('is-demo-press');
        EB.demo._wait(step / 2, function () {
          EB.ui.card.choose(action);
          EB.demo._wait(step * 1.5, function () {
            var next = document.getElementById('card-next');
            if (next) next.click();
            EB.demo._wait(step, function () { EB.demo._solveNext(left - 1); });
          });
        });
      });
    });
  }
};
