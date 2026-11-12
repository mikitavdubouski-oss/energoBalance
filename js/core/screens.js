/*
  screens.js — переключение экранов игры с плавным переходом (fade).

  Экран — это блок <section id="screen-ИМЯ" class="screen"> в index.html.
  - EB.screens.show('menu')  — показать экран «menu», текущий запомнить в истории;
  - EB.screens.back()        — вернуться на предыдущий экран;
  - EB.screens.current()     — имя текущего экрана.
  - EB.screens.show('menu', {noHistory: true}) — показать без записи в историю
    (например, при выходе в меню из игры, чтобы «Назад» не вернул в уровень).
  При показе экрана генерируется событие 'screen:shown' с его именем.

  Длительность перехода — EB.config.fadeMs.
*/

EB.screens = {
  _current: null,
  _history: [],

  current: function () {
    return EB.screens._current;
  },

  show: function (name, options) {
    options = options || {};
    var next = document.getElementById('screen-' + name);
    if (!next) {
      console.warn('Нет экрана с именем', name);
      return;
    }
    var prevName = EB.screens._current;
    if (prevName === name) return;
    var prev = prevName ? document.getElementById('screen-' + prevName) : null;

    if (prevName && !options.noHistory) EB.screens._history.push(prevName);
    if (options.clearHistory) EB.screens._history = [];
    EB.screens._current = name;

    // Плавное исчезновение старого и появление нового экрана
    if (prev) {
      prev.classList.remove('is-visible');
      setTimeout(function () {
        // Если за время перехода снова переключили на prev — не прячем его
        if (EB.screens._current !== prevName) prev.classList.remove('is-active');
      }, EB.config.fadeMs);
    }
    next.classList.add('is-active');
    // Двойной кадр нужен, чтобы браузер успел применить display и запустить transition
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        next.classList.add('is-visible');
      });
    });

    // Перенести фокус на первый заголовок/кнопку — удобно для клавиатуры
    var focusTarget = next.querySelector('[data-autofocus]');
    if (focusTarget) setTimeout(function () { focusTarget.focus(); }, EB.config.fadeMs);

    if (EB.events) EB.events.emit('screen:shown', name);
  },

  back: function () {
    var prevName = EB.screens._history.pop();
    if (prevName) EB.screens.show(prevName, { noHistory: true });
  }
};
