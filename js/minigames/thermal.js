/*
  thermal.js — мини-игра «Тепловизор» (уровень «Больница», проблема «Голые трубы в подвале»).

  Помещения — в ROOMS ниже: подвал, жилая комната, фасад дома. Каждый раз берётся случайное помещение,
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
  // Помещения по уровням. Уровня нет в списке (или тепловизор открыт из консоли без уровня) — берём DEFAULT_ROOMS.
  ROOMS: { hospital: ['basement', 'room', 'facade'] },
  DEFAULT_ROOMS: ['basement', 'room', 'facade'],
  _lastRoom: null,    // помещение прошлой игры — в этот раз берём другое

  // Палитры: одна и та же сцена рисуется дважды — обычными цветами и «тепловыми»
  PALETTES: {
    normal: {
      line: '#2b3a4a', wall: '#d3dde7', brick: '#bfccd8', ceil: '#8d9eb0', floor: '#a9b7c5', floorLine: '#94a4b4',
      pipe: '#aab8c6', band: '#8797a8', cabinet: '#b9c8d6', gauge: '#ffffff', pump: '#9db1c4', hx: '#c5d2de',
      boiler: '#c4d1dd', boilerTop: '#aebdcb', frame: '#8a9bb0', glass: '#aacde6', door: '#9eafc0',
      doorPanel: '#b3c2d0', tap: '#9aa9b8', bucket: '#a9b9c9', lamp: '#eef2d8', valve: '#9aaab9', wheel: '#7f90a3',
      // basement
      bsInsul: '#e6edf3', bsMetal: '#6e7a86', bsRust: '#b8763c', bsJacket: '#d8e1ea', bsFlange: '#8e9cab', bsSky: '#9fb6cc',
      bsSnow: '#ffffff', bsWater: '#7fb6e0', bsVent: '#8796a6', bsSteam: '#8a9bb0',
      // room
      rmWall: '#dfe7ee', rmPaper: '#d2dce6', rmWallSide: '#c5d1dc', rmCeil: '#f0f3f6', rmFloor: '#c9b79f', rmFloorLine: '#b5a289',
      rmBase: '#a9b8c6', rmDoor: '#a88d70', rmDoorPanel: '#b99f83', rmHall: '#fff1b8', rmSeal: '#3a4654', rmTile: '#e9eef3',
      rmTileLine: '#cdd8e2', rmHood: '#b8c4cf', rmTop: '#8d9eb0', rmCab: '#a9c2d6', rmSink: '#7f90a3', rmWater: '#bfe3ff',
      rmHot: '#e2574c', rmSteam: '#ffffff', rmAir: '#ffffff', rmPlastic: '#f5f8fa', rmSill: '#e9eef2', rmRad: '#f7f9fb',
      rmRadFin: '#d6dee6', rmTherm: '#e9eef2', rmTulle: '#f3f6fa', rmCurtain: '#7f8fc0', rmCurtainFold: '#6878ad', rmWood: '#b8946a',
      rmOut: '#eef4f8', rmSnow: '#ffffff', rmFrost: '#f4fbff', rmFrostLine: '#9fc6df', rmMold: '#56603f', rmMoldDot: '#3c4430',
      rmTv: '#3a4654', rmScreen: '#6d8196', rmSofa: '#8fb3a0', rmSofaDark: '#7a9e8b', rmCushion: '#a9c7b6', rmRug: '#cdb3c0',
      rmCat: '#e3a057', rmCatDark: '#c07a30',
      // facade
      fcSky: '#7f95bb', fcStar: '#f4f1d0', fcMoon: '#f4f1d0', fcSnow: '#f1f5f9', fcSnowShade: '#d5dfea', fcTree: '#6f8f99',
      fcTrunk: '#8a7a6e', fcWall: '#d3dde7', fcWallLine: '#bfccd8', fcPlinth: '#9fb0c2', fcStep: '#b8c6d4', fcRoofEdge: '#8797a8',
      fcRoof: '#6d7f96', fcRoofLine: '#55667d', fcIce: '#e6f6ff', fcVent: '#a9b6c6', fcVentTop: '#8797a8', fcFrame: '#f6f8fb',
      fcGlass: '#f3e3a3', fcGlassDark: '#6d81a6', fcSill: '#aab8c6', fcRoom: '#f7d77e', fcCurtain: '#e8a39b', fcHole: '#2f3b52',
      fcCrackGlass: '#ffffff', fcCrack: '#9fb0c2', fcBalcony: '#aab8c6', fcRail: '#c2cfdb', fcDoor: '#8fa1b6', fcCanopy: '#8797a8',
      fcBrickProp: '#c27a5c', fcOldWood: '#a27b55', fcOldPaint: '#e9dcc4', fcHatch: '#8797a8', fcSteam: '#ffffff', fcFoam: '#f1eccd',
      fcBrick: '#c08a74', fcGround: '#7d8a6a', fcGrass: '#5f7a52', fcCoat: '#5f86b8', fcSkin: '#f2c9a5', fcHat: '#e0715f',
      fcScarf: '#f2c14e', fcCar: '#9fb3c9', fcCarHood: '#9fb3c9', fcCarGlass: '#5f7397', fcTire: '#3b4656'
    },
    thermal: {
      line: '#0e0a2a', wall: '#2a1d6e', brick: '#33257f', ceil: '#1d1452', floor: '#20165a', floorLine: '#2b1f6c',
      pipe: '#7a2fae', band: '#8e38b5', cabinet: '#d2562f', gauge: '#f08a2e', pump: '#ffb13b', hx: '#f39a34',
      boiler: '#a4389e', boilerTop: '#b8429a', frame: '#3a2c8c', glass: '#2f2380', door: '#33267f',
      doorPanel: '#3b2d8a', tap: '#463796', bucket: '#3a2c86', lamp: '#5a3aa8', valve: '#7a2fae', wheel: '#5b2f9e',
      // basement
      bsInsul: '#6b2aa0', bsMetal: '#ff8a1f', bsRust: '#ffd23f', bsJacket: '#5e2c9c', bsFlange: '#8e38b5', bsSky: '#07061f',
      bsSnow: '#141046', bsWater: '#ffb13b', bsVent: '#2b1f6c', bsSteam: '#ffd23f',
      // room
      rmWall: '#2a1d6e', rmPaper: '#2d2073', rmWallSide: '#22185e', rmCeil: '#1d1452', rmFloor: '#20165a', rmFloorLine: '#2b1f6c',
      rmBase: '#2b1f6c', rmDoor: '#33267f', rmDoorPanel: '#3b2d8a', rmHall: '#0b0930', rmSeal: '#1d1452', rmTile: '#2f2177',
      rmTileLine: '#3a2c86', rmHood: '#3a2c86', rmTop: '#3a2c86', rmCab: '#33257f', rmSink: '#463796', rmWater: '#f08a2e',
      rmHot: '#463796', rmSteam: '#ffd23f', rmAir: '#5a3aa8', rmPlastic: '#3a2c8c', rmSill: '#3a2c8c', rmRad: '#ffb13b',
      rmRadFin: '#f08a2e', rmTherm: '#f39a34', rmTulle: '#33267f', rmCurtain: '#3b2d8a', rmCurtainFold: '#33267f', rmWood: '#3a2c8c',
      rmOut: '#0b0930', rmSnow: '#151060', rmFrost: '#120f3e', rmFrostLine: '#1d1452', rmMold: '#1a1450', rmMoldDot: '#120e40',
      rmTv: '#d2562f', rmScreen: '#f39a34', rmSofa: '#4a3596', rmSofaDark: '#3e2d88', rmCushion: '#55399c', rmRug: '#2f2380',
      rmCat: '#ffb13b', rmCatDark: '#f08a2e',
      // facade
      fcSky: '#0b0826', fcStar: '#0b0826', fcMoon: '#0b0826', fcSnow: '#1a1250', fcSnowShade: '#1d1452', fcTree: '#140e44',
      fcTrunk: '#1d1452', fcWall: '#2a1d6e', fcWallLine: '#33257f', fcPlinth: '#2b1f6c', fcStep: '#2b1f6c', fcRoofEdge: '#241a62',
      fcRoof: '#2e2175', fcRoofLine: '#3a2c8c', fcIce: '#3a2c8c', fcVent: '#d2562f', fcVentTop: '#f39a34', fcFrame: '#33267f',
      fcGlass: '#45309a', fcGlassDark: '#3f2b90', fcSill: '#2b1f6c', fcRoom: '#f08a2e', fcCurtain: '#d2562f', fcHole: '#d2562f',
      fcCrackGlass: '#5a3aa8', fcCrack: '#33257f', fcBalcony: '#2b1f6c', fcRail: '#33267f', fcDoor: '#3a2c8c', fcCanopy: '#241a62',
      fcBrickProp: '#2b1f6c', fcOldWood: '#3a2c8c', fcOldPaint: '#463796', fcHatch: '#33267f', fcSteam: '#8e38b5', fcFoam: '#3b2d8a',
      fcBrick: '#7a2fae', fcGround: '#d2562f', fcGrass: '#f08a2e', fcCoat: '#d2562f', fcSkin: '#ffd23f', fcHat: '#a4389e',
      fcScarf: '#f08a2e', fcCar: '#2e2175', fcCarHood: '#f39a34', fcCarGlass: '#241a62', fcTire: '#1d1452'
    }
  },
  HOT: { core: '#fff4a8', hot: '#ffd23f', edge: '#ff8a1f' },
  COLD: { spot: '#07061f', wave: '#8fe9ff' },

  // ======================= Сцены =======================
  SCENES: {
    // Подвал больницы: трубы отопления и горячей воды, тепловой пункт, бак, кран, дверь, окошко, продух у пола.
    // Утеплённые трубы — толстые светлые «рукава» изоляции с бандажами. Каждую утечку видно и без тепловизора:
    // голый металл с ржавчиной, сползшая или порванная изоляция, капли, лужа, открытая створка, снег в щели.
    basement: {
      lensStart: [480, 240],
      leaks: [
        { id: 'pipe',     x: 215, y: 131, r: 38 },   // на верхней трубе нет куска изоляции
        { id: 'valve',    x: 330, y: 180, r: 36 },   // задвижка без чехла
        { id: 'elbow',    x: 440, y: 124, r: 36 },   // поворот трубы без изоляции
        { id: 'torn',     x: 600, y: 172, r: 38 },   // порванная изоляция свисает лоскутом
        { id: 'tap',      x: 528, y: 306, r: 36 },   // капает кран горячей воды
        { id: 'door',     x: 634, y: 300, r: 54 },   // дверь подвала приоткрыта, в щель метёт снег
        { id: 'window',   x: 300, y: 69,  r: 42 },   // открытое окошко
        { id: 'bs-riser', x: 720, y: 98,  r: 46 },   // изоляция сползла со стояка, стояк голый
        { id: 'bs-joint', x: 410, y: 352, r: 44 },   // подтекает соединение горячей трубы, на полу лужа
        { id: 'bs-vent',  x: 255, y: 352, r: 40 }    // открытый продух у пола
      ],
      fine: [
        { id: 'substation', rects: [[22, 196, 154, 186]], mx: 150, my: 214 },
        { id: 'boiler', rects: [[704, 196, 82, 186]], mx: 745, my: 232 },
        // утеплённые трубы и задвижка в чехле — отметка ставится там, куда нажали
        { id: 'insulated', rects: [
          [116, 118, 337, 26], [116, 118, 26, 80],   // верхняя труба и её спуск к тепловому пункту
          [427, 0, 26, 131],                         // стояк над поворотом
          [145, 154, 655, 26], [145, 154, 26, 44],   // нижняя труба
          [707, 0, 26, 167], [752, 167, 26, 28],     // стояк справа и труба к баку
          [397, 167, 26, 215], [512, 167, 16, 117],  // труба в пол и трубка к крану
          [306, 146, 48, 42]                         // задвижка в чехле
        ] }
      ],

      // Рисунок подвала. p — палитра, active — {id: true} для спрятанных утечек
      draw: function (p, thermal, active) {
        var L = p.line;
        var s = '';

        // --- Помощники ---
        // Голая труба (металл): тёмный контур и металл поверх
        function bare(d, w) {
          return '<path d="' + d + '" stroke="' + L + '" stroke-width="' + (w + 6) + '" fill="none" stroke-linejoin="round"/>' +
            '<path d="' + d + '" stroke="' + p.bsMetal + '" stroke-width="' + w + '" fill="none" stroke-linejoin="round"/>';
        }
        // Труба в изоляции: толстый светлый «рукав»
        function insul(d, w) {
          return '<path d="' + d + '" stroke="' + L + '" stroke-width="' + (w + 6) + '" fill="none" stroke-linejoin="round"/>' +
            '<path d="' + d + '" stroke="' + p.bsInsul + '" stroke-width="' + w + '" fill="none" stroke-linejoin="round"/>';
        }
        // Край изоляции (поперечная черта): у горизонтальной трубы — вертикальная, и наоборот
        function cutV(x, y) { return '<path d="M' + x + ' ' + (y - 13) + 'v26" stroke="' + L + '" stroke-width="3"/>'; }
        function cutH(x, y) { return '<path d="M' + (x - 13) + ' ' + y + 'h26" stroke="' + L + '" stroke-width="3"/>'; }
        // Ржавые пятнышки на голом металле: [x, y, радиус]
        function rust(list) {
          return list.map(function (r) { return '<ellipse cx="' + r[0] + '" cy="' + r[1] + '" rx="' + (r[2] + 1.5) + '" ry="' + r[2] + '" fill="' + p.bsRust + '"/>'; }).join('');
        }
        // Снежинка с тёмной обводкой (видна и на светлой стене)
        function flake(x, y) {
          var d = 'M' + (x - 5) + ' ' + y + 'h10M' + x + ' ' + (y - 5) + 'v10M' + (x - 3.5) + ' ' + (y - 3.5) + 'l7 7M' + (x + 3.5) + ' ' + (y - 3.5) + 'l-7 7';
          return '<path d="' + d + '" stroke="' + L + '" stroke-width="4.5" stroke-linecap="round"/>' +
            '<path d="' + d + '" stroke="' + p.bsSnow + '" stroke-width="2" stroke-linecap="round"/>';
        }
        // Капля воды (анимация — класс thml-drop из style.css)
        function drop(x, y, delay) {
          return '<g class="thml-drop" style="animation-delay:' + delay + 's"><path d="M' + x + ' ' + y + 'q-5 7 0 10 5-3 0-10z" fill="' + p.bsWater + '" stroke="' + L + '" stroke-width="2"/></g>';
        }

        // --- Стена с кирпичной кладкой ---
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

        // --- Окошко подвала (две створки) ---
        s += '<rect x="241" y="38" width="118" height="62" rx="6" fill="' + p.frame + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="251" y="46" width="49" height="46" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>';
        if (active.window) {
          // Правая створка распахнута: в проёме — небо, сугроб и снежинки, сама створка повёрнута наружу
          s += '<rect x="300" y="46" width="49" height="46" fill="' + p.bsSky + '" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M300 92v-10q12-9 25-4q12-7 24 2v12z" fill="' + p.bsSnow + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>' +
            '<path d="M349 46L376 34V108L349 94z" fill="' + p.frame + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M354 52L371 45V97L354 88z" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>';
          if (!thermal) s += flake(312, 58) + flake(332, 68) + flake(392, 58) + flake(404, 86);
        } else {
          s += '<rect x="300" y="46" width="49" height="46" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>';
        }
        s += '<path d="M300 46v46" stroke="' + L + '" stroke-width="3"/>';

        // --- Тепловой пункт: шкаф, манометры, насос, теплообменник ---
        s += '<rect x="22" y="196" width="154" height="186" rx="10" fill="' + p.cabinet + '" stroke="' + L + '" stroke-width="3"/>' +
          '<circle cx="58" cy="230" r="15" fill="' + p.gauge + '" stroke="' + L + '" stroke-width="3"/><path d="M58 230l8-7" stroke="' + L + '" stroke-width="3" stroke-linecap="round"/>' +
          '<circle cx="100" cy="230" r="15" fill="' + p.gauge + '" stroke="' + L + '" stroke-width="3"/><path d="M100 230l-8-7" stroke="' + L + '" stroke-width="3" stroke-linecap="round"/>' +
          '<circle cx="66" cy="316" r="28" fill="' + p.pump + '" stroke="' + L + '" stroke-width="3"/><circle cx="66" cy="316" r="10" fill="' + p.cabinet + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="112" y="262" width="48" height="104" rx="6" fill="' + p.hx + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M124 272v84M136 272v84M148 272v84" stroke="' + L + '" stroke-width="2"/>';

        // --- Продух у пола (вентиляционное окошко подвала) ---
        s += '<rect x="222" y="328" width="66" height="46" rx="4" fill="' + p.frame + '" stroke="' + L + '" stroke-width="3"/>';
        if (active['bs-vent']) {
          // Заслонка поднята: в проёме — улица и снег, снег высыпался на пол
          s += '<rect x="229" y="335" width="52" height="32" fill="' + p.bsSky + '" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M229 367v-6q12-8 26-3q13-7 26 1v8z" fill="' + p.bsSnow + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>' +
            '<path d="M229 335L237 308H273L281 335z" fill="' + p.bsVent + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M240 317h32M238 326h36" stroke="' + L + '" stroke-width="2"/>' +
            '<ellipse cx="262" cy="388" rx="34" ry="7" fill="' + p.bsSnow + '" stroke="' + L + '" stroke-width="2"/>';
          if (!thermal) s += flake(244, 346) + flake(266, 344) + flake(306, 360) + flake(326, 376);
        } else {
          // Заслонка закрыта: жалюзи
          s += '<rect x="229" y="335" width="52" height="32" fill="' + p.bsVent + '" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M233 343h44M233 351h44M233 359h44" stroke="' + L + '" stroke-width="2"/>';
        }

        // --- Трубы ---
        // 1) Металлическая труба по всей сети (её видно только там, где нет изоляции)
        s += bare('M129 198V131H440V-6M158 198V167H806M720 167V-6M765 167V202M410 167V384', 10) + bare('M520 167V284', 6);
        // 2) Изоляция. Сначала ответвления, потом магистраль — так стыки выглядят аккуратно.
        //    Стояк справа: если изоляция сползла — она гармошкой лежит внизу, выше голый металл
        if (active['bs-riser']) {
          s += insul('M720 167V150', 20) +
            '<path d="M704 122l5 6-5 6 5 6-5 6 5 6h32l-5-6 5-6-5-6 5-6-5-6z" fill="' + p.bsInsul + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M708 134h24M708 146h24" stroke="' + L + '" stroke-width="2"/>' +
            rust([[720, 46, 3], [717, 74, 2.5], [722, 100, 3], [719, 112, 1.5]]);
        } else {
          s += insul('M720 167V-6', 20) + '<rect x="709" y="56" width="22" height="6" fill="' + p.band + '"/>';
        }
        s += insul('M765 167V202', 20);                                          // к баку
        s += insul('M410 167V306M410 338V384', 20) + cutH(410, 306) + cutH(410, 338);   // в пол, с разъёмом
        s += insul('M520 167V272', 12) + '<path d="M513 272h14" stroke="' + L + '" stroke-width="3"/>';  // к крану
        // Верхняя труба: от теплового пункта вправо и вверх (поворот у x = 440)
        var a = 'M129 198V131';
        if (active.pipe) a += 'H185M245 131';
        a += active.elbow ? 'H418M440 109V-6' : 'H440V-6';
        s += insul(a, 20);
        if (active.pipe) s += cutV(185, 131) + cutV(245, 131) + rust([[198, 129, 3], [212, 134, 2], [226, 128, 2.5], [237, 133, 1.5]]);
        if (active.elbow) s += cutV(418, 131) + cutH(440, 109) + rust([[426, 130, 2.5], [439, 118, 2], [436, 132, 1.5]]);
        // Нижняя труба: через всю стену
        s += insul('M158 198V167H806', 20);
        // Бандажи на изоляции (на голых участках их нет)
        var bands = '';
        [160, 290, 370].forEach(function (bx) { if (!(active.pipe && bx > 175 && bx < 255)) bands += '<rect x="' + (bx - 3) + '" y="121" width="6" height="20" fill="' + p.band + '"/>'; });
        bands += '<rect x="429" y="60" width="22" height="6" fill="' + p.band + '"/>';
        [230, 460, 560, 670, 790].forEach(function (bx) { bands += '<rect x="' + (bx - 3) + '" y="157" width="6" height="20" fill="' + p.band + '"/>'; });
        s += bands;
        // Порванная изоляция: дыра с голым металлом и лоскут, свисающий вниз
        if (active.torn) {
          s += '<path d="M584 158l5 5 5-5 5 5 5-5 5 5 5-5V176l-5-4-5 4-5-4-5 4-5-4-5 4z" fill="' + p.bsMetal + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>' +
            rust([[594, 167, 2], [606, 166, 2.5]]) +
            '<path d="M586 176L578 214L590 209L597 224L606 178z" fill="' + p.bsInsul + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>';
        }

        // --- Разъём (фланцы) на трубе в пол; если подтекает — капли и лужа ---
        s += '<rect x="398" y="304" width="24" height="36" rx="3" fill="' + p.bsFlange + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="392" y="310" width="36" height="8" rx="2" fill="' + p.bsFlange + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="392" y="326" width="36" height="8" rx="2" fill="' + p.bsFlange + '" stroke="' + L + '" stroke-width="2"/>' +
          '<path d="M398 308v28M422 308v28" stroke="' + L + '" stroke-width="3"/>';
        if (active['bs-joint']) {
          s += '<ellipse cx="414" cy="398" rx="40" ry="9" fill="' + p.bsWater + '" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M432 336q4 6 2 12" stroke="' + p.bsWater + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
          if (!thermal) {
            s += drop(434, 352, 0) + drop(434, 352, -0.6) +
              '<ellipse cx="404" cy="396" rx="14" ry="3" fill="' + p.bsSnow + '" opacity=".6"/>' +
              '<path d="M386 386q-6-6 0-12t0-12M444 384q-6-6 0-12t0-12" stroke="' + p.bsSteam + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
          }
        }

        // --- Задвижка на нижней трубе: в чехле или голая ---
        if (active.valve) {
          s += '<rect x="308" y="158" width="7" height="18" rx="2" fill="' + p.bsFlange + '" stroke="' + L + '" stroke-width="2"/>' +
            '<rect x="345" y="158" width="7" height="18" rx="2" fill="' + p.bsFlange + '" stroke="' + L + '" stroke-width="2"/>' +
            '<rect x="316" y="153" width="28" height="28" rx="6" fill="' + p.bsMetal + '" stroke="' + L + '" stroke-width="3"/>' +
            rust([[324, 162, 2.5], [337, 172, 2]]) +
            '<path d="M330 181v14" stroke="' + L + '" stroke-width="4"/>';
        } else {
          s += '<rect x="306" y="148" width="48" height="38" rx="14" fill="' + p.bsJacket + '" stroke="' + L + '" stroke-width="3"/>' +
            '<path d="M313 167h34" stroke="' + L + '" stroke-width="2" stroke-dasharray="5 4"/>' +
            '<path d="M330 186v9" stroke="' + L + '" stroke-width="4"/>';
        }
        s += '<ellipse cx="330" cy="199" rx="17" ry="6" fill="' + p.wheel + '" stroke="' + L + '" stroke-width="3"/>';

        // --- Кран и ведро под ним ---
        s += '<rect x="512" y="284" width="28" height="16" rx="4" fill="' + p.tap + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="514" y="274" width="12" height="10" rx="2" fill="' + p.tap + '" stroke="' + L + '" stroke-width="2"/>' +
          '<path d="M536 300v10" stroke="' + L + '" stroke-width="5" stroke-linecap="round"/>' +
          '<path d="M512 346h48l-6 36h-36z" fill="' + p.bucket + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M514 346q22-18 44 0" fill="none" stroke="' + L + '" stroke-width="2"/>';
        if (active.tap) {
          s += '<ellipse cx="536" cy="350" rx="18" ry="4" fill="' + p.bsWater + '" stroke="' + L + '" stroke-width="2"/>';
          if (!thermal) s += drop(536, 316, 0) + drop(536, 316, -0.6);
        }

        // --- Дверь подвала: закрыта или приоткрыта (в щель видно улицу и метёт снег) ---
        s += '<rect x="586" y="196" width="92" height="186" fill="' + p.frame + '" stroke="' + L + '" stroke-width="3"/>';
        if (active.door) {
          s += '<rect x="594" y="204" width="76" height="178" fill="' + p.bsSky + '" stroke="' + L + '" stroke-width="3"/>' +
            '<path d="M640 382v-12q14-14 30-10v22z" fill="' + p.bsSnow + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>' +
            '<path d="M594 204L650 214V374L594 382z" fill="' + p.door + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M602 217L642 224V276H602z" fill="' + p.doorPanel + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>' +
            '<path d="M602 300H642V362L602 368z" fill="' + p.doorPanel + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>' +
            '<circle cx="642" cy="290" r="5" fill="' + L + '"/>' +
            '<ellipse cx="640" cy="390" rx="40" ry="7" fill="' + p.bsSnow + '" stroke="' + L + '" stroke-width="2"/>';
          if (!thermal) s += flake(660, 236) + flake(661, 290) + flake(626, 344) + flake(600, 392);
        } else {
          s += '<rect x="594" y="204" width="76" height="178" rx="3" fill="' + p.door + '" stroke="' + L + '" stroke-width="3"/>' +
            '<rect x="604" y="216" width="56" height="62" rx="3" fill="' + p.doorPanel + '" stroke="' + L + '" stroke-width="2"/>' +
            '<rect x="604" y="300" width="56" height="66" rx="3" fill="' + p.doorPanel + '" stroke="' + L + '" stroke-width="2"/>' +
            '<circle cx="660" cy="290" r="5" fill="' + L + '"/>';
        }

        // --- Бак горячей воды в утеплённом кожухе ---
        s += '<rect x="704" y="200" width="82" height="180" rx="18" fill="' + p.boiler + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M706 214q39-18 78 0" fill="' + p.boilerTop + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M704 260h82M704 320h82" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="712" y="378" width="12" height="6" fill="' + L + '"/><rect x="766" y="378" width="12" height="6" fill="' + L + '"/>';
        return s;
      },

      // Горячие и холодные пятна с волнами — только для спрятанных утечек
      overlays: function (active) {
        var T = EB.minigames.thermal;
        var H = T.HOT, C = T.COLD, K = '#0e0a2a';
        var s = '';
        // Горячий голый металл: жёлтая труба с самой светлой серединой
        function hotPipe(d) {
          return '<path d="' + d + '" stroke="' + K + '" stroke-width="16" fill="none" stroke-linejoin="round"/>' +
            '<path d="' + d + '" stroke="' + H.hot + '" stroke-width="10" fill="none" stroke-linejoin="round"/>' +
            '<path d="' + d + '" stroke="' + H.core + '" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>';
        }
        function hotDrop(x, y, delay) {
          return '<g class="thml-drop" style="animation-delay:' + delay + 's"><path d="M' + x + ' ' + y + 'q-5 7 0 10 5-3 0-10z" fill="' + H.hot + '" stroke="' + K + '" stroke-width="2"/></g>';
        }
        if (active.pipe) {
          s += T._glow(215, 131, 54, 28) + hotPipe('M187 131H243') +
            T._waves([[197, 112], [215, 110], [233, 112]], 'rise');
        }
        if (active.valve) {
          s += T._glow(330, 170, 36, 30) +
            '<rect x="316" y="153" width="28" height="28" rx="6" fill="' + H.hot + '" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="324" y="160" width="12" height="14" rx="4" fill="' + H.core + '"/>' +
            '<ellipse cx="330" cy="199" rx="17" ry="6" fill="' + H.edge + '" stroke="' + K + '" stroke-width="3"/>' +
            T._waves([[308, 148], [352, 148]], 'rise');
        }
        if (active.elbow) {
          s += T._glow(440, 126, 34, 34) + hotPipe('M418 131H440V109') +
            T._waves([[416, 110], [464, 108]], 'rise');
        }
        if (active.torn) {
          s += T._glow(600, 167, 38, 24) +
            '<path d="M584 158l5 5 5-5 5 5 5-5 5 5 5-5V176l-5-4-5 4-5-4-5 4-5-4-5 4z" fill="' + H.hot + '" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/>' +
            '<path d="M590 167H610" stroke="' + H.core + '" stroke-width="5" stroke-linecap="round"/>' +
            T._waves([[588, 150], [614, 150]], 'rise');
        }
        if (active.tap) {
          s += T._glow(528, 300, 30, 26) +
            '<path d="M520 240V284" stroke="' + H.edge + '" stroke-width="8"/>' +
            '<rect x="512" y="284" width="28" height="16" rx="4" fill="' + H.edge + '" stroke="' + K + '" stroke-width="3"/>' +
            hotDrop(536, 316, 0) + hotDrop(536, 316, -0.6) +
            '<ellipse cx="536" cy="350" rx="18" ry="5" fill="' + H.edge + '"/>' +
            T._waves([[554, 282], [508, 338]], 'rise');
        }
        if (active.door) {
          s += '<ellipse cx="634" cy="388" rx="80" ry="16" fill="' + C.spot + '" opacity=".75"/>' +
            T._waves([[660, 236], [628, 372], [660, 330]], 'drift');
        }
        if (active.window) {
          s += T._waves([[346, 60], [346, 80]], 'drift');   // холодный воздух с улицы тянется внутрь прямо в проёме окошка
        }
        if (active['bs-riser']) {
          s += T._glow(720, 78, 26, 52) + hotPipe('M720 122V32') +
            T._waves([[698, 100], [742, 78]], 'rise');
        }
        if (active['bs-joint']) {
          s += T._glow(412, 324, 32, 22) +
            '<rect x="392" y="310" width="36" height="8" rx="2" fill="' + H.hot + '" stroke="' + K + '" stroke-width="2"/>' +
            '<rect x="392" y="326" width="36" height="8" rx="2" fill="' + H.hot + '" stroke="' + K + '" stroke-width="2"/>' +
            hotDrop(434, 352, 0) + hotDrop(434, 352, -0.6) +
            '<ellipse cx="414" cy="398" rx="40" ry="9" fill="' + H.edge + '" stroke="' + K + '" stroke-width="2"/>' +
            '<ellipse cx="414" cy="397" rx="22" ry="5" fill="' + H.core + '"/>' +
            T._waves([[392, 382], [436, 382]], 'rise');
        }
        if (active['bs-vent']) {
          // Холодный воздух из продуха тянется по полу вправо (волны «сквозняка» отражены зеркально)
          s += '<ellipse cx="282" cy="392" rx="66" ry="12" fill="' + C.spot + '" opacity=".75"/>' +
            '<g transform="matrix(-1 0 0 1 510 0)">' + T._waves([[218, 356], [206, 380]], 'drift') + '</g>';
        }
        return s;
      }
    },

    // Жилая комната в квартире зимой (вид изнутри): входная дверь из подъезда, кухонный уголок,
    // пластиковое окно, балконная дверь, старое деревянное окно, телевизор, диван.
    // Почти все утечки здесь — холод, который заходит в комнату (тёмные пятна, волны вниз и по полу),
    // плюс тепло, которое уходит не туда (батарея за шторой и за диваном, вытяжка, горячий кран).
    room: {
      lensStart: [400, 200],
      leaks: [
        { id: 'rm-door',      x: 70,  y: 350, r: 42 },   // входная дверь без уплотнителя — сквозняк по полу
        { id: 'rm-hood',      x: 182, y: 112, r: 36 },   // вытяжка работает, хотя никто не готовит
        { id: 'rm-tap',       x: 196, y: 262, r: 34 },   // капает кран горячей воды
        { id: 'rm-curtain',   x: 315, y: 305, r: 50 },   // плотная штора до пола закрыла батарею
        { id: 'rm-balcony',   x: 436, y: 345, r: 40 },   // балконная дверь закрыта неплотно, снег у порога
        { id: 'rm-fortochka', x: 526, y: 104, r: 34 },   // форточка открыта весь день
        { id: 'rm-frost',     x: 582, y: 194, r: 36 },   // старое окно: иней на стекле
        { id: 'rm-cable',     x: 646, y: 112, r: 32 },   // дыра в стене вокруг кабеля
        { id: 'rm-mold',      x: 752, y: 56,  r: 34 },   // плесень в холодном углу
        { id: 'rm-sofa',      x: 700, y: 302, r: 44 }    // диван загородил батарею
      ],
      fine: [
        // свободные батареи под окнами; у батареи под шторой — только серединка, она целиком внутри круга
        // утечки rm-curtain: когда штора задёрнута, отметка там засчитается как найденная утечка
        { id: 'rm-radiator', rects: [[498, 276, 118, 70], [276, 286, 78, 50]] },
        { id: 'rm-tv', rects: [[680, 146, 94, 62]], mx: 727, my: 177 },          // работающий телевизор
        { id: 'rm-cat', rects: [[520, 374, 84, 46]], mx: 562, my: 394 }          // кот спит на коврике
      ],

      // Рисунок комнаты. p — палитра, active — {id: true} для спрятанных утечек.
      // Признак каждой утечки (иней, снег, открытая форточка…) рисуем только когда она спрятана.
      draw: function (p, thermal, active) {
        var L = p.line;
        var s = '';

        // Снежинка с шестью лучами: тёмный контур и светлая серединка
        function flake(x, y) {
          var d = 'M' + x + ' ' + (y - 7) + 'v14M' + (x - 6) + ' ' + (y - 3.5) + 'l12 7M' + (x - 6) + ' ' + (y + 3.5) + 'l12-7';
          return '<path d="' + d + '" stroke="' + L + '" stroke-width="4" stroke-linecap="round"/>' +
            '<path d="' + d + '" stroke="' + p.rmSnow + '" stroke-width="2" stroke-linecap="round"/>';
        }
        // Морозный узор-«пёрышко»: стебель из точки (x, y) длиной (dx, dy) и три пары коротких веточек
        function fern(x, y, dx, dy) {
          var len = Math.sqrt(dx * dx + dy * dy), ux = dx / len, uy = dy / len;
          var d = 'M' + x + ' ' + y + 'l' + dx + ' ' + dy;
          [0.35, 0.6, 0.85].forEach(function (t) {
            var px = x + dx * t, py = y + dy * t;
            // веточки смотрят назад, к началу стебля, — как у пера или листа папоротника
            d += 'M' + px.toFixed(1) + ' ' + py.toFixed(1) + 'l' + ((-ux - uy) * 6).toFixed(1) + ' ' + ((-uy + ux) * 6).toFixed(1) +
              'M' + px.toFixed(1) + ' ' + py.toFixed(1) + 'l' + ((-ux + uy) * 6).toFixed(1) + ' ' + ((-uy - ux) * 6).toFixed(1);
          });
          return d;
        }
        // Батарея-«гармошка»: x, y — левый верхний угол, n — сколько секций (каждая шириной 10)
        function radiator(x, y, n) {
          var r = '<path d="M' + (x + 5) + ' ' + (y + 56) + 'V372M' + (x + n * 10 - 5) + ' ' + (y + 56) + 'V372" stroke="' + L + '" stroke-width="9"/>' +
            '<path d="M' + (x + 5) + ' ' + (y + 56) + 'V372M' + (x + n * 10 - 5) + ' ' + (y + 56) + 'V372" stroke="' + p.rmRadFin + '" stroke-width="4"/>';
          for (var i = 0; i < n; i++) {
            r += '<rect x="' + (x + i * 10) + '" y="' + y + '" width="10" height="58" rx="4" fill="' + p.rmRad + '" stroke="' + L + '" stroke-width="2"/>';
          }
          return r + '<path d="M' + x + ' ' + (y + 12) + 'h' + (n * 10) + 'M' + x + ' ' + (y + 46) + 'h' + (n * 10) + '" stroke="' + p.rmRadFin + '" stroke-width="3"/>';
        }

        // Стена в полоску (обои), соседняя стена справа, потолок, пол с плинтусом
        s += '<rect width="800" height="450" fill="' + p.rmWall + '"/>';
        var stripes = '';
        for (var x = 20; x < 778; x += 40) stripes += 'M' + x + ' 22V372';
        s += '<path d="' + stripes + '" stroke="' + p.rmPaper + '" stroke-width="12"/>';
        s += '<rect x="778" y="-4" width="26" height="380" fill="' + p.rmWallSide + '" stroke="' + L + '" stroke-width="3"/>';
        s += '<rect x="-4" y="-4" width="808" height="26" fill="' + p.rmCeil + '" stroke="' + L + '" stroke-width="3"/>';
        s += '<rect x="-4" y="372" width="808" height="82" fill="' + p.rmFloor + '" stroke="' + L + '" stroke-width="3"/>';
        s += '<path d="M0 400H800M0 428H800M120 372l-14 28M330 400l-10 28M520 372l-6 28M700 400l-8 28" stroke="' + p.rmFloorLine + '" stroke-width="3"/>';
        s += '<rect x="-4" y="362" width="782" height="10" fill="' + p.rmBase + '" stroke="' + L + '" stroke-width="2"/>';

        // Плесень в верхнем углу — тёмные пятна (только если утечка спрятана)
        if (active['rm-mold']) {
          [[766, 34, 10], [750, 42, 8], [771, 56, 9], [738, 30, 6], [757, 64, 7], [770, 78, 6], [742, 54, 5], [760, 88, 4], [732, 42, 4], [748, 76, 4]].forEach(function (b) {
            s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="' + p.rmMold + '" stroke="' + L + '" stroke-width="1.5"/>' +
              '<circle cx="' + (b[0] + 1) + '" cy="' + (b[1] + 1) + '" r="' + (b[2] * 0.4) + '" fill="' + p.rmMoldDot + '"/>';
          });
        }

        // ---- Входная дверь из подъезда ----
        s += '<rect x="22" y="148" width="90" height="224" fill="' + p.frame + '" stroke="' + L + '" stroke-width="3"/>';
        if (active['rm-door']) {
          // Под дверью — щель: видна полоска света из подъезда
          s += '<path d="M30 372h74l20 22H10z" fill="' + p.rmHall + '" opacity=".75"/>' +
            '<rect x="30" y="360" width="74" height="12" fill="' + p.rmHall + '" stroke="' + L + '" stroke-width="2"/>';
        }
        s += '<rect x="30" y="156" width="74" height="' + (active['rm-door'] ? 204 : 214) + '" rx="2" fill="' + p.rmDoor + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="40" y="170" width="54" height="78" rx="3" fill="' + p.rmDoorPanel + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="40" y="264" width="54" height="80" rx="3" fill="' + p.rmDoorPanel + '" stroke="' + L + '" stroke-width="2"/>' +
          '<circle cx="67" cy="186" r="3.5" fill="' + L + '"/>' +
          '<path d="M98 256h-14" stroke="' + L + '" stroke-width="6" stroke-linecap="round"/>';
        if (active['rm-door']) {
          // Уплотнитель отклеился и висит, кусок валяется на полу
          s += '<path d="M104 236q16 20 6 40t12 40" stroke="' + L + '" stroke-width="8" fill="none" stroke-linecap="round"/>' +
            '<path d="M104 236q16 20 6 40t12 40" stroke="' + p.rmSeal + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
            '<path d="M112 386q10-6 22 0" stroke="' + L + '" stroke-width="7" fill="none" stroke-linecap="round"/>' +
            '<path d="M112 386q10-6 22 0" stroke="' + p.rmSeal + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
        }

        // ---- Кухонный уголок: фартук из плитки, вытяжка, мойка с краном, тумба ----
        s += '<rect x="122" y="134" width="118" height="150" fill="' + p.rmTile + '"/>';
        var tiles = '';
        for (var ty = 154; ty < 284; ty += 20) tiles += 'M122 ' + ty + 'H240';
        for (var tx = 142; tx < 240; tx += 20) tiles += 'M' + tx + ' 134V284';
        s += '<path d="' + tiles + '" stroke="' + p.rmTileLine + '" stroke-width="2"/>' +
          '<rect x="122" y="134" width="118" height="150" fill="none" stroke="' + L + '" stroke-width="2"/>';
        // Вытяжка: короб до потолка и колпак
        s += '<rect x="166" y="18" width="32" height="76" fill="' + p.rmHood + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M150 92h64l14 32H136z" fill="' + p.rmHood + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<rect x="136" y="124" width="92" height="7" fill="' + L + '"/>';
        if (active['rm-hood']) {
          // Вытяжка включена: под колпаком воздух со стрелками уходит вверх, горит огонёк
          s += '<circle cx="212" cy="108" r="4" fill="' + p.rmAir + '" stroke="' + L + '" stroke-width="2"/>';
          [[150, 196], [182, 190], [214, 196]].forEach(function (a, i) {
            var d = 'M' + a[0] + ' ' + a[1] + 'q' + (i === 1 ? '0' : (i ? '-8' : '8')) + '-24 0-50';
            var head = 'M' + (a[0] - 6) + ' ' + (a[1] - 42) + 'l6-8 6 8';
            s += '<path d="' + d + head + '" stroke="' + L + '" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
              '<path d="' + d + head + '" stroke="' + p.rmAir + '" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
          });
        }
        // Столешница, мойка, тумба
        s += '<rect x="148" y="277" width="66" height="8" rx="2" fill="' + p.rmSink + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="118" y="282" width="126" height="12" rx="2" fill="' + p.rmTop + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="124" y="294" width="114" height="78" fill="' + p.rmCab + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M181 294V372" stroke="' + L + '" stroke-width="2"/>' +
          '<circle cx="172" cy="314" r="4" fill="' + L + '"/><circle cx="190" cy="314" r="4" fill="' + L + '"/>';
        // Кран горячей воды: «гусак», рычаг с красной меткой
        var tapPath = 'M182 278V246q0-8 8-8h8q8 0 8 8v12';
        s += '<path d="' + tapPath + '" stroke="' + L + '" stroke-width="9" fill="none"/>' +
          '<path d="' + tapPath + '" stroke="' + p.tap + '" stroke-width="4" fill="none"/>' +
          '<path d="M182 254h-16" stroke="' + L + '" stroke-width="6" stroke-linecap="round"/>' +
          '<circle cx="164" cy="254" r="5" fill="' + p.rmHot + '" stroke="' + L + '" stroke-width="2"/>';
        if (active['rm-tap']) {
          // Капли и пар: кран закрыт не до конца
          var drop = '<path d="M206 262q-4 6 0 9 4-3 0-9z" fill="' + p.rmWater + '" stroke="' + L + '" stroke-width="1.5"/>';
          s += '<g class="thml-drop">' + drop + '</g><g class="thml-drop" style="animation-delay:-0.6s">' + drop + '</g>' +
            '<path d="M220 252q5-6 0-12t0-12M230 258q5-6 0-12t0-12" stroke="' + L + '" stroke-width="5" fill="none" stroke-linecap="round"/>' +
            '<path d="M220 252q5-6 0-12t0-12M230 258q5-6 0-12t0-12" stroke="' + p.rmSteam + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
        }

        // ---- Пластиковое окно с батареей под ним ----
        s += '<path d="M238 52H392" stroke="' + L + '" stroke-width="5" stroke-linecap="round"/>' +
          '<rect x="258" y="70" width="114" height="170" rx="3" fill="' + p.rmPlastic + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="266" y="78" width="44" height="154" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="320" y="78" width="44" height="154" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="322" y="150" width="5" height="18" rx="2" fill="' + L + '"/>' +
          '<rect x="248" y="238" width="134" height="12" rx="3" fill="' + p.rmSill + '" stroke="' + L + '" stroke-width="3"/>';
        s += radiator(270, 282, 9);
        if (active['rm-curtain']) {
          // Длинная плотная штора задёрнута до самого пола — батарею за ней не видно
          s += '<path d="M240 54H316V366q-10 6-19 0t-19 0t-19 0t-19 0z" fill="' + p.rmCurtain + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M314 54H390V366q-10 6-19 0t-19 0t-19 0t-19 0z" fill="' + p.rmCurtain + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M258 60V362M277 60V362M296 60V362M333 60V362M352 60V362M371 60V362" stroke="' + p.rmCurtainFold + '" stroke-width="5"/>';
        } else {
          // Лёгкий тюль по краям окна — батарея открыта
          s += '<path d="M240 54h22q-4 92 2 190h-26q6-98 2-190z" fill="' + p.rmTulle + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>' +
            '<path d="M368 54h22q-4 92 2 190h-26q6-98 2-190z" fill="' + p.rmTulle + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>';
        }

        // ---- Балконная дверь ----
        var bdW = active['rm-balcony'] ? 60 : 66;   // неплотно закрыта — между створкой и рамой видна щель
        s += '<rect x="392" y="88" width="82" height="284" fill="' + p.rmPlastic + '" stroke="' + L + '" stroke-width="3"/>';
        if (active['rm-balcony']) s += '<rect x="459" y="96" width="9" height="274" fill="' + L + '"/>';
        s += '<rect x="400" y="96" width="' + bdW + '" height="274" rx="2" fill="' + p.rmPlastic + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="408" y="104" width="' + (bdW - 16) + '" height="134" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="410" y="252" width="' + (bdW - 20) + '" height="104" rx="3" fill="' + p.rmSill + '" stroke="' + L + '" stroke-width="2"/>';
        // Ручка: вниз — закрыто, вбок — не закрыто
        s += active['rm-balcony'] ?
          '<path d="M' + (400 + bdW - 6) + ' 244h-16" stroke="' + L + '" stroke-width="6" stroke-linecap="round"/>' :
          '<path d="M460 238v18" stroke="' + L + '" stroke-width="6" stroke-linecap="round"/>';
        if (active['rm-balcony']) {
          // Снег намело у порога, снежинки летят в комнату
          s += '<path d="M396 372q6-14 20-10t18-8t18 6t16 6t10 6q14 6 6 12q-30 8-90 0q-8-6 2-12z" fill="' + p.rmSnow + '" stroke="' + L + '" stroke-width="2.5" stroke-linejoin="round"/>' +
            flake(482, 300) + flake(490, 334) + flake(438, 326);
        }

        // ---- Старое деревянное окно: форточка и одинарное стекло ----
        s += '<rect x="492" y="70" width="122" height="170" fill="' + p.rmWood + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="498" y="76" width="54" height="158" fill="' + p.rmWood + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="556" y="76" width="52" height="158" fill="' + p.rmWood + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="504" y="132" width="42" height="96" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="562" y="82" width="40" height="146" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="502" y="80" width="46" height="48" fill="' + p.rmWood + '" stroke="' + L + '" stroke-width="2"/>';
        if (active['rm-fortochka']) {
          // Форточка распахнута: в проёме — улица и снег, створка повёрнута в комнату
          s += '<rect x="506" y="84" width="38" height="40" fill="' + p.rmOut + '" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M502 80L480 72V136L502 128z" fill="' + p.rmWood + '" stroke="' + L + '" stroke-width="2.5" stroke-linejoin="round"/>' +
            '<path d="M498 86L484 81V127L498 122z" fill="' + p.glass + '" stroke="' + L + '" stroke-width="1.5" stroke-linejoin="round"/>' +
            flake(518, 98) + flake(534, 112) + flake(516, 150) + flake(532, 176) + flake(520, 204);
        } else {
          s += '<rect x="506" y="84" width="38" height="40" fill="' + p.glass + '" stroke="' + L + '" stroke-width="2"/>';
        }
        if (active['rm-frost']) {
          // Иней нарастает от краёв стекла, посередине остаётся маленький прозрачный «глазок»
          var frost = fern(565, 226, 16, -42) + fern(599, 226, -14, -44) + fern(582, 228, 0, -30) +
            fern(565, 85, 14, 24) + fern(599, 85, -14, 24) + fern(565, 152, 14, -4) + fern(599, 152, -14, -4);
          s += '<rect x="562" y="82" width="40" height="146" fill="' + p.rmFrost + '"/>' +
            '<path d="M574 116q8-12 16-2t-2 24q-8 6-12-2t-2-20z" fill="' + p.glass + '"/>' +
            '<path d="' + frost + '" stroke="' + p.rmFrostLine + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
            '<rect x="562" y="82" width="40" height="146" fill="none" stroke="' + L + '" stroke-width="2"/>';
        }
        s += '<rect x="484" y="238" width="138" height="12" rx="3" fill="' + p.rmSill + '" stroke="' + L + '" stroke-width="3"/>';
        // Свободная батарея с терморегулятором
        s += radiator(508, 282, 9) +
          '<rect x="598" y="296" width="12" height="20" rx="4" fill="' + p.rmTherm + '" stroke="' + L + '" stroke-width="2"/>';

        // Коврик и кот, который спит на нём
        s += '<ellipse cx="562" cy="406" rx="74" ry="14" fill="' + p.rmRug + '" stroke="' + L + '" stroke-width="2"/>' +
          '<ellipse cx="566" cy="396" rx="30" ry="14" fill="' + p.rmCat + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M594 400q16 4 6 14q-8 4-30 2" fill="none" stroke="' + L + '" stroke-width="7" stroke-linecap="round"/>' +
          '<path d="M594 400q16 4 6 14q-8 4-30 2" fill="none" stroke="' + p.rmCat + '" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M533 384l2-12 8 7M545 381l7-8 3 10" fill="' + p.rmCat + '" stroke="' + L + '" stroke-width="2.5" stroke-linejoin="round"/>' +
          '<circle cx="544" cy="393" r="12" fill="' + p.rmCat + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M537 392q3 3 6 0M547 392q3 3 6 0" stroke="' + L + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
          '<path d="M566 383v8M576 384v8M586 388v7" stroke="' + p.rmCatDark + '" stroke-width="4" stroke-linecap="round"/>';

        // ---- Кабель интернета через наружную стену и телевизор ----
        if (active['rm-cable']) {
          // Дыру пробили больше, чем кабель, и не заделали: тёмная рваная дыра и трещины
          s += '<path d="M632 104l7-8 8 3 7-5 4 9 7 5-5 8 2 9-9 2-6 7-8-5-7 1-2-9-5-7z" fill="' + L + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>' +
            '<path d="M630 100l-9-7M665 120l9 5M651 128l3 10M640 96l-3-9" stroke="' + L + '" stroke-width="2" stroke-linecap="round"/>';
        } else {
          s += '<circle cx="646" cy="112" r="8" fill="' + p.rmSill + '" stroke="' + L + '" stroke-width="2"/>';
        }
        s += '<path d="M646 112V160q0 10 10 10H684" stroke="' + L + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
        s += '<rect x="682" y="148" width="90" height="56" rx="4" fill="' + p.rmTv + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="688" y="154" width="78" height="44" rx="2" fill="' + p.rmScreen + '"/>' +
          '<path d="M696 192l16-18 12 12 10-8 24 14z" fill="' + p.rmTv + '" opacity=".35"/>';

        // ---- Диван (если утечка спрятана — за ним стоит батарея, видны её верхушки) ----
        if (active['rm-sofa']) s += radiator(650, 280, 10);
        s += '<rect x="636" y="296" width="128" height="42" rx="10" fill="' + p.rmSofa + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="658" y="304" width="40" height="26" rx="8" fill="' + p.rmCushion + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="702" y="304" width="40" height="26" rx="8" fill="' + p.rmCushion + '" stroke="' + L + '" stroke-width="2"/>' +
          '<rect x="636" y="328" width="128" height="30" rx="6" fill="' + p.rmSofaDark + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="624" y="308" width="26" height="54" rx="9" fill="' + p.rmSofa + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="750" y="308" width="26" height="54" rx="9" fill="' + p.rmSofa + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="632" y="360" width="10" height="12" fill="' + L + '"/><rect x="758" y="360" width="10" height="12" fill="' + L + '"/>';
        return s;
      },

      // Горячие и холодные пятна с волнами — только для спрятанных утечек
      overlays: function (active) {
        var T = EB.minigames.thermal;
        var H = T.HOT, C = T.COLD;
        var K = '#0e0a2a';   // тёмный контур на тепловом слое
        // Сквозняк вправо, в комнату: рисуем обычные волны 'drift' зеркально (точки — левый край волны)
        function draftRight(points) {
          return '<g transform="matrix(-1 0 0 1 800 0)">' +
            T._waves(points.map(function (pt) { return [800 - pt[0], pt[1]]; }), 'drift') + '</g>';
        }
        var s = '';
        if (active['rm-door']) {
          s += '<ellipse cx="70" cy="384" rx="66" ry="16" fill="' + C.spot + '" opacity=".75"/>' +
            '<rect x="30" y="360" width="74" height="12" fill="' + C.spot + '"/>' +
            '<rect x="100" y="230" width="8" height="140" fill="' + C.spot + '"/>' +
            draftRight([[40, 392], [72, 380]]);
        }
        if (active['rm-hood']) {
          s += '<rect x="166" y="18" width="32" height="76" fill="' + H.edge + '" stroke="' + K + '" stroke-width="3"/>' +
            T._glow(182, 128, 48, 18) +
            T._waves([[160, 186], [204, 186]], 'rise') + T._waves([[182, 78]], 'rise');
        }
        if (active['rm-tap']) {
          s += T._glow(204, 266, 26, 22) +
            '<path d="M182 278V246q0-8 8-8h8q8 0 8 8v12" stroke="' + H.hot + '" stroke-width="4" fill="none"/>' +
            '<g class="thml-drop"><path d="M206 262q-4 6 0 9 4-3 0-9z" fill="' + H.hot + '" stroke="' + K + '" stroke-width="2"/></g>' +
            '<g class="thml-drop" style="animation-delay:-0.6s"><path d="M206 262q-4 6 0 9 4-3 0-9z" fill="' + H.hot + '" stroke="' + K + '" stroke-width="2"/></g>' +
            T._waves([[226, 262]], 'rise');
        }
        if (active['rm-curtain']) {
          // Тепло застряло между шторой и холодным стеклом
          s += T._glow(315, 314, 72, 40) + T._glow(315, 236, 46, 18) +
            T._waves([[292, 266], [338, 266]], 'rise');
        }
        if (active['rm-balcony']) {
          s += '<rect x="459" y="96" width="9" height="274" fill="' + C.spot + '"/>' +
            '<ellipse cx="440" cy="380" rx="60" ry="14" fill="' + C.spot + '" opacity=".75"/>' +
            draftRight([[420, 386], [446, 372]]);
        }
        if (active['rm-fortochka']) {
          s += '<rect x="506" y="84" width="38" height="40" fill="' + C.spot + '"/>' +
            T._waves([[516, 134], [536, 134]], 'fall');
        }
        if (active['rm-frost']) {
          s += '<rect x="562" y="82" width="40" height="146" fill="' + C.spot + '" opacity=".85"/>' +
            T._waves([[572, 196], [592, 196]], 'fall');
        }
        if (active['rm-cable']) {
          s += '<ellipse cx="646" cy="112" rx="20" ry="18" fill="' + C.spot + '" opacity=".9"/>' +
            T._waves([[634, 130], [658, 130]], 'fall');
        }
        if (active['rm-mold']) {
          s += '<ellipse cx="756" cy="54" rx="32" ry="40" fill="' + C.spot + '" opacity=".8"/>' +
            T._waves([[742, 98], [766, 98]], 'fall');
        }
        if (active['rm-sofa']) {
          // Тепло застряло между диваном и стеной и греет улицу через стену
          s += T._glow(700, 290, 64, 18) +
            T._waves([[680, 276], [722, 276]], 'rise');
        }
        return s;
      }
    },

    // Фасад жилого дома зимним вечером, снаружи (так тепловизором обычно и проверяют здания).
    // Снаружи всё наоборот, чем в подвале: стена холодная, а утечка — ТЁПЛОЕ пятно, над ним тёплые волны вверх.
    facade: {
      lensStart: [420, 230],
      leaks: [
        { id: 'fc-roof',     x: 255, y: 86,  r: 45 },   // тёплый чердак: снег на крыше тает пятнами, сосульки
        { id: 'fc-window',   x: 150, y: 165, r: 36 },   // окно открыто нараспашку
        { id: 'fc-glass',    x: 360, y: 165, r: 32 },   // разбитое стекло в подъезде
        { id: 'fc-crack',    x: 522, y: 165, r: 32 },   // трещина в стене
        { id: 'fc-balcony',  x: 250, y: 238, r: 40 },   // балконная дверь приоткрыта
        { id: 'fc-oldframe', x: 580, y: 243, r: 36 },   // старое деревянное окно со щелями
        { id: 'fc-door',     x: 362, y: 330, r: 40 },   // дверь подъезда подпёрта кирпичом
        { id: 'fc-patch',    x: 522, y: 321, r: 34 },   // отвалился кусок утеплителя
        { id: 'fc-hatch',    x: 150, y: 378, r: 30 },   // открытый продух подвала
        { id: 'fc-heatmain', x: 240, y: 425, r: 45 }    // проталина над трубой теплотрассы
      ],
      fine: [
        { id: 'fc-person', rects: [[408, 312, 42, 86]], mx: 429, my: 300 },    // человек у подъезда
        { id: 'fc-vent',   rects: [[450, 12, 72, 56]],  mx: 486, my: 40 },     // вентиляционные шахты на крыше
        { id: 'fc-car',    rects: [[636, 344, 144, 62]], mx: 712, my: 362 }    // машина с тёплым мотором
      ],

      // Рисунок фасада. p — палитра, active — {id: true} для спрятанных утечек
      draw: function (p, thermal, active) {
        var L = p.line;
        var R = Math.round;
        var s = '';
        // Обычное окно: рама, стекло (свет горит или нет), переплёт, отлив под окном
        function win(cx, cy, lit) {
          return '<rect x="' + (cx - 28) + '" y="' + (cy - 24) + '" width="56" height="48" rx="3" fill="' + p.fcFrame + '" stroke="' + L + '" stroke-width="3"/>' +
            '<rect x="' + (cx - 22) + '" y="' + (cy - 18) + '" width="44" height="36" fill="' + (lit ? p.fcGlass : p.fcGlassDark) + '" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M' + cx + ' ' + (cy - 18) + 'v36M' + (cx - 22) + ' ' + (cy - 6) + 'h22" stroke="' + L + '" stroke-width="3"/>' +
            '<rect x="' + (cx - 32) + '" y="' + (cy + 24) + '" width="64" height="6" fill="' + p.fcSill + '" stroke="' + L + '" stroke-width="2"/>';
        }
        // Ёлка в снегу: ствол и три яруса со снежными шапками
        function fir(cx, by, h) {
          var t = '<rect x="' + (cx - 7) + '" y="' + (by - 18) + '" width="14" height="20" fill="' + p.fcTrunk + '" stroke="' + L + '" stroke-width="3"/>';
          for (var k = 0; k < 3; k++) {
            var top = R(by - h + k * h * 0.27), bot = R(top + h * 0.45), hw = R(h * (0.22 + k * 0.1));
            t += '<path d="M' + cx + ' ' + top + 'L' + (cx + hw) + ' ' + bot + 'H' + (cx - hw) + 'Z" fill="' + p.fcTree + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
              '<path d="M' + cx + ' ' + top + 'L' + R(cx + hw * 0.4) + ' ' + R(top + h * 0.18) + 'L' + cx + ' ' + R(top + h * 0.13) + 'L' + R(cx - hw * 0.4) + ' ' + R(top + h * 0.18) + 'Z" fill="' + p.fcSnow + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>';
          }
          return t;
        }

        // Вечернее небо, месяц и звёзды
        s += '<rect width="800" height="450" fill="' + p.fcSky + '"/>';
        s += '<circle cx="718" cy="62" r="24" fill="' + p.fcMoon + '"/><circle cx="731" cy="53" r="21" fill="' + p.fcSky + '"/>';
        [[40, 40], [112, 22], [610, 26], [668, 120], [776, 150], [26, 160], [690, 30]].forEach(function (st) {
          s += '<circle cx="' + st[0] + '" cy="' + st[1] + '" r="2.5" fill="' + p.fcStar + '"/>';
        });
        // Ёлка справа (за машиной)
        s += fir(772, 396, 190);
        // Снег на земле и протоптанная дорожка к подъезду
        s += '<rect x="-4" y="392" width="808" height="62" fill="' + p.fcSnow + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M326 396L304 454H420L398 396Z" fill="' + p.fcSnowShade + '"/>';

        // Крыша, вся в снегу, и вентиляционные шахты на ней
        s += '<path d="M72 120L162 46H568L658 120Z" fill="' + p.fcSnow + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>';
        s += '<rect x="456" y="22" width="22" height="40" fill="' + p.fcVent + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="492" y="28" width="22" height="34" fill="' + p.fcVent + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="451" y="15" width="32" height="9" rx="2" fill="' + p.fcVentTop + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="487" y="21" width="32" height="9" rx="2" fill="' + p.fcVentTop + '" stroke="' + L + '" stroke-width="3"/>';
        // Утечка: тёплый чердак — снег подтаял пятнами (видна кровля), с карниза свисают сосульки
        if (active['fc-roof']) {
          // проталины неровной формы: [центр x, центр y, полуширина, полувысота]
          [[218, 96, 28, 12], [262, 72, 24, 11], [300, 100, 24, 11]].forEach(function (e) {
            var x = e[0], y = e[1], w = e[2], h = e[3];
            s += '<path d="M' + (x - w) + ' ' + y + 'Q' + (x - w + 4) + ' ' + (y - h) + ' ' + (x - 8) + ' ' + (y - h + 2) + 'Q' + x + ' ' + (y - h - 4) + ' ' + (x + 10) + ' ' + (y - h + 1) +
              'Q' + (x + w + 2) + ' ' + (y - h + 2) + ' ' + (x + w) + ' ' + (y + 2) + 'Q' + (x + w - 4) + ' ' + (y + h + 1) + ' ' + (x + 4) + ' ' + (y + h) +
              'Q' + (x - 6) + ' ' + (y + h + 4) + ' ' + (x - 14) + ' ' + (y + h - 1) + 'Q' + (x - w - 2) + ' ' + (y + h - 2) + ' ' + (x - w) + ' ' + y + 'Z" fill="' + p.fcRoof + '" stroke="' + L + '" stroke-width="2.5" stroke-linejoin="round"/>' +
              '<path d="M' + (x - w + 8) + ' ' + (y - 3) + 'H' + (x + w - 8) + 'M' + (x - w + 6) + ' ' + (y + 4) + 'H' + (x + w - 6) + '" stroke="' + p.fcRoofLine + '" stroke-width="2"/>';
          });
        }
        // Карниз
        s += '<rect x="68" y="118" width="594" height="10" fill="' + p.fcRoofEdge + '" stroke="' + L + '" stroke-width="3"/>';

        // Стена дома (швы между этажами) и цоколь
        s += '<rect x="90" y="127" width="550" height="237" fill="' + p.fcWall + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M92 206H638M92 284H638" stroke="' + p.fcWallLine + '" stroke-width="2"/>' +
          '<rect x="86" y="362" width="558" height="34" fill="' + p.fcPlinth + '" stroke="' + L + '" stroke-width="3"/>';
        // Сосульки под карнизом — тоже признак тёплого чердака (снег тает и замерзает на краю)
        if (active['fc-roof']) {
          var ice = '';
          for (var ix = 190, k = 0; ix <= 310; ix += 12, k++) {
            ice += 'M' + ix + ' 128h8l-4 ' + (8 + (k % 3) * 3) + 'z';
          }
          s += '<path d="' + ice + '" fill="' + p.fcIce + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>';
        }

        // Обычные окна (свет в одних горит, в других нет)
        [[255, 165, true], [465, 165, false], [580, 165, true],
          [150, 243, false], [465, 243, true],
          [150, 321, true], [255, 321, false], [465, 321, true], [580, 321, false]].forEach(function (w) {
          s += win(w[0], w[1], w[2]);
        });

        // Окно 3-го этажа слева: обычное или открытое нараспашку (створка наружу, штора, свет комнаты)
        if (active['fc-window']) {
          s += '<rect x="122" y="141" width="56" height="48" rx="3" fill="' + p.fcFrame + '" stroke="' + L + '" stroke-width="3"/>' +
            '<rect x="128" y="147" width="44" height="36" fill="' + p.fcRoom + '" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M152 147C162 158 148 170 158 183H172V147Z" fill="' + p.fcCurtain + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>' +
            '<path d="M128 147L106 139V193L128 183Z" fill="' + p.fcGlassDark + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M122 151L111 147V186L122 181" fill="none" stroke="' + p.fcFrame + '" stroke-width="3"/>' +
            '<rect x="118" y="189" width="64" height="6" fill="' + p.fcSill + '" stroke="' + L + '" stroke-width="2"/>';
        } else {
          s += win(150, 165, false);
        }

        // Окно 2-го этажа справа: современное или старое деревянное (коричневая облезлая рама, перекошенная створка)
        if (active['fc-oldframe']) {
          s += '<rect x="551" y="218" width="58" height="50" rx="2" fill="' + p.fcOldWood + '" stroke="' + L + '" stroke-width="3"/>' +
            '<rect x="558" y="236" width="19" height="26" fill="' + p.fcGlassDark + '" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M584 237L603 234V262L584 263Z" fill="' + p.fcGlassDark + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>' +
            '<rect x="558" y="224" width="44" height="8" fill="' + p.fcGlassDark + '" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M603 235L606 233M584 263l-3 3" stroke="' + L + '" stroke-width="2"/>' +
            '<ellipse cx="555" cy="250" rx="3" ry="5" fill="' + p.fcOldPaint + '"/>' +
            '<ellipse cx="594" cy="221" rx="5" ry="2.5" fill="' + p.fcOldPaint + '"/>' +
            '<ellipse cx="606" cy="258" rx="2.5" ry="4" fill="' + p.fcOldPaint + '"/>' +
            '<path d="M547 268L613 270V275L547 273Z" fill="' + p.fcOldWood + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>';
        } else {
          s += win(580, 243, false);
        }

        // Окна лестницы (подъезда): верхнее может быть разбито
        [[360, 165], [360, 243]].forEach(function (w) {
          s += '<rect x="' + (w[0] - 20) + '" y="' + (w[1] - 28) + '" width="40" height="56" rx="3" fill="' + p.fcFrame + '" stroke="' + L + '" stroke-width="3"/>' +
            '<rect x="' + (w[0] - 15) + '" y="' + (w[1] - 23) + '" width="30" height="46" fill="' + p.fcGlassDark + '" stroke="' + L + '" stroke-width="2"/>' +
            '<rect x="' + (w[0] - 24) + '" y="' + (w[1] + 28) + '" width="48" height="6" fill="' + p.fcSill + '" stroke="' + L + '" stroke-width="2"/>';
        });
        if (active['fc-glass']) {
          s += '<path d="M354 154l6-5 3 7 7-2-3 8 5 5-8 3-1 8-6-5-6 3 1-8-5-4 6-3z" fill="' + p.fcHole + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>' +
            '<path d="M360 149L356 142M370 154L375 145M370 168L375 173M362 175L358 188M351 168L345 172M349 157L345 150" stroke="' + p.fcCrackGlass + '" stroke-width="2" stroke-linecap="round"/>';
        }

        // Трещина в стене между окнами 3-го этажа
        if (active['fc-crack']) {
          var crack = 'M526 132l-7 11 9 9-8 12 8 10-7 12 6 10';
          s += '<path d="' + crack + '" stroke="' + p.fcCrack + '" stroke-width="9" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
            '<path d="' + crack + '" stroke="' + L + '" stroke-width="3.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
            '<path d="M519 143l-8 3M528 164l8 4M521 186l-7 3" stroke="' + L + '" stroke-width="2" stroke-linecap="round"/>';
        }

        // Балкон 2-го этажа: дверь, окно рядом, ограждение. Дверь может быть приоткрыта
        s += '<rect x="224" y="202" width="34" height="68" rx="2" fill="' + p.fcFrame + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="262" y="214" width="32" height="44" rx="2" fill="' + p.fcFrame + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="267" y="219" width="22" height="34" fill="' + p.fcGlass + '" stroke="' + L + '" stroke-width="2"/>';
        if (active['fc-balcony']) {
          s += '<rect x="229" y="207" width="24" height="40" fill="' + p.fcRoom + '" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M229 207L242 200V250L229 247Z" fill="' + p.fcFrame + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M232 211L239 207V232L232 234Z" fill="' + p.fcGlassDark + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>';
        } else {
          s += '<rect x="229" y="207" width="24" height="32" fill="' + p.fcGlassDark + '" stroke="' + L + '" stroke-width="2"/>';
        }
        s += '<rect x="210" y="240" width="90" height="32" rx="2" fill="' + p.fcRail + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M232 244v24M255 244v24M278 244v24" stroke="' + p.fcBalcony + '" stroke-width="3"/>' +
          '<rect x="204" y="270" width="102" height="8" fill="' + p.fcBalcony + '" stroke="' + L + '" stroke-width="3"/>';

        // Отвалился кусок утеплителя: видны пенопласт и кирпич, куски лежат на снегу
        if (active['fc-patch']) {
          s += '<path d="M500 300L516 295L534 301L548 297L546 318L550 334L538 347L520 342L504 348L497 330Z" fill="' + p.fcFoam + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M506 306L518 303L532 308L541 305L539 320L542 332L534 339L520 336L508 340L505 328Z" fill="' + p.fcBrick + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>' +
            '<path d="M507 314H539M506 324H540M508 333H536M521 304v10M530 314v10M514 324v9M528 324v10" stroke="' + L + '" stroke-width="1.5"/>' +
            '<path d="M506 400l9-3 4 6-8 4zM530 404l8-2 2 5-9 2zM548 398l6 1-1 6-6-2z" fill="' + p.fcFoam + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>';
        }

        // Подъезд: козырёк со снегом, дверь, ступени. Дверь может быть подпёрта кирпичом
        s += '<rect x="332" y="296" width="56" height="68" fill="' + p.fcFrame + '" stroke="' + L + '" stroke-width="3"/>';
        if (active['fc-door']) {
          s += '<rect x="336" y="300" width="48" height="64" fill="' + p.fcRoom + '" stroke="' + L + '" stroke-width="2"/>' +
            '<path d="M337 364V354H349V344H361V334H373V324H384" fill="none" stroke="' + p.fcDoor + '" stroke-width="3"/>' +
            '<path d="M388 298L410 290V372L388 364Z" fill="' + p.fcDoor + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M393 306L405 302V318L393 321Z" fill="' + p.fcGlassDark + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>' +
            '<rect x="396" y="358" width="18" height="11" rx="1" fill="' + p.fcBrickProp + '" stroke="' + L + '" stroke-width="2"/>';
        } else {
          // закрытая дверь с доводчиком наверху
          s += '<rect x="336" y="300" width="48" height="64" fill="' + p.fcDoor + '" stroke="' + L + '" stroke-width="3"/>' +
            '<rect x="348" y="310" width="24" height="20" fill="' + p.fcGlassDark + '" stroke="' + L + '" stroke-width="2"/>' +
            '<circle cx="377" cy="338" r="4" fill="' + L + '"/>' +
            '<rect x="340" y="302" width="16" height="6" rx="1" fill="' + L + '"/><path d="M356 305l10-4 6 3" stroke="' + L + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
        }
        s += '<rect x="322" y="286" width="76" height="10" fill="' + p.fcCanopy + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="324" y="279" width="72" height="9" rx="4" fill="' + p.fcSnow + '" stroke="' + L + '" stroke-width="2.5"/>' +
          '<rect x="326" y="364" width="68" height="16" fill="' + p.fcStep + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="318" y="380" width="84" height="16" fill="' + p.fcStep + '" stroke="' + L + '" stroke-width="3"/>';

        // Продух (окошко) подвала в цоколе: закрыт решёткой или открыт, из него идёт пар
        if (active['fc-hatch']) {
          s += '<rect x="136" y="368" width="28" height="20" rx="2" fill="' + p.fcHole + '" stroke="' + L + '" stroke-width="3"/>' +
            '<path d="M136 368L120 362V392L136 388Z" fill="' + p.fcHatch + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<circle cx="153" cy="358" r="6" fill="' + p.fcSteam + '" opacity=".85"/><circle cx="146" cy="350" r="4.5" fill="' + p.fcSteam + '" opacity=".7"/>';
        } else {
          s += '<rect x="136" y="368" width="28" height="20" rx="2" fill="' + p.fcHatch + '" stroke="' + L + '" stroke-width="3"/>' +
            '<path d="M143 370v16M150 370v16M157 370v16" stroke="' + L + '" stroke-width="2"/>';
        }

        // Проталина над теплотрассой: снег растаял, видна земля и трава
        if (active['fc-heatmain']) {
          s += '<path d="M176 424Q186 410 214 413Q244 407 274 413Q302 414 306 425Q296 438 266 436Q236 441 206 437Q178 436 176 424Z" fill="' + p.fcGround + '" stroke="' + L + '" stroke-width="2.5"/>' +
            '<path d="M196 431l3-7 3 7M236 429l3-8 3 8M272 431l3-7 3 7M216 421l2-6 2 6M256 420l2-6 2 6" stroke="' + p.fcGrass + '" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
        }

        // Человек у подъезда (тёплый — так и должно быть)
        s += '<rect x="418" y="374" width="8" height="22" fill="' + p.fcCoat + '" stroke="' + L + '" stroke-width="2.5"/>' +
          '<rect x="431" y="374" width="8" height="22" fill="' + p.fcCoat + '" stroke="' + L + '" stroke-width="2.5"/>' +
          '<rect x="412" y="338" width="34" height="42" rx="9" fill="' + p.fcCoat + '" stroke="' + L + '" stroke-width="3"/>' +
          '<rect x="416" y="337" width="26" height="7" rx="3" fill="' + p.fcScarf + '" stroke="' + L + '" stroke-width="2"/>' +
          '<circle cx="429" cy="326" r="11" fill="' + p.fcSkin + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M417 324Q429 304 441 324Z" fill="' + p.fcHat + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<circle cx="429" cy="310" r="4.5" fill="' + p.fcHat + '" stroke="' + L + '" stroke-width="2.5"/>';

        // Машина, только что приехала (тёплый мотор спереди)
        s += '<path d="M668 372L686 350H740L760 372Z" fill="' + p.fcCar + '" stroke="' + L + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M677 370L690 355H710V370ZM716 370V355H738L752 370Z" fill="' + p.fcCarGlass + '" stroke="' + L + '" stroke-width="2" stroke-linejoin="round"/>' +
          '<rect x="640" y="370" width="136" height="24" rx="9" fill="' + p.fcCar + '" stroke="' + L + '" stroke-width="3"/>' +
          '<path d="M643 372H676V392H646Q640 392 640 386V378Q640 372 643 372Z" fill="' + p.fcCarHood + '" stroke="' + L + '" stroke-width="2.5" stroke-linejoin="round"/>' +
          '<circle cx="668" cy="394" r="11" fill="' + p.fcTire + '" stroke="' + L + '" stroke-width="3"/>' +
          '<circle cx="748" cy="394" r="11" fill="' + p.fcTire + '" stroke="' + L + '" stroke-width="3"/>';

        // Ёлка слева (перед углом дома)
        s += fir(44, 398, 150);
        return s;
      },

      // Тёплые пятна с волнами — только для спрятанных утечек (снаружи тепло уходит вверх)
      overlays: function (active) {
        var T = EB.minigames.thermal;
        var H = T.HOT, D = '#0e0a2a';
        var s = '';
        if (active['fc-roof']) {
          s += T._glow(218, 96, 38, 18) + T._glow(262, 72, 32, 16) + T._glow(298, 100, 32, 16) +
            '<path d="M204 96H232M250 72H274M286 100H310" stroke="' + H.core + '" stroke-width="5" stroke-linecap="round"/>' +
            T._waves([[218, 82], [262, 58], [300, 86]], 'rise');
        }
        if (active['fc-window']) {
          s += T._glow(146, 165, 44, 36) +
            '<rect x="128" y="147" width="44" height="36" fill="' + H.hot + '" stroke="' + D + '" stroke-width="2"/>' +
            '<rect x="136" y="155" width="28" height="20" rx="6" fill="' + H.core + '"/>' +
            T._waves([[138, 138], [162, 138]], 'rise');
        }
        if (active['fc-glass']) {
          s += T._glow(361, 163, 24, 26) +
            '<path d="M354 154l6-5 3 7 7-2-3 8 5 5-8 3-1 8-6-5-6 3 1-8-5-4 6-3z" fill="' + H.core + '" stroke="' + D + '" stroke-width="2" stroke-linejoin="round"/>' +
            T._waves([[352, 140], [370, 140]], 'rise');
        }
        if (active['fc-crack']) {
          var crack = 'M526 132l-7 11 9 9-8 12 8 10-7 12 6 10';
          s += T._glow(523, 166, 20, 40) +
            '<path d="' + crack + '" stroke="' + H.hot + '" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
            '<path d="' + crack + '" stroke="' + H.core + '" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
            T._waves([[540, 150], [508, 140]], 'rise');
        }
        if (active['fc-balcony']) {
          s += T._glow(243, 226, 26, 32) +
            '<rect x="242" y="207" width="11" height="34" fill="' + H.core + '" stroke="' + D + '" stroke-width="2"/>' +
            T._waves([[236, 204], [254, 204]], 'rise');
        }
        if (active['fc-oldframe']) {
          s += T._glow(580, 243, 42, 34) +
            '<rect x="551" y="218" width="58" height="50" rx="2" fill="none" stroke="' + H.hot + '" stroke-width="7"/>' +
            '<rect x="551" y="218" width="58" height="50" rx="2" fill="none" stroke="' + H.core + '" stroke-width="2.5"/>' +
            '<path d="M584 237V263" stroke="' + H.core + '" stroke-width="3"/>' +
            T._waves([[566, 214], [594, 214]], 'rise');
        }
        if (active['fc-door']) {
          s += T._glow(360, 332, 34, 38) +
            '<rect x="336" y="300" width="48" height="64" fill="' + H.hot + '" stroke="' + D + '" stroke-width="2"/>' +
            '<rect x="344" y="310" width="32" height="44" rx="8" fill="' + H.core + '"/>' +
            T._waves([[348, 298], [372, 298]], 'rise');
        }
        if (active['fc-patch']) {
          s += T._glow(522, 321, 34, 34) +
            '<path d="M506 306L518 303L532 308L541 305L539 320L542 332L534 339L520 336L508 340L505 328Z" fill="' + H.hot + '" stroke="' + D + '" stroke-width="2" stroke-linejoin="round"/>' +
            '<ellipse cx="523" cy="321" rx="10" ry="9" fill="' + H.core + '"/>' +
            T._waves([[512, 296], [534, 296]], 'rise');
        }
        if (active['fc-hatch']) {
          s += T._glow(150, 376, 28, 20) +
            '<rect x="136" y="368" width="28" height="20" rx="2" fill="' + H.core + '" stroke="' + D + '" stroke-width="3"/>' +
            T._waves([[144, 364], [158, 364]], 'rise');
        }
        if (active['fc-heatmain']) {
          s += T._glow(241, 425, 74, 18) +
            '<path d="M196 425H286" stroke="' + H.core + '" stroke-width="6" stroke-linecap="round"/>' +
            T._waves([[206, 414], [241, 412], [276, 414]], 'rise');
        }
        return s;
      }
    },
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

  // Название помещения на текущем языке: «Подвал», «Жилая комната», «Фасад дома»
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
