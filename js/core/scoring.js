/*
  scoring.js — подсчёт очков, звёзд, эко-коинов и персональных советов в конце уровня.

  Формула (коэффициенты — в EB.config.scoring):
    Score = (сэкономленная энергия × коэфф. сложности)
          + бонус за комфорт (комфорт × доля решённых проблем)
          + бонус за оставшееся время (только если решено всё)
          − штраф за ошибки
  Эко-коины = Score / coinsDivisor.
  Звёзды: доля от максимально возможного Score сравнивается с порогами EB.config.scoring.stars.

  Как менять: формулу — здесь, числа — в config.js, тексты советов — в texts.ru.js.
*/

EB.scoring = {
  RESOURCES: ['electricity', 'heat', 'water', 'waste'],

  // Максимальная экономия, которую можно было получить на каждой проблеме
  _maxSave: function (hs) {
    return hs.actions.reduce(function (max, a) {
      return a.correct ? Math.max(max, a.save || 0) : max;
    }, 0);
  },

  compute: function (levelId, data, active, reason) {
    var sc = EB.config.scoring;
    var lvl = EB.config.levels[levelId];

    // 1) Экономия по ресурсам: сколько получили и сколько было возможно
    var maxByRes = {};
    var maxTotal = 0;
    active.forEach(function (hs) {
      var m = EB.scoring._maxSave(hs);
      maxByRes[hs.resource] = (maxByRes[hs.resource] || 0) + m;
      maxTotal += m;
    });
    var savedTotal = 0;
    var percents = {};
    EB.scoring.RESOURCES.forEach(function (r) {
      var saved = data.saved[r] || 0;
      savedTotal += saved;
      if (maxByRes[r] > 0) {
        percents[r] = Math.round(EB.utils.clamp(saved / maxByRes[r], 0, 1) * 100);
      }
    });

    // 2) Части формулы
    var solvedShare = active.length ? data.solved.length / active.length : 0;
    var allSolved = active.length > 0 && data.solved.length === active.length;
    var energyPart = savedTotal * lvl.difficulty;
    var comfortPart = data.comfort * sc.comfortBonusPerPoint * solvedShare;
    var timePart = allSolved ? data.timeLeft * sc.timeBonusPerSec : 0;
    var penalty = data.errors * sc.errorPenalty;
    var score = Math.max(0, Math.round(energyPart + comfortPart + timePart - penalty));

    // 3) Звёзды — от максимально возможного (без бонуса за время)
    var maxScore = maxTotal * lvl.difficulty + EB.config.scaleMax * sc.comfortBonusPerPoint;
    var share = maxScore > 0 ? score / maxScore : 0;
    var stars = sc.stars.filter(function (threshold) { return share >= threshold; }).length;

    var result = {
      levelId: levelId,
      reason: reason,                 // 'done' | 'time' | 'budget'
      score: score,
      stars: stars,
      coins: Math.floor(score / sc.coinsDivisor),
      percents: percents,             // {electricity: 80, water: 50, ...}
      solved: data.solved.length,
      total: active.length,
      errors: data.errors,
      comfort: Math.round(data.comfort),
      budget: Math.round(data.budget),
      parts: {
        energy: Math.round(energyPart),
        comfort: Math.round(comfortPart),
        time: Math.round(timePart),
        penalty: Math.round(penalty)
      }
    };
    result.summary = EB.scoring.summary(result);
    result.tips = EB.scoring.tips(result, data, active);
    return result;
  },

  // Главная фраза обратной связи: «Ты сэкономил 60% электроэнергии, но снизил комфорт…»
  summary: function (result) {
    // Берём ресурс с самой большой экономией (отходы описываем отдельно)
    var best = null;
    ['electricity', 'heat', 'water'].forEach(function (r) {
      if (result.percents[r] !== undefined && (best === null || result.percents[r] > result.percents[best])) best = r;
    });
    if (best === null) return EB.t('sum.nothing');
    var params = { pct: result.percents[best], res: EB.t('res.' + best + '.gen') };
    if (result.percents[best] === 0) return EB.t('sum.zero');
    if (result.comfort < EB.config.start.comfort) return EB.t('sum.comfortDown', params);
    if (result.errors > 0) return EB.t('sum.withErrors', params);
    return EB.t('sum.great', params);
  },

  // 2–3 персональных совета по ошибкам и пропущенным проблемам
  tips: function (result, data, active) {
    var tips = [];
    var seen = {};
    function add(text) {
      if (text && !seen[text] && tips.length < EB.config.scoring.maxTips) {
        seen[text] = true;
        tips.push(text);
      }
    }
    // Ошибки — в первую очередь
    data.mistakes.forEach(function (m) {
      var key = 'hs.' + m.hotspot + '.tip';
      if (EB.t.has(key)) add(EB.t(key));
    });
    // Пропущенные проблемы
    active.forEach(function (hs) {
      if (data.solved.indexOf(hs.id) === -1) add(EB.t('tip.missed', { name: EB.t('hs.' + hs.id + '.title') }));
    });
    // Общие советы по шкалам
    if (result.comfort < EB.config.warn.comfort) add(EB.t('tip.comfort'));
    if (result.budget < EB.config.warn.budget) add(EB.t('tip.budget'));
    if (result.reason === 'time') add(EB.t('tip.time'));
    if (!tips.length) add(EB.t('tip.perfect'));
    return tips;
  }
};
