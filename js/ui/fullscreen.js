/*
  fullscreen.js — режим «На весь экран» (как F11 на компьютере).

  Что делает:
  - Кнопки с data-action="fullscreen" (в главном меню и в меню паузы) разворачивают игру на весь экран
    и сворачивают обратно. Подпись кнопки меняется сама: «На весь экран» / «Выйти из полного экрана».
  - На Android после разворота пробуем зафиксировать горизонтальную ориентацию
    (браузер разрешает это только в полноэкранном режиме). Не получилось — не страшно,
    тогда работает обычная подсказка «Поверни телефон».
  - Если браузер не умеет полный экран (iPhone — Apple это запрещает сайтам), кнопки скрыты,
    а в меню показывается подсказка: «Поделиться» → «На экран „Домой"» — так игра откроется без панелей браузера.
  - Если игра уже открыта со значка на главном экране (как приложение), кнопка и подсказка не нужны — скрыты.
  - Файл manifest.webmanifest (значок, полный экран, горизонтально — для Android) подключаем,
    только когда игра открыта по адресу http(s)://. При двойном клике по index.html (file://)
    браузер не может его прочитать и писал бы ошибку в консоль.

  Как менять: тексты — ключи fullscreen.* в texts.*.js; значки для главного экрана — assets/icons/.
  Браузерный полный экран включается только по нажатию кнопки (так требуют браузеры), поэтому
  автоматически при запуске игра на весь экран не разворачивается.
*/

EB.ui.fullscreen = {
  // Умеет ли браузер разворачивать страницу (у Safari на iPad — с приставкой webkit)
  supported: function () {
    var el = document.documentElement;
    return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled) &&
      !!(el.requestFullscreen || el.webkitRequestFullscreen);
  },

  isOn: function () {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  },

  // Игра открыта со значка на главном экране телефона (как приложение)
  isStandalone: function () {
    var mq = window.matchMedia && (window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: standalone)').matches);
    return !!(mq || window.navigator.standalone);
  },

  // iPhone / iPod: полного экрана нет, но можно добавить игру на экран «Домой»
  _isIOS: function () {
    return /iPhone|iPod/.test(navigator.userAgent);
  },

  toggle: function () {
    var self = EB.ui.fullscreen;
    try {
      if (self.isOn()) {
        if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        return;
      }
      var el = document.documentElement;
      var p = (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
      // На телефоне — сразу горизонтально (работает в Chrome на Android; в остальных браузерах просто пропускаем)
      if (p && p.then) {
        p.then(self._lockLandscape).catch(function () { /* браузер отказал — остаёмся как есть */ });
      }
    } catch (err) { /* полноэкранный режим недоступен — игра работает и так */ }
  },

  _lockLandscape: function () {
    var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (!touch || !screen.orientation || !screen.orientation.lock) return;
    try {
      var p = screen.orientation.lock('landscape');
      if (p && p.catch) p.catch(function () { /* нельзя зафиксировать — поможет подсказка «Поверни телефон» */ });
    } catch (err) { /* не поддерживается */ }
  },

  // Показать / спрятать кнопки и подсказку, обновить подписи
  sync: function () {
    var self = EB.ui.fullscreen;
    var show = self.supported() && !self.isStandalone();
    var on = self.isOn();
    document.querySelectorAll('[data-action="fullscreen"]').forEach(function (btn) {
      btn.hidden = !show;
      btn.textContent = EB.t(on ? 'fullscreen.off' : 'fullscreen.on');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var hint = document.getElementById('fullscreen-hint');
    if (hint) {
      hint.hidden = show || self.isStandalone() || !self._isIOS();
      hint.textContent = EB.t('fullscreen.iosHint');
    }
  },

  // manifest.webmanifest — только при открытии по адресу http(s)://
  _addManifest: function () {
    if (!/^https?:$/.test(location.protocol) || document.querySelector('link[rel="manifest"]')) return;
    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = 'manifest.webmanifest';
    document.head.appendChild(link);
  },

  init: function () {
    var self = EB.ui.fullscreen;
    self._addManifest();
    EB.ui.menu.actions.fullscreen = self.toggle;
    document.addEventListener('fullscreenchange', self.sync);
    document.addEventListener('webkitfullscreenchange', self.sync);
    EB.events.on('lang:changed', self.sync);
    self.sync();
  }
};
