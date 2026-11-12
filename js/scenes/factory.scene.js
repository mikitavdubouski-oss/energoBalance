/*
  factory.scene.js — SVG-сцена уровня «Завод»: производственный цех днём.

  Что в файле: одна строка EB.scenes.factory с векторной картинкой (SVG) уровня «Завод».
  Размер холста 1600×900 (viewBox), сцена сама подстраивается под экран.
  Высокий потолок с фермами и световыми фонарями, ворота цеха слева, печь-сушилка с трубой,
  трубы вдоль стены, окно пульта мастера, станок, конвейер, компрессор, вытяжной вентилятор.
  В фоне — двое рабочих в касках: мастер за окном пульта и рабочий на скамейке (обеденный перерыв).

  Как устроен каждый интерактивный объект:
    <g id="obj-ИМЯ" class="obj" data-state="problem">
      ...части, видимые всегда...
      <g class="v-problem">…как выглядит проблема…</g>
      <g class="v-ok">…как выглядит после исправления…</g>
      <rect class="obj-hit" …/>   ← прозрачная зона клика, всегда ПОСЛЕДНЯЯ
    </g>
  Движок меняет data-state ("problem" / "ok"), а CSS прячет ненужный вариант.
  Анимации (SMIL) есть только внутри .v-problem (кроме лопастей нового вентилятора в .v-ok).

  Объекты сцены:
    obj-fac-gate          — ворота цеха слева: распахнуты, видно снег, дует холод и летят снежинки /
                            закрыты жёлтые скоростные ворота, над ними воздушная завеса
    obj-fac-furnace       — печь-сушилка с трубой: по трубе вверх уходят горячие газы, градусник «на максимуме» /
                            на трубе теплообменник, рядом бак с водой (синяя труба — холодная, оранжевая — тёплая)
    obj-fac-skylights     — световые фонари в крыше и лампы: стёкла грязные (пятна, листья), лампы горят и мигают /
                            стёкла чистые, вниз идут солнечные лучи, лампы выключены, на балке датчик освещённости
    obj-fac-pipes         — две трубы вдоль стены: голые горячие трубы, «тепловые пятна» и волны тепла /
                            трубы в толстой серебристой теплоизоляции
    obj-fac-cooling       — станок с водяным охлаждением: вода из трубы льётся в трап канализации, лужа /
                            рядом бак оборотной воды со значком «круговые стрелки», вода идёт по кругу
    obj-fac-conveyor      — конвейер: пустая лента едет (бегут шевроны, крутятся ролики), на стойке значок «пуск» /
                            лента стоит, на стойке значок «пауза», у начала ленты датчик деталей
    obj-fac-pallets       — поддоны и картон: переполненный общий контейнер со сломанными поддонами и коробками /
                            аккуратный штабель поддонов и спрессованный тюк картона со знаком переработки
    obj-fac-scrap         — стружка и обрезки металла: всё вперемешку в общем баке, стружка на полу /
                            отдельный синий бак для металла (значок — гайка) и маленький бак для мусора
    obj-fac-air-hose      — шланг сжатого воздуха: из соединения со свистом бьют облачка воздуха, на шланге изолента /
                            новая быстроразъёмная муфта, утечки нет
    obj-fac-compressor    — компрессор (часы на стене — обед, табличка с чашкой): трясётся, гудит, мигает лампа /
                            стоит тихо, на стене блок таймера со значками «часы» и «пауза»
    obj-fac-fan           — вытяжной вентилятор: старый ржавый мотор трясётся, гудит и греется (волны тепла) /
                            новый компактный мотор, лопасти крутятся ровно
    obj-fac-safety-board  — стенд «Техника безопасности» (только значки: каска, очки, перчатки, наушники) — всегда в порядке
    obj-fac-extinguisher  — огнетушитель на стене — всегда в порядке

  Как менять:
    • координаты — в единицах viewBox (x: 0…1600 слева направо, y: 0…900 сверху вниз);
    • контур — цвет #2b3a4a, толщина 3–4;
    • id градиентов начинаются с "fc-", чтобы не пересечься с другими сценами;
    • зоны клика (obj-hit) не должны перекрываться между объектами;
    • детали, которые выходят за свою зону клика (лучи, волны тепла), помечены pointer-events="none";
    • в строке нельзя использовать обратную кавычку и знак доллара с фигурной скобкой;
    • текстовых элементов SVG в сцене нет — игра двуязычная, все подписи в texts.*.js.
*/
EB.scenes = EB.scenes || {};
EB.scenes.factory = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" class="scene-svg">
  <defs>
    <linearGradient id="fc-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6eedf"/><stop offset="1" stop-color="#e9dcc4"/></linearGradient>
    <linearGradient id="fc-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d5dbe2"/><stop offset="1" stop-color="#b4bec9"/></linearGradient>
    <linearGradient id="fc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8fb"/><stop offset="1" stop-color="#d9f2ff"/></linearGradient>
    <linearGradient id="fc-steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a96a6"/><stop offset="0.45" stop-color="#d0d9e2"/><stop offset="1" stop-color="#8a96a6"/></linearGradient>
    <linearGradient id="fc-fire" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff7a2a"/><stop offset="1" stop-color="#ffd166"/></linearGradient>
    <linearGradient id="fc-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a0" stop-opacity="0.75"/><stop offset="1" stop-color="#fff3a0" stop-opacity="0"/></linearGradient>
    <radialGradient id="fc-glow"><stop offset="0" stop-color="#fff6b0" stop-opacity="0.95"/><stop offset="0.5" stop-color="#ffe066" stop-opacity="0.45"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>
    <radialGradient id="fc-hot"><stop offset="0" stop-color="#ffd27a" stop-opacity="0.95"/><stop offset="0.5" stop-color="#ff9a3c" stop-opacity="0.55"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient>
    <radialGradient id="fc-thermal"><stop offset="0" stop-color="#ff7b2e" stop-opacity="0.55"/><stop offset="0.6" stop-color="#ffb347" stop-opacity="0.3"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient>
  </defs>

  <!-- ===== ФОН (не интерактивный) ===== -->
  <g id="fc-bg" pointer-events="none">
    <!-- потолок: профнастил кровли -->
    <rect x="0" y="0" width="1600" height="160" fill="#cdd8e3"/>
    <path d="M0 30 H1600 M0 60 H1600 M0 90 H1600 M0 120 H1600" stroke="#bccad7" stroke-width="3"/>
    <!-- стена цеха -->
    <rect x="0" y="150" width="1600" height="475" fill="url(#fc-wall)"/>
    <path d="M100 160 V560 M200 160 V560 M640 340 V560 M900 340 V560 M1000 340 V560 M1300 160 V560 M1400 160 V560 M1500 160 V560" stroke="#e6d6bb" stroke-width="3"/>
    <!-- нижняя часть стены покрашена -->
    <rect x="0" y="560" width="1600" height="64" fill="#a9c7e0"/>
    <path d="M0 560 H1600" stroke="#2b3a4a" stroke-width="3"/>
    <!-- стальные фермы под потолком -->
    <path d="M0 140 L40 40 L80 140 L120 40 L160 140 L200 40 L240 140 L280 40 L320 140 L360 40 L400 140 L440 40 L480 140 L520 40 L560 140 L600 40 L640 140 M1260 140 L1300 40 L1340 140 L1380 40 L1420 140 L1460 40 L1500 140 L1540 40 L1580 140 L1600 90" fill="none" stroke="#2b3a4a" stroke-width="9" stroke-linejoin="round"/>
    <path d="M0 140 L40 40 L80 140 L120 40 L160 140 L200 40 L240 140 L280 40 L320 140 L360 40 L400 140 L440 40 L480 140 L520 40 L560 140 L600 40 L640 140 M1260 140 L1300 40 L1340 140 L1380 40 L1420 140 L1460 40 L1500 140 L1540 40 L1580 140 L1600 90" fill="none" stroke="#8795a5" stroke-width="4" stroke-linejoin="round"/>
    <rect x="-4" y="34" width="648" height="12" fill="#7b8a9a" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1256" y="34" width="348" height="12" fill="#7b8a9a" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="-4" y="140" width="1608" height="18" fill="#7b8a9a" stroke="#2b3a4a" stroke-width="4"/>
    <!-- колонны цеха с жёлто-чёрной защитой внизу -->
    <rect x="340" y="156" width="16" height="470" fill="#7b8a9a" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M348 160 V620" stroke="#a7b4c2" stroke-width="3"/>
    <rect x="334" y="580" width="28" height="44" rx="3" fill="#ffcf4a" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M336 598 l24 -12 M336 614 l24 -12" stroke="#2b3a4a" stroke-width="5"/>
    <rect x="1272" y="156" width="20" height="470" fill="#7b8a9a" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1282 160 V620" stroke="#a7b4c2" stroke-width="3"/>
    <rect x="1268" y="580" width="28" height="44" rx="3" fill="#ffcf4a" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1270 598 l24 -12 M1270 614 l24 -12" stroke="#2b3a4a" stroke-width="5"/>
    <!-- концы труб уходят в стену -->
    <rect x="600" y="255" width="44" height="22" fill="#8a96a6" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1256" y="255" width="18" height="22" fill="#8a96a6" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1256" y="300" width="18" height="20" fill="#8a96a6" stroke="#2b3a4a" stroke-width="3"/>
    <!-- пол цеха -->
    <rect x="0" y="622" width="1600" height="278" fill="url(#fc-floor)"/>
    <path d="M0 622 H1600" stroke="#2b3a4a" stroke-width="4"/>
    <path d="M0 720 H1600 M0 812 H1600 M200 624 L160 900 M520 624 L500 900 M840 624 L840 900 M1160 624 L1180 900 M1480 624 L1520 900" stroke="#c3cbd4" stroke-width="2"/>
    <!-- жёлтая разметка прохода -->
    <path d="M0 640 H1600" stroke="#ffcf4a" stroke-width="6"/>
    <!-- окно пульта мастера -->
    <rect x="652" y="364" width="236" height="176" rx="8" fill="#ffffff" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="666" y="378" width="208" height="140" rx="4" fill="#bfe6ff"/>
    <!-- мастер в белой каске смотрит на мониторы -->
    <path d="M708 518 q0 -48 42 -52 q42 4 42 52 Z" fill="#ff8c3a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M714 498 H786" stroke="#fff3a0" stroke-width="6"/>
    <path d="M738 470 l12 16 l12 -16" fill="none" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="750" cy="446" r="21" fill="#f5c9a0" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M728 440 a22 22 0 0 1 44 0 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <rect x="722" y="437" width="56" height="7" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <circle cx="743" cy="452" r="2.5" fill="#2b3a4a"/><circle cx="757" cy="452" r="2.5" fill="#2b3a4a"/>
    <path d="M744 460 q6 5 12 0" fill="none" stroke="#2b3a4a" stroke-width="2.5" stroke-linecap="round"/>
    <!-- пульт: мониторы с графиками -->
    <rect x="666" y="500" width="208" height="18" fill="#8a96a6"/>
    <rect x="806" y="462" width="56" height="40" rx="4" fill="#2b3a4a"/>
    <rect x="811" y="467" width="46" height="30" rx="2" fill="#7ad9b5"/>
    <path d="M814 490 l10 -8 l8 5 l10 -12 l10 6" fill="none" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="672" y="472" width="30" height="30" rx="3" fill="#2b3a4a"/>
    <rect x="676" y="476" width="22" height="22" rx="2" fill="#ffd166"/>
    <path d="M674 384 l30 -0 M842 382 l-60 60" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.6"/>
    <path d="M800 378 V518" stroke="#ffffff" stroke-width="6"/>
    <rect x="644" y="536" width="252" height="12" rx="4" fill="#d5dde6" stroke="#2b3a4a" stroke-width="3"/>
    <!-- рабочий в жёлтой каске обедает на скамейке (обеденный перерыв) -->
    <rect x="272" y="792" width="108" height="12" rx="4" fill="#ffb35c" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="280" y="804" width="9" height="40" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="363" y="804" width="9" height="40" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="278" y="772" width="24" height="20" rx="4" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M278 780 H302" stroke="#2b3a4a" stroke-width="2"/>
    <path d="M308 792 h20 v48 h-20 Z M332 792 h20 v48 h-20 Z" fill="#2f5591" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <rect x="302" y="838" width="28" height="12" rx="4" fill="#4a3a2a" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="328" y="838" width="28" height="12" rx="4" fill="#4a3a2a" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M302 796 q-2 -62 28 -66 q30 4 28 66 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M316 732 V796 M344 732 V796" stroke="#2f5591" stroke-width="4"/>
    <path d="M352 744 q14 12 6 22" fill="none" stroke="#2b3a4a" stroke-width="11" stroke-linecap="round"/>
    <path d="M352 744 q14 12 6 22" fill="none" stroke="#3d6fb6" stroke-width="6" stroke-linecap="round"/>
    <rect x="352" y="756" width="17" height="20" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M356 750 q-4 -6 0 -12 M364 750 q-4 -6 0 -12" fill="none" stroke="#9aa7b5" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="330" cy="708" r="21" fill="#f5c9a0" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M308 702 a22 22 0 0 1 44 0 Z" fill="#ffcf4a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <rect x="302" y="699" width="56" height="7" rx="3" fill="#ffcf4a" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M330 682 V699" stroke="#e0ae2a" stroke-width="3"/>
    <circle cx="323" cy="714" r="2.5" fill="#2b3a4a"/><circle cx="337" cy="714" r="2.5" fill="#2b3a4a"/>
    <path d="M324 721 q6 5 12 0" fill="none" stroke="#2b3a4a" stroke-width="2.5" stroke-linecap="round"/>
  </g>

  <!-- ===== obj-fac-gate: большие ворота цеха ===== -->
  <g id="obj-fac-gate" class="obj" data-state="problem">
    <!-- всегда: стальная рама ворот -->
    <rect x="28" y="236" width="304" height="392" rx="4" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <g class="v-problem">
      <!-- ворота распахнуты: видно улицу, снег и ёлки -->
      <rect x="42" y="250" width="276" height="372" fill="url(#fc-sky)"/>
      <path d="M60 560 L92 460 L124 560 Z M150 560 L190 430 L230 560 Z M240 560 L272 470 L304 560 Z" fill="#4f9e6a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M82 492 L92 460 L102 492 q-10 6 -20 0 Z M177 472 L190 430 L203 472 q-13 7 -26 0 Z M262 502 L272 470 L282 502 q-10 6 -20 0 Z" fill="#ffffff"/>
      <path d="M42 552 q70 -22 140 -4 q70 16 136 -6 V622 H42 Z" fill="#ffffff" stroke="#cfe3f0" stroke-width="3"/>
      <!-- поднятое полотно ворот свёрнуто наверху -->
      <rect x="42" y="250" width="276" height="34" fill="#ffcf4a" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M42 262 H318 M42 273 H318" stroke="#e0ae2a" stroke-width="3"/>
      <!-- холодный ветер дует в цех -->
      <g>
        <path d="M60 340 q30 -14 60 0 t60 0 l-12 -12 M180 340 l-12 12" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M60 340 q30 -14 60 0 t60 0 l-12 -12 M180 340 l-12 12" fill="none" stroke="#3d8bfd" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;80 0" dur="2s" begin="0s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0s" repeatCount="indefinite"/>
      </g>
      <g>
        <path d="M60 420 q30 -14 60 0 t60 0 l-12 -12 M180 420 l-12 12" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M60 420 q30 -14 60 0 t60 0 l-12 -12 M180 420 l-12 12" fill="none" stroke="#3d8bfd" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;80 0" dur="2s" begin="0.7s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.7s" repeatCount="indefinite"/>
      </g>
      <g>
        <path d="M60 500 q30 -14 60 0 t60 0 l-12 -12 M180 500 l-12 12" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M60 500 q30 -14 60 0 t60 0 l-12 -12 M180 500 l-12 12" fill="none" stroke="#3d8bfd" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;80 0" dur="2s" begin="1.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.4s" repeatCount="indefinite"/>
      </g>
      <!-- снежинки летят внутрь -->
      <g transform="translate(110 300)"><g>
        <path d="M0 -9 V9 M-8 -4.5 L8 4.5 M-8 4.5 L8 -4.5" stroke="#7aa7c7" stroke-width="6" stroke-linecap="round"/>
        <path d="M0 -9 V9 M-8 -4.5 L8 4.5 M-8 4.5 L8 -4.5" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;150 240" dur="3.2s" begin="0s" repeatCount="indefinite"/>
      </g></g>
      <g transform="translate(70 380)"><g>
        <path d="M0 -9 V9 M-8 -4.5 L8 4.5 M-8 4.5 L8 -4.5" stroke="#7aa7c7" stroke-width="6" stroke-linecap="round"/>
        <path d="M0 -9 V9 M-8 -4.5 L8 4.5 M-8 4.5 L8 -4.5" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;160 200" dur="3.2s" begin="1.1s" repeatCount="indefinite"/>
      </g></g>
      <g transform="translate(150 290)"><g>
        <path d="M0 -9 V9 M-8 -4.5 L8 4.5 M-8 4.5 L8 -4.5" stroke="#7aa7c7" stroke-width="6" stroke-linecap="round"/>
        <path d="M0 -9 V9 M-8 -4.5 L8 4.5 M-8 4.5 L8 -4.5" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;140 260" dur="3.2s" begin="2.2s" repeatCount="indefinite"/>
      </g></g>
      <!-- снег намело на пол цеха -->
      <path d="M40 630 q60 -14 120 -2 q70 10 160 -2 L330 662 q-150 12 -292 0 Z" fill="#ffffff" stroke="#cfe3f0" stroke-width="3"/>
    </g>
    <g class="v-ok">
      <!-- закрытые скоростные ворота с окошком -->
      <rect x="42" y="250" width="276" height="372" fill="#ffcf4a"/>
      <path d="M42 290 H318 M42 330 H318 M42 370 H318 M42 450 H318 M42 490 H318 M42 530 H318 M42 570 H318" stroke="#e0ae2a" stroke-width="3"/>
      <rect x="62" y="390" width="236" height="44" rx="6" fill="#bfe6ff" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M80 428 l22 -32 M104 428 l22 -32" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <rect x="42" y="250" width="12" height="372" fill="#8a96a6" stroke="#2b3a4a" stroke-width="2"/>
      <rect x="306" y="250" width="12" height="372" fill="#8a96a6" stroke="#2b3a4a" stroke-width="2"/>
      <rect x="54" y="608" width="252" height="14" fill="#2b3a4a"/>
      <!-- воздушная завеса над воротами -->
      <rect x="70" y="200" width="220" height="30" rx="6" fill="#e3ecf5" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M86 210 V222 M100 210 V222 M114 210 V222 M128 210 V222 M142 210 V222 M156 210 V222 M170 210 V222 M184 210 V222 M198 210 V222 M212 210 V222 M226 210 V222 M240 210 V222 M254 210 V222 M268 210 V222" stroke="#8a96a6" stroke-width="3" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="20" y="196" width="320" height="474" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-fac-furnace: печь-сушилка с вытяжной трубой ===== -->
  <g id="obj-fac-furnace" class="obj" data-state="problem">
    <!-- всегда: труба через крышу, зонт, корпус печи -->
    <rect x="470" y="0" width="56" height="296" fill="url(#fc-steel)" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="462" y="136" width="72" height="16" rx="3" fill="#7b8a9a" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M428 330 L470 288 H526 L568 330 Z" fill="#9aa7b5" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <rect x="378" y="326" width="240" height="282" rx="10" fill="#7d93b2" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="392" y="342" width="212" height="250" rx="8" fill="none" stroke="#5a7092" stroke-width="3"/>
    <!-- дверца с окошком, внутри огонь -->
    <rect x="404" y="372" width="146" height="132" rx="8" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="424" y="392" width="106" height="72" rx="6" fill="url(#fc-fire)" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M436 464 q6 -26 16 -18 q2 -22 16 -30 q8 18 14 6 q14 18 10 42 Z" fill="#ffe680"/>
    <path d="M490 464 q4 -18 12 -14 q4 -14 12 -18 q6 14 4 32 Z" fill="#ffe680"/>
    <rect x="422" y="478" width="110" height="12" rx="4" fill="#8a96a6" stroke="#2b3a4a" stroke-width="3"/>
    <!-- пульт печи -->
    <rect x="562" y="376" width="44" height="96" rx="6" fill="#e3ecf5" stroke="#2b3a4a" stroke-width="3"/>
    <circle cx="584" cy="398" r="8" fill="#ff8c69" stroke="#2b3a4a" stroke-width="2.5"/>
    <circle cx="584" cy="424" r="8" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="2.5"/>
    <rect x="571" y="444" width="26" height="18" rx="2" fill="#2b3a4a"/>
    <!-- поддон с деталями на сушке -->
    <rect x="410" y="530" width="180" height="40" rx="6" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M420 540 H580 M420 552 H580" stroke="#8a96a6" stroke-width="3"/>
    <rect x="372" y="598" width="252" height="22" rx="4" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3"/>
    <g class="v-problem">
      <!-- труба раскалена снизу -->
      <ellipse cx="498" cy="240" rx="44" ry="70" fill="url(#fc-hot)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.6s" repeatCount="indefinite"/>
      </ellipse>
      <!-- горячие газы летят вверх по трубе -->
      <g>
        <path d="M498 280 v-40 M484 254 l14 -14 l14 14" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M498 280 v-40 M484 254 l14 -14 l14 14" fill="none" stroke="#ff7a2a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -240" dur="2.4s" begin="0s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;1;0" dur="2.4s" begin="0s" repeatCount="indefinite"/>
      </g>
      <g>
        <path d="M498 280 v-40 M484 254 l14 -14 l14 14" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M498 280 v-40 M484 254 l14 -14 l14 14" fill="none" stroke="#ff7a2a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -240" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;1;0" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
      </g>
      <!-- волны жара вокруг трубы -->
      <g fill="none" stroke="#ff7b2e" stroke-width="4" stroke-linecap="round">
        <path d="M446 280 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14 q-7 -7 0 -14"/>
        <path d="M550 280 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14 q-7 -7 0 -14"/>
        <path d="M440 200 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/>
        <path d="M556 200 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/>
        <animateTransform attributeName="transform" type="translate" values="0 6;0 -10;0 6" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
      </g>
      <!-- градусник на трубе: столбик до самого верха -->
      <rect x="489" y="64" width="18" height="62" rx="9" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
      <rect x="494" y="70" width="8" height="58" fill="#ff5a3c"/>
      <circle cx="498" cy="132" r="11" fill="#ff5a3c" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M512 74 h8 M512 90 h8 M512 106 h8" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round"/>
    </g>
    <g class="v-ok">
      <!-- теплообменник на трубе (рёбра) -->
      <rect x="446" y="176" width="104" height="86" rx="8" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="4"/>
      <path d="M456 192 H540 M456 206 H540 M456 220 H540 M456 234 H540 M456 248 H540" stroke="#3fa585" stroke-width="3"/>
      <!-- бак с водой: холодная вода идёт в теплообменник, тёплая — обратно -->
      <rect x="566" y="166" width="50" height="112" rx="16" fill="#e3ecf5" stroke="#2b3a4a" stroke-width="4"/>
      <path d="M591 196 c-8 12 -12 18 -12 24 a12 12 0 0 0 24 0 c0 -6 -4 -12 -12 -24 Z" fill="#3d8bfd" stroke="#2b3a4a" stroke-width="2.5"/>
      <path d="M582 248 q5 -5 0 -10 M592 248 q5 -5 0 -10 M602 248 q5 -5 0 -10" fill="none" stroke="#ff8c3a" stroke-width="3" stroke-linecap="round"/>
      <path d="M550 190 H566" stroke="#2b3a4a" stroke-width="12"/>
      <path d="M550 190 H566" stroke="#ff8c3a" stroke-width="7"/>
      <path d="M550 250 H566" stroke="#2b3a4a" stroke-width="12"/>
      <path d="M550 250 H566" stroke="#3d8bfd" stroke-width="7"/>
      <!-- градусник на трубе: газы остыли, столбик низко -->
      <rect x="489" y="64" width="18" height="62" rx="9" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
      <rect x="494" y="108" width="8" height="20" fill="#3d8bfd"/>
      <circle cx="498" cy="132" r="11" fill="#3d8bfd" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M512 74 h8 M512 90 h8 M512 106 h8" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="355" y="0" width="270" height="626" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-fac-skylights: световые фонари в крыше и лампы под потолком ===== -->
  <g id="obj-fac-skylights" class="obj" data-state="problem">
    <!-- всегда: рамы фонарей -->
    <rect x="660" y="16" width="140" height="104" rx="4" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="880" y="16" width="140" height="104" rx="4" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="1100" y="16" width="140" height="104" rx="4" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="4"/>
    <g class="v-problem">
      <!-- грязные стёкла: пятна, листья, свет почти не проходит -->
      <rect x="668" y="24" width="124" height="88" fill="#a89a7c"/>
      <rect x="888" y="24" width="124" height="88" fill="#a89a7c"/>
      <rect x="1108" y="24" width="124" height="88" fill="#a89a7c"/>
      <g fill="#7d6b4f">
        <ellipse cx="690" cy="40" rx="18" ry="10"/><ellipse cx="760" cy="96" rx="24" ry="12"/><ellipse cx="740" cy="52" rx="10" ry="7"/>
        <ellipse cx="920" cy="90" rx="22" ry="12"/><ellipse cx="985" cy="42" rx="20" ry="11"/><ellipse cx="950" cy="60" rx="9" ry="6"/>
        <ellipse cx="1130" cy="50" rx="16" ry="10"/><ellipse cx="1200" cy="92" rx="26" ry="13"/><ellipse cx="1175" cy="40" rx="11" ry="7"/>
      </g>
      <g fill="#c98a3c" stroke="#2b3a4a" stroke-width="2">
        <path d="M712 84 q10 -14 24 -6 q-8 14 -24 6 Z"/><path d="M940 34 q12 -10 22 0 q-12 10 -22 0 Z"/><path d="M1146 88 q10 -14 24 -6 q-8 14 -24 6 Z"/><path d="M1210 30 q12 -10 22 0 q-12 10 -22 0 Z"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- чистые стёкла: небо и блики -->
      <rect x="668" y="24" width="124" height="88" fill="url(#fc-sky)"/>
      <rect x="888" y="24" width="124" height="88" fill="url(#fc-sky)"/>
      <rect x="1108" y="24" width="124" height="88" fill="url(#fc-sky)"/>
      <path d="M680 100 l40 -66 M700 104 l28 -46 M900 100 l40 -66 M920 104 l28 -46 M1120 100 l40 -66 M1140 104 l28 -46" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
      <!-- солнечные лучи падают в цех -->
      <g pointer-events="none" fill="url(#fc-beam)">
        <path d="M670 120 H790 L812 236 H690 Z"/>
        <path d="M890 120 H1010 L1032 236 H910 Z"/>
        <path d="M1110 120 H1230 L1252 236 H1130 Z"/>
      </g>
    </g>
    <!-- всегда: переплёты рам -->
    <path d="M730 24 V112 M668 68 H792 M950 24 V112 M888 68 H1012 M1170 24 V112 M1108 68 H1232" stroke="#5a6b7d" stroke-width="5"/>
    <!-- всегда: подвесы и плафоны ламп -->
    <path d="M730 158 V186 M950 158 V186 M1170 158 V186" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M700 210 Q700 184 730 184 Q760 184 760 210 Z M920 210 Q920 184 950 184 Q980 184 980 210 Z M1140 210 Q1140 184 1170 184 Q1200 184 1200 210 Z" fill="#8a96a6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <g class="v-problem">
      <!-- старые лампы горят и мигают среди дня -->
      <g fill="url(#fc-glow)">
        <circle cx="730" cy="214" r="44"/><circle cx="950" cy="214" r="44"/><circle cx="1170" cy="214" r="44"/>
        <animate attributeName="opacity" values="1;0.55;1;1;0.4;1" dur="1.5s" repeatCount="indefinite"/>
      </g>
      <g fill="#fff3a0" stroke="#2b3a4a" stroke-width="3">
        <ellipse cx="730" cy="214" rx="15" ry="11"/><ellipse cx="950" cy="214" rx="15" ry="11"/><ellipse cx="1170" cy="214" rx="15" ry="11"/>
      </g>
      <path d="M706 222 l-12 6 M754 222 l12 6 M730 228 v7 M926 222 l-12 6 M974 222 l12 6 M950 228 v7 M1146 222 l-12 6 M1194 222 l12 6 M1170 228 v7" stroke="#ffb800" stroke-width="4" stroke-linecap="round"/>
    </g>
    <g class="v-ok">
      <!-- лампы выключены, на балке — датчик освещённости (значок солнца) -->
      <g fill="#d5dde6" stroke="#2b3a4a" stroke-width="3">
        <ellipse cx="730" cy="214" rx="15" ry="11"/><ellipse cx="950" cy="214" rx="15" ry="11"/><ellipse cx="1170" cy="214" rx="15" ry="11"/>
      </g>
      <path d="M826 140 a14 14 0 0 1 28 0 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="840" cy="98" r="10" fill="#ffd166" stroke="#2b3a4a" stroke-width="2.5"/>
      <path d="M840 80 v-6 M840 116 v6 M822 98 h-6 M858 98 h6 M827 85 l-4 -4 M853 85 l4 -4 M827 111 l-4 4 M853 111 l4 4" stroke="#ffb800" stroke-width="3" stroke-linecap="round"/>
      <path d="M840 126 v8" stroke="#2b3a4a" stroke-width="2" stroke-dasharray="2 3"/>
    </g>
    <rect class="obj-hit" x="640" y="0" width="620" height="238" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-fac-pipes: трубы горячей воды и пара вдоль стены ===== -->
  <g id="obj-fac-pipes" class="obj" data-state="problem">
    <!-- всегда: кронштейны на стене -->
    <rect x="694" y="250" width="12" height="80" fill="#7b8a9a" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="944" y="250" width="12" height="80" fill="#7b8a9a" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="1194" y="250" width="12" height="80" fill="#7b8a9a" stroke="#2b3a4a" stroke-width="2"/>
    <g class="v-problem">
      <!-- «тепловые пятна» вдоль голых труб -->
      <g fill="url(#fc-thermal)">
        <ellipse cx="700" cy="288" rx="64" ry="44"/><ellipse cx="830" cy="288" rx="64" ry="44"/><ellipse cx="960" cy="288" rx="64" ry="44"/><ellipse cx="1090" cy="288" rx="64" ry="44"/><ellipse cx="1210" cy="288" rx="54" ry="44"/>
      </g>
      <!-- голые трубы, горячие на вид -->
      <rect x="640" y="253" width="620" height="26" fill="#d98e5c" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M644 260 H1256" stroke="#f3bf92" stroke-width="4"/>
      <rect x="640" y="299" width="620" height="22" fill="#d98e5c" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M644 305 H1256" stroke="#f3bf92" stroke-width="4"/>
      <!-- волны тепла поднимаются от труб -->
      <g fill="none" stroke="#ff7b2e" stroke-width="4" stroke-linecap="round" pointer-events="none">
        <path d="M670 250 q6 -6 0 -12 q-6 -6 0 -12"/><path d="M820 250 q6 -6 0 -12 q-6 -6 0 -12"/><path d="M880 250 q6 -6 0 -12 q-6 -6 0 -12"/><path d="M1040 250 q6 -6 0 -12 q-6 -6 0 -12"/><path d="M1100 250 q6 -6 0 -12 q-6 -6 0 -12"/><path d="M1240 250 q6 -6 0 -12 q-6 -6 0 -12"/>
        <path d="M760 296 q6 -6 0 -12"/><path d="M1000 296 q6 -6 0 -12"/><path d="M1140 296 q6 -6 0 -12"/>
        <animateTransform attributeName="transform" type="translate" values="0 4;0 -6;0 4" dur="1.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- трубы в теплоизоляции: толстая серебристая «шуба» с бандажами -->
      <rect x="640" y="248" width="620" height="36" rx="10" fill="#e9eef3" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M650 256 H1250" stroke="#ffffff" stroke-width="5"/>
      <path d="M720 248 V284 M800 248 V284 M880 248 V284 M1020 248 V284 M1100 248 V284 M1180 248 V284" stroke="#b9c6d3" stroke-width="3"/>
      <rect x="640" y="294" width="620" height="32" rx="10" fill="#e9eef3" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M650 301 H1250" stroke="#ffffff" stroke-width="5"/>
      <path d="M720 294 V326 M800 294 V326 M880 294 V326 M1020 294 V326 M1100 294 V326 M1180 294 V326" stroke="#b9c6d3" stroke-width="3"/>
    </g>
    <!-- всегда: фланцы и задвижка -->
    <rect x="760" y="250" width="12" height="32" rx="2" fill="#8a96a6" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="1010" y="250" width="12" height="32" rx="2" fill="#8a96a6" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="880" y="296" width="12" height="28" rx="2" fill="#8a96a6" stroke="#2b3a4a" stroke-width="2"/>
    <circle cx="1140" cy="310" r="15" fill="none" stroke="#2b3a4a" stroke-width="8"/>
    <circle cx="1140" cy="310" r="15" fill="none" stroke="#ff8c69" stroke-width="4"/>
    <path d="M1126 310 H1154 M1140 296 V324" stroke="#ff8c69" stroke-width="3"/>
    <rect class="obj-hit" x="640" y="242" width="620" height="94" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-fac-safety-board: стенд «Техника безопасности» (всегда в порядке) ===== -->
  <g id="obj-fac-safety-board" class="obj" data-state="ok">
    <rect x="905" y="380" width="90" height="112" rx="6" fill="#ffffff" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="907" y="382" width="86" height="16" rx="4" fill="#3d8bfd"/>
    <circle cx="912" cy="486" r="2.5" fill="#2b3a4a"/><circle cx="988" cy="486" r="2.5" fill="#2b3a4a"/>
    <g fill="#3d8bfd" stroke="#2b3a4a" stroke-width="2"><circle cx="930" cy="422" r="16"/><circle cx="970" cy="422" r="16"/><circle cx="930" cy="462" r="16"/><circle cx="970" cy="462" r="16"/></g>
    <!-- каска -->
    <path d="M920 426 a10 10 0 0 1 20 0 Z" fill="#ffffff"/><rect x="917" y="425" width="26" height="4" rx="2" fill="#ffffff"/>
    <!-- очки -->
    <circle cx="964" cy="423" r="5" fill="#ffffff"/><circle cx="976" cy="423" r="5" fill="#ffffff"/><path d="M967 421 h6" stroke="#ffffff" stroke-width="2"/>
    <!-- перчатка -->
    <path d="M924 472 v-10 l-3 -6 q0 -3 3 -2 l3 4 v-8 q0 -3 3 -3 q2 0 2 3 v-1 q0 -3 3 -3 q2 0 2 3 v1 q0 -3 3 -2 q2 0 2 3 v15 Z" fill="#ffffff"/>
    <!-- наушники -->
    <path d="M961 464 a9 9 0 0 1 18 0" fill="none" stroke="#ffffff" stroke-width="3"/><rect x="957" y="461" width="7" height="11" rx="3" fill="#ffffff"/><rect x="976" y="461" width="7" height="11" rx="3" fill="#ffffff"/>
    <rect class="obj-hit" x="895" y="370" width="105" height="130" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-fac-extinguisher: огнетушитель на стене (всегда в порядке) ===== -->
  <g id="obj-fac-extinguisher" class="obj" data-state="ok">
    <rect x="928" y="530" width="44" height="8" rx="3" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="932" y="540" width="36" height="76" rx="14" fill="#ff5a3c" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="937" y="562" width="26" height="26" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
    <path d="M950 584 q-9 -3 -6 -12 q2 4 5 4 q-1 -7 4 -11 q0 6 4 9 q4 7 -1 10 Z" fill="#ff8c3a"/>
    <rect x="943" y="526" width="14" height="16" rx="3" fill="#2b3a4a"/>
    <path d="M957 530 h10" stroke="#2b3a4a" stroke-width="4" stroke-linecap="round"/>
    <path d="M957 536 q22 4 18 34 q-2 18 -10 22" fill="none" stroke="#2b3a4a" stroke-width="5" stroke-linecap="round"/>
    <path d="M940 548 v14" stroke="#ffb3a3" stroke-width="4" stroke-linecap="round"/>
    <rect class="obj-hit" x="895" y="506" width="105" height="120" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-fac-cooling: станок с водяным охлаждением ===== -->
  <g id="obj-fac-cooling" class="obj" data-state="problem">
    <!-- всегда: водопровод со стены в станок -->
    <path d="M1240 345 V408 H1110 V432" fill="none" stroke="#2b3a4a" stroke-width="13" stroke-linejoin="round"/>
    <path d="M1240 345 V408 H1110 V432" fill="none" stroke="#6fa8dc" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="1240" cy="376" r="10" fill="#ff8c69" stroke="#2b3a4a" stroke-width="3"/>
    <!-- всегда: станок -->
    <rect x="1014" y="650" width="172" height="22" rx="4" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1020" y="432" width="160" height="222" rx="12" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="1026" y="420" width="148" height="16" rx="6" fill="#4fb894" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1032" y="458" width="94" height="112" rx="8" fill="#dff4ff" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1067" y="466" width="24" height="42" fill="#9aa7b5" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1073 508 h12 l-6 14 Z" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
    <rect x="1048" y="538" width="62" height="20" rx="3" fill="#c9d3dd" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1040 470 l18 -6 M1040 486 l30 -10" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    <rect x="1134" y="458" width="38" height="104" rx="6" fill="#e3ecf5" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1140" y="466" width="26" height="22" rx="2" fill="#2b3a4a"/>
    <path d="M1144 482 l5 -6 l5 3 l8 -8" fill="none" stroke="#7ad9b5" stroke-width="2"/>
    <circle cx="1146" cy="504" r="5" fill="#ffd166" stroke="#2b3a4a" stroke-width="2"/><circle cx="1160" cy="504" r="5" fill="#ffd166" stroke="#2b3a4a" stroke-width="2"/>
    <circle cx="1153" cy="538" r="9" fill="#ff5a3c" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1032" y="590" width="136" height="40" rx="5" fill="#4fb894" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1044 600 H1156 M1044 610 H1156 M1044 620 H1156" stroke="#3fa585" stroke-width="3"/>
    <!-- всегда: трап канализации в полу -->
    <rect x="1208" y="700" width="50" height="16" rx="4" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1216 703 v10 M1225 703 v10 M1234 703 v10 M1243 703 v10 M1251 703 v10" stroke="#2b3a4a" stroke-width="2"/>
    <g class="v-problem">
      <!-- тёплая вода из станка сразу сливается в канализацию -->
      <ellipse cx="1233" cy="722" rx="30" ry="7" fill="#9fd8ff" stroke="#6fa8dc" stroke-width="2"/>
      <path d="M1180 620 H1233 V670" fill="none" stroke="#2b3a4a" stroke-width="13" stroke-linejoin="round"/>
      <path d="M1180 620 H1233 V670" fill="none" stroke="#9aa7b5" stroke-width="7" stroke-linejoin="round"/>
      <path d="M1233 674 V702" stroke="#3d8bfd" stroke-width="9" stroke-linecap="round" stroke-dasharray="9 5">
        <animate attributeName="stroke-dashoffset" values="0;-28" dur="0.6s" repeatCount="indefinite"/>
      </path>
      <g fill="#3d8bfd">
        <circle cx="1216" cy="696" r="3"><animate attributeName="cy" values="700;688;700" dur="0.7s" repeatCount="indefinite"/></circle>
        <circle cx="1252" cy="696" r="3"><animate attributeName="cy" values="700;686;700" dur="0.7s" begin="0.3s" repeatCount="indefinite"/></circle>
      </g>
      <!-- капли текут вниз по трубе водопровода — вода всё время новая -->
      <g>
        <path d="M1240 350 c-5 8 -8 12 -8 16 a8 8 0 0 0 16 0 c0 -4 -3 -8 -8 -16 Z" fill="#3d8bfd" stroke="#2b3a4a" stroke-width="2" transform="translate(-24 0)"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 40" dur="1.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0" dur="1.4s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- бак оборотной воды: вода охлаждает станок и идёт по кругу -->
      <path d="M1180 586 H1196 M1180 640 H1196" stroke="#2b3a4a" stroke-width="12"/>
      <path d="M1180 586 H1196" stroke="#ff8c3a" stroke-width="7"/>
      <path d="M1180 640 H1196" stroke="#3d8bfd" stroke-width="7"/>
      <rect x="1194" y="556" width="62" height="112" rx="10" fill="#6fa8dc" stroke="#2b3a4a" stroke-width="4"/>
      <path d="M1200 576 H1250" stroke="#9fd0f5" stroke-width="4"/>
      <circle cx="1225" cy="616" r="19" fill="#ffffff" stroke="#2b3a4a" stroke-width="2.5"/>
      <path d="M1213 610 a13 13 0 0 1 22 -6 M1237 622 a13 13 0 0 1 -22 6" fill="none" stroke="#3d8bfd" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M1236 596 l1 9 l-9 -1 Z M1214 636 l-1 -9 l9 1 Z" fill="#3d8bfd"/>
    </g>
    <rect class="obj-hit" x="1005" y="345" width="258" height="390" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-fac-conveyor: конвейер ===== -->
  <g id="obj-fac-conveyor" class="obj" data-state="problem">
    <!-- всегда: ножки, рама, лента, ролики, мотор, стойка со значком -->
    <rect x="440" y="712" width="14" height="66" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="600" y="712" width="14" height="66" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="760" y="712" width="14" height="66" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="432" y="774" width="30" height="8" rx="3" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="592" y="774" width="30" height="8" rx="3" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="752" y="774" width="30" height="8" rx="3" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="410" y="672" width="480" height="38" rx="19" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="414" y="706" width="472" height="12" rx="3" fill="#ffcf4a" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M430 712 l10 -6 M470 712 l10 -6 M510 712 l10 -6 M550 712 l10 -6 M590 712 l10 -6 M630 712 l10 -6 M670 712 l10 -6 M710 712 l10 -6 M750 712 l10 -6 M790 712 l10 -6 M830 712 l10 -6 M866 712 l10 -6" stroke="#2b3a4a" stroke-width="3"/>
    <circle cx="429" cy="691" r="15" fill="#9aa7b5" stroke="#2b3a4a" stroke-width="3"/>
    <circle cx="871" cy="691" r="15" fill="#9aa7b5" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="800" y="730" width="70" height="42" rx="8" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M812 738 V764 M824 738 V764 M836 738 V764 M848 738 V764" stroke="#2f5591" stroke-width="3"/>
    <path d="M858 730 L870 706" stroke="#2b3a4a" stroke-width="5"/>
    <rect x="896" y="660" width="8" height="114" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="886" y="770" width="28" height="9" rx="3" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="2"/>
    <circle cx="900" cy="652" r="15" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <g class="v-problem">
      <!-- пустая лента едет: бегут шевроны -->
      <g fill="none" stroke="#9aa7b5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M450 682 l10 9 l-10 9 M490 682 l10 9 l-10 9 M530 682 l10 9 l-10 9 M570 682 l10 9 l-10 9 M610 682 l10 9 l-10 9 M650 682 l10 9 l-10 9 M690 682 l10 9 l-10 9 M730 682 l10 9 l-10 9 M770 682 l10 9 l-10 9 M810 682 l10 9 l-10 9"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;40 0" dur="0.8s" repeatCount="indefinite"/>
      </g>
      <!-- ролики крутятся -->
      <g transform="translate(429 691)"><g>
        <path d="M-10 0 H10 M0 -10 V10" stroke="#2b3a4a" stroke-width="3"/>
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.8s" repeatCount="indefinite"/>
      </g></g>
      <g transform="translate(871 691)"><g>
        <path d="M-10 0 H10 M0 -10 V10" stroke="#2b3a4a" stroke-width="3"/>
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.8s" repeatCount="indefinite"/>
      </g></g>
      <!-- мотор гудит -->
      <g fill="none" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round">
        <path d="M792 742 q-8 9 0 18 M782 736 q-14 15 0 30"/>
        <animate attributeName="opacity" values="0;1;0" dur="0.8s" repeatCount="indefinite"/>
      </g>
      <!-- значок «пуск» на стойке: лента работает -->
      <path d="M895 644 L909 652 L895 660 Z" fill="#3fa585" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
    </g>
    <g class="v-ok">
      <!-- лента стоит -->
      <path d="M450 682 l10 9 l-10 9 M530 682 l10 9 l-10 9 M610 682 l10 9 l-10 9 M690 682 l10 9 l-10 9 M770 682 l10 9 l-10 9" fill="none" stroke="#7b8a9a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M419 691 H439 M429 681 V701 M861 691 H881 M871 681 V701" stroke="#2b3a4a" stroke-width="3"/>
      <!-- датчик деталей в начале ленты -->
      <rect x="452" y="640" width="8" height="34" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="2"/>
      <rect x="440" y="644" width="26" height="16" rx="4" fill="#ffd166" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M466 652 H520" stroke="#ffb800" stroke-width="3" stroke-dasharray="6 5"/>
      <!-- частотный привод на моторе -->
      <rect x="812" y="744" width="34" height="22" rx="3" fill="#e3ecf5" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M816 756 q4 -8 8 0 t8 0 t8 0" fill="none" stroke="#3d6fb6" stroke-width="2.5"/>
      <!-- значок «пауза» на стойке: лента остановлена, пока нет деталей -->
      <rect x="893" y="644" width="5" height="16" rx="1" fill="#2b3a4a"/><rect x="902" y="644" width="5" height="16" rx="1" fill="#2b3a4a"/>
    </g>
    <rect class="obj-hit" x="390" y="634" width="526" height="156" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-fac-pallets: деревянные поддоны и картонная упаковка ===== -->
  <g id="obj-fac-pallets" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- сломанные поддоны и коробки торчат из общего контейнера -->
      <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <rect x="440" y="800" width="104" height="13" rx="2" fill="#e0b07a" transform="rotate(-20 492 806)"/>
        <rect x="520" y="800" width="90" height="12" rx="2" fill="#d9a066" transform="rotate(24 565 806)"/>
        <rect x="470" y="814" width="60" height="30" rx="3" fill="#c99a5b" transform="rotate(-8 500 829)"/>
        <rect x="548" y="820" width="56" height="26" rx="3" fill="#d6a868" transform="rotate(10 576 833)"/>
      </g>
      <path d="M478 826 l50 -6 M552 830 l46 8" stroke="#a0784a" stroke-width="3"/>
      <path d="M520 822 q8 -18 24 -10 q14 -4 14 10 q-6 12 -20 8 q-14 8 -18 -8 Z" fill="#ffffff" stroke="#9aa7b5" stroke-width="3"/>
      <rect x="430" y="834" width="190" height="60" rx="6" fill="#8a96a6" stroke="#2b3a4a" stroke-width="4"/>
      <rect x="424" y="828" width="202" height="12" rx="4" fill="#6c7a89" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M470 846 V886 M525 846 V886 M580 846 V886" stroke="#6c7a89" stroke-width="4"/>
      <!-- обломки на полу -->
      <rect x="396" y="878" width="40" height="9" rx="2" fill="#e0b07a" stroke="#2b3a4a" stroke-width="3" transform="rotate(-10 416 882)"/>
      <rect x="622" y="872" width="24" height="18" rx="2" fill="#c99a5b" stroke="#2b3a4a" stroke-width="3" transform="rotate(14 634 881)"/>
    </g>
    <g class="v-ok">
      <!-- штабель целых поддонов (вернут поставщику) -->
      <g fill="#e0b07a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <rect x="414" y="872" width="134" height="8" rx="2"/><rect x="418" y="880" width="16" height="10"/><rect x="473" y="880" width="16" height="10"/><rect x="528" y="880" width="16" height="10"/><rect x="414" y="890" width="134" height="6" rx="2"/>
        <rect x="414" y="846" width="134" height="8" rx="2"/><rect x="418" y="854" width="16" height="10"/><rect x="473" y="854" width="16" height="10"/><rect x="528" y="854" width="16" height="10"/><rect x="414" y="864" width="134" height="6" rx="2"/>
        <rect x="414" y="820" width="134" height="8" rx="2"/><rect x="418" y="828" width="16" height="10"/><rect x="473" y="828" width="16" height="10"/><rect x="528" y="828" width="16" height="10"/><rect x="414" y="838" width="134" height="6" rx="2"/>
      </g>
      <!-- спрессованный тюк картона со знаком переработки -->
      <rect x="564" y="830" width="78" height="64" rx="4" fill="#c99a5b" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M564 846 H642 M564 862 H642 M564 878 H642" stroke="#a0784a" stroke-width="2"/>
      <path d="M582 830 V894 M624 830 V894" stroke="#2b3a4a" stroke-width="3"/>
      <circle cx="603" cy="862" r="15" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M594 866 a10 10 0 0 1 12 -13 M612 858 a10 10 0 0 1 -12 13" fill="none" stroke="#3fa585" stroke-width="3" stroke-linecap="round"/>
      <path d="M603 849 l6 4 l-6 4 Z M603 875 l-6 -4 l6 -4 Z" fill="#3fa585"/>
    </g>
    <rect class="obj-hit" x="390" y="798" width="262" height="100" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-fac-scrap: металлическая стружка и обрезки ===== -->
  <g id="obj-fac-scrap" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- общий бак, из него торчит всё вперемешку: обрезки металла, стружка, бумага, стаканчик -->
      <rect x="60" y="760" width="150" height="130" rx="8" fill="#8a96a6" stroke="#2b3a4a" stroke-width="4"/>
      <path d="M100 782 V872 M135 782 V872 M170 782 V872" stroke="#6c7a89" stroke-width="4"/>
      <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <rect x="66" y="726" width="104" height="14" rx="2" fill="#c9d3dd" transform="rotate(-26 118 733)"/>
        <rect x="112" y="716" width="96" height="14" rx="2" fill="#b3bcc6" transform="rotate(32 160 723)"/>
        <path d="M144 756 q-8 -30 16 -30 q22 4 12 30 Z" fill="#ffffff"/>
        <path d="M84 756 l20 -3 l-3 -26 h-16 Z" fill="#ffd166" transform="rotate(-12 94 740)"/>
      </g>
      <g fill="none" stroke="#5a6b7d" stroke-width="4" stroke-linecap="round">
        <path d="M106 754 q8 -16 18 -6 q8 10 -6 12 q-12 0 -6 -14 q8 -12 20 -2 q8 8 0 12"/>
        <path d="M176 754 q6 -12 14 -4 q6 8 -4 10 q-10 0 -4 -12"/>
      </g>
      <rect x="54" y="752" width="162" height="14" rx="5" fill="#6c7a89" stroke="#2b3a4a" stroke-width="3"/>
      <!-- стружка рассыпана по полу -->
      <g fill="none" stroke="#5a6b7d" stroke-width="4" stroke-linecap="round">
        <path d="M30 884 q6 -10 12 -2 q4 8 -4 8 q-8 0 -2 -10 q6 -6 12 2"/>
        <path d="M222 880 q6 -10 12 -2 q4 8 -4 8 q-8 0 -2 -10"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- синий бак для металлолома (значок — гайка) с аккуратными обрезками -->
      <g stroke="#2b3a4a" stroke-width="3">
        <rect x="56" y="744" width="96" height="10" rx="2" fill="#c9d3dd"/>
        <rect x="64" y="732" width="84" height="10" rx="2" fill="#b3bcc6"/>
      </g>
      <rect x="40" y="756" width="130" height="134" rx="8" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="4"/>
      <rect x="34" y="750" width="142" height="12" rx="5" fill="#2f5591" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M105 802 l20 11.5 v23 l-20 11.5 l-20 -11.5 v-23 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="105" cy="825" r="8" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="2.5"/>
      <!-- маленький бак для обычного мусора -->
      <rect x="186" y="820" width="60" height="70" rx="6" fill="#8a96a6" stroke="#2b3a4a" stroke-width="3"/>
      <rect x="182" y="814" width="68" height="10" rx="4" fill="#6c7a89" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M200 812 q4 -12 14 -8 q8 -4 10 6" fill="#ffffff" stroke="#9aa7b5" stroke-width="2"/>
    </g>
    <rect class="obj-hit" x="20" y="680" width="240" height="218" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-fac-air-hose: шланг сжатого воздуха к пневмоинструменту ===== -->
  <g id="obj-fac-air-hose" class="obj" data-state="problem">
    <!-- всегда: тележка с пневмогайковёртом и жёлтый шланг -->
    <rect x="936" y="800" width="92" height="10" rx="3" fill="#ff8c69" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="942" y="810" width="8" height="66" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="1014" y="810" width="8" height="66" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="936" y="852" width="92" height="8" rx="3" fill="#ff8c69" stroke="#2b3a4a" stroke-width="3"/>
    <circle cx="946" cy="884" r="8" fill="#2b3a4a"/><circle cx="1018" cy="884" r="8" fill="#2b3a4a"/>
    <rect x="950" y="776" width="52" height="20" rx="8" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1000" y="781" width="16" height="10" rx="2" fill="#9aa7b5" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="956" y="792" width="14" height="9" rx="2" fill="#2f5591" stroke="#2b3a4a" stroke-width="2"/>
    <path d="M1016 786 C1060 790 1050 858 1110 858 C1170 858 1180 806 1240 812 C1280 816 1300 830 1330 822" fill="none" stroke="#2b3a4a" stroke-width="15" stroke-linecap="round"/>
    <path d="M1016 786 C1060 790 1050 858 1110 858 C1170 858 1180 806 1240 812 C1280 816 1300 830 1330 822" fill="none" stroke="#ffcf4a" stroke-width="9" stroke-linecap="round"/>
    <g class="v-problem">
      <!-- старое соединение, замотанное изолентой -->
      <rect x="1098" y="846" width="28" height="24" rx="4" fill="#9aa7b5" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M1096 852 l30 10 M1096 862 l30 8" stroke="#5a6b7d" stroke-width="5"/>
      <path d="M1112 846 l-3 8 l4 6 l-3 8" fill="none" stroke="#2b3a4a" stroke-width="2"/>
      <!-- свистящий воздух: облачка и «шипение» -->
      <g transform="translate(1124 842)"><g fill="#ffffff" stroke="#9aa7b5" stroke-width="2">
        <circle cx="0" cy="0" r="14"/><circle cx="14" cy="-8" r="11"/><circle cx="-8" cy="-11" r="10"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;40 -60" dur="1.2s" begin="0s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0" dur="1.2s" begin="0s" repeatCount="indefinite"/>
      </g></g>
      <g transform="translate(1124 842)"><g fill="#ffffff" stroke="#9aa7b5" stroke-width="2">
        <circle cx="0" cy="0" r="14"/><circle cx="14" cy="-8" r="11"/><circle cx="-8" cy="-11" r="10"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;60 -30" dur="1.2s" begin="0.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0" dur="1.2s" begin="0.4s" repeatCount="indefinite"/>
      </g></g>
      <g transform="translate(1124 842)"><g fill="#ffffff" stroke="#9aa7b5" stroke-width="2">
        <circle cx="0" cy="0" r="14"/><circle cx="14" cy="-8" r="11"/><circle cx="-8" cy="-11" r="10"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;20 -70" dur="1.2s" begin="0.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0" dur="1.2s" begin="0.8s" repeatCount="indefinite"/>
      </g></g>
      <g fill="none" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1132 800 l8 -6 l2 8 l8 -6 l2 8 l8 -6"/>
        <path d="M1150 836 l10 -2 l-4 8 l10 -2 l-4 8"/>
        <animate attributeName="opacity" values="1;0.2;1" dur="0.4s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- новая быстроразъёмная муфта, утечки нет -->
      <rect x="1096" y="846" width="32" height="24" rx="5" fill="#ffd166" stroke="#2b3a4a" stroke-width="3"/>
      <rect x="1106" y="842" width="12" height="32" rx="3" fill="#3d8bfd" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M1100 852 h6 M1118 852 h6" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="920" y="745" width="370" height="153" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-fac-compressor: компрессор; часы на стене показывают обед ===== -->
  <g id="obj-fac-compressor" class="obj" data-state="problem">
    <!-- всегда: настенные часы (половина первого) и табличка «обед» с чашкой -->
    <circle cx="1352" cy="586" r="26" fill="#ffffff" stroke="#2b3a4a" stroke-width="4"/>
    <path d="M1352 564 v5 M1352 603 v5 M1330 586 h5 M1369 586 h5" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1352 586 L1358 571 M1352 586 V605" stroke="#2b3a4a" stroke-width="4" stroke-linecap="round"/>
    <circle cx="1352" cy="586" r="3" fill="#ff5a3c"/>
    <rect x="1390" y="564" width="52" height="44" rx="8" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1404 584 h20 v10 q0 8 -10 8 q-10 0 -10 -8 Z" fill="#ff8c69" stroke="#2b3a4a" stroke-width="2"/>
    <path d="M1424 587 q8 0 6 7 q-2 4 -6 2" fill="none" stroke="#2b3a4a" stroke-width="2"/>
    <path d="M1409 579 q-3 -4 0 -8 M1418 579 q-3 -4 0 -8" fill="none" stroke="#9aa7b5" stroke-width="2" stroke-linecap="round"/>
    <!-- всегда: ресивер (бак) на ножках, манометр -->
    <rect x="1350" y="840" width="18" height="34" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1524" y="840" width="18" height="34" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1340" y="870" width="210" height="10" rx="3" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1326" y="770" width="242" height="78" rx="39" fill="#ff8c69" stroke="#2b3a4a" stroke-width="4"/>
    <path d="M1360 776 V842 M1534 776 V842" stroke="#e06b4a" stroke-width="3"/>
    <path d="M1340 790 H1554" stroke="#ffb3a3" stroke-width="5" stroke-linecap="round"/>
    <circle cx="1440" cy="812" r="17" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1428 812 a12 12 0 0 1 24 0" fill="none" stroke="#c9d3dd" stroke-width="3"/>
    <g class="v-problem">
      <!-- насос и мотор трясутся: компрессор работает на полную -->
      <g>
        <circle cx="1362" cy="724" r="28" fill="#c9d3dd" stroke="#2b3a4a" stroke-width="4"/>
        <g transform="translate(1362 724)"><g>
          <path d="M-20 0 H20 M0 -20 V20 M-14 -14 L14 14 M-14 14 L14 -14" stroke="#5a6b7d" stroke-width="3"/>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.4s" repeatCount="indefinite"/>
        </g></g>
        <circle cx="1362" cy="724" r="6" fill="#2b3a4a"/>
        <rect x="1394" y="680" width="64" height="92" rx="6" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="4"/>
        <path d="M1400 694 H1452 M1400 706 H1452 M1400 718 H1452" stroke="#8a96a6" stroke-width="3"/>
        <rect x="1468" y="712" width="76" height="60" rx="10" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="4"/>
        <path d="M1480 720 V764 M1494 720 V764 M1508 720 V764 M1522 720 V764" stroke="#2f5591" stroke-width="3"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;2 -2;-2 1;1 2;0 0" dur="0.2s" repeatCount="indefinite"/>
      </g>
      <!-- мигающая лампа «работает» -->
      <path d="M1496 712 a10 10 0 0 1 20 0 Z" fill="#ffb800" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <animate attributeName="opacity" values="1;0.2;1" dur="0.6s" repeatCount="indefinite"/>
      </path>
      <!-- стрелка манометра дрожит -->
      <path d="M1440 812 L1451 801" stroke="#ff5a3c" stroke-width="3" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" values="-12 1440 812;12 1440 812;-12 1440 812" dur="0.5s" repeatCount="indefinite"/>
      </path>
      <!-- гул -->
      <g fill="none" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round">
        <path d="M1326 696 q-10 12 0 24 M1316 688 q-18 20 0 40"/>
        <path d="M1560 700 q10 12 0 24 M1570 692 q18 20 0 40"/>
        <animate attributeName="opacity" values="0;1;0" dur="0.7s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- компрессор стоит тихо -->
      <circle cx="1362" cy="724" r="28" fill="#c9d3dd" stroke="#2b3a4a" stroke-width="4"/>
      <path d="M1342 724 H1382 M1362 704 V744 M1348 710 L1376 738 M1348 738 L1376 710" stroke="#5a6b7d" stroke-width="3"/>
      <circle cx="1362" cy="724" r="6" fill="#2b3a4a"/>
      <rect x="1394" y="680" width="64" height="92" rx="6" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="4"/>
      <path d="M1400 694 H1452 M1400 706 H1452 M1400 718 H1452" stroke="#8a96a6" stroke-width="3"/>
      <rect x="1468" y="712" width="76" height="60" rx="10" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="4"/>
      <path d="M1480 720 V764 M1494 720 V764 M1508 720 V764 M1522 720 V764" stroke="#2f5591" stroke-width="3"/>
      <path d="M1496 712 a10 10 0 0 1 20 0 Z" fill="#d5dde6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M1440 812 L1430 803" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round"/>
      <!-- блок таймера на стене: «часы» и «пауза» -->
      <rect x="1460" y="562" width="104" height="48" rx="8" fill="#e3ecf5" stroke="#2b3a4a" stroke-width="3"/>
      <circle cx="1486" cy="586" r="14" fill="#ffffff" stroke="#2b3a4a" stroke-width="2.5"/>
      <path d="M1486 586 V576 M1486 586 h8" stroke="#2b3a4a" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="1514" y="574" width="7" height="24" rx="2" fill="#3d6fb6"/><rect x="1527" y="574" width="7" height="24" rx="2" fill="#3d6fb6"/>
      <path d="M1512 610 V640 q0 20 -10 40" fill="none" stroke="#2b3a4a" stroke-width="3"/>
    </g>
    <rect class="obj-hit" x="1300" y="545" width="290" height="353" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-fac-fan: вытяжной вентилятор в стене ===== -->
  <g id="obj-fac-fan" class="obj" data-state="problem">
    <!-- всегда: короб вентилятора и круглое отверстие -->
    <rect x="1350" y="190" width="210" height="210" rx="16" fill="#9aa7b5" stroke="#2b3a4a" stroke-width="4"/>
    <circle cx="1455" cy="295" r="92" fill="#2b3a4a"/>
    <rect x="1385" y="500" width="140" height="10" rx="3" fill="#7b8a9a" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1395 510 l20 14 M1515 510 l-20 14" stroke="#7b8a9a" stroke-width="6"/>
    <rect x="1448" y="398" width="14" height="36" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <g class="v-problem">
      <!-- старые лопасти крутятся рывками -->
      <g transform="translate(1455 295)"><g>
        <path d="M0 0 C20 -20 26 -60 6 -84 C-14 -70 -18 -30 0 0 Z" fill="#b3bcc6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
        <path transform="rotate(90)" d="M0 0 C20 -20 26 -60 6 -84 C-14 -70 -18 -30 0 0 Z" fill="#b3bcc6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
        <path transform="rotate(180)" d="M0 0 C20 -20 26 -60 6 -84 C-14 -70 -18 -30 0 0 Z" fill="#b3bcc6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
        <path transform="rotate(270)" d="M0 0 C20 -20 26 -60 6 -84 C-14 -70 -18 -30 0 0 Z" fill="#b3bcc6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="4" cy="-50" r="5" fill="#b5823c"/><circle cx="-50" cy="-6" r="4" fill="#b5823c"/>
        <animateTransform attributeName="transform" type="rotate" values="0;100;180;300;360" dur="0.9s" repeatCount="indefinite"/>
      </g></g>
      <circle cx="1455" cy="295" r="16" fill="#6c6253" stroke="#2b3a4a" stroke-width="3"/>
      <!-- старый большой мотор: трясётся, ржавые пятна -->
      <g>
        <rect x="1392" y="430" width="126" height="70" rx="14" fill="#6c6253" stroke="#2b3a4a" stroke-width="4"/>
        <path d="M1408 438 V492 M1424 438 V492 M1440 438 V492 M1456 438 V492 M1472 438 V492 M1488 438 V492" stroke="#54493c" stroke-width="3"/>
        <circle cx="1418" cy="452" r="6" fill="#b5823c"/><circle cx="1490" cy="480" r="7" fill="#b5823c"/><circle cx="1470" cy="446" r="4" fill="#b5823c"/>
        <rect x="1500" y="440" width="24" height="22" rx="3" fill="#54493c" stroke="#2b3a4a" stroke-width="3"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;2 -1;-2 1;0 0" dur="0.18s" repeatCount="indefinite"/>
      </g>
      <!-- волны жара от мотора -->
      <g fill="none" stroke="#ff7b2e" stroke-width="4" stroke-linecap="round">
        <path d="M1370 500 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/>
        <path d="M1540 500 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/>
        <animateTransform attributeName="transform" type="translate" values="0 6;0 -10;0 6" dur="1.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite"/>
      </g>
      <!-- гул -->
      <g fill="none" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round">
        <path d="M1336 270 q-10 12 0 24 M1324 260 q-18 22 0 44"/>
        <path d="M1574 270 q10 12 0 24 M1586 260 q18 22 0 44"/>
        <animate attributeName="opacity" values="0;1;0" dur="0.7s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- новые лопасти крутятся ровно -->
      <g transform="translate(1455 295)"><g>
        <path d="M0 0 C20 -20 26 -60 6 -84 C-14 -70 -18 -30 0 0 Z" fill="#e3ecf5" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
        <path transform="rotate(90)" d="M0 0 C20 -20 26 -60 6 -84 C-14 -70 -18 -30 0 0 Z" fill="#e3ecf5" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
        <path transform="rotate(180)" d="M0 0 C20 -20 26 -60 6 -84 C-14 -70 -18 -30 0 0 Z" fill="#e3ecf5" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
        <path transform="rotate(270)" d="M0 0 C20 -20 26 -60 6 -84 C-14 -70 -18 -30 0 0 Z" fill="#e3ecf5" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2.5s" repeatCount="indefinite"/>
      </g></g>
      <circle cx="1455" cy="295" r="16" fill="#3d8bfd" stroke="#2b3a4a" stroke-width="3"/>
      <!-- новый компактный энергоэффективный мотор -->
      <rect x="1414" y="440" width="84" height="60" rx="14" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="4"/>
      <path d="M1428 448 V492 M1442 448 V492 M1456 448 V492 M1470 448 V492 M1484 448 V492" stroke="#3fa585" stroke-width="3"/>
      <path d="M1440 470 l10 -14 v10 h10 l-10 14 v-10 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
    </g>
    <!-- всегда: защитная решётка -->
    <circle cx="1455" cy="295" r="92" fill="none" stroke="#c9d3dd" stroke-width="5"/>
    <circle cx="1455" cy="295" r="62" fill="none" stroke="#c9d3dd" stroke-width="3"/>
    <circle cx="1455" cy="295" r="32" fill="none" stroke="#c9d3dd" stroke-width="3"/>
    <path d="M1363 295 H1547 M1455 203 V387" stroke="#c9d3dd" stroke-width="3"/>
    <circle cx="1455" cy="295" r="94" fill="none" stroke="#2b3a4a" stroke-width="3"/>
    <rect class="obj-hit" x="1300" y="170" width="290" height="365" rx="12" fill="transparent"/>
  </g>
</svg>`;
