/*
  thermostat.js — мини-игра «Термостат» (уровни «Квартира» и «Дом в агрогородке», проблема «Батарея»).

  Игрок крутит ручку термостата (тянет мышью или пальцем, либо кнопками − / +, либо стрелками)
  и выставляет температуру для разных ситуаций: день дома, ночь, никого нет дома, проветривание.
  Обратная связь сразу: шкала «Комфорт» и шкала «Расход тепла».
  За каждую ситуацию — оценка 0..1, итог — среднее (качество прохождения).

  Диапазоны «хорошей» температуры — в EB.config.minigames.thermostat (помечены [ПРОВЕРИТЬ]).
  Для разных уровней ситуации могут отличаться: config → minigames.thermostat.byLevel (например, дом в агрогородке).
  Тексты — ключи mg.thermo.* в texts.ru.js.

  Подключение: EB.minigames.thermostat.start(контейнер, {onDone: function (result) {...}}),
  result = {quality: 0..1}.
*/

EB.minigames.thermostat = {
  ANGLE: 135,     // ручка поворачивается от −135° до +135°

  start: function (box, options) {
    var cfg = EB.config.minigames.thermostat;
    var self = EB.minigames.thermostat;
    self._box = box;
    self._options = options;
    self._index = 0;
    self._scores = [];
    self._temp = Math.round((cfg.min + cfg.max) / 2);
    self._render();
  },

  stop: function () {
    var self = EB.minigames.thermostat;
    if (self._cleanup) self._cleanup();
    self._cleanup = null;
  },

  _cfg: function () { return EB.config.minigames.thermostat; },

  // Ситуации для текущего уровня: свои (config → byLevel[уровень]) или общие (config → situations)
  _situations: function () {
    var c = this._cfg();
    return (c.byLevel && c.byLevel[EB.game.levelId]) || c.situations;
  },

  _situation: function () {
    return this._situations()[this._index];
  },

  // Комфорт для людей в комнате. У ситуаций с empty: true («никого нет», «проветривание») людей в комнате нет.
  _comfort: function (t) {
    var s = this._situation();
    if (s.empty) return null;
    var mid = (s.good[0] + s.good[1]) / 2;
    return EB.utils.clamp(Math.round(100 - Math.abs(t - mid) * 12), 0, 100);
  },

  _heat: function (t) {
    var c = this._cfg();
    return Math.round((t - c.min) / (c.max - c.min) * 100);
  },

  // Оценка ситуации: 1 — в хорошем диапазоне, меньше — чем дальше от него
  _score: function (t) {
    var s = this._situation();
    var dist = t < s.good[0] ? s.good[0] - t : (t > s.good[1] ? t - s.good[1] : 0);
    return EB.utils.clamp(1 - dist / this._cfg().toleranceDeg, 0, 1);
  },

  _render: function () {
    var self = this;
    var s = self._situation();
    var total = self._situations().length;
    self._box.innerHTML =
      '<h2 class="minigame__title">' + EB.t('mg.thermo.title') + '</h2>' +
      '<p class="minigame__step">' + EB.t('mg.step', { n: self._index + 1, total: total }) + '</p>' +
      '<div class="thermo">' +
        '<div class="thermo__situation"><b></b><p></p></div>' +
        '<div class="thermo__dial-wrap">' +
          '<svg class="thermo__dial" viewBox="0 0 300 300" role="slider" tabindex="0" aria-valuemin="' + self._cfg().min + '" aria-valuemax="' + self._cfg().max + '">' +
            self._dialSvg() +
          '</svg>' +
          '<div class="thermo__buttons">' +
            '<button class="btn-icon" data-d="-1" aria-label="−1 °C">−</button>' +
            '<button class="btn-icon" data-d="1" aria-label="+1 °C">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="thermo__bars">' +
          '<div class="mini-meter mini-meter--comfort"><span>' + EB.ui.icon('smile') + EB.t('hud.comfort') + '</span><span class="mini-meter__bar"><span></span></span><b></b></div>' +
          '<div class="mini-meter mini-meter--heat"><span>' + EB.ui.icon('flame') + EB.t('mg.thermo.heat') + '</span><span class="mini-meter__bar"><span></span></span><b></b></div>' +
        '</div>' +
      '</div>' +
      '<p class="minigame__feedback" aria-live="polite"></p>' +
      '<div class="panel__buttons"><button class="btn btn--primary btn--small" data-mg="ok">' + EB.t('mg.thermo.confirm') + '</button></div>';

    self._box.querySelector('.thermo__situation b').textContent = EB.t('mg.thermo.' + s.key);
    self._box.querySelector('.thermo__situation p').textContent = EB.t('mg.thermo.' + s.key + '.desc');

    var dial = self._box.querySelector('.thermo__dial');
    var dragging = false;

    function setFromPointer(e) {
      var r = dial.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      var angle = Math.atan2(dx, -dy) * 180 / Math.PI; // 0° — вверх, по часовой — плюс
      angle = EB.utils.clamp(angle, -self.ANGLE, self.ANGLE);
      var c = self._cfg();
      self._setTemp(Math.round(c.min + (angle + self.ANGLE) / (2 * self.ANGLE) * (c.max - c.min)));
    }
    function down(e) {
      dragging = true;
      dial.setPointerCapture(e.pointerId);
      setFromPointer(e);
    }
    function move(e) { if (dragging) setFromPointer(e); }
    function up() { dragging = false; }
    dial.addEventListener('pointerdown', down);
    dial.addEventListener('pointermove', move);
    dial.addEventListener('pointerup', up);
    dial.addEventListener('pointercancel', up);
    dial.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { self._setTemp(self._temp + 1); e.preventDefault(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { self._setTemp(self._temp - 1); e.preventDefault(); }
    });
    self._box.querySelectorAll('[data-d]').forEach(function (b) {
      b.addEventListener('click', function () { self._setTemp(self._temp + Number(b.getAttribute('data-d'))); });
    });
    self._box.querySelector('[data-mg="ok"]').addEventListener('click', function () { self._confirm(); });
    self._cleanup = function () { dragging = false; };
    self._setTemp(self._temp);
    dial.focus();
  },

  // Разметка шкалы термостата: дуга, деления, ручка
  _dialSvg: function () {
    var c = this._cfg();
    var ticks = '';
    for (var t = c.min; t <= c.max; t += 1) {
      var a = (-this.ANGLE + (t - c.min) / (c.max - c.min) * 2 * this.ANGLE) * Math.PI / 180;
      var long = t % 5 === 0;
      var r1 = long ? 112 : 118;
      ticks += '<line x1="' + (150 + Math.sin(a) * r1) + '" y1="' + (150 - Math.cos(a) * r1) +
        '" x2="' + (150 + Math.sin(a) * 128) + '" y2="' + (150 - Math.cos(a) * 128) +
        '" stroke="#2b3a4a" stroke-width="' + (long ? 4 : 2) + '" stroke-linecap="round"/>';
      if (long) {
        ticks += '<text x="' + (150 + Math.sin(a) * 96) + '" y="' + (156 - Math.cos(a) * 96) +
          '" text-anchor="middle" font-size="19" font-weight="700" fill="#2b3a4a">' + t + '</text>';
      }
    }
    return '<circle cx="150" cy="150" r="140" fill="#fff" stroke="#2b3a4a" stroke-width="5"/>' + ticks +
      // Снежинка у минимума и огонёк у максимума — подсказки формой, а не только цветом.
      // Рисуем их сами (не эмодзи): так они везде одинаковые и стоят внутри круга, под числами шкалы.
      '<g transform="translate(112 250)" stroke="#1f7ae0" stroke-linecap="round" fill="none">' +
        '<path d="M0 -15V15M-13 -7.5L13 7.5M-13 7.5L13 -7.5" stroke-width="3.5"/>' +
        '<path d="M-4 -12L0 -8L4 -12M-4 12L0 8L4 12M-12.4 -2.5L-6.9 -4L-8.4 -9.5M12.4 2.5L6.9 4L8.4 9.5' +
        'M-12.4 2.5L-6.9 4L-8.4 9.5M12.4 -2.5L6.9 -4L8.4 -9.5" stroke-width="2.5"/></g>' +
      '<g transform="translate(188 250)">' +
        '<path d="M0 -17C6 -9 13 -3 13 5C13 12 7 17 0 17C-7 17 -13 12 -13 5C-13 -1 -9 -5 -6 -9C-5 -4 -3 -2 -1 -1C-2 -7 -2 -12 0 -17Z"' +
        ' fill="#ff7b2e" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M0 3C3 6 5 8 5 11C5 14 3 15 0 15C-3 15 -5 14 -5 11C-5 8 -2 6 0 3Z" fill="#ffd23f"/></g>' +
      '<g class="thermo__knob"><circle cx="150" cy="150" r="70" fill="#eaf6ff" stroke="#2b3a4a" stroke-width="5"/>' +
      '<rect x="144" y="84" width="12" height="34" rx="6" fill="#1f7ae0" stroke="#2b3a4a" stroke-width="3"/></g>' +
      '<text class="thermo__value" x="150" y="166" text-anchor="middle" font-size="40" font-weight="800" fill="#1d2b3a"></text>';
  },

  _setTemp: function (t) {
    var c = this._cfg();
    t = EB.utils.clamp(t, c.min, c.max);
    this._temp = t;
    var box = this._box;
    var angle = -this.ANGLE + (t - c.min) / (c.max - c.min) * 2 * this.ANGLE;
    box.querySelector('.thermo__knob').setAttribute('transform', 'rotate(' + angle + ' 150 150)');
    box.querySelector('.thermo__value').textContent = t + '°';
    var dial = box.querySelector('.thermo__dial');
    dial.setAttribute('aria-valuenow', t);
    dial.setAttribute('aria-valuetext', t + ' °C');

    var comfort = this._comfort(t);
    var heat = this._heat(t);
    var cm = box.querySelector('.mini-meter--comfort');
    cm.querySelector('.mini-meter__bar span').style.width = (comfort === null ? 0 : comfort) + '%';
    cm.querySelector('b').textContent = comfort === null ? EB.t('mg.thermo.nobody') : comfort;
    var hm = box.querySelector('.mini-meter--heat');
    hm.querySelector('.mini-meter__bar span').style.width = heat + '%';
    hm.querySelector('b').textContent = heat;
  },

  _confirm: function () {
    var self = this;
    var s = self._situation();
    var score = self._score(self._temp);
    self._scores.push(score);
    EB.audio.play(score >= 0.99 ? 'correct' : (score > 0 ? 'click' : 'error'));
    var verdict = score >= 0.99 ? 'mg.great' : (score > 0.4 ? 'mg.almost' : 'mg.miss');
    var fb = self._box.querySelector('.minigame__feedback');
    fb.textContent = EB.t(verdict) + ' ' + EB.t('mg.thermo.' + s.key + '.why');
    fb.className = 'minigame__feedback is-' + (score >= 0.99 ? 'good' : 'bad');
    var btn = self._box.querySelector('[data-mg="ok"]');
    var last = self._index >= self._situations().length - 1;
    btn.textContent = EB.t(last ? 'mg.finish' : 'mg.next');
    btn.replaceWith(btn.cloneNode(true)); // снять старый обработчик
    btn = self._box.querySelector('[data-mg="ok"]');
    btn.focus();
    btn.addEventListener('click', function () {
      EB.audio.play('click');
      if (last) {
        var sum = self._scores.reduce(function (a, b) { return a + b; }, 0);
        self._options.onDone({ quality: sum / self._scores.length });
      } else {
        self._index++;
        self._render();
      }
    });
  }
};
