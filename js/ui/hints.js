/*
  hints.js — клики по объектам сцены и подсказки.

  - Клик/тап по объекту сцены (или Enter/пробел, если объект выбран клавишей Tab)
    передаётся в EB.game.onObjectClick.
  - Кнопка «Подсказка» в HUD вызывает EB.game.useHint(): один нерешённый объект
    подсвечивается на EB.config.hintHighlightMs мс (класс is-hinted, стиль в style.css).
    Подсказок на уровень ограниченное число (EB.config.levels.<уровень>.hints).
*/

EB.ui.hints = {
  init: function () {
    var scene = document.getElementById('scene');
    scene.addEventListener('click', function (e) {
      var obj = e.target.closest('.obj');
      if (obj) EB.game.onObjectClick(obj);
    });
    scene.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var obj = e.target.closest('.obj');
      if (obj) {
        e.preventDefault();
        EB.game.onObjectClick(obj);
      }
    });
    // Клавиша H — подсказка
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'h' || e.key === 'р') && EB.screens.current() === 'game' && !e.ctrlKey) EB.game.useHint();
    });
  }
};
