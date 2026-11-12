/*
  menu.js — главное меню, выбор уровня, настройки и экран «Об игре».

  - Главное меню: Играть / Продолжить (если уровень уже пройден в этот раз) / Настройки / Об игре.
    Кнопки «Выход» нет: браузер не даёт игре закрыть вкладку, её закрывают крестиком браузера.
  - Выбор уровня: карточки уровней; закрытые уровни помечены замком и подписью.
  - Настройки: громкость звуков, музыки и голоса (ползунки), язык RU / BE, сброс прогресса.
  - Об игре: титры (авторы, руководитель, учреждение — тексты about.* в texts.ru.js),
    источники информации и использованные ассеты.

  Как менять: тексты — в texts.ru.js, список ползунков — в EB.ui.menu.SLIDERS.
*/

EB.ui.menu = {
  SLIDERS: ['sfx', 'music', 'voice'],
  LEVEL_ICONS: { apartment: 'home', school: 'school', city: 'city' },

  init: function () {
    // Все кнопки с data-action обрабатываем в одном месте
    document.getElementById('app').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      if (EB.ui.menu.actions[action]) {
        EB.audio.play('click');
        EB.ui.menu.actions[action](btn);
      }
    });
    EB.ui.menu.buildSettings();
    EB.events.on('voices:changed', EB.ui.menu.syncVoiceStatus);
    EB.events.on('lang:changed', function () {
      EB.ui.menu.refresh();
      EB.ui.menu.buildAbout();
      EB.ui.menu.syncSettings();
    });
    EB.events.on('screen:shown', function (name) {
      if (name === 'menu') EB.ui.menu.refresh();
      if (name === 'levels') EB.ui.menu.buildLevels();
      if (name === 'about') EB.ui.menu.buildAbout();
      if (name === 'settings') EB.ui.menu.syncSettings();
    });
  },

  actions: {
    play: function () { EB.screens.show('levels'); },
    'continue': function () { EB.game.start(EB.save.continueLevel()); },
    settings: function () { EB.screens.show('settings'); },
    about: function () { EB.screens.show('about'); },
    back: function () { EB.screens.back(); },
    'reset-progress': function () {
      EB.ui.modal.confirm(EB.t('settings.resetConfirm'), function () {
        EB.save.resetProgress();
        EB.ui.toast(EB.t('settings.resetDone'), 'ok');
      });
    },
    'to-menu': function () {
      EB.ui.modal.confirm(EB.t('pause.toMenuConfirm'), function () {
        EB.game.stop();
        EB.screens.show('menu', { noHistory: true, clearHistory: true });
      });
    }
  },

  // Обновить главное меню: кнопка «Продолжить» и счётчик эко-коинов
  refresh: function () {
    var cont = document.querySelector('#screen-menu [data-action="continue"]');
    cont.hidden = !EB.save.hasProgress();
    var coins = EB.save.data.progress.ecoCoins;
    document.getElementById('menu-coins').innerHTML = coins > 0 ?
      EB.ui.icon('coin', 'icon--coin') + '<span>' + EB.t('menu.coins', { n: coins }) + '</span>' : '';
    if (!EB.save.available) {
      document.getElementById('menu-coins').innerHTML += '<span class="muted"> ' + EB.t('menu.noSave') + '</span>';
    }
  },

  // ---------- Выбор уровня ----------
  buildLevels: function () {
    var box = document.getElementById('level-cards');
    box.innerHTML = '';
    EB.config.levelOrder.forEach(function (id, i) {
      var unlocked = EB.save.isUnlocked(id);
      var stars = EB.save.data.progress.stars[id] || 0;
      var best = EB.save.data.progress.best[id];
      var card = EB.utils.el('button', {
        'class': 'level-card' + (unlocked ? '' : ' is-locked'),
        'aria-disabled': unlocked ? null : 'true'
      });
      var starsHtml = '';
      for (var s = 0; s < 3; s++) starsHtml += EB.ui.icon(s < stars ? 'star' : 'starEmpty', 'icon--star');
      card.innerHTML =
        '<span class="level-card__num">' + (i + 1) + '</span>' +
        EB.ui.icon(EB.ui.menu.LEVEL_ICONS[id] || 'home', 'level-card__icon') +
        '<span class="level-card__name"></span>' +
        '<span class="level-card__desc"></span>' +
        (unlocked ?
          '<span class="level-card__stars" aria-label="' + EB.t('results.starsOf', { n: stars }) + '">' + starsHtml + '</span>' +
          (best !== undefined ? '<span class="level-card__best">' + EB.t('levels.best', { n: best }) + '</span>' : '') :
          '<span class="level-card__lock">' + EB.ui.icon('lock') + '<span>' + EB.t('levels.locked') + '</span></span>');
      card.querySelector('.level-card__name').textContent = EB.t('level.' + id);
      card.querySelector('.level-card__desc').textContent = EB.t('level.' + id + '.desc');
      card.addEventListener('click', function () {
        if (!unlocked) {
          EB.audio.play('error');
          EB.ui.toast(EB.t('levels.lockedHint'), 'warn');
          return;
        }
        EB.audio.play('click');
        EB.game.start(id);
      });
      box.appendChild(card);
    });
  },

  // ---------- Настройки ----------
  buildSettings: function () {
    var list = document.getElementById('settings-list');
    list.innerHTML = '';
    EB.ui.menu.SLIDERS.forEach(function (name) {
      var id = 'set-' + name;
      var row = EB.utils.el('div', { 'class': 'setting' });
      row.innerHTML =
        '<label class="setting__label" for="' + id + '" data-i18n="settings.' + name + '"></label>' +
        '<input class="slider" type="range" min="0" max="100" step="5" id="' + id + '">' +
        '<output class="setting__value" for="' + id + '"></output>';
      var input = row.querySelector('input');
      var out = row.querySelector('output');
      input.addEventListener('input', function () {
        out.textContent = input.value + '%';
        EB.save.setSetting(name, input.value / 100);
      });
      // Пробный звук после отпускания ползунка
      input.addEventListener('change', function () {
        if (name === 'voice') EB.voice.say('settings.voiceTest', EB.t('settings.voiceTest'));
        else EB.audio.play('coin');
      });
      list.appendChild(row);
      // Под ползунком голоса — какой голос найден в системе (или как его установить)
      if (name === 'voice') {
        list.appendChild(EB.utils.el('p', { 'class': 'setting__note', id: 'voice-status', 'aria-live': 'polite' }));
      }
    });

    // Язык: две большие кнопки
    var langRow = EB.utils.el('div', { 'class': 'setting' });
    langRow.innerHTML = '<span class="setting__label" data-i18n="settings.lang"></span><div class="lang-switch" role="group"></div>';
    EB.i18n.languages.forEach(function (lang) {
      var b = EB.utils.el('button', { 'class': 'btn btn--small btn--lang', 'data-lang': lang, text: EB.t('lang.' + lang) });
      b.addEventListener('click', function () {
        EB.audio.play('click');
        EB.save.setSetting('lang', lang);
        EB.i18n.setLang(lang);
      });
      langRow.querySelector('.lang-switch').appendChild(b);
    });
    list.appendChild(langRow);
    EB.i18n.apply(list);
    EB.ui.menu.syncSettings();
  },

  // Строка о голосе Советника: какой голос будет звучать
  syncVoiceStatus: function () {
    var note = document.getElementById('voice-status');
    if (!note) return;
    var s = EB.voice.status();
    note.textContent = EB.t('settings.voice.' + s.kind, { name: s.name });
    note.classList.toggle('is-warn', s.kind === 'none');
  },

  // Показать текущие значения настроек
  syncSettings: function () {
    EB.ui.menu.syncVoiceStatus();
    EB.ui.menu.SLIDERS.forEach(function (name) {
      var input = document.getElementById('set-' + name);
      if (!input) return;
      input.value = Math.round(EB.save.getSetting(name) * 100);
      input.nextElementSibling.textContent = input.value + '%';
    });
    document.querySelectorAll('.btn--lang').forEach(function (b) {
      var active = b.getAttribute('data-lang') === EB.i18n.getLang();
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
      b.textContent = (active ? '✓ ' : '') + EB.t('lang.' + b.getAttribute('data-lang'));
    });
  },

  // ---------- Об игре ----------
  buildAbout: function () {
    var box = document.getElementById('about-content');
    function section(titleKey, listKey) {
      var html = '<h3>' + EB.t(titleKey) + '</h3><ul>';
      EB.t(listKey).split('\n').forEach(function (line) {
        if (line.trim()) html += '<li>' + EB.ui.menu._escape(line) + '</li>';
      });
      return html + '</ul>';
    }
    box.innerHTML =
      '<p class="about__lead">' + EB.ui.menu._escape(EB.t('about.lead')) + '</p>' +
      section('about.authorsTitle', 'about.authors') +
      section('about.sourcesTitle', 'about.sources') +
      section('about.assetsTitle', 'about.assets') +
      '<p class="muted">' + EB.ui.menu._escape(EB.t('about.contest')) + '</p>';
  },

  _escape: function (text) {
    return String(text).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
};
