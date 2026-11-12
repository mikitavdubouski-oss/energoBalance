/*
  modals.js — всплывающие окна.

  1) EB.ui.modal — окно поверх всего:
       EB.ui.modal.confirm('Сбросить прогресс?', function () { ...да... });
       EB.ui.modal.message('Заголовок', 'Текст');
  2) EB.ui.card — карточка проблемы в игре: описание + 2–4 кнопки действий,
     после выбора — пояснение «почему так» (правильно ✔ / не лучший выбор ✘).
     Пока карточка открыта, игра на паузе (время читать пояснение не тратится).
  3) EB.ui.minigame — слой для мини-игры: открывает EB.minigames[имя].start(...).

  Как менять: тексты кнопок — в texts.ru.js (ключи modal.*, card.*).
*/

// ======================= Модальное окно =======================
EB.ui.modal = {
  _onCancel: null,   // что сделать, если окно закрыли клавишей Esc (как «Нет»)

  _open: function (html, buttons, onCancel) {
    EB.ui.modal._onCancel = onCancel || null;
    var box = document.getElementById('modal');
    box.innerHTML = html;
    var row = EB.utils.el('div', { 'class': 'panel__buttons' });
    buttons.forEach(function (b) {
      row.appendChild(EB.utils.el('button', {
        'class': 'btn btn--small ' + (b.cls || ''),
        text: b.text,
        onclick: function () {
          EB.audio.play('click');
          EB.ui.modal.close();
          if (b.action) b.action();
        }
      }));
    });
    box.appendChild(row);
    document.getElementById('modal-layer').hidden = false;
    row.lastChild.focus();
  },

  close: function () {
    document.getElementById('modal-layer').hidden = true;
  },

  // Закрыть по Esc: срабатывает как отказ
  cancel: function () {
    var onCancel = EB.ui.modal._onCancel;
    EB.ui.modal._onCancel = null;
    EB.ui.modal.close();
    if (onCancel) onCancel();
  },

  isOpen: function () {
    return !document.getElementById('modal-layer').hidden;
  },

  message: function (title, text, onOk) {
    EB.ui.modal._open(
      '<h2 class="panel__title"></h2><p class="modal__text"></p>',
      [{ text: EB.t('common.ok'), cls: 'btn--primary', action: onOk }]
    );
    var box = document.getElementById('modal');
    box.querySelector('h2').textContent = title;
    box.querySelector('p').textContent = text;
  },

  confirm: function (text, onYes, onNo) {
    EB.ui.modal._open('<p class="modal__text"></p>', [
      { text: EB.t('common.no'), cls: 'btn--ghost', action: onNo },
      { text: EB.t('common.yes'), cls: 'btn--primary', action: onYes }
    ], onNo);
    document.querySelector('#modal .modal__text').textContent = text;
  }
};

// ======================= Карточка проблемы =======================
EB.ui.card = {
  hs: null,

  // Текст действия: свой (hs.<id>.<key>) или общий (action.<key>)
  _text: function (hs, key, suffix) {
    var own = 'hs.' + hs.id + '.' + key + (suffix || '');
    return EB.t.has(own) ? EB.t(own) : EB.t('action.' + key + (suffix || ''));
  },

  _header: function (hs) {
    return '<div class="card__head card__head--' + hs.resource + '">' +
      EB.ui.icon(EB.ui.RESOURCE_ICONS[hs.resource]) +
      '<span class="card__res">' + EB.t('res.' + hs.resource) + '</span></div>' +
      '<h2 class="card__title"></h2>';
  },

  show: function (hs) {
    EB.ui.card.hs = hs;
    EB.ui.card._busy = false;
    EB.game.pause('card');
    var card = document.getElementById('card');
    card.innerHTML = EB.ui.card._header(hs) + '<p class="card__text"></p><div class="card__actions"></div>' +
      '<button class="card__close" data-i18n-aria="common.close">' + EB.ui.icon('close') + '</button>';
    card.querySelector('.card__title').textContent = EB.t('hs.' + hs.id + '.title');
    card.querySelector('.card__text').textContent = EB.t('hs.' + hs.id + '.problem');
    card.querySelector('.card__close').setAttribute('aria-label', EB.t('common.close'));
    card.querySelector('.card__close').addEventListener('click', function () {
      EB.audio.play('click');
      EB.ui.card.hide();
    });

    var list = card.querySelector('.card__actions');
    // Порядок кнопок перемешиваем, чтобы правильный ответ не был всегда первым
    EB.utils.shuffle(hs.actions).forEach(function (action) {
      var btn = EB.utils.el('button', { 'class': 'btn btn--action', 'data-action-key': action.key });
      btn.textContent = EB.ui.card._text(hs, action.key);
      btn.addEventListener('click', function () { EB.ui.card.choose(action); });
      list.appendChild(btn);
    });

    document.getElementById('card-layer').hidden = false;
    list.firstChild.focus();
  },

  choose: function (action) {
    var hs = EB.ui.card.hs;
    // Защита от двойного клика: пока ждём результат, повторные нажатия игнорируем
    if (!hs || EB.ui.card._busy) return;
    EB.ui.card._busy = true;
    EB.audio.play('switch');
    if (action.minigame) {
      // Карточку прячем на время мини-игры, пауза «card» остаётся
      document.getElementById('card-layer').hidden = true;
    }
    EB.game.chooseAction(hs, action, EB.ui.card.feedback);
  },

  // Пояснение после выбора
  feedback: function (res) {
    // _busy НЕ сбрасываем: в этой карточке уже ответили. Сбросится при следующем открытии (show).
    // Уровень мог закончиться прямо сейчас (например, кончился бюджет) — карточку не показываем
    if (!EB.game.running) return;
    var hs = res.hs;
    var card = document.getElementById('card');
    var good = res.correct;
    card.innerHTML = EB.ui.card._header(hs) +
      '<div class="verdict verdict--' + (good ? 'good' : 'bad') + '">' +
      EB.ui.icon(good ? 'ok' : 'warn') + '<span></span></div>' +
      '<p class="card__text card__why"></p>' +
      '<div class="card__actions"><button class="btn btn--primary" id="card-next"></button></div>';
    card.querySelector('.card__title').textContent = EB.t('hs.' + hs.id + '.title');
    card.querySelector('.verdict span').textContent = EB.t(good ? 'card.good' : 'card.bad');
    var why = EB.ui.card._text(hs, res.action.key, '.why');
    if (res.action.minigame) {
      why = EB.t('card.minigameResult', { pct: Math.round(res.quality * 100) }) + ' ' + why;
    }
    card.querySelector('.card__why').textContent = why;
    var next = card.querySelector('#card-next');
    next.textContent = EB.t(good || EB.state.isSolved(hs.id) ? 'card.next' : 'card.retry');
    next.addEventListener('click', function () {
      EB.audio.play('click');
      EB.ui.card.hide();
      EB.game.checkEnd();
    });
    document.getElementById('card-layer').hidden = false;
    next.focus();
  },

  hide: function () {
    document.getElementById('card-layer').hidden = true;
    EB.ui.card._busy = false;
    if (EB.ui.card.hs) {
      EB.ui.card.hs = null;
      EB.game.resume('card');
    }
  },

  isOpen: function () {
    return !document.getElementById('card-layer').hidden;
  }
};

// ======================= Слой мини-игры =======================
EB.ui.minigame = {
  current: null,

  open: function (name, onDone) {
    var layer = document.getElementById('minigame-layer');
    var box = document.getElementById('minigame');
    box.innerHTML = '';
    layer.hidden = false;
    var game = EB.minigames[name];
    EB.ui.minigame.current = game;
    game.start(box, {
      onDone: function (result) {
        EB.ui.minigame.close();
        onDone(result);
      }
    });
  },

  close: function () {
    var game = EB.ui.minigame.current;
    EB.ui.minigame.current = null;
    if (game && game.stop) game.stop();
    var layer = document.getElementById('minigame-layer');
    if (layer) layer.hidden = true;
  },

  isOpen: function () {
    return !document.getElementById('minigame-layer').hidden;
  }
};
