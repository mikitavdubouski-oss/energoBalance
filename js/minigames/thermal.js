/*
  thermal.js — мини-игра «Тепловизор» (уровень «Больница», проблема «Голые трубы в подвале»).

  Помещений три: подвал, палата и вестибюль (ROOMS ниже). Каждый раз берётся случайное помещение,
  не то же, что в прошлый раз, а в нём — случайные утечки из списка мест. Поэтому игра не повторяется.

  На экране — обычная картинка помещения (спокойные серо-голубые цвета). Игрок водит круглой
  «линзой тепловизора»: под линзой видна тепловая картинка той же сцены
  (холодное — синее и фиолетовое, тёплое — оранжевое, горячее — жёлтое).
  Где тепло уходит зря, над местом идут «волны» (их видно и без различения цветов):
  тёплые волны поднимаются вверх, холодный сквозняк тянется по полу или падает из окошка.

  Управление:
    • мышь — линза ходит за курсором, клик — отметить место под линзой;
    • палец — тяни линзу, короткое касание — отметить место;
    • клавиатура — стрелки двигают линзу, Enter или пробел — отметить; есть и кнопка «Отметить».

  Есть «ложные» тёплые места, которые тёплые ПРАВИЛЬНО (тепловой пункт в работе, бак в кожухе,
  утеплённая труба): отметка там — подсказка «здесь всё в порядке» и небольшой штраф.

  Итог: quality = найденные утечки / все утечки − штрафы за лишние отметки (в пределах 0..1).

  Как менять:
    • числа (время, сколько утечек, размер линзы, штрафы) — EB.config.minigames.thermal;
    • тексты — ключи mg.thermal.* в texts.ru.js / texts.be.js;
    • какие помещения на каком уровне — ROOMS ниже ({уровень: [помещения]});
    • помещение — объект в SCENES ниже. Новое помещение добавляется тем же форматом, не трогая логику
      (и тексты: название mg.thermal.room.<имя>, утечки mg.thermal.leak.<id>, «всё в порядке» mg.thermal.ok.<id>):
        draw(палитра, тепловой?, активные утечки) — рисунок; одна функция для обоих слоёв,
                                                     поэтому обычный и тепловой рисунки всегда совпадают;
        overlays(активные утечки)                 — горячие и холодные пятна с волнами (только тепловой слой);
        leaks  — места утечек: {id, x, y, r} — круг, куда надо попасть (в единицах рисунка 800×450);
        fine   — «тёплые, но правильные» места: {id, rects: [[x, y, ширина, высота], ...], mx, my};
        lensStart — где линза стоит в начале.
*/

EB.minigames.thermal = {
  W: 800,             // размер рисунка (viewBox)
  H: 450,
  // Помещения по уровням. Уровня нет в списке — берём DEFAULT_ROOMS.
  ROOMS: { hospital: ['basement', 'ward', 'lobby'] },
  DEFAULT_ROOMS: ['basement'],
  _lastRoom: null,    // помещение прошлой игры — в этот раз берём другое

  // Палитры: одна и та же сцена рисуется дважды — обычными цветами и «тепловыми»
  PALETTES: {
    normal: {
      line: '#2b3a4a', wall: '#d3dde7', brick: '#bfccd8', ceil: '#8d9eb0', floor: '#a9b7c5', floorLine: '#94a4b4',
      pipe: '#aab8c6', band: '#8797a8', cabinet: '#b9c8d6', gauge: '#ffffff', pump: '#9db1c4', hx: '#c5d2de',
      boiler: '#c4d1dd', boilerTop: '#aebdcb', frame: '#8a9bb0', glass: '#aacde6', door: '#9eafc0',
      doorPanel: '#b3c2d0', tap: '#9aa9b8', bucket: '#a9b9c9', lamp: '#eef2d8', valve: '#9aaab9', wheel: '#7f90a3',
      // палата и вестибюль
      radiator: '#e6edf3', radiatorLine: '#c3cfdb', sill: '#f1f4f7', bed: '#c9d5e1', blanket: '#9cc3e6',
      pillow: '#f5f8fb', skin: '#f2c9a5', hair: '#8a6a4f', shirt: '#7fb7a4', socket: '#f5f8fb', picture: '#cfe6c4',
      desk: '#c9a27c', heater: '#e9edf2', board: '#f6f1e3', outside: '#cfe7f7', panel: '#f5f8fb', bulb: '#fff3b0'
    },
    thermal: {
      line: '#0e0a2a', wall: '#2a1d6e', brick: '#33257f', ceil: '#1d1452', floor: '#20165a', floorLine: '#2b1f6c',
      pipe: '#7a2fae', band: '#8e38b5', cabinet: '#d2562f', gauge: '#f08a2e', pump: '#ffb13b', hx: '#f39a34',
      boiler: '#a4389e', boilerTop: '#b8429a', frame: '#3a2c8c', glass: '#2f2380', door: '#33267f',
      doorPanel: '#3b2d8a', tap: '#463796', bucket: '#3a2c86', lamp: '#5a3aa8', valve: '#7a2fae', wheel: '#5b2f9e',
      // палата и вестибюль: батарея и люди тёплые (так и надо), остальное — холоднее
      radiator: '#ff9a2e', radiatorLine: '#ffd23f', sill: '#3a2c8c', bed: '#4a3596', blanket: '#e0602f',
      pillow: '#c4462f', skin: '#ffd23f', hair: '#ff9a2e', shirt: '#e8742c', socket: '#3b2d8a', picture: '#2f2380',
      desk: '#3d2c88', heater: '#4a3596', board: '#33257f', outside: '#07061f', panel: '#6b4ab8', bulb: '#6b4ab8'
    }
  },
  HOT: { core: '#fff4a8', hot: '#ffd23f', edge: '#ff8a1f' },
  COLD: { spot: '#07061f', wave: '#8fe9ff' },

  // ======================= Сцены =======================
  SCENES: {
    // Подвал больницы: трубы горячей воды и отопления, тепловой пункт, бак, дверь, окошко
    basement: {
      lensStart: [400, 270],
      leaks: [
        { id: 'pipe',   x: 236, y: 131, r: 40 },   // голый участок трубы
        { id: 'valve',  x: 320, y: 182, r: 36 },   // задвижка без изоляции
        { id: 'elbow',  x: 440, y: 128, r: 36 },   // неутеплённый поворот трубы
        { id: 'torn',   x: 600, y: 167, r: 36 },   // порванная изоляция
        { id: 'tap',    x: 528, y: 304, r: 38 },   // капает горячий кран
        { id: 'door',   x: 632, y: 300, r: 62 },   // щель у двери подвала
        { id: 'window', x: 295, y: 69,  r: 44 }    // открытое окошко
      ],
      fine: [
        { id: 'substation', rects: [[22, 196, 154, 186]], mx: 150, my: 214 },
        { id: 'boiler', rects: [[704, 196, 82, 186]], mx: 745, my: 232 },
        // утеплённые трубы — отметка ставится там, куда нажали
        { id: 'insulated', rects: [[116, 118, 684, 26], [145, 154, 655, 26], [116, 118, 26, 80], [145, 154, 26, 44],
          [427, 0, 26, 131], [727, 0, 26, 131], [512, 167, 16, 125], [747, 167, 26, 34]] }
      ],

      // Рисунок подвала. p — палитра, active — {id: true} для спрятанных утечек
      draw: function (p, thermal, active) {
        var L = p.line;
        var s = '';
        // Стена с кирпичной кладкой
        s += '<rect width="800" height="450" fill="' + p.wall + '"/>';
        var bricks = '';
        for (var row = 0, y = 62; y < 382; y += 32, row++) {
          bricks += 'M0 ' + y + 'H800';
          for (var x = (row % 2 ? 34 : 0); x < 800; x += 68) bricks += 'M' + x + ' ' + (y - 32) + 'v32';
        }
        s += '<path d="' + bricks + '" stroke="' + p.brick + '" stroke-width="2" fill="none"/>';
        // Потолок и пол
        s += '<rect x="-4" y="-4" width="808" height="32" fill="' + p.ceil + '" stroke="' + L + '" stroke-width="3"/>';
        s += '<rect x="-4" y="382" width="808" height="72" fill="' + p.floor + '" stroke="' + L + '" stroke-width="3"/>';
        s += '<path d="M0 410H800M0 436H800" stroke="' + p.floorLine + '" stroke-width="3"/>';
        // Лампа под потолком
        s += '<path d="M600 28v20" stroke="' + L + '" stroke-width="3"/>' +
          '<circle cx="600" cy="60" r="12" fill="' + p.lamp + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M588 60h24M600 48v24" stroke="' + L + '" stroke-width="2"/>';
        // Окошко подвала
        s += '<rect x="236" y="38" width="118" height="62" rx="6" fill="' + p.frame + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="246" y="46" width="98" height="46" fill="' + (thermal && active.window ? EB.minigames.thermal.COLD.spot : p.glass) + '" stroke="' + L + '" stroke-width="2"/>' +
          '<path d="M295 46v46" stroke="' + L + '" stroke-width="3"/>';
        // Тепловой пункт: шкаф, манометры, насос, теплообменник
        s += '<rect x="22" y="196" width="154" height="186" rx="10" fill="' + p.cabinet + '" stroke="' + L + '" stroke-width="3"/>' +
          '<circle cx="58" cy="230" r="15" fill="' + p.gauge + '" stroke="' + L + '" stroke-width="3"/><path d="M58 230l8-7" stroke="' + L + '" stroke-width="3" stroke-linecap="round"/>' +
          '<circle cx="100" cy="230" r="15" fill="' + p.gauge + '" stroke="' + L + '" stroke-width="3"/><path d="M100 230l-8-7" stroke="' + L + '" stroke-width="3" stroke-linecap="round"/>' +
          '<circle cx="66" cy="316" r="28" fill="' + p.pump + '" stroke="' + L + '" stroke-width="3"/><circle cx="66" cy="316" r="10" fill="' + p.cabinet + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="112" y="262" width="48" height="104" rx="6" fill="' + p.hx + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M124 272v84M136 272v84M148 272v84" stroke="' + L + '" stroke-width="2"/>';
        // Трубы: сначала тёмный контур потолще, потом сама труба (так получаются аккуратные повороты)
        var pipes = 'M129 198V131H806M158 198V167H806M440 131V-6M740 131V-6M760 167V202';
        s += '<path d="' + pipes + '" stroke="' + L + '" stroke-width="24" fill="none" stroke-linejoin="round"/>' +
          '<path d="' + pipes + '" stroke="' + p.pipe + '" stroke-width="18" fill="none" stroke-linejoin="round"/>';
        // Трубка к крану (потоньше)
        s += '<path d="M520 167V292" stroke="' + L + '" stroke-width="16" fill="none"/><path d="M520 167V292" stroke="' + p.pipe + '" stroke-width="10" fill="none"/>';
        // Бандажи на трубах
        var bands = '';
        [210, 280, 370, 510, 560, 660, 780].forEach(function (bx) {
          bands += '<rect x="' + (bx - 3) + '" y="121" width="6" height="20" fill="' + p.band + '"/>';
          bands += '<rect x="' + (bx + 12) + '" y="157" width="6" height="20" fill="' + p.band + '"/>';
        });
        s += bands;
        // Задвижка на нижней трубе
        s += '<rect x="306" y="153" width="28" height="28" rx="6" fill="' + p.valve + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M320 181v16" stroke="' + L + '" stroke-width="4"/>' +
          '<ellipse cx="320" cy="201" rx="17" ry="6" fill="' + p.wheel + '" stroke="' + L + '" stroke-width="3"/>';
        // Кран и ведро под ним
        s += '<rect x="512" y="286" width="28" height="16" rx="4" fill="' + p.tap + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="514" y="276" width="12" height="10" rx="2" fill="' + p.tap + '" stroke="' + L + '" stroke-width="2"/>' +
          '<path d="M536 302v10" stroke="' + L + '" stroke-width="5" stroke-linecap="round"/>' +
          '<path d="M512 346h48l-6 36h-36z" fill="' + p.bucket + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M514 346q22-18 44 0" fill="none" stroke="' + L + '" stroke-width="2"/>';
        // Дверь подвала
        s += '<rect x="586" y="196" width="92" height="186" fill="' + p.frame + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="594" y="204" width="76" height="178" rx="3" fill="' + p.door + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="604" y="216" width="56" height="62" rx="3" fill="' + p.doorPanel + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="604" y="300" width="56" height="66" rx="3" fill="' + p.doorPanel + '" stroke="' + L + '" stroke-width="2"/>' +
          '<circle cx="660" cy="290" r="5" fill="' + L + '"/>';
        // Бак горячей воды в утеплённом кожухе
        s += '<rect x="704" y="200" width="82" height="180" rx="18" fill="' + p.boiler + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M706 214q39-18 78 0" fill="' + p.boilerTop + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M704 260h82M704 320h82" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="712" y="378" width="12" height="6" fill="' + L + '"/><rect x="766" y="378" width="12" height="6" fill="' + L + '"/>';
        return s;
      },

      // Горячие и холодные пятна с волнами — только для спрятанных утечек
      overlays: function (active) {
        var T = EB.minigames.thermal;
        var H = T.HOT, C = T.COLD;
        var s = '';
        if (active.pipe) {
          s += T._glow(236, 131, 62, 30) +
            '<path d="M196 131H276" stroke="' + H.hot + '" stroke-width="18"/><path d="M200 131H272" stroke="' + H.core + '" stroke-width="6" stroke-linecap="round"/>' +
            T._waves([[212, 112], [236, 110], [260, 112]], 'rise');
        }
        if (active.valve) {
          s += T._glow(320, 182, 36, 32) +
            '<rect x="306" y="153" width="28" height="28" rx="6" fill="' + H.hot + '" stroke="#0e0a2a" stroke-width="3"/>' +
            '<rect x="314" y="160" width="12" height="14" rx="4" fill="' + H.core + '"/>' +
            '<ellipse cx="320" cy="201" rx="17" ry="6" fill="' + H.edge + '" stroke="#0e0a2a" stroke-width="3"/>' +
            T._waves([[300, 150], [342, 150]], 'rise');
        }
        if (active.elbow) {
          s += T._glow(440, 128, 36, 36) +
            '<path d="M414 131H440V104" stroke="' + H.hot + '" stroke-width="18" fill="none" stroke-linejoin="round"/>' +
            '<path d="M418 131H440V108" stroke="' + H.core + '" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
            T._waves([[414, 112], [466, 112]], 'rise');
        }
        if (active.torn) {
          s += T._glow(600, 167, 42, 24) +
            '<path d="M582 158l6 4 6-4 6 4 6-4 6 4 6-4V176l-6-4-6 4-6-4-6 4-6-4-6 4z" fill="' + H.hot + '" stroke="#0e0a2a" stroke-width="2" stroke-linejoin="round"/>' +
            '<path d="M588 167H612" stroke="' + H.core + '" stroke-width="5" stroke-linecap="round"/>' +
            T._waves([[588, 150], [614, 150]], 'rise');
        }
        if (active.tap) {
          s += T._glow(528, 300, 32, 28) +
            '<rect x="512" y="286" width="28" height="16" rx="4" fill="' + H.edge + '" stroke="#0e0a2a" stroke-width="3"/>' +
            '<path d="M520 240V292" stroke="' + H.edge + '" stroke-width="10"/>' +
            '<g class="thml-drop"><path d="M536 318q-5 7 0 10 5-3 0-10z" fill="' + H.hot + '" stroke="#0e0a2a" stroke-width="2"/></g>' +
            '<g class="thml-drop" style="animation-delay:-0.6s"><path d="M536 318q-5 7 0 10 5-3 0-10z" fill="' + H.hot + '" stroke="#0e0a2a" stroke-width="2"/></g>' +
            '<ellipse cx="536" cy="352" rx="18" ry="5" fill="' + H.edge + '"/>' +
            T._waves([[552, 282], [508, 340]], 'rise');
        }
        if (active.door) {
          s += '<ellipse cx="620" cy="386" rx="80" ry="16" fill="' + C.spot + '" opacity=".75"/>' +
            '<rect x="594" y="374" width="76" height="8" fill="' + C.spot + '"/>' +
            '<rect x="666" y="204" width="8" height="178" fill="' + C.spot + '"/>' +
            T._waves([[648, 358], [620, 372], [662, 250]], 'drift');
        }
        if (active.window) {
          s += T._waves([[338, 60], [338, 78]], 'drift');   // холодный воздух тянется внутрь прямо в проёме окошка
        }
        return s;
      }
    },

    // Палата: окно с форточкой, батарея под подоконником, кровать с пациентом, розетка на наружной стене
    ward: {
      lensStart: [560, 250],
      leaks: [
        { id: 'corner', x: 44,  y: 50,  r: 44 },   // промерзающий угол под потолком
        { id: 'wall',   x: 120, y: 184, r: 46 },   // холодная наружная стена
        { id: 'frame',  x: 232, y: 206, r: 34 },   // щель в оконной раме
        { id: 'vent',   x: 380, y: 108, r: 38 },   // форточка открыта весь день
        { id: 'slope',  x: 440, y: 170, r: 34 },   // щель между окном и стеной
        { id: 'sill',   x: 330, y: 280, r: 30 },   // сквозняк под подоконником
        { id: 'socket', x: 131, y: 331, r: 30 }    // дует из розетки
      ],
      fine: [
        { id: 'radiator', rects: [[262, 296, 136, 66]], mx: 330, my: 329 },
        { id: 'person', rects: [[496, 214, 274, 168]], mx: 700, my: 300 }
      ],

      draw: function (p, thermal, active) {
        var L = p.line;
        var s = '';
        // Стены, нижняя панель, потолок, пол
        s += '<rect width="800" height="450" fill="' + p.wall + '"/>' +
          '<rect x="0" y="300" width="800" height="82" fill="' + p.brick + '"/><path d="M0 300H800" stroke="' + L + '" stroke-width="2"/>';
        s += '<rect x="-4" y="-4" width="808" height="32" fill="' + p.ceil + '" stroke="' + L + '" stroke-width="3"/>';
        s += '<rect x="-4" y="382" width="808" height="72" fill="' + p.floor + '" stroke="' + L + '" stroke-width="3"/>';
        s += '<path d="M0 410H800M0 436H800" stroke="' + p.floorLine + '" stroke-width="3"/>';
        // Светильник
        s += '<path d="M640 28v18" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M612 60q28-26 56 0z" fill="' + p.lamp + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>';
        // Окно: рама, левая створка, форточка (вверху справа), нижнее стекло справа
        s += '<rect x="226" y="66" width="208" height="200" rx="4" fill="' + p.frame + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="238" y="78" width="88" height="176" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="338" y="146" width="84" height="108" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>';
        if (active.vent) {
          // форточка распахнута: в проёме — улица, створка повёрнута внутрь
          s += '<rect x="338" y="78" width="84" height="58" fill="' + p.outside + '" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M338 78L386 90V128L338 136Z" fill="' + p.glass + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>';
        } else {
          s += '<rect x="338" y="78" width="84" height="58" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>';
        }
        s += '<path d="M302 160h12M398 200h12" stroke="' + L + '" stroke-width="4" stroke-linecap="round"/>';   // ручки
        // Подоконник
        s += '<rect x="214" y="262" width="232" height="14" rx="3" fill="' + p.sill + '" stroke="' + L + '" stroke-width="3"/>';
        // Батарея
        var fins = '';
        for (var i = 1; i < 8; i++) fins += 'M' + (262 + i * 17) + ' 302V356';
        s += '<rect x="262" y="296" width="136" height="66" rx="8" fill="' + p.radiator + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="' + fins + '" stroke="' + p.radiatorLine + '" stroke-width="3"/>' +
          '<path d="M270 362v20M390 362v20" stroke="' + L + '" stroke-width="5"/>';
        // Розетка на наружной стене
        s += '<rect x="118" y="318" width="26" height="26" rx="5" fill="' + p.socket + '" stroke="' + L + '" stroke-width="3"/>' +
          '<circle cx="126" cy="331" r="2.5" fill="' + L + '"/><circle cx="136" cy="331" r="2.5" fill="' + L + '"/>';
        // Картина
        s += '<rect x="548" y="82" width="128" height="86" rx="4" fill="' + p.frame + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="558" y="92" width="108" height="66" fill="' + p.picture + '"/>' +
          '<path d="M558 158L590 122L612 142L630 116L666 158Z" fill="' + p.ceil + '"/>';
        // Кровать с пациентом
        s += '<rect x="742" y="214" width="28" height="168" rx="6" fill="' + p.bed + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="496" y="262" width="16" height="120" rx="5" fill="' + p.bed + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="506" y="300" width="240" height="40" rx="8" fill="' + p.sill + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="506" y="338" width="240" height="14" fill="' + p.bed + '" stroke="' + L + '" stroke-width="3"/>' +
          '<ellipse cx="716" cy="290" rx="30" ry="14" fill="' + p.pillow + '" stroke="' + L + '" stroke-width="3"/>' +
          '<circle cx="700" cy="272" r="20" fill="' + p.skin + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M681 266q4-20 22-20q14 0 17 14q-16-6-39 6z" fill="' + p.hair + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M530 292q90-24 150-6q20 6 20 22v32H530z" fill="' + p.blanket + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M600 290q6 20 0 48" stroke="' + L + '" stroke-width="2" fill="none"/>';
        return s;
      },

      overlays: function (active) {
        var T = EB.minigames.thermal;
        var C = T.COLD;
        var s = '';
        if (active.corner) {
          s += '<path d="M0 28H150Q70 50 52 150L0 176Z" fill="' + C.spot + '" opacity=".8"/>' +
            T._waves([[36, 40], [72, 44]], 'fall');
        }
        if (active.wall) {
          s += '<ellipse cx="120" cy="184" rx="50" ry="64" fill="' + C.spot + '" opacity=".65"/>' +
            T._waves([[104, 154], [136, 160]], 'fall');
        }
        if (active.frame) {
          s += '<rect x="226" y="150" width="14" height="112" fill="' + C.spot + '"/>' +
            T._waves([[214, 164], [214, 204]], 'fall');
        }
        if (active.vent) {
          s += '<rect x="338" y="78" width="84" height="58" fill="' + C.spot + '"/>' +
            '<path d="M338 78L386 90V128L338 136Z" fill="#2f2380" stroke="#0e0a2a" stroke-width="3" stroke-linejoin="round"/>' +
            T._waves([[364, 142], [404, 142]], 'fall');
        }
        if (active.slope) {
          s += '<rect x="432" y="68" width="14" height="196" fill="' + C.spot + '"/>' +
            T._waves([[458, 130], [458, 178]], 'fall');
        }
        if (active.sill) {
          s += '<rect x="214" y="274" width="232" height="10" fill="' + C.spot + '"/>' +
            T._waves([[310, 288], [390, 288]], 'drift');
        }
        if (active.socket) {
          s += '<circle cx="131" cy="331" r="24" fill="' + C.spot + '" opacity=".85"/>' +
            T._waves([[184, 324], [184, 342]], 'drift');
        }
        return s;
      }
    },

    // Вестибюль (приёмный покой): большое окно, входная дверь, лампа, обогреватель, регистратура
    lobby: {
      lensStart: [400, 240],
      leaks: [
        { id: 'glass',   x: 141, y: 187, r: 60 },   // окно с одним стеклом
        { id: 'slope',   x: 254, y: 190, r: 30 },   // щель между окном и стеной
        { id: 'entry',   x: 660, y: 300, r: 62 },   // входная дверь не закрывается
        { id: 'transom', x: 632, y: 160, r: 40 },   // щель в остеклении над дверью
        { id: 'heater',  x: 466, y: 340, r: 42 },   // обогреватель работает зря
        { id: 'bulb',    x: 330, y: 104, r: 36 }    // горячая лампа накаливания
      ],
      fine: [
        { id: 'radiator', rects: [[70, 310, 140, 56]], mx: 140, my: 338 },
        { id: 'person', rects: [[296, 224, 68, 72]], mx: 330, my: 250 },
        { id: 'led', rects: [[600, 22, 100, 30]], mx: 650, my: 34 }
      ],

      draw: function (p, thermal, active) {
        var L = p.line;
        var s = '';
        s += '<rect width="800" height="450" fill="' + p.wall + '"/>' +
          '<rect x="0" y="300" width="800" height="82" fill="' + p.brick + '"/><path d="M0 300H800" stroke="' + L + '" stroke-width="2"/>';
        s += '<rect x="-4" y="-4" width="808" height="32" fill="' + p.ceil + '" stroke="' + L + '" stroke-width="3"/>';
        s += '<rect x="-4" y="382" width="808" height="72" fill="' + p.floor + '" stroke="' + L + '" stroke-width="3"/>';
        s += '<path d="M0 410H800M0 436H800" stroke="' + p.floorLine + '" stroke-width="3"/>';
        // Большое окно с подоконником и батареей
        s += '<rect x="34" y="84" width="212" height="206" rx="4" fill="' + p.frame + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="46" y="96" width="190" height="182" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>' +
          '<path d="M141 96V278M46 187H236" stroke="' + p.frame + '" stroke-width="8"/>' +
          '<path d="M141 96V278M46 187H236" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="26" y="288" width="228" height="12" rx="3" fill="' + p.sill + '" stroke="' + L + '" stroke-width="3"/>';
        var fins = '';
        for (var i = 1; i < 8; i++) fins += 'M' + (70 + i * 17.5) + ' 316V360';
        s += '<rect x="70" y="310" width="140" height="56" rx="8" fill="' + p.radiator + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="' + fins + '" stroke="' + p.radiatorLine + '" stroke-width="3"/>' +
          '<path d="M78 366v16M202 366v16" stroke="' + L + '" stroke-width="5"/>';
        // Лампа на проводе (старая лампа накаливания)
        s += '<path d="M330 28V74" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="322" y="72" width="16" height="13" rx="3" fill="' + p.band + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M322 85h16c0 4 2 6 6 12c8 10 4 26-14 26c-18 0-22-16-14-26c4-6 6-8 6-12z" fill="' + p.bulb + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>';
        // Регистратура: сотрудница за стойкой
        s += '<path d="M300 300v-20q0-14 14-14h32q14 0 14 14v20z" fill="' + p.shirt + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<circle cx="330" cy="248" r="20" fill="' + p.skin + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M310 246q2-22 20-22t20 22q-6-10-20-10t-20 10z" fill="' + p.hair + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<rect x="250" y="290" width="160" height="92" fill="' + p.desk + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="244" y="282" width="172" height="12" rx="3" fill="' + p.desk + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M270 312h120M270 336h120" stroke="' + L + '" stroke-width="2" opacity=".4"/>';
        // Доска объявлений
        s += '<rect x="430" y="110" width="80" height="90" rx="4" fill="' + p.board + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M442 128h56M442 144h44M442 160h52M442 176h36" stroke="' + p.band + '" stroke-width="4" stroke-linecap="round"/>';
        // Масляный обогреватель
        s += '<rect x="432" y="306" width="68" height="70" rx="10" fill="' + p.heater + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M446 314v54M460 314v54M474 314v54M488 314v54" stroke="' + p.band + '" stroke-width="3"/>' +
          '<circle cx="440" cy="380" r="4" fill="' + L + '"/><circle cx="492" cy="380" r="4" fill="' + L + '"/>';
        // Светодиодная панель под потолком
        s += '<rect x="610" y="28" width="80" height="12" rx="3" fill="' + p.panel + '" stroke="' + L + '" stroke-width="3"/>';
        // Входная дверь: рама, остекление сверху, две створки
        s += '<rect x="540" y="130" width="184" height="252" fill="' + p.frame + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="550" y="140" width="164" height="44" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="550" y="196" width="80" height="186" rx="3" fill="' + p.door + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="562" y="210" width="56" height="90" rx="3" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>' +
          '<path d="M622 300v24" stroke="' + L + '" stroke-width="4" stroke-linecap="round"/>';
        if (active.entry) {
          // правая створка распахнута — в проёме улица со снегом
          s += '<rect x="634" y="196" width="80" height="186" fill="' + p.outside + '" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M634 362q20-8 40 0t40 0V382H634z" fill="#ffffff" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M714 196L742 186V392L714 382Z" fill="' + p.door + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>';
        } else {
          s += '<rect x="634" y="196" width="80" height="186" rx="3" fill="' + p.door + '" stroke="' + L + '" stroke-width="3"/>' +
            '<rect x="646" y="210" width="56" height="90" rx="3" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M642 300v24" stroke="' + L + '" stroke-width="4" stroke-linecap="round"/>';
        }
        return s;
      },

      overlays: function (active) {
        var T = EB.minigames.thermal;
        var H = T.HOT, C = T.COLD;
        var s = '';
        if (active.glass) {
          s += '<rect x="46" y="96" width="190" height="182" fill="' + C.spot + '" opacity=".85"/>' +
            '<path d="M141 96V278M46 187H236" stroke="#0e0a2a" stroke-width="6"/>' +
            T._waves([[90, 120], [190, 120], [140, 206]], 'fall');
        }
        if (active.slope) {
          s += '<rect x="246" y="82" width="14" height="210" fill="' + C.spot + '"/>' +
            T._waves([[272, 150], [272, 196]], 'fall');
        }
        if (active.entry) {
          s += '<rect x="634" y="196" width="80" height="186" fill="' + C.spot + '"/>' +
            '<ellipse cx="620" cy="392" rx="110" ry="16" fill="' + C.spot + '" opacity=".75"/>' +
            T._waves([[640, 372], [600, 380], [560, 372]], 'drift');
        }
        if (active.transom) {
          s += '<rect x="550" y="140" width="164" height="10" fill="' + C.spot + '"/>' +
            T._waves([[592, 156], [672, 156]], 'fall');
        }
        if (active.heater) {
          s += T._glow(466, 340, 54, 50) +
            '<rect x="432" y="306" width="68" height="70" rx="10" fill="' + H.hot + '" stroke="#0e0a2a" stroke-width="3"/>' +
            '<path d="M446 314v54M460 314v54M474 314v54M488 314v54" stroke="' + H.core + '" stroke-width="4"/>' +
            T._waves([[448, 296], [484, 296]], 'rise');
        }
        if (active.bulb) {
          s += T._glow(330, 104, 46, 46) +
            '<path d="M322 85h16c0 4 2 6 6 12c8 10 4 26-14 26c-18 0-22-16-14-26c4-6 6-8 6-12z" fill="' + H.core + '" stroke="#0e0a2a" stroke-width="3" stroke-linejoin="round"/>' +
            T._waves([[300, 84], [360, 84]], 'rise');
        }
        return s;
      }
    }
  },

  // Жёлтое «свечение» горячего места (радиальный градиент описан в _svg)
  _glow: function (cx, cy, rx, ry) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="url(#thml-glow)"/>';
  },

  // Волны: rise — тёплый воздух поднимается, fall — холодный падает, drift — сквозняк тянется по полу.
  // Рисуем тёмную подложку и светлую линию сверху, чтобы волны было видно на любом фоне.
  _waves: function (points, kind) {
    var light = kind === 'rise' ? '#fff6c8' : this.COLD.wave;
    return points.map(function (pt, i) {
      var x = pt[0], y = pt[1];
      var d = kind === 'rise' ? 'M' + x + ' ' + y + 'q6-6 0-12t0-12t0-12' :
        (kind === 'fall' ? 'M' + x + ' ' + y + 'q6 6 0 12t0 12t0 12' : 'M' + x + ' ' + y + 'q-6-6-12 0t-12 0t-12 0');
      if (kind === 'drift' && x > 640) d = 'M' + x + ' ' + y + 'q-6-6-12 0t-12 0'; // у боковой щели — короче
      return '<g class="thml-wave thml-wave--' + kind + '" style="animation-delay:' + (-i * 0.45) + 's">' +
        '<path d="' + d + '" stroke="#0e0a2a" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        '<path d="' + d + '" stroke="' + light + '" stroke-width="4" fill="none" stroke-linecap="round"/></g>';
    }).join('');
  },

  start: function (box, options) {
    var self = this;
    self._box = box;
    self._options = options;
    self._finished = false;
    self._doneCalled = false;
    // Помещение: случайное из списка уровня, но не то же, что в прошлый раз
    var rooms = self.ROOMS[EB.game && EB.game.levelId] || self.DEFAULT_ROOMS;
    var choice = rooms.length > 1 ? rooms.filter(function (r) { return r !== self._lastRoom; }) : rooms;
    self._roomId = EB.utils.shuffle(choice)[0];
    self._lastRoom = self._roomId;
    self._scene = self.SCENES[self._roomId];
    self._renderIntro();
  },

  // Название помещения на текущем языке: «подвал», «палата», «вестибюль»
  _roomName: function () { return EB.t('mg.thermal.room.' + this._roomId); },

  stop: function () {
    clearInterval(this._timer);
    clearTimeout(this._endTimer);
    this._timer = null;
    this._endTimer = null;
    this._finished = true;
  },

  _cfg: function () { return EB.config.minigames.thermal; },

  // ---------- Экран 1: правила ----------
  _renderIntro: function () {
    var self = this;
    self._box.innerHTML =
      '<h2 class="minigame__title">' + EB.t('mg.thermal.title') + '</h2>' +
      '<p class="minigame__step">' + self._roomName() + '</p>' +
      '<p class="minigame__text">' + EB.t('mg.thermal.rules') + '</p>' +
      self._legendHtml() +
      '<div class="panel__buttons"><button class="btn btn--primary btn--small" data-mg="go">' + EB.t('mg.go') + '</button></div>';
    var go = self._box.querySelector('[data-mg="go"]');
    go.addEventListener('click', function () {
      EB.audio.play('click');
      self._setup();
    });
    go.focus();
  },

  // Легенда: холодно — тепло, и «волны = утечка» (форма, а не только цвет)
  _legendHtml: function () {
    return '<div class="thml__legend" aria-hidden="true">' +
      '<span class="thml__legend-end">❄ ' + EB.t('mg.thermal.cold') + '</span>' +
      '<span class="thml__legend-bar"></span>' +
      '<span class="thml__legend-end">' + EB.t('mg.thermal.warm') + ' 🔥</span>' +
      '<span class="thml__legend-wave"><svg viewBox="0 0 40 30"><path d="M8 28q6-6 0-12t0-12M20 28q6-6 0-12t0-12M32 28q6-6 0-12t0-12" stroke="#2b3a4a" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>' +
      EB.t('mg.thermal.waveLegend') + '</span>' +
      '</div>';
  },

  // ---------- Подготовка партии ----------
  _setup: function () {
    var self = this;
    var cfg = self._cfg();
    var sc = self._scene;
    var n = Math.min(cfg.leaks, sc.leaks.length);
    self._leaks = EB.utils.shuffle(sc.leaks).slice(0, n);   // какие утечки спрятаны в этот раз
    self._active = {};
    self._leaks.forEach(function (l) { self._active[l.id] = true; });
    self._found = {};
    self._foundCount = 0;
    self._checked = {};        // какие «правильные тёплые» места уже отмечали
    self._falseMarks = 0;
    self._penalty = 0;
    self._left = cfg.durationSec * 1000;
    self._lens = { x: sc.lensStart[0], y: sc.lensStart[1] };
    self._allFound = false;
    self._renderGame();
  },

  // Весь рисунок: обычный слой, тепловой слой (виден только в круге линзы), отметки, линза
  _svg: function () {
    var self = this;
    var sc = self._scene;
    var R = self._cfg().lensRadius;
    var H = self.HOT;
    return '<svg class="thml__svg" viewBox="0 0 ' + self.W + ' ' + self.H + '" preserveAspectRatio="xMidYMid slice" tabindex="0" role="application" aria-label="' + EB.t('mg.thermal.stageLabel', { room: self._roomName() }) + '">' +
      '<defs>' +
        '<clipPath id="thml-clip"><circle class="thml-clip-c" cx="' + self._lens.x + '" cy="' + self._lens.y + '" r="' + R + '"/></clipPath>' +
        '<radialGradient id="thml-glow"><stop offset="0" stop-color="' + H.core + '"/><stop offset=".45" stop-color="' + H.hot + '"/>' +
        '<stop offset=".8" stop-color="' + H.edge + '" stop-opacity=".6"/><stop offset="1" stop-color="' + H.edge + '" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<g class="thml-normal">' + sc.draw(self.PALETTES.normal, false, self._active) + '</g>' +
      '<g class="thml-thermal" clip-path="url(#thml-clip)">' + sc.draw(self.PALETTES.thermal, true, self._active) + sc.overlays(self._active) + '</g>' +
      '<g class="thml-marks"></g>' +
      '<g class="thml-lens" transform="translate(' + self._lens.x + ' ' + self._lens.y + ')">' +
        '<circle r="' + R + '" fill="none" stroke="#2b3a4a" stroke-width="7"/>' +
        '<circle r="' + (R - 5) + '" fill="none" stroke="#ffffff" stroke-width="2.5"/>' +
        '<path d="M-10 0h6M4 0h6M0 -10v6M0 4v6" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M' + (R * 0.7) + ' ' + (R * 0.7) + 'l' + (R * 0.35) + ' ' + (R * 0.35) + '" stroke="#2b3a4a" stroke-width="14" stroke-linecap="round"/>' +
        '<path d="M' + (R * 0.7) + ' ' + (R * 0.7) + 'l' + (R * 0.35) + ' ' + (R * 0.35) + '" stroke="#ffb400" stroke-width="8" stroke-linecap="round"/>' +
      '</g>' +
    '</svg>';
  },

  // ---------- Экран 2: игра ----------
  _renderGame: function () {
    var self = this;
    var cfg = self._cfg();
    self._box.innerHTML =
      '<div class="thml">' +
        '<div class="thml__top">' +
          '<h2 class="minigame__title">' + EB.t('mg.thermal.title') + '</h2>' +
          '<span class="thml__time" role="timer">' + EB.ui.icon('timer') + '<b></b></span>' +
          self._legendHtml() +
        '</div>' +
        // Помещение — в строке правил (в заголовке ему тесно: легенда переносилась бы на вторую строку)
        '<p class="minigame__text thml__rules"><b>' + self._roomName() + '.</b> ' + EB.t('mg.thermal.rulesShort') + '</p>' +
        '<div class="thml__play">' +
          '<div class="thml__stage">' + self._svg() + '</div>' +
          '<div class="thml__side">' +
            '<div class="thml__found"><span class="thml__found-label"></span><span class="thml__pips" aria-hidden="true"></span></div>' +
            '<p class="minigame__feedback thml__msg" aria-live="polite"></p>' +
            '<div class="panel__buttons thml__buttons">' +
              '<button class="btn btn--primary btn--small" data-mg="mark">' + EB.t('mg.thermal.mark') + '</button>' +
              '<button class="btn btn--ghost btn--small" data-mg="stop">' + EB.t('mg.thermal.stop') + '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    var svg = self._box.querySelector('.thml__svg');
    self._svgEl = svg;
    self._clipEl = svg.querySelector('.thml-clip-c');
    self._lensEl = svg.querySelector('.thml-lens');
    self._marksEl = svg.querySelector('.thml-marks');

    // Перевод координат экрана в координаты рисунка (800×450)
    function toScene(e) {
      var m = svg.getScreenCTM();
      if (!m) return null;
      var pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      return pt.matrixTransform(m.inverse());
    }
    var dragging = false, moved = false, startX = 0, startY = 0;
    svg.addEventListener('pointerdown', function (e) {
      if (self._finished || e.button > 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* не страшно */ }
      var p = toScene(e);
      if (p) self._moveLens(p.x, p.y);
      e.preventDefault();
    });
    svg.addEventListener('pointermove', function (e) {
      if (self._finished) return;
      // Мышь: линза ходит за курсором и без нажатия. Палец: только когда тянем.
      if (!dragging && e.pointerType !== 'mouse') return;
      if (dragging && Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) > cfg.tapMovePx) moved = true;
      var p = toScene(e);
      if (p) self._moveLens(p.x, p.y);
    });
    svg.addEventListener('pointerup', function () {
      if (!dragging) return;
      dragging = false;
      if (!moved) self._mark();   // короткое касание или клик — отметить место
    });
    svg.addEventListener('pointercancel', function () { dragging = false; });
    svg.addEventListener('keydown', function (e) {
      var step = cfg.keyStep;
      var d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (d) {
        self._moveLens(self._lens.x + d[0], self._lens.y + d[1]);
        e.preventDefault();
      } else if (e.key === 'Enter' || e.key === ' ') {
        self._mark();
        e.preventDefault();
      }
    });
    self._box.querySelector('[data-mg="mark"]').addEventListener('click', function () { self._mark(); });
    self._box.querySelector('[data-mg="stop"]').addEventListener('click', function () {
      EB.audio.play('click');
      self._finish('stopped');
    });

    self._updateProgress();
    self._updateTime();
    // Таймер: считаем настоящее прошедшее время, но не больше полсекунды за шаг
    // (если вкладку свернули, время почти не тратится). Пока сцену чем-то закрыли
    // (например, табличкой «Поверни телефон») или вкладка скрыта — время стоит.
    var last = performance.now();
    self._timer = setInterval(function () {
      var now = performance.now();
      if (!document.hidden && !self._isCovered()) self._left -= Math.min(now - last, 500);
      last = now;
      self._updateTime();
      if (self._left <= 0) self._finish('time');
    }, 250);
    svg.focus();
  },

  // Сцену не видно: её середину закрывает другой элемент (или она за краем экрана)
  _isCovered: function () {
    var svg = this._svgEl;
    var r = svg.getBoundingClientRect();
    var el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !el || !svg.contains(el);
  },

  _moveLens: function (x, y) {
    var lens = this._lens;
    lens.x = EB.utils.clamp(Math.round(x), 0, this.W);
    lens.y = EB.utils.clamp(Math.round(y), 0, this.H);
    this._clipEl.setAttribute('cx', lens.x);
    this._clipEl.setAttribute('cy', lens.y);
    this._lensEl.setAttribute('transform', 'translate(' + lens.x + ' ' + lens.y + ')');
  },

  _updateTime: function () {
    var el = this._box.querySelector('.thml__time');
    if (!el) return;
    var sec = Math.max(0, Math.ceil(this._left / 1000));
    el.querySelector('b').textContent = EB.t('mg.thermal.sec', { n: sec });
    el.setAttribute('aria-label', EB.t('mg.thermal.timeLeft', { n: sec }));
    el.classList.toggle('is-low', sec <= this._cfg().lowTimeSec);
  },

  _updateProgress: function () {
    var self = this;
    var total = self._leaks.length;
    self._box.querySelector('.thml__found-label').textContent = EB.t('mg.thermal.found', { n: self._foundCount, total: total });
    var pips = '';
    for (var i = 0; i < total; i++) {
      pips += i < self._foundCount ?
        '<span class="thml__pip is-on"><svg viewBox="0 0 24 24"><path d="M6 22V3" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round"/><path d="M7 4h12l-4 4.5 4 4.5H7z" fill="#ffb400" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/></svg></span>' :
        '<span class="thml__pip"></span>';
    }
    self._box.querySelector('.thml__pips').innerHTML = pips;
  },

  _say: function (text, good) {
    var msg = this._box.querySelector('.thml__msg');
    if (!msg) return;
    msg.textContent = text;
    msg.className = 'minigame__feedback thml__msg is-' + (good ? 'good' : 'bad');
  },

  // Попадает ли точка в «правильное тёплое» место
  _fineAt: function (x, y) {
    var list = this._scene.fine;
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      for (var j = 0; j < f.rects.length; j++) {
        var r = f.rects[j];
        if (x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3]) return f;
      }
    }
    return null;
  },

  // ---------- Отметка места под линзой ----------
  _mark: function () {
    var self = this;
    if (self._finished || self._allFound) return;
    var cfg = self._cfg();
    var x = self._lens.x, y = self._lens.y;

    // 1) Ближайшая спрятанная утечка в радиусе попадания
    var best = null, bestD = Infinity;
    self._leaks.forEach(function (l) {
      var d = Math.sqrt((l.x - x) * (l.x - x) + (l.y - y) * (l.y - y));
      if (d <= l.r && d < bestD) { best = l; bestD = d; }
    });
    if (best) {
      if (self._found[best.id]) {
        self._say(EB.t('mg.thermal.already'), true);
        return;
      }
      self._found[best.id] = true;
      self._foundCount++;
      EB.audio.play('correct');
      self._addFlag(best.x, best.y, self._foundCount);
      self._say(EB.t('mg.thermal.foundMsg', {
        name: EB.t('mg.thermal.leak.' + best.id),
        fix: EB.t('mg.thermal.leak.' + best.id + '.fix')
      }), true);
      self._updateProgress();
      if (self._foundCount >= self._leaks.length) {
        self._allFound = true;
        clearInterval(self._timer);
        self._endTimer = setTimeout(function () { self._finish('all'); }, cfg.allFoundDelayMs);
      }
      return;
    }

    // 2) Тёплое, но всё в порядке — подсказка и небольшой штраф (за каждое место один раз)
    var fine = self._fineAt(x, y);
    if (fine) {
      EB.audio.play('error');
      if (!self._checked[fine.id]) {
        self._checked[fine.id] = true;
        self._falseMarks++;
        self._penalty += cfg.finePenalty;
        self._addCheck(fine.mx !== undefined ? fine.mx : x, fine.my !== undefined ? fine.my : y);
      }
      self._say(EB.t('mg.thermal.ok.' + fine.id), false);
      return;
    }

    // 3) Пустое место
    EB.audio.play('error');
    self._falseMarks++;
    self._penalty += cfg.emptyPenalty;
    self._say(EB.t('mg.thermal.empty'), false);
  },

  // Флажок на найденной утечке (с номером)
  _addFlag: function (x, y, n) {
    this._marksEl.insertAdjacentHTML('beforeend',
      '<g class="thml-flag" transform="translate(' + x + ' ' + y + ')">' +
        '<path d="M0 0V-46" stroke="#2b3a4a" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M2 -46h30l-8 10 8 10H2z" fill="#ffb400" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>' +
        '<text x="15" y="-30" text-anchor="middle" font-size="15" font-weight="800" fill="#2b3a4a">' + n + '</text>' +
        '<circle r="5" fill="#2b3a4a"/>' +
      '</g>');
  },

  // Кружок-галочка «проверено, всё в порядке»
  _addCheck: function (x, y) {
    this._marksEl.insertAdjacentHTML('beforeend',
      '<g class="thml-check" transform="translate(' + x + ' ' + y + ')">' +
        '<circle r="15" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>' +
        '<path d="M-7 0l5 5 9-10" stroke="#1f6fd1" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</g>');
  },

  // Кружок со знаком «?» — утечка, которую не нашли (показываем в конце)
  _addMissed: function (l) {
    this._marksEl.insertAdjacentHTML('beforeend',
      '<g class="thml-missed" transform="translate(' + l.x + ' ' + l.y + ')">' +
        '<circle r="' + Math.min(l.r, 40) + '" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="9 7"/>' +
        '<circle r="14" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>' +
        '<text y="6" text-anchor="middle" font-size="18" font-weight="800" fill="#2b3a4a">?</text>' +
      '</g>');
  },

  // ---------- Итог ----------
  _finish: function (reason) {
    var self = this;
    if (self._finished) return;
    self.stop();
    var total = self._leaks.length;
    var quality = EB.utils.clamp(self._foundCount / total - self._penalty, 0, 1);
    var missed = self._leaks.filter(function (l) { return !self._found[l.id]; });
    EB.audio.play(quality >= EB.config.minigameGoodQuality ? 'win' : 'click');

    // Картинка: тепловой слой целиком, без линзы; пропущенные утечки — со знаком «?»
    var thermalG = self._svgEl.querySelector('.thml-thermal');
    thermalG.removeAttribute('clip-path');
    self._lensEl.remove();
    missed.forEach(function (l) { self._addMissed(l); });
    self._svgEl.removeAttribute('tabindex');
    self._svgEl.setAttribute('role', 'img');

    var root = self._box.querySelector('.thml');
    root.classList.add('thml--end');
    root.querySelector('.thml__top .minigame__title').textContent = EB.t('mg.thermal.done');
    var time = root.querySelector('.thml__time');
    if (time) time.remove();
    root.querySelector('.thml__rules').textContent = EB.t('mg.thermal.end.' + reason);

    var side = root.querySelector('.thml__side');
    side.innerHTML =
      '<ul class="thml__summary">' +
        '<li>' + EB.ui.icon('ok') + '<span>' + EB.t('mg.thermal.statFound', { n: self._foundCount, total: total }) + '</span></li>' +
        '<li>' + EB.ui.icon('warn') + '<span>' + EB.t('mg.thermal.statFalse', { n: self._falseMarks }) + '</span></li>' +
        (missed.length ? '<li>' + EB.ui.icon('info') + '<span>' + EB.t('mg.thermal.statMissed', { n: missed.length }) + '</span></li>' : '') +
      '</ul>' +
      '<p class="minigame__text thml__lesson">' + EB.t('mg.thermal.lesson') + '</p>' +
      '<div class="panel__buttons"><button class="btn btn--primary btn--small" data-mg="done">' + EB.t('mg.finish') + '</button></div>';
    var btn = side.querySelector('[data-mg="done"]');
    btn.addEventListener('click', function () {
      if (self._doneCalled) return;   // onDone — строго один раз
      self._doneCalled = true;
      EB.audio.play('click');
      self._options.onDone({ quality: quality });
    });
    btn.focus();
  }
};
