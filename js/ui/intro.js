/*
  intro.js — экран загрузки уровня: название уровня, задание и случайный факт.
  Кнопка «Начать» появляется через EB.config.levelIntroMinMs мс.

  Также здесь EB.ui.randomFact() — выбирает случайный факт (используется и в итогах уровня).
  Факты с меткой [ПРОВЕРИТЬ] не показываются, если EB.config.hideUnverifiedFacts = true.
*/

EB.ui.randomFact = function (preferResource) {
  var facts = EB.data.facts.filter(function (f) {
    return !(EB.config.hideUnverifiedFacts && String(f.text).indexOf('[ПРОВЕРИТЬ]') !== -1);
  });
  if (!facts.length) return null;
  var preferred = facts.filter(function (f) { return f.resource === preferResource; });
  // Чаще (в 60% случаев) берём факт «по теме» уровня, но иногда — любой
  var pool = preferred.length && Math.random() < 0.6 ? preferred : facts;
  return pool[EB.utils.randomInt(0, pool.length - 1)];
};

// Заполнить блок с фактом
EB.ui.renderFact = function (box, fact) {
  if (!fact) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  box.innerHTML = '<div class="fact-box__head">' + EB.ui.icon('info') + '<span></span></div><p></p>';
  box.querySelector('span').textContent = EB.t('fact.title');
  box.querySelector('p').textContent = EB.i18n.factText(fact);
};

EB.ui.levelIntro = {
  _timer: null,

  show: function (levelId) {
    var idx = EB.config.levelOrder.indexOf(levelId) + 1;
    document.getElementById('intro-level').textContent = EB.t('intro.level', { n: idx });
    document.getElementById('intro-title').textContent = EB.t('level.' + levelId);
    document.getElementById('intro-task').textContent = EB.t('level.' + levelId + '.task');
    var level = EB.levels[levelId];
    EB.ui.renderFact(document.getElementById('intro-fact'), EB.ui.randomFact(level && level.factTopic));

    var startBtn = document.getElementById('intro-start');
    var spinner = document.getElementById('intro-spinner');
    startBtn.hidden = true;
    spinner.hidden = false;
    clearTimeout(EB.ui.levelIntro._timer);
    EB.ui.levelIntro._timer = setTimeout(function () {
      spinner.hidden = true;
      startBtn.hidden = false;
      startBtn.focus();
    }, EB.config.levelIntroMinMs);
    EB.screens.show('intro');
  },

  init: function () {
    var btn = document.getElementById('intro-start');
    btn.addEventListener('click', function () {
      // Защита от двойного клика: прячем кнопку сразу, второй раз уровень не запустится
      if (btn.hidden) return;
      btn.hidden = true;
      EB.audio.play('click');
      EB.game.begin();
    });
  }
};
