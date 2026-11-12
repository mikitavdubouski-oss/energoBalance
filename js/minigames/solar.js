/*
  solar.js — мини-игра «Солнечная электростанция» (уровень «Мини-город», проблема «Крыша»).

  Шаги:
  1. Выбор сложности: лёгкий / средний / сложный.
  2. Сборка схемы: нажми на деталь внизу, потом на пустое место в схеме (подходит и для касания).
     Детали: солнечные панели, провода, инвертор, аккумулятор (со среднего уровня).
     На сложном уровне среди деталей есть «лишние», которые не нужны станции.
  3. Средний и сложный: выбрать, куда повернуть панели (стороны света).
     Сложный: выбрать ещё и угол наклона панелей.
  4. Запуск: анимация выработки энергии и короткое объяснение, как это работает.

  Итог: quality 0..1 — меньше ошибок и правильная ориентация/угол = выше.
  Числа (хороший угол) — EB.config.minigames.solar. Тексты — mg.solar.* в texts.ru.js.
*/

EB.minigames.solar = {
  // Что есть на каждом уровне сложности
  LEVELS: {
    easy:   { panels: 2, battery: false, orient: false, angle: false, decoys: [] },
    medium: { panels: 3, battery: true,  orient: true,  angle: false, decoys: [] },
    hard:   { panels: 4, battery: true,  orient: true,  angle: true,  decoys: ['bulb', 'heater'] }
  },
  // Значок каждой детали (SVG, viewBox 0 0 60 60)
  PART_SVG: {
    panel: '<rect x="6" y="14" width="48" height="32" rx="3" fill="#2f6fd6" stroke="#2b3a4a" stroke-width="3"/><path d="M22 14v32M38 14v32M6 30h48" stroke="#9cc7ff" stroke-width="2"/>',
    wire: '<path d="M8 40c10-30 34 10 44-20" stroke="#2b3a4a" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="8" cy="40" r="5" fill="#ffd166" stroke="#2b3a4a" stroke-width="2"/><circle cx="52" cy="20" r="5" fill="#ffd166" stroke="#2b3a4a" stroke-width="2"/>',
    inverter: '<rect x="10" y="10" width="40" height="40" rx="6" fill="#b9a6ff" stroke="#2b3a4a" stroke-width="3"/><path d="M18 24h10M18 36q4-6 8 0t8 0 8 0" stroke="#2b3a4a" stroke-width="3" fill="none" stroke-linecap="round"/>',
    battery: '<rect x="12" y="14" width="36" height="38" rx="5" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="3"/><rect x="24" y="8" width="12" height="7" rx="2" fill="#2b3a4a"/><path d="M31 22l-7 12h6l-2 10 8-13h-6z" fill="#ffd166" stroke="#2b3a4a" stroke-width="2"/>',
    bulb: '<path d="M30 8a14 14 0 0 0-8 25v7h16v-7a14 14 0 0 0-8-25z" fill="#ffd166" stroke="#2b3a4a" stroke-width="3"/><rect x="23" y="42" width="14" height="8" rx="2" fill="#9aa6b2" stroke="#2b3a4a" stroke-width="2"/>',
    heater: '<rect x="8" y="16" width="44" height="30" rx="6" fill="#ff8c69" stroke="#2b3a4a" stroke-width="3"/><path d="M18 22v18M26 22v18M34 22v18M42 22v18" stroke="#2b3a4a" stroke-width="3"/>'
  },
  ORIENTATIONS: ['north', 'east', 'south', 'west'],

  start: function (box, options) {
    this._box = box;
    this._options = options;
    this._renderChoose();
  },

  stop: function () {
    clearTimeout(this._timer);
  },

  _renderChoose: function () {
    var self = this;
    self._box.innerHTML =
      '<h2 class="minigame__title">' + EB.t('mg.solar.title') + '</h2>' +
      '<p class="minigame__text">' + EB.t('mg.solar.intro') + '</p>' +
      '<div class="panel__buttons">' +
        ['easy', 'medium', 'hard'].map(function (k) {
          return '<button class="btn btn--small" data-level="' + k + '">' + EB.t('mg.solar.' + k) + '</button>';
        }).join('') +
      '</div>';
    self._box.querySelectorAll('[data-level]').forEach(function (b) {
      b.addEventListener('click', function () {
        EB.audio.play('click');
        self._setup(b.getAttribute('data-level'));
      });
    });
    self._box.querySelector('[data-level]').focus();
  },

  _setup: function (levelKey) {
    var L = this.LEVELS[levelKey];
    this._levelKey = levelKey;
    this._L = L;
    this._mistakes = 0;
    this._selected = null;
    // Слоты схемы: что куда нужно поставить
    this._slots = [];
    for (var i = 0; i < L.panels; i++) this._slots.push({ id: 'p' + i, need: 'panel', x: 40 + i * 110, y: 30 });
    this._slots.push({ id: 'w1', need: 'wire', x: 150 + (L.panels - 2) * 55, y: 140 });
    this._slots.push({ id: 'inv', need: 'inverter', x: 300 + (L.panels - 2) * 55, y: 210 });
    this._slots.push({ id: 'w2', need: 'wire', x: 450 + (L.panels - 2) * 55, y: 140 });
    if (L.battery) this._slots.push({ id: 'bat', need: 'battery', x: 450 + (L.panels - 2) * 55, y: 260 });
    this._slots.forEach(function (s) { s.filled = false; });
    // Набор деталей внизу
    var counts = { panel: L.panels, wire: 2, inverter: 1 };
    if (L.battery) counts.battery = 1;
    L.decoys.forEach(function (d) { counts[d] = 1; });
    this._parts = counts;
    this._orient = null;
    this._angle = 0;
    this._renderBuild();
  },

  _renderBuild: function () {
    var self = this;
    var L = self._L;
    var slotsHtml = self._slots.map(function (s) {
      return '<button class="solar-slot' + (s.filled ? ' is-filled' : '') + '" data-slot="' + s.id + '" style="left:' + (s.x / 7.6) + '%;top:' + (s.y / 3.4) + '%" aria-label="' +
        EB.t('mg.solar.slot', { part: EB.t('mg.solar.part.' + s.need) }) + '">' +
        (s.filled ? '<svg viewBox="0 0 60 60">' + self.PART_SVG[s.need] + '</svg>' : '<span>?</span>') + '</button>';
    }).join('');
    var partsHtml = Object.keys(self._parts).map(function (p) {
      var n = self._parts[p];
      return '<button class="solar-part' + (self._selected === p ? ' is-selected' : '') + '" data-part="' + p + '"' + (n <= 0 ? ' disabled' : '') + '>' +
        '<svg viewBox="0 0 60 60" aria-hidden="true">' + self.PART_SVG[p] + '</svg>' +
        '<span>' + EB.t('mg.solar.part.' + p) + '</span><b>×' + n + '</b></button>';
    }).join('');
    var allFilled = self._slots.every(function (s) { return s.filled; });

    var extra = '';
    if (allFilled && L.orient) {
      extra += '<div class="solar-choice"><span>' + EB.t('mg.solar.orientQ') + '</span><div class="compass">' +
        self.ORIENTATIONS.map(function (o) {
          return '<button class="btn btn--small btn--lang' + (self._orient === o ? ' is-active' : '') + '" data-orient="' + o + '" aria-pressed="' + (self._orient === o) + '">' +
            (self._orient === o ? '✓ ' : '') + EB.t('mg.solar.' + o) + '</button>';
        }).join('') + '</div></div>';
    }
    if (allFilled && L.angle) {
      extra += '<div class="solar-choice"><label for="solar-angle">' + EB.t('mg.solar.angleQ') + '</label>' +
        '<input class="slider" type="range" id="solar-angle" min="0" max="90" step="5" value="' + self._angle + '">' +
        '<output class="setting__value">' + self._angle + '°</output>' +
        '<svg class="solar-angle-pic" viewBox="0 0 100 60" aria-hidden="true"><line x1="5" y1="55" x2="95" y2="55" stroke="#2b3a4a" stroke-width="3"/>' +
        '<line class="solar-angle-line" x1="20" y1="55" x2="80" y2="55" stroke="#2f6fd6" stroke-width="8" stroke-linecap="round"/></svg></div>';
    }
    var ready = allFilled && (!L.orient || self._orient) ;

    self._box.innerHTML =
      '<h2 class="minigame__title">' + EB.t('mg.solar.title') + ' · ' + EB.t('mg.solar.' + self._levelKey) + '</h2>' +
      '<p class="minigame__text">' + EB.t(allFilled ? 'mg.solar.tuneHint' : 'mg.solar.buildHint') + '</p>' +
      '<div class="solar-board">' +
        '<svg class="solar-board__bg" viewBox="0 0 760 340" aria-hidden="true">' + self._boardSvg() + '</svg>' +
        slotsHtml +
      '</div>' +
      extra +
      '<p class="minigame__feedback" aria-live="polite"></p>' +
      (allFilled ? '' : '<div class="solar-parts">' + partsHtml + '</div>') +
      '<div class="panel__buttons"><button class="btn btn--primary btn--small" data-mg="run"' + (ready ? '' : ' disabled') + '>' + EB.t('mg.solar.run') + '</button></div>';

    self._box.querySelectorAll('[data-part]').forEach(function (b) {
      b.addEventListener('click', function () {
        var p = b.getAttribute('data-part');
        if (L.decoys.indexOf(p) !== -1) {
          // Лишняя деталь — объясняем, почему она не нужна
          self._mistakes++;
          EB.audio.play('error');
          self._parts[p] = 0;
          self._renderBuild();
          self._feedback(EB.t('mg.solar.decoy.' + p), false);
          return;
        }
        self._selected = p;
        EB.audio.play('click');
        self._renderBuild();
        var first = self._box.querySelector('.solar-slot:not(.is-filled)');
        if (first) first.focus();
      });
    });
    self._box.querySelectorAll('[data-slot]').forEach(function (b) {
      b.addEventListener('click', function () { self._place(b.getAttribute('data-slot')); });
    });
    self._box.querySelectorAll('[data-orient]').forEach(function (b) {
      b.addEventListener('click', function () {
        EB.audio.play('click');
        self._orient = b.getAttribute('data-orient');
        self._renderBuild();
      });
    });
    var angle = self._box.querySelector('#solar-angle');
    if (angle) {
      var updateAngle = function () {
        self._angle = Number(angle.value);
        angle.nextElementSibling.textContent = self._angle + '°';
        var a = self._angle * Math.PI / 180;
        var line = self._box.querySelector('.solar-angle-line');
        line.setAttribute('x2', 20 + Math.cos(a) * 60);
        line.setAttribute('y2', 55 - Math.sin(a) * 60);
      };
      angle.addEventListener('input', updateAngle);
      updateAngle();
    }
    var run = self._box.querySelector('[data-mg="run"]');
    run.addEventListener('click', function () { self._run(); });
  },

  // Фон схемы: солнце, крыша, дом
  _boardSvg: function () {
    // Центр слота по его id — чтобы нарисовать пунктир «что с чем соединяется»
    var c = {};
    this._slots.forEach(function (s) { c[s.id] = (s.x + 36) + ' ' + (s.y + 36); });
    var roofMid = (40 + this._L.panels * 55) + ' 115';
    var guide = 'M' + roofMid + ' L' + c.w1 + ' L' + c.inv + ' L' + c.w2 + ' L690 250' +
      (c.bat ? ' M' + c.inv + ' L' + c.bat : '');
    return '<circle cx="700" cy="50" r="34" fill="#ffd166" stroke="#2b3a4a" stroke-width="3"/>' +
      '<path d="M40 115h' + (this._L.panels * 110) + '" stroke="#d9a066" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="' + guide + '" stroke="#9fb3c8" stroke-width="4" stroke-dasharray="8 8" fill="none"/>' +
      '<path d="M650 330V230l52-44 52 44v100z" fill="#ffe9c7" stroke="#2b3a4a" stroke-width="3"/>' +
      '<rect class="solar-window" x="684" y="250" width="36" height="34" rx="4" fill="#cfe8ff" stroke="#2b3a4a" stroke-width="3"/>';
  },

  _place: function (slotId) {
    var slot = this._slots.filter(function (s) { return s.id === slotId; })[0];
    if (!slot || slot.filled) return;
    if (!this._selected) {
      this._feedback(EB.t('mg.solar.pickFirst'), false);
      return;
    }
    if (slot.need !== this._selected) {
      this._mistakes++;
      EB.audio.play('error');
      this._feedback(EB.t('mg.solar.wrongSlot', { part: EB.t('mg.solar.part.' + this._selected) }), false);
      return;
    }
    slot.filled = true;
    this._parts[this._selected]--;
    if (this._parts[this._selected] <= 0) this._selected = null;
    EB.audio.play('pop');
    this._renderBuild();
    this._feedback(EB.t('mg.solar.placed'), true);
  },

  _feedback: function (text, good) {
    var fb = this._box.querySelector('.minigame__feedback');
    if (!fb) return;
    fb.textContent = text;
    fb.className = 'minigame__feedback is-' + (good ? 'good' : 'bad');
  },

  // Подсчёт качества и анимация выработки
  _run: function () {
    var self = this;
    var L = self._L;
    var cfg = EB.config.minigames.solar;
    var quality = 1 - self._mistakes * 0.1;
    var notes = [];
    if (L.orient) {
      if (self._orient === 'south') notes.push(EB.t('mg.solar.orientGood'));
      else if (self._orient === 'north') { quality -= 0.4; notes.push(EB.t('mg.solar.orientBad')); }
      else { quality -= 0.15; notes.push(EB.t('mg.solar.orientOk')); }
    }
    if (L.angle) {
      if (self._angle >= cfg.goodAngle[0] && self._angle <= cfg.goodAngle[1]) notes.push(EB.t('mg.solar.angleGood'));
      else if (self._angle >= cfg.okAngle[0] && self._angle <= cfg.okAngle[1]) { quality -= 0.1; notes.push(EB.t('mg.solar.angleOk')); }
      else { quality -= 0.25; notes.push(EB.t('mg.solar.angleBad')); }
    }
    quality = EB.utils.clamp(quality, 0.2, 1);
    EB.audio.play('win');

    // Анимация: поток энергии по проводам, свет в доме, заряд аккумулятора
    var board = self._box.querySelector('.solar-board');
    board.classList.add('is-running');
    var bg = self._box.querySelector('.solar-board__bg');
    var shift = (L.panels - 2) * 55;
    bg.insertAdjacentHTML('beforeend',
      '<g class="solar-rays"><path d="M666 70 L' + (60 + L.panels * 55) + ' 40" stroke="#ffd166" stroke-width="6" stroke-dasharray="12 10"/></g>' +
      '<path class="solar-flow" d="M' + (90 + L.panels * 55) + ' 115 C ' + (200 + shift) + ' 180, ' + (260 + shift) + ' 200, ' + (330 + shift) + ' 230 S ' + (520 + shift) + ' 200, 660 258" ' +
      'stroke="#ffb400" stroke-width="7" fill="none" stroke-dasharray="14 12"/>');
    self._box.querySelectorAll('.solar-parts, .solar-choice, [data-mg="run"]').forEach(function (el) { el.remove(); });
    self._box.querySelector('.minigame__text').textContent = EB.t('mg.solar.running');

    self._timer = setTimeout(function () {
      self._box.querySelector('.minigame__text').textContent = EB.t('mg.solar.explain' + (L.battery ? 'Battery' : ''));
      self._feedback(notes.join(' ') + ' ' + EB.t('mg.solar.quality', { pct: Math.round(quality * 100) }), quality >= 0.7);
      var row = EB.utils.el('div', { 'class': 'panel__buttons' });
      var done = EB.utils.el('button', { 'class': 'btn btn--primary btn--small', text: EB.t('mg.finish') });
      done.addEventListener('click', function () {
        EB.audio.play('click');
        self._options.onDone({ quality: quality });
      });
      row.appendChild(done);
      self._box.appendChild(row);
      done.focus();
    }, cfg.flowAnimMs);
  }
};
