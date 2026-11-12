/*
  debug.js — отладочные команды для консоли браузера (F12 → Console).

  Работают, только если в js/core/config.js стоит debug: true.
  В сборке для конкурса debug: false — команды не создаются.

  Команды:
    EB.debug.state()      — показать текущее состояние (шкалы, счётчики, решённые проблемы)
    EB.debug.problems()   — какие проблемы выбраны на этом уровне и где они
    EB.debug.solveAll()   — решить все проблемы правильно (проверка экрана итогов)
    EB.debug.time(5)      — оставить 5 секунд до конца уровня
    EB.debug.unlockAll()  — открыть все уровни
*/

if (EB.config.debug) {
  EB.debug = {
    state: function () {
      var d = EB.state.data;
      console.table({
        level: d.level, consumption: d.consumption, budget: d.budget, comfort: d.comfort,
        kwh: d.kwh, liters: d.liters, gcal: d.gcal, errors: d.errors, hintsLeft: d.hintsLeft, timeLeft: d.timeLeft
      });
      console.log('Решено:', d.solved, 'Сэкономлено:', d.saved, 'Ошибки:', d.mistakes);
      return d;
    },
    problems: function () {
      console.table(EB.game.active.map(function (hs) {
        return { id: hs.id, object: hs.object, zone: hs.zone, solved: EB.state.isSolved(hs.id) };
      }));
    },
    solveAll: function () {
      EB.game.unsolved().forEach(function (hs) {
        var best = hs.actions.filter(function (a) { return a.correct && !a.minigame; })[0] ||
          hs.actions.filter(function (a) { return a.correct; })[0];
        EB.game._applyResult(hs, best, true, 1);
      });
      EB.game.checkEnd();
    },
    time: function (sec) {
      EB.state.set('timeLeft', sec, 'debug');
    },
    unlockAll: function () {
      EB.save.data.progress.unlocked = EB.config.levelOrder.slice();
      EB.save.write();
    }
  };
  console.log('Отладка включена: EB.debug.state(), EB.debug.problems(), EB.debug.solveAll(), EB.debug.time(5), EB.debug.unlockAll()');
}
