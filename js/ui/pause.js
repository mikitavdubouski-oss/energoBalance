/*
  pause.js — меню паузы: Продолжить / Перезапустить уровень / Настройки / В главное меню.

  Пауза останавливает триггеры, таймер и анимации сцены (EB.game.pause('menu')).
  Клавиша Esc открывает и закрывает паузу. Если вкладку свернуть, игра встаёт на паузу сама.
*/

EB.ui.pause = {
  show: function () {
    if (!EB.game.running) return;
    EB.game.pause('menu');
    var layer = document.getElementById('pause-layer');
    layer.hidden = false;
    layer.querySelector('[data-action="resume"]').focus();
  },

  hide: function () {
    var layer = document.getElementById('pause-layer');
    if (layer.hidden) return;
    layer.hidden = true;
    EB.game.resume('menu');
  },

  isOpen: function () {
    return !document.getElementById('pause-layer').hidden;
  },

  init: function () {
    // Кнопки паузы (resume, restart) — через общий обработчик data-action из menu.js
    EB.ui.menu.actions.resume = function () { EB.ui.pause.hide(); };
    EB.ui.menu.actions.restart = function () {
      EB.ui.modal.confirm(EB.t('pause.restartConfirm'), function () { EB.game.restart(); });
    };

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (EB.ui.modal.isOpen()) { EB.ui.modal.cancel(); return; }
      if (EB.screens.current() !== 'game' || !EB.game.running) return;
      if (EB.ui.minigame.isOpen()) return;
      if (EB.ui.card.isOpen()) { EB.ui.card.hide(); return; }
      if (EB.ui.pause.isOpen()) EB.ui.pause.hide(); else EB.ui.pause.show();
    });

    // Свернули вкладку — пауза, чтобы проблемы не «тикали» без игрока
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && EB.game.running && EB.screens.current() === 'game') EB.ui.pause.show();
    });
  }
};
