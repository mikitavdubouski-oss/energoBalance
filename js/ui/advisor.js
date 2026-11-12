/*
  advisor.js — персонаж «Советник»: дружелюбный подросток в углу экрана с облачком реплики.

  Когда говорит:
  - в начале уровня объясняет задание (advisor.start.<уровень>);
  - комментирует первое правильное действие и первую ошибку на уровне;
  - подбадривает при низком комфорте, низком бюджете и когда мало времени;
  - в конце уровня.
  Эмоции: 'normal' (обычный), 'happy' (радуется), 'think' (задумался).

  Озвучка — через EB.voice.say(id, текст). Все реплики — в texts.ru.js (ключи advisor.*),
  полный список для записи голосом — docs/voice-lines.md.

  Как менять: новую реплику добавь в texts.ru.js и вызови EB.ui.advisor.say('advisor.ключ', 'happy').
*/

EB.ui.advisor = {
  _timer: null,
  _said: {},   // какие «одноразовые» реплики уже прозвучали на этом уровне

  // SVG персонажа. Меняются только брови и рот — по эмоции.
  svg: function (emotion) {
    var mouth = {
      normal: '<path d="M68 112q12 8 24 0" stroke="#2b3a4a" stroke-width="4" fill="none" stroke-linecap="round"/>',
      happy: '<path d="M64 106q16 22 32 0z" fill="#fff" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/><path d="M70 115q10 6 20 0" fill="#ff8c69"/>',
      think: '<path d="M70 114q8-4 18 1" stroke="#2b3a4a" stroke-width="4" fill="none" stroke-linecap="round"/>'
    }[emotion] || '';
    var brows = {
      normal: '<path d="M56 76q8-5 16 0M88 76q8-5 16 0" stroke="#5a3a22" stroke-width="4" fill="none" stroke-linecap="round"/>',
      happy: '<path d="M56 72q8-7 16 0M88 72q8-7 16 0" stroke="#5a3a22" stroke-width="4" fill="none" stroke-linecap="round"/>',
      think: '<path d="M56 74l16 4M88 72q8-6 16 2" stroke="#5a3a22" stroke-width="4" fill="none" stroke-linecap="round"/>'
    }[emotion] || '';
    var eyes = emotion === 'happy' ?
      '<path d="M58 90q6-7 12 0M90 90q6-7 12 0" stroke="#2b3a4a" stroke-width="4" fill="none" stroke-linecap="round"/>' :
      '<ellipse cx="64" cy="90" rx="6" ry="7" fill="#2b3a4a"/><ellipse cx="96" cy="90" rx="6" ry="7" fill="#2b3a4a"/>' +
      '<circle cx="66" cy="87" r="2" fill="#fff"/><circle cx="98" cy="87" r="2" fill="#fff"/>';
    var extra = emotion === 'think' ?
      '<circle cx="136" cy="40" r="5" fill="#fff" stroke="#2b3a4a" stroke-width="3"/><circle cx="148" cy="24" r="8" fill="#fff" stroke="#2b3a4a" stroke-width="3"/>' :
      (emotion === 'happy' ? '<path d="M138 30l4-10 4 10 10 4-10 4-4 10-4-10-10-4z" fill="#ffd166" stroke="#2b3a4a" stroke-width="2"/>' : '');
    return '<svg viewBox="0 0 160 200" class="advisor__svg">' +
      // Туловище: худи с молнией-значком
      '<path d="M22 200q0-58 58-58t58 58z" fill="#1f7ae0" stroke="#2b3a4a" stroke-width="4"/>' +
      '<path d="M62 146q18 14 36 0" stroke="#2b3a4a" stroke-width="4" fill="#7ad9b5"/>' +
      '<path d="M86 160l-12 18h9l-4 16 14-20h-9l5-14z" fill="#ffd166" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round"/>' +
      // Шея и голова
      '<rect x="68" y="124" width="24" height="22" fill="#f6c39a" stroke="#2b3a4a" stroke-width="4"/>' +
      '<ellipse cx="80" cy="92" rx="44" ry="46" fill="#f6c39a" stroke="#2b3a4a" stroke-width="4"/>' +
      // Уши
      '<ellipse cx="36" cy="96" rx="8" ry="11" fill="#f6c39a" stroke="#2b3a4a" stroke-width="4"/>' +
      '<ellipse cx="124" cy="96" rx="8" ry="11" fill="#f6c39a" stroke="#2b3a4a" stroke-width="4"/>' +
      // Причёска
      '<path d="M36 86q-4-46 44-48q50 0 46 48q-10-22-30-24q-6 10-22 10q-14 0-20-10q-12 6-18 24z" fill="#8a5a36" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>' +
      // Румянец
      '<ellipse cx="52" cy="106" rx="8" ry="5" fill="#ff8c69" opacity=".45"/><ellipse cx="108" cy="106" rx="8" ry="5" fill="#ff8c69" opacity=".45"/>' +
      brows + eyes + mouth + extra +
      '</svg>';
  },

  say: function (key, emotion, params) {
    var root = document.getElementById('advisor');
    var bubble = document.getElementById('advisor-bubble');
    var text = EB.t(key, params);
    root.hidden = false;
    document.getElementById('advisor-figure').innerHTML = EB.ui.advisor.svg(emotion || 'normal');
    bubble.textContent = text;
    bubble.classList.add('is-visible');
    root.classList.remove('fx-advisor');
    void root.offsetWidth;
    root.classList.add('fx-advisor');
    EB.voice.say(key, text);
    clearTimeout(EB.ui.advisor._timer);
    EB.ui.advisor._timer = setTimeout(EB.ui.advisor.hideBubble, EB.config.advisorBubbleMs + text.length * 30);
  },

  // Реплика, которая звучит только один раз за уровень
  once: function (key, emotion, params) {
    if (EB.ui.advisor._said[key]) return;
    EB.ui.advisor._said[key] = true;
    EB.ui.advisor.say(key, emotion, params);
  },

  hideBubble: function () {
    document.getElementById('advisor-bubble').classList.remove('is-visible');
    document.getElementById('advisor-figure').innerHTML = EB.ui.advisor.svg('normal');
  },

  init: function () {
    // Клик по Советнику — спрятать/показать облачко
    document.getElementById('advisor-figure').addEventListener('click', function () {
      var bubble = document.getElementById('advisor-bubble');
      if (bubble.classList.contains('is-visible')) EB.ui.advisor.hideBubble();
      else EB.ui.advisor.say('advisor.tip.' + EB.game.levelId, 'normal');
    });

    EB.events.on('game:start', function (e) {
      EB.ui.advisor._said = {};
      EB.ui.advisor.say('advisor.start.' + e.levelId, 'normal', { n: e.count });
    });
    EB.events.on('game:correct', function () { EB.ui.advisor.once('advisor.firstCorrect', 'happy'); });
    EB.events.on('game:wrong', function () { EB.ui.advisor.once('advisor.firstWrong', 'think'); });
    EB.events.on('state:changed', function (e) {
      if (!EB.game.running) return;
      if (e.key === 'comfort' && e.value < EB.config.warn.comfort) EB.ui.advisor.once('advisor.lowComfort', 'think');
      if (e.key === 'budget' && e.value < EB.config.warn.budget) EB.ui.advisor.once('advisor.lowBudget', 'think');
      if (e.key === 'timeLeft' && e.value === 30) EB.ui.advisor.once('advisor.hurry', 'normal');
    });
    EB.events.on('game:end', function (r) {
      EB.ui.advisor.say(r.stars >= 2 ? 'advisor.end.good' : 'advisor.end.ok', r.stars >= 2 ? 'happy' : 'think');
    });
    // Уходя с игрового экрана, замолкаем
    EB.events.on('screen:shown', function (name) {
      if (name !== 'game' && name !== 'results') {
        EB.voice.stop();
        EB.ui.advisor.hideBubble();
      }
    });
  }
};
