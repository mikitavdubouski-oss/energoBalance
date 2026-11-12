/*
  fx.js — короткие визуальные эффекты поверх сцены.

  EB.ui.fx.pop(element)            — объект «подпрыгивает» (проблема решена);
  EB.ui.fx.shake(element)          — объект «трясётся» (ошибка);
  EB.ui.fx.float(element, '+10', 'good' | 'bad') — всплывающая надпись над объектом;
  EB.ui.toast('текст', 'ok' | 'warn', element)   — короткое сообщение (около объекта или сверху).

  Длительности анимаций заданы в css/style.css (классы fx-*), время сообщения — EB.config.toastMs.
*/

EB.ui.fx = {
  // Перезапуск CSS-анимации: снять класс, «перерисовать», поставить снова
  _restart: function (el, className, durationMs) {
    el.classList.remove(className);
    void el.getBoundingClientRect();
    el.classList.add(className);
    setTimeout(function () { el.classList.remove(className); }, durationMs);
  },

  pop: function (el) {
    EB.ui.fx._restart(el, 'fx-pop', 700);
  },

  shake: function (el) {
    EB.ui.fx._restart(el, 'fx-shake', 600);
  },

  // Центр элемента на экране
  _center: function (el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 3 };
  },

  float: function (el, text, kind) {
    var layer = document.getElementById('fx-layer');
    var p = EB.ui.fx._center(el);
    var node = EB.utils.el('div', { 'class': 'fx-float fx-float--' + (kind || 'good'), text: text });
    node.style.left = p.x + 'px';
    node.style.top = p.y + 'px';
    layer.appendChild(node);
    setTimeout(function () { node.remove(); }, 1400);
  }
};

EB.ui.toast = function (text, kind, nearEl) {
  var box = document.getElementById('toasts');
  var node = EB.utils.el('div', {
    'class': 'toast toast--' + (kind || 'ok'),
    html: EB.ui.icon(kind === 'warn' ? 'warn' : 'ok') + '<span></span>'
  });
  node.querySelector('span').textContent = text;
  if (nearEl) {
    var p = EB.ui.fx._center(nearEl);
    node.classList.add('toast--near');
    node.style.left = EB.utils.clamp(p.x, 160, window.innerWidth - 160) + 'px';
    node.style.top = EB.utils.clamp(p.y, 90, window.innerHeight - 80) + 'px';
  }
  box.appendChild(node);
  setTimeout(function () { node.classList.add('is-leaving'); }, EB.config.toastMs);
  setTimeout(function () { node.remove(); }, EB.config.toastMs + 400);
};
