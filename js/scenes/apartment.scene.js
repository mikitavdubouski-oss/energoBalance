/*
  apartment.scene.js — SVG-сцена квартиры (гостиная, кухня, ванная).

  Что здесь: одна большая строка с SVG-картинкой. Её вставляет в страницу движок
  уровня «Квартира» (EB.scenes.apartment). Слов в картинке нет — все тексты
  берутся из texts.*.js, потому что игра двуязычная.

  Как устроены интерактивные объекты:
    <g id="obj-ИМЯ" class="obj" data-state="problem"> ... </g>
      - обычные фигуры — видны всегда (корпус прибора и т.п.);
      - <g class="v-problem"> — как объект выглядит, пока проблема не решена;
      - <g class="v-ok">      — как объект выглядит, когда всё в порядке;
      - последний ребёнок — прозрачный прямоугольник obj-hit (зона клика).
    Движок переключает data-state между "problem" и "ok", а CSS прячет лишнее.
    Анимации (<animate>) — только внутри v-problem.

  Как менять:
    - координаты сцены: viewBox 0 0 1600 900; пол начинается с y = 700;
    - гостиная x 0–760, кухня x 784–1230, ванная x 1254–1600;
    - зоны клика (obj-hit) разных объектов НЕ должны пересекаться;
    - id градиентов/обрезок начинаются с «ap-», чтобы не спорить с другими сценами;
    - в строке нельзя использовать обратные кавычки и знак доллара с фигурной скобкой.

  Список объектов:
    obj-charger     — розетка с зарядкой (гостиная, слева вверху)
    obj-computer    — стол с монитором и системным блоком (гостиная, слева)
    obj-window      — большое окно гостиной (щель и сквозняк / уплотнитель)
    obj-radiator    — батарея под окном с термоголовкой
    obj-floorlamp   — торшер у дивана (лампа накаливания / светодиодная)
    obj-chandelier  — люстра под потолком гостиной
    obj-tv          — телевизор на тумбе и удлинитель (режим ожидания)
    obj-tap-kitchen — кухонный кран (капает)
    obj-kettle      — электрочайник (налит до краёв / одна чашка)
    obj-fridge      — холодильник (дверь приоткрыта)
    obj-tap-bath    — кран раковины в ванной (течёт струя)
    obj-boiler      — водонагреватель со шкалой (стрелка на максимуме)
    obj-washer      — стиральная машина (почти пустой барабан / полная загрузка)
*/

EB.scenes = EB.scenes || {};

EB.scenes.apartment = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" class="scene-svg">
<defs>
  <!-- Небо за окном -->
  <linearGradient id="ap-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#6ec3f5"/>
    <stop offset="1" stop-color="#d4f0ff"/>
  </linearGradient>
  <!-- Тёплое свечение обычной лампы -->
  <radialGradient id="ap-glow">
    <stop offset="0" stop-color="#fff6b0" stop-opacity="0.95"/>
    <stop offset="0.5" stop-color="#ffd166" stop-opacity="0.45"/>
    <stop offset="1" stop-color="#ffd166" stop-opacity="0"/>
  </radialGradient>
  <!-- Горячее оранжевое свечение лампы накаливания -->
  <radialGradient id="ap-glow-hot">
    <stop offset="0" stop-color="#ffe08a" stop-opacity="0.95"/>
    <stop offset="0.5" stop-color="#ff9f43" stop-opacity="0.5"/>
    <stop offset="1" stop-color="#ff8c69" stop-opacity="0"/>
  </radialGradient>
  <!-- Холодное голубоватое свечение (монитор, холодильник) -->
  <radialGradient id="ap-glow-cool">
    <stop offset="0" stop-color="#e6f7ff" stop-opacity="0.9"/>
    <stop offset="1" stop-color="#8fd3ff" stop-opacity="0"/>
  </radialGradient>
  <!-- Разноцветная заставка монитора -->
  <linearGradient id="ap-screen" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#b9a6ff"/>
    <stop offset="0.5" stop-color="#8fd3ff"/>
    <stop offset="1" stop-color="#7ad9b5"/>
  </linearGradient>
  <!-- Обои гостиной: мягкие полоски -->
  <pattern id="ap-wallpaper" width="40" height="40" patternUnits="userSpaceOnUse">
    <rect width="40" height="40" fill="#fff1d6"/>
    <rect x="0" width="14" height="40" fill="#ffe9c2"/>
  </pattern>
  <!-- Плитка-фартук на кухне -->
  <pattern id="ap-tile-kitchen" width="30" height="30" patternUnits="userSpaceOnUse">
    <rect width="30" height="30" fill="#ffffff" stroke="#bfe3d4" stroke-width="2"/>
  </pattern>
  <!-- Плитка на стене ванной -->
  <pattern id="ap-tile-bath" width="44" height="44" patternUnits="userSpaceOnUse">
    <rect width="44" height="44" fill="#e2f0ff" stroke="#c4dcf5" stroke-width="2"/>
  </pattern>
  <!-- Шахматная плитка пола на кухне -->
  <pattern id="ap-checker" width="60" height="60" patternUnits="userSpaceOnUse">
    <rect width="60" height="60" fill="#f4f7fb"/>
    <rect width="30" height="30" fill="#cfe9df"/>
    <rect x="30" y="30" width="30" height="30" fill="#cfe9df"/>
  </pattern>
  <!-- Плитка пола в ванной -->
  <pattern id="ap-tile-floor" width="50" height="50" patternUnits="userSpaceOnUse">
    <rect width="50" height="50" fill="#d6e6fa" stroke="#b5cbe6" stroke-width="2"/>
  </pattern>
  <!-- Круглое окошко стиральной машины: всё бельё обрезается по нему -->
  <clipPath id="ap-drum">
    <circle cx="1505" cy="636" r="37"/>
  </clipPath>
</defs>

<!-- ===================== ФОН: потолок, стены, пол ===================== -->
<g stroke="none">
  <rect x="0" y="0" width="1600" height="900" fill="#fff1d6"/>
  <!-- Стены трёх комнат -->
  <rect x="0" y="30" width="772" height="670" fill="url(#ap-wallpaper)"/>
  <rect x="772" y="30" width="470" height="670" fill="#e4f6ee"/>
  <rect x="1242" y="30" width="358" height="670" fill="url(#ap-tile-bath)"/>
  <!-- Потолок -->
  <rect x="0" y="0" width="1600" height="30" fill="#efe4d3"/>
  <!-- Пол: паркет в гостиной, плитка на кухне и в ванной -->
  <rect x="0" y="700" width="772" height="200" fill="#d9a066"/>
  <rect x="772" y="700" width="470" height="200" fill="url(#ap-checker)"/>
  <rect x="1242" y="700" width="358" height="200" fill="url(#ap-tile-floor)"/>
</g>
<g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <!-- Линия потолка -->
  <line x1="0" y1="30" x2="1600" y2="30"/>
  <!-- Доски паркета -->
  <g stroke="#b97f4a" stroke-width="3">
    <line x1="0" y1="745" x2="772" y2="745"/>
    <line x1="0" y1="795" x2="772" y2="795"/>
    <line x1="0" y1="850" x2="772" y2="850"/>
    <line x1="120" y1="704" x2="120" y2="745"/>
    <line x1="420" y1="704" x2="420" y2="745"/>
    <line x1="260" y1="745" x2="260" y2="795"/>
    <line x1="600" y1="745" x2="600" y2="795"/>
    <line x1="80" y1="795" x2="80" y2="850"/>
    <line x1="470" y1="795" x2="470" y2="850"/>
    <line x1="330" y1="850" x2="330" y2="900"/>
    <line x1="690" y1="850" x2="690" y2="900"/>
  </g>
  <!-- Плинтус -->
  <rect x="-4" y="692" width="1608" height="12" fill="#ffffff"/>

  <!-- Перегородки между комнатами: стена над проёмом и наличники двери -->
  <rect x="760" y="30" width="24" height="220" fill="#f3dfc0"/>
  <rect x="756" y="246" width="32" height="12" rx="3" fill="#d9a066"/>
  <rect x="756" y="252" width="9" height="448" fill="#d9a066"/>
  <rect x="779" y="252" width="9" height="448" fill="#d9a066"/>
  <rect x="1230" y="30" width="24" height="220" fill="#d7ece4"/>
  <rect x="1226" y="246" width="32" height="12" rx="3" fill="#d9a066"/>
  <rect x="1226" y="252" width="9" height="448" fill="#d9a066"/>
  <rect x="1249" y="252" width="9" height="448" fill="#d9a066"/>
</g>

<!-- ===================== ГОСТИНАЯ: декор ===================== -->
<g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <!-- Картина с горами -->
  <rect x="500" y="140" width="84" height="70" rx="6" fill="#d9a066"/>
  <rect x="510" y="150" width="64" height="50" fill="#cdeeff"/>
  <path d="M512 198 L532 168 L546 186 L556 174 L572 198 Z" fill="#7ad9b5" stroke-width="3"/>
  <circle cx="560" cy="160" r="6" fill="#ffd166" stroke-width="3"/>

  <!-- Ковёр -->
  <ellipse cx="380" cy="835" rx="210" ry="48" fill="#b9a6ff"/>
  <ellipse cx="380" cy="835" rx="160" ry="32" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="14 10"/>

  <!-- Диван -->
  <rect x="244" y="602" width="236" height="84" rx="22" fill="#ff8c69"/>
  <line x1="362" y1="610" x2="362" y2="672" stroke-width="3"/>
  <rect x="236" y="668" width="252" height="62" rx="16" fill="#ff9f80"/>
  <rect x="222" y="640" width="36" height="104" rx="16" fill="#ff8c69"/>
  <rect x="466" y="640" width="36" height="104" rx="16" fill="#ff8c69"/>
  <rect x="236" y="744" width="12" height="22" rx="3" fill="#8a5a2b"/>
  <rect x="476" y="744" width="12" height="22" rx="3" fill="#8a5a2b"/>
  <!-- Подушка -->
  <path d="M276 632 Q300 620 326 632 Q332 652 326 672 Q300 680 276 672 Q270 652 276 632 Z" fill="#ffd166"/>
</g>

<!-- ===== obj-charger: розетка с зарядкой ===== -->
<g id="obj-charger" class="obj" data-state="problem" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <!-- Полка с книгами -->
  <rect x="40" y="104" width="14" height="46" rx="2" fill="#ff8c69" stroke-width="3"/>
  <rect x="56" y="112" width="14" height="38" rx="2" fill="#8fd3ff" stroke-width="3"/>
  <rect x="72" y="100" width="14" height="50" rx="2" fill="#b9a6ff" stroke-width="3"/>
  <rect x="30" y="150" width="160" height="14" rx="4" fill="#d9a066"/>
  <path d="M52 164 L62 184 M168 164 L158 184" fill="none"/>
  <!-- Розетка на стене -->
  <rect x="80" y="240" width="64" height="64" rx="14" fill="#ffffff"/>
  <circle cx="112" cy="272" r="21" fill="#eef2f6" stroke-width="3"/>
  <circle cx="104" cy="272" r="3.5" fill="#2b3a4a" stroke="none"/>
  <circle cx="120" cy="272" r="3.5" fill="#2b3a4a" stroke="none"/>

  <g class="v-problem">
    <!-- Зарядка торчит в розетке, телефона нет, провод болтается -->
    <circle cx="112" cy="270" r="34" fill="url(#ap-glow-cool)" stroke="none">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
    </circle>
    <rect x="94" y="252" width="36" height="44" rx="7" fill="#ffffff"/>
    <circle cx="112" cy="266" r="4.5" fill="#4aa3df" stroke-width="2">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
    </circle>
    <g>
      <animateTransform attributeName="transform" type="rotate" values="-5 112 296;5 112 296;-5 112 296" dur="3s" repeatCount="indefinite"/>
      <path d="M112 296 C112 330 82 326 86 352 C90 376 122 366 112 384" fill="none" stroke-width="4"/>
      <rect x="104" y="382" width="16" height="10" rx="3" fill="#9aa9b8" stroke-width="3"/>
    </g>
  </g>
  <g class="v-ok">
    <!-- Розетка пустая, зарядка аккуратно лежит на полке -->
    <ellipse cx="116" cy="144" rx="17" ry="6" fill="none" stroke-width="3"/>
    <ellipse cx="116" cy="138" rx="13" ry="5" fill="none" stroke-width="3"/>
    <rect x="140" y="132" width="36" height="18" rx="5" fill="#ffffff" stroke-width="3"/>
    <line x1="140" y1="141" x2="132" y2="141" stroke-width="3"/>
  </g>
  <rect class="obj-hit" x="10" y="90" width="198" height="300" rx="12" fill="transparent" stroke="none"/>
</g>

<!-- ===== obj-computer: стол с монитором и системным блоком ===== -->
<g id="obj-computer" class="obj" data-state="problem" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <!-- Стол -->
  <rect x="25" y="576" width="12" height="122" fill="#c48a52"/>
  <rect x="183" y="576" width="12" height="122" fill="#c48a52"/>
  <rect x="15" y="560" width="190" height="16" rx="4" fill="#d9a066"/>
  <!-- Системный блок под столом -->
  <rect x="138" y="600" width="40" height="96" rx="6" fill="#dfe6ee"/>
  <circle cx="158" cy="618" r="5" fill="#9aa9b8" stroke-width="3"/>
  <line x1="146" y1="640" x2="170" y2="640" stroke-width="3"/>
  <line x1="146" y1="652" x2="170" y2="652" stroke-width="3"/>
  <!-- Монитор: подставка и рамка -->
  <rect x="94" y="536" width="22" height="18" fill="#9aa9b8"/>
  <rect x="76" y="550" width="58" height="10" rx="4" fill="#9aa9b8"/>
  <rect x="38" y="438" width="134" height="102" rx="10" fill="#3a4a5c"/>
  <!-- Мышка -->
  <ellipse cx="178" cy="553" rx="10" ry="6" fill="#ffffff" stroke-width="3"/>
  <!-- Пустой стул, отодвинут от стола -->
  <rect x="58" y="588" width="60" height="58" rx="14" fill="#7ad9b5"/>
  <rect x="48" y="646" width="80" height="16" rx="7" fill="#7ad9b5"/>
  <rect x="84" y="662" width="8" height="44" fill="#6b7c8f"/>
  <path d="M60 718 L88 704 L116 718" fill="none"/>
  <circle cx="60" cy="722" r="5" fill="#3a4a5c" stroke-width="3"/>
  <circle cx="116" cy="722" r="5" fill="#3a4a5c" stroke-width="3"/>

  <g class="v-problem">
    <!-- Монитор включён: яркая заставка, хотя за столом никого -->
    <rect x="30" y="430" width="150" height="118" rx="16" fill="none" stroke="#bfe6ff" stroke-width="8" opacity="0.8">
      <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.4s" repeatCount="indefinite"/>
    </rect>
    <rect x="48" y="448" width="114" height="82" rx="3" fill="url(#ap-screen)" stroke="none"/>
    <circle cx="70" cy="472" r="10" fill="#ffd166" stroke-width="3">
      <animate attributeName="cx" values="62;148;62" dur="4s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="462;516;462" dur="2.6s" repeatCount="indefinite"/>
    </circle>
    <path d="M118 478 l6 12 l13 2 l-10 9 l3 13 l-12 -7 l-12 7 l3 -13 l-10 -9 l13 -2 Z" fill="#ff8c69" stroke-width="2.5">
      <animateTransform attributeName="transform" type="rotate" values="0 124 497;360 124 497" dur="6s" repeatCount="indefinite"/>
    </path>
  </g>
  <g class="v-ok">
    <!-- Монитор выключен: тёмный экран с бликом -->
    <rect x="48" y="448" width="114" height="82" rx="3" fill="#1f2a36" stroke="none"/>
    <line x1="60" y1="520" x2="96" y2="458" stroke="#ffffff" stroke-width="5" opacity="0.18"/>
    <line x1="80" y1="522" x2="112" y2="466" stroke="#ffffff" stroke-width="3" opacity="0.12"/>
  </g>
  <rect class="obj-hit" x="10" y="405" width="198" height="330" rx="12" fill="transparent" stroke="none"/>
</g>

<!-- ===== obj-window: большое окно гостиной ===== -->
<g id="obj-window" class="obj" data-state="problem" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <!-- Небо, солнце и облака за стеклом -->
  <rect x="262" y="117" width="186" height="261" fill="url(#ap-sky)" stroke="none"/>
  <g stroke="#ffb703" stroke-width="4">
    <line x1="310" y1="134" x2="310" y2="146"/>
    <line x1="310" y1="214" x2="310" y2="226"/>
    <line x1="264" y1="180" x2="276" y2="180"/>
    <line x1="344" y1="180" x2="356" y2="180"/>
    <line x1="278" y1="148" x2="286" y2="156"/>
    <line x1="334" y1="204" x2="342" y2="212"/>
    <line x1="342" y1="148" x2="334" y2="156"/>
    <line x1="278" y1="212" x2="286" y2="204"/>
  </g>
  <circle cx="310" cy="180" r="26" fill="#ffd166" stroke-width="3"/>
  <path d="M372 172 a12 12 0 0 1 20 -10 a16 16 0 0 1 30 4 a11 11 0 0 1 4 20 h-50 a10 10 0 0 1 -4 -14 Z" fill="#ffffff" stroke="none"/>
  <path d="M276 300 a12 12 0 0 1 20 -10 a16 16 0 0 1 30 4 a11 11 0 0 1 4 20 h-50 a10 10 0 0 1 -4 -14 Z" fill="#ffffff" stroke="none" opacity="0.9"/>
  <!-- Рама окна (две створки) -->
  <path d="M258 105 H452 Q460 105 460 113 V382 Q460 390 452 390 H258 Q250 390 250 382 V113 Q250 105 258 105 Z M264 119 V376 H348 V119 Z M362 119 V376 H446 V119 Z" fill="#ffffff" fill-rule="evenodd"/>
  <!-- Карниз и шторы -->
  <line x1="226" y1="92" x2="484" y2="92" stroke-width="6"/>
  <circle cx="226" cy="92" r="6" fill="#d9a066"/>
  <circle cx="484" cy="92" r="6" fill="#d9a066"/>
  <path d="M228 94 H254 Q246 160 254 230 Q244 300 250 386 H230 Q222 300 230 230 Q220 160 228 94 Z" fill="#b9a6ff"/>
  <path d="M456 94 H482 Q474 160 482 230 Q472 300 478 386 H458 Q450 300 458 230 Q448 160 456 94 Z" fill="#b9a6ff"/>
  <!-- Подоконник с цветком -->
  <rect x="238" y="388" width="234" height="15" rx="5" fill="#ffffff"/>
  <path d="M408 350 q-14 -18 -2 -30 q10 12 4 30 M416 352 q4 -24 20 -26 q2 18 -18 26" fill="#7ad9b5" stroke-width="3"/>
  <path d="M400 360 H430 L426 388 H404 Z" fill="#ff8c69" stroke-width="3"/>

  <g class="v-problem">
    <!-- Щель: правая створка неплотно закрыта, ручка в положении «открыто» -->
    <path d="M440 121 L450 116 L450 380 L440 374 Z" fill="#35506b" stroke-width="2"/>
    <rect x="352" y="246" width="30" height="8" rx="4" fill="#9aa9b8" stroke-width="3"/>
    <!-- Холодные завитки сквозняка -->
    <g fill="none" stroke="#3d8fd1" stroke-width="5">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;28 10" dur="2.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite"/>
        <path d="M446 168 c18 -12 38 -2 32 13 c-5 10 -20 8 -17 -2"/>
        <path d="M446 196 h32"/>
      </g>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;28 10" dur="2.2s" begin="0.7s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="0.7s" repeatCount="indefinite"/>
        <path d="M446 250 c18 -12 38 -2 32 13 c-5 10 -20 8 -17 -2"/>
        <path d="M446 278 h26"/>
      </g>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;28 10" dur="2.2s" begin="1.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="1.4s" repeatCount="indefinite"/>
        <path d="M446 326 c18 -12 38 -2 32 13 c-5 10 -20 8 -17 -2"/>
        <path d="M446 354 h30"/>
      </g>
    </g>
  </g>
  <g class="v-ok">
    <!-- Уплотнитель по всей раме, ручка вниз — окно закрыто плотно -->
    <rect x="257" y="112" width="196" height="271" rx="4" fill="none" stroke="#7ad9b5" stroke-width="6"/>
    <rect x="351" y="238" width="8" height="30" rx="4" fill="#9aa9b8" stroke-width="3"/>
  </g>
  <rect class="obj-hit" x="225" y="85" width="260" height="320" rx="12" fill="transparent" stroke="none"/>
</g>

<!-- ===== obj-radiator: батарея с термоголовкой ===== -->
<g id="obj-radiator" class="obj" data-state="problem" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <!-- Кронштейны и труба к термоголовке -->
  <rect x="282" y="526" width="10" height="16" fill="#9aa9b8" stroke-width="3"/>
  <rect x="430" y="526" width="10" height="16" fill="#9aa9b8" stroke-width="3"/>
  <rect x="246" y="464" width="24" height="12" fill="#dfe6ee" stroke-width="3"/>
  <!-- Секции батареи -->
  <rect x="266" y="444" width="190" height="84" rx="10" fill="#f4f7fb"/>
  <g class="v-problem">
    <!-- Перегрев: батарея «раскалена», от неё идут сильные волны жара -->
    <rect x="268" y="446" width="186" height="80" rx="9" fill="#ffb38a" opacity="0.55" stroke="none"/>
  </g>
  <g stroke-width="3">
    <line x1="293" y1="450" x2="293" y2="522"/>
    <line x1="320" y1="450" x2="320" y2="522"/>
    <line x1="347" y1="450" x2="347" y2="522"/>
    <line x1="374" y1="450" x2="374" y2="522"/>
    <line x1="401" y1="450" x2="401" y2="522"/>
    <line x1="428" y1="450" x2="428" y2="522"/>
  </g>
  <!-- Термоголовка и шкала из точек (чем больше точка, тем жарче) -->
  <circle cx="234" cy="470" r="20" fill="#ffffff"/>
  <circle cx="234" cy="470" r="11" fill="none" stroke-width="2" stroke-dasharray="4 4"/>
  <g fill="#2b3a4a" stroke="none">
    <circle cx="208" cy="455" r="2.5"/>
    <circle cx="219" cy="444" r="3"/>
    <circle cx="234" cy="440" r="3.5"/>
    <circle cx="249" cy="444" r="4.5"/>
    <circle cx="260" cy="455" r="6"/>
  </g>

  <g class="v-problem">
    <!-- Указатель на максимуме, отметка «макс» обведена -->
    <line x1="234" y1="470" x2="250" y2="461" stroke-width="5"/>
    <circle cx="260" cy="455" r="10" fill="none" stroke="#ff8c69" stroke-width="3"/>
    <g fill="none" stroke="#ff7a45" stroke-width="5">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 6;0 -14" dur="1.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="1.6s" repeatCount="indefinite"/>
        <path d="M296 434 q-8 -8 0 -16 q8 -8 0 -16"/>
        <path d="M376 434 q-8 -8 0 -16 q8 -8 0 -16"/>
      </g>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 6;0 -14" dur="1.6s" begin="0.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="1.6s" begin="0.8s" repeatCount="indefinite"/>
        <path d="M336 434 q-8 -8 0 -16 q8 -8 0 -16"/>
        <path d="M416 434 q-8 -8 0 -16 q8 -8 0 -16"/>
      </g>
    </g>
  </g>
  <g class="v-ok">
    <!-- Указатель в середине шкалы, батарея спокойная -->
    <line x1="234" y1="470" x2="234" y2="452" stroke-width="5"/>
    <circle cx="234" cy="440" r="8" fill="none" stroke="#3d8fd1" stroke-width="3"/>
  </g>
  <rect class="obj-hit" x="212" y="418" width="270" height="152" rx="12" fill="transparent" stroke="none"/>
</g>

<!-- ===== obj-floorlamp: торшер у дивана ===== -->
<g id="obj-floorlamp" class="obj" data-state="problem" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <ellipse cx="545" cy="764" rx="34" ry="10" fill="#3a4a5c"/>
  <rect x="541" y="356" width="8" height="404" fill="#6b7c8f"/>
  <!-- Абажур -->
  <path d="M515 290 H575 L597 350 H493 Z" fill="#ffd166"/>
  <line x1="508" y1="330" x2="582" y2="330" stroke-width="3"/>
  <!-- Цоколь лампы -->
  <rect x="537" y="350" width="16" height="12" fill="#b0b8c0" stroke-width="3"/>

  <g class="v-problem">
    <!-- Старая лампа накаливания: «груша», горячая, с волнами жара -->
    <circle cx="545" cy="392" r="50" fill="url(#ap-glow-hot)" stroke="none">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite"/>
    </circle>
    <path d="M539 362 C539 372 525 378 525 394 C525 410 535 418 545 418 C555 418 565 410 565 394 C565 378 551 372 551 362 Z" fill="#ffa94d"/>
    <path d="M536 398 l4 -7 l3 7 l4 -7 l3 7 l4 -7" fill="none" stroke="#c2410c" stroke-width="2.5"/>
    <g fill="none" stroke="#ff7a45" stroke-width="4">
      <animateTransform attributeName="transform" type="translate" values="0 8;0 -10" dur="1.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite"/>
      <path d="M510 420 q-6 -7 0 -14 q6 -7 0 -14"/>
      <path d="M580 420 q-6 -7 0 -14 q6 -7 0 -14"/>
    </g>
  </g>
  <g class="v-ok">
    <!-- Светодиодная лампа: белая, с плоским торцом, выключена днём -->
    <path d="M538 362 L530 380 V404 Q530 410 536 410 H554 Q560 410 560 404 V380 L552 362 Z" fill="#ffffff"/>
    <line x1="534" y1="372" x2="556" y2="372" stroke-width="2.5"/>
    <line x1="531" y1="380" x2="559" y2="380" stroke-width="2.5"/>
    <line x1="530" y1="404" x2="560" y2="404" stroke-width="3"/>
  </g>
  <rect class="obj-hit" x="490" y="250" width="110" height="525" rx="12" fill="transparent" stroke="none"/>
</g>

<!-- ===== obj-chandelier: люстра под потолком ===== -->
<g id="obj-chandelier" class="obj" data-state="problem" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <ellipse cx="672" cy="32" rx="22" ry="6" fill="#ffffff"/>
  <rect x="669" y="34" width="6" height="48" fill="#6b7c8f" stroke-width="3"/>
  <!-- Рожки -->
  <path d="M620 122 Q620 100 672 96 Q724 100 724 122" fill="none" stroke-width="5"/>
  <line x1="672" y1="96" x2="672" y2="142" stroke-width="5"/>
  <circle cx="672" cy="92" r="14" fill="#ffd166"/>

  <g class="v-problem">
    <!-- Днём горят все лампочки -->
    <g stroke="none">
      <animate attributeName="opacity" values="0.75;1;0.85;1;0.75" dur="3s" repeatCount="indefinite"/>
      <circle cx="620" cy="150" r="36" fill="url(#ap-glow)"/>
      <circle cx="672" cy="170" r="36" fill="url(#ap-glow)"/>
      <circle cx="724" cy="150" r="36" fill="url(#ap-glow)"/>
    </g>
    <circle cx="620" cy="148" r="9" fill="#fff6b0" stroke-width="3"/>
    <circle cx="672" cy="168" r="9" fill="#fff6b0" stroke-width="3"/>
    <circle cx="724" cy="148" r="9" fill="#fff6b0" stroke-width="3"/>
    <g stroke="#f4a300" stroke-width="3">
      <line x1="620" y1="164" x2="620" y2="176"/>
      <line x1="604" y1="160" x2="597" y2="168"/>
      <line x1="636" y1="160" x2="643" y2="168"/>
      <line x1="672" y1="184" x2="672" y2="196"/>
      <line x1="656" y1="180" x2="649" y2="188"/>
      <line x1="688" y1="180" x2="695" y2="188"/>
      <line x1="724" y1="164" x2="724" y2="176"/>
      <line x1="708" y1="160" x2="701" y2="168"/>
      <line x1="740" y1="160" x2="747" y2="168"/>
    </g>
  </g>
  <g class="v-ok">
    <!-- Лампочки выключены -->
    <circle cx="620" cy="148" r="9" fill="#e3e8ee" stroke-width="3"/>
    <circle cx="672" cy="168" r="9" fill="#e3e8ee" stroke-width="3"/>
    <circle cx="724" cy="148" r="9" fill="#e3e8ee" stroke-width="3"/>
  </g>
  <!-- Плафоны поверх лампочек -->
  <path d="M608 120 H632 L640 142 H600 Z" fill="#b9a6ff"/>
  <path d="M660 140 H684 L692 162 H652 Z" fill="#b9a6ff"/>
  <path d="M712 120 H736 L744 142 H704 Z" fill="#b9a6ff"/>
  <rect class="obj-hit" x="604" y="36" width="146" height="180" rx="12" fill="transparent" stroke="none"/>
</g>

<!-- ===== obj-tv: телевизор на тумбе и удлинитель ===== -->
<g id="obj-tv" class="obj" data-state="problem" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <!-- Провода: от телевизора к удлинителю и от удлинителя к стене -->
  <path d="M736 588 C752 630 752 690 724 716" fill="none" stroke-width="4"/>
  <path d="M640 726 H614 V700" fill="none" stroke-width="4"/>
  <!-- Тумба -->
  <rect x="612" y="612" width="134" height="84" rx="6" fill="#d9a066"/>
  <line x1="679" y1="618" x2="679" y2="690" stroke-width="3"/>
  <circle cx="668" cy="654" r="4" fill="#2b3a4a" stroke="none"/>
  <circle cx="690" cy="654" r="4" fill="#2b3a4a" stroke="none"/>
  <!-- Ножка и корпус телевизора -->
  <rect x="668" y="584" width="22" height="20" fill="#3a4a5c"/>
  <rect x="648" y="602" width="62" height="10" rx="4" fill="#3a4a5c"/>
  <rect x="614" y="498" width="130" height="88" rx="8" fill="#2b3a4a"/>
  <rect x="622" y="506" width="114" height="68" rx="3" fill="#1f2a36" stroke="none"/>
  <line x1="634" y1="566" x2="660" y2="514" stroke="#ffffff" stroke-width="5" opacity="0.15"/>
  <!-- Удлинитель на полу -->
  <rect x="640" y="714" width="98" height="22" rx="7" fill="#ffffff"/>
  <circle cx="660" cy="725" r="5" fill="#dfe6ee" stroke-width="2.5"/>
  <circle cx="680" cy="725" r="5" fill="#dfe6ee" stroke-width="2.5"/>
  <circle cx="700" cy="725" r="5" fill="#dfe6ee" stroke-width="2.5"/>

  <g class="v-problem">
    <!-- Режим ожидания: светится точка на телевизоре и клавиша удлинителя -->
    <circle cx="732" cy="580" r="12" fill="#ff8c69" opacity="0.5" stroke="none">
      <animate attributeName="r" values="7;13;7" dur="1.6s" repeatCount="indefinite"/>
    </circle>
    <circle cx="732" cy="580" r="4" fill="#ff5a5a" stroke-width="2"/>
    <circle cx="724" cy="725" r="18" fill="url(#ap-glow)" stroke="none">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite"/>
    </circle>
    <rect x="716" y="717" width="16" height="16" rx="3" fill="#ffd166" stroke-width="3"/>
    <g stroke="#f4a300" stroke-width="3">
      <line x1="724" y1="710" x2="724" y2="704"/>
      <line x1="736" y1="712" x2="741" y2="707"/>
      <line x1="712" y1="712" x2="707" y2="707"/>
    </g>
  </g>
  <g class="v-ok">
    <!-- Удлинитель выключен клавишей, точки нет -->
    <rect x="716" y="717" width="16" height="16" rx="3" fill="#9aa9b8" stroke-width="3"/>
    <line x1="719" y1="730" x2="729" y2="720" stroke-width="3"/>
  </g>
  <rect class="obj-hit" x="604" y="470" width="148" height="275" rx="12" fill="transparent" stroke="none"/>
</g>

<!-- ===================== КУХНЯ: декор ===================== -->
<g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <!-- Подвесной светильник (выключен) -->
  <line x1="1150" y1="30" x2="1150" y2="80" stroke-width="3"/>
  <path d="M1128 80 H1172 L1182 104 H1118 Z" fill="#7ad9b5"/>
  <!-- Верхние шкафчики -->
  <rect x="800" y="110" width="270" height="140" rx="8" fill="#8fd3ff"/>
  <line x1="890" y1="116" x2="890" y2="244" stroke-width="3"/>
  <line x1="980" y1="116" x2="980" y2="244" stroke-width="3"/>
  <rect x="872" y="200" width="8" height="30" rx="4" fill="#ffffff" stroke-width="3"/>
  <rect x="900" y="200" width="8" height="30" rx="4" fill="#ffffff" stroke-width="3"/>
  <rect x="990" y="200" width="8" height="30" rx="4" fill="#ffffff" stroke-width="3"/>
  <!-- Часы без цифр -->
  <circle cx="935" cy="320" r="26" fill="#ffffff"/>
  <line x1="935" y1="320" x2="935" y2="304" stroke-width="3"/>
  <line x1="935" y1="320" x2="947" y2="326" stroke-width="3"/>
  <!-- Фартук из плитки -->
  <rect x="792" y="420" width="290" height="100" fill="url(#ap-tile-kitchen)" stroke="none"/>
  <!-- Нижние шкафы и столешница -->
  <rect x="796" y="538" width="282" height="158" rx="6" fill="#8fd3ff"/>
  <line x1="890" y1="546" x2="890" y2="690" stroke-width="3"/>
  <line x1="984" y1="546" x2="984" y2="690" stroke-width="3"/>
  <rect x="872" y="566" width="8" height="30" rx="4" fill="#ffffff" stroke-width="3"/>
  <rect x="900" y="566" width="8" height="30" rx="4" fill="#ffffff" stroke-width="3"/>
  <rect x="994" y="566" width="8" height="30" rx="4" fill="#ffffff" stroke-width="3"/>
  <rect x="788" y="518" width="296" height="22" rx="5" fill="#d9a066"/>
  <!-- Коврик -->
  <rect x="840" y="780" width="200" height="60" rx="26" fill="#ffd166"/>
  <rect x="858" y="794" width="164" height="32" rx="16" fill="none" stroke="#ffffff" stroke-dasharray="10 8"/>
</g>

<!-- ===== obj-tap-kitchen: кухонная мойка и кран ===== -->
<g id="obj-tap-kitchen" class="obj" data-state="problem" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <!-- Чаша мойки -->
  <path d="M816 518 H944 L936 550 H824 Z" fill="#dfe6ee"/>
  <!-- Кран: обводка и металлическая «трубка» -->
  <path d="M866 508 V458 Q866 446 878 446 H898 Q906 446 906 454 V466" fill="none" stroke="#2b3a4a" stroke-width="14"/>
  <path d="M866 508 V458 Q866 446 878 446 H898 Q906 446 906 454 V466" fill="none" stroke="#d5dee6" stroke-width="7"/>
  <rect x="854" y="504" width="24" height="16" rx="4" fill="#b0bec9"/>
  <rect x="862" y="494" width="8" height="12" fill="#b0bec9" stroke-width="3"/>

  <g class="v-problem">
    <!-- Рычаг чуть приоткрыт, из крана капает -->
    <rect x="848" y="488" width="36" height="8" rx="4" fill="#d5dee6" stroke-width="3" transform="rotate(-18 866 494)"/>
    <path d="M906 468 q-5 8 0 11 q5 -3 0 -11 Z" fill="#4aa3df" stroke-width="2"/>
    <g fill="#4aa3df" stroke-width="2">
      <path d="M906 470 q-6 9 0 13 q6 -4 0 -13 Z">
        <animateTransform attributeName="transform" type="translate" values="0 0;0 46" dur="1.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;1;0" dur="1.2s" repeatCount="indefinite"/>
      </path>
      <path d="M906 470 q-6 9 0 13 q6 -4 0 -13 Z">
        <animateTransform attributeName="transform" type="translate" values="0 0;0 46" dur="1.2s" begin="0.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;1;0" dur="1.2s" begin="0.6s" repeatCount="indefinite"/>
      </path>
    </g>
    <ellipse cx="906" cy="530" rx="8" ry="3" fill="none" stroke="#3d8fd1" stroke-width="3">
      <animate attributeName="rx" values="4;16;4" dur="1.2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite"/>
    </ellipse>
  </g>
  <g class="v-ok">
    <!-- Рычаг закрыт, капель нет -->
    <rect x="848" y="488" width="36" height="8" rx="4" fill="#d5dee6" stroke-width="3"/>
  </g>
  <rect class="obj-hit" x="798" y="395" width="160" height="205" rx="12" fill="transparent" stroke="none"/>
</g>

<!-- ===== obj-kettle: электрочайник ===== -->
<g id="obj-kettle" class="obj" data-state="problem" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <!-- Подставка, носик, ручка, корпус, крышка -->
  <rect x="966" y="510" width="72" height="10" rx="4" fill="#3a4a5c"/>
  <path d="M976 462 L962 450 L966 468 L978 478 Z" fill="#ff8c69"/>
  <path d="M1026 456 Q1050 460 1046 494 Q1042 508 1030 506" fill="none" stroke-width="7"/>
  <path d="M972 512 L978 452 Q980 440 992 440 H1012 Q1024 440 1026 452 L1032 512 Z" fill="#ff8c69"/>
  <rect x="986" y="430" width="32" height="12" rx="5" fill="#ffd166"/>
  <!-- Окошко уровня воды -->
  <rect x="994" y="454" width="14" height="52" rx="6" fill="#eaf6ff" stroke-width="3"/>

  <g class="v-problem">
    <!-- Налит до самого верха и кипит: большое облако пара -->
    <rect x="997" y="457" width="8" height="46" rx="3" fill="#3d8fd1" stroke="none"/>
    <path d="M963 470 q-5 8 0 11 q5 -3 0 -11 Z" fill="#4aa3df" stroke-width="2">
      <animateTransform attributeName="transform" type="translate" values="0 0;0 34" dur="1.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;1;0" dur="1.5s" repeatCount="indefinite"/>
    </path>
    <g fill="#ffffff" stroke="#9fb3c4" stroke-width="3">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 6;0 -10" dur="2.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite"/>
        <path d="M966 424 a18 18 0 0 1 6 -32 a26 26 0 0 1 48 -14 a24 24 0 0 1 36 28 a16 16 0 0 1 -10 18 Z"/>
      </g>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 4;0 -12" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.9;0" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
        <path d="M978 366 a14 14 0 0 1 6 -24 a20 20 0 0 1 38 -8 a18 18 0 0 1 28 20 a12 12 0 0 1 -8 12 Z"/>
      </g>
    </g>
  </g>
  <g class="v-ok">
    <!-- Воды ровно на одну чашку, пара нет; рядом чашка -->
    <rect x="997" y="488" width="8" height="15" rx="3" fill="#3d8fd1" stroke="none"/>
    <path d="M1072 502 q10 2 7 11 q-2 5 -8 4" fill="none" stroke-width="3"/>
    <path d="M1050 496 H1074 L1071 520 H1053 Z" fill="#b9a6ff" stroke-width="3"/>
  </g>
  <rect class="obj-hit" x="962" y="300" width="120" height="300" rx="12" fill="transparent" stroke="none"/>
</g>

<!-- ===== obj-fridge: холодильник ===== -->
<g id="obj-fridge" class="obj" data-state="problem" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <!-- Корпус и ножки -->
  <rect x="1104" y="694" width="14" height="8" fill="#3a4a5c" stroke-width="3"/>
  <rect x="1196" y="694" width="14" height="8" fill="#3a4a5c" stroke-width="3"/>
  <rect x="1095" y="300" width="125" height="398" rx="14" fill="#f4f7fb"/>
  <!-- Морозилка с магнитиками -->
  <rect x="1095" y="300" width="125" height="130" rx="14" fill="#ffffff"/>
  <rect x="1202" y="350" width="8" height="50" rx="4" fill="#9aa9b8" stroke-width="3"/>
  <circle cx="1122" cy="330" r="7" fill="#ffd166" stroke-width="3"/>
  <rect x="1138" y="340" width="16" height="16" rx="3" fill="#ff8c69" stroke-width="3"/>

  <g class="v-problem">
    <!-- Дверь приоткрыта: видны полки, выходит холодный туман -->
    <rect x="1100" y="436" width="116" height="256" rx="6" fill="#dff3ff" stroke-width="3"/>
    <ellipse cx="1158" cy="448" rx="44" ry="10" fill="#ffffff" stroke="none"/>
    <g stroke-width="3">
      <line x1="1100" y1="510" x2="1216" y2="510"/>
      <line x1="1100" y1="580" x2="1216" y2="580"/>
      <line x1="1100" y1="646" x2="1216" y2="646"/>
    </g>
    <rect x="1116" y="462" width="14" height="46" rx="5" fill="#7ad9b5" stroke-width="3"/>
    <rect x="1140" y="476" width="26" height="32" rx="3" fill="#ffffff" stroke-width="3"/>
    <path d="M1180 578 L1206 578 L1206 556 Z" fill="#ffd166" stroke-width="3"/>
    <circle cx="1130" cy="634" r="10" fill="#ff8c69" stroke-width="3"/>
    <circle cx="1152" cy="634" r="10" fill="#ff8c69" stroke-width="3"/>
    <rect x="1170" y="606" width="30" height="38" rx="4" fill="#b9a6ff" stroke-width="3"/>
    <!-- Дверца, повёрнутая к нам -->
    <path d="M1095 432 L1076 422 V710 L1095 700 Z" fill="#ffffff"/>
    <rect x="1080" y="520" width="6" height="56" rx="3" fill="#9aa9b8" stroke-width="2.5"/>
    <!-- Клубы холодного тумана опускаются вниз -->
    <g fill="#eaf6ff" stroke="#8fb8d9" stroke-width="3">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;-30 16" dur="2.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.95;0" dur="2.6s" repeatCount="indefinite"/>
        <circle cx="1108" cy="660" r="13"/>
        <circle cx="1124" cy="670" r="10"/>
      </g>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;-30 16" dur="2.6s" begin="1.3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.95;0" dur="2.6s" begin="1.3s" repeatCount="indefinite"/>
        <circle cx="1112" cy="600" r="11"/>
        <circle cx="1100" cy="612" r="9"/>
      </g>
    </g>
  </g>
  <g class="v-ok">
    <!-- Дверь плотно закрыта -->
    <rect x="1095" y="432" width="125" height="266" rx="14" fill="#ffffff"/>
    <rect x="1202" y="450" width="8" height="64" rx="4" fill="#9aa9b8" stroke-width="3"/>
  </g>
  <rect class="obj-hit" x="1086" y="285" width="140" height="430" rx="12" fill="transparent" stroke="none"/>
</g>

<!-- ===================== ВАННАЯ: декор ===================== -->
<g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <!-- Зеркало -->
  <ellipse cx="1334" cy="300" rx="48" ry="58" fill="#cfeaff"/>
  <line x1="1310" y1="300" x2="1330" y2="268" stroke="#ffffff" stroke-width="6"/>
  <line x1="1318" y1="318" x2="1344" y2="276" stroke="#ffffff" stroke-width="4"/>
  <!-- Трубы от водонагревателя -->
  <rect x="1476" y="288" width="10" height="70" fill="#dfe6ee" stroke-width="3"/>
  <rect x="1528" y="288" width="10" height="70" fill="#dfe6ee" stroke-width="3"/>
  <!-- Ванна на переднем плане с уточкой -->
  <rect x="1300" y="854" width="16" height="20" rx="4" fill="#9aa9b8"/>
  <rect x="1546" y="854" width="16" height="20" rx="4" fill="#9aa9b8"/>
  <path d="M1268 776 H1592 V806 Q1592 862 1532 862 H1328 Q1268 862 1268 806 Z" fill="#ffffff"/>
  <rect x="1262" y="766" width="336" height="16" rx="8" fill="#ffffff"/>
  <path d="M1470 766 q-4 -14 10 -16 q-2 -12 10 -12 q10 0 10 10 l8 2 l-8 4 q8 8 -2 12 Z" fill="#ffd166" stroke-width="3"/>
  <circle cx="1494" cy="744" r="2" fill="#2b3a4a" stroke="none"/>
  <circle cx="1330" cy="756" r="9" fill="#ffffff" stroke-width="3"/>
  <circle cx="1348" cy="750" r="6" fill="#ffffff" stroke-width="3"/>
</g>

<!-- ===== obj-tap-bath: раковина и кран в ванной ===== -->
<g id="obj-tap-bath" class="obj" data-state="problem" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <!-- Ножка и чаша раковины -->
  <path d="M1318 508 L1312 698 H1356 L1350 508 Z" fill="#f4f7fb"/>
  <path d="M1270 470 H1398 Q1398 514 1334 514 Q1270 514 1270 470 Z" fill="#ffffff"/>
  <rect x="1264" y="460" width="140" height="12" rx="6" fill="#ffffff"/>
  <!-- Кран -->
  <rect x="1326" y="414" width="14" height="48" fill="#c9d4de" stroke-width="3"/>
  <rect x="1326" y="406" width="42" height="12" rx="6" fill="#c9d4de" stroke-width="3"/>
  <rect x="1356" y="414" width="10" height="10" fill="#c9d4de" stroke-width="3"/>
  <!-- Стакан с зубной щёткой -->
  <line x1="1388" y1="436" x2="1380" y2="400" stroke="#ff8c69" stroke-width="5"/>
  <rect x="1374" y="394" width="10" height="12" rx="2" fill="#ffffff" stroke-width="2.5" transform="rotate(-12 1379 400)"/>
  <path d="M1376 430 H1400 L1397 460 H1379 Z" fill="#7ad9b5" stroke-width="3"/>

  <g class="v-problem">
    <!-- Рычаг поднят, вода течёт сплошной струёй -->
    <rect x="1316" y="390" width="34" height="8" rx="4" fill="#c9d4de" stroke-width="3" transform="rotate(-28 1333 400)"/>
    <line x1="1333" y1="406" x2="1333" y2="398" stroke-width="4"/>
    <line x1="1361" y1="426" x2="1361" y2="462" stroke="#2b3a4a" stroke-width="14"/>
    <line x1="1361" y1="426" x2="1361" y2="462" stroke="#bfe6ff" stroke-width="9"/>
    <line x1="1361" y1="426" x2="1361" y2="462" stroke="#3d8fd1" stroke-width="5" stroke-dasharray="6 5">
      <animate attributeName="stroke-dashoffset" values="22;0" dur="0.5s" repeatCount="indefinite"/>
    </line>
    <g fill="#8fd3ff" stroke-width="2">
      <circle cx="1350" cy="456" r="3.5">
        <animate attributeName="cy" values="460;448;460" dur="0.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="1372" cy="456" r="3.5">
        <animate attributeName="cy" values="448;460;448" dur="0.8s" repeatCount="indefinite"/>
      </circle>
    </g>
  </g>
  <g class="v-ok">
    <!-- Рычаг опущен, кран закрыт -->
    <rect x="1316" y="396" width="34" height="8" rx="4" fill="#c9d4de" stroke-width="3"/>
    <line x1="1333" y1="406" x2="1333" y2="402" stroke-width="4"/>
  </g>
  <rect class="obj-hit" x="1262" y="385" width="150" height="220" rx="12" fill="transparent" stroke="none"/>
</g>

<!-- ===== obj-boiler: водонагреватель со шкалой ===== -->
<g id="obj-boiler" class="obj" data-state="problem" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <rect x="1450" y="80" width="115" height="212" rx="40" fill="#ffffff"/>
  <line x1="1452" y1="130" x2="1563" y2="130" stroke-width="3"/>
  <!-- Круглая шкала: дуга, отметка середины, зона максимума -->
  <circle cx="1507" cy="196" r="34" fill="#f4f7fb"/>
  <path d="M1486.2 208 A24 24 0 1 1 1527.8 208" fill="none" stroke-width="3"/>
  <path d="M1527.8 184 A24 24 0 0 1 1527.8 208" fill="none" stroke="#ff8c69" stroke-width="7"/>
  <line x1="1507" y1="170" x2="1507" y2="178" stroke-width="3"/>
  <line x1="1486" y1="184" x2="1492" y2="188" stroke-width="3"/>

  <g class="v-problem">
    <!-- Стрелка упёрлась в максимум, мигает треугольник-предупреждение -->
    <line x1="1507" y1="196" x2="1526" y2="204" stroke-width="4"/>
    <g>
      <animate attributeName="opacity" values="1;0.35;1" dur="1.2s" repeatCount="indefinite"/>
      <path d="M1507 234 L1525 266 H1489 Z" fill="#ffd166" stroke-width="3"/>
      <line x1="1507" y1="246" x2="1507" y2="255" stroke-width="3.5"/>
      <circle cx="1507" cy="261" r="2" fill="#2b3a4a" stroke="none"/>
    </g>
    <g fill="none" stroke="#ff7a45" stroke-width="4">
      <animateTransform attributeName="transform" type="translate" values="0 6;0 -8" dur="1.6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;0" dur="1.6s" repeatCount="indefinite"/>
      <path d="M1486 76 q-5 -6 0 -12 q5 -6 0 -12"/>
      <path d="M1528 76 q-5 -6 0 -12 q5 -6 0 -12"/>
    </g>
  </g>
  <g class="v-ok">
    <!-- Стрелка в середине шкалы, круглый индикатор «норма» -->
    <line x1="1507" y1="196" x2="1507" y2="176" stroke-width="4"/>
    <circle cx="1507" cy="252" r="9" fill="#7ad9b5" stroke-width="3"/>
  </g>
  <circle cx="1507" cy="196" r="5" fill="#2b3a4a" stroke="none"/>
  <rect class="obj-hit" x="1425" y="40" width="163" height="290" rx="12" fill="transparent" stroke="none"/>
</g>

<!-- ===== obj-washer: стиральная машина ===== -->
<g id="obj-washer" class="obj" data-state="problem" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <rect x="1430" y="540" width="150" height="158" rx="12" fill="#ffffff"/>
  <line x1="1432" y1="574" x2="1578" y2="574" stroke-width="3"/>
  <rect x="1440" y="550" width="30" height="16" rx="3" fill="#dfe6ee" stroke-width="3"/>
  <circle cx="1556" cy="557" r="9" fill="#dfe6ee" stroke-width="3"/>
  <rect x="1500" y="553" width="10" height="8" rx="2" fill="#7ad9b5" stroke-width="2"/>
  <rect x="1516" y="553" width="10" height="8" rx="2" fill="#8fd3ff" stroke-width="2"/>
  <!-- Дверца-иллюминатор -->
  <circle cx="1505" cy="636" r="50" fill="#dfe6ee"/>
  <circle cx="1505" cy="636" r="38" fill="#cfeaff"/>

  <g class="v-problem">
    <!-- Почти пустой барабан крутится: внутри всего пара вещей -->
    <g clip-path="url(#ap-drum)">
      <path d="M1471.8 650 Q1505 658 1538.2 650 A36 36 0 0 1 1471.8 650 Z" fill="#8fd3ff" stroke="none"/>
      <g stroke-width="3">
        <animateTransform attributeName="transform" type="rotate" values="0 1505 636;360 1505 636" dur="2.4s" repeatCount="indefinite"/>
        <path d="M1486 612 h10 v14 q0 8 8 8 h6 v9 h-14 q-11 0 -11 -11 Z" fill="#ff8c69"/>
        <rect x="1510" y="644" width="18" height="12" rx="4" fill="#ffd166"/>
        <ellipse cx="1492" cy="654" rx="8" ry="5" fill="#b9a6ff"/>
      </g>
    </g>
    <!-- Машина трясётся: линии вибрации по бокам -->
    <g fill="none" stroke-width="3">
      <animate attributeName="opacity" values="0;1;0" dur="0.8s" repeatCount="indefinite"/>
      <path d="M1422 606 q-7 12 0 24"/>
      <path d="M1422 642 q-7 12 0 24"/>
      <path d="M1588 606 q7 12 0 24"/>
      <path d="M1588 642 q7 12 0 24"/>
    </g>
  </g>
  <g class="v-ok">
    <!-- Барабан загружен бельём полностью, машина стоит -->
    <g clip-path="url(#ap-drum)" stroke-width="3">
      <circle cx="1488" cy="618" r="17" fill="#ff8c69"/>
      <circle cx="1522" cy="616" r="16" fill="#ffd166"/>
      <circle cx="1480" cy="652" r="16" fill="#7ad9b5"/>
      <circle cx="1530" cy="650" r="17" fill="#8fd3ff"/>
      <circle cx="1505" cy="666" r="14" fill="#ffffff"/>
      <circle cx="1506" cy="638" r="16" fill="#b9a6ff"/>
      <circle cx="1505" cy="602" r="10" fill="#ffffff"/>
    </g>
  </g>
  <!-- Блик на стекле и обводка -->
  <circle cx="1505" cy="636" r="38" fill="none" stroke-width="4"/>
  <path d="M1480 616 a30 30 0 0 1 18 -14" fill="none" stroke="#ffffff" stroke-width="5" opacity="0.8"/>
  <rect class="obj-hit" x="1418" y="515" width="174" height="200" rx="12" fill="transparent" stroke="none"/>
</g>

</svg>`;
