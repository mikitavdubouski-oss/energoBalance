/*
  main.js — запуск игры. Подключается ПОСЛЕДНИМ, когда все остальные файлы уже загружены.

  Порядок запуска:
  1. Загрузить сохранение (прогресс и настройки) — EB.save.load().
  2. Включить язык из настроек и подставить тексты на страницу.
  3. Подготовить экраны и кнопки (init каждого модуля интерфейса).
  4. Показать «Загрузка…» не меньше EB.config.loadingMinMs мс, затем главное меню
     (или сразу демо-режим, если в адресе есть ?demo=1).

  Как менять: если добавляешь новый модуль интерфейса с функцией init — вызови её здесь.
*/

(function () {
  function start() {
    EB.save.load();
    EB.i18n.setLang(EB.save.getSetting('lang'));

    EB.ui.menu.init();
    EB.ui.levelIntro.init();
    EB.ui.pause.init();
    EB.ui.hints.init();
    EB.ui.advisor.init();

    setTimeout(function () {
      if (EB.demo && EB.demo.isOn()) {
        EB.demo.run();
      } else {
        EB.screens.show('menu', { noHistory: true });
      }
    }, EB.config.loadingMinMs);
  }

  // Последний рубеж: если где-то случилась ошибка, пишем её в консоль понятным текстом
  window.addEventListener('error', function (e) {
    console.error('Ошибка в игре:', e.message, 'файл:', e.filename, 'строка:', e.lineno);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
