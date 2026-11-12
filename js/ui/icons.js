/*
  icons.js — маленькие SVG-иконки интерфейса (строками).

  Использование: EB.ui.icon('bolt') → строка '<svg ...>...</svg>' для вставки в innerHTML.
  Иконки рисуются цветом текста (currentColor), поэтому меняют цвет вместе с кнопкой.
  Иконки нужны для доступности: смысл шкал и статусов передаётся формой, а не только цветом.

  Как добавить иконку: допиши в EB.ui.ICONS пару имя: 'содержимое <svg>' (viewBox 0 0 24 24).
*/

EB.ui.ICONS = {
  // Ресурсы
  bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6z" fill="currentColor"/>',
  flame: '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 2 1 3 2 3 0-3-1-5 1-8z" fill="currentColor"/>',
  drop: '<path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z" fill="currentColor"/>',
  recycle: '<path d="M12 3 9 8h2v3h2V8h2zM5 13l-2 4 3 4h4v-2H7l-1-2 1-1zm14 0-2 1 1 2-1 2h-3v-2l-3 3 3 3v-2h4l3-4z" fill="currentColor"/>',
  // Шкалы
  gauge: '<path d="M12 4a9 9 0 0 0-9 9h3a6 6 0 0 1 12 0h3a9 9 0 0 0-9-9z" fill="currentColor"/><path d="m12 13 5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="13" r="2" fill="currentColor"/>',
  coin: '<circle cx="12" cy="12" r="9" fill="currentColor"/><path d="M12 7v10M9 9.5h4.5a1.7 1.7 0 0 1 0 3.5H10a1.7 1.7 0 0 0 0 3.5H15" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  smile: '<circle cx="12" cy="12" r="9" fill="currentColor"/><circle cx="9" cy="10" r="1.3" fill="#fff"/><circle cx="15" cy="10" r="1.3" fill="#fff"/><path d="M8 14c2 2.5 6 2.5 8 0" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  leaf: '<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z" fill="currentColor"/><path d="M5 19 13 11" stroke="#fff" stroke-width="1.6"/>',
  // Статусы (разная ФОРМА: кружок с галочкой / треугольник с восклицательным знаком)
  ok: '<circle cx="12" cy="12" r="10" fill="currentColor"/><path d="m7 12 3 3 7-7" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  warn: '<path d="M12 2 23 21H1z" fill="currentColor"/><path d="M12 9v6" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="18" r="1.4" fill="#fff"/>',
  check: '<path d="m5 12 5 5 9-10" stroke="currentColor" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  cross: '<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>',
  arrowDown: '<path d="M12 4v14m-6-6 6 6 6-6" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  // Кнопки
  pause: '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>',
  restart: '<path d="M4 12a8 8 0 1 0 3-6.2" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M3 3v6h6" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  bulb: '<path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" fill="currentColor"/><rect x="9" y="18.5" width="6" height="2" rx="1" fill="currentColor"/><rect x="10" y="21.5" width="4" height="1.5" rx=".7" fill="currentColor"/>',
  timer: '<circle cx="12" cy="13" r="8" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M12 13V9M9 2h6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  star: '<path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z" fill="currentColor"/>',
  starEmpty: '<path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2.4" fill="none"/>',
  close: '<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  info: '<circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 11v6" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="7.5" r="1.5" fill="#fff"/>',
  check2: '<circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 7v6" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1.4" fill="#fff"/>',
  // Уровни
  home: '<path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z" fill="currentColor"/>',
  school: '<path d="M12 3 2 8l10 5 8-4v6h2V8z" fill="currentColor"/><path d="M6 12v4c2 2 10 2 12 0v-4l-6 3z" fill="currentColor"/>',
  city: '<path d="M2 21V10h6V3h8v8h6v10z" fill="currentColor"/><path d="M10 6h1.5v2H10zm3 0h1.5v2H13zm-3 4h1.5v2H10zm3 0h1.5v2H13zM4 13h2v2H4zm14 1h2v2h-2z" fill="#fff"/>',
  agro: '<path d="M1 21V12l7.5-6.5L16 12v9h-4.5v-5h-6v5z" fill="currentColor"/><rect x="11.5" y="4" width="2.5" height="5" fill="currentColor"/><rect x="18.4" y="13" width="1.6" height="8" fill="currentColor"/><path d="M19.2 15.5c-2.8 0-4.2-1.8-4.2-4 2.5 0 4.2 1.5 4.2 4zM19.2 13.5c0-2.4 1.5-4 4-4 0 2.4-1.6 4-4 4z" fill="currentColor"/><rect x="1" y="21" width="22" height="1.6" rx=".8" fill="currentColor"/><rect x="4" y="12.5" width="2.5" height="2.5" fill="#fff"/><rect x="10" y="12.5" width="2.5" height="2.5" fill="#fff"/>',
  shop: '<path d="M1 3h3.6l2.6 11h11.3v2H5.6L3 5H1z" fill="currentColor"/><path d="M6.5 5H22l-2.6 8H8.2z" fill="currentColor"/><path d="M10 7h1.4v4H10zm3.2 0h1.4v4h-1.4zm3.2 0h1.4v4h-1.4z" fill="#fff"/><circle cx="8.5" cy="19.5" r="2" fill="currentColor"/><circle cx="17" cy="19.5" r="2" fill="currentColor"/>',
  office: '<path d="M9 3h6a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3V5a2 2 0 0 1 2-2zm0 2v2h6V5z" fill="currentColor"/><rect x="2" y="12" width="20" height="1.6" fill="#fff"/><rect x="10" y="11" width="4" height="3.6" rx="1" fill="#fff"/>',
  hospital: '<path d="M2 21V8h5V3h10v5h5v13h-7v-4h-6v4z" fill="currentColor"/><path d="M11 5h2v2h2v2h-2v2h-2V9H9V7h2zM4 11h2v2H4zm14 0h2v2h-2zM4 15h2v2H4zm14 0h2v2h-2z" fill="#fff"/>',
  factory: '<path d="M2 21V11l5 3v-3l5 3v-3l5 3V3h4v18z" fill="currentColor"/><path d="M5 16h2v2H5zm5 0h2v2h-2zm5 0h2v2h-2z" fill="#fff"/>'
};

// Готовая разметка иконки
EB.ui.icon = function (name, extraClass) {
  return '<svg class="icon ' + (extraClass || '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    (EB.ui.ICONS[name] || '') + '</svg>';
};

// Иконка ресурса
EB.ui.RESOURCE_ICONS = { electricity: 'bolt', heat: 'flame', water: 'drop', waste: 'recycle' };
