/*
  sorting.js — мини-игра «Сортировка отходов» (уровень «Школа», столовая).

  Предметы падают сверху. Игрок перетаскивает их (мышью или пальцем) в нужный контейнер.
  Второй способ (для касания и клавиатуры): нажми на предмет — он выделится, потом нажми на контейнер.
  Ошибка — показываем пояснение (waste.<id>.why). Предмет упал на пол — «пропущен».
  В начале игрок выбирает сложность: лёгкий / средний / сложный.
  Чем сложнее, тем больше предметов и выше скорость, но и очков больше (множитель points).
  Внутри игры скорость растёт со временем. Все числа — EB.config.minigames.sorting.levels.
  Данные предметов и контейнеров — js/data/waste.js.

  Итог: quality = правильно рассортированные / все показанные предметы (точность),
        scoreFactor = множитель очков выбранной сложности.
*/

EB.minigames.sorting = {
  // Значок: эмодзи или картинка (если в waste.js указан путь к файлу .svg/.png)
  _icon: function (icon) {
    if (/\.(svg|png|jpg|webp)$/i.test(icon)) return '<img src="' + icon + '" alt="" draggable="false">';
    return icon;
  },

  start: function (box, options) {
    var self = this;
    self._box = box;
    self._options = options;
    self._L = null;       // выбранная сложность (настройки из config.js)
    self._queue = [];
    self._falling = [];   // {item, el, y}
    self._stats = { correct: 0, wrong: 0, missed: 0, shown: 0 };
    self._elapsed = 0;
    self._spawnIn = 0;
    self._selected = null;
    self._finished = false;
    self._renderIntro();
  },

  stop: function () {
    cancelAnimationFrame(this._raf);
    this._raf = null;
    this._finished = true;
  },

  // Правила и выбор сложности
  _renderIntro: function () {
    var self = this;
    var levels = EB.config.minigames.sorting.levels;
    var cards = Object.keys(levels).map(function (key) {
      var L = levels[key];
      return '<button class="sort-level" data-level="' + key + '">' +
        '<b>' + EB.t('mg.sort.level.' + key) + '</b>' +
        '<span>' + EB.t('mg.sort.level.items', { n: Math.min(L.items, EB.data.waste.items.length) }) + '</span>' +
        '<span>' + EB.t('mg.sort.level.speed.' + key) + '</span>' +
        '<span>' + EB.t('mg.sort.level.points', { n: Math.round(L.points * 100) }) + '</span>' +
        '</button>';
    }).join('');
    self._box.innerHTML =
      '<h2 class="minigame__title">' + EB.t('mg.sort.title') + '</h2>' +
      '<p class="minigame__text">' + EB.t('mg.sort.rules') + '</p>' +
      '<p class="minigame__step">' + EB.t('mg.sort.chooseLevel') + '</p>' +
      '<div class="sort-levels">' + cards + '</div>';
    self._box.querySelectorAll('[data-level]').forEach(function (b) {
      b.addEventListener('click', function () {
        EB.audio.play('click');
        self._L = levels[b.getAttribute('data-level')];
        self._levelKey = b.getAttribute('data-level');
        self._queue = EB.utils.shuffle(EB.data.waste.items).slice(0, self._L.items);
        self._renderGame();
      });
    });
    self._box.querySelector('[data-level]').focus();
  },

  _renderGame: function () {
    var self = this;
    var bins = EB.data.waste.bins.map(function (b) {
      return '<button class="bin" data-bin="' + b.id + '" style="--bin-color:' + b.color + '">' +
        '<span class="bin__icon" aria-hidden="true">' + self._icon(b.icon) + '</span>' +
        '<span class="bin__label">' + EB.t('waste.bin.' + b.id) + '</span></button>';
    }).join('');
    self._box.innerHTML =
      '<div class="sort__top"><h2 class="minigame__title">' + EB.t('mg.sort.title') + ' · ' + EB.t('mg.sort.level.' + self._levelKey) + '</h2>' +
      '<span class="sort__stat">' + EB.ui.icon('timer') + '<b data-s="time"></b></span>' +
      '<span class="sort__stat">' + EB.ui.icon('check') + '<b data-s="ok"></b></span></div>' +
      '<div class="sort__field" aria-live="polite"></div>' +
      '<p class="minigame__feedback sort__msg"></p>' +
      '<div class="sort__bins">' + bins + '</div>';
    self._field = self._box.querySelector('.sort__field');

    self._box.querySelectorAll('.bin').forEach(function (binEl) {
      binEl.addEventListener('click', function () {
        if (self._selected) self._drop(self._selected, binEl.getAttribute('data-bin'));
      });
    });

    self._last = performance.now();
    self._raf = requestAnimationFrame(function loop(now) {
      if (self._finished) return;
      self._update(Math.min(now - self._last, 100));
      self._last = now;
      if (!self._finished) self._raf = requestAnimationFrame(loop);
    });
  },

  // Доля прошедшего времени 0..1 — от неё зависит скорость
  _progress: function () {
    return EB.utils.clamp(this._elapsed / (this._L.durationSec * 1000), 0, 1);
  },

  _update: function (dt) {
    var self = this;
    var cfg = self._L;   // настройки выбранной сложности
    self._elapsed += dt;
    var p = self._progress();

    // Новый предмет
    self._spawnIn -= dt;
    if (self._spawnIn <= 0 && self._queue.length && p < 1) {
      self._spawn(self._queue.shift());
      self._spawnIn = cfg.spawnEveryMs[0] + (cfg.spawnEveryMs[1] - cfg.spawnEveryMs[0]) * p;
    }

    // Падение
    var fieldH = self._field.clientHeight;
    // Скорость пропорциональна высоте поля: на маленьком экране предмет падает столько же секунд
    var speed = (cfg.fallSpeed[0] + (cfg.fallSpeed[1] - cfg.fallSpeed[0]) * p) * fieldH / EB.config.minigames.sorting.fieldRefPx;
    self._falling.slice().forEach(function (f) {
      if (f.dragging) return;
      f.y += speed * dt / 1000;
      f.el.style.top = f.y + 'px';
      if (f.y > fieldH - 40) {
        self._remove(f);
        self._stats.missed++;
        self._message(EB.t('mg.sort.missed', { name: EB.t('waste.' + f.item.id) }), false);
      }
    });

    var left = Math.max(0, Math.ceil(cfg.durationSec - self._elapsed / 1000));
    self._box.querySelector('[data-s="time"]').textContent = left;
    self._box.querySelector('[data-s="ok"]').textContent = self._stats.correct + ' / ' + self._stats.shown;

    var outOfItems = !self._queue.length && !self._falling.length;
    if (p >= 1 || outOfItems) {
      // Время вышло: оставшиеся на поле предметы считаем пропущенными
      self._falling.slice().forEach(function (f) { self._remove(f); self._stats.missed++; });
      self._finish();
    }
  },

  _spawn: function (item) {
    var self = this;
    var el = EB.utils.el('button', { 'class': 'waste-item', 'aria-label': EB.t('waste.' + item.id) });
    el.innerHTML = '<span class="waste-item__icon" aria-hidden="true">' + self._icon(item.icon) + '</span><span class="waste-item__name"></span>';
    el.querySelector('.waste-item__name').textContent = EB.t('waste.' + item.id);
    var fieldW = self._field.clientWidth;
    var f = { item: item, el: el, y: -10, dragging: false };
    el.style.left = EB.utils.randomInt(10, Math.max(10, fieldW - 150)) + 'px';
    el.style.top = '-10px';
    self._field.appendChild(el);
    self._falling.push(f);
    self._stats.shown++;

    // Перетаскивание
    var startX = 0, startY = 0, moved = false;
    el.addEventListener('pointerdown', function (e) {
      f.dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.classList.add('is-dragging');
    });
    el.addEventListener('pointermove', function (e) {
      if (!f.dragging) return;
      if (Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) > 6) moved = true;
      if (!moved) return;
      var r = self._field.getBoundingClientRect();
      el.style.left = (e.clientX - r.left - el.offsetWidth / 2) + 'px';
      el.style.top = (e.clientY - r.top - el.offsetHeight / 2) + 'px';
      self._highlightBin(e.clientX, e.clientY);
    });
    el.addEventListener('pointerup', function (e) {
      if (!f.dragging) return;
      f.dragging = false;
      el.classList.remove('is-dragging');
      self._highlightBin(-1, -1);
      if (!moved) {
        // Простое нажатие — выделить предмет (потом нажать на контейнер)
        self._select(f);
        return;
      }
      var bin = self._binAt(e.clientX, e.clientY);
      if (bin) {
        self._drop(f, bin);
      } else {
        f.y = parseFloat(el.style.top) || f.y; // отпустили мимо — падает дальше отсюда
      }
    });
    el.addEventListener('pointercancel', function () { f.dragging = false; el.classList.remove('is-dragging'); });
    // Клавиатура: Enter/пробел на предмете — выделить его (detail === 0 значит «нажато не мышью»)
    el.addEventListener('click', function (e) { if (e.detail === 0) self._select(f); });
  },

  _select: function (f) {
    if (this._selected) this._selected.el.classList.remove('is-selected');
    this._selected = f;
    f.el.classList.add('is-selected');
    EB.audio.play('click');
  },

  _binAt: function (x, y) {
    var found = null;
    this._box.querySelectorAll('.bin').forEach(function (b) {
      var r = b.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top - 30 && y <= r.bottom) found = b.getAttribute('data-bin');
    });
    return found;
  },

  _highlightBin: function (x, y) {
    var id = this._binAt(x, y);
    this._box.querySelectorAll('.bin').forEach(function (b) {
      b.classList.toggle('is-over', b.getAttribute('data-bin') === id);
    });
  },

  _drop: function (f, binId) {
    this._remove(f);
    if (f.item.bin === binId) {
      this._stats.correct++;
      EB.audio.play('correct');
      this._message(EB.t('mg.sort.right', { name: EB.t('waste.' + f.item.id) }), true);
    } else {
      this._stats.wrong++;
      EB.audio.play('error');
      this._message(EB.t('waste.' + f.item.id + '.why'), false);
    }
  },

  _remove: function (f) {
    var i = this._falling.indexOf(f);
    if (i !== -1) this._falling.splice(i, 1);
    if (this._selected === f) this._selected = null;
    f.el.remove();
  },

  _message: function (text, good) {
    var msg = this._box.querySelector('.sort__msg');
    if (!msg) return;
    msg.textContent = text;
    msg.className = 'minigame__feedback sort__msg is-' + (good ? 'good' : 'bad');
  },

  _finish: function () {
    var self = this;
    if (self._finished) return;
    self.stop();
    var s = self._stats;
    var quality = s.shown ? s.correct / s.shown : 0;
    self._box.innerHTML =
      '<h2 class="minigame__title">' + EB.t('mg.sort.done') + '</h2>' +
      '<ul class="sort__summary">' +
        '<li>' + EB.ui.icon('ok') + EB.t('mg.sort.statOk', { n: s.correct }) + '</li>' +
        '<li>' + EB.ui.icon('warn') + EB.t('mg.sort.statWrong', { n: s.wrong }) + '</li>' +
        '<li>' + EB.ui.icon('info') + EB.t('mg.sort.statMissed', { n: s.missed }) + '</li>' +
        '<li>' + EB.ui.icon('star') + EB.t('mg.sort.statPoints', { level: EB.t('mg.sort.level.' + self._levelKey), n: Math.round(self._L.points * 100) }) + '</li>' +
      '</ul>' +
      '<p class="minigame__text">' + EB.t('mg.sort.lesson') + '</p>' +
      '<div class="panel__buttons"><button class="btn btn--primary btn--small" data-mg="done">' + EB.t('mg.finish') + '</button></div>';
    var btn = self._box.querySelector('[data-mg="done"]');
    btn.focus();
    btn.addEventListener('click', function () {
      EB.audio.play('click');
      self._options.onDone({ quality: quality, scoreFactor: self._L.points });
    });
  }
};
