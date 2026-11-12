/*
  school.scene.js — SVG-сцены школы: класс, коридор, столовая.

  Что в файле:
    Три строки с готовыми SVG-картинками (размер «холста» 1600×900, viewBox).
    Движок вставляет строку в страницу и находит интерактивные объекты по id.

      EB.scenes.schoolClass    — пустой класс (парты, доска, учительский стол)
      EB.scenes.schoolCorridor — длинный коридор (шкафчики, окна, стенд, цветы)
      EB.scenes.schoolCanteen  — столовая (столы, кухня, мусорные баки)

  Как устроен каждый интерактивный объект:
    <g id="obj-ИМЯ" class="obj" data-state="problem">
      ...части, видимые всегда...
      <g class="v-problem">...вид, пока проблема не решена...</g>
      <g class="v-ok">...обычный / исправленный вид...</g>
      <rect class="obj-hit" .../>  ← прозрачная зона клика, ВСЕГДА последняя
    </g>
    Движок меняет data-state на "problem" или "ok", а CSS прячет лишний вид.
    Анимации (<animate>) есть только внутри .v-problem.

  Список объектов obj-* по зонам:
    Класс:    obj-class-lights, obj-class-window, obj-projector,
              obj-computers, obj-class-radiator
    Коридор:  obj-corridor-lights, obj-corridor-door, obj-corridor-window,
              obj-fountain, obj-vending
    Столовая: obj-canteen-tap, obj-dishwasher, obj-canteen-fridge,
              obj-stove, obj-waste-bins

  Как менять:
    - Координаты в пределах 0..1600 по X и 0..900 по Y.
    - Зоны клика (obj-hit) разных объектов не должны перекрываться.
    - Id градиентов начинаются с scl- (класс), scr- (коридор), scn- (столовая),
      чтобы не путаться между сценами.
    - Никаких <text>: все слова игра берёт из texts.*.js.
    - Внутри строк нельзя использовать обратную кавычку и знак доллара с фигурной скобкой.
*/

EB.scenes = EB.scenes || {};

/* ===================================================================
   СЦЕНА 1. КЛАСС
   =================================================================== */
EB.scenes.schoolClass = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" class="scene-svg">
  <defs>
    <!-- зимнее небо за окном -->
    <linearGradient id="scl-winter" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9fd8ff"/>
      <stop offset="1" stop-color="#e6f6ff"/>
    </linearGradient>
    <!-- свечение лампы -->
    <radialGradient id="scl-glow">
      <stop offset="0" stop-color="#fff2a8" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#fff2a8" stop-opacity="0"/>
    </radialGradient>
    <!-- свечение экранов -->
    <radialGradient id="scl-screen-glow">
      <stop offset="0" stop-color="#c8f5ff" stop-opacity="0.8"/>
      <stop offset="1" stop-color="#c8f5ff" stop-opacity="0"/>
    </radialGradient>
    <!-- фольгированный отражатель за батареей -->
    <linearGradient id="scl-foil" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#eef3f7"/>
      <stop offset="0.45" stop-color="#b7c4cf"/>
      <stop offset="0.55" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#a9b6c2"/>
    </linearGradient>
  </defs>

  <!-- ===== Стены, потолок, пол ===== -->
  <rect x="0" y="0" width="1600" height="900" fill="#fdf0d5"/>
  <rect x="0" y="0" width="1600" height="40" fill="#f3e2bf"/>
  <line x1="0" y1="40" x2="1600" y2="40" stroke="#2b3a4a" stroke-width="3"/>
  <!-- нижняя панель стены -->
  <rect x="0" y="520" width="1600" height="120" fill="#bfe8d6"/>
  <line x1="0" y1="520" x2="1600" y2="520" stroke="#2b3a4a" stroke-width="3"/>
  <!-- пол из досок -->
  <rect x="0" y="640" width="1600" height="260" fill="#e3b77f"/>
  <line x1="0" y1="640" x2="1600" y2="640" stroke="#2b3a4a" stroke-width="4"/>
  <g stroke="#c99a62" stroke-width="3">
    <line x1="0" y1="700" x2="1600" y2="700"/>
    <line x1="0" y1="770" x2="1600" y2="770"/>
    <line x1="0" y1="845" x2="1600" y2="845"/>
    <line x1="200" y1="640" x2="200" y2="700"/>
    <line x1="700" y1="640" x2="700" y2="700"/>
    <line x1="1250" y1="640" x2="1250" y2="700"/>
    <line x1="450" y1="700" x2="450" y2="770"/>
    <line x1="1000" y1="700" x2="1000" y2="770"/>
    <line x1="150" y1="770" x2="150" y2="845"/>
    <line x1="820" y1="770" x2="820" y2="845"/>
    <line x1="1400" y1="770" x2="1400" y2="845"/>
  </g>

  <!-- солнечные лучи из окон на пол (день) -->
  <polygon points="300,150 480,150 860,900 600,900" fill="#fff6c4" opacity="0.35"/>
  <polygon points="60,150 230,150 520,900 280,900" fill="#fff6c4" opacity="0.25"/>

  <!-- ===== Окно 2 (декор, над батареей) ===== -->
  <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
    <rect x="300" y="150" width="180" height="270" rx="6" fill="#ffffff"/>
    <rect x="312" y="162" width="156" height="246" fill="url(#scl-winter)"/>
    <!-- солнце -->
    <circle cx="430" cy="205" r="24" fill="#ffd166" stroke-width="3"/>
    <!-- снежные холмы -->
    <path d="M312 360 Q360 330 410 352 Q440 340 468 350 L468 408 L312 408 Z" fill="#ffffff" stroke-width="3"/>
    <line x1="390" y1="162" x2="390" y2="408" stroke-width="4"/>
    <line x1="312" y1="285" x2="468" y2="285" stroke-width="4"/>
    <rect x="292" y="420" width="196" height="16" rx="4" fill="#ffffff"/>
  </g>

  <!-- ===== Доска ===== -->
  <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
    <rect x="560" y="160" width="440" height="240" rx="8" fill="#d9a066"/>
    <rect x="574" y="174" width="412" height="212" rx="4" fill="#2f6b57"/>
    <rect x="590" y="400" width="380" height="12" rx="4" fill="#d9a066"/>
  </g>
  <!-- рисунки мелом: лампочка, стрелка, листик, солнце -->
  <g stroke="#f4fbf7" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">
    <circle cx="660" cy="250" r="34"/>
    <path d="M646 284 L646 304 L674 304 L674 284"/>
    <line x1="648" y1="314" x2="672" y2="314"/>
    <path d="M650 262 L660 240 L670 262"/>
    <path d="M720 260 L800 260 M785 245 L800 260 L785 275"/>
    <path d="M840 300 C840 240 900 220 930 220 C930 260 900 300 840 300 Z"/>
    <path d="M845 295 L905 240"/>
    <circle cx="930" cy="340" r="14"/>
    <path d="M930 312 L930 302 M958 340 L968 340 M902 340 L892 340"/>
  </g>
  <!-- мелки на полочке -->
  <rect x="640" y="394" width="26" height="7" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
  <rect x="690" y="394" width="22" height="7" rx="3" fill="#ffd166" stroke="#2b3a4a" stroke-width="2"/>

  <!-- ===== Плакат над компьютерами (планеты) ===== -->
  <g stroke="#2b3a4a" stroke-width="3">
    <rect x="1330" y="170" width="220" height="150" rx="8" fill="#ffffff"/>
    <circle cx="1380" cy="245" r="28" fill="#ffd166"/>
    <circle cx="1440" cy="230" r="10" fill="#8fd3ff"/>
    <circle cx="1480" cy="265" r="14" fill="#ff8c69"/>
    <circle cx="1520" cy="215" r="9" fill="#b9a6ff"/>
  </g>

  <!-- ===== Учительский стол ===== -->
  <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
    <rect x="640" y="490" width="280" height="18" rx="4" fill="#d9a066"/>
    <rect x="652" y="508" width="256" height="90" fill="#c98d50"/>
    <rect x="652" y="598" width="16" height="44" fill="#a8733e"/>
    <rect x="892" y="598" width="16" height="44" fill="#a8733e"/>
    <!-- стопка книг -->
    <rect x="670" y="472" width="70" height="18" rx="3" fill="#ff8c69"/>
    <rect x="676" y="456" width="60" height="16" rx="3" fill="#7ad9b5"/>
    <!-- глобус -->
    <line x1="860" y1="490" x2="860" y2="470"/>
    <rect x="840" y="482" width="40" height="8" rx="3" fill="#a8733e"/>
    <circle cx="860" cy="445" r="26" fill="#8fd3ff"/>
    <path d="M846 432 Q856 426 866 436 Q872 448 860 456 Q848 452 846 432 Z" fill="#7ad9b5" stroke-width="2"/>
  </g>

  <!-- ===== ОБЪЕКТ: окно (открыто зимой) ===== -->
  <g id="obj-class-window" class="obj" data-state="problem">
    <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
      <rect x="50" y="150" width="190" height="300" rx="6" fill="#ffffff"/>
      <rect x="62" y="162" width="166" height="276" fill="url(#scl-winter)"/>
      <!-- зимний пейзаж: ёлка и сугробы -->
      <path d="M62 380 Q120 350 170 372 Q200 360 228 368 L228 438 L62 438 Z" fill="#ffffff" stroke-width="3"/>
      <polygon points="110,250 80,320 140,320" fill="#4fa889" stroke-width="3"/>
      <polygon points="110,290 72,360 148,360" fill="#4fa889" stroke-width="3"/>
      <rect x="104" y="360" width="12" height="16" fill="#a8733e" stroke-width="3"/>
      <path d="M96 282 L110 262 L124 282 Z" fill="#ffffff" stroke-width="2"/>
      <circle cx="180" cy="200" r="4" fill="#ffffff" stroke-width="2"/>
      <circle cx="200" cy="250" r="4" fill="#ffffff" stroke-width="2"/>
      <circle cx="160" cy="300" r="4" fill="#ffffff" stroke-width="2"/>
      <!-- подоконник -->
      <rect x="40" y="450" width="210" height="18" rx="4" fill="#ffffff"/>
    </g>
    <g class="v-problem">
      <!-- створка распахнута внутрь комнаты -->
      <polygon points="62,162 18,190 18,420 62,438" fill="#dff3ff" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
      <line x1="24" y1="300" x2="56" y2="300" stroke="#2b3a4a" stroke-width="3"/>
      <!-- снег на подоконнике -->
      <path d="M44 452 Q60 430 90 440 Q115 426 140 442 Q170 432 200 448 Q215 446 222 452 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
      <circle cx="80" cy="480" r="4" fill="#ffffff" stroke="#7fb6e0" stroke-width="2"/>
      <circle cx="150" cy="490" r="4" fill="#ffffff" stroke="#7fb6e0" stroke-width="2"/>
      <!-- холодные вихри влетают в класс -->
      <g fill="none" stroke="#4aa3f0" stroke-width="5" stroke-linecap="round">
        <path d="M170 220 c25 -18 55 -6 50 14 c-4 16 -26 16 -26 2 c0 -8 10 -10 14 -5">
          <animateTransform attributeName="transform" type="translate" values="0 0;30 6;0 0" dur="3s" repeatCount="indefinite"/>
        </path>
        <path d="M150 320 c30 -16 60 -2 54 18 c-4 14 -24 14 -24 2">
          <animateTransform attributeName="transform" type="translate" values="0 0;36 -4;0 0" dur="2.6s" repeatCount="indefinite"/>
        </path>
        <path d="M200 400 c22 -14 46 -4 42 12 c-3 12 -20 12 -20 2">
          <animateTransform attributeName="transform" type="translate" values="0 0;26 8;0 0" dur="3.4s" repeatCount="indefinite"/>
        </path>
      </g>
      <!-- снежинки летят внутрь -->
      <g fill="#ffffff" stroke="#7fb6e0" stroke-width="2">
        <circle cx="220" cy="270" r="5">
          <animate attributeName="cx" values="200;260;200" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="230" cy="360" r="4">
          <animate attributeName="cx" values="210;262;210" dur="2.4s" repeatCount="indefinite"/>
        </circle>
      </g>
    </g>
    <g class="v-ok">
      <!-- окно закрыто: переплёт и ручка -->
      <g stroke="#2b3a4a" stroke-width="4">
        <line x1="145" y1="162" x2="145" y2="438"/>
        <line x1="62" y1="300" x2="228" y2="300"/>
        <rect x="150" y="306" width="8" height="26" rx="3" fill="#b9c4ce" stroke-width="2"/>
      </g>
      <g stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.8">
        <line x1="78" y1="210" x2="104" y2="184"/>
        <line x1="164" y1="230" x2="196" y2="198"/>
      </g>
    </g>
    <rect class="obj-hit" x="10" y="130" width="255" height="400" rx="12" fill="transparent" stroke="none"/>
  </g>

  <!-- ===== ОБЪЕКТ: батарея (заставлена шкафом / свободна) ===== -->
  <g id="obj-class-radiator" class="obj" data-state="problem">
    <g class="v-ok">
      <!-- отражающий экран за батареей -->
      <rect x="305" y="468" width="170" height="108" rx="6" fill="url(#scl-foil)" stroke="#2b3a4a" stroke-width="3"/>
      <g stroke="#ffffff" stroke-width="4" stroke-linecap="round">
        <line x1="318" y1="560" x2="350" y2="478"/>
        <line x1="440" y1="560" x2="462" y2="500"/>
      </g>
    </g>
    <!-- сама батарея (видна всегда) -->
    <g stroke="#2b3a4a" stroke-width="3" fill="#f2f5f8">
      <rect x="320" y="485" width="18" height="80" rx="8"/>
      <rect x="342" y="485" width="18" height="80" rx="8"/>
      <rect x="364" y="485" width="18" height="80" rx="8"/>
      <rect x="386" y="485" width="18" height="80" rx="8"/>
      <rect x="408" y="485" width="18" height="80" rx="8"/>
      <rect x="430" y="485" width="18" height="80" rx="8"/>
      <rect x="314" y="500" width="140" height="10" rx="4"/>
      <rect x="314" y="540" width="140" height="10" rx="4"/>
      <rect x="452" y="560" width="10" height="80" fill="#dfe6ec"/>
    </g>
    <g class="v-ok">
      <!-- тёплый воздух свободно идёт в класс -->
      <g fill="none" stroke="#ff8c69" stroke-width="4" stroke-linecap="round">
        <path d="M350 470 q-10 -12 0 -24 q10 -12 0 -24"/>
        <path d="M385 470 q-10 -12 0 -24 q10 -12 0 -24"/>
        <path d="M420 470 q-10 -12 0 -24 q10 -12 0 -24"/>
      </g>
    </g>
    <g class="v-problem">
      <!-- высокий шкаф загородил батарею -->
      <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
        <rect x="294" y="392" width="192" height="250" rx="6" fill="#d9a066"/>
        <line x1="390" y1="404" x2="390" y2="630"/>
        <rect x="304" y="404" width="76" height="226" rx="4" fill="#e6b47c" stroke-width="3"/>
        <rect x="400" y="404" width="76" height="226" rx="4" fill="#e6b47c" stroke-width="3"/>
        <circle cx="372" cy="520" r="6" fill="#ffd166" stroke-width="2"/>
        <circle cx="408" cy="520" r="6" fill="#ffd166" stroke-width="2"/>
        <!-- коробки на шкафу -->
        <rect x="310" y="356" width="80" height="36" rx="4" fill="#b9a6ff"/>
        <rect x="400" y="370" width="60" height="22" rx="4" fill="#7ad9b5"/>
      </g>
      <!-- тепло «застряло» за шкафом: маленькие волны у краёв -->
      <g fill="none" stroke="#ff8c69" stroke-width="3" stroke-linecap="round">
        <path d="M288 560 q-8 -8 0 -16 q8 -8 0 -16">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2s" repeatCount="indefinite"/>
        </path>
        <path d="M492 560 q-8 -8 0 -16 q8 -8 0 -16">
          <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite"/>
        </path>
      </g>
    </g>
    <rect class="obj-hit" x="275" y="345" width="225" height="300" rx="12" fill="transparent" stroke="none"/>
  </g>

  <!-- ===== Парты и стулья (декор) ===== -->
  <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
    <!-- ряд 1: спинки стульев -->
    <rect x="360" y="604" width="80" height="50" rx="8" fill="#7ad9b5"/>
    <rect x="620" y="604" width="80" height="50" rx="8" fill="#ffd166"/>
    <rect x="880" y="604" width="80" height="50" rx="8" fill="#b9a6ff"/>
    <rect x="1140" y="604" width="80" height="50" rx="8" fill="#8fd3ff"/>
    <!-- ряд 1: парты -->
    <rect x="300" y="650" width="200" height="16" rx="4" fill="#d9a066"/>
    <rect x="310" y="666" width="180" height="40" fill="#c98d50"/>
    <rect x="312" y="706" width="12" height="40" fill="#a8733e"/>
    <rect x="476" y="706" width="12" height="40" fill="#a8733e"/>
    <rect x="560" y="650" width="200" height="16" rx="4" fill="#d9a066"/>
    <rect x="570" y="666" width="180" height="40" fill="#c98d50"/>
    <rect x="572" y="706" width="12" height="40" fill="#a8733e"/>
    <rect x="736" y="706" width="12" height="40" fill="#a8733e"/>
    <rect x="820" y="650" width="200" height="16" rx="4" fill="#d9a066"/>
    <rect x="830" y="666" width="180" height="40" fill="#c98d50"/>
    <rect x="832" y="706" width="12" height="40" fill="#a8733e"/>
    <rect x="996" y="706" width="12" height="40" fill="#a8733e"/>
    <rect x="1080" y="650" width="200" height="16" rx="4" fill="#d9a066"/>
    <rect x="1090" y="666" width="180" height="40" fill="#c98d50"/>
    <rect x="1092" y="706" width="12" height="40" fill="#a8733e"/>
    <rect x="1256" y="706" width="12" height="40" fill="#a8733e"/>
    <!-- ряд 2: спинки стульев -->
    <rect x="280" y="718" width="96" height="58" rx="8" fill="#ff8c69"/>
    <rect x="570" y="718" width="96" height="58" rx="8" fill="#7ad9b5"/>
    <rect x="860" y="718" width="96" height="58" rx="8" fill="#ffd166"/>
    <rect x="1150" y="718" width="96" height="58" rx="8" fill="#b9a6ff"/>
    <!-- ряд 2: парты -->
    <rect x="210" y="772" width="240" height="20" rx="5" fill="#d9a066"/>
    <rect x="222" y="792" width="216" height="48" fill="#c98d50"/>
    <rect x="224" y="840" width="14" height="50" fill="#a8733e"/>
    <rect x="422" y="840" width="14" height="50" fill="#a8733e"/>
    <rect x="500" y="772" width="240" height="20" rx="5" fill="#d9a066"/>
    <rect x="512" y="792" width="216" height="48" fill="#c98d50"/>
    <rect x="514" y="840" width="14" height="50" fill="#a8733e"/>
    <rect x="712" y="840" width="14" height="50" fill="#a8733e"/>
    <rect x="790" y="772" width="240" height="20" rx="5" fill="#d9a066"/>
    <rect x="802" y="792" width="216" height="48" fill="#c98d50"/>
    <rect x="804" y="840" width="14" height="50" fill="#a8733e"/>
    <rect x="1002" y="840" width="14" height="50" fill="#a8733e"/>
    <rect x="1080" y="772" width="240" height="20" rx="5" fill="#d9a066"/>
    <rect x="1092" y="792" width="216" height="48" fill="#c98d50"/>
    <rect x="1094" y="840" width="14" height="50" fill="#a8733e"/>
    <rect x="1292" y="840" width="14" height="50" fill="#a8733e"/>
    <!-- тетради и пенал на партах -->
    <rect x="600" y="640" width="50" height="10" rx="2" fill="#8fd3ff" stroke-width="2"/>
    <rect x="1120" y="640" width="60" height="10" rx="3" fill="#ff8c69" stroke-width="2"/>
    <rect x="280" y="762" width="60" height="10" rx="2" fill="#ffd166" stroke-width="2"/>
  </g>

  <!-- ===== ОБЪЕКТ: лампы на потолке ===== -->
  <g id="obj-class-lights" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- свечение вокруг ламп (горят зря — в классе пусто и солнечно) -->
      <g>
        <animate attributeName="opacity" values="0.75;1;0.75" dur="2.4s" repeatCount="indefinite"/>
        <circle cx="400" cy="108" r="95" fill="url(#scl-glow)"/>
        <circle cx="580" cy="108" r="95" fill="url(#scl-glow)"/>
        <circle cx="760" cy="108" r="95" fill="url(#scl-glow)"/>
        <polygon points="378,112 422,112 470,230 330,230" fill="#fff2a8" opacity="0.35"/>
        <polygon points="558,112 602,112 650,230 510,230" fill="#fff2a8" opacity="0.35"/>
        <polygon points="738,112 782,112 830,230 690,230" fill="#fff2a8" opacity="0.35"/>
      </g>
    </g>
    <!-- провода и абажуры (видны всегда) -->
    <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
      <line x1="400" y1="40" x2="400" y2="70"/>
      <line x1="580" y1="40" x2="580" y2="70"/>
      <line x1="760" y1="40" x2="760" y2="70"/>
      <path d="M370 70 L430 70 L455 100 L345 100 Z" fill="#ff8c69"/>
      <path d="M550 70 L610 70 L635 100 L525 100 Z" fill="#ff8c69"/>
      <path d="M730 70 L790 70 L815 100 L705 100 Z" fill="#ff8c69"/>
    </g>
    <g class="v-problem">
      <g stroke="#2b3a4a" stroke-width="3" fill="#fff59a">
        <ellipse cx="400" cy="106" rx="22" ry="12"/>
        <ellipse cx="580" cy="106" rx="22" ry="12"/>
        <ellipse cx="760" cy="106" rx="22" ry="12"/>
      </g>
      <!-- лучики -->
      <g stroke="#f2b632" stroke-width="4" stroke-linecap="round">
        <line x1="400" y1="126" x2="400" y2="142"/><line x1="374" y1="120" x2="364" y2="132"/><line x1="426" y1="120" x2="436" y2="132"/>
        <line x1="580" y1="126" x2="580" y2="142"/><line x1="554" y1="120" x2="544" y2="132"/><line x1="606" y1="120" x2="616" y2="132"/>
        <line x1="760" y1="126" x2="760" y2="142"/><line x1="734" y1="120" x2="724" y2="132"/><line x1="786" y1="120" x2="796" y2="132"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- лампы выключены: серые колбы -->
      <g stroke="#2b3a4a" stroke-width="3" fill="#d6dde3">
        <ellipse cx="400" cy="106" rx="22" ry="12"/>
        <ellipse cx="580" cy="106" rx="22" ry="12"/>
        <ellipse cx="760" cy="106" rx="22" ry="12"/>
      </g>
    </g>
    <rect class="obj-hit" x="320" y="5" width="520" height="140" rx="12" fill="transparent" stroke="none"/>
  </g>

  <!-- ===== ОБЪЕКТ: проектор и экран ===== -->
  <g id="obj-projector" class="obj" data-state="problem">
    <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
      <!-- крепление к потолку и корпус -->
      <rect x="912" y="40" width="16" height="40" fill="#b9c4ce"/>
      <rect x="868" y="78" width="104" height="42" rx="10" fill="#e8edf2"/>
      <circle cx="972" cy="99" r="13" fill="#5a6675"/>
      <circle cx="972" cy="99" r="6" fill="#8fd3ff" stroke-width="2"/>
      <g stroke-width="3" stroke-linecap="round">
        <line x1="882" y1="88" x2="882" y2="110"/>
        <line x1="892" y1="88" x2="892" y2="110"/>
        <line x1="902" y1="88" x2="902" y2="110"/>
      </g>
      <!-- рулонный экран -->
      <rect x="1048" y="118" width="224" height="20" rx="8" fill="#cfd8e2"/>
      <rect x="1060" y="138" width="200" height="206" fill="#ffffff"/>
      <rect x="1054" y="342" width="212" height="10" rx="4" fill="#cfd8e2"/>
      <line x1="1160" y1="352" x2="1160" y2="372" stroke-width="2"/>
      <circle cx="1160" cy="376" r="5" fill="#ffd166" stroke-width="2"/>
    </g>
    <g class="v-problem">
      <!-- маленький огонёк ожидания (standby) мигает -->
      <circle cx="944" cy="110" r="10" fill="#ffd166" opacity="0.4">
        <animate attributeName="opacity" values="0.1;0.6;0.1" dur="1.6s" repeatCount="indefinite"/>
      </circle>
      <circle cx="944" cy="110" r="5" fill="#ffb347" stroke="#2b3a4a" stroke-width="2"/>
      <!-- лёгкое свечение у вентилятора -->
      <ellipse cx="892" cy="99" rx="22" ry="16" fill="#bfeaff" opacity="0.5">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.2s" repeatCount="indefinite"/>
      </ellipse>
    </g>
    <g class="v-ok">
      <circle cx="944" cy="110" r="5" fill="#5a6675" stroke="#2b3a4a" stroke-width="2"/>
    </g>
    <rect class="obj-hit" x="845" y="25" width="435" height="365" rx="12" fill="transparent" stroke="none"/>
  </g>

  <!-- ===== ОБЪЕКТ: компьютеры на боковом столе ===== -->
  <g id="obj-computers" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- мягкое свечение включённых экранов -->
      <ellipse cx="1440" cy="440" rx="170" ry="80" fill="url(#scl-screen-glow)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
      </ellipse>
    </g>
    <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
      <!-- стол -->
      <rect x="1295" y="495" width="290" height="20" rx="4" fill="#d9a066"/>
      <rect x="1305" y="515" width="14" height="125" fill="#a8733e"/>
      <rect x="1561" y="515" width="14" height="125" fill="#a8733e"/>
      <!-- системные блоки под столом -->
      <rect x="1330" y="560" width="46" height="80" rx="4" fill="#cfd8e2"/>
      <rect x="1420" y="560" width="46" height="80" rx="4" fill="#cfd8e2"/>
      <rect x="1505" y="560" width="46" height="80" rx="4" fill="#cfd8e2"/>
      <!-- мониторы: рамки и ножки -->
      <rect x="1305" y="398" width="86" height="70" rx="6" fill="#4a5a6b"/>
      <rect x="1398" y="398" width="86" height="70" rx="6" fill="#4a5a6b"/>
      <rect x="1491" y="398" width="86" height="70" rx="6" fill="#4a5a6b"/>
      <rect x="1342" y="468" width="12" height="18" fill="#4a5a6b" stroke-width="3"/>
      <rect x="1435" y="468" width="12" height="18" fill="#4a5a6b" stroke-width="3"/>
      <rect x="1528" y="468" width="12" height="18" fill="#4a5a6b" stroke-width="3"/>
      <rect x="1326" y="486" width="44" height="9" rx="3" fill="#4a5a6b" stroke-width="3"/>
      <rect x="1419" y="486" width="44" height="9" rx="3" fill="#4a5a6b" stroke-width="3"/>
      <rect x="1512" y="486" width="44" height="9" rx="3" fill="#4a5a6b" stroke-width="3"/>
    </g>
    <g class="v-problem">
      <!-- экраны включены, на них заставки -->
      <g stroke="#2b3a4a" stroke-width="2">
        <rect x="1313" y="406" width="70" height="54" rx="3" fill="#7ad9b5"/>
        <rect x="1406" y="406" width="70" height="54" rx="3" fill="#b9a6ff"/>
        <rect x="1499" y="406" width="70" height="54" rx="3" fill="#8fd3ff"/>
      </g>
      <!-- прыгающий шарик -->
      <circle cx="1330" cy="425" r="8" fill="#ffd166" stroke="#2b3a4a" stroke-width="2">
        <animateTransform attributeName="transform" type="translate" values="0 0;36 20;0 0" dur="2s" repeatCount="indefinite"/>
      </circle>
      <!-- звёздочка-заставка -->
      <path d="M1441 418 l5 10 l11 1 l-8 7 l3 11 l-11 -6 l-11 6 l3 -11 l-8 -7 l11 -1 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="2">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite"/>
      </path>
      <!-- волна-заставка -->
      <path d="M1503 440 q8 -12 16 0 t16 0 t16 0 t16 0" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round">
        <animateTransform attributeName="transform" type="translate" values="0 -6;0 6;0 -6" dur="2.4s" repeatCount="indefinite"/>
      </path>
      <!-- лампочки питания на системных блоках -->
      <g fill="#ffd166" stroke="#2b3a4a" stroke-width="2">
        <circle cx="1353" cy="575" r="5"/><circle cx="1443" cy="575" r="5"/><circle cx="1528" cy="575" r="5"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- экраны выключены: тёмные с бликом -->
      <g stroke="#2b3a4a" stroke-width="2" fill="#2f3e4f">
        <rect x="1313" y="406" width="70" height="54" rx="3"/>
        <rect x="1406" y="406" width="70" height="54" rx="3"/>
        <rect x="1499" y="406" width="70" height="54" rx="3"/>
      </g>
      <g stroke="#5d7084" stroke-width="4" stroke-linecap="round">
        <line x1="1322" y1="450" x2="1346" y2="414"/>
        <line x1="1415" y1="450" x2="1439" y2="414"/>
        <line x1="1508" y1="450" x2="1532" y2="414"/>
      </g>
      <g fill="#5a6675" stroke="#2b3a4a" stroke-width="2">
        <circle cx="1353" cy="575" r="5"/><circle cx="1443" cy="575" r="5"/><circle cx="1528" cy="575" r="5"/>
      </g>
    </g>
    <rect class="obj-hit" x="1290" y="380" width="300" height="270" rx="12" fill="transparent" stroke="none"/>
  </g>
</svg>`;

/* ===================================================================
   СЦЕНА 2. КОРИДОР
   =================================================================== */
EB.scenes.schoolCorridor = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" class="scene-svg">
  <defs>
    <!-- небо за окнами (зима, солнечно) -->
    <linearGradient id="scr-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8fd3ff"/>
      <stop offset="1" stop-color="#e6f6ff"/>
    </linearGradient>
    <!-- свечение ламп -->
    <radialGradient id="scr-glow">
      <stop offset="0" stop-color="#fff2a8" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#fff2a8" stop-opacity="0"/>
    </radialGradient>
    <!-- яркая подсветка автомата -->
    <radialGradient id="scr-vend-glow">
      <stop offset="0" stop-color="#fffbd6" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#fffbd6" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- ===== Стены, потолок, пол ===== -->
  <rect x="0" y="0" width="1600" height="900" fill="#e4efff"/>
  <rect x="0" y="0" width="1600" height="36" fill="#d4e2f5"/>
  <line x1="0" y1="36" x2="1600" y2="36" stroke="#2b3a4a" stroke-width="3"/>
  <rect x="0" y="470" width="1600" height="150" fill="#b9e4d0"/>
  <line x1="0" y1="470" x2="1600" y2="470" stroke="#2b3a4a" stroke-width="3"/>
  <!-- пол: плитка -->
  <rect x="0" y="620" width="1600" height="280" fill="#e9e1d2"/>
  <line x1="0" y1="620" x2="1600" y2="620" stroke="#2b3a4a" stroke-width="4"/>
  <g fill="#d8cdb8">
    <rect x="0" y="620" width="100" height="70"/><rect x="200" y="620" width="100" height="70"/>
    <rect x="400" y="620" width="100" height="70"/><rect x="600" y="620" width="100" height="70"/>
    <rect x="800" y="620" width="100" height="70"/><rect x="1000" y="620" width="100" height="70"/>
    <rect x="1200" y="620" width="100" height="70"/><rect x="1400" y="620" width="100" height="70"/>
    <rect x="100" y="690" width="100" height="90"/><rect x="300" y="690" width="100" height="90"/>
    <rect x="500" y="690" width="100" height="90"/><rect x="700" y="690" width="100" height="90"/>
    <rect x="900" y="690" width="100" height="90"/><rect x="1100" y="690" width="100" height="90"/>
    <rect x="1300" y="690" width="100" height="90"/><rect x="1500" y="690" width="100" height="90"/>
    <rect x="0" y="780" width="100" height="120"/><rect x="200" y="780" width="100" height="120"/>
    <rect x="400" y="780" width="100" height="120"/><rect x="600" y="780" width="100" height="120"/>
    <rect x="800" y="780" width="100" height="120"/><rect x="1000" y="780" width="100" height="120"/>
    <rect x="1200" y="780" width="100" height="120"/><rect x="1400" y="780" width="100" height="120"/>
  </g>

  <!-- солнечные пятна от окон на полу -->
  <polygon points="400,170 570,170 700,900 470,900" fill="#fff6c4" opacity="0.35"/>
  <polygon points="610,170 780,170 910,900 680,900" fill="#fff6c4" opacity="0.35"/>

  <!-- ===== Окно (декор) ===== -->
  <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
    <rect x="400" y="170" width="170" height="270" rx="6" fill="#ffffff"/>
    <rect x="412" y="182" width="146" height="246" fill="url(#scr-sky)"/>
    <circle cx="520" cy="225" r="24" fill="#ffd166" stroke-width="3"/>
    <path d="M412 380 Q460 352 510 372 Q535 362 558 368 L558 428 L412 428 Z" fill="#ffffff" stroke-width="3"/>
    <line x1="485" y1="182" x2="485" y2="428"/>
    <line x1="412" y1="300" x2="558" y2="300"/>
    <rect x="392" y="440" width="186" height="16" rx="4" fill="#ffffff"/>
  </g>

  <!-- ===== Информационный стенд и цветок (декор) ===== -->
  <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
    <rect x="830" y="190" width="160" height="210" rx="8" fill="#d9a066"/>
    <rect x="842" y="202" width="136" height="186" rx="4" fill="#f3d9b1"/>
    <rect x="852" y="214" width="50" height="64" fill="#ffffff" stroke-width="3"/>
    <rect x="914" y="220" width="54" height="40" fill="#ffd166" stroke-width="3"/>
    <rect x="910" y="272" width="56" height="70" fill="#8fd3ff" stroke-width="3"/>
    <rect x="856" y="292" width="44" height="80" fill="#7ad9b5" stroke-width="3"/>
    <circle cx="877" cy="214" r="5" fill="#ff8c69" stroke-width="2"/>
    <circle cx="941" cy="220" r="5" fill="#ff8c69" stroke-width="2"/>
    <!-- цветок в горшке -->
    <path d="M880 620 L870 540 L950 540 L940 620 Z" fill="#ff8c69"/>
    <path d="M910 540 C880 500 860 480 870 450 C900 470 912 500 910 540 Z" fill="#7ad9b5"/>
    <path d="M910 540 C940 500 960 470 955 440 C925 460 908 500 910 540 Z" fill="#4fa889"/>
    <path d="M910 540 C905 500 910 470 920 450" fill="none"/>
  </g>

  <!-- ===== Шкафчики (декор) ===== -->
  <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
    <rect x="1180" y="290" width="70" height="330" rx="4" fill="#ff8c69"/>
    <rect x="1250" y="290" width="70" height="330" rx="4" fill="#b9a6ff"/>
    <rect x="1320" y="290" width="70" height="330" rx="4" fill="#8fd3ff"/>
    <g stroke-width="3" stroke-linecap="round">
      <line x1="1196" y1="310" x2="1234" y2="310"/><line x1="1196" y1="322" x2="1234" y2="322"/><line x1="1196" y1="334" x2="1234" y2="334"/>
      <line x1="1266" y1="310" x2="1304" y2="310"/><line x1="1266" y1="322" x2="1304" y2="322"/><line x1="1266" y1="334" x2="1304" y2="334"/>
      <line x1="1336" y1="310" x2="1374" y2="310"/><line x1="1336" y1="322" x2="1374" y2="322"/><line x1="1336" y1="334" x2="1374" y2="334"/>
    </g>
    <rect x="1234" y="440" width="8" height="34" rx="3" fill="#f2f5f8" stroke-width="2"/>
    <rect x="1304" y="440" width="8" height="34" rx="3" fill="#f2f5f8" stroke-width="2"/>
    <rect x="1374" y="440" width="8" height="34" rx="3" fill="#f2f5f8" stroke-width="2"/>
  </g>

  <!-- ===== ОБЪЕКТ: входная двустворчатая дверь ===== -->
  <g id="obj-corridor-door" class="obj" data-state="problem">
    <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
      <!-- коробка двери и фрамуга -->
      <rect x="40" y="150" width="260" height="470" rx="6" fill="#8a9bb0"/>
      <rect x="54" y="164" width="232" height="50" rx="3" fill="url(#scr-sky)"/>
      <line x1="170" y1="164" x2="170" y2="214" stroke-width="3"/>
      <!-- левая створка (закрыта всегда) -->
      <rect x="54" y="226" width="116" height="394" fill="#7ad9b5"/>
      <rect x="70" y="244" width="84" height="180" rx="4" fill="url(#scr-sky)" stroke-width="3"/>
      <rect x="66" y="460" width="92" height="14" rx="6" fill="#dfe6ec" stroke-width="3"/>
    </g>
    <g class="v-problem">
      <!-- правая створка распахнута: виден заснеженный двор -->
      <rect x="170" y="226" width="116" height="394" fill="url(#scr-sky)" stroke="#2b3a4a" stroke-width="4"/>
      <path d="M170 560 Q220 540 286 552 L286 620 L170 620 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
      <polygon points="225,450 200,520 250,520" fill="#4fa889" stroke="#2b3a4a" stroke-width="3"/>
      <!-- открытая створка повернулась к нам -->
      <polygon points="286,226 350,200 350,650 286,620" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="298,252 338,236 338,440 298,446" fill="#bfe6ff" stroke="#2b3a4a" stroke-width="3"/>
      <!-- клинышек-подпорка на полу -->
      <polygon points="300,640 352,640 352,618" fill="#d9a066" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <!-- снег у порога -->
      <path d="M150 620 Q190 604 240 612 Q280 604 320 620 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
      <!-- холодный воздух и снежинки -->
      <g fill="none" stroke="#4aa3f0" stroke-width="5" stroke-linecap="round">
        <path d="M230 320 c25 -18 55 -6 50 14 c-4 16 -26 16 -26 2 c0 -8 10 -10 14 -5">
          <animateTransform attributeName="transform" type="translate" values="0 0;60 8;0 0" dur="3s" repeatCount="indefinite"/>
        </path>
        <path d="M210 470 c30 -16 60 -2 54 18 c-4 14 -24 14 -24 2">
          <animateTransform attributeName="transform" type="translate" values="0 0;70 -4;0 0" dur="2.6s" repeatCount="indefinite"/>
        </path>
        <path d="M250 560 c22 -14 46 -4 42 12 c-3 12 -20 12 -20 2">
          <animateTransform attributeName="transform" type="translate" values="0 0;50 6;0 0" dur="3.4s" repeatCount="indefinite"/>
        </path>
      </g>
      <g fill="#ffffff" stroke="#7fb6e0" stroke-width="2">
        <circle cx="250" cy="280" r="5">
          <animate attributeName="cx" values="230;330;230" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="240" cy="400" r="6">
          <animate attributeName="cx" values="220;340;220" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="260" cy="520" r="4">
          <animate attributeName="cx" values="240;320;240" dur="3.6s" repeatCount="indefinite"/>
        </circle>
      </g>
    </g>
    <g class="v-ok">
      <!-- правая створка закрыта -->
      <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
        <rect x="170" y="226" width="116" height="394" fill="#7ad9b5"/>
        <rect x="186" y="244" width="84" height="180" rx="4" fill="url(#scr-sky)" stroke-width="3"/>
        <rect x="182" y="460" width="92" height="14" rx="6" fill="#dfe6ec" stroke-width="3"/>
        <!-- доводчики: коробочка и рычаг на каждой створке -->
        <rect x="74" y="228" width="44" height="14" rx="4" fill="#5a6675" stroke-width="3"/>
        <path d="M118 235 L150 222 L166 232" fill="none" stroke-width="4" stroke-linecap="round"/>
        <rect x="222" y="228" width="44" height="14" rx="4" fill="#5a6675" stroke-width="3"/>
        <path d="M222 235 L190 222 L174 232" fill="none" stroke-width="4" stroke-linecap="round"/>
      </g>
    </g>
    <rect class="obj-hit" x="20" y="135" width="350" height="525" rx="12" fill="transparent" stroke="none"/>
  </g>

  <!-- ===== ОБЪЕКТ: окно со щелью (тонкая проблема) ===== -->
  <g id="obj-corridor-window" class="obj" data-state="problem">
    <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
      <rect x="610" y="170" width="170" height="270" rx="6" fill="#ffffff"/>
      <rect x="622" y="182" width="146" height="246" fill="url(#scr-sky)"/>
      <path d="M622 390 Q670 360 720 378 Q745 368 768 374 L768 428 L622 428 Z" fill="#ffffff" stroke-width="3"/>
      <polygon points="660,300 640,350 680,350" fill="#4fa889" stroke-width="3"/>
      <line x1="695" y1="182" x2="695" y2="428"/>
      <line x1="622" y1="300" x2="768" y2="300"/>
      <rect x="602" y="440" width="186" height="16" rx="4" fill="#ffffff"/>
    </g>
    <g class="v-problem">
      <!-- верхняя створка чуть приоткрыта: тёмная щель -->
      <rect x="697" y="184" width="69" height="8" fill="#2b3a4a"/>
      <line x1="697" y1="196" x2="766" y2="196" stroke="#2b3a4a" stroke-width="3"/>
      <!-- небольшие сквозняки -->
      <g fill="none" stroke="#4aa3f0" stroke-width="4" stroke-linecap="round">
        <path d="M770 200 c16 -10 34 -2 30 10 c-3 9 -16 9 -16 1">
          <animateTransform attributeName="transform" type="translate" values="0 0;16 6;0 0" dur="2.8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.8s" repeatCount="indefinite"/>
        </path>
        <path d="M760 230 c14 -8 28 -2 25 8">
          <animateTransform attributeName="transform" type="translate" values="0 0;20 4;0 0" dur="2.2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0.3;1" dur="2.2s" repeatCount="indefinite"/>
        </path>
      </g>
    </g>
    <g class="v-ok">
      <!-- окно утеплено: уплотнитель по контуру створок -->
      <g fill="none" stroke="#b9a6ff" stroke-width="4">
        <rect x="626" y="186" width="138" height="238" rx="2"/>
      </g>
      <g stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.8">
        <line x1="636" y1="230" x2="662" y2="204"/>
        <line x1="712" y1="250" x2="742" y2="220"/>
      </g>
    </g>
    <rect class="obj-hit" x="590" y="150" width="215" height="320" rx="12" fill="transparent" stroke="none"/>
  </g>

  <!-- ===== ОБЪЕКТ: питьевой фонтанчик ===== -->
  <g id="obj-fountain" class="obj" data-state="problem">
    <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
      <!-- задняя панель -->
      <rect x="1030" y="370" width="100" height="100" rx="10" fill="#dfe6ec"/>
      <!-- чаша -->
      <path d="M1020 470 L1140 470 Q1136 520 1080 524 Q1024 520 1020 470 Z" fill="#f2f5f8"/>
      <!-- ножка до пола -->
      <rect x="1066" y="522" width="28" height="98" fill="#cfd8e2"/>
      <rect x="1050" y="606" width="60" height="14" rx="4" fill="#b9c4ce"/>
      <!-- носик и кнопка -->
      <path d="M1068 470 L1068 452 Q1068 444 1078 444 L1092 444" fill="none" stroke-width="5" stroke-linecap="round"/>
      <circle cx="1112" cy="410" r="10" fill="#8fd3ff" stroke-width="3"/>
      <!-- слив в чаше -->
      <ellipse cx="1080" cy="482" rx="14" ry="4" fill="#9fb0bf" stroke-width="2"/>
    </g>
    <g class="v-problem">
      <!-- вода льётся без остановки -->
      <path d="M1092 444 Q1130 400 1104 482" fill="none" stroke="#4aa3f0" stroke-width="9" stroke-linecap="round"/>
      <path d="M1092 444 Q1130 400 1104 482" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-dasharray="8 8">
        <animate attributeName="stroke-dashoffset" values="32;0" dur="0.6s" repeatCount="indefinite"/>
      </path>
      <!-- рябь в чаше -->
      <ellipse cx="1090" cy="482" rx="24" ry="5" fill="none" stroke="#4aa3f0" stroke-width="3">
        <animate attributeName="rx" values="10;28;10" dur="1s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/>
      </ellipse>
      <!-- брызги -->
      <g fill="#8fd3ff" stroke="#2b3a4a" stroke-width="2">
        <circle cx="1112" cy="470" r="4">
          <animate attributeName="cy" values="474;460;474" dur="0.8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="1070" cy="470" r="3">
          <animate attributeName="cy" values="474;462;474" dur="0.9s" repeatCount="indefinite"/>
        </circle>
      </g>
    </g>
    <g class="v-ok">
      <!-- кран закрыт: сухо, только блик на носике -->
      <line x1="1074" y1="448" x2="1086" y2="448" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="1005" y="355" width="150" height="275" rx="12" fill="transparent" stroke="none"/>
  </g>

  <!-- ===== ОБЪЕКТ: торговый автомат ===== -->
  <g id="obj-vending" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- очень яркое свечение вокруг -->
      <ellipse cx="1495" cy="400" rx="140" ry="230" fill="url(#scr-vend-glow)">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2.6s" repeatCount="indefinite"/>
      </ellipse>
    </g>
    <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
      <!-- корпус -->
      <rect x="1420" y="210" width="160" height="410" rx="10" fill="#b9a6ff"/>
      <rect x="1434" y="224" width="96" height="30" rx="5" fill="#d7ccff"/>
      <rect x="1434" y="264" width="96" height="260" rx="4" fill="#e9f3fb"/>
      <!-- полки -->
      <g stroke-width="3">
        <line x1="1434" y1="324" x2="1530" y2="324"/>
        <line x1="1434" y1="390" x2="1530" y2="390"/>
        <line x1="1434" y1="456" x2="1530" y2="456"/>
      </g>
      <!-- снеки: пачки, бутылки, батончики -->
      <g stroke-width="2">
        <rect x="1444" y="284" width="20" height="38" rx="4" fill="#ff8c69"/>
        <rect x="1472" y="284" width="20" height="38" rx="4" fill="#ffd166"/>
        <rect x="1500" y="284" width="20" height="38" rx="4" fill="#7ad9b5"/>
        <path d="M1448 388 L1448 352 Q1448 342 1454 338 L1454 330 L1460 330 L1460 338 Q1466 342 1466 352 L1466 388 Z" fill="#8fd3ff"/>
        <path d="M1476 388 L1476 352 Q1476 342 1482 338 L1482 330 L1488 330 L1488 338 Q1494 342 1494 352 L1494 388 Z" fill="#8fd3ff"/>
        <path d="M1504 388 L1504 352 Q1504 342 1510 338 L1510 330 L1516 330 L1516 338 Q1522 342 1522 352 L1522 388 Z" fill="#7ad9b5"/>
        <rect x="1442" y="430" width="36" height="24" rx="4" fill="#ff8c69"/>
        <rect x="1486" y="430" width="36" height="24" rx="4" fill="#ffd166"/>
        <rect x="1442" y="496" width="36" height="24" rx="4" fill="#b9a6ff"/>
        <rect x="1486" y="496" width="36" height="24" rx="4" fill="#ff8c69"/>
      </g>
      <!-- кнопки и щель для монет -->
      <rect x="1540" y="270" width="28" height="90" rx="5" fill="#e9e3ff" stroke-width="3"/>
      <g fill="#ffffff" stroke-width="2">
        <circle cx="1554" cy="286" r="5"/><circle cx="1554" cy="304" r="5"/><circle cx="1554" cy="322" r="5"/><circle cx="1554" cy="340" r="5"/>
      </g>
      <rect x="1546" y="380" width="16" height="30" rx="3" fill="#5a6675" stroke-width="3"/>
      <!-- лоток выдачи -->
      <rect x="1440" y="544" width="84" height="40" rx="5" fill="#5a6675"/>
      <rect x="1430" y="604" width="16" height="16" fill="#5a6675" stroke-width="3"/>
      <rect x="1554" y="604" width="16" height="16" fill="#5a6675" stroke-width="3"/>
    </g>
    <g class="v-problem">
      <!-- витрина и табло залиты ярким светом -->
      <rect x="1434" y="264" width="96" height="260" rx="4" fill="#fffbd0" opacity="0.6">
        <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2.6s" repeatCount="indefinite"/>
      </rect>
      <rect x="1434" y="224" width="96" height="30" rx="5" fill="#fff59a" stroke="#2b3a4a" stroke-width="4"/>
      <!-- лучи от табло -->
      <g stroke="#f2b632" stroke-width="4" stroke-linecap="round">
        <line x1="1482" y1="214" x2="1482" y2="196"/>
        <line x1="1450" y1="214" x2="1440" y2="200"/>
        <line x1="1514" y1="214" x2="1524" y2="200"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- эко-режим: подсветка приглушена, на табло листик -->
      <rect x="1434" y="264" width="96" height="260" rx="4" fill="#8aa5bd" opacity="0.25"/>
      <path d="M1468 248 C1468 230 1490 226 1500 228 C1500 244 1486 252 1468 248 Z" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="2"/>
      <line x1="1468" y1="248" x2="1488" y2="236" stroke="#2b3a4a" stroke-width="2"/>
    </g>
    <rect class="obj-hit" x="1405" y="185" width="190" height="450" rx="12" fill="transparent" stroke="none"/>
  </g>

  <!-- ===== ОБЪЕКТ: длинные лампы на потолке ===== -->
  <g id="obj-corridor-lights" class="obj" data-state="problem">
    <g class="v-problem">
      <g>
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2.4s" repeatCount="indefinite"/>
        <ellipse cx="300" cy="80" rx="150" ry="60" fill="url(#scr-glow)"/>
        <ellipse cx="620" cy="80" rx="150" ry="60" fill="url(#scr-glow)"/>
        <ellipse cx="940" cy="80" rx="150" ry="60" fill="url(#scr-glow)"/>
        <ellipse cx="1260" cy="80" rx="150" ry="60" fill="url(#scr-glow)"/>
        <polygon points="212,80 388,80 430,150 170,150" fill="#fff2a8" opacity="0.35"/>
        <polygon points="532,80 708,80 750,150 490,150" fill="#fff2a8" opacity="0.35"/>
        <polygon points="852,80 1028,80 1070,150 810,150" fill="#fff2a8" opacity="0.35"/>
        <polygon points="1172,80 1348,80 1390,150 1130,150" fill="#fff2a8" opacity="0.35"/>
      </g>
    </g>
    <!-- крепления и корпуса светильников -->
    <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round" fill="#f2f5f8">
      <line x1="230" y1="36" x2="230" y2="50"/><line x1="370" y1="36" x2="370" y2="50"/>
      <line x1="550" y1="36" x2="550" y2="50"/><line x1="690" y1="36" x2="690" y2="50"/>
      <line x1="870" y1="36" x2="870" y2="50"/><line x1="1010" y1="36" x2="1010" y2="50"/>
      <line x1="1190" y1="36" x2="1190" y2="50"/><line x1="1330" y1="36" x2="1330" y2="50"/>
      <rect x="200" y="50" width="200" height="18" rx="6"/>
      <rect x="520" y="50" width="200" height="18" rx="6"/>
      <rect x="840" y="50" width="200" height="18" rx="6"/>
      <rect x="1160" y="50" width="200" height="18" rx="6"/>
    </g>
    <g class="v-problem">
      <g stroke="#2b3a4a" stroke-width="3" fill="#fff59a">
        <rect x="212" y="68" width="176" height="12" rx="6"/>
        <rect x="532" y="68" width="176" height="12" rx="6"/>
        <rect x="852" y="68" width="176" height="12" rx="6"/>
        <rect x="1172" y="68" width="176" height="12" rx="6"/>
      </g>
      <g stroke="#f2b632" stroke-width="4" stroke-linecap="round">
        <line x1="260" y1="88" x2="252" y2="102"/><line x1="300" y1="88" x2="300" y2="104"/><line x1="340" y1="88" x2="348" y2="102"/>
        <line x1="580" y1="88" x2="572" y2="102"/><line x1="620" y1="88" x2="620" y2="104"/><line x1="660" y1="88" x2="668" y2="102"/>
        <line x1="900" y1="88" x2="892" y2="102"/><line x1="940" y1="88" x2="940" y2="104"/><line x1="980" y1="88" x2="988" y2="102"/>
        <line x1="1220" y1="88" x2="1212" y2="102"/><line x1="1260" y1="88" x2="1260" y2="104"/><line x1="1300" y1="88" x2="1308" y2="102"/>
      </g>
    </g>
    <g class="v-ok">
      <g stroke="#2b3a4a" stroke-width="3" fill="#d6dde3">
        <rect x="212" y="68" width="176" height="12" rx="6"/>
        <rect x="532" y="68" width="176" height="12" rx="6"/>
        <rect x="852" y="68" width="176" height="12" rx="6"/>
        <rect x="1172" y="68" width="176" height="12" rx="6"/>
      </g>
    </g>
    <rect class="obj-hit" x="170" y="5" width="1220" height="122" rx="12" fill="transparent" stroke="none"/>
  </g>
</svg>`;

/* ===================================================================
   СЦЕНА 3. СТОЛОВАЯ
   =================================================================== */
EB.scenes.schoolCanteen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" class="scene-svg">
  <defs>
    <linearGradient id="scn-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8fd3ff"/>
      <stop offset="1" stop-color="#e6f6ff"/>
    </linearGradient>
    <!-- раскалённая конфорка -->
    <radialGradient id="scn-heat">
      <stop offset="0" stop-color="#ffb347" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#ffb347" stop-opacity="0"/>
    </radialGradient>
    <!-- холодный свет из холодильника -->
    <radialGradient id="scn-cold">
      <stop offset="0" stop-color="#e0f6ff" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#e0f6ff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- ===== Стены и пол ===== -->
  <rect x="0" y="0" width="1600" height="900" fill="#fff4e0"/>
  <!-- кухонный фартук из плитки -->
  <rect x="0" y="280" width="1100" height="180" fill="#dff1fb"/>
  <g stroke="#bcdcee" stroke-width="2">
    <line x1="0" y1="325" x2="1100" y2="325"/><line x1="0" y1="370" x2="1100" y2="370"/><line x1="0" y1="415" x2="1100" y2="415"/>
    <line x1="100" y1="280" x2="100" y2="460"/><line x1="200" y1="280" x2="200" y2="460"/><line x1="300" y1="280" x2="300" y2="460"/>
    <line x1="400" y1="280" x2="400" y2="460"/><line x1="500" y1="280" x2="500" y2="460"/><line x1="600" y1="280" x2="600" y2="460"/>
    <line x1="700" y1="280" x2="700" y2="460"/><line x1="800" y1="280" x2="800" y2="460"/><line x1="900" y1="280" x2="900" y2="460"/>
    <line x1="1000" y1="280" x2="1000" y2="460"/>
  </g>
  <line x1="0" y1="280" x2="1100" y2="280" stroke="#2b3a4a" stroke-width="3"/>
  <!-- пол: клетка -->
  <rect x="0" y="600" width="1600" height="300" fill="#f3dfbc"/>
  <line x1="0" y1="600" x2="1600" y2="600" stroke="#2b3a4a" stroke-width="4"/>
  <g fill="#e6c999">
    <rect x="0" y="600" width="80" height="60"/><rect x="160" y="600" width="80" height="60"/><rect x="320" y="600" width="80" height="60"/>
    <rect x="480" y="600" width="80" height="60"/><rect x="640" y="600" width="80" height="60"/><rect x="800" y="600" width="80" height="60"/>
    <rect x="960" y="600" width="80" height="60"/><rect x="1120" y="600" width="80" height="60"/><rect x="1280" y="600" width="80" height="60"/>
    <rect x="1440" y="600" width="80" height="60"/>
    <rect x="80" y="660" width="80" height="80"/><rect x="240" y="660" width="80" height="80"/><rect x="400" y="660" width="80" height="80"/>
    <rect x="560" y="660" width="80" height="80"/><rect x="720" y="660" width="80" height="80"/><rect x="880" y="660" width="80" height="80"/>
    <rect x="1040" y="660" width="80" height="80"/><rect x="1200" y="660" width="80" height="80"/><rect x="1360" y="660" width="80" height="80"/>
    <rect x="1520" y="660" width="80" height="80"/>
    <rect x="0" y="740" width="80" height="160"/><rect x="160" y="740" width="80" height="160"/><rect x="320" y="740" width="80" height="160"/>
    <rect x="480" y="740" width="80" height="160"/><rect x="640" y="740" width="80" height="160"/><rect x="800" y="740" width="80" height="160"/>
    <rect x="960" y="740" width="80" height="160"/><rect x="1120" y="740" width="80" height="160"/><rect x="1280" y="740" width="80" height="160"/>
    <rect x="1440" y="740" width="80" height="160"/>
  </g>

  <!-- ===== Большое окно справа (декор) ===== -->
  <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
    <rect x="1170" y="80" width="380" height="250" rx="8" fill="#ffffff"/>
    <rect x="1182" y="92" width="356" height="226" fill="url(#scn-sky)"/>
    <circle cx="1480" cy="140" r="28" fill="#ffd166" stroke-width="3"/>
    <path d="M1182 270 Q1260 238 1340 258 Q1420 236 1538 262 L1538 318 L1182 318 Z" fill="#ffffff" stroke-width="3"/>
    <line x1="1360" y1="92" x2="1360" y2="318"/>
    <rect x="1160" y="330" width="400" height="16" rx="4" fill="#ffffff"/>
  </g>
  <polygon points="1180,346 1550,346 1300,900 760,900" fill="#fff6c4" opacity="0.25"/>

  <!-- ===== Полка с посудой над кухней (декор) ===== -->
  <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
    <rect x="520" y="150" width="260" height="14" rx="4" fill="#d9a066"/>
    <rect x="540" y="110" width="40" height="40" rx="6" fill="#ff8c69"/>
    <rect x="596" y="118" width="40" height="32" rx="6" fill="#ffd166"/>
    <circle cx="676" cy="122" r="28" fill="#ffffff"/>
    <circle cx="676" cy="122" r="16" fill="#e9f3fb" stroke-width="2"/>
    <rect x="716" y="112" width="44" height="38" rx="6" fill="#7ad9b5"/>
  </g>

  <!-- ===== Столы и табуреты (декор) ===== -->
  <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
    <!-- стол 1 -->
    <rect x="110" y="720" width="320" height="22" rx="6" fill="#ffd166"/>
    <rect x="130" y="742" width="16" height="120" fill="#a8733e"/>
    <rect x="394" y="742" width="16" height="120" fill="#a8733e"/>
    <ellipse cx="200" cy="712" rx="40" ry="8" fill="#ffffff"/>
    <ellipse cx="340" cy="712" rx="40" ry="8" fill="#ffffff"/>
    <!-- стол 2 -->
    <rect x="560" y="720" width="320" height="22" rx="6" fill="#7ad9b5"/>
    <rect x="580" y="742" width="16" height="120" fill="#a8733e"/>
    <rect x="844" y="742" width="16" height="120" fill="#a8733e"/>
    <rect x="640" y="700" width="70" height="20" rx="4" fill="#8fd3ff"/>
    <rect x="770" y="702" width="18" height="18" rx="3" fill="#ff8c69"/>
    <!-- стол 3 -->
    <rect x="1010" y="720" width="320" height="22" rx="6" fill="#b9a6ff"/>
    <rect x="1030" y="742" width="16" height="120" fill="#a8733e"/>
    <rect x="1294" y="742" width="16" height="120" fill="#a8733e"/>
    <ellipse cx="1170" cy="712" rx="40" ry="8" fill="#ffffff"/>
    <!-- табуреты -->
    <rect x="150" y="800" width="80" height="16" rx="6" fill="#ff8c69"/>
    <rect x="310" y="800" width="80" height="16" rx="6" fill="#8fd3ff"/>
    <rect x="600" y="800" width="80" height="16" rx="6" fill="#ffd166"/>
    <rect x="760" y="800" width="80" height="16" rx="6" fill="#ff8c69"/>
    <rect x="1050" y="800" width="80" height="16" rx="6" fill="#7ad9b5"/>
    <rect x="1210" y="800" width="80" height="16" rx="6" fill="#ffd166"/>
    <g fill="#5a6675" stroke-width="3">
      <rect x="184" y="816" width="12" height="60"/><rect x="344" y="816" width="12" height="60"/>
      <rect x="634" y="816" width="12" height="60"/><rect x="794" y="816" width="12" height="60"/>
      <rect x="1084" y="816" width="12" height="60"/><rect x="1244" y="816" width="12" height="60"/>
    </g>
  </g>

  <!-- ===== ОБЪЕКТ: холодильник ===== -->
  <g id="obj-canteen-fridge" class="obj" data-state="problem">
    <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
      <!-- корпус -->
      <rect x="40" y="150" width="180" height="450" rx="12" fill="#e9f3fb"/>
      <rect x="54" y="586" width="20" height="14" fill="#5a6675" stroke-width="3"/>
      <rect x="186" y="586" width="20" height="14" fill="#5a6675" stroke-width="3"/>
    </g>
    <g class="v-problem">
      <!-- дверь приоткрыта: видно освещённое нутро -->
      <rect x="52" y="162" width="156" height="420" rx="6" fill="#f7fdff" stroke="#2b3a4a" stroke-width="3"/>
      <circle cx="130" cy="300" r="120" fill="url(#scn-cold)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite"/>
      </circle>
      <g stroke="#2b3a4a" stroke-width="3">
        <line x1="52" y1="270" x2="208" y2="270"/>
        <line x1="52" y1="380" x2="208" y2="380"/>
        <line x1="52" y1="480" x2="208" y2="480"/>
        <!-- продукты -->
        <rect x="70" y="226" width="40" height="44" rx="5" fill="#ffd166"/>
        <rect x="130" y="236" width="56" height="34" rx="5" fill="#ff8c69"/>
        <path d="M76 380 L76 336 Q76 326 84 322 L84 312 L92 312 L92 322 Q100 326 100 336 L100 380 Z" fill="#ffffff"/>
        <circle cx="150" cy="364" r="16" fill="#7ad9b5"/>
        <rect x="70" y="440" width="120" height="40" rx="6" fill="#b9a6ff"/>
      </g>
      <!-- открытая дверь повернулась к нам -->
      <polygon points="220,156 262,182 262,590 220,598" fill="#dbeaf6" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
      <rect x="238" y="260" width="10" height="80" rx="4" fill="#9fb0bf" stroke="#2b3a4a" stroke-width="2"/>
      <!-- холодный туман выползает наружу -->
      <g fill="none" stroke="#7fc4f0" stroke-width="5" stroke-linecap="round">
        <path d="M150 540 c20 -14 46 -4 42 12 c-3 12 -20 12 -20 2">
          <animateTransform attributeName="transform" type="translate" values="0 0;50 10;0 0" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite"/>
        </path>
        <path d="M110 500 c24 -14 50 -2 44 14 c-4 10 -18 10 -18 0">
          <animateTransform attributeName="transform" type="translate" values="0 0;70 4;0 0" dur="3.6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;1;0.3" dur="3.6s" repeatCount="indefinite"/>
        </path>
      </g>
      <g fill="#ffffff" stroke="#7fb6e0" stroke-width="2">
        <circle cx="200" cy="560" r="4">
          <animate attributeName="cx" values="190;245;190" dur="2.8s" repeatCount="indefinite"/>
        </circle>
      </g>
    </g>
    <g class="v-ok">
      <!-- двери закрыты: морозилка сверху, холодильник снизу -->
      <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
        <line x1="40" y1="300" x2="220" y2="300"/>
        <rect x="190" y="200" width="12" height="70" rx="5" fill="#9fb0bf" stroke-width="3"/>
        <rect x="190" y="330" width="12" height="110" rx="5" fill="#9fb0bf" stroke-width="3"/>
        <!-- магнитик-снежинка -->
        <circle cx="90" cy="380" r="14" fill="#8fd3ff" stroke-width="3"/>
        <path d="M80 380 L100 380 M90 370 L90 390 M83 373 L97 387 M97 373 L83 387" stroke-width="2" stroke-linecap="round"/>
      </g>
    </g>
    <rect class="obj-hit" x="25" y="130" width="240" height="485" rx="12" fill="transparent" stroke="none"/>
  </g>

  <!-- ===== ОБЪЕКТ: плита ===== -->
  <g id="obj-stove" class="obj" data-state="problem">
    <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
      <!-- вытяжка -->
      <path d="M300 200 L460 200 L480 260 L280 260 Z" fill="#cfd8e2"/>
      <rect x="350" y="150" width="60" height="50" fill="#b9c4ce"/>
      <!-- корпус плиты -->
      <rect x="280" y="420" width="200" height="180" rx="8" fill="#f2f5f8"/>
      <rect x="276" y="410" width="208" height="16" rx="5" fill="#cfd8e2"/>
      <rect x="300" y="470" width="160" height="100" rx="8" fill="#5a6675"/>
      <rect x="316" y="486" width="128" height="60" rx="6" fill="#2f3e4f" stroke-width="3"/>
      <line x1="310" y1="462" x2="450" y2="462" stroke-width="5" stroke-linecap="round"/>
      <!-- ручки-переключатели -->
      <circle cx="310" cy="440" r="8" fill="#ffffff" stroke-width="3"/>
      <circle cx="340" cy="440" r="8" fill="#ffffff" stroke-width="3"/>
      <circle cx="420" cy="440" r="8" fill="#ffffff" stroke-width="3"/>
      <circle cx="450" cy="440" r="8" fill="#ffffff" stroke-width="3"/>
      <!-- правая конфорка (всегда выключена) -->
      <ellipse cx="430" cy="410" rx="34" ry="7" fill="#5a6675" stroke-width="3"/>
    </g>
    <g class="v-problem">
      <!-- левая конфорка раскалена, а на ней пустая сковорода -->
      <ellipse cx="330" cy="400" rx="80" ry="50" fill="url(#scn-heat)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.6s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="330" cy="410" rx="34" ry="7" fill="#ff8c69" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M296 398 L364 398 L358 408 L302 408 Z" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <line x1="364" y1="400" x2="410" y2="388" stroke="#2b3a4a" stroke-width="6" stroke-linecap="round"/>
      <!-- волны жара над пустой сковородой -->
      <g fill="none" stroke="#ff8c69" stroke-width="4" stroke-linecap="round">
        <path d="M316 384 q-8 -10 0 -20 q8 -10 0 -20">
          <animateTransform attributeName="transform" type="translate" values="0 4;0 -8;0 4" dur="1.4s" repeatCount="indefinite"/>
        </path>
        <path d="M344 384 q-8 -10 0 -20 q8 -10 0 -20">
          <animateTransform attributeName="transform" type="translate" values="0 -6;0 6;0 -6" dur="1.4s" repeatCount="indefinite"/>
        </path>
      </g>
      <!-- лампочка «включено» -->
      <circle cx="380" cy="440" r="7" fill="#ffb347" stroke="#2b3a4a" stroke-width="2"/>
    </g>
    <g class="v-ok">
      <!-- конфорка выключена, кастрюля с крышкой стоит в стороне -->
      <ellipse cx="330" cy="410" rx="34" ry="7" fill="#5a6675" stroke="#2b3a4a" stroke-width="3"/>
      <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
        <rect x="400" y="350" width="60" height="54" rx="6" fill="#8fd3ff"/>
        <path d="M394 352 Q430 330 466 352 Z" fill="#7ab8e0"/>
        <circle cx="430" cy="336" r="5" fill="#2b3a4a"/>
      </g>
      <circle cx="380" cy="440" r="7" fill="#5a6675" stroke="#2b3a4a" stroke-width="2"/>
    </g>
    <rect class="obj-hit" x="270" y="140" width="225" height="470" rx="12" fill="transparent" stroke="none"/>
  </g>

  <!-- ===== ОБЪЕКТ: большой кухонный кран и мойка ===== -->
  <g id="obj-canteen-tap" class="obj" data-state="problem">
    <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
      <!-- тумба мойки -->
      <rect x="520" y="440" width="260" height="160" rx="6" fill="#cfd8e2"/>
      <rect x="512" y="428" width="276" height="18" rx="5" fill="#e9eef3"/>
      <path d="M560 428 L740 428 L728 470 L572 470 Z" fill="#9fb0bf" stroke-width="3"/>
      <rect x="540" y="490" width="100" height="96" rx="5" fill="#dfe6ec" stroke-width="3"/>
      <rect x="660" y="490" width="100" height="96" rx="5" fill="#dfe6ec" stroke-width="3"/>
      <!-- высокий изогнутый кран -->
      <path d="M700 428 L700 340 Q700 310 670 310 Q640 310 640 340 L640 360" fill="none" stroke-width="16" stroke-linecap="round"/>
      <path d="M700 428 L700 340 Q700 310 670 310 Q640 310 640 340 L640 360" fill="none" stroke="#dfe6ec" stroke-width="8" stroke-linecap="round"/>
      <!-- вентиль -->
      <rect x="712" y="390" width="34" height="12" rx="5" fill="#ff8c69" stroke-width="3"/>
    </g>
    <g class="v-problem">
      <!-- струя воды бежит без остановки -->
      <rect x="630" y="364" width="20" height="74" fill="#8fd3ff" stroke="#2b3a4a" stroke-width="3"/>
      <line x1="640" y1="368" x2="640" y2="436" stroke="#ffffff" stroke-width="4" stroke-dasharray="10 8">
        <animate attributeName="stroke-dashoffset" values="36;0" dur="0.5s" repeatCount="indefinite"/>
      </line>
      <!-- брызги в раковине -->
      <g fill="#8fd3ff" stroke="#2b3a4a" stroke-width="2">
        <circle cx="612" cy="436" r="5">
          <animate attributeName="cy" values="440;420;440" dur="0.7s" repeatCount="indefinite"/>
        </circle>
        <circle cx="668" cy="436" r="5">
          <animate attributeName="cy" values="440;418;440" dur="0.8s" repeatCount="indefinite"/>
        </circle>
      </g>
      <ellipse cx="640" cy="448" rx="30" ry="6" fill="none" stroke="#4aa3f0" stroke-width="3">
        <animate attributeName="rx" values="14;36;14" dur="1s" repeatCount="indefinite"/>
      </ellipse>
    </g>
    <g class="v-ok">
      <!-- кран закрыт: только блик -->
      <line x1="634" y1="356" x2="646" y2="356" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="505" y="290" width="290" height="320" rx="12" fill="transparent" stroke="none"/>
  </g>

  <!-- ===== ОБЪЕКТ: посудомоечная машина (купольная) ===== -->
  <g id="obj-dishwasher" class="obj" data-state="problem">
    <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
      <!-- верхний купол -->
      <rect x="830" y="250" width="230" height="80" rx="10" fill="#dfe6ec"/>
      <rect x="850" y="266" width="60" height="30" rx="5" fill="#5a6675" stroke-width="3"/>
      <!-- открытая камера с корзиной -->
      <rect x="840" y="330" width="210" height="190" fill="#9fb0bf"/>
      <rect x="852" y="342" width="186" height="166" fill="#cfdae4" stroke-width="3"/>
      <!-- решётка корзины -->
      <g stroke-width="2" stroke="#7d8e9e">
        <line x1="852" y1="480" x2="1038" y2="480"/>
        <line x1="852" y1="494" x2="1038" y2="494"/>
        <line x1="880" y1="480" x2="880" y2="508"/><line x1="920" y1="480" x2="920" y2="508"/>
        <line x1="960" y1="480" x2="960" y2="508"/><line x1="1000" y1="480" x2="1000" y2="508"/>
      </g>
      <!-- нижний шкаф -->
      <rect x="830" y="520" width="230" height="80" rx="6" fill="#e9eef3"/>
      <rect x="846" y="536" width="198" height="10" rx="4" fill="#b9c4ce" stroke-width="2"/>
    </g>
    <g class="v-problem">
      <!-- машина работает почти пустая: всего две тарелки -->
      <g stroke="#2b3a4a" stroke-width="3" fill="#ffffff">
        <ellipse cx="900" cy="440" rx="12" ry="44"/>
        <ellipse cx="930" cy="440" rx="12" ry="44"/>
      </g>
      <!-- струйки воды внутри -->
      <g stroke="#4aa3f0" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 8">
        <line x1="980" y1="350" x2="970" y2="470">
          <animate attributeName="stroke-dashoffset" values="28;0" dur="0.5s" repeatCount="indefinite"/>
        </line>
        <line x1="1010" y1="350" x2="1020" y2="470">
          <animate attributeName="stroke-dashoffset" values="28;0" dur="0.6s" repeatCount="indefinite"/>
        </line>
      </g>
      <!-- пар над куполом -->
      <g fill="#ffffff" stroke="#9fb0bf" stroke-width="3">
        <circle cx="900" cy="230" r="16">
          <animateTransform attributeName="transform" type="translate" values="0 6;0 -18;0 6" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0.2;1" dur="2.4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="950" cy="220" r="20">
          <animateTransform attributeName="transform" type="translate" values="0 -10;0 10;0 -10" dur="2.8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="1000" cy="232" r="14">
          <animateTransform attributeName="transform" type="translate" values="0 4;0 -16;0 4" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
        </circle>
      </g>
      <!-- индикатор «работает» мигает -->
      <circle cx="1030" cy="281" r="9" fill="#ffd166" stroke="#2b3a4a" stroke-width="3">
        <animate attributeName="r" values="7;10;7" dur="1s" repeatCount="indefinite"/>
      </circle>
    </g>
    <g class="v-ok">
      <!-- корзина полностью загружена, машина ждёт запуска -->
      <g stroke="#2b3a4a" stroke-width="3" fill="#ffffff">
        <ellipse cx="872" cy="440" rx="11" ry="42"/>
        <ellipse cx="894" cy="440" rx="11" ry="42"/>
        <ellipse cx="916" cy="440" rx="11" ry="42"/>
        <ellipse cx="938" cy="440" rx="11" ry="42"/>
        <ellipse cx="960" cy="440" rx="11" ry="42"/>
        <ellipse cx="982" cy="440" rx="11" ry="42"/>
        <ellipse cx="1004" cy="440" rx="11" ry="42"/>
        <ellipse cx="1026" cy="440" rx="11" ry="42"/>
      </g>
      <circle cx="1030" cy="281" r="7" fill="#5a6675" stroke="#2b3a4a" stroke-width="3"/>
    </g>
    <rect class="obj-hit" x="810" y="190" width="270" height="420" rx="12" fill="transparent" stroke="none"/>
  </g>

  <!-- ===== ОБЪЕКТ: зона мусора ===== -->
  <g id="obj-waste-bins" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- один переполненный бак: всё вперемешку -->
      <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
        <!-- вещи торчат из бака -->
        <rect x="1300" y="410" width="34" height="46" rx="3" fill="#ffffff" transform="rotate(-18 1317 433)"/>
        <path d="M1352 470 L1352 420 Q1352 410 1360 406 L1360 392 L1370 392 L1370 406 Q1378 410 1378 420 L1378 470 Z" fill="#8fd3ff" transform="rotate(14 1365 430)"/>
        <rect x="1386" y="430" width="26" height="40" rx="4" fill="#cfd8e2"/>
        <circle cx="1330" cy="456" r="14" fill="#ff8c69"/>
        <path d="M1270 456 Q1262 420 1290 428 Q1300 446 1288 460 Z" fill="#f3e9d2" stroke-width="3"/>
        <path d="M1410 458 Q1420 420 1440 430 Q1432 446 1428 460 Z" fill="#ffd166" stroke-width="3"/>
        <rect x="1340" y="436" width="40" height="22" rx="3" fill="#d9a066" stroke-width="3" transform="rotate(-8 1360 447)"/>
        <path d="M1260 470 L1440 470 L1420 640 L1280 640 Z" fill="#9fb0bf"/>
        <rect x="1250" y="458" width="200" height="18" rx="6" fill="#7d8e9e"/>
        <!-- мусор рассыпался на пол -->
        <rect x="1210" y="618" width="40" height="22" rx="3" fill="#ffffff" transform="rotate(12 1230 629)"/>
        <rect x="1452" y="612" width="22" height="30" rx="4" fill="#cfd8e2" transform="rotate(70 1463 627)"/>
        <path d="M1480 640 L1520 640 L1514 620 L1490 618 Z" fill="#7ad9b5" stroke-width="3"/>
      </g>
      <!-- неприятный запах: волнистые линии -->
      <g fill="none" stroke="#8a9a5b" stroke-width="4" stroke-linecap="round">
        <path d="M1300 390 q-8 -10 0 -20 q8 -10 0 -20">
          <animateTransform attributeName="transform" type="translate" values="0 4;0 -10;0 4" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite"/>
        </path>
        <path d="M1400 390 q-8 -10 0 -20 q8 -10 0 -20">
          <animateTransform attributeName="transform" type="translate" values="0 -8;0 6;0 -8" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" repeatCount="indefinite"/>
        </path>
      </g>
    </g>
    <g class="v-ok">
      <!-- четыре разных бака: бумага, пластик, металл, стекло -->
      <g stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round">
        <!-- 1. бумага: квадратный бак, крышка с прорезью -->
        <rect x="1140" y="490" width="96" height="150" rx="4" fill="#8fd3ff"/>
        <rect x="1134" y="474" width="108" height="18" rx="3" fill="#5fb4e6"/>
        <rect x="1160" y="478" width="56" height="8" rx="2" fill="#2b3a4a" stroke-width="2"/>
        <path d="M1170 520 L1198 520 L1208 530 L1208 566 L1170 566 Z" fill="#ffffff" stroke-width="3"/>
        <path d="M1198 520 L1198 530 L1208 530" fill="none" stroke-width="3"/>
        <line x1="1176" y1="540" x2="1200" y2="540" stroke-width="2"/>
        <line x1="1176" y1="552" x2="1200" y2="552" stroke-width="2"/>
        <!-- 2. пластик: бак с закруглённым верхом и круглым отверстием -->
        <path d="M1256 640 L1256 500 Q1256 470 1304 470 Q1352 470 1352 500 L1352 640 Z" fill="#ffd166"/>
        <circle cx="1304" cy="490" r="12" fill="#2b3a4a" stroke-width="2"/>
        <path d="M1294 590 L1294 548 Q1294 538 1300 534 L1300 522 L1308 522 L1308 534 Q1314 538 1314 548 L1314 590 Z" fill="#ffffff" stroke-width="3"/>
        <!-- 3. металл: бак-цилиндр, крышка-купол -->
        <rect x="1372" y="490" width="94" height="150" rx="10" fill="#cfd8e2"/>
        <path d="M1366 492 Q1419 450 1472 492 Z" fill="#9fb0bf"/>
        <circle cx="1419" cy="466" r="5" fill="#2b3a4a" stroke-width="2"/>
        <rect x="1400" y="530" width="38" height="56" rx="6" fill="#ffffff" stroke-width="3"/>
        <line x1="1400" y1="542" x2="1438" y2="542" stroke-width="2"/>
        <line x1="1400" y1="574" x2="1438" y2="574" stroke-width="2"/>
        <!-- 4. стекло: бак-колокол с узким горлом -->
        <path d="M1486 640 L1494 510 Q1500 480 1532 480 Q1564 480 1570 510 L1578 640 Z" fill="#7ad9b5"/>
        <rect x="1516" y="466" width="32" height="16" rx="5" fill="#4fa889"/>
        <path d="M1518 590 L1518 550 Q1518 540 1524 538 L1524 528 L1540 528 L1540 538 Q1546 540 1546 550 L1546 590 Z" fill="#ffffff" stroke-width="3"/>
        <rect x="1520" y="522" width="24" height="8" rx="2" fill="#ffffff" stroke-width="2"/>
      </g>
    </g>
    <rect class="obj-hit" x="1120" y="360" width="470" height="300" rx="12" fill="transparent" stroke="none"/>
  </g>
</svg>`;
