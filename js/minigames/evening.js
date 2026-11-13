/*
  evening.js — мини-игра «Обход офиса» (уровень «Офис», проблема «Компьютеры без хозяев»).

  На экране — план офиса (вид сверху): рабочий зал, переговорная, кухня, серверная и коридор.
  Каждый прибор — кнопка. Нажал — прибор выключился (или уснул), нажал ещё раз — снова включился.
  Задача: за отведённое время выключить всё лишнее и НЕ трогать то, что должно работать
  (сервер, холодильник, аварийный указатель «Выход», датчик сигнализации).
  Выключил нужное — сразу пояснение «это должно работать, потому что…», прибор мигает
  и включается обратно, а в копилку идёт ошибка.

  Раунды (данные — EB.config.minigames.evening.rounds):
  1. «Обеденный перерыв» — мониторы в спящий режим, свет и телевизор в пустых комнатах выключить,
     а компьютеры НЕ выключать (коллеги вернутся через час, работа не сохранена).
  2. «Конец рабочего дня» — выключить всё лишнее полностью, а свет в коридоре — последним, уходя.
  Так игра учит не «выключать всё подряд», а выбирать, что усыпить, что выключить, а что не трогать.

  Итог: quality = (сделано правильно во всех раундах / сколько было нужно сделать)
                  − ошибки × mistakePenalty, в пределах 0..1.

  Управление: мышь и касание (нажатие на прибор), клавиатура — Tab / стрелки, Enter или пробел.
  Подпись прибора (название и состояние) — во всплывающей подсказке и в aria-label.

  Как менять:
  - время, штраф, состав раундов — EB.config.minigames.evening в config.js;
  - где стоит прибор на плане — LAYOUT ниже (x, y — центр кнопки в единицах рисунка 1000 × 560);
  - тексты — ключи mg.evening.* в texts.ru.js и texts.be.js.
*/

EB.minigames.evening = {
  // Приборы на плане. type — вид прибора: по нему берутся тексты mg.evening.dev.<type>
  // и цель из раунда в config.js. icon — рисунок из ICONS. n — номер (у мониторов и компьютеров).
  LAYOUT: [
    { id: 'mon1', type: 'monitor', icon: 'monitor', n: 1, x: 90, y: 95 },
    { id: 'pc1', type: 'pc', icon: 'pc', n: 1, x: 190, y: 95 },
    { id: 'mon2', type: 'monitor', icon: 'monitor', n: 2, x: 360, y: 95 },
    { id: 'pc2', type: 'pc', icon: 'pc', n: 2, x: 460, y: 95 },
    { id: 'mon3', type: 'monitor', icon: 'monitor', n: 3, x: 90, y: 265 },
    { id: 'pc3', type: 'pc', icon: 'pc', n: 3, x: 190, y: 265 },
    { id: 'ac', type: 'ac', icon: 'ac', x: 580, y: 62 },
    { id: 'lightOpen', type: 'lightOpen', icon: 'lamp', x: 330, y: 240 },
    { id: 'chargers', type: 'chargers', icon: 'chargers', x: 460, y: 262 },
    { id: 'printer', type: 'printer', icon: 'printer', x: 580, y: 250 },
    { id: 'lightMeeting', type: 'lightMeeting', icon: 'lamp', x: 740, y: 100 },
    { id: 'tv', type: 'tv', icon: 'tv', x: 900, y: 100 },
    { id: 'cooler', type: 'cooler', icon: 'cooler', x: 730, y: 325 },
    { id: 'server', type: 'server', icon: 'server', x: 910, y: 325 },
    { id: 'fridge', type: 'fridge', icon: 'fridge', x: 720, y: 482 },
    { id: 'coffee', type: 'coffee', icon: 'coffee', x: 880, y: 482 },
    { id: 'exit', type: 'exit', icon: 'exit', x: 80, y: 440 },
    { id: 'alarm', type: 'alarm', icon: 'alarm', x: 215, y: 475 },
    { id: 'lightHall', type: 'lightHall', icon: 'lamp', x: 390, y: 470 }
  ],

  // Рисунки приборов (SVG, viewBox 0 0 60 60). Элементы с классом eve-rays видны, только когда прибор работает.
  ICONS: {
    monitor: '<rect x="5" y="8" width="50" height="34" rx="4" fill="#8fd0ff" stroke="#2b3a4a" stroke-width="3"/>' +
      '<circle cx="20" cy="22" r="6" fill="#ffd166" stroke="#2b3a4a" stroke-width="2"/>' +
      '<path d="M27 35q9-13 22-5" fill="none" stroke="#7b5cff" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="26" y="42" width="8" height="7" fill="#2b3a4a"/>' +
      '<rect x="16" y="48" width="28" height="6" rx="3" fill="#9aa6b2" stroke="#2b3a4a" stroke-width="2"/>',
    pc: '<rect x="17" y="5" width="26" height="50" rx="4" fill="#6b7c8f" stroke="#2b3a4a" stroke-width="3"/>' +
      '<rect x="22" y="12" width="16" height="4" rx="2" fill="#2b3a4a"/>' +
      '<rect x="22" y="20" width="16" height="4" rx="2" fill="#2b3a4a"/>' +
      '<circle cx="30" cy="42" r="6" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="2"/>' +
      '<path d="M30 38v4" stroke="#2b3a4a" stroke-width="2" stroke-linecap="round"/>',
    lamp: '<g class="eve-rays" stroke="#ffb400" stroke-width="4" stroke-linecap="round">' +
      '<path d="M30 3v7M30 50v7M3 30h7M50 30h7M11 11l5 5M44 44l5 5M49 11l-5 5M16 44l-5 5"/></g>' +
      '<circle cx="30" cy="30" r="15" fill="#ffe066" stroke="#2b3a4a" stroke-width="3"/>' +
      '<circle cx="30" cy="30" r="7" fill="#fff6c2"/>',
    tv: '<rect x="4" y="10" width="52" height="34" rx="3" fill="#4aa3f0" stroke="#2b3a4a" stroke-width="3"/>' +
      '<path d="M8 40l13-13 8 8 6-6 17 11z" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="44" cy="19" r="4" fill="#ffd166"/>' +
      '<path d="M20 53h20M30 44v9" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round"/>',
    ac: '<rect x="4" y="12" width="52" height="26" rx="6" fill="#f3f8fc" stroke="#2b3a4a" stroke-width="3"/>' +
      '<path d="M10 31h40" stroke="#2b3a4a" stroke-width="2"/>' +
      '<circle cx="47" cy="20" r="3" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="1.5"/>' +
      '<g class="eve-rays" stroke="#4aa3f0" stroke-width="3.5" stroke-linecap="round"><path d="M17 43l-4 10M30 43v11M43 43l4 10"/></g>',
    printer: '<rect x="15" y="5" width="30" height="15" fill="#fff" stroke="#2b3a4a" stroke-width="3"/>' +
      '<rect x="5" y="18" width="50" height="24" rx="5" fill="#b9a6ff" stroke="#2b3a4a" stroke-width="3"/>' +
      '<rect x="14" y="36" width="32" height="19" fill="#fff" stroke="#2b3a4a" stroke-width="3"/>' +
      '<path d="M19 43h22M19 49h15" stroke="#9aa6b2" stroke-width="2.5"/>' +
      '<circle cx="47" cy="27" r="3" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="1.5"/>',
    chargers: '<path d="M17 33V20q0-7 6-9M31 33V14M45 33V22q0-6-5-8" stroke="#2b3a4a" stroke-width="3" fill="none"/>' +
      '<rect x="18" y="5" width="10" height="11" rx="2" fill="#f3f8fc" stroke="#2b3a4a" stroke-width="2"/>' +
      '<rect x="35" y="8" width="10" height="11" rx="2" fill="#f3f8fc" stroke="#2b3a4a" stroke-width="2"/>' +
      '<rect x="3" y="31" width="54" height="20" rx="6" fill="#f3f8fc" stroke="#2b3a4a" stroke-width="3"/>' +
      '<rect x="11" y="36" width="12" height="10" rx="2" fill="#2b3a4a"/><rect x="25" y="36" width="12" height="10" rx="2" fill="#2b3a4a"/>' +
      '<rect x="41" y="35" width="11" height="12" rx="2" fill="#ff8c69" stroke="#2b3a4a" stroke-width="2"/>',
    coffee: '<rect x="11" y="5" width="38" height="50" rx="5" fill="#d9a066" stroke="#2b3a4a" stroke-width="3"/>' +
      '<rect x="17" y="11" width="26" height="10" rx="2" fill="#2b3a4a"/>' +
      '<circle cx="38" cy="16" r="2.5" fill="#7ad9b5"/>' +
      '<rect x="22" y="37" width="16" height="13" rx="2" fill="#fff" stroke="#2b3a4a" stroke-width="2"/>' +
      '<g class="eve-rays" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M27 33q-3-3 0-7M33 33q-3-3 0-7"/></g>',
    cooler: '<path d="M20 4h20l-3 18H23z" fill="#9cd8ff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>' +
      '<rect x="13" y="22" width="34" height="34" rx="4" fill="#f3f8fc" stroke="#2b3a4a" stroke-width="3"/>' +
      '<circle cx="23" cy="33" r="4" fill="#e8662a" stroke="#2b3a4a" stroke-width="1.5"/>' +
      '<circle cx="37" cy="33" r="4" fill="#4aa3f0" stroke="#2b3a4a" stroke-width="1.5"/>' +
      '<rect x="18" y="44" width="24" height="5" rx="2" fill="#9aa6b2"/>',
    server: '<rect x="11" y="3" width="38" height="54" rx="4" fill="#3e4c5e" stroke="#2b3a4a" stroke-width="3"/>' +
      '<rect x="16" y="9" width="28" height="10" rx="2" fill="#6b7c8f"/>' +
      '<rect x="16" y="24" width="28" height="10" rx="2" fill="#6b7c8f"/>' +
      '<rect x="16" y="39" width="28" height="10" rx="2" fill="#6b7c8f"/>' +
      '<circle class="eve-blink" cx="38" cy="14" r="2.8" fill="#7ad9b5"/>' +
      '<circle cx="38" cy="29" r="2.8" fill="#ffd166"/>' +
      '<circle class="eve-blink" cx="38" cy="44" r="2.8" fill="#7ad9b5"/>',
    fridge: '<rect x="13" y="3" width="34" height="54" rx="5" fill="#eaf6ff" stroke="#2b3a4a" stroke-width="3"/>' +
      '<path d="M13 22h34" stroke="#2b3a4a" stroke-width="3"/>' +
      '<path d="M19 9v8M19 28v12" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M37 34v12M31 40h12M33 36l8 8M41 36l-8 8" stroke="#4aa3f0" stroke-width="2.2" stroke-linecap="round"/>',
    exit: '<rect x="3" y="12" width="54" height="36" rx="4" fill="#2fbf71" stroke="#2b3a4a" stroke-width="3"/>' +
      '<rect x="40" y="18" width="11" height="24" fill="#fff" stroke="#2b3a4a" stroke-width="2"/>' +
      '<circle cx="17" cy="20" r="3.5" fill="#fff"/>' +
      '<path d="M17 25l-2 9 5 3-1 6M16 28l-6 3M16 29l6 3M15 34l-5 7" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M26 30h9m-3-3 3 3-3 3" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    alarm: '<path d="M13 8h34l-5 26H18z" fill="#f3f8fc" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>' +
      '<circle cx="30" cy="21" r="7" fill="#b9a6ff" stroke="#2b3a4a" stroke-width="2"/>' +
      '<circle cx="41" cy="13" r="2.5" fill="#ff8c69"/>' +
      '<g class="eve-rays" stroke="#7b5cff" stroke-width="3" fill="none" stroke-linecap="round"><path d="M21 41q9 7 18 0M15 47q15 12 30 0"/></g>'
  },

  // Значок состояния в углу кнопки: разная ФОРМА, а не только цвет (для дальтоников)
  //   работает — жёлтый кружок с молнией; спит — луна; выключено — перечёркнутая серая молния.
  BADGE: '<g class="eve-b-on"><circle cx="12" cy="12" r="10.5" fill="#ffd166" stroke="#2b3a4a" stroke-width="2"/>' +
      '<path d="M13 4 7 13h4l-1 7 6-9h-4z" fill="#2b3a4a"/></g>' +
    '<g class="eve-b-sleep"><circle cx="12" cy="12" r="10.5" fill="#d9ccff" stroke="#2b3a4a" stroke-width="2"/>' +
      '<path d="M14 5a7.5 7.5 0 1 0 5 12 6 6 0 0 1-5-12z" fill="#2b3a4a"/></g>' +
    '<g class="eve-b-off"><circle cx="12" cy="12" r="10.5" fill="#fff" stroke="#2b3a4a" stroke-width="2"/>' +
      '<path d="M13 4 7 13h4l-1 7 6-9h-4z" fill="#9aa6b2"/>' +
      '<path d="M5.5 18.5 18.5 5.5" stroke="#2b3a4a" stroke-width="2.6" stroke-linecap="round"/></g>',

  start: function (box, options) {
    var self = EB.minigames.evening;
    self._box = box;
    self._options = options;
    self._round = 0;
    self._total = { done: 0, targets: 0, mistakes: 0 };
    self._finished = false;
    self._doneCalled = false;
    self._timeouts = [];
    self._renderIntro();
  },

  stop: function () {
    var self = EB.minigames.evening;
    self._finished = true;
    self._playing = false;
    clearInterval(self._interval);
    self._interval = null;
    clearTimeout(self._tipTimer);
    (self._timeouts || []).forEach(function (t) { clearTimeout(t); });
    self._timeouts = [];
  },

  _cfg: function () { return EB.config.minigames.evening; },
  _roundCfg: function () { return this._cfg().rounds[this._round]; },

  // Таймер, который сам снимется в stop()
  _later: function (fn, ms) {
    this._timeouts.push(setTimeout(fn, ms));
  },

  // Что сделать с прибором в этом раунде: 'off' / 'sleep' / 'keep' / undefined (прибора нет в раунде)
  _target: function (d) { return this._roundCfg().devices[d.type]; },
  _devices: function () {
    var self = this;
    return self.LAYOUT.filter(function (d) { return !!self._target(d); });
  },
  _dev: function (id) { return this.LAYOUT.filter(function (d) { return d.id === id; })[0]; },
  _name: function (d) { return EB.t('mg.evening.dev.' + d.type, { n: d.n }); },
  _badgeSvg: function (cls) {
    return '<svg class="eve-badge ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + this.BADGE + '</svg>';
  },

  _stepText: function () {
    var r = this._roundCfg();
    return EB.t('mg.evening.round', { n: this._round + 1, total: this._cfg().rounds.length }) + ': ' +
      EB.t('mg.evening.round.' + r.key);
  },

  // ---------- Экран перед раундом: что за ситуация и как читать значки ----------
  _renderIntro: function () {
    var self = this;
    var r = self._roundCfg();
    self._box.innerHTML =
      '<h2 class="minigame__title">' + EB.t('mg.evening.title') + '</h2>' +
      (self._round === 0 ? '<p class="minigame__text eve-rules">' + EB.t('mg.evening.rules') + '</p>' : '') +
      '<p class="eve-round-name"></p>' +
      '<p class="minigame__text"></p>' +
      '<div class="eve-legend"><span class="eve-legend__title">' + EB.t('mg.evening.legend') + '</span>' +
        ['on', 'sleep', 'off'].map(function (s) {
          return '<span class="eve-legend__item is-' + s + '">' + self._badgeSvg() + EB.t('mg.evening.state.' + s) + '</span>';
        }).join('') +
      '</div>' +
      '<div class="panel__buttons"><button class="btn btn--primary btn--small" data-mg="go">' + EB.t('mg.evening.go') + '</button></div>';
    self._box.querySelector('.eve-round-name').textContent = self._stepText();
    self._box.querySelectorAll('.minigame__text')[self._round === 0 ? 1 : 0].textContent = EB.t('mg.evening.round.' + r.key + '.desc');
    var go = self._box.querySelector('[data-mg="go"]');
    go.addEventListener('click', function () {
      EB.audio.play('click');
      self._startRound();
    });
    go.focus();
  },

  // ---------- Раунд ----------
  _startRound: function () {
    var self = this;
    var r = self._roundCfg();
    self._state = {};
    self._devices().forEach(function (d) { self._state[d.id] = 'on'; });   // в начале всё работает
    self._roundMistakes = 0;
    self._lastAnnounced = false;
    self._timeLeft = r.timeSec * 1000;
    self._playing = true;
    self._renderPlay();
    self._lastTick = Date.now();
    self._interval = setInterval(function () { self._tick(); }, 200);
  },

  _renderPlay: function () {
    var self = this;
    var r = self._roundCfg();
    var devs = self._devices().map(function (d) {
      return '<button class="eve-dev is-on" data-id="' + d.id + '" style="left:' + (d.x / 10) + '%;top:' + (d.y / 5.6) + '%">' +
        '<svg class="eve-dev__pic" viewBox="0 0 60 60" aria-hidden="true">' + self.ICONS[d.icon] + '</svg>' +
        self._badgeSvg('eve-dev__badge') + '</button>';
    }).join('');
    self._box.innerHTML =
      '<div class="eve-play">' +
        '<div class="eve-side">' +
          '<h2 class="minigame__title">' + EB.t('mg.evening.title') + '</h2>' +
          '<p class="minigame__step"></p>' +
          '<p class="eve-goal">' + EB.t('mg.evening.goal.' + r.key) + '</p>' +
          '<div class="eve-status">' +
            '<div class="mini-meter eve-meter eve-meter--time"><span>' + EB.ui.icon('timer') + '<i class="eve-lbl">' + EB.t('mg.evening.time') + '</i></span>' +
              '<span class="mini-meter__bar"><span></span></span><b></b></div>' +
            '<div class="mini-meter eve-meter eve-meter--done"><span>' + EB.ui.icon('check') + '<i class="eve-lbl">' + EB.t('mg.evening.done') + '</i></span>' +
              '<span class="mini-meter__bar"><span></span></span><b></b></div>' +
            '<p class="eve-mist">' + EB.ui.icon('warn') + '<span></span></p>' +
          '</div>' +
          '<p class="minigame__feedback eve-feedback" aria-live="polite"></p>' +
        '</div>' +
        '<div class="eve-wrap"><div class="eve-board' + (r.key === 'lunch' ? '' : ' is-night') + '">' +
          '<svg class="eve-plan" viewBox="0 0 1000 560" aria-hidden="true">' + self._planSvg() + '</svg>' +
          devs +
          '<div class="eve-tip" hidden></div>' +
        '</div></div>' +
      '</div>';
    self._box.querySelector('.minigame__step').textContent = self._stepText();
    self._board = self._box.querySelector('.eve-board');
    self._tip = self._box.querySelector('.eve-tip');

    self._box.querySelectorAll('.eve-dev').forEach(function (btn) {
      var id = btn.getAttribute('data-id');
      btn.addEventListener('click', function () { self._click(id); });
      btn.addEventListener('pointerenter', function () { self._showTip(btn); });
      btn.addEventListener('pointerleave', function () { if (document.activeElement !== btn) self._hideTip(); });
      btn.addEventListener('focus', function () { self._showTip(btn); });
      btn.addEventListener('blur', function () { self._hideTip(); });
    });
    // Стрелки: перейти к ближайшему прибору в эту сторону
    self._board.addEventListener('keydown', function (e) {
      var dirs = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] };
      var dir = dirs[e.key];
      var cur = e.target.closest && e.target.closest('.eve-dev');
      if (!dir || !cur) return;
      e.preventDefault();
      var next = self._nearest(self._dev(cur.getAttribute('data-id')), dir);
      if (next) self._box.querySelector('.eve-dev[data-id="' + next.id + '"]').focus();
    });

    self._devices().forEach(function (d) { self._updateDev(d); });
    self._updateStatus();
    self._updateTimer();
    self._box.querySelector('.eve-dev').focus();
  },

  // Ближайший прибор в направлении dir: вдоль направления — близко, поперёк — штраф ×2
  _nearest: function (from, dir) {
    var best = null, bestScore = Infinity;
    this._devices().forEach(function (d) {
      var dx = d.x - from.x, dy = d.y - from.y;
      var along = dx * dir[0] + dy * dir[1];
      if (along <= 0) return;
      var across = Math.abs(dx * dir[1]) + Math.abs(dy * dir[0]);
      var score = along + across * 2;
      if (score < bestScore) { bestScore = score; best = d; }
    });
    return best;
  },

  // План офиса: комнаты, стены, мебель. Тёмные «шторки» eve-shade появляются, когда в комнате выключен свет.
  _planSvg: function () {
    var line = 'stroke="#2b3a4a" stroke-width="3"';
    return '' +
      // Полы комнат
      '<rect x="0" y="0" width="640" height="380" fill="#fff3dc"/>' +                       // рабочий зал
      '<rect x="640" y="0" width="360" height="250" fill="#e3f0ff"/>' +                     // переговорная
      '<rect x="640" y="250" width="180" height="150" fill="#eef2f6"/>' +                   // холл с кулером
      '<rect x="820" y="250" width="180" height="150" fill="#ece6ff"/>' +                   // серверная
      '<rect x="640" y="400" width="360" height="160" fill="#e6f6ea"/>' +                   // кухня
      '<path d="M640 430h360M640 460h360M640 490h360M640 520h360M680 400v160M720 400v160M760 400v160M800 400v160M840 400v160M880 400v160M920 400v160M960 400v160" stroke="#cfe9d6" stroke-width="2"/>' +
      '<rect x="0" y="380" width="640" height="180" fill="#e9edf2"/>' +                     // коридор
      '<rect x="40" y="410" width="560" height="120" rx="16" fill="#dbe3ec"/>' +           // ковровая дорожка
      // Мебель рабочего зала: столы и стулья
      '<rect x="35" y="50" width="210" height="90" rx="8" fill="#e8b77d" ' + line + '/>' +
      '<rect x="305" y="50" width="210" height="90" rx="8" fill="#e8b77d" ' + line + '/>' +
      '<rect x="35" y="220" width="210" height="90" rx="8" fill="#e8b77d" ' + line + '/>' +
      '<circle cx="140" cy="172" r="20" fill="#7aa7d9" ' + line + '/>' +
      '<circle cx="410" cy="172" r="20" fill="#7aa7d9" ' + line + '/>' +
      '<circle cx="140" cy="342" r="20" fill="#7aa7d9" ' + line + '/>' +
      '<circle cx="610" cy="345" r="22" fill="#5cc28a" ' + line + '/><circle cx="610" cy="345" r="9" fill="#3e9b67"/>' +  // растение
      // Переговорная: стол со стульями
      '<rect x="690" y="165" width="260" height="56" rx="26" fill="#d9a066" ' + line + '/>' +
      '<circle cx="730" cy="236" r="12" fill="#7aa7d9" ' + line + '/><circle cx="820" cy="236" r="12" fill="#7aa7d9" ' + line + '/><circle cx="910" cy="236" r="12" fill="#7aa7d9" ' + line + '/>' +
      // Серверная: стойка, кухня: столешница и стол
      '<rect x="860" y="270" width="100" height="110" rx="6" fill="#c9bff2" ' + line + '/>' +
      '<rect x="655" y="440" width="330" height="85" rx="10" fill="#f3f8fc" ' + line + '/>' +
      '<circle cx="800" cy="540" r="10" fill="#9aa6b2"/>' +
      // Шторки темноты (по комнатам со своим выключателем света)
      '<rect class="eve-shade eve-shade--open" x="0" y="0" width="640" height="380" fill="#14203a"/>' +
      '<rect class="eve-shade eve-shade--meeting" x="640" y="0" width="360" height="250" fill="#14203a"/>' +
      '<rect class="eve-shade eve-shade--hall" x="0" y="380" width="640" height="180" fill="#14203a"/>' +
      // Окна в верхней стене (днём — небо, вечером — тёмные)
      '<rect class="eve-win" x="40" y="0" width="200" height="12"/>' +
      '<rect class="eve-win" x="310" y="0" width="200" height="12"/>' +
      '<rect class="eve-win" x="690" y="0" width="260" height="12"/>' +
      // Стены с проёмами-дверями
      '<g stroke="#2b3a4a" stroke-width="8" stroke-linecap="round" fill="none">' +
        '<path d="M4 4H996V556H4V520M4 420V4"/>' +                        // наружные стены, слева — выход
        '<path d="M4 380H250M340 380H640"/>' +                            // зал / коридор
        '<path d="M640 4V140M640 220V250H700M770 250H1000"/>' +           // переговорная
        '<path d="M640 250V300M640 370V400H680M770 400H1000"/>' +         // холл / кухня
        '<path d="M820 250V330M820 390V400"/>' +                          // серверная
      '</g>' +
      // Стеклянная стена переговорной и дверь выхода
      '<path d="M642 140V220" stroke="#8fd0ff" stroke-width="6"/>' +
      '<path d="M4 420L60 430" stroke="#2b3a4a" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M60 430A58 58 0 0 1 4 520" stroke="#2b3a4a" stroke-width="2" stroke-dasharray="6 6" fill="none"/>';
  },

  // ---------- Нажатие на прибор ----------
  _click: function (id) {
    var self = this;
    if (!self._playing) return;
    var d = self._dev(id);
    var r = self._roundCfg();
    var target = self._target(d);
    var btn = self._box.querySelector('.eve-dev[data-id="' + id + '"]');

    // Нужный прибор: ошибка, пояснение, прибор мигает и включается обратно
    if (target === 'keep') {
      if (btn.classList.contains('is-flicker')) return;
      self._roundMistakes++;
      self._total.mistakes++;
      EB.audio.play('error');
      self._feedback(EB.t('mg.evening.keep.' + d.type), 'bad');
      btn.style.animationDuration = Math.round(self._cfg().flickerMs / 3) + 'ms';
      btn.classList.add('is-flicker');
      self._later(function () { btn.classList.remove('is-flicker'); }, self._cfg().flickerMs);
      self._updateStatus();
      return;
    }

    // «Последний» прибор (свет в коридоре) ждёт, пока не сделано всё остальное
    if (d.id === r.last && self._state[id] === 'on' && !self._othersDone()) {
      EB.audio.play('click');
      self._feedback(EB.t('mg.evening.lastLater'), '');
      return;
    }

    if (self._state[id] === 'on') {
      self._state[id] = target;                         // выключить или усыпить
      EB.audio.play('switch');
      var text = EB.t('mg.evening.why.' + d.type + '.' + target);
      if (r.last && d.id !== r.last && self._othersDone() && !self._lastAnnounced) {
        self._lastAnnounced = true;
        text += ' ' + EB.t('mg.evening.lastNow');
      }
      self._feedback(text, 'good');
    } else {
      self._state[id] = 'on';                           // передумал — включить обратно
      EB.audio.play('click');
      self._feedback(EB.t('mg.evening.undo', { name: self._name(d) }), '');
    }
    self._updateDev(d);
    self._showTip(btn);
    self._updateStatus();

    if (self._allDone()) {
      EB.audio.play('correct');
      self._endRound(false);
    }
  },

  // Сделано ли всё, кроме «последнего» прибора
  _othersDone: function () {
    var self = this;
    var last = self._roundCfg().last;
    return self._devices().every(function (d) {
      var t = self._target(d);
      return t === 'keep' || d.id === last || self._state[d.id] === t;
    });
  },

  _allDone: function () {
    var self = this;
    return self._devices().every(function (d) {
      var t = self._target(d);
      return t === 'keep' || self._state[d.id] === t;
    });
  },

  // Сколько нужно сделать и сколько уже сделано
  _count: function () {
    var self = this;
    var c = { done: 0, targets: 0, left: [] };
    self._devices().forEach(function (d) {
      var t = self._target(d);
      if (t === 'keep') return;
      c.targets++;
      if (self._state[d.id] === t) c.done++;
      else c.left.push(self._name(d));
    });
    return c;
  },

  // ---------- Обновление экрана ----------
  _updateDev: function (d) {
    var btn = this._box.querySelector('.eve-dev[data-id="' + d.id + '"]');
    var state = this._state[d.id];
    btn.classList.remove('is-on', 'is-off', 'is-sleep');
    btn.classList.add('is-' + state);
    btn.setAttribute('aria-label', EB.t('mg.evening.tip', { name: this._name(d), state: EB.t('mg.evening.state.' + state) }));
    // Свет в комнате выключен — комната темнеет
    var rooms = { lightOpen: 'open', lightMeeting: 'meeting', lightHall: 'hall' };
    if (rooms[d.id]) this._board.classList.toggle('dark-' + rooms[d.id], state === 'off');
  },

  _updateStatus: function () {
    var self = this;
    var c = self._count();
    var m = self._box.querySelector('.eve-meter--done');
    m.querySelector('.mini-meter__bar span').style.width = (c.targets ? c.done / c.targets * 100 : 0) + '%';
    m.querySelector('b').textContent = c.done + '/' + c.targets;
    self._box.querySelector('.eve-mist span').textContent = EB.t('mg.evening.mistakes', { n: self._roundMistakes });
    // Свет в коридоре: когда остальное сделано — пульсирует, «пора выключать»
    var last = self._roundCfg().last;
    if (last) {
      var lastBtn = self._box.querySelector('.eve-dev[data-id="' + last + '"]');
      lastBtn.classList.toggle('is-last', self._othersDone() && self._state[last] === 'on');
    }
  },

  _updateTimer: function () {
    var r = this._roundCfg();
    var sec = Math.max(0, Math.ceil(this._timeLeft / 1000));
    var m = this._box.querySelector('.eve-meter--time');
    m.querySelector('.mini-meter__bar span').style.width = Math.max(0, this._timeLeft / (r.timeSec * 1000) * 100) + '%';
    m.querySelector('b').textContent = sec;
    m.classList.toggle('is-low', sec <= this._cfg().lowTimeSec);
  },

  _tick: function () {
    if (!this._playing) return;
    var now = Date.now();
    this._timeLeft -= Math.min(now - this._lastTick, 1000);   // если вкладка «уснула», время не прыгает
    this._lastTick = now;
    this._updateTimer();
    if (this._timeLeft <= 0) {
      EB.audio.play('error');
      this._endRound(true);
    }
  },

  _feedback: function (text, kind) {
    var fb = this._box.querySelector('.minigame__feedback');
    if (!fb) return;
    fb.textContent = text;
    fb.className = 'minigame__feedback eve-feedback' + (kind ? ' is-' + kind : '');
  },

  // Всплывающая подпись над прибором (под ним — если прибор у верхнего края плана)
  _showTip: function (btn) {
    var d = this._dev(btn.getAttribute('data-id'));
    var tip = this._tip;
    tip.textContent = EB.t('mg.evening.tip', { name: this._name(d), state: EB.t('mg.evening.state.' + this._state[d.id]) });
    tip.hidden = false;
    var bw = this._board.clientWidth;
    var bh = this._board.clientHeight;
    var half = tip.offsetWidth / 2;
    var cx = d.x / 1000 * bw;
    var cy = d.y / 560 * bh;
    var size = btn.offsetHeight;
    tip.style.left = EB.utils.clamp(cx, half, bw - half) + 'px';
    var above = cy - size / 2 - tip.offsetHeight - 10;
    tip.style.top = (above >= 0 ? above : cy + size / 2 + 10) + 'px';
    // Подпись сама прячется через tipMs: на телефоне после касания она не должна закрывать соседей
    var self = this;
    clearTimeout(self._tipTimer);
    self._tipTimer = setTimeout(function () { self._hideTip(); }, self._cfg().tipMs);
  },

  _hideTip: function () {
    clearTimeout(this._tipTimer);
    if (this._tip) this._tip.hidden = true;
  },

  // ---------- Конец раунда ----------
  _endRound: function (timeUp) {
    var self = this;
    if (!self._playing) return;
    self._playing = false;
    clearInterval(self._interval);
    self._interval = null;
    var c = self._count();
    self._total.done += c.done;
    self._total.targets += c.targets;
    self._result = { timeUp: timeUp, done: c.done, targets: c.targets, left: c.left, mistakes: self._roundMistakes };
    if (timeUp) self._feedback(EB.t('mg.evening.timeUp'), 'bad');
    self._box.querySelectorAll('.eve-dev').forEach(function (b) { b.disabled = true; });
    self._later(function () { self._renderSummary(); }, self._cfg().roundEndDelayMs);
  },

  _quality: function () {
    var t = this._total;
    var q = (t.targets ? t.done / t.targets : 0) - t.mistakes * this._cfg().mistakePenalty;
    return EB.utils.clamp(q, 0, 1);
  },

  _renderSummary: function () {
    var self = this;
    var res = self._result;
    var r = self._roundCfg();
    var last = self._round >= self._cfg().rounds.length - 1;
    self._box.innerHTML =
      '<h2 class="minigame__title">' + EB.t(res.timeUp ? 'mg.evening.timeUp' : 'mg.evening.roundDone') + '</h2>' +
      '<p class="eve-round-name"></p>' +
      '<ul class="eve-summary">' +
        '<li class="is-good">' + EB.ui.icon('ok') + EB.t('mg.evening.statDone', { n: res.done, total: res.targets }) + '</li>' +
        '<li class="is-bad">' + EB.ui.icon('warn') + EB.t('mg.evening.statMistakes', { n: res.mistakes }) + '</li>' +
        (res.left.length ? '<li class="is-info">' + EB.ui.icon('info') + '<span></span></li>' : '') +
        (last ? '<li class="is-star">' + EB.ui.icon('star') + EB.t('mg.evening.quality', { pct: Math.round(self._quality() * 100) }) + '</li>' : '') +
      '</ul>' +
      '<p class="minigame__text">' + EB.t('mg.evening.lesson.' + r.key) + '</p>' +
      '<div class="panel__buttons"><button class="btn btn--primary btn--small" data-mg="next">' + EB.t(last ? 'mg.finish' : 'mg.next') + '</button></div>';
    self._box.querySelector('.eve-round-name').textContent = self._stepText();
    if (res.left.length) {
      self._box.querySelector('.eve-summary .is-info span').textContent = EB.t('mg.evening.statLeft', { list: res.left.join(', ') });
    }
    EB.audio.play(res.mistakes === 0 && res.done === res.targets ? 'win' : 'coin');
    var btn = self._box.querySelector('[data-mg="next"]');
    btn.focus();
    btn.addEventListener('click', function () {
      EB.audio.play('click');
      if (last) {
        if (self._doneCalled) return;      // onDone — строго один раз
        self._doneCalled = true;
        self._options.onDone({ quality: self._quality() });
      } else {
        self._round++;
        self._renderIntro();
      }
    });
  }
};
