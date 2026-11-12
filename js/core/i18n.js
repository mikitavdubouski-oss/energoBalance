/*
  i18n.js — переключение языка (русский / белорусский).

  Как это работает:
  - Все строки лежат в EB.texts.ru и EB.texts.be (файлы js/data/texts.*.js).
  - EB.t('ключ') возвращает строку на текущем языке.
    Если в белорусском строки нет — берётся русская, если и её нет — сам ключ
    (так сразу видно, какой текст забыли добавить).
  - EB.t('ключ', {n: 5}) подставит число вместо {n} в строке.
  - Элементы HTML с атрибутом data-i18n="ключ" обновляются сами при смене языка.
  - Для атрибутов: data-i18n-aria="ключ" заполняет aria-label (подпись для экранного диктора).

  Как менять: чтобы добавить язык, создай texts.xx.js и добавь его код в EB.i18n.languages.
*/

EB.i18n = {
  languages: ['ru', 'be'],
  lang: 'ru',

  setLang: function (lang) {
    if (EB.i18n.languages.indexOf(lang) === -1) lang = 'ru';
    EB.i18n.lang = lang;
    document.documentElement.setAttribute('lang', lang);
    EB.i18n.apply(document);
    if (EB.events) EB.events.emit('lang:changed', lang);
  },

  getLang: function () {
    return EB.i18n.lang;
  },

  // Обновить все элементы с data-i18n внутри root
  apply: function (root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = EB.t(el.getAttribute('data-i18n'));
    });
    (root || document).querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', EB.t(el.getAttribute('data-i18n-aria')));
    });
    (root || document).querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      el.setAttribute('alt', EB.t(el.getAttribute('data-i18n-alt')));
    });
  },

  // Текст факта на текущем языке (перевод факта лежит в texts.be.js под ключом fact.<id>)
  factText: function (fact) {
    var translated = EB.texts[EB.i18n.lang] && EB.texts[EB.i18n.lang]['fact.' + fact.id];
    return EB.i18n.clean(translated || fact.text);
  },

  // Убрать служебную метку [ПРОВЕРИТЬ] из текста, который видит игрок
  clean: function (text) {
    return String(text).replace(/\s*\[ПРОВЕРИТЬ\]\s*/g, ' ').trim();
  }
};

// Короткое имя для самой частой функции
EB.t = function (key, params) {
  var dict = EB.texts[EB.i18n.lang] || {};
  var text = dict[key];
  if (text === undefined) text = (EB.texts.ru || {})[key];
  if (text === undefined) return key;
  return EB.utils.format(text, params);
};

// Проверить, есть ли строка с таким ключом
EB.t.has = function (key) {
  return (EB.texts.ru || {})[key] !== undefined;
};
