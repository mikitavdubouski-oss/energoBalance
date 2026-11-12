/*
  label.js — мини-игра «Энергоэтикетка» (уровень «Дом в агрогородке», проблема «Пустая морозилка»).

  Игрок в «магазине техники». В каждом раунде (холодильник, стиральная машина, лампа, морозильник)
  лежат 3 товара. На карточке товара: рисунок прибора, энергоэтикетка (класс показан буквой,
  цветом и длиной полоски — для дальтоников), цена в магазине и расход за год (молнии).
  Игрок выбирает товар и жмёт «Купить». После покупки — график «цена + электроэнергия за N лет»
  по всем вариантам и пояснение, почему так.

  Чему учит: важна не только цена в магазине, но и стоимость владения за годы.
  И «самый большой» не всегда лучший — размер выбирают по потребностям.

  Итог: quality 0..1 — среднее по раундам (лучший выбор — 1, второй по выгоде — partial, иначе 0).

  Как менять:
  - товары, цены, классы, годы, буквы классов — EB.config.minigames.label (config.js);
  - тексты — ключи mg.label.* в texts.ru.js / texts.be.js;
  - рисунки приборов и этикетки — функции _applianceSvg и _labelSvg ниже.
  ВСЕ ЦИФРЫ В ЭТОЙ ИГРЕ — УСЛОВНЫЕ ИГРОВЫЕ ЕДИНИЦЫ.
*/

EB.minigames.label = {
  // Цвета классов: от самого экономичного (зелёный) к самому расточительному (красный).
  // Цвет — только подсказка: класс всегда виден ещё буквой и длиной полоски.
  CLASS_COLORS: ['#1a9850', '#66bd63', '#a6d96a', '#fee08b', '#fdae61', '#f46d43', '#d73027'],
  // На каких цветах буква пишется тёмной (на светлых), на остальных — белой
  CLASS_DARK_TEXT: [false, false, true, true, true, false, false],
  // Светлые оттенки корпусов приборов (по порядку товара в config.js)
  TINTS: ['#dff1ff', '#ffe9c7', '#e3f6e6'],
  LINE: '#2b3a4a',

  start: function (box, options) {
    var self = EB.minigames.label;
    self._box = box;
    self._options = options;
    self._index = 0;          // номер раунда
    self._scores = [];        // баллы по раундам (1 / partial / 0)
    self._ranks = [];         // место выбранного товара по выгоде (0 — лучший)
    self._done = false;
    self._renderIntro();
  },

  stop: function () {
    clearTimeout(EB.minigames.label._timer);
  },

  _cfg: function () { return EB.config.minigames.label; },

  _round: function () { return this._cfg().rounds[this._index]; },

  // ---------- Помощники ----------

  // Буква класса по номеру (0 — лучший)
  _letter: function (cls) { return this._cfg().classes[cls]; },

  // Номер цвета для класса: если букв не 7, растягиваем палитру на их количество
  _colorIndex: function (cls) {
    var n = this._cfg().classes.length;
    if (n <= 1) return 0;
    return Math.round(cls * (this.CLASS_COLORS.length - 1) / (n - 1));
  },

  // Расходы на электроэнергию за все годы
  _use: function (item) {
    var c = this._cfg();
    return item.bolts * c.boltCost * c.years;
  },

  // Стоимость владения = цена + электроэнергия за все годы
  _total: function (item) { return item.price + this._use(item); },

  // Место товара по выгоде: 0 — самый выгодный, 1 — второй и т. д. (одинаковые суммы — одно место)
  _rank: function (round, item) {
    var self = this;
    var totals = round.items.map(function (it) { return self._total(it); });
    var distinct = totals.filter(function (t, i) { return totals.indexOf(t) === i; }).sort(function (a, b) { return a - b; });
    return distinct.indexOf(self._total(item));
  },

  _name: function (item) { return EB.t('mg.label.name.' + item.id); },

  // Крупный значок класса: буква на цветном квадрате (буква видна и без различения цветов)
  _badge: function (cls) {
    var ci = this._colorIndex(cls);
    return '<span class="lbl-badge" style="background:' + this.CLASS_COLORS[ci] + ';color:' +
      (this.CLASS_DARK_TEXT[ci] ? '#1d2b3a' : '#fff') + '">' + this._letter(cls) + '</span>';
  },

  // ---------- Рисунки (SVG, без русских слов внутри) ----------

  // Энергоэтикетка: шапка с молнией, полоски классов (чем хуже класс, тем длиннее полоска)
  // и чёрная стрелка с буквой у класса этого товара. viewBox 0 0 130 150.
  _labelSvg: function (cls) {
    var self = this;
    var letters = self._cfg().classes;
    var n = letters.length;
    var top = 32, area = 110;
    var h = area / n;
    var rows = '';
    letters.forEach(function (letter, i) {
      var y = top + i * h;
      var w = 34 + (n > 1 ? i * 56 / (n - 1) : 0);
      var ci = self._colorIndex(i);
      var pts = [8, y + 1, 8 + w - 7, y + 1, 8 + w, y + h / 2, 8 + w - 7, y + h - 1, 8, y + h - 1].join(' ');
      rows += '<polygon points="' + pts + '" fill="' + self.CLASS_COLORS[ci] + '"' +
        (i === cls ? ' stroke="' + self.LINE + '" stroke-width="2"' : '') + '/>' +
        '<text x="12" y="' + (y + h * 0.78) + '" font-size="' + (h * 0.8).toFixed(1) + '" font-weight="800" fill="' +
        (self.CLASS_DARK_TEXT[ci] ? '#1d2b3a' : '#fff') + '">' + letter + '</text>';
    });
    // Стрелка класса товара — справа, на уровне своей полоски
    var ay = top + cls * h;
    var arrow = '<polygon points="' + [127, ay - 3, 110, ay - 3, 100, ay + h / 2, 110, ay + h + 3, 127, ay + h + 3].join(' ') +
      '" fill="#1d2b3a"/>' +
      '<text x="116" y="' + (ay + h * 0.82) + '" font-size="' + (h * 0.95).toFixed(1) + '" font-weight="900" fill="#fff" text-anchor="middle">' +
      letters[cls] + '</text>';
    return '<rect x="2" y="2" width="126" height="146" rx="8" fill="#fff" stroke="' + self.LINE + '" stroke-width="3"/>' +
      '<rect x="2" y="2" width="126" height="24" rx="8" fill="#1f6fd1" stroke="' + self.LINE + '" stroke-width="3"/>' +
      '<path d="M68 6 56 17h8l-3 7 11-12h-8z" fill="#ffd166" stroke="' + self.LINE + '" stroke-width="1.5" stroke-linejoin="round"/>' +
      rows + arrow;
  },

  // Рисунок прибора. viewBox 0 0 100 110. order — номер товара в config.js (для оттенка и вида лампы).
  _applianceSvg: function (pic, item, order) {
    var L = this.LINE;
    var tint = this.TINTS[order % this.TINTS.length];
    var s = ' stroke="' + L + '" stroke-width="3.5"';
    if (pic === 'fridge') {
      return '<rect x="24" y="6" width="52" height="98" rx="8" fill="' + tint + '"' + s + '/>' +
        '<path d="M24 40h52"' + s + '/>' +
        '<rect x="64" y="16" width="5" height="16" rx="2.5" fill="' + L + '"/><rect x="64" y="50" width="5" height="24" rx="2.5" fill="' + L + '"/>' +
        '<path d="M32 14l6 6M38 14l-6 6M35 12v10" stroke="#5aa9e6" stroke-width="2.5" stroke-linecap="round"/>';
    }
    if (pic === 'washer') {
      return '<rect x="12" y="14" width="76" height="88" rx="8" fill="' + tint + '"' + s + '/>' +
        '<path d="M12 32h76"' + s + '/>' +
        '<circle cx="24" cy="23" r="4" fill="' + L + '"/><rect x="56" y="19" width="24" height="8" rx="3" fill="#9fb3c8"/>' +
        '<circle cx="50" cy="66" r="25" fill="#fff"' + s + '/>' +
        '<circle cx="50" cy="66" r="17" fill="#cfe8ff" stroke="' + L + '" stroke-width="2.5"/>' +
        '<path d="M36 70q7-7 14 0t14 0" stroke="#5aa9e6" stroke-width="3" fill="none" stroke-linecap="round"/>';
    }
    if (pic === 'lamp') {
      // Колба одинаковая, начинка разная: нить (order 0), спираль (1), светодиодные точки (2)
      var inside = order === 0
        ? '<path d="M42 50l4-8 4 8 4-8 4 8" stroke="#e8662a" stroke-width="3" fill="none" stroke-linejoin="round"/><path d="M42 50v18M58 50v18" stroke="' + L + '" stroke-width="2"/>'
        : order === 1
          ? '<path d="M40 44h20M40 52h20M40 60h20" stroke="#e8a000" stroke-width="3.5" stroke-linecap="round"/><path d="M40 44v16M60 44v16" stroke="#e8a000" stroke-width="3" stroke-linecap="round"/>'
          : '<rect x="38" y="42" width="24" height="24" rx="4" fill="#fff" stroke="' + L + '" stroke-width="2"/><circle cx="44" cy="48" r="2.6" fill="#ffb400"/><circle cx="56" cy="48" r="2.6" fill="#ffb400"/><circle cx="44" cy="60" r="2.6" fill="#ffb400"/><circle cx="56" cy="60" r="2.6" fill="#ffb400"/><circle cx="50" cy="54" r="2.6" fill="#ffb400"/>';
      return '<path d="M50 8a30 30 0 0 0-18 54c4 4 6 9 6 14h24c0-5 2-10 6-14A30 30 0 0 0 50 8z" fill="#fff6c4"' + s + '/>' +
        inside +
        '<rect x="36" y="78" width="28" height="9" rx="3" fill="#9aa6b2"' + s + '/><rect x="38" y="87" width="24" height="9" rx="3" fill="#9aa6b2"' + s + '/>' +
        '<path d="M44 100h12" stroke="' + L + '" stroke-width="4" stroke-linecap="round"/>';
    }
    // Морозильник: размер 3 — большой ларь во всю ширину, размер 1 — маленький шкафчик
    var size = item.size || 2;
    var w = 46 + (size - 1) * 22;           // 46 / 68 / 90
    var x = 50 - w / 2;
    var y = size >= 3 ? 46 : 40;
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (104 - y) + '" rx="6" fill="' + tint + '"' + s + '/>' +
      '<rect x="' + (x - 2) + '" y="' + (y - 8) + '" width="' + (w + 4) + '" height="12" rx="4" fill="#fff"' + s + '/>' +
      '<rect x="' + (50 - 8) + '" y="' + (y + 10) + '" width="16" height="5" rx="2.5" fill="' + L + '"/>' +
      '<path d="M' + (50 - 6) + ' ' + (y + 32) + 'l12 12M' + (50 + 6) + ' ' + (y + 32) + 'l-12 12M50 ' + (y + 30) + 'v16" stroke="#5aa9e6" stroke-width="3" stroke-linecap="round"/>';
  },

  // Значки «молний» расхода за год
  _bolts: function (n) {
    var html = '';
    for (var i = 0; i < n; i++) html += EB.ui.icon('bolt', 'lbl-bolt');
    return html;
  },

  // Размер квадратиками: закрашенные — сколько занимает, пустые — сколько осталось до 3 (форма, а не цвет)
  _sizeBoxes: function (n) {
    var html = '<span class="lbl-size" aria-hidden="true">';
    for (var i = 0; i < 3; i++) html += '<i class="lbl-size__box' + (i < n ? ' is-on' : '') + '"></i>';
    return html + '</span>';
  },

  // ---------- Экран 1: правила и пример этикетки ----------
  _renderIntro: function () {
    var self = this;
    var c = self._cfg();
    self._box.innerHTML =
      '<h2 class="minigame__title">' + EB.t('mg.label.title') + '</h2>' +
      '<p class="minigame__text">' + EB.t('mg.label.rules') + '</p>' +
      '<div class="lbl-intro">' +
        '<svg class="lbl-intro__label" viewBox="0 0 130 150" role="img" aria-label="' + EB.t('mg.label.example') + '">' + self._labelSvg(0) + '</svg>' +
        '<p class="lbl-intro__howto">' + EB.t('mg.label.howto', { best: c.classes[0], worst: c.classes[c.classes.length - 1] }) + '</p>' +
      '</div>' +
      '<p class="lbl-units">' + EB.t('mg.label.units') + '</p>' +
      '<div class="panel__buttons"><button class="btn btn--primary btn--small" data-mg="go">' + EB.t('mg.go') + '</button></div>';
    var go = self._box.querySelector('[data-mg="go"]');
    go.addEventListener('click', function () {
      EB.audio.play('click');
      self._renderRound();
    });
    go.focus();
  },

  // ---------- Экран 2: раунд «магазин» ----------
  _renderRound: function () {
    var self = this;
    var c = self._cfg();
    var round = self._round();
    self._selected = -1;
    self._bought = false;
    // Порядок товаров на полке перемешиваем, чтобы лучший не стоял всегда на одном месте
    self._shelf = EB.utils.shuffle(round.items.map(function (it, i) { return i; }));

    var cards = self._shelf.map(function (order, pos) {
      var item = round.items[order];
      var letter = self._letter(item.cls);
      var aria = EB.t('mg.label.card', { name: self._name(item), c: letter, price: item.price, bolts: item.bolts }) +
        (round.need ? ', ' + EB.t('mg.label.cardSize', { n: item.size }) : '');
      return '<button class="lbl-card" data-pos="' + pos + '" aria-pressed="false" aria-label="' + aria + '">' +
        '<span class="lbl-card__check" aria-hidden="true">' + EB.ui.icon('ok') + '</span>' +
        '<span class="lbl-card__name" aria-hidden="true">' + self._badge(item.cls) + '«' + self._name(item) + '»</span>' +
        '<span class="lbl-card__pics" aria-hidden="true">' +
          '<svg class="lbl-card__pic" viewBox="0 0 100 110">' + self._applianceSvg(round.pic, item, order) + '</svg>' +
          '<svg class="lbl-card__label" viewBox="0 0 130 150">' + self._labelSvg(item.cls) + '</svg>' +
        '</span>' +
        '<span class="lbl-card__row" aria-hidden="true">' + EB.ui.icon('coin', 'lbl-coin') + EB.t('mg.label.price') + ' <b>' + item.price + '</b></span>' +
        '<span class="lbl-card__row" aria-hidden="true">' + EB.t('mg.label.perYear') + ' <span class="lbl-bolts">' + self._bolts(item.bolts) + '</span></span>' +
        (round.need ? '<span class="lbl-card__row" aria-hidden="true">' + EB.t('mg.label.size') + ' ' + self._sizeBoxes(item.size) + '</span>' : '') +
      '</button>';
    }).join('');

    self._box.innerHTML =
      '<h2 class="minigame__title">' + EB.t('mg.label.title') + '</h2>' +
      '<p class="minigame__step">' + EB.t('mg.step', { n: self._index + 1, total: c.rounds.length }) + '</p>' +
      '<p class="minigame__text lbl-task">' + EB.t('mg.label.' + round.key + '.task', { years: c.years }) +
        (round.need ? ' <span class="lbl-need">' + EB.t('mg.label.need') + ' ' + self._sizeBoxes(round.need) + '</span>' : '') + '</p>' +
      '<div class="lbl-shelf">' + cards + '</div>' +
      '<p class="minigame__feedback" aria-live="polite"></p>' +
      '<div class="panel__buttons"><button class="btn btn--primary btn--small" data-mg="buy">' + EB.t('mg.label.buy') + '</button></div>';

    var list = self._box.querySelectorAll('.lbl-card');
    list.forEach(function (card, pos) {
      card.addEventListener('click', function () { self._select(pos); });
      // Стрелки переводят фокус между товарами, Enter/пробел — выбрать
      card.addEventListener('keydown', function (e) {
        var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0);
        if (!d) return;
        e.preventDefault();
        list[(pos + d + list.length) % list.length].focus();
      });
    });
    self._box.querySelector('[data-mg="buy"]').addEventListener('click', function () { self._buy(); });
    list[0].focus();
  },

  _select: function (pos) {
    var self = this;
    if (self._bought) return;
    self._selected = pos;
    EB.audio.play('click');
    self._box.querySelectorAll('.lbl-card').forEach(function (card, i) {
      card.classList.toggle('is-selected', i === pos);
      card.setAttribute('aria-pressed', String(i === pos));
    });
    var item = self._round().items[self._shelf[pos]];
    self._feedback(EB.t('mg.label.picked', { name: self._name(item) }), null);
  },

  _feedback: function (text, good) {
    var fb = this._box.querySelector('.minigame__feedback');
    if (!fb) return;
    fb.textContent = text;
    fb.className = 'minigame__feedback' + (good === null ? '' : ' is-' + (good ? 'good' : 'bad'));
  },

  // ---------- Покупка: оценка и график ----------
  _buy: function () {
    var self = this;
    var c = self._cfg();
    var round = self._round();
    if (self._bought) return;
    if (self._selected < 0) {
      EB.audio.play('error');
      self._feedback(EB.t('mg.label.pickFirst'), false);
      var first = self._box.querySelector('.lbl-card');
      if (first) first.focus();
      return;
    }
    self._bought = true;
    var chosenOrder = self._shelf[self._selected];
    var chosen = round.items[chosenOrder];
    var rank = self._rank(round, chosen);
    var score = rank === 0 ? 1 : (rank === 1 ? c.partial : 0);
    self._scores.push(score);
    self._ranks.push(rank);
    EB.audio.play(rank === 0 ? 'correct' : (rank === 1 ? 'coin' : 'error'));

    // Масштаб графика: самая дорогая за годы покупка — во всю ширину
    var maxTotal = Math.max.apply(null, round.items.map(function (it) { return self._total(it); }));
    var rows = self._shelf.map(function (order) {
      var item = round.items[order];
      var use = self._use(item);
      var total = item.price + use;
      var isBest = self._rank(round, item) === 0;
      var isChosen = order === chosenOrder;
      var tags = '';
      if (isBest) tags += '<span class="lbl-tag lbl-tag--best">' + EB.ui.icon('star') + EB.t('mg.label.best') + '</span>';
      if (isChosen) tags += '<span class="lbl-tag lbl-tag--chosen">' + EB.ui.icon('check') + EB.t('mg.label.chosen') + '</span>';
      return '<div class="lbl-row' + (isChosen ? ' is-chosen' : '') + (isBest ? ' is-best' : '') + '" role="listitem" aria-label="' +
          EB.t('mg.label.rowAria', { name: self._name(item), price: item.price, use: use, total: total }) + '">' +
        '<span class="lbl-row__who" aria-hidden="true">' + self._badge(item.cls) + '«' + self._name(item) + '»</span>' +
        '<span class="lbl-row__bar" aria-hidden="true">' +
          '<span class="lbl-row__price" data-w="' + (item.price / maxTotal * 100).toFixed(1) + '"></span>' +
          '<span class="lbl-row__use" data-w="' + (use / maxTotal * 100).toFixed(1) + '"></span>' +
        '</span>' +
        '<b class="lbl-row__total" aria-hidden="true">' + total + '</b>' +
        '<span class="lbl-row__tags" aria-hidden="true">' + tags + '</span>' +
      '</div>';
    }).join('');

    var shelf = self._box.querySelector('.lbl-shelf');
    var chart = EB.utils.el('div', { 'class': 'lbl-chart', html:
      '<p class="lbl-chart__title">' + EB.t('mg.label.chartTitle', { years: c.years }) + '</p>' +
      '<div class="lbl-legend" aria-hidden="true">' +
        '<span><i class="lbl-swatch lbl-swatch--price"></i>' + EB.ui.icon('coin', 'lbl-coin') + EB.t('mg.label.legendPrice') + '</span>' +
        '<span><i class="lbl-swatch lbl-swatch--use"></i>' + EB.ui.icon('bolt', 'lbl-bolt') + EB.t('mg.label.legendUse', { years: c.years }) + '</span>' +
      '</div>' +
      '<div class="lbl-rows" role="list">' + rows + '</div>' +
      '<p class="lbl-units">' + EB.t('mg.label.units') + '</p>'
    });
    shelf.replaceWith(chart);
    var task = self._box.querySelector('.lbl-task');
    if (task) task.remove();

    // Полоски «вырастают» до своей длины
    chart.querySelectorAll('[data-w]').forEach(function (bar) { bar.style.transitionDuration = c.chartAnimMs + 'ms'; });
    self._timer = setTimeout(function () {
      chart.querySelectorAll('[data-w]').forEach(function (bar) { bar.style.width = bar.getAttribute('data-w') + '%'; });
    }, 30);

    var verdict = rank === 0 ? 'best' : (rank === 1 ? 'second' : 'worst');
    var head = rank === 0 ? 'mg.great' : (rank === 1 ? 'mg.almost' : 'mg.miss');
    self._feedback(EB.t(head) + ' ' + EB.t('mg.label.verdict.' + verdict) + ' ' + EB.t('mg.label.' + round.key + '.why'), rank === 0);

    var last = self._index >= c.rounds.length - 1;
    var oldBtn = self._box.querySelector('[data-mg="buy"]');
    var next = EB.utils.el('button', { 'class': 'btn btn--primary btn--small', 'data-mg': 'next', text: EB.t('mg.next') });
    next.addEventListener('click', function () {
      EB.audio.play('click');
      if (last) {
        self._renderSummary();
      } else {
        self._index++;
        self._renderRound();
      }
    });
    oldBtn.replaceWith(next);
    next.focus();
  },

  // ---------- Экран 3: итог ----------
  _renderSummary: function () {
    var self = this;
    var c = self._cfg();
    clearTimeout(self._timer);
    var sum = self._scores.reduce(function (a, b) { return a + b; }, 0);
    var quality = self._scores.length ? sum / self._scores.length : 0;
    var best = self._ranks.filter(function (r) { return r === 0; }).length;
    EB.audio.play(quality >= EB.config.minigameGoodQuality ? 'win' : 'click');

    // По раунду: рисунок прибора + значок итога (кружок с галочкой / звезда-контур / треугольник — разная форма)
    var icons = c.rounds.map(function (round, i) {
      var r = self._ranks[i];
      var status = r === 0 ? 'ok' : (r === 1 ? 'starEmpty' : 'warn');
      var item = round.items[0];
      return '<span class="lbl-sum__item lbl-sum__item--' + (r === 0 ? 'best' : (r === 1 ? 'second' : 'worst')) + '">' +
        '<svg viewBox="0 0 100 110" aria-hidden="true">' + self._applianceSvg(round.pic, round.need ? { size: round.need } : item, 2) + '</svg>' +
        EB.ui.icon(status) + '</span>';
    }).join('');

    self._box.innerHTML =
      '<h2 class="minigame__title">' + EB.t('mg.label.title') + '</h2>' +
      '<div class="lbl-sum" aria-hidden="true">' + icons + '</div>' +
      '<p class="minigame__feedback ' + (quality >= EB.config.minigameGoodQuality ? 'is-good' : 'is-bad') + '">' +
        EB.t('mg.label.summary', { best: best, total: c.rounds.length }) + '</p>' +
      '<p class="minigame__text">' + EB.t('mg.label.outro') + '</p>' +
      '<div class="panel__buttons"><button class="btn btn--primary btn--small" data-mg="finish">' + EB.t('mg.finish') + '</button></div>';
    var done = self._box.querySelector('[data-mg="finish"]');
    done.addEventListener('click', function () {
      if (self._done) return;          // onDone — строго один раз
      self._done = true;
      EB.audio.play('click');
      self._options.onDone({ quality: quality });
    });
    done.focus();
  }
};
