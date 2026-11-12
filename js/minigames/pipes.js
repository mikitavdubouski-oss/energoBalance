/*
  pipes.js — мини-игра «Трубопровод» (головоломка с трубами).

  Где подключена (поле minigame в js/data/hotspots.js):
  - «Завод» (factory), проблема «fac-cooling»: собрать замкнутый контур охлаждения
    станок → охладитель (градирня) → насос → снова станок. Вода ходит по кругу и не уходит в канализацию.
  - «Дом в агрогородке» (agro), проблема «agro-hose»: провести дождевую воду
    от бочки к грядкам с капельным поливом в теплице.
  Какой вариант показать, выбираем по EB.game.levelId (если уровень другой — вариант 'agro').

  Как играть:
  - Поле из клеток, в клетках отрезки труб: прямые, уголки, тройники.
  - Нажми на клетку (мышью или пальцем) — труба повернётся на четверть оборота по часовой стрелке.
    Клавиатура: стрелки — выбрать клетку, Enter или пробел — повернуть.
  - Бочка, грядки, станок, охладитель и насос закреплены — их не поворачивают.
  - Вода сразу «течёт» по соединённым трубам: труба синеет, по ней бегут пузырьки, в углу клетки
    появляется значок капли. Там, где вода вытекает из открытого конца, — значок утечки (треугольник с каплями).
  - Победа: все цели получают воду (грядки / охладитель, насос и возврат к станку) и нет ни одной утечки.

  Качество (result.quality, 0..1):
  - победа: 1.0 минус штраф за время (если дольше parTimeSec) и за лишние повороты
    (больше минимума + freeExtraTurns), но не ниже minWinQuality;
  - время вышло или игрок нажал «Показать решение»: доля подключённого пути × failMaxQuality.
  Все числа — EB.config.minigames.pipes. Тексты — ключи mg.pipes.* в texts.ru.js / texts.be.js.

  Как добавить раскладку: допиши строку-поле в LAYOUTS (ниже) — поле рисуется в РЕШЁННОМ виде.
  При старте трубы поворачиваются случайно. Обозначения клеток (через пробел):
    ─ │ ┌ ┐ └ ┘     — прямые трубы и уголки
    ├ ┤ ┬ ┴ ┼       — тройники и крестовина
    .               — пустая клетка
    B + стороны     — бочка (источник), например Be — выход вправо
    G + стороны     — грядка (цель), например Gw — вход слева
    C + стороны     — охладитель, например Cwe — трубы слева и справа
    P + стороны     — насос
    M + выход + вход — станок, например Mns — вода выходит вверх, возвращается снизу
  Стороны: n — верх, e — право, s — низ, w — лево.
  Трубы, которые не входят в путь решения, — «лишние»: их можно крутить, но они не нужны.
  Проверить, что все раскладки решаемы: в консоли EB.minigames.pipes.selfTest() (при config.debug — само).
*/

EB.minigames.pipes = {
  // Стороны клетки — биты числа: верх 1, право 2, низ 4, лево 8.
  // Труба описывается суммой битов своих открытых концов: «─» = право + лево = 2 + 8 = 10.
  SIDES: [
    { bit: 1, dx: 0, dy: -1, letter: 'n', angle: 0 },
    { bit: 2, dx: 1, dy: 0, letter: 'e', angle: 90 },
    { bit: 4, dx: 0, dy: 1, letter: 's', angle: 180 },
    { bit: 8, dx: -1, dy: 0, letter: 'w', angle: 270 }
  ],
  OPPOSITE: { 1: 4, 2: 8, 4: 1, 8: 2 },
  PIPE_CHARS: { '─': 10, '│': 5, '┌': 6, '┐': 12, '└': 3, '┘': 9, '├': 7, '┤': 13, '┬': 14, '┴': 11, '┼': 15 },
  // Форма трубы в «нулевом» повороте: I — прямая, L — уголок, T — тройник, X — крестовина
  BASE: { I: 5, L: 3, T: 7, X: 15 },
  SPECIALS: { B: 'source', G: 'target', C: 'cooler', P: 'pump', M: 'machine' },

  // Раскладки в решённом виде (см. шапку). Для каждого уровня одна выбирается случайно.
  LAYOUTS: {
    agro: [
      [
        'Be ─ ┐ ┌ ─ Gw',
        '│  ┐ └ ┤ ┌ ┘',
        '└  ┬ ─ │ ┐ │',
        '┌  ─ ┘ └ ─ Gw'
      ],
      [
        '┌  ─ ┬ ─ ─ Gw',
        '│  ┘ │ ┌ ├ ┐',
        '│  ─ └ ┐ ┘ │',
        'Bn ┐ ┴ └ ─ Gw'
      ]
    ],
    factory: [
      [
        '┌   ─ ─ Cwe ─   ┐',
        '│   ┬ ┐ ┘   ├   │',
        'Mns ┤ └ ─   ┌   │',
        '│   ┴ ┌ ─   Pew ┘',
        '└   ─ ┘ ┐   ┬   ┘'
      ],
      [
        '┬ ┌   ─   ┐ ┘   ─',
        '│ │   ┤   └ ┐   ┌',
        '└ Pns ┬   ─ Csn ┘',
        '┌ │   ┴   ┘ └   ┐',
        '┐ └   Mew ─ ─   ┘'
      ]
    ]
  },

  // ======================= Запуск и остановка =======================
  start: function (box, options) {
    var self = this;
    self.stop();
    self._box = box;
    self._options = options;
    self._variant = self.LAYOUTS[EB.game && EB.game.levelId] ? EB.game.levelId : 'agro';
    self._cfg = EB.config.minigames.pipes;
    self._L = self._cfg.levels[self._variant];
    var list = self.LAYOUTS[self._variant];
    self._build(list[EB.utils.randomInt(0, list.length - 1)]);
    self._scramble();
    self._turns = 0;          // сколько раз игрок повернул трубы
    self._elapsed = 0;        // сколько миллисекунд идёт игра (считаем с первого поворота)
    self._started = false;
    self._finished = false;
    self._doneSent = false;
    self._focus = self._firstRotatable();
    self._render();
    self._update(true);
    self._timer = setInterval(function () { self._tick(); }, 250);
  },

  stop: function () {
    clearInterval(this._timer);
    clearTimeout(this._winTimer);
    this._timer = null;
    this._winTimer = null;
    this._finished = true;
  },

  // ======================= Поле: разбор раскладки =======================
  // Повернуть набор концов на k четвертей по часовой стрелке (верх → право → низ → лево)
  _rot: function (mask, k) {
    for (var i = 0; i < ((k % 4) + 4) % 4; i++) mask = ((mask << 1) | (mask >> 3)) & 15;
    return mask;
  },

  _sidesFromLetters: function (letters) {
    var self = this;
    var mask = 0;
    letters.split('').forEach(function (ch) {
      self.SIDES.forEach(function (s) { if (s.letter === ch) mask |= s.bit; });
    });
    return mask;
  },

  // Тип трубы по набору концов
  _typeOf: function (mask) {
    var n = 0;
    for (var b = 1; b <= 8; b <<= 1) if (mask & b) n++;
    if (n === 4) return 'X';
    if (n === 3) return 'T';
    return (mask === 5 || mask === 10) ? 'I' : 'L';
  },

  _build: function (rows) {
    var self = this;
    var grid = rows.map(function (r) { return r.trim().split(/\s+/); });
    self._h = grid.length;
    self._w = grid[0].length;
    self._cells = [];
    grid.forEach(function (row, y) {
      row.forEach(function (tok, x) {
        var c = { x: x, y: y, i: y * self._w + x, kind: 'empty', mask: 0, turns: 0, fixed: true };
        var head = tok.charAt(0);
        if (self.PIPE_CHARS[tok]) {
          c.kind = 'pipe';
          c.fixed = false;
          c.solved = self.PIPE_CHARS[tok];
          c.type = self._typeOf(c.solved);
        } else if (self.SPECIALS[head]) {
          c.kind = self.SPECIALS[head];
          if (c.kind === 'machine') {
            // Станок: первая буква — куда вода выходит, вторая — откуда возвращается
            c.out = self._sidesFromLetters(tok.charAt(1));
            c.inn = self._sidesFromLetters(tok.charAt(2));
            c.mask = c.out | c.inn;
          } else {
            c.mask = self._sidesFromLetters(tok.slice(1));
            if (c.kind === 'source') c.out = c.mask;
          }
        }
        self._cells.push(c);
      });
    });
    // Номера грядок — для подписей «Грядка 1», «Грядка 2»
    var n = 0;
    self._cells.forEach(function (c) { if (c.kind === 'target') c.num = ++n; });
    // Путь решения: какие клетки получают воду в решённом виде (для «доли пути» и минимума поворотов)
    var solved = self._flood(function (c) { return c.kind === 'pipe' ? c.solved : c.mask; });
    self._path = [];
    self._cells.forEach(function (c) {
      c.onPath = !!solved.wet[c.i] && c.kind !== 'source' && c.kind !== 'machine';
      if (c.onPath) self._path.push(c);
    });
    self._hasMachine = self._cells.some(function (c) { return c.kind === 'machine'; });
  },

  // Текущие открытые концы клетки
  _mask: function (c) {
    return c.kind === 'pipe' ? this._rot(this.BASE[c.type], c.turns) : c.mask;
  },

  // Сколько поворотов по часовой нужно трубе, чтобы встать как в решении (0..3)
  _turnsToSolved: function (c) {
    for (var k = 0; k < 4; k++) {
      if (this._rot(this.BASE[c.type], c.turns + k) === c.solved) return k;
    }
    return 0;
  },

  // Перемешать: каждую трубу повернуть случайно. Повторяем, пока не перемешано достаточно
  // (минимум minScrambleShare труб пути стоят неправильно) и поле не собрано само.
  _scramble: function () {
    var self = this;
    var pathPipes = self._path.filter(function (c) { return c.kind === 'pipe' && c.type !== 'X'; });
    for (var attempt = 0; attempt < 100; attempt++) {
      self._cells.forEach(function (c) { if (c.kind === 'pipe') c.turns = EB.utils.randomInt(0, 3); });
      var wrong = pathPipes.filter(function (c) { return self._turnsToSolved(c) > 0; }).length;
      if (wrong >= pathPipes.length * self._cfg.minScrambleShare && !self._isWin(self._flood())) break;
    }
    // Минимум поворотов, за который можно собрать именно это решение
    self._minTurns = 0;
    pathPipes.forEach(function (c) { self._minTurns += self._turnsToSolved(c); });
  },

  _firstRotatable: function () {
    var c = this._path.filter(function (p) { return p.kind === 'pipe'; })[0];
    return c ? c.i : 0;
  },

  // ======================= Течение воды =======================
  // Обход в ширину от источников (бочка, выход станка) по соединённым трубам.
  // Возвращает: wet[i] — есть ли вода в клетке, entry[i] — с какой стороны вода вошла,
  // leaks — открытые концы, куда вода вытекает, closed — вернулась ли вода в станок.
  _flood: function (maskFn) {
    var self = this;
    maskFn = maskFn || function (c) { return self._mask(c); };
    var res = { wet: [], entry: [], leaks: [], closed: false };
    var queue = [];
    self._cells.forEach(function (c) {
      if (c.kind === 'source' || c.kind === 'machine') {
        res.wet[c.i] = true;
        res.entry[c.i] = 0;
        queue.push(c);
      }
    });
    while (queue.length) {
      var c = queue.shift();
      var exits;
      if (c.kind === 'source' || c.kind === 'machine') exits = c.out;
      else if (c.kind === 'target') exits = 0;                 // грядка забирает воду себе
      else exits = maskFn(c) & ~res.entry[c.i];
      self.SIDES.forEach(function (s) {
        if (!(exits & s.bit)) return;
        var nx = c.x + s.dx, ny = c.y + s.dy;
        var n = (nx >= 0 && ny >= 0 && nx < self._w && ny < self._h) ? self._cells[ny * self._w + nx] : null;
        var opp = self.OPPOSITE[s.bit];
        if (!n || !(maskFn(n) & opp)) {
          res.leaks.push({ c: c, bit: s.bit });                // вода выливается наружу
          return;
        }
        if (n.kind === 'machine') {
          if (opp & n.inn) res.closed = true;                  // вода вернулась в станок
          return;
        }
        if (n.kind === 'source' || res.wet[n.i]) return;       // там вода уже есть
        res.wet[n.i] = true;
        res.entry[n.i] = opp;
        queue.push(n);
      });
    }
    return res;
  },

  // Список целей уровня и выполнена ли каждая
  _goals: function (f) {
    var self = this;
    var goals = [];
    self._cells.forEach(function (c) {
      if (c.kind === 'target') goals.push({ key: 'bed', cell: c, done: !!f.wet[c.i], name: EB.t('mg.pipes.goal.bed', { n: c.num }) });
    });
    ['cooler', 'pump'].forEach(function (kind) {
      self._cells.forEach(function (c) {
        if (c.kind === kind) goals.push({ key: kind, cell: c, done: !!f.wet[c.i], name: EB.t('mg.pipes.goal.' + kind) });
      });
    });
    if (self._hasMachine) {
      var m = self._cells.filter(function (c) { return c.kind === 'machine'; })[0];
      goals.push({ key: 'return', cell: m, done: f.closed, name: EB.t('mg.pipes.goal.return') });
    }
    return goals;
  },

  _isWin: function (f) {
    return f.leaks.length === 0 && this._goals(f).every(function (g) { return g.done; });
  },

  // Доля пути решения, по которой уже идёт вода (0..1)
  _share: function (f) {
    var total = this._path.length + (this._hasMachine ? 1 : 0);
    var got = this._path.filter(function (c) { return f.wet[c.i]; }).length + (this._hasMachine && f.closed ? 1 : 0);
    return total ? got / total : 0;
  },

  // ======================= Рисование =======================
  // Отрезок трубы от центра клетки вверх; остальные стороны — поворотом (viewBox 0 0 100 100)
  _arm: function (angle, inner) {
    var t = angle ? ' transform="rotate(' + angle + ' 50 50)"' : '';
    if (inner === 'outline') return '<path d="M50 50V0" stroke="#2b3a4a" stroke-width="34"' + t + '/>';
    if (inner === 'flange') return '<rect x="30" y="3" width="40" height="8" rx="2" fill="#8a9bb0" stroke="#2b3a4a" stroke-width="3"' + t + '/>';
    return '<path d="M50 50V0" stroke="' + inner + '" stroke-width="24"' + t + '/>';
  },

  // Труба по набору концов: обводка, «металл», фланцы на стыках
  _pipeBody: function (mask) {
    var self = this;
    var out = '', fill = '', fl = '';
    self.SIDES.forEach(function (s) {
      if (!(mask & s.bit)) return;
      out += self._arm(s.angle, 'outline');
      fill += self._arm(s.angle, '#dfe6ee');
      fl += self._arm(s.angle, 'flange');
    });
    return out + '<circle cx="50" cy="50" r="17" fill="#2b3a4a"/>' + fill +
      '<circle cx="50" cy="50" r="12" fill="#dfe6ee"/>' + fl;
  },

  // Вода в трубе: в сторону входа — «к центру», в остальные — «от центра» (пузырьки бегут по течению)
  _waterSvg: function (mask, entry) {
    var self = this;
    var html = '';
    self.SIDES.forEach(function (s) {
      if (!(mask & s.bit)) return;
      var d = s.bit === entry ? 'M50 0V50' : 'M50 50V0';
      var t = s.angle ? ' transform="rotate(' + s.angle + ' 50 50)"' : '';
      html += '<path d="' + d + '" stroke="#1e9cc4" stroke-width="13"' + t + '/>' +
        '<path class="pipes__flow" d="' + d + '" stroke="#d4f2ff" stroke-width="5" stroke-linecap="round"' + t + '/>';
    });
    return html + '<circle cx="50" cy="50" r="8" fill="#1e9cc4"/>';
  },

  // Значки закреплённых деталей (рисуются поверх коротких труб-«хвостиков»)
  _specialIcon: function (c, f) {
    var wet = !!f.wet[c.i];
    if (c.kind === 'source') {
      return '<path d="M30 26Q27 53 30 82H70Q73 53 70 26Z" fill="#c98b4a" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M29 44h42M29 66h42" stroke="#2b3a4a" stroke-width="3"/>' +
        '<ellipse cx="50" cy="26" rx="20" ry="6" fill="#4fb8e8" stroke="#2b3a4a" stroke-width="3"/>' +
        '<path d="M50 4c-4 6-6 9-6 12a6 6 0 0 0 12 0c0-3-2-6-6-12z" fill="#4fb8e8" stroke="#2b3a4a" stroke-width="2.5"/>';
    }
    if (c.kind === 'target') {
      // Грядка: без воды ростки поникли, с водой — стоят и зелёные (форма, а не только цвет)
      var plant = function (x) {
        return wet ?
          '<path d="M' + x + ' 62V40" stroke="#2b3a4a" stroke-width="3"/>' +
          '<path d="M' + x + ' 46c-9-1-13-8-13-13 7 0 13 5 13 13zM' + x + ' 46c9-1 13-8 13-13-7 0-13 5-13 13z" fill="#5cc26b" stroke="#2b3a4a" stroke-width="2.5"/>' :
          '<path d="M' + x + ' 62V48" stroke="#2b3a4a" stroke-width="3"/>' +
          '<path d="M' + x + ' 48c-8 1-11 7-11 12 5-2 10-6 11-12zM' + x + ' 48c8 1 11 7 11 12-5-2-10-6-11-12z" fill="#c9b458" stroke="#2b3a4a" stroke-width="2.5"/>';
      };
      return plant(34) + plant(66) +
        '<rect x="14" y="60" width="72" height="22" rx="8" fill="#8b5a2b" stroke="#2b3a4a" stroke-width="4"/>' +
        '<path d="M20 66h60" stroke="#2b3a4a" stroke-width="3" stroke-dasharray="7 6"/>' +
        (wet ? '<path d="M28 72v4M44 72v4M60 72v4M74 72v4" stroke="#7fd3ff" stroke-width="3" stroke-linecap="round"/>' : '');
    }
    if (c.kind === 'cooler') {
      return '<path d="M28 84Q40 58 34 30H66Q60 58 72 84Z" fill="#e6edf3" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M37 48h26M33 68h34" stroke="#9fb3c8" stroke-width="3"/>' +
        '<path d="M38 26c-7 0-8-9-1-10 1-7 11-8 13-2 7-3 13 4 8 9 4 4-1 9-5 6z" fill="#fff" stroke="#2b3a4a" stroke-width="2.5"' +
        (wet ? ' class="pipes__steam"' : ' opacity=".35"') + '/>';
    }
    if (c.kind === 'pump') {
      return '<rect x="22" y="68" width="56" height="12" rx="3" fill="#6b7a8c" stroke="#2b3a4a" stroke-width="3"/>' +
        '<circle cx="50" cy="46" r="23" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="4"/>' +
        '<g' + (wet ? ' class="pipes__spin"' : '') + '><path d="M50 46V30M50 46l14 8M50 46l-14 8" stroke="#2b3a4a" stroke-width="4" stroke-linecap="round"/></g>' +
        '<circle cx="50" cy="46" r="5" fill="#2b3a4a"/>';
    }
    if (c.kind === 'machine') {
      // Станок: пока контур не замкнут — горячий (огонёк), замкнут — охлаждается (снежинка)
      var status = f.closed ?
        '<path d="M68 42v20M59 47l18 10M77 47 59 57" stroke="#1e9cc4" stroke-width="4" stroke-linecap="round"/>' :
        '<path d="M68 40c-5 6-7 9-7 13a7 7 0 0 0 14 0c0-4-2-7-7-13z" fill="#e8662a" stroke="#2b3a4a" stroke-width="2.5"/>';
      return '<rect x="18" y="28" width="64" height="48" rx="8" fill="#9fb3c8" stroke="#2b3a4a" stroke-width="4"/>' +
        '<circle cx="38" cy="52" r="11" fill="#dfe6ee" stroke="#2b3a4a" stroke-width="3"/>' +
        '<path d="M38 37v4M38 63v4M23 52h4M49 52h4" stroke="#2b3a4a" stroke-width="4"/>' +
        '<rect x="56" y="36" width="24" height="32" rx="4" fill="#fff" stroke="#2b3a4a" stroke-width="3"/>' + status;
    }
    return '';
  },

  // Закреплённая деталь целиком: хвостики труб (с водой) + значок + стрелки входа/выхода у станка
  _specialSvg: function (c, f) {
    var self = this;
    var wet = !!f.wet[c.i];
    var body = self._pipeBody(c.mask);
    var water = '';
    self.SIDES.forEach(function (s) {
      if (!(c.mask & s.bit)) return;
      var flowing = false, inward = false;
      if (c.kind === 'source') flowing = true;
      else if (c.kind === 'machine') { flowing = (s.bit & c.out) || f.closed; inward = !!(s.bit & c.inn); }
      else if (wet) { flowing = true; inward = s.bit === f.entry[c.i]; }
      if (!flowing) return;
      var d = inward ? 'M50 0V50' : 'M50 50V0';
      var t = s.angle ? ' transform="rotate(' + s.angle + ' 50 50)"' : '';
      water += '<path d="' + d + '" stroke="#1e9cc4" stroke-width="13"' + t + '/>' +
        '<path class="pipes__flow" d="' + d + '" stroke="#d4f2ff" stroke-width="5" stroke-linecap="round"' + t + '/>';
    });
    var arrows = '';
    if (c.kind === 'machine') {
      self.SIDES.forEach(function (s) {
        if (!(c.mask & s.bit)) return;
        // Стрелка на хвостике: у выхода — наружу, у входа — внутрь
        var d = (s.bit & c.out) ? 'M42 16L50 4L58 16Z' : 'M42 4L50 16L58 4Z';
        arrows += '<path d="' + d + '" fill="#fff" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round"' +
          (s.angle ? ' transform="rotate(' + s.angle + ' 50 50)"' : '') + '/>';
      });
    }
    return body + water + self._specialIcon(c, f) + arrows;
  },

  // Маленький значок цели для списка задач
  _goalPic: function (key) {
    var fake = { wet: [true], closed: true, entry: [] };
    var kind = { bed: 'target', cooler: 'cooler', pump: 'pump', 'return': 'machine' }[key];
    return '<svg class="pipes__goal-pic" viewBox="0 0 100 100" aria-hidden="true">' +
      this._specialIcon({ kind: kind, i: 0 }, fake) + '</svg>';
  },

  _leakSvg: function () {
    return '<svg viewBox="0 0 40 52" aria-hidden="true">' +
      '<path d="M20 2 38 32H2z" fill="#ffb400" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M20 11v10" stroke="#2b3a4a" stroke-width="4" stroke-linecap="round"/><circle cx="20" cy="26.5" r="2.6" fill="#2b3a4a"/>' +
      '<path class="pipes__drip" d="M12 36c-2 3-4 5-4 7a4 4 0 0 0 8 0c0-2-2-4-4-7z" fill="#1e9cc4" stroke="#2b3a4a" stroke-width="1.5"/>' +
      '<path class="pipes__drip pipes__drip--late" d="M28 36c-2 3-4 5-4 7a4 4 0 0 0 8 0c0-2-2-4-4-7z" fill="#1e9cc4" stroke="#2b3a4a" stroke-width="1.5"/>' +
      '</svg>';
  },

  _render: function () {
    var self = this;
    var cells = self._cells.map(function (c) {
      var inner = '';
      if (c.kind === 'pipe') {
        inner = '<svg class="pipes__piece" viewBox="0 0 100 100" aria-hidden="true" style="transform:rotate(' + (c.turns * 90) + 'deg)">' +
          self._pipeBody(self.BASE[c.type]) + '<g class="pipes__water"></g></svg>';
      } else if (c.kind !== 'empty') {
        inner = '<svg class="pipes__special" viewBox="0 0 100 100" aria-hidden="true"></svg>' +
          '<span class="pipes__lock" aria-hidden="true">' + EB.ui.icon('lock') + '</span>';
      }
      return '<button class="pipes__cell' + (c.kind === 'empty' ? ' is-empty' : '') + (c.fixed && c.kind !== 'empty' ? ' is-fixed' : '') +
        '" data-i="' + c.i + '" tabindex="-1">' + inner +
        '<span class="pipes__drop" aria-hidden="true">' + EB.ui.icon('drop') + '</span></button>';
    }).join('');

    self._box.innerHTML =
      '<div class="pipes pipes--' + self._variant + '" style="--cols:' + self._w + ';--rows:' + self._h + '">' +
        '<div class="pipes__head">' +
          '<h2 class="minigame__title">' + EB.t('mg.pipes.title') + '</h2>' +
          '<p class="minigame__text pipes__task">' + EB.t('mg.pipes.task.' + self._variant) + '</p>' +
          '<p class="pipes__rules">' + EB.t('mg.pipes.rules') + ' <span class="pipes__keys">' + EB.t('mg.pipes.keys') + '</span></p>' +
          '<ul class="pipes__goals"></ul>' +
        '</div>' +
        '<div class="pipes__board-wrap">' +
          '<div class="pipes__board" role="group" aria-label="' + EB.t('mg.pipes.board') + '">' + cells +
            '<div class="pipes__leaks" aria-hidden="true"></div>' +
          '</div>' +
        '</div>' +
        '<div class="pipes__foot">' +
          '<div class="pipes__stats">' +
            '<span class="pipes__stat">' + EB.ui.icon('timer') + EB.t('mg.pipes.time') + ': <b data-s="time"></b></span>' +
            '<span class="pipes__stat">' + EB.ui.icon('restart') + EB.t('mg.pipes.turns') + ': <b data-s="turns"></b></span>' +
          '</div>' +
          '<p class="minigame__feedback" aria-live="polite"></p>' +
          '<div class="panel__buttons"><button class="btn btn--ghost btn--small" data-mg="giveup">' + EB.t('mg.pipes.giveUp') + '</button></div>' +
        '</div>' +
      '</div>';

    var board = self._box.querySelector('.pipes__board');
    self._buttons = [];
    board.querySelectorAll('.pipes__cell').forEach(function (b) {
      self._buttons[Number(b.getAttribute('data-i'))] = b;
      // click срабатывает и от мыши, и от касания, и от Enter/пробела на кнопке
      b.addEventListener('click', function () {
        self._focus = Number(b.getAttribute('data-i'));
        self._syncFocus(false);
        self._rotate(self._cells[self._focus]);
      });
    });
    // Стрелки — переход между клетками (фокус «бродит» по полю, Tab ведёт к кнопкам ниже)
    board.addEventListener('keydown', function (e) {
      var d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
      if (!d) return;
      e.preventDefault();
      var c = self._cells[self._focus];
      var x = EB.utils.clamp(c.x + d[0], 0, self._w - 1);
      var y = EB.utils.clamp(c.y + d[1], 0, self._h - 1);
      self._focus = y * self._w + x;
      self._syncFocus(true);
    });
    self._box.querySelector('[data-mg="giveup"]').addEventListener('click', function () {
      if (self._finished) return;
      EB.audio.play('click');
      EB.ui.modal.confirm(EB.t('mg.pipes.giveUpConfirm'), function () {
        if (!self._finished) self._fail('giveup');
      });
    });
    self._syncFocus(true);
    // Включаем плавный поворот только после первой отрисовки (иначе трубы «крутятся» при старте)
    requestAnimationFrame(function () { board.classList.add('is-ready'); });
  },

  _syncFocus: function (moveFocus) {
    var self = this;
    self._buttons.forEach(function (b, i) { b.tabIndex = i === self._focus ? 0 : -1; });
    if (moveFocus) self._buttons[self._focus].focus();
  },

  // ======================= Ход игрока =======================
  _rotate: function (c) {
    var self = this;
    if (self._finished) return;
    if (c.kind === 'empty') return;
    if (c.fixed) {
      EB.audio.play('click');
      self._feedback(EB.t('mg.pipes.fb.fixed'), false);
      return;
    }
    if (!self._started) self._started = true;
    c.turns++;
    self._turns++;
    EB.audio.play('click');
    self._update(false);
  },

  // Пересчитать воду и обновить всё на экране.
  // silent — без звуков, сообщений и проверки победы (старт игры и показ решения)
  _update: function (silent) {
    var self = this;
    var f = self._flood();
    var prev = self._last;
    self._last = f;

    self._cells.forEach(function (c) {
      var b = self._buttons[c.i];
      var wet = !!f.wet[c.i];
      b.classList.toggle('is-wet', wet);
      if (c.kind === 'pipe') {
        var r = ((c.turns % 4) + 4) % 4;
        b.querySelector('.pipes__piece').style.transform = 'rotate(' + (c.turns * 90) + 'deg)';
        // Сторону входа воды переводим в «свои» координаты трубы (она нарисована без поворота)
        b.querySelector('.pipes__water').innerHTML = wet ?
          self._waterSvg(self.BASE[c.type], self._rot(f.entry[c.i], 4 - r)) : '';
      } else if (c.kind !== 'empty') {
        b.querySelector('.pipes__special').innerHTML = self._specialSvg(c, f);
      }
      var label = EB.t(c.kind === 'pipe' ? 'mg.pipes.piece.' + c.type : 'mg.pipes.piece.' + c.kind);
      if (c.kind === 'target') label += ' ' + c.num;
      if (c.fixed && c.kind !== 'empty') label += ', ' + EB.t('mg.pipes.fixedLabel');
      if (wet) label += ', ' + EB.t('mg.pipes.wet');
      b.setAttribute('aria-label', label);
    });

    // Утечки: значок на краю клетки, откуда выливается вода
    self._box.querySelector('.pipes__leaks').innerHTML = f.leaks.map(function (l) {
      var s = self.SIDES.filter(function (q) { return q.bit === l.bit; })[0];
      var left = (l.c.x + 0.5 + s.dx * 0.5) / self._w * 100;
      var top = (l.c.y + 0.5 + s.dy * 0.5) / self._h * 100;
      return '<span class="pipes__leak" style="left:' + left + '%;top:' + top + '%">' + self._leakSvg() + '</span>';
    }).join('');

    // Список задач: значок «готово/ещё нет» + картинка + подпись
    var goals = self._goals(f);
    var goalsHtml = goals.map(function (g) {
      return '<li class="pipes__goal' + (g.done ? ' is-done' : '') + '" aria-label="' + g.name + ': ' +
        EB.t(g.done ? 'mg.pipes.goalDone' : 'mg.pipes.goalTodo') + '">' +
        (g.done ? EB.ui.icon('ok') : '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>') +
        self._goalPic(g.key) + '<span>' + g.name + '</span></li>';
    }).join('');
    var noLeaks = f.leaks.length === 0;
    goalsHtml += '<li class="pipes__goal pipes__goal--leaks' + (noLeaks ? ' is-done' : '') + '">' +
      EB.ui.icon(noLeaks ? 'ok' : 'warn') + '<span>' +
      (noLeaks ? EB.t('mg.pipes.goal.noLeaks') : EB.t('mg.pipes.leaks', { n: f.leaks.length })) + '</span></li>';
    self._box.querySelector('.pipes__goals').innerHTML = goalsHtml;
    self._box.querySelector('[data-s="turns"]').textContent = self._turns;
    self._showTime();

    if (silent || !prev) return f;
    if (self._isWin(f)) {
      self._win();
      return f;
    }

    // Обратная связь сразу после поворота
    var prevGoals = self._goals(prev);
    var newGoal = goals.filter(function (g, i) { return g.done && !prevGoals[i].done; })[0];
    var wetNow = f.wet.filter(Boolean).length;
    var wetBefore = prev.wet.filter(Boolean).length;
    if (newGoal) {
      EB.audio.play('correct');
      self._feedback(EB.t('mg.pipes.fb.' + newGoal.key, { n: newGoal.cell.num }), true);
    } else if (goals.every(function (g) { return g.done; })) {
      self._feedback(EB.t('mg.pipes.fb.almost'), false);
    } else if (wetNow > wetBefore) {
      self._feedback(EB.t('mg.pipes.fb.further'), true);
    } else if (wetNow < wetBefore) {
      self._feedback(EB.t('mg.pipes.fb.cut'), false);
    } else if (f.leaks.length > prev.leaks.length) {
      self._feedback(EB.t('mg.pipes.fb.leak'), false);
    }
    return f;
  },

  _feedback: function (text, good) {
    var fb = this._box.querySelector('.minigame__feedback');
    if (!fb) return;
    fb.textContent = text;
    fb.className = 'minigame__feedback is-' + (good ? 'good' : 'bad');
  },

  // ======================= Время =======================
  _portrait: function () {
    return !!(window.matchMedia && EB.config.portraitPauseQuery && window.matchMedia(EB.config.portraitPauseQuery).matches);
  },

  _tick: function () {
    var now = performance.now();
    var dt = now - (this._lastTick || now);
    this._lastTick = now;
    if (this._finished || !this._started) return;
    // Вкладка свёрнута или телефон повёрнут вертикально (игра на паузе) — время не идёт
    if (document.hidden || this._portrait()) return;
    this._elapsed += Math.min(dt, 1000);
    this._showTime();
    if (this._elapsed >= this._L.timeLimitSec * 1000) this._fail('time');
  },

  _fmt: function (sec) {
    sec = Math.max(0, Math.ceil(sec));
    var s = sec % 60;
    return Math.floor(sec / 60) + ':' + (s < 10 ? '0' : '') + s;
  },

  // Показываем, сколько времени осталось
  _showTime: function () {
    var el = this._box && this._box.querySelector('[data-s="time"]');
    if (el) el.textContent = this._fmt(this._L.timeLimitSec - this._elapsed / 1000);
  },

  // ======================= Конец игры =======================
  _quality: function () {
    var c = this._cfg, L = this._L;
    var t = this._elapsed / 1000;
    var timePen = EB.utils.clamp((t - L.parTimeSec) / (L.slowTimeSec - L.parTimeSec), 0, 1) * c.timePenaltyMax;
    var extra = Math.max(0, this._turns - this._minTurns - c.freeExtraTurns);
    var turnPen = EB.utils.clamp(extra / c.extraTurnsForMax, 0, 1) * c.turnsPenaltyMax;
    return EB.utils.clamp(1 - timePen - turnPen, c.minWinQuality, 1);
  },

  _win: function () {
    var self = this;
    if (self._finished) return;
    self.stop();
    var quality = self._quality();
    self._box.querySelector('.pipes__board').classList.add('is-done');
    self._feedback(EB.t('mg.pipes.win'), true);
    EB.audio.play('win');
    // Даём посмотреть, как вода бежит по готовому контуру, потом — итог
    self._winTimer = setTimeout(function () {
      self._summary(quality, [
        EB.t('mg.pipes.sum.time', { t: self._fmt(self._elapsed / 1000) }) + ' · ' +
          EB.t('mg.pipes.sum.turns', { n: self._turns, min: self._minTurns }),
        EB.t(quality >= 0.95 ? 'mg.pipes.sum.fast' : 'mg.pipes.sum.slow')
      ], true);
    }, self._cfg.winDelayMs);
  },

  // Время вышло или игрок попросил решение: показываем решение, качество — по доле собранного пути
  _fail: function (reason) {
    var self = this;
    if (self._finished) return;
    var share = self._share(self._last || self._flood());
    self.stop();
    var quality = EB.utils.clamp(share * self._cfg.failMaxQuality, 0, 1);
    // Поворачиваем трубы пути в правильное положение — вода бежит по решению
    self._path.forEach(function (c) { if (c.kind === 'pipe') c.turns += self._turnsToSolved(c); });
    self._update(true);
    self._box.querySelector('.pipes__board').classList.add('is-done');
    EB.audio.play(reason === 'time' ? 'error' : 'click');
    self._summary(quality, [
      EB.t(reason === 'time' ? 'mg.pipes.timeUp' : 'mg.pipes.shown'),
      EB.t('mg.pipes.sum.share', { pct: Math.round(share * 100) })
    ], false);
  },

  _summary: function (quality, lines, good) {
    var self = this;
    var foot = self._box.querySelector('.pipes__foot');
    self._box.querySelector('.pipes').classList.add('is-over');   // на низком экране прячем список целей
    self._box.querySelector('.pipes__task').textContent = EB.t('mg.pipes.lesson.' + self._variant);
    var rules = self._box.querySelector('.pipes__rules');
    if (rules) rules.remove();
    foot.innerHTML =
      '<ul class="pipes__summary">' + lines.map(function (t) { return '<li></li>'; }).join('') + '</ul>' +
      '<p class="minigame__feedback is-' + (good ? 'good' : 'bad') + '"></p>' +
      '<div class="panel__buttons"><button class="btn btn--primary btn--small" data-mg="done">' + EB.t('mg.finish') + '</button></div>';
    foot.querySelectorAll('.pipes__summary li').forEach(function (li, i) { li.textContent = lines[i]; });
    foot.querySelector('.minigame__feedback').textContent = EB.t('mg.pipes.sum.quality', { pct: Math.round(quality * 100) });
    // Клетки поля больше не нажимаются
    self._buttons.forEach(function (b) { b.tabIndex = -1; b.setAttribute('aria-disabled', 'true'); });
    var done = foot.querySelector('[data-mg="done"]');
    done.addEventListener('click', function () {
      if (self._doneSent) return;     // onDone — строго один раз
      self._doneSent = true;
      EB.audio.play('click');
      self._options.onDone({ quality: quality });
    });
    done.focus();
  },

  // ======================= Проверка раскладок =======================
  // Каждая раскладка в решённом виде должна давать победу. Возвращает список ошибок (пустой — всё хорошо).
  // Запускать, когда мини-игра закрыта: проверка перестраивает поле.
  selfTest: function () {
    var self = this;
    var errors = [];
    Object.keys(self.LAYOUTS).forEach(function (level) {
      self.LAYOUTS[level].forEach(function (rows, n) {
        try {
          self._build(rows);
          self._cells.forEach(function (c) { if (c.kind === 'pipe') { c.turns = 0; c.turns = self._turnsToSolved(c); } });
          var f = self._flood();
          if (!self._isWin(f)) errors.push(level + '#' + n + ': не собирается (утечек ' + f.leaks.length + ')');
          if (rows.some(function (r) { return r.trim().split(/\s+/).length !== self._w; })) errors.push(level + '#' + n + ': строки разной длины');
        } catch (err) {
          errors.push(level + '#' + n + ': ' + err.message);
        }
      });
    });
    return errors;
  }
};

// При отладке проверяем раскладки сразу при загрузке
if (EB.config && EB.config.debug) {
  (function () {
    var errors = EB.minigames.pipes.selfTest();
    if (errors.length) console.warn('pipes: ошибки в раскладках', errors);
  })();
}
