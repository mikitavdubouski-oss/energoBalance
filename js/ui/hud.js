/*
  hud.js — игровая панель сверху (HUD).

  Что показывает:
  - три шкалы: Потребление (меньше — лучше), Бюджет, Комфорт.
    У каждой есть иконка, подпись, число и значок статуса. Статус передаётся ФОРМОЙ
    (кружок с галочкой = норма, треугольник с «!» = внимание), а не только цветом — для дальтоников;
  - счётчики потерь: кВт·ч, литры воды, Гкал тепла (условные игровые единицы);
  - эко-коины, таймер, сколько проблем решено;
  - кнопки: Подсказка (с числом оставшихся), Пауза, Перезапуск.
  Для уровней с несколькими зонами (школа) под HUD появляются вкладки зон.

  HUD обновляется сам по событию 'state:changed'.
  Как менять: пороги «внимание» — в EB.config.warn, тексты — hud.* в texts.ru.js.
*/

EB.ui.hud = {
  METERS: [
    { key: 'consumption', icon: 'gauge', lowerIsBetter: true },
    { key: 'budget', icon: 'coin' },
    { key: 'comfort', icon: 'smile' }
  ],

  build: function (level) {
    var hud = document.getElementById('hud');
    var meters = EB.ui.hud.METERS.map(function (m) {
      return '<div class="meter meter--' + m.key + '" data-key="' + m.key + '" role="meter" aria-valuemin="0" aria-valuemax="100">' +
        '<span class="meter__icon">' + EB.ui.icon(m.icon) + '</span>' +
        '<span class="meter__label">' + EB.t('hud.' + m.key) +
        (m.lowerIsBetter ? ' <span class="meter__hint" title="' + EB.t('hud.lowerBetter') + '">' + EB.ui.icon('arrowDown') + '</span>' : '') +
        '</span>' +
        '<span class="meter__bar"><span class="meter__fill"></span></span>' +
        '<span class="meter__value"></span>' +
        '<span class="meter__status"></span>' +
        '</div>';
    }).join('');

    hud.innerHTML =
      '<div class="hud__meters">' + meters + '</div>' +
      '<div class="hud__counters">' +
        '<span class="counter counter--kwh" title="' + EB.t('hud.kwhTitle') + '">' + EB.ui.icon('bolt') + '<b data-c="kwh"></b></span>' +
        '<span class="counter counter--water" title="' + EB.t('hud.litersTitle') + '">' + EB.ui.icon('drop') + '<b data-c="liters"></b></span>' +
        '<span class="counter counter--heat" title="' + EB.t('hud.gcalTitle') + '">' + EB.ui.icon('flame') + '<b data-c="gcal"></b></span>' +
        '<span class="counter counter--coins" title="' + EB.t('hud.coins') + '">' + EB.ui.icon('coin') + '<b data-c="coins"></b></span>' +
        '<span class="counter counter--timer">' + EB.ui.icon('timer') + '<b data-c="time"></b></span>' +
        '<span class="counter counter--solved">' + EB.ui.icon('check') + '<b data-c="solved"></b></span>' +
      '</div>' +
      '<div class="hud__buttons">' +
        '<button class="btn-icon btn-icon--hint" data-hud="hint">' + EB.ui.icon('bulb') + '<span class="btn-icon__label">' + EB.t('hud.hint') + '</span><span class="badge" data-c="hints"></span></button>' +
        '<button class="btn-icon" data-hud="pause" aria-label="' + EB.t('hud.pause') + '" title="' + EB.t('hud.pause') + '">' + EB.ui.icon('pause') + '</button>' +
        '<button class="btn-icon" data-hud="restart" aria-label="' + EB.t('hud.restart') + '" title="' + EB.t('hud.restart') + '">' + EB.ui.icon('restart') + '</button>' +
      '</div>';

    hud.querySelector('[data-hud="hint"]').addEventListener('click', function () { EB.game.useHint(); });
    hud.querySelector('[data-hud="pause"]').addEventListener('click', function () {
      EB.audio.play('click');
      EB.ui.pause.show();
    });
    hud.querySelector('[data-hud="restart"]').addEventListener('click', function () {
      EB.audio.play('click');
      EB.game.pause('confirm');
      EB.ui.modal.confirm(EB.t('pause.restartConfirm'),
        function () { EB.game.restart(); },
        function () { EB.game.resume('confirm'); });
    });

    EB.ui.hud.buildZones(level);
    EB.ui.hud.updateAll();
  },

  // Вкладки зон (только если зон больше одной)
  buildZones: function (level) {
    var tabs = document.getElementById('zone-tabs');
    tabs.innerHTML = '';
    tabs.hidden = level.zones.length < 2;
    if (tabs.hidden) return;
    level.zones.forEach(function (zone) {
      var b = EB.utils.el('button', { 'class': 'zone-tab', 'data-zone': zone.id, text: EB.t('zone.' + zone.id) });
      b.addEventListener('click', function () {
        if (EB.game.isPaused()) return;
        EB.audio.play('click');
        EB.game.showZone(zone.id);
        EB.ui.hud.setZone(zone.id);
      });
      tabs.appendChild(b);
    });
    EB.ui.hud.setZone(level.zones[0].id);
  },

  setZone: function (zoneId) {
    document.querySelectorAll('.zone-tab').forEach(function (b) {
      var active = b.getAttribute('data-zone') === zoneId;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  },

  // Статус шкалы: 'ok' или 'warn'
  status: function (key, value) {
    if (key === 'consumption') return value > EB.config.warn.consumption ? 'warn' : 'ok';
    return value < EB.config.warn[key] ? 'warn' : 'ok';
  },

  updateMeter: function (key) {
    var el = document.querySelector('.meter[data-key="' + key + '"]');
    if (!el) return;
    var value = Math.round(EB.state.get(key));
    var status = EB.ui.hud.status(key, value);
    el.querySelector('.meter__fill').style.width = value + '%';
    el.querySelector('.meter__value').textContent = value;
    el.querySelector('.meter__status').innerHTML = EB.ui.icon(status === 'ok' ? 'ok' : 'warn');
    el.setAttribute('data-status', status);
    el.setAttribute('aria-valuenow', value);
    el.setAttribute('aria-label', EB.t('hud.' + key) + ': ' + value + ', ' + EB.t('hud.status.' + status));
    el.querySelector('.meter__status').setAttribute('title', EB.t('hud.status.' + status));
  },

  _set: function (name, text) {
    var el = document.querySelector('#hud [data-c="' + name + '"]');
    if (el) el.textContent = text;
  },

  // Число с запятой, как принято в русском и белорусском языках
  _num: function (x, digits) {
    return EB.utils.round(x, digits).toFixed(digits).replace('.', ',');
  },

  updateCounters: function () {
    var d = EB.state.data;
    EB.ui.hud._set('kwh', EB.ui.hud._num(d.kwh, 2) + ' ' + EB.t('unit.kwh'));
    EB.ui.hud._set('liters', Math.round(d.liters) + ' ' + EB.t('unit.liters'));
    EB.ui.hud._set('gcal', EB.ui.hud._num(d.gcal, 3) + ' ' + EB.t('unit.gcal'));
    EB.ui.hud._set('coins', EB.save.data.progress.ecoCoins);
    var t = Math.max(0, d.timeLeft);
    EB.ui.hud._set('time', Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2));
    EB.ui.hud._set('solved', EB.t('hud.solved', { n: d.solved.length, total: EB.game.active.length }));
    EB.ui.hud._set('hints', d.hintsLeft);
    var hintBtn = document.querySelector('#hud [data-hud="hint"]');
    if (hintBtn) {
      hintBtn.setAttribute('aria-label', EB.t('hud.hintLeft', { n: d.hintsLeft }));
      hintBtn.classList.toggle('is-empty', d.hintsLeft <= 0);
    }
    var timer = document.querySelector('#hud .counter--timer');
    if (timer) timer.classList.toggle('is-low', t <= 20);
  },

  updateAll: function () {
    EB.ui.hud.METERS.forEach(function (m) { EB.ui.hud.updateMeter(m.key); });
    EB.ui.hud.updateCounters();
  }
};

// Сменили язык посреди уровня (через паузу → настройки) — перестраиваем подписи HUD
EB.events.on('lang:changed', function () {
  if (!EB.game.running) return;
  EB.ui.hud.build(EB.game.level);
  EB.ui.hud.setZone(EB.game.zone);
  EB.game.updateObjectLabels();
});

EB.events.on('state:changed', function (e) {
  if (!document.getElementById('hud').firstChild) return;
  if (EB.state.SCALES.indexOf(e.key) !== -1) EB.ui.hud.updateMeter(e.key);
  else EB.ui.hud.updateCounters();
});
