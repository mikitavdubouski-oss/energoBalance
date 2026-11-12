/*
  utils.js — маленькие вспомогательные функции, которые нужны многим файлам.

  Что здесь есть:
  - EB.utils.clamp(x, min, max)  — ограничить число рамками;
  - EB.utils.shuffle(array)      — перемешать копию массива;
  - EB.utils.pickRandom(arr, n)  — выбрать n случайных элементов;
  - EB.utils.randomInt(a, b)     — случайное целое от a до b включительно;
  - EB.utils.el(tag, attrs, children) — быстро создать HTML-элемент;
  - EB.utils.format(str, params) — подставить {имя} в строку.

  Как менять: добавляй сюда только общие функции без логики игры.
*/

EB.utils = {
  clamp: function (x, min, max) {
    return Math.max(min, Math.min(max, x));
  },

  // Перемешивание Фишера–Йетса. Исходный массив не меняем.
  shuffle: function (array) {
    var copy = array.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  },

  pickRandom: function (array, n) {
    return EB.utils.shuffle(array).slice(0, n);
  },

  randomInt: function (a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  },

  // Создать элемент: el('button', {class: 'btn', onclick: f}, ['Текст'])
  el: function (tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (name) {
      var value = attrs[name];
      if (value === null || value === undefined || value === false) return;
      if (name.indexOf('on') === 0 && typeof value === 'function') {
        node.addEventListener(name.slice(2), value);
      } else if (name === 'html') {
        node.innerHTML = value;
      } else if (name === 'text') {
        node.textContent = value;
      } else {
        node.setAttribute(name, value === true ? '' : value);
      }
    });
    (children || []).forEach(function (child) {
      if (child === null || child === undefined) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  },

  // format('Привет, {name}!', {name: 'Аня'}) → 'Привет, Аня!'
  format: function (str, params) {
    if (!params) return str;
    return String(str).replace(/\{(\w+)\}/g, function (match, key) {
      return params[key] !== undefined ? params[key] : match;
    });
  },

  // Округлить до нужного числа знаков после запятой
  round: function (x, digits) {
    var k = Math.pow(10, digits || 0);
    return Math.round(x * k) / k;
  }
};
