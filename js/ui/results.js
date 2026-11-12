/*
  results.js — экран итогов уровня и финальный экран.

  Итоги уровня: очки, звёзды (1–3, с подписью «2 из 3»), эко-коины,
  процент экономии по каждому ресурсу (с иконкой и подписью), главная фраза обратной связи,
  2–3 персональных совета, случайный факт.
  Кнопки: Переиграть / Следующий уровень (или «Финал» после последнего) / Меню.

  Финал (после прохождения всех уровней): общий счёт, звёзды, звание игрока
  («Стажёр» → «Энергоменеджер» → «Эксперт по энергоэффективности»), благодарность, «Титры».

  Как менять: формула очков — js/core/scoring.js, пороги званий — EB.config.ranks.
*/

EB.ui.results = {
  _esc: function (t) { return EB.ui.menu._escape(t); },

  _stars: function (n) {
    var html = '';
    for (var i = 0; i < 3; i++) html += EB.ui.icon(i < n ? 'star' : 'starEmpty', 'icon--star' + (i < n ? ' is-on' : ''));
    return '<div class="stars" role="img" aria-label="' + EB.t('results.starsOf', { n: n }) + '">' + html +
      '<span class="stars__text">' + EB.t('results.starsOf', { n: n }) + '</span></div>';
  },

  show: function (r) {
    var esc = EB.ui.results._esc;
    var next = EB.save.nextLevel(r.levelId);
    var nextOpen = next && EB.save.isUnlocked(next);
    var isLast = !next;

    var resources = Object.keys(r.percents).map(function (res) {
      var pct = r.percents[res];
      return '<li class="res-row res-row--' + res + '">' +
        EB.ui.icon(EB.ui.RESOURCE_ICONS[res]) +
        '<span class="res-row__name">' + EB.t('res.' + res) + '</span>' +
        '<span class="res-row__bar"><span style="width:' + pct + '%"></span></span>' +
        '<b class="res-row__pct">' + pct + '%</b></li>';
    }).join('');

    var tips = r.tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');

    var box = document.getElementById('results-content');
    box.innerHTML =
      '<p class="intro__level">' + esc(EB.t('level.' + r.levelId)) + '</p>' +
      '<h2 class="panel__title">' + esc(EB.t('results.reason.' + r.reason)) + '</h2>' +
      EB.ui.results._stars(r.stars) +
      '<div class="results__numbers">' +
        '<div class="big-number"><span>' + EB.t('results.score') + '</span><b>' + r.score + '</b></div>' +
        '<div class="big-number big-number--coins"><span>' + EB.t('results.coins') + '</span><b>' + EB.ui.icon('coin') + ' +' + r.coins + '</b></div>' +
        '<div class="big-number"><span>' + EB.t('results.solved') + '</span><b>' + r.solved + ' / ' + r.total + '</b></div>' +
      '</div>' +
      '<p class="results__formula">' + esc(EB.t('results.formula', r.parts)) + '</p>' +
      '<p class="results__summary">' + esc(r.summary) + '</p>' +
      '<div class="results__cols">' +
        '<div><h3>' + EB.t('results.savings') + '</h3><ul class="res-list">' + resources + '</ul></div>' +
        '<div><h3>' + EB.t('results.tips') + '</h3><ul class="tips">' + tips + '</ul></div>' +
      '</div>' +
      '<div class="fact-box" id="results-fact"></div>' +
      '<div class="panel__buttons">' +
        '<button class="btn btn--small" id="res-replay">' + EB.t('results.replay') + '</button>' +
        (isLast ?
          '<button class="btn btn--primary btn--small" id="res-final"' + (EB.save.allCompleted() ? '' : ' hidden') + '>' + EB.t('results.final') + '</button>' :
          '<button class="btn btn--primary btn--small" id="res-next"' + (nextOpen ? '' : ' hidden') + '>' + EB.t('results.next') + '</button>') +
        '<button class="btn btn--ghost btn--small" id="res-menu">' + EB.t('results.menu') + '</button>' +
      '</div>' +
      (!nextOpen && !isLast ? '<p class="muted">' + EB.t('results.needStar') + '</p>' : '');

    EB.ui.renderFact(document.getElementById('results-fact'), EB.ui.randomFact());

    function on(id, fn) {
      var b = document.getElementById(id);
      if (b) b.addEventListener('click', function () { EB.audio.play('click'); fn(); });
    }
    on('res-replay', function () { EB.game.start(r.levelId); });
    on('res-next', function () { EB.game.start(next); });
    on('res-final', function () { EB.ui.results.showFinal(); });
    on('res-menu', function () { EB.screens.show('menu', { noHistory: true, clearHistory: true }); });

    EB.screens.show('results', { noHistory: true });
    if (r.coins > 0) setTimeout(function () { EB.audio.play('coin'); }, 500);
    var first = box.querySelector('.panel__buttons button:not([hidden])');
    box.scrollTop = 0;
    // preventScroll — чтобы панель не прокручивалась вниз к кнопке
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, EB.config.fadeMs);
  },

  showFinal: function () {
    var p = EB.save.data.progress;
    var totalScore = 0;
    var totalStars = 0;
    EB.config.levelOrder.forEach(function (id) {
      totalScore += p.best[id] || 0;
      totalStars += p.stars[id] || 0;
    });
    var rank = EB.config.ranks[0];
    EB.config.ranks.forEach(function (r) { if (totalStars >= r.minStars) rank = r; });

    var box = document.getElementById('final-content');
    box.innerHTML =
      '<div class="final__badge">' + EB.ui.icon('leaf') + '</div>' +
      '<h2 class="panel__title">' + EB.t('final.title') + '</h2>' +
      '<p class="final__rank-label">' + EB.t('final.rankLabel') + '</p>' +
      '<p class="final__rank">' + EB.t(rank.key) + '</p>' +
      '<div class="results__numbers">' +
        '<div class="big-number"><span>' + EB.t('final.score') + '</span><b>' + totalScore + '</b></div>' +
        '<div class="big-number"><span>' + EB.t('final.stars') + '</span><b>' + EB.ui.icon('star', 'icon--star is-on') + ' ' + totalStars + ' / ' + (EB.config.levelOrder.length * 3) + '</b></div>' +
        '<div class="big-number big-number--coins"><span>' + EB.t('results.coins') + '</span><b>' + EB.ui.icon('coin') + ' ' + p.ecoCoins + '</b></div>' +
      '</div>' +
      '<p class="final__thanks">' + EB.ui.results._esc(EB.t('final.thanks')) + '</p>' +
      '<div class="panel__buttons">' +
        '<button class="btn btn--small" id="final-credits">' + EB.t('final.credits') + '</button>' +
        '<button class="btn btn--primary btn--small" id="final-menu">' + EB.t('results.menu') + '</button>' +
      '</div>';
    document.getElementById('final-credits').addEventListener('click', function () {
      EB.audio.play('click');
      EB.screens.show('about');
    });
    document.getElementById('final-menu').addEventListener('click', function () {
      EB.audio.play('click');
      EB.screens.show('menu', { noHistory: true, clearHistory: true });
    });
    EB.screens.show('final');
    EB.audio.play('win');
  }
};
