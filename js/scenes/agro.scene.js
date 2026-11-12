/*
  agro.scene.js — SVG-сцена «Дом в агрогородке»: частный дом в разрезе и двор.

  Что в файле: одна строка EB.scenes.agro с векторной картинкой (SVG) уровня «Дом в агрогородке».
  Размер холста 1600×900 (viewBox), сцена сама подстраивается под экран.
  Время — поздняя осень, начало отопительного сезона: голые деревья, жёлтые листья, журавли улетают.
  Слева — дом в разрезе: чердак, комната с кухней и котельная. Справа — двор: поленница, фонарь,
  сарай, бочка, теплица; на переднем плане — колодец с насосом, компост, огород, будка с собакой.

  Как устроен каждый интерактивный объект:
    <g id="obj-ИМЯ" class="obj" data-state="problem">
      ...части, видимые всегда...
      <g class="v-problem">…как выглядит проблема…</g>
      <g class="v-ok">…как выглядит после исправления…</g>
      <rect class="obj-hit" …/>   ← прозрачная зона клика, всегда ПОСЛЕДНЯЯ
    </g>
  Движок меняет data-state ("problem" / "ok"), а CSS прячет ненужный вариант.
  Анимации (SMIL) есть только внутри .v-problem.

  Объекты сцены:
    obj-agro-attic        — чердак: голое перекрытие, волны тепла уходят сквозь крышу / толстый слой утеплителя
    obj-agro-boiler       — котёл на дровах/пеллетах: большое пламя, стрелка на максимуме, форточка открыта,
                            из трубы валит дым / ровный огонь, стрелка посередине, регулятор, форточка закрыта
    obj-agro-window       — окно в комнате: щели, сквозняк, занавеска колышется / уплотнитель по контуру
    obj-agro-radiator     — батарея: волны жара, термометр «зашкаливает» / термоголовка, термометр посередине
    obj-agro-waterheater  — электрический водонагреватель на кухне: стрелка на максимуме, лампа мигает, пар из
                            крана / стрелка посередине, значок-листик «эко»
    obj-agro-woodpile     — поленница под навесом (всё в порядке, проблемы в пуле нет)
    obj-agro-yard-lamp    — фонарь во дворе: горит днём / выключен, на столбе датчик освещённости
    obj-agro-shed-light   — лампа в сарае: горячая лампа накаливания светит пустому сараю /
                            выключена, на стене датчик присутствия
    obj-agro-freezer      — старая морозилка в сарае: толстый лёд, внутри один пакет, гудит /
                            отключена (вилка вынута), внутри чисто
    obj-agro-hose         — бочка и теплица: шланг из водопровода поливает днём, лужа /
                            капельный полив из бочки с дождевой водой, лейка
    obj-agro-pump         — насос колодца: шланг треснул и брызжет, насос всё время включается /
                            трещина стянута хомутом, сухо
    obj-agro-compost      — листья и очистки в общем баке, мухи / компостный ящик, бак закрыт
    obj-agro-dog          — будка с собакой (всё в порядке, проблемы в пуле нет)

  Как менять:
    • координаты — в единицах viewBox (x: 0…1600 слева направо, y: 0…900 сверху вниз);
    • контур — цвет #2b3a4a, толщина 3–4;
    • id градиентов начинаются с "ag-", чтобы не пересечься с другими сценами;
    • зоны клика (obj-hit) не должны перекрываться между объектами;
    • в строке нельзя использовать обратную кавычку и знак доллара с фигурной скобкой;
    • текстовых элементов SVG в сцене нет — игра двуязычная, все подписи в texts.*.js.
*/
EB.scenes = EB.scenes || {};
EB.scenes.agro = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" class="scene-svg">
  <defs>
    <linearGradient id="ag-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc9ef"/><stop offset="1" stop-color="#e4f2f8"/></linearGradient>
    <radialGradient id="ag-glow"><stop offset="0" stop-color="#fff6b0" stop-opacity="0.95"/><stop offset="0.5" stop-color="#ffe066" stop-opacity="0.45"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>
    <radialGradient id="ag-hot"><stop offset="0" stop-color="#ffd27a" stop-opacity="0.95"/><stop offset="0.5" stop-color="#ff9a3c" stop-opacity="0.5"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient>
    <radialGradient id="ag-sun"><stop offset="0" stop-color="#fff7c2"/><stop offset="1" stop-color="#ffd166"/></radialGradient>
    <clipPath id="ag-attic-clip"><path d="M64 396 L480 172 L896 396 Z"/></clipPath>
  </defs>

  <!-- ===== ФОН (не интерактивный) ===== -->
  <g id="ag-bg" pointer-events="none">
    <!-- небо -->
    <rect x="0" y="0" width="1600" height="620" fill="url(#ag-sky)"/>
    <!-- бледное осеннее солнце -->
    <path d="M1532 100 L1552 100 M1524 131 L1541 141 M1501 154 L1511 171 M1470 162 L1470 182 M1439 154 L1429 171 M1416 131 L1399 141 M1408 100 L1388 100 M1416 69 L1399 59 M1439 46 L1429 29 M1470 38 L1470 18 M1501 46 L1511 29 M1524 69 L1541 59" stroke="#ffc233" stroke-width="5" stroke-linecap="round"/>
    <circle cx="1470" cy="100" r="46" fill="url(#ag-sun)" stroke="#2b3a4a" stroke-width="4"/>
    <!-- облака -->
    <g transform="translate(1180 110)" fill="#ffffff" stroke="#c9dceb" stroke-width="3"><ellipse cx="0" cy="0" rx="60" ry="24"/><circle cx="-22" cy="-14" r="24"/><circle cx="16" cy="-22" r="30"/></g>
    <g transform="translate(200 120) scale(0.8)" fill="#ffffff" stroke="#c9dceb" stroke-width="3"><ellipse cx="0" cy="0" rx="60" ry="24"/><circle cx="-22" cy="-14" r="24"/><circle cx="16" cy="-22" r="30"/></g>
    <g transform="translate(920 220) scale(0.6)" fill="#ffffff" stroke="#c9dceb" stroke-width="3"><ellipse cx="0" cy="0" rx="60" ry="24"/><circle cx="-22" cy="-14" r="24"/><circle cx="16" cy="-22" r="30"/></g>
    <!-- журавли улетают на юг (клин) -->
    <path d="M640 70 q9 -8 18 0 q9 -8 18 0 M610 88 q8 -7 16 0 q8 -7 16 0 M670 90 q8 -7 16 0 q8 -7 16 0 M580 106 q7 -6 14 0 q7 -6 14 0 M700 108 q7 -6 14 0 q7 -6 14 0 M550 122 q6 -5 12 0 q6 -5 12 0" fill="none" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- дальний лес и поля агрогородка -->
    <path d="M900 575 l14 -40 l14 40 l12 -52 l14 52 l12 -36 l14 36 l14 -46 l14 46 l12 -30 l12 30 l14 -44 l14 44 l12 -38 l14 38 l14 -50 l14 50 l12 -34 l12 34 l14 -42 l14 42 l12 -36 l14 36 l14 -48 l14 48 l12 -32 l12 32 l14 -44 l14 44 l12 -38 l14 38 l14 -46 l14 46 l12 -30 l12 30 l14 -42 l14 42 l14 -50 l14 50 l12 -36 l12 36 l14 -40 l14 40 l14 -44 l14 44 l12 -34 l14 34 L1600 575 Z" fill="#5d8a63" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <rect x="0" y="565" width="1600" height="40" fill="#e8cf7c"/>
    <path d="M0 580 H1600 M0 594 H1600" stroke="#d7b961" stroke-width="2"/>
    <!-- водонапорная башня вдали -->
    <g><rect x="958" y="470" width="14" height="100" fill="#c9cfd6" stroke="#2b3a4a" stroke-width="3"/><path d="M944 470 h42 l-6 -34 h-30 Z" fill="#e87c5a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M948 436 l17 -14 l17 14 Z" fill="#9aa7b5" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/></g>
    <!-- земля двора -->
    <rect x="0" y="600" width="1600" height="300" fill="#b9c97f"/>
    <path d="M0 600 H1600" stroke="#2b3a4a" stroke-width="3"/>
    <!-- дальний забор-штакетник -->
    <g fill="#e9d2a8" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round">
      <rect x="905" y="596" width="695" height="8" rx="3"/>
      <path d="M1000 630 v-56 l7 -8 l7 8 v56 Z M1340 630 v-56 l7 -8 l7 8 v56 Z M1410 630 v-56 l7 -8 l7 8 v56 Z"/>
    </g>
    <!-- голые деревья (ветки без листьев, пара жёлтых листиков) -->
    <g fill="none" stroke="#6b4a33" stroke-linecap="round">
      <path d="M1250 600 V300" stroke-width="12"/>
      <path d="M1250 420 L1200 360 M1250 380 L1300 320 M1250 340 L1220 280 M1200 360 l-24 -20 M1300 320 l20 -26 M1250 470 l46 -40" stroke-width="7"/>
      <path d="M1530 610 V380" stroke-width="10"/>
      <path d="M1530 470 L1490 420 M1530 430 L1570 380 M1530 400 L1510 350 M1490 420 l-20 -10" stroke-width="6"/>
    </g>
    <g fill="#ffb627" stroke="#2b3a4a" stroke-width="2"><ellipse cx="1302" cy="318" rx="7" ry="5"/><ellipse cx="1176" cy="342" rx="7" ry="5"/><ellipse cx="1572" cy="378" rx="7" ry="5"/></g>

    <!-- ДОМ В РАЗРЕЗЕ -->
    <!-- фундамент -->
    <rect x="48" y="688" width="864" height="36" rx="4" fill="#9aa3ad" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <!-- комната с кухней (обои в полоску) -->
    <rect x="84" y="410" width="500" height="270" fill="#fff0d2"/>
    <path d="M124 410 V680 M164 410 V680 M204 410 V680 M244 410 V680 M284 410 V680 M324 410 V680 M364 410 V680 M404 410 V680 M444 410 V680 M484 410 V680 M524 410 V680 M564 410 V680" stroke="#fbe2b6" stroke-width="10"/>
    <!-- котельная (плитка) -->
    <rect x="600" y="410" width="278" height="270" fill="#e3e9ef"/>
    <path d="M600 450 H878 M600 490 H878 M600 530 H878 M600 570 H878 M600 610 H878 M600 650 H878 M640 410 V680 M680 410 V680 M720 410 V680 M760 410 V680 M800 410 V680 M840 410 V680" stroke="#cfd8e1" stroke-width="2"/>
    <!-- стены в разрезе (кирпич), перегородка -->
    <rect x="60" y="396" width="24" height="294" fill="#d98e64" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <rect x="876" y="396" width="24" height="294" fill="#d98e64" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M60 430 h24 M60 470 h24 M60 510 h24 M60 550 h24 M60 590 h24 M60 630 h24 M60 670 h24 M876 430 h24 M876 470 h24 M876 510 h24 M876 550 h24 M876 590 h24 M876 630 h24 M876 670 h24" stroke="#b86f49" stroke-width="2"/>
    <rect x="584" y="410" width="16" height="270" fill="#f2d3b5" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <!-- пол -->
    <rect x="84" y="676" width="792" height="14" fill="#c98f5a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <!-- коврик -->
    <ellipse cx="380" cy="682" rx="70" ry="7" fill="#ff8c69" stroke="#2b3a4a" stroke-width="2"/>
    <!-- чердак: тёмная деревянная обшивка, стропила -->
    <path d="M64 396 L480 172 L896 396 Z" fill="#8a6a4c"/>
    <path d="M200 396 L480 230 L760 396 M330 396 L480 300 L630 396 M480 172 V396" fill="none" stroke="#6e5139" stroke-width="6"/>
    <!-- перекрытие (потолок комнат = пол чердака) -->
    <rect x="58" y="394" width="844" height="16" fill="#c8a06e" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <!-- крыша (профнастил) -->
    <path d="M14 404 L480 136 L946 404 L898 404 L480 172 L62 404 Z" fill="#c8553d" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M110 362 L480 152 M220 300 L480 154 M740 300 L480 154 M850 362 L480 152" stroke="#e07a5f" stroke-width="3"/>
    <!-- нижняя часть печной трубы (в котельной) -->
    <rect x="742" y="410" width="36" height="128" fill="#c4633f" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M742 430 h36 M742 450 h36 M742 470 h36 M742 490 h36 M742 510 h36 M760 410 v20 M752 430 v20 M768 450 v20 M760 470 v20 M752 490 v20 M768 510 v20" stroke="#9e4a2c" stroke-width="2"/>
    <!-- трубы отопления: подача (с оранжевыми полосками) и обратка -->
    <path d="M632 572 H612 V420 H292 V616 H282" fill="none" stroke="#2b3a4a" stroke-width="11" stroke-linejoin="round"/>
    <path d="M632 572 H612 V420 H292 V616 H282" fill="none" stroke="#f08a5d" stroke-width="5" stroke-linejoin="round"/>
    <path d="M282 660 H300 V668 H612 V664 H632" fill="none" stroke="#2b3a4a" stroke-width="11" stroke-linejoin="round"/>
    <path d="M282 660 H300 V668 H612 V664 H632" fill="none" stroke="#7fb2e5" stroke-width="5" stroke-linejoin="round"/>
    <!-- кухонная полка с банками -->
    <rect x="320" y="452" width="110" height="8" rx="3" fill="#c98f5a" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="330" y="426" width="22" height="26" rx="5" fill="#ffd166" stroke="#2b3a4a" stroke-width="3"/><rect x="360" y="432" width="20" height="20" rx="5" fill="#ff8c69" stroke="#2b3a4a" stroke-width="3"/><rect x="388" y="424" width="24" height="28" rx="5" fill="#9ad97a" stroke="#2b3a4a" stroke-width="3"/>
    <!-- корзина с дровами у котла -->
    <g><path d="M790 642 h70 l-6 36 h-58 Z" fill="#b07a4a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="806" cy="636" r="9" fill="#e7c08d" stroke="#2b3a4a" stroke-width="3"/><circle cx="826" cy="632" r="9" fill="#e7c08d" stroke="#2b3a4a" stroke-width="3"/><circle cx="846" cy="636" r="9" fill="#e7c08d" stroke="#2b3a4a" stroke-width="3"/></g>
    <!-- подросток-энергоменеджер с планшетом -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <rect x="362" y="622" width="14" height="50" rx="5" fill="#3d5a80"/><rect x="384" y="622" width="14" height="50" rx="5" fill="#3d5a80"/>
      <path d="M356 672 h22 v6 h-24 Z M382 672 h22 v6 h-22 Z" fill="#ffffff"/>
      <path d="M352 562 q28 -14 56 0 l4 66 h-64 Z" fill="#4fb3a9"/>
      <path d="M356 572 q-16 26 -2 44" fill="none" stroke-width="10"/><path d="M356 572 q-16 26 -2 44" fill="none" stroke="#4fb3a9" stroke-width="5"/>
      <rect x="396" y="580" width="28" height="36" rx="4" fill="#ffffff" transform="rotate(10 410 598)"/>
      <path d="M402 590 h14 M402 598 h14 M402 606 h10" stroke="#7fb2e5" stroke-width="2" transform="rotate(10 410 598)"/>
      <circle cx="380" cy="534" r="22" fill="#f2c29b"/>
      <path d="M358 532 q0 -28 24 -28 q22 0 22 24 q-10 -10 -26 -8 q-10 2 -20 12 Z" fill="#7a4b2a"/>
      <circle cx="374" cy="538" r="2.5" fill="#2b3a4a" stroke="none"/><circle cx="388" cy="538" r="2.5" fill="#2b3a4a" stroke="none"/>
      <path d="M375 547 q6 5 12 0" fill="none" stroke-width="2.5"/>
    </g>

    <!-- САРАЙ (стены, крыша, водосток к бочке) -->
    <rect x="1100" y="436" width="230" height="270" fill="#c99a68"/>
    <path d="M1130 436 V706 M1160 436 V706 M1190 436 V706 M1220 436 V706 M1250 436 V706 M1280 436 V706 M1310 436 V706" stroke="#b5875a" stroke-width="3"/>
    <rect x="1094" y="436" width="12" height="270" fill="#8a5a3a" stroke="#2b3a4a" stroke-width="3"/><rect x="1324" y="436" width="12" height="270" fill="#8a5a3a" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1094" y="700" width="242" height="8" fill="#8a5a3a" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1100 436 L1215 376 L1330 436 Z" fill="#a37650" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M1076 442 L1215 360 L1354 442 L1336 442 L1215 374 L1094 442 Z" fill="#7a8b99" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <!-- лопата на стене сарая -->
    <path d="M1206 520 V640" stroke="#8a5a3a" stroke-width="6" stroke-linecap="round"/><path d="M1196 640 h20 l-2 30 q-8 8 -16 0 Z" fill="#9aa7b5" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <!-- полка с банками -->
    <rect x="1240" y="520" width="80" height="7" rx="3" fill="#8a5a3a" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1250" y="498" width="18" height="22" rx="4" fill="#ff8c69" stroke="#2b3a4a" stroke-width="3"/><rect x="1276" y="502" width="16" height="18" rx="4" fill="#ffd166" stroke="#2b3a4a" stroke-width="3"/><rect x="1298" y="496" width="16" height="24" rx="4" fill="#9ad97a" stroke="#2b3a4a" stroke-width="3"/>
    <!-- водосток с крыши сарая -->
    <path d="M1340 444 h28 v170" fill="none" stroke="#2b3a4a" stroke-width="12" stroke-linejoin="round"/>
    <path d="M1340 444 h28 v170" fill="none" stroke="#b3bcc6" stroke-width="6" stroke-linejoin="round"/>

    <!-- ПЕРЕДНИЙ ПЛАН: дорожка, урожай, огород -->
    <path d="M220 900 C300 820 420 790 560 780 C700 772 820 790 900 760 L930 772 C840 812 720 800 590 808 C450 818 340 850 300 900 Z" fill="#e2c89a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <!-- тачка с тыквами и картошкой -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <path d="M600 846 L720 846 L736 806 L590 806 Z" fill="#6fa8dc"/>
      <path d="M736 806 L790 790 M720 846 L780 818" fill="none" stroke-width="5" stroke-linecap="round"/>
      <circle cx="618" cy="860" r="16" fill="#5a6b7d"/><circle cx="618" cy="860" r="5" fill="#d5dde6"/>
      <ellipse cx="636" cy="796" rx="26" ry="20" fill="#ff9f43"/><path d="M636 778 v-8" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="684" cy="798" rx="20" ry="16" fill="#ffb35c"/><path d="M684 784 v-7" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="712" cy="804" rx="9" ry="7" fill="#c9a26b"/><ellipse cx="660" cy="808" rx="9" ry="7" fill="#c9a26b"/>
    </g>
    <ellipse cx="470" cy="842" rx="34" ry="24" fill="#ff9f43" stroke="#2b3a4a" stroke-width="3"/><path d="M458 822 q12 20 0 40 M482 822 q-12 20 0 40" fill="none" stroke="#e07a2a" stroke-width="3"/><path d="M470 818 l4 -12" stroke="#2b3a4a" stroke-width="4" stroke-linecap="round"/>
    <!-- грядки после уборки урожая, кочаны капусты -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <path d="M1350 760 h240 l-6 22 h-228 Z M1350 800 h240 l-6 22 h-228 Z M1350 840 h240 l-6 22 h-228 Z" fill="#8a6446"/>
      <circle cx="1390" cy="756" r="14" fill="#9fd88a"/><circle cx="1450" cy="756" r="14" fill="#9fd88a"/><circle cx="1510" cy="756" r="14" fill="#9fd88a"/><circle cx="1570" cy="756" r="14" fill="#9fd88a"/>
      <circle cx="1420" cy="836" r="14" fill="#9fd88a"/><circle cx="1540" cy="836" r="14" fill="#9fd88a"/>
    </g>
    <path d="M1384 756 q6 -8 12 0 M1444 756 q6 -8 12 0 M1504 756 q6 -8 12 0 M1564 756 q6 -8 12 0 M1414 836 q6 -8 12 0 M1534 836 q6 -8 12 0" fill="none" stroke="#5aa04a" stroke-width="3"/>
    <!-- опавшие листья -->
    <g fill="#ffb627" stroke="#c97a1a" stroke-width="2"><ellipse cx="260" cy="770" rx="8" ry="5" transform="rotate(20 260 770)"/><ellipse cx="380" cy="760" rx="8" ry="5"/><ellipse cx="820" cy="860" rx="8" ry="5" transform="rotate(-30 820 860)"/><ellipse cx="560" cy="880" rx="8" ry="5"/><ellipse cx="1120" cy="890" rx="8" ry="5"/><ellipse cx="1000" cy="640" rx="8" ry="5"/><ellipse cx="1430" cy="884" rx="8" ry="5"/><ellipse cx="240" cy="880" rx="8" ry="5" transform="rotate(40 240 880)"/></g>
    <g fill="#ff8c3a" stroke="#c9601a" stroke-width="2"><ellipse cx="320" cy="790" rx="7" ry="4"/><ellipse cx="760" cy="880" rx="7" ry="4" transform="rotate(30 760 880)"/><ellipse cx="1080" cy="650" rx="7" ry="4"/><ellipse cx="900" cy="880" rx="7" ry="4"/></g>
  </g>

  <!-- ===== obj-agro-attic: чердак над комнатами ===== -->
  <g id="obj-agro-attic" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- голые доски: щели в перекрытии -->
      <path d="M150 400 h30 M260 400 h40 M380 400 h30 M520 400 h40 M650 400 h30 M790 400 h30" stroke="#5a3e2a" stroke-width="4" stroke-linecap="round"/>
      <!-- волны тепла поднимаются через чердак -->
      <g fill="none" stroke="#ff7b2e" stroke-width="5" stroke-linecap="round">
        <path d="M230 388 q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16"/><path d="M340 388 q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16"/><path d="M450 388 q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16"/><path d="M560 388 q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16"/><path d="M670 388 q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16"/>
        <animateTransform attributeName="transform" type="translate" values="0 10;0 -40" dur="2.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite"/>
      </g>
      <g fill="none" stroke="#ff9a3c" stroke-width="5" stroke-linecap="round">
        <path d="M285 360 q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16"/><path d="M395 330 q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16"/><path d="M505 320 q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16"/><path d="M615 350 q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16"/>
        <animateTransform attributeName="transform" type="translate" values="0 10;0 -40" dur="2.2s" begin="1.1s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="1.1s" repeatCount="indefinite"/>
      </g>
      <!-- тепло уходит сквозь крышу наружу -->
      <g fill="none" stroke="#ff7b2e" stroke-width="5" stroke-linecap="round">
        <path d="M300 228 q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16"/><path d="M400 172 q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16"/><path d="M560 172 q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16"/><path d="M660 228 q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16"/><path d="M200 284 q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16"/>
        <animateTransform attributeName="transform" type="translate" values="0 6;0 -24" dur="2.2s" begin="0.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="0.6s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- толстый слой утеплителя (минвата) по всему перекрытию -->
      <g clip-path="url(#ag-attic-clip)">
        <rect x="60" y="358" width="840" height="38" fill="#ffd66b" stroke="#2b3a4a" stroke-width="3"/>
        <path d="M60 366 q15 -8 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" fill="none" stroke="#e8b440" stroke-width="3"/>
        <path d="M60 382 q15 -8 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" fill="none" stroke="#e8b440" stroke-width="3"/>
        <path d="M160 358 v38 M300 358 v38 M440 358 v38 M580 358 v38 M720 358 v38" stroke="#d99a2b" stroke-width="3"/>
      </g>
    </g>
    <rect class="obj-hit" x="180" y="206" width="548" height="186" rx="12" fill="transparent"/>
  </g>

  <!-- верхняя часть печной трубы (сквозь чердак и крышу), поверх чердака -->
  <g pointer-events="none">
    <rect x="742" y="232" width="36" height="164" fill="#c4633f" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M742 252 h36 M742 272 h36 M742 292 h36 M742 312 h36 M742 332 h36 M742 352 h36 M742 372 h36 M760 232 v20 M752 252 v20 M768 272 v20 M760 292 v20 M752 312 v20 M768 332 v20 M760 352 v20 M752 372 v20" stroke="#9e4a2c" stroke-width="2"/>
    <rect x="734" y="222" width="52" height="14" rx="3" fill="#9aa3ad" stroke="#2b3a4a" stroke-width="3"/>
  </g>

  <!-- ===== obj-agro-boiler: твердотопливный котёл в котельной и форточка ===== -->
  <g id="obj-agro-boiler" class="obj" data-state="problem">
    <!-- всегда: окно котельной -->
    <rect x="794" y="446" width="68" height="78" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <rect x="800" y="452" width="56" height="66" rx="3" fill="#cfe9fb"/>
    <path d="M828 452 V518 M800 484 H856" stroke="#ffffff" stroke-width="4"/>
    <!-- всегда: дымоход от котла к трубе -->
    <path d="M700 532 V500 H742" fill="none" stroke="#2b3a4a" stroke-width="16" stroke-linejoin="round"/>
    <path d="M700 532 V500 H742" fill="none" stroke="#9aa7b5" stroke-width="9" stroke-linejoin="round"/>
    <!-- всегда: корпус котла -->
    <rect x="630" y="528" width="104" height="146" rx="12" fill="#6f95c9" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <rect x="640" y="666" width="14" height="12" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3"/><rect x="710" y="666" width="14" height="12" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3"/>
    <!-- шкала температуры: справа — зона перегрева со значком-пламенем -->
    <circle cx="682" cy="560" r="20" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M667 566 A16 16 0 0 1 673 547" fill="none" stroke="#7fb2e5" stroke-width="4"/>
    <path d="M691 547 A16 16 0 0 1 697 566" fill="none" stroke="#ff7b2e" stroke-width="4"/>
    <path d="M714 548 q-6 -6 -2 -14 q2 6 6 6 q4 6 -4 8 Z" fill="#ff7b2e" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
    <!-- дверца топки со стеклом -->
    <rect x="648" y="596" width="68" height="56" rx="7" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <rect x="658" y="604" width="48" height="34" rx="4" fill="#3a2a2a"/>
    <rect x="708" y="618" width="12" height="8" rx="3" fill="#d5dde6" stroke="#2b3a4a" stroke-width="2"/>
    <g class="v-problem">
      <!-- огонь гудит на максимум, стекло светится -->
      <circle cx="682" cy="622" r="56" fill="url(#ag-hot)"><animate attributeName="r" values="46;60;46" dur="1.2s" repeatCount="indefinite"/></circle>
      <g>
        <path d="M664 638 C656 626 664 612 670 606 C672 616 678 618 680 610 C686 620 692 608 694 604 C702 616 702 630 698 638 Z" fill="#ffb627" stroke="#ff7b2e" stroke-width="2"/>
        <path d="M672 638 C668 630 674 622 678 618 C680 626 686 626 688 620 C694 628 692 634 690 638 Z" fill="#fff3a0"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="0.5s" repeatCount="indefinite"/>
      </g>
      <!-- стрелка шкалы — на максимуме -->
      <path d="M682 560 L698 552" stroke="#2b3a4a" stroke-width="4" stroke-linecap="round"/><circle cx="682" cy="560" r="3" fill="#2b3a4a"/>
      <!-- жар волнами по котельной -->
      <g fill="none" stroke="#ff7b2e" stroke-width="4" stroke-linecap="round">
        <path d="M646 520 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M720 520 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M660 596 q7 -7 0 -14 q-7 -7 0 -14"/><path d="M846 620 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/>
        <animateTransform attributeName="transform" type="translate" values="0 6;0 -14" dur="1.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.2;1;0.2" dur="1.8s" repeatCount="indefinite"/>
      </g>
      <!-- форточка распахнута: тепло уходит на улицу -->
      <path d="M800 452 h26 v32 h-26 Z" fill="#3e6a8f"/>
      <path d="M800 452 L780 444 L780 478 L800 484 Z" fill="#cfe9fb" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <g fill="none" stroke="#ff7b2e" stroke-width="4" stroke-linecap="round">
        <path d="M806 478 q8 -6 16 0 t16 0"/><path d="M810 466 q8 -6 16 0 t16 0"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;-8 -18" dur="1.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0" dur="1.6s" repeatCount="indefinite"/>
      </g>
      <!-- из трубы валит густой дым с искрами -->
      <g fill="#8d99a6" stroke="#5a6b7d" stroke-width="2">
        <circle cx="760" cy="200" r="16"/><circle cx="776" cy="176" r="20"/><circle cx="796" cy="146" r="24"/>
        <animateTransform attributeName="transform" type="translate" values="0 6;8 -10;0 6" dur="2s" repeatCount="indefinite"/>
      </g>
      <g fill="#ffb627"><circle cx="752" cy="196" r="3"/><circle cx="790" cy="180" r="3"/><circle cx="770" cy="160" r="3">
        <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite"/></circle></g>
    </g>
    <g class="v-ok">
      <!-- ровный небольшой огонь -->
      <path d="M672 638 C668 630 674 622 678 618 C680 626 686 626 688 620 C694 628 692 634 690 638 Z" fill="#ffb627" stroke="#ff7b2e" stroke-width="2"/>
      <!-- стрелка — посередине -->
      <path d="M682 560 L682 544" stroke="#2b3a4a" stroke-width="4" stroke-linecap="round"/><circle cx="682" cy="560" r="3" fill="#2b3a4a"/>
      <!-- комнатный регулятор котла на стене (круглая ручка и галочка) -->
      <rect x="612" y="456" width="30" height="40" rx="6" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
      <circle cx="627" cy="472" r="8" fill="#d5dde6" stroke="#2b3a4a" stroke-width="2"/><path d="M627 472 v-6" stroke="#2b3a4a" stroke-width="2" stroke-linecap="round"/>
      <path d="M620 487 l4 4 l9 -8" fill="none" stroke="#2b3a4a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M627 496 V528" stroke="#2b3a4a" stroke-width="2"/>
      <!-- форточка закрыта -->
      <rect x="800" y="452" width="26" height="32" fill="none" stroke="#2b3a4a" stroke-width="2"/>
      <!-- лёгкий дымок из трубы -->
      <g fill="#e6ecf2" stroke="#c2ccd6" stroke-width="2"><circle cx="764" cy="204" r="9"/><circle cx="774" cy="188" r="11"/></g>
    </g>
    <rect class="obj-hit" x="604" y="418" width="268" height="268" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-agro-window: окно в комнате ===== -->
  <g id="obj-agro-window" class="obj" data-state="problem">
    <!-- всегда: рама, вид за окном (голая ветка, жёлтый лист), подоконник -->
    <rect x="140" y="444" width="140" height="130" rx="6" fill="#ffffff" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <rect x="150" y="454" width="120" height="110" rx="3" fill="#cfe9fb"/>
    <path d="M150 520 q40 -10 60 -40 M190 508 l16 -6 M232 470 l38 -8" fill="none" stroke="#8a6446" stroke-width="4" stroke-linecap="round"/>
    <path d="M150 548 h120" stroke="#e8cf7c" stroke-width="12"/>
    <path d="M210 454 V564 M150 506 H270" stroke="#ffffff" stroke-width="6"/>
    <rect x="130" y="572" width="160" height="12" rx="4" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <!-- карниз -->
    <rect x="124" y="430" width="172" height="8" rx="3" fill="#c98f5a" stroke="#2b3a4a" stroke-width="3"/>
    <g class="v-problem">
      <!-- щели вокруг рамы -->
      <path d="M144 470 v26 M144 520 v30 M276 462 v30 M276 524 v26 M160 448 h30 M230 448 h30 M168 570 h26 M230 570 h24" stroke="#2b3a4a" stroke-width="5" stroke-linecap="round" stroke-dasharray="8 6"/>
      <!-- занавеска колышется от сквозняка -->
      <g>
        <path d="M128 438 h30 q6 50 -4 90 q-8 40 4 60 h-26 Z" fill="#ff8c69" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
        <animateTransform attributeName="transform" type="rotate" values="0 140 438;8 140 438;0 140 438" dur="1.4s" repeatCount="indefinite"/>
      </g>
      <!-- холодный воздух дует в комнату -->
      <g fill="none" stroke="#4a90d9" stroke-width="5" stroke-linecap="round">
        <path d="M262 476 q20 -10 36 0 t30 0"/><path d="M262 540 q20 -10 36 0 t30 0"/><path d="M200 576 q14 10 30 4"/>
        <animateTransform attributeName="transform" type="translate" values="-10 0;24 6" dur="1.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite"/>
      </g>
      <g>
        <ellipse cx="270" cy="500" rx="8" ry="5" fill="#ffb627" stroke="#2b3a4a" stroke-width="2"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;30 20;0 0" dur="2.4s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- рама обклеена уплотнителем по всему контуру -->
      <rect x="146" y="450" width="128" height="118" rx="4" fill="none" stroke="#5a6b7d" stroke-width="5"/>
      <path d="M146 466 h0 M146 486 h0 M146 506 h0 M146 526 h0 M146 546 h0 M274 466 h0 M274 486 h0 M274 506 h0 M274 526 h0 M274 546 h0" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <path d="M128 438 h30 q4 50 0 90 q-4 40 0 60 h-30 Z" fill="#ff8c69" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    </g>
    <rect class="obj-hit" x="112" y="424" width="194" height="166" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-agro-radiator: батарея под окном ===== -->
  <g id="obj-agro-radiator" class="obj" data-state="problem">
    <!-- всегда: настенный термометр -->
    <rect x="94" y="596" width="16" height="72" rx="8" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <circle cx="102" cy="664" r="9" fill="#ff7b2e" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M110 612 h5 M110 628 h5 M110 644 h5" stroke="#2b3a4a" stroke-width="2"/>
    <!-- всегда: секции батареи -->
    <rect x="144" y="604" width="134" height="62" rx="9" fill="#f4f7fb" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M166 608 V662 M188 608 V662 M210 608 V662 M232 608 V662 M254 608 V662" stroke="#c2ccd6" stroke-width="4"/>
    <g class="v-problem">
      <!-- батарея раскалена, сильные волны жара -->
      <rect x="146" y="606" width="130" height="58" rx="8" fill="#ffb38a" opacity="0.55"/>
      <g fill="none" stroke="#ff7b2e" stroke-width="5" stroke-linecap="round">
        <path d="M166 598 q8 -8 0 -16 q-8 -8 0 -16"/><path d="M210 598 q8 -8 0 -16 q-8 -8 0 -16"/><path d="M254 598 q8 -8 0 -16 q-8 -8 0 -16"/>
        <animateTransform attributeName="transform" type="translate" values="0 6;0 -18" dur="1.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.2;1;0.2" dur="1.6s" repeatCount="indefinite"/>
      </g>
      <!-- простой вентиль, открыт до конца -->
      <rect x="274" y="604" width="14" height="14" rx="3" fill="#ff7b2e" stroke="#2b3a4a" stroke-width="3"/>
      <!-- термометр «зашкаливает»: столбик до самого верха -->
      <rect x="99" y="600" width="6" height="64" rx="3" fill="#ff7b2e"/>
      <path d="M96 590 l6 -8 l6 8" fill="none" stroke="#ff7b2e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <g class="v-ok">
      <!-- термоголовка на вентиле -->
      <rect x="272" y="590" width="20" height="30" rx="7" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M276 598 h12 M276 604 h12 M276 610 h12" stroke="#7fb2e5" stroke-width="2"/>
      <!-- термометр — посередине -->
      <rect x="99" y="630" width="6" height="34" rx="3" fill="#ff7b2e"/>
    </g>
    <rect class="obj-hit" x="88" y="592" width="218" height="96" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-agro-waterheater: электрический водонагреватель на кухне ===== -->
  <g id="obj-agro-waterheater" class="obj" data-state="problem">
    <!-- всегда: бак, трубы, мойка с краном -->
    <path d="M492 556 V594 M528 556 V580 H516 V594" fill="none" stroke="#2b3a4a" stroke-width="9"/>
    <path d="M492 556 V594 M528 556 V580 H516 V594" fill="none" stroke="#c2ccd6" stroke-width="4"/>
    <rect x="470" y="438" width="80" height="122" rx="30" fill="#f7f9fb" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="510" cy="482" r="16" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M497 488 A14 14 0 0 1 501 472" fill="none" stroke="#7fb2e5" stroke-width="3"/>
    <path d="M519 472 A14 14 0 0 1 523 488" fill="none" stroke="#ff7b2e" stroke-width="3"/>
    <rect x="452" y="606" width="124" height="70" rx="5" fill="#8fc0ea" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M514 612 V670" stroke="#2b3a4a" stroke-width="2"/><circle cx="506" cy="640" r="3" fill="#2b3a4a"/><circle cx="522" cy="640" r="3" fill="#2b3a4a"/>
    <rect x="446" y="596" width="136" height="12" rx="4" fill="#d5dde6" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M504 596 V584 q0 -8 10 -8 h14 v8" fill="none" stroke="#2b3a4a" stroke-width="7" stroke-linecap="round"/>
    <path d="M504 596 V584 q0 -8 10 -8 h14 v8" fill="none" stroke="#9aa7b5" stroke-width="3" stroke-linecap="round"/>
    <g class="v-problem">
      <!-- стрелка на максимуме, лампочка нагрева мигает -->
      <path d="M510 482 L524 476" stroke="#2b3a4a" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="510" cy="520" r="7" fill="#ff7b2e" stroke="#2b3a4a" stroke-width="2"><animate attributeName="opacity" values="1;0.2;1" dur="0.9s" repeatCount="indefinite"/></circle>
      <path d="M520 512 l6 -4 M522 522 h8 M520 530 l6 4" stroke="#ff7b2e" stroke-width="3" stroke-linecap="round"/>
      <!-- жар вокруг бака и пар из крана -->
      <g fill="none" stroke="#ff7b2e" stroke-width="4" stroke-linecap="round">
        <path d="M462 470 q7 -7 0 -14 q-7 -7 0 -14"/><path d="M560 470 q7 -7 0 -14 q-7 -7 0 -14"/>
        <animateTransform attributeName="transform" type="translate" values="0 6;0 -12" dur="1.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.2;1;0.2" dur="1.6s" repeatCount="indefinite"/>
      </g>
      <g fill="#ffffff" stroke="#c2ccd6" stroke-width="2">
        <circle cx="540" cy="580" r="7"/><circle cx="548" cy="566" r="9"/><circle cx="542" cy="550" r="7"/>
        <animateTransform attributeName="transform" type="translate" values="0 4;4 -10" dur="1.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0" dur="1.4s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- стрелка посередине, значок-листик «эко-режим» -->
      <path d="M510 482 L510 468" stroke="#2b3a4a" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M500 530 q0 -18 22 -18 q0 18 -22 18 Z" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M502 528 l14 -12" stroke="#2b3a4a" stroke-width="2"/>
    </g>
    <circle cx="510" cy="482" r="3" fill="#2b3a4a"/>
    <rect class="obj-hit" x="444" y="420" width="134" height="174" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-agro-woodpile: поленница под навесом (всё в порядке) ===== -->
  <g id="obj-agro-woodpile" class="obj" data-state="problem">
    <rect x="914" y="612" width="8" height="94" fill="#8a5a3a" stroke="#2b3a4a" stroke-width="3"/><rect x="982" y="604" width="8" height="102" fill="#8a5a3a" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M906 616 L998 598 L998 610 L906 628 Z" fill="#7a8b99" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <g fill="#e7c08d" stroke="#2b3a4a" stroke-width="2.5">
      <circle cx="934" cy="694" r="10"/><circle cx="954" cy="694" r="10"/><circle cx="974" cy="694" r="10"/>
      <circle cx="934" cy="674" r="10"/><circle cx="954" cy="674" r="10"/><circle cx="974" cy="674" r="10"/>
      <circle cx="934" cy="654" r="10"/><circle cx="954" cy="654" r="10"/><circle cx="974" cy="654" r="10"/>
      <circle cx="944" cy="636" r="9"/><circle cx="964" cy="634" r="9"/>
    </g>
    <path d="M934 694 m-4 0 a4 4 0 1 0 8 0 M954 674 m-4 0 a4 4 0 1 0 8 0 M974 654 m-4 0 a4 4 0 1 0 8 0" fill="none" stroke="#c9975c" stroke-width="2"/>
    <rect class="obj-hit" x="904" y="592" width="92" height="116" rx="10" fill="transparent"/>
  </g>

  <!-- ===== obj-agro-yard-lamp: фонарь во дворе ===== -->
  <g id="obj-agro-yard-lamp" class="obj" data-state="problem">
    <!-- всегда: столб, кронштейн, плафон -->
    <rect x="1038" y="420" width="12" height="288" rx="5" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1030" y="696" width="28" height="14" rx="5" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1044 430 q0 -20 22 -20 h6" fill="none" stroke="#2b3a4a" stroke-width="10" stroke-linecap="round"/>
    <path d="M1044 430 q0 -20 22 -20 h6" fill="none" stroke="#5a6b7d" stroke-width="5" stroke-linecap="round"/>
    <path d="M1056 426 L1064 410 H1084 L1092 426 Z" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <g class="v-problem">
      <!-- горит при ярком дневном свете -->
      <circle cx="1074" cy="438" r="48" fill="url(#ag-glow)"><animate attributeName="r" values="40;54;40" dur="1.8s" repeatCount="indefinite"/></circle>
      <path d="M1046 444 l-12 6 M1102 444 l12 6 M1058 456 l-6 10 M1090 456 l6 10 M1074 460 v12" stroke="#ffb800" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="1074" cy="430" rx="14" ry="7" fill="#fff3a0" stroke="#2b3a4a" stroke-width="3"/>
    </g>
    <g class="v-ok">
      <!-- выключен; на столбе — датчик освещённости (значок-солнышко) -->
      <ellipse cx="1074" cy="430" rx="14" ry="7" fill="#d5dde6" stroke="#2b3a4a" stroke-width="3"/>
      <rect x="1028" y="470" width="32" height="24" rx="6" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
      <circle cx="1044" cy="482" r="5" fill="#ffd166" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M1044 472 v-4 M1054 482 h4 M1034 482 h-4 M1051 475 l3 -3 M1037 475 l-3 -3" stroke="#2b3a4a" stroke-width="2" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="1000" y="380" width="92" height="330" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-agro-shed-light: лампа под потолком сарая ===== -->
  <g id="obj-agro-shed-light" class="obj" data-state="problem">
    <!-- всегда: провод и патрон -->
    <path d="M1164 440 V496" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1156" y="494" width="16" height="14" rx="3" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3"/>
    <g class="v-problem">
      <!-- горячая лампа накаливания светит в пустом сарае -->
      <circle cx="1164" cy="524" r="46" fill="url(#ag-hot)"><animate attributeName="r" values="38;50;38" dur="1.6s" repeatCount="indefinite"/></circle>
      <path d="M1164 508 c-16 0 -18 14 -12 22 c4 6 4 10 4 12 h16 c0 -2 0 -6 4 -12 c6 -8 4 -22 -12 -22 Z" fill="#ffe08a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M1158 532 l3 -8 l3 8 l3 -8 l3 8" fill="none" stroke="#ff7b2e" stroke-width="2"/>
      <path d="M1130 520 h-10 M1198 520 h10 M1140 546 l-8 8 M1188 546 l8 8" stroke="#ff9a3c" stroke-width="4" stroke-linecap="round"/>
    </g>
    <g class="v-ok">
      <!-- светодиодная лампа выключена; на стене — датчик присутствия -->
      <path d="M1164 508 c-14 0 -16 12 -10 20 c3 5 3 8 3 10 h14 c0 -2 0 -5 3 -10 c6 -8 4 -20 -10 -20 Z" fill="#eef2f6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M1118 470 a10 10 0 0 1 20 0 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="1128" cy="465" r="2.5" fill="#2b3a4a"/>
      <path d="M1142 462 q4 4 0 8 M1147 458 q7 8 0 16" fill="none" stroke="#2b3a4a" stroke-width="2" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="1108" y="446" width="110" height="122" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-agro-freezer: старая морозилка-ларь в сарае ===== -->
  <g id="obj-agro-freezer" class="obj" data-state="problem">
    <!-- всегда: розетка на стене -->
    <rect x="1292" y="570" width="24" height="24" rx="4" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <circle cx="1300" cy="582" r="2.5" fill="#2b3a4a"/><circle cx="1308" cy="582" r="2.5" fill="#2b3a4a"/>
    <!-- всегда: корпус ларя, вырез показывает, что внутри -->
    <rect x="1232" y="606" width="92" height="94" rx="8" fill="#f2f4f7" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <rect x="1228" y="600" width="100" height="14" rx="5" fill="#dfe6ee" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1242" y="622" width="72" height="64" rx="4" fill="#d6ecfa" stroke="#2b3a4a" stroke-width="3"/>
    <g class="v-problem">
      <!-- толстая «шуба» льда и один маленький пакет -->
      <path d="M1244 624 h68 v12 l-6 6 l-6 -6 l-6 8 l-6 -8 l-6 6 l-6 -6 l-6 8 l-6 -8 l-6 6 l-6 -6 l-8 8 Z" fill="#ffffff" stroke="#9cc7e8" stroke-width="2"/>
      <path d="M1244 636 v48 h12 l-4 -10 l6 -8 l-6 -8 l6 -10 l-6 -8 Z M1312 636 v48 h-12 l4 -10 l-6 -8 l6 -8 l-6 -10 l6 -8 Z" fill="#ffffff" stroke="#9cc7e8" stroke-width="2"/>
      <rect x="1270" y="664" width="18" height="18" rx="4" fill="#ff8c69" stroke="#2b3a4a" stroke-width="2"/>
      <!-- шнур в розетке, гудит -->
      <path d="M1324 650 q14 0 10 -40 q-2 -14 -18 -22" fill="none" stroke="#2b3a4a" stroke-width="3"/>
      <rect x="1300" y="580" width="10" height="10" rx="2" fill="#4a5a6b"/>
      <g fill="none" stroke="#5a6b7d" stroke-width="3" stroke-linecap="round">
        <path d="M1222 630 l-6 6 l6 6 l-6 6 M1222 660 l-6 6 l6 6 l-6 6"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;-3 0;0 0" dur="0.25s" repeatCount="indefinite"/>
      </g>
      <path d="M1304 548 l-8 14 h8 l-6 14" fill="none" stroke="#ff9a3c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/></path>
    </g>
    <g class="v-ok">
      <!-- морозилка отключена: внутри чисто, вилка лежит рядом с розеткой -->
      <path d="M1250 676 l12 -12 M1270 670 l16 -16" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <path d="M1324 650 q12 0 10 30 q-2 14 -6 20" fill="none" stroke="#2b3a4a" stroke-width="3"/>
      <rect x="1322" y="690" width="12" height="10" rx="2" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="2"/>
    </g>
    <rect class="obj-hit" x="1222" y="548" width="106" height="156" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-agro-hose: бочка для дождевой воды и теплица ===== -->
  <g id="obj-agro-hose" class="obj" data-state="problem">
    <!-- всегда: бочка под водостоком -->
    <path d="M1346 620 h52 l-3 86 h-46 Z" fill="#5fb38a" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M1347 646 h50 M1348 680 h48" stroke="#2b3a4a" stroke-width="3"/>
    <!-- всегда: кран водопровода на столбике -->
    <rect x="1405" y="646" width="12" height="60" rx="3" fill="#7fb2e5" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1414" y="656" width="12" height="9" rx="2" fill="#9aa7b5" stroke="#2b3a4a" stroke-width="2"/>
    <!-- всегда: теплица (арка из поликарбоната) с грядками -->
    <path d="M1430 706 V570 Q1430 488 1511 488 Q1592 488 1592 570 V706 Z" fill="#e3f4fb" fill-opacity="0.85" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M1470 706 V560 Q1470 500 1511 498 M1552 706 V560 Q1552 500 1511 498 M1511 498 V706 M1432 600 H1590" fill="none" stroke="#a9cfe0" stroke-width="3"/>
    <rect x="1438" y="676" width="146" height="22" rx="4" fill="#8a6446" stroke="#2b3a4a" stroke-width="3"/>
    <g stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round">
      <path d="M1454 676 q-10 -26 4 -40 q8 18 -4 40 Z M1466 676 q10 -30 -2 -44" fill="#7cc96a"/>
      <path d="M1494 676 q-12 -22 2 -34 q10 16 -2 34 Z M1506 676 q12 -26 -2 -38" fill="#7cc96a"/>
      <path d="M1536 676 q-10 -26 4 -40 q8 18 -4 40 Z M1548 676 q10 -30 -2 -44" fill="#7cc96a"/>
      <path d="M1566 676 q-8 -20 4 -30 q8 14 -4 30 Z" fill="#7cc96a"/>
    </g>
    <g class="v-problem">
      <!-- бочка закрыта крышкой и не используется -->
      <rect x="1342" y="612" width="60" height="10" rx="3" fill="#4a8f6c" stroke="#2b3a4a" stroke-width="3"/>
      <!-- кран открыт, шланг тянется в теплицу -->
      <rect x="1424" y="650" width="5" height="20" rx="2" fill="#ff7b2e" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M1420 664 q8 40 40 40 h40 q14 0 14 -14 v-60" fill="none" stroke="#2b3a4a" stroke-width="9" stroke-linecap="round"/>
      <path d="M1420 664 q8 40 40 40 h40 q14 0 14 -14 v-60" fill="none" stroke="#5cbf6a" stroke-width="5" stroke-linecap="round"/>
      <!-- струя бьёт мимо грядок на дорожку -->
      <circle cx="1514" cy="628" r="6" fill="#5cbf6a" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M1514 624 q30 -34 64 14 M1514 624 q-30 -34 -64 10 M1514 622 q4 -30 22 -36" fill="none" stroke="#2b3a4a" stroke-width="7" stroke-linecap="round"/>
      <path d="M1514 624 q30 -34 64 14 M1514 624 q-30 -34 -64 10 M1514 622 q4 -30 22 -36" fill="none" stroke="#6fb6f0" stroke-width="4" stroke-linecap="round"/>
      <path d="M1514 624 q30 -34 64 14 M1514 624 q-30 -34 -64 10" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="4 10"><animate attributeName="stroke-dashoffset" values="0;-28" dur="0.5s" repeatCount="indefinite"/></path>
      <g fill="#4a90d9" stroke="#2b3a4a" stroke-width="1.5">
        <path d="M1578 644 q5 9 0 13 q-5 -4 0 -13 Z M1450 640 q5 9 0 13 q-5 -4 0 -13 Z M1564 654 q5 9 0 13 q-5 -4 0 -13 Z"><animateTransform attributeName="transform" type="translate" values="0 0;0 34" dur="0.9s" repeatCount="indefinite"/></path>
      </g>
      <!-- лужа вытекает из теплицы -->
      <ellipse cx="1500" cy="714" rx="96" ry="9" fill="#7fb2e5" stroke="#2b3a4a" stroke-width="2"><animate attributeName="rx" values="80;100;80" dur="2.4s" repeatCount="indefinite"/></ellipse>
    </g>
    <g class="v-ok">
      <!-- кран закрыт, шланг смотан; из бочки идёт капельный полив, рядом лейка -->
      <rect x="1418" y="656" width="20" height="5" rx="2" fill="#ff7b2e" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M1398 694 h8 q10 0 20 -4 h150" fill="none" stroke="#2b3a4a" stroke-width="3"/>
      <g fill="#4a90d9"><circle cx="1460" cy="694" r="3"/><circle cx="1500" cy="694" r="3"/><circle cx="1540" cy="694" r="3"/></g>
      <circle cx="1398" cy="694" r="4" fill="#9aa7b5" stroke="#2b3a4a" stroke-width="2"/>
      <!-- открытая бочка: видна дождевая вода -->
      <ellipse cx="1372" cy="620" rx="26" ry="6" fill="#7fb2e5" stroke="#2b3a4a" stroke-width="3"/>
      <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <path d="M1452 714 h30 l-4 26 h-22 Z" fill="#ffd166"/>
        <path d="M1482 722 l20 -12" fill="none" stroke-width="5" stroke-linecap="round"/>
        <path d="M1456 714 q12 -14 22 0" fill="none"/>
      </g>
    </g>
    <rect class="obj-hit" x="1338" y="448" width="258" height="268" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-agro-pump: колодец и насос ===== -->
  <g id="obj-agro-pump" class="obj" data-state="problem">
    <!-- всегда: колодец из бетонных колец с деревянной крышкой -->
    <rect x="1040" y="790" width="70" height="66" rx="6" fill="#c9cfd6" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M1040 812 h70 M1040 834 h70" stroke="#9aa3ad" stroke-width="3"/>
    <rect x="1034" y="780" width="82" height="12" rx="4" fill="#b07a4a" stroke="#2b3a4a" stroke-width="3"/>
    <!-- всегда: труба из колодца к насосу -->
    <path d="M1040 820 H1022" stroke="#2b3a4a" stroke-width="9"/><path d="M1040 820 H1022" stroke="#9aa7b5" stroke-width="4"/>
    <!-- всегда: насос на подставке -->
    <rect x="964" y="852" width="62" height="10" rx="3" fill="#8a6446" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="968" y="806" width="56" height="46" rx="8" fill="#4a7fc1" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M978 814 v30 M988 814 v30 M998 814 v30" stroke="#3a6aa5" stroke-width="3"/>
    <circle cx="1012" cy="818" r="7" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
    <!-- всегда: шланг от насоса к дому -->
    <path d="M968 836 H950 Q928 836 926 812 L918 726" fill="none" stroke="#2b3a4a" stroke-width="10" stroke-linecap="round"/>
    <path d="M968 836 H950 Q928 836 926 812 L918 726" fill="none" stroke="#3a3f47" stroke-width="5" stroke-linecap="round"/>
    <g class="v-problem">
      <!-- трещина в шланге: брызжет вода, натекла лужа -->
      <ellipse cx="948" cy="864" rx="34" ry="8" fill="#7fb2e5" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M946 830 l-4 6 l6 2 l-4 6" fill="none" stroke="#ffffff" stroke-width="2"/>
      <g fill="#4a90d9" stroke="#2b3a4a" stroke-width="1.5">
        <path d="M946 818 q6 12 0 17 q-6 -5 0 -17 Z"/><path d="M932 808 q6 12 0 17 q-6 -5 0 -17 Z"/><path d="M960 806 q6 12 0 17 q-6 -5 0 -17 Z"/><path d="M946 796 q5 10 0 14 q-5 -4 0 -14 Z"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -16;0 22" dur="0.9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;1;0" dur="0.9s" repeatCount="indefinite"/>
      </g>
      <!-- насос всё время включается: молния мигает, корпус дрожит -->
      <path d="M1000 776 l-10 16 h10 l-8 16" fill="none" stroke="#ff9a3c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><animate attributeName="opacity" values="1;0.15;1" dur="0.8s" repeatCount="indefinite"/></path>
      <g fill="none" stroke="#5a6b7d" stroke-width="3" stroke-linecap="round">
        <path d="M958 806 l-6 -6 M1034 806 l6 -6 M958 850 l-6 6"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;2 0;0 0" dur="0.2s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- трещина стянута хомутами, сухо -->
      <rect x="938" y="828" width="6" height="16" rx="2" fill="#d5dde6" stroke="#2b3a4a" stroke-width="2"/>
      <rect x="950" y="828" width="6" height="16" rx="2" fill="#d5dde6" stroke="#2b3a4a" stroke-width="2"/>
    </g>
    <rect class="obj-hit" x="910" y="740" width="210" height="142" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-agro-compost: листья и пищевые отходы ===== -->
  <g id="obj-agro-compost" class="obj" data-state="problem">
    <!-- всегда: общий бак для мусора на колёсах -->
    <rect x="1250" y="784" width="60" height="80" rx="6" fill="#7d8a99" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M1262 796 v56 M1280 796 v56 M1298 796 v56" stroke="#5f6b78" stroke-width="3"/>
    <circle cx="1262" cy="866" r="8" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3"/><circle cx="1298" cy="866" r="8" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3"/>
    <g class="v-problem">
      <!-- бак переполнен листьями и очистками, крышка не закрывается -->
      <path d="M1248 784 q8 -26 22 -20 q8 -18 22 -6 q16 -8 20 14 Z" fill="#ffb627" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M1262 770 l10 -6 M1286 762 l6 8" stroke="#c97a1a" stroke-width="3"/>
      <path d="M1288 760 q4 -12 12 -8 q-2 10 -12 8 Z" fill="#ffe08a" stroke="#2b3a4a" stroke-width="2"/>
      <circle cx="1268" cy="766" r="6" fill="#ff8c69" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M1246 782 L1222 748 L1290 740" fill="#7d8a99" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <!-- рядом куча листьев и мешок с листвой -->
      <path d="M1146 866 q10 -40 46 -42 q36 2 46 42 Z" fill="#ff9f43" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <g fill="#ffb627" stroke="#c97a1a" stroke-width="2"><ellipse cx="1172" cy="846" rx="8" ry="5"/><ellipse cx="1196" cy="836" rx="8" ry="5"/><ellipse cx="1214" cy="852" rx="8" ry="5"/><ellipse cx="1190" cy="858" rx="8" ry="5"/></g>
      <path d="M1210 866 q-6 -36 14 -42 l8 -8 l6 8 q14 10 6 42 Z" fill="#3a3f47" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <!-- мухи кружат -->
      <g fill="#2b3a4a">
        <circle cx="1280" cy="736" r="3"/><circle cx="1300" cy="724" r="3"/><circle cx="1262" cy="728" r="3"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;8 -6;-6 4;0 0" dur="1.2s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- компостный ящик из досок: слои листьев, очисток и земли, росток -->
      <rect x="1150" y="786" width="88" height="80" fill="#a8774c" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M1152 806 h84" stroke="#ff9f43" stroke-width="10"/><path d="M1152 822 h84" stroke="#9ad97a" stroke-width="8"/><path d="M1152 838 h84" stroke="#6b4a33" stroke-width="10"/>
      <path d="M1150 798 h88 M1150 828 h88 M1150 856 h88" stroke="#2b3a4a" stroke-width="3"/>
      <rect x="1146" y="780" width="8" height="90" fill="#8a5a3a" stroke="#2b3a4a" stroke-width="3"/><rect x="1234" y="780" width="8" height="90" fill="#8a5a3a" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M1194 786 v-16 M1194 776 q-10 -8 -14 0 q8 4 14 0 M1194 772 q10 -10 16 -2 q-8 6 -16 2" fill="#7cc96a" stroke="#2b3a4a" stroke-width="2"/>
      <!-- бак закрыт -->
      <path d="M1246 784 h68" stroke="#2b3a4a" stroke-width="8" stroke-linecap="round"/><path d="M1246 784 h68" stroke="#7d8a99" stroke-width="4" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="1134" y="722" width="194" height="160" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-agro-dog: будка с собакой (всё в порядке) ===== -->
  <g id="obj-agro-dog" class="obj" data-state="problem">
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <!-- будка -->
      <rect x="56" y="790" width="96" height="70" fill="#d9a066"/>
      <path d="M46 794 L104 748 L162 794 Z" fill="#c8553d" stroke-width="4"/>
      <path d="M86 860 v-32 q18 -22 36 0 v32 Z" fill="#5a3e2a"/>
      <path d="M60 812 h40 M60 836 h22 M126 812 h22 M126 836 h22" stroke="#b07a4a" stroke-width="2"/>
      <!-- собака лежит у будки -->
      <ellipse cx="170" cy="852" rx="36" ry="16" fill="#f4c27a"/>
      <circle cx="198" cy="828" r="16" fill="#f4c27a"/>
      <path d="M188 816 q-8 -4 -8 12 q6 0 10 -6 Z" fill="#a8774c"/>
      <ellipse cx="212" cy="834" rx="7" ry="5" fill="#f4c27a"/>
      <circle cx="217" cy="832" r="3" fill="#2b3a4a" stroke="none"/>
      <circle cx="202" cy="824" r="2.5" fill="#2b3a4a" stroke="none"/>
      <path d="M134 850 q-14 -6 -14 -20" fill="none" stroke-width="5"/>
      <path d="M156 866 h14 M182 866 h14" stroke-width="4"/>
      <!-- миска -->
      <path d="M210 862 h26 l-4 10 h-18 Z" fill="#ff8c69"/>
    </g>
    <rect class="obj-hit" x="40" y="740" width="204" height="140" rx="12" fill="transparent"/>
  </g>
</svg>`;
