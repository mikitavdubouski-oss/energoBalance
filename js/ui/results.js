/*
  results.js — экран итогов уровня и финальный экран.

  Итоги уровня: очки, звёзды (1–3, с подписью «2 из 3»), эко-коины,
  процент экономии по каждому ресурсу (с иконкой и подписью), главная фраза обратной связи,
  2–3 персональных совета, случайный факт.
  Кнопки: Переиграть / Следующий уровень (или «Финал» после последнего) / Меню — внизу, в полоске,
  которая «прилипает» к низу экрана (position: sticky): итоги можно листать, а кнопки всегда видны.

  Финал (после прохождения всех уровней): подведение итогов по эко-коинам —
  медаль за 1, 2 или 3 место с похвалой, «пьедестал» из трёх мест с отметкой «это ты»,
  сколько не хватило до следующей медали; затем эко-коины, звёзды, общий счёт,
  звание игрока («Стажёр» → «Энергоменеджер» → «Эксперт по энергоэффективности»), благодарность, «Титры».

  Как менять: формула очков — js/core/scoring.js, пороги званий — EB.config.ranks,
  пороги медалей — EB.config.medals, тексты похвалы — ключи medal.* в texts.*.js.
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
        '<div class="big-number big-number--coins"><span>' + EB.t('results.coins') + '</span><b>' + EB.ui.icon('coin') + ' +' + r.coins + '</b>' +
          '<small>' + EB.t('results.coinsTotal', { n: r.coinsTotal }) + '</small></div>' +
        '<div class="big-number"><span>' + EB.t('results.solved') + '</span><b>' + r.solved + ' / ' + r.total + '</b></div>' +
      '</div>' +
      '<p class="results__formula">' + esc(EB.t('results.formula', r.parts)) + '</p>' +
      '<p class="results__summary">' + esc(r.summary) + '</p>' +
      '<div class="results__cols">' +
        '<div><h3>' + EB.t('results.savings') + '</h3><ul class="res-list">' + resources + '</ul></div>' +
        '<div><h3>' + EB.t('results.tips') + '</h3><ul class="tips">' + tips + '</ul></div>' +
      '</div>' +
      '<div class="fact-box" id="results-fact"></div>' +
      // Кнопки — внизу, в полоске results__bar: она «прилипает» к низу экрана, поэтому видна без прокрутки
      '<div class="results__bar">' +
      '<div class="panel__buttons">' +
        '<button class="btn btn--small" id="res-replay">' + EB.t('results.replay') + '</button>' +
        (isLast ?
          '<button class="btn btn--primary btn--small" id="res-final"' + (EB.save.allCompleted() ? '' : ' hidden') + '>' + EB.t('results.final') + '</button>' :
          '<button class="btn btn--primary btn--small" id="res-next"' + (nextOpen ? '' : ' hidden') + '>' + EB.t('results.next') + '</button>') +
        '<button class="btn btn--ghost btn--small" id="res-menu">' + EB.t('results.menu') + '</button>' +
      '</div>' +
      (!nextOpen && !isLast ? '<p class="muted">' + EB.t('results.needStar') + '</p>' : '') +
      // Переиграли уровень хуже, чем раньше: монеты в сумму не прибавились — объясняем почему
      (r.coins > 0 && r.coinsAdded === 0 ? '<p class="muted">' + EB.t('results.coinsBestOnly') + '</p>' : '') +
      '</div>';

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
    document.getElementById('screen-results').scrollTop = 0;
    // preventScroll — чтобы панель не прокручивалась вниз к кнопке
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, EB.config.fadeMs);
  },

  // Медаль: круг с номером места и лентой. Место видно по ЦИФРЕ, а не только по цвету (для дальтоников).
  _medalSvg: function (medal) {
    var colors = { gold: ['#f2c230', '#b58900'], silver: ['#cfd6de', '#7d8a98'], bronze: ['#e09a5c', '#9a5a28'] }[medal.key];
    return '<svg class="medal" viewBox="0 0 100 120" aria-hidden="true">' +
      '<path d="M30 0h16l10 40H40zM54 0h16L60 40H44z" fill="#1f6fd1" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>' +
      '<circle cx="50" cy="76" r="38" fill="' + colors[0] + '" stroke="#2b3a4a" stroke-width="4"/>' +
      '<circle cx="50" cy="76" r="28" fill="none" stroke="' + colors[1] + '" stroke-width="4"/>' +
      '<text x="50" y="91" text-anchor="middle" font-size="40" font-weight="800" fill="#1d2b3a">' + medal.place + '</text>' +
      '</svg>';
  },

  // Какую медаль заработал игрок: первая по порядку, порог которой он прошёл
  medalFor: function (coins) {
    var list = EB.config.medals;
    for (var i = 0; i < list.length; i++) {
      if (coins >= list[i].minCoins) return list[i];
    }
    return list[list.length - 1];
  },

  showFinal: function () {
    var p = EB.save.data.progress;
    var esc = EB.ui.results._esc;
    var totalScore = 0;
    var totalStars = 0;
    EB.config.levelOrder.forEach(function (id) {
      totalScore += p.levelScores[id] || 0;
      totalStars += p.stars[id] || 0;
    });
    var rank = EB.config.ranks[0];
    EB.config.ranks.forEach(function (r) { if (totalStars >= r.minStars) rank = r; });

    // Подведение итогов по эко-коинам: медаль, место и похвала
    var coins = p.ecoCoins;
    var medal = EB.ui.results.medalFor(coins);
    var medals = EB.config.medals;
    var better = medals[medals.indexOf(medal) - 1];          // следующая медаль (если не золото)
    var podium = medals.map(function (m) {
      var mine = m === medal;
      return '<li class="podium__step podium__step--' + m.key + (mine ? ' is-mine' : '') + '">' +
        EB.ui.results._medalSvg(m) +
        '<b>' + EB.t('medal.place', { n: m.place }) + '</b>' +
        '<span>' + EB.t('medal.from', { n: m.minCoins }) + '</span>' +
        (mine ? '<em>' + EB.ui.icon('check') + EB.t('medal.you') + '</em>' : '') +
        '</li>';
    }).join('');

    var box = document.getElementById('final-content');
    box.innerHTML =
      '<h2 class="panel__title">' + EB.t('final.title') + '</h2>' +
      '<div class="final__medal">' +
        EB.ui.results._medalSvg(medal) +
        '<div class="final__medal-text">' +
          '<p class="final__place">' + esc(EB.t('medal.title.' + medal.key, { n: medal.place })) + '</p>' +
          '<p class="final__praise">' + esc(EB.t('medal.praise.' + medal.key, { n: coins })) + '</p>' +
          (better ? '<p class="muted">' + esc(EB.t('medal.toNext', { n: better.minCoins - coins, medal: EB.t('medal.name.' + better.key) })) + '</p>' : '') +
        '</div>' +
      '</div>' +
      '<ol class="podium" aria-label="' + EB.t('medal.podium') + '">' + podium + '</ol>' +
      '<div class="results__numbers">' +
        '<div class="big-number big-number--coins"><span>' + EB.t('results.coins') + '</span><b>' + EB.ui.icon('coin') + ' ' + coins + '</b></div>' +
        '<div class="big-number"><span>' + EB.t('final.stars') + '</span><b>' + EB.ui.icon('star', 'icon--star is-on') + ' ' + totalStars + ' / ' + (EB.config.levelOrder.length * 3) + '</b></div>' +
        '<div class="big-number"><span>' + EB.t('final.score') + '</span><b>' + totalScore + '</b></div>' +
      '</div>' +
      '<p class="final__rank-label">' + EB.t('final.rankLabel') + ' <b class="final__rank">' + EB.t(rank.key) + '</b></p>' +
      '<p class="final__thanks">' + esc(EB.t('final.thanks')) + '</p>' +
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
