/*
  city.scene.js — SVG-сцена мини-города: улица, жилой дом, парк, холм.

  Что в файле: одна строка EB.scenes.city с векторной картинкой (SVG) уровня «Мини-город».
  Размер холста 1600×900 (viewBox), сцена сама подстраивается под экран.

  Как устроен каждый интерактивный объект:
    <g id="obj-ИМЯ" class="obj" data-state="problem">
      ...части, видимые всегда...
      <g class="v-problem">…как выглядит проблема…</g>
      <g class="v-ok">…как выглядит после исправления…</g>
      <rect class="obj-hit" …/>   ← прозрачная зона клика, всегда ПОСЛЕДНЯЯ
    </g>
  Движок меняет data-state ("problem" / "ok"), а CSS прячет ненужный вариант.
  Анимации (SMIL) есть только внутри .v-problem (кроме лопастей ветряка в .v-ok).

  Объекты сцены:
    obj-street-lamps   — два фонаря слева: горят днём / выключены
    obj-old-lamp       — фонарь у дома: старая горячая лампа / тонкий LED-светильник
    obj-facade         — стены дома: тепло уходит волнами / утеплённый фасад
    obj-roof           — плоская крыша: пустая / ряды солнечных панелей
    obj-entrance-door  — дверь подъезда: распахнута, уходит тепло / закрыта с доводчиком
    obj-stair-light    — окна лестницы и лампа над подъездом: горят днём / выключены, датчик движения
    obj-heat-pipe      — люк теплотрассы на дороге: пар и лужа / закрытый люк
    obj-sprinkler      — поливалка в парке: льёт на дорожку / выключена
    obj-garbage        — контейнеры во дворе: один переполненный / раздельный сбор (4 формы)
    obj-wind-site      — холм справа: пусто, только ветроуказатель / ветрогенератор

  Как менять:
    • координаты — в единицах viewBox (x: 0…1600 слева направо, y: 0…900 сверху вниз);
    • контур — цвет #2b3a4a, толщина 3–4;
    • id градиентов начинаются с "ct-", чтобы не пересечься с другими сценами;
    • зоны клика (obj-hit) не должны перекрываться между объектами;
    • в строке нельзя использовать обратную кавычку и знак доллара с фигурной скобкой;
    • текстовых элементов SVG в сцене нет — игра двуязычная, все подписи в texts.*.js.
*/
EB.scenes = EB.scenes || {};
EB.scenes.city = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" class="scene-svg">
  <defs>
    <linearGradient id="ct-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8fb"/><stop offset="1" stop-color="#d9f2ff"/></linearGradient>
    <radialGradient id="ct-glow"><stop offset="0" stop-color="#fff6b0" stop-opacity="0.95"/><stop offset="0.5" stop-color="#ffe066" stop-opacity="0.45"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>
    <radialGradient id="ct-hot"><stop offset="0" stop-color="#ffd27a" stop-opacity="0.95"/><stop offset="0.5" stop-color="#ff9a3c" stop-opacity="0.5"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient>
    <radialGradient id="ct-thermal"><stop offset="0" stop-color="#ff7b2e" stop-opacity="0.55"/><stop offset="0.6" stop-color="#ffb347" stop-opacity="0.3"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient>
    <radialGradient id="ct-sun"><stop offset="0" stop-color="#fff7c2"/><stop offset="1" stop-color="#ffd166"/></radialGradient>
  </defs>
  <!-- ===== ФОН (не интерактивный) ===== -->
  <g id="ct-bg" pointer-events="none">
    <!-- небо -->
    <rect x="0" y="0" width="1600" height="640" fill="url(#ct-sky)"/>
    <!-- солнце -->
    <path d="M186 105 L208 105 M177 138 L196 149 M153 162 L164 181 M120 171 L120 193 M87 162 L76 181 M63 138 L44 149 M54 105 L32 105 M63 72 L44 61 M87 48 L76 29 M120 39 L120 17 M153 48 L164 29 M177 72 L196 61" stroke="#ffb800" stroke-width="6" stroke-linecap="round"/>
    <circle cx="120" cy="105" r="52" fill="url(#ct-sun)" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <!-- облака -->
    <g transform="translate(360 120) scale(1)" fill="#ffffff" stroke="#c9dceb" stroke-width="3"><ellipse cx="0" cy="0" rx="60" ry="24"/><circle cx="-22" cy="-14" r="24"/><circle cx="16" cy="-22" r="30"/></g>
    <g transform="translate(1120 80) scale(0.8)" fill="#ffffff" stroke="#c9dceb" stroke-width="3"><ellipse cx="0" cy="0" rx="60" ry="24"/><circle cx="-22" cy="-14" r="24"/><circle cx="16" cy="-22" r="30"/></g>
    <g transform="translate(700 150) scale(0.6)" fill="#ffffff" stroke="#c9dceb" stroke-width="3"><ellipse cx="0" cy="0" rx="60" ry="24"/><circle cx="-22" cy="-14" r="24"/><circle cx="16" cy="-22" r="30"/></g>
    <!-- дальний холм слева -->
    <ellipse cx="280" cy="640" rx="520" ry="110" fill="#b5e3a6"/>
    <!-- большой открытый холм справа (место для ветряка) -->
    <path d="M1230 640 C1320 520 1410 440 1500 440 C1560 440 1610 455 1640 470 L1640 640 Z" fill="#86cf73" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M1440 470 q30 -14 60 -12" fill="none" stroke="#a7e08f" stroke-width="8" stroke-linecap="round"/>
    <!-- далёкие домики слева -->
    <g><rect x="20" y="520" width="90" height="90" fill="#ffe3b3" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M14 520 L65 486 L116 520 Z" fill="#ff8c69" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="32" y="536" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="60" y="536" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="88" y="536" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="32" y="570" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="60" y="570" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="88" y="570" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/></g>
    <g><rect x="150" y="490" width="80" height="120" fill="#d9cffd" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M144 490 L190 456 L236 490 Z" fill="#7a8cff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="162" y="506" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="190" y="506" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="162" y="540" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="190" y="540" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="162" y="574" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="190" y="574" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/></g>
    <g><rect x="270" y="530" width="100" height="80" fill="#c9f0dd" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M264 530 L320 496 L376 530 Z" fill="#ffb35c" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="282" y="546" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="310" y="546" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="338" y="546" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="282" y="580" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="310" y="580" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/><rect x="338" y="580" width="16" height="18" rx="3" fill="#e6f6ff" stroke="#2b3a4a" stroke-width="2"/></g>
    <!-- земля и газоны -->
    <rect x="0" y="600" width="1600" height="140" fill="#9bd77e"/>
    <path d="M0 600 H1600" stroke="#2b3a4a" stroke-width="3"/>
    <!-- тающий снег пятнами (конец зимы) -->
    <ellipse cx="70" cy="625" rx="34" ry="11" fill="#ffffff" stroke="#cfe3f0" stroke-width="2"/>
    <ellipse cx="470" cy="618" rx="26" ry="9" fill="#ffffff" stroke="#cfe3f0" stroke-width="2"/>
    <ellipse cx="1265" cy="728" rx="22" ry="7" fill="#ffffff" stroke="#cfe3f0" stroke-width="2"/>
    <ellipse cx="1570" cy="632" rx="28" ry="9" fill="#ffffff" stroke="#cfe3f0" stroke-width="2"/>
    <ellipse cx="1460" cy="520" rx="26" ry="9" fill="#ffffff" stroke="#cfe3f0" stroke-width="2"/>
    <ellipse cx="1550" cy="470" rx="22" ry="7" fill="#ffffff" stroke="#cfe3f0" stroke-width="2"/>
    <!-- деревья парка -->
    <g transform="translate(1262 640) scale(0.95)"><rect x="-8" y="-70" width="16" height="70" rx="4" fill="#a0704b" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="0" cy="-100" r="42" fill="#5cbf6a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="-28" cy="-78" r="26" fill="#6fd07a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="26" cy="-80" r="28" fill="#6fd07a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="-10" cy="-112" r="12" fill="#8fe39a"/></g>
    <g transform="translate(1415 625) scale(0.8)"><rect x="-8" y="-70" width="16" height="70" rx="4" fill="#a0704b" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="0" cy="-100" r="42" fill="#5cbf6a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="-28" cy="-78" r="26" fill="#6fd07a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="26" cy="-80" r="28" fill="#6fd07a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="-10" cy="-112" r="12" fill="#8fe39a"/></g>
    <g transform="translate(1575 655) scale(1)"><rect x="-8" y="-70" width="16" height="70" rx="4" fill="#a0704b" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="0" cy="-100" r="42" fill="#5cbf6a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="-28" cy="-78" r="26" fill="#6fd07a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="26" cy="-80" r="28" fill="#6fd07a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="-10" cy="-112" r="12" fill="#8fe39a"/></g>
    <!-- двор у дома (плитка) -->
    <rect x="500" y="698" width="738" height="42" fill="#e6dccb"/>
    <!-- дорожка в парке -->
    <path d="M1330 742 C1380 700 1460 682 1600 668 L1600 698 C1490 706 1440 722 1408 742 Z" fill="#f1dfb8" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <!-- скамейка и кошка -->
    <g><rect x="1460" y="650" width="96" height="10" rx="4" fill="#ffb35c" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="1460" y="666" width="96" height="10" rx="4" fill="#ffb35c" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="1468" y="676" width="8" height="18" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="1540" y="676" width="8" height="18" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M1500 666 q-2 -22 10 -26 l2 -10 l6 8 h6 l6 -8 l2 10 q10 6 6 26 Z" fill="#6b7684" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M1536 664 q14 -2 10 -18" fill="none" stroke="#2b3a4a" stroke-width="4" stroke-linecap="round"/><circle cx="1513" cy="644" r="2" fill="#ffd166"/><circle cx="1523" cy="644" r="2" fill="#ffd166"/></g>
    <!-- тротуар -->
    <rect x="0" y="740" width="1600" height="50" fill="#d5dbe2"/>
    <path d="M60 742 V788 M140 742 V788 M220 742 V788 M300 742 V788 M380 742 V788 M460 742 V788 M540 742 V788 M620 742 V788 M700 742 V788 M780 742 V788 M860 742 V788 M940 742 V788 M1020 742 V788 M1100 742 V788 M1180 742 V788 M1260 742 V788 M1340 742 V788 M1420 742 V788 M1500 742 V788 M1580 742 V788 M0 740 H1600" stroke="#b3bcc6" stroke-width="2"/>
    <rect x="0" y="786" width="1600" height="8" fill="#b3bcc6" stroke="#2b3a4a" stroke-width="2"/>
    <!-- дорога с разметкой -->
    <rect x="0" y="794" width="1600" height="106" fill="#5b6675"/>
    <path d="M20 848 H1600" stroke="#ffffff" stroke-width="6" stroke-dasharray="50 40"/>
  </g>
  
  <!-- ===== obj-wind-site: открытый ветреный холм справа ===== -->
  <g id="obj-wind-site" class="obj" data-state="problem">
    <!-- всегда: столбик-основание на вершине -->
    <ellipse cx="1500" cy="444" rx="26" ry="6" fill="#6fbf5f"/>
    <g class="v-problem">
      <!-- пустой холм: ветроуказатель (полосатый «носок») сильно трепещет -->
      <rect x="1447" y="334" width="6" height="116" rx="3" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <g transform="translate(1453 346)">
        <g>
          <path d="M0 -14 L90 -7 L90 7 L0 14 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
          <path d="M0 -14 L22 -12.3 L22 12.3 L0 14 Z M45 -10.5 L67 -8.8 L67 8.8 L45 10.5 Z" fill="#ff8c69"/>
          <path d="M0 -14 L90 -7 L90 7 L0 14 Z" fill="none" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
          <animateTransform attributeName="transform" type="rotate" values="-7;5;-3;7;-7" dur="0.9s" repeatCount="indefinite"/>
        </g>
      </g>
      <!-- линии ветра летят слева направо -->
      <g>
        <path d="M1380 300 q25 -12 50 0 t50 0 t40 -6" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
        <animateTransform attributeName="transform" type="translate" values="-30 0;50 0" dur="2s" begin="0s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0s" repeatCount="indefinite"/>
      </g>
      <g>
        <path d="M1380 372 q25 -12 50 0 t50 0 t40 -6" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
        <animateTransform attributeName="transform" type="translate" values="-30 0;50 0" dur="2s" begin="0.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.6s" repeatCount="indefinite"/>
      </g>
      <g>
        <path d="M1380 250 q25 -12 50 0 t50 0 t40 -6" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
        <animateTransform attributeName="transform" type="translate" values="-30 0;50 0" dur="2s" begin="1.1s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.1s" repeatCount="indefinite"/>
      </g>
      <g>
        <path d="M1380 410 q25 -12 50 0 t50 0 t40 -6" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
        <animateTransform attributeName="transform" type="translate" values="-30 0;50 0" dur="2s" begin="1.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.6s" repeatCount="indefinite"/>
      </g>
      <!-- пригнутая ветром трава -->
      <path d="M1440 474 q10 -10 22 -12 M1520 450 q10 -10 22 -12 M1560 462 q10 -10 22 -12 M1410 500 q10 -10 22 -12" fill="none" stroke="#4f9e45" stroke-width="4" stroke-linecap="round"/>
    </g>
    <g class="v-ok">
      <!-- ветрогенератор: белая башня и медленно вращающиеся лопасти -->
      <path d="M1490 446 L1496 232 H1504 L1510 446 Z" fill="#f4f7fb" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <rect x="1486" y="214" width="34" height="18" rx="7" fill="#e3ecf5" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <g transform="translate(1500 223)">
        <g>
          <path transform="rotate(0)" d="M0 0 C8 -30 8 -70 0 -98 C-9 -70 -9 -30 0 0 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
          <path transform="rotate(120)" d="M0 0 C8 -30 8 -70 0 -98 C-9 -70 -9 -30 0 0 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
          <path transform="rotate(240)" d="M0 0 C8 -30 8 -70 0 -98 C-9 -70 -9 -30 0 0 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite"/>
        </g>
        <circle r="9" fill="#ffd166" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      </g>
    </g>
    <rect class="obj-hit" x="1400" y="115" width="200" height="480" rx="12" fill="transparent"/>
  </g>
  
  <!-- ===== obj-facade: стены пятиэтажки (окна — часть фасада) ===== -->
  <g id="obj-facade" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- старая выцветшая стена с трещинами -->
      <rect x="540" y="280" width="490" height="420" fill="#e2cfb6" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M540 364 H1030 M540 448 H1030 M540 532 H1030 M540 616 H1030" stroke="#cdb89c" stroke-width="3"/>
      <path d="M600 380 l10 14 l-6 10 l12 16 M990 470 l-12 12 l6 10 l-10 14 M700 560 l8 12 l-8 8" fill="none" stroke="#9c8466" stroke-width="3" stroke-linecap="round"/>
      <path d="M900 330 q14 -6 22 4 q6 12 -8 14 q-16 0 -14 -18 Z M560 520 q12 -8 20 2 q4 12 -10 12 q-12 -2 -10 -14 Z" fill="#f2e4d0" stroke="#9c8466" stroke-width="2"/>
      <!-- тепловые «пятна» вокруг окон, как на снимке тепловизора -->
      <g fill="url(#ct-thermal)"><ellipse cx="595" cy="322" rx="46" ry="40"/><ellipse cx="680" cy="322" rx="46" ry="40"/><ellipse cx="890" cy="322" rx="46" ry="40"/><ellipse cx="975" cy="322" rx="46" ry="40"/><ellipse cx="595" cy="406" rx="46" ry="40"/><ellipse cx="680" cy="406" rx="46" ry="40"/><ellipse cx="890" cy="406" rx="46" ry="40"/><ellipse cx="975" cy="406" rx="46" ry="40"/><ellipse cx="595" cy="490" rx="46" ry="40"/><ellipse cx="680" cy="490" rx="46" ry="40"/><ellipse cx="890" cy="490" rx="46" ry="40"/><ellipse cx="975" cy="490" rx="46" ry="40"/><ellipse cx="595" cy="574" rx="46" ry="40"/><ellipse cx="680" cy="574" rx="46" ry="40"/><ellipse cx="890" cy="574" rx="46" ry="40"/><ellipse cx="975" cy="574" rx="46" ry="40"/><ellipse cx="595" cy="658" rx="46" ry="40"/><ellipse cx="680" cy="658" rx="46" ry="40"/><ellipse cx="890" cy="658" rx="46" ry="40"/><ellipse cx="975" cy="658" rx="46" ry="40"/><ellipse cx="548" cy="490" rx="30" ry="120"/><ellipse cx="1022" cy="490" rx="30" ry="120"/></g>
    </g>
    <g class="v-ok">
      <!-- утеплённый фасад: новый свежий слой, стена стала толще -->
      <rect x="528" y="276" width="514" height="428" rx="4" fill="#ffd9a0" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
      <!-- торцы утеплителя: видно толщину нового слоя -->
      <rect x="528" y="276" width="16" height="428" fill="#f4b878" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="1026" y="276" width="16" height="428" fill="#f4b878" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M532 300 l8 -8 M532 340 l8 -8 M532 380 l8 -8 M532 420 l8 -8 M532 460 l8 -8 M532 500 l8 -8 M532 540 l8 -8 M532 580 l8 -8 M532 620 l8 -8 M532 660 l8 -8 M1030 300 l8 -8 M1030 340 l8 -8 M1030 380 l8 -8 M1030 420 l8 -8 M1030 460 l8 -8 M1030 500 l8 -8 M1030 540 l8 -8 M1030 580 l8 -8 M1030 620 l8 -8 M1030 660 l8 -8" stroke="#d9925a" stroke-width="2" stroke-linecap="round"/>
      <!-- декоративные полосы между этажами -->
      <g fill="#ff8c69"><rect x="544" y="360" width="482" height="7"/><rect x="544" y="444" width="482" height="7"/><rect x="544" y="528" width="482" height="7"/><rect x="544" y="612" width="482" height="7"/></g>
    </g>
    <!-- всегда: цоколь и окна -->
    <rect x="526" y="690" width="518" height="14" fill="#9aa7b5" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <g><rect x="561" y="348" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="565" y="296" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="570" y="301" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M570 301 h16 q-3 22 -16 30 Z" fill="#ff8c69"/><path d="M595 301 V343 M570 320 H620" stroke="#ffffff" stroke-width="4"/><rect x="646" y="348" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="650" y="296" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="655" y="301" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M655 301 h16 q-3 22 -16 30 Z" fill="#b9a6ff"/><path d="M680 301 V343 M655 320 H705" stroke="#ffffff" stroke-width="4"/><rect x="856" y="348" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="860" y="296" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="865" y="301" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M865 301 h16 q-3 22 -16 30 Z" fill="#7ad9b5"/><path d="M890 301 V343 M865 320 H915" stroke="#ffffff" stroke-width="4"/><rect x="941" y="348" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="945" y="296" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="950" y="301" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M950 301 h16 q-3 22 -16 30 Z" fill="#ffd166"/><path d="M975 301 V343 M950 320 H1000" stroke="#ffffff" stroke-width="4"/></g>
    <g><rect x="561" y="432" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="565" y="380" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="570" y="385" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M570 385 h16 q-3 22 -16 30 Z" fill="#b9a6ff"/><path d="M595 385 V427 M570 404 H620" stroke="#ffffff" stroke-width="4"/><rect x="646" y="432" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="650" y="380" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="655" y="385" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M655 385 h16 q-3 22 -16 30 Z" fill="#7ad9b5"/><path d="M680 385 V427 M655 404 H705" stroke="#ffffff" stroke-width="4"/><rect x="856" y="432" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="860" y="380" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="865" y="385" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M865 385 h16 q-3 22 -16 30 Z" fill="#ffd166"/><path d="M890 385 V427 M865 404 H915" stroke="#ffffff" stroke-width="4"/><rect x="941" y="432" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="945" y="380" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="950" y="385" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M950 385 h16 q-3 22 -16 30 Z" fill="#ff8c69"/><path d="M975 385 V427 M950 404 H1000" stroke="#ffffff" stroke-width="4"/></g>
    <g><rect x="561" y="516" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="565" y="464" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="570" y="469" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M570 469 h16 q-3 22 -16 30 Z" fill="#7ad9b5"/><path d="M595 469 V511 M570 488 H620" stroke="#ffffff" stroke-width="4"/><rect x="646" y="516" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="650" y="464" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="655" y="469" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M655 469 h16 q-3 22 -16 30 Z" fill="#ffd166"/><path d="M680 469 V511 M655 488 H705" stroke="#ffffff" stroke-width="4"/><rect x="856" y="516" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="860" y="464" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="865" y="469" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M865 469 h16 q-3 22 -16 30 Z" fill="#ff8c69"/><path d="M890 469 V511 M865 488 H915" stroke="#ffffff" stroke-width="4"/><rect x="941" y="516" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="945" y="464" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="950" y="469" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M950 469 h16 q-3 22 -16 30 Z" fill="#b9a6ff"/><path d="M975 469 V511 M950 488 H1000" stroke="#ffffff" stroke-width="4"/></g>
    <g><rect x="561" y="600" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="565" y="548" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="570" y="553" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M570 553 h16 q-3 22 -16 30 Z" fill="#ffd166"/><path d="M595 553 V595 M570 572 H620" stroke="#ffffff" stroke-width="4"/><rect x="646" y="600" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="650" y="548" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="655" y="553" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M655 553 h16 q-3 22 -16 30 Z" fill="#ff8c69"/><path d="M680 553 V595 M655 572 H705" stroke="#ffffff" stroke-width="4"/><rect x="856" y="600" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="860" y="548" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="865" y="553" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M865 553 h16 q-3 22 -16 30 Z" fill="#b9a6ff"/><path d="M890 553 V595 M865 572 H915" stroke="#ffffff" stroke-width="4"/><rect x="941" y="600" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="945" y="548" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="950" y="553" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M950 553 h16 q-3 22 -16 30 Z" fill="#7ad9b5"/><path d="M975 553 V595 M950 572 H1000" stroke="#ffffff" stroke-width="4"/></g>
    <g><rect x="561" y="684" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="565" y="632" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="570" y="637" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M570 637 h16 q-3 22 -16 30 Z" fill="#ff8c69"/><path d="M595 637 V679 M570 656 H620" stroke="#ffffff" stroke-width="4"/><rect x="646" y="684" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="650" y="632" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="655" y="637" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M655 637 h16 q-3 22 -16 30 Z" fill="#b9a6ff"/><path d="M680 637 V679 M655 656 H705" stroke="#ffffff" stroke-width="4"/><rect x="856" y="684" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="860" y="632" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="865" y="637" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M865 637 h16 q-3 22 -16 30 Z" fill="#7ad9b5"/><path d="M890 637 V679 M865 656 H915" stroke="#ffffff" stroke-width="4"/><rect x="941" y="684" width="68" height="6" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><rect x="945" y="632" width="60" height="52" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="950" y="637" width="50" height="42" rx="3" fill="#bfe6ff"/><path d="M950 637 h16 q-3 22 -16 30 Z" fill="#ffd166"/><path d="M975 637 V679 M950 656 H1000" stroke="#ffffff" stroke-width="4"/></g>
    <g class="v-problem">
      <!-- волны тепла уходят вверх из щелей окон -->
      <g fill="none" stroke="#ff7b2e" stroke-width="4" stroke-linecap="round"><path d="M575 294 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M615 294 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M870 294 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M910 294 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M660 378 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M700 378 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M955 378 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M995 378 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M575 462 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M615 462 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M870 462 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M910 462 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M660 546 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M700 546 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M955 546 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M995 546 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M575 630 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M615 630 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M870 630 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M910 630 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M1034 360 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M1034 540 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/>
        <animateTransform attributeName="transform" type="translate" values="0 8;0 -8;0 8" dur="2.4s" begin="0s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0s" repeatCount="indefinite"/>
      </g>
      <g fill="none" stroke="#ff7b2e" stroke-width="4" stroke-linecap="round"><path d="M660 294 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M700 294 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M955 294 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M995 294 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M575 378 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M615 378 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M870 378 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M910 378 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M660 462 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M700 462 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M955 462 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M995 462 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M575 546 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M615 546 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M870 546 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M910 546 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M660 630 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M700 630 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M955 630 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M995 630 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M536 420 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/><path d="M536 600 q7 -7 0 -14 q-7 -7 0 -14 q7 -7 0 -14"/>
        <animateTransform attributeName="transform" type="translate" values="0 8;0 -8;0 8" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
      </g>
    </g>
    <rect class="obj-hit" x="528" y="284" width="196" height="422" rx="12" fill="transparent"/>
    <rect class="obj-hit" x="846" y="284" width="196" height="422" rx="12" fill="transparent"/>
  </g>
  
  <!-- ===== obj-stair-light: окна лестничной клетки и лампа над подъездом ===== -->
  <g id="obj-stair-light" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- днём на лестнице горит свет: окна светятся -->
      <g fill="#ffe066">
        <rect x="755" y="290" width="60" height="70" rx="14"/><rect x="755" y="374" width="60" height="70" rx="14"/><rect x="755" y="458" width="60" height="70" rx="14"/>
        <animate attributeName="opacity" values="0.25;0.6;0.25" dur="2s" repeatCount="indefinite"/>
      </g>
    </g>
    <!-- всегда: рамы узких окон лестницы -->
    <g><rect x="765" y="300" width="40" height="50" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="765" y="384" width="40" height="50" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="765" y="468" width="40" height="50" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/></g>
    <g class="v-problem">
      <g><rect x="770" y="305" width="30" height="40" rx="3" fill="#ffe680"/><path d="M785 312 v10 M779 322 h12" stroke="#ffb800" stroke-width="3"/><rect x="770" y="389" width="30" height="40" rx="3" fill="#ffe680"/><path d="M785 396 v10 M779 406 h12" stroke="#ffb800" stroke-width="3"/><rect x="770" y="473" width="30" height="40" rx="3" fill="#ffe680"/><path d="M785 480 v10 M779 490 h12" stroke="#ffb800" stroke-width="3"/></g>
      <!-- лампа над подъездом горит -->
      <circle cx="785" cy="540" r="40" fill="url(#ct-glow)"><animate attributeName="r" values="32;44;32" dur="1.6s" repeatCount="indefinite"/></circle>
      <path d="M760 550 l-10 6 M810 550 l10 6 M785 556 v10" stroke="#ffb800" stroke-width="4" stroke-linecap="round"/>
      <path d="M772 536 h26 v3 q-13 14 -26 0 Z" fill="#fff3a0" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    </g>
    <g class="v-ok">
      <g><rect x="770" y="305" width="30" height="40" rx="3" fill="#bfe6ff"/><path d="M774 326 l14 -16 M780 336 l16 -18" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/><rect x="770" y="389" width="30" height="40" rx="3" fill="#bfe6ff"/><path d="M774 410 l14 -16 M780 420 l16 -18" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/><rect x="770" y="473" width="30" height="40" rx="3" fill="#bfe6ff"/><path d="M774 494 l14 -16 M780 504 l16 -18" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/></g>
      <!-- лампа выключена, рядом — датчик движения (купол) -->
      <path d="M772 536 h26 v3 q-13 14 -26 0 Z" fill="#d5dde6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M802 534 a9 9 0 0 1 18 0 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="811" cy="530" r="2" fill="#2b3a4a"/>
      <path d="M824 526 q4 4 0 8 M829 522 q7 8 0 16" fill="none" stroke="#2b3a4a" stroke-width="2" stroke-linecap="round"/>
    </g>
    <!-- всегда: корпус лампы --><rect x="768" y="524" width="34" height="13" rx="4" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <rect class="obj-hit" x="730" y="285" width="110" height="268" rx="12" fill="transparent"/>
  </g>
  
  <!-- ===== obj-entrance-door: дверь подъезда ===== -->
  <g id="obj-entrance-door" class="obj" data-state="problem">
    <!-- всегда: козырёк, дверной проём, ступеньки -->
    <rect x="742" y="572" width="86" height="128" rx="4" fill="#e7d8c8" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <rect x="726" y="698" width="118" height="10" rx="3" fill="#c2ccd6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="736" y="708" width="98" height="9" rx="3" fill="#c2ccd6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <g class="v-problem">
      <!-- дверь распахнута и подпёрта кирпичом, тёплый воздух уходит наружу -->
      <rect x="750" y="578" width="70" height="120" fill="#6b4f7a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M756 690 h20 v-14 h20 v-14 h20" fill="none" stroke="#9c86ac" stroke-width="3"/>
      <path d="M750 578 L724 588 L724 704 L750 698 Z" fill="#6fa8dc" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="730" cy="646" r="3" fill="#2b3a4a"/>
      <rect x="722" y="694" width="22" height="12" rx="2" fill="#ff8c69" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <g transform="translate(770 660)"><g>
        <path d="M0 0 q10 -12 20 -2 q8 10 -4 16 q-12 4 -14 -8 q0 -6 6 -6" fill="none" stroke="#ff8c3a" stroke-width="4" stroke-linecap="round"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;40 -40" dur="2.7s" begin="0s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.7s" begin="0s" repeatCount="indefinite"/>
      </g></g>
      <g transform="translate(795 630)"><g>
        <path d="M0 0 q10 -12 20 -2 q8 10 -4 16 q-12 4 -14 -8 q0 -6 6 -6" fill="none" stroke="#ff8c3a" stroke-width="4" stroke-linecap="round"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;40 -40" dur="2.7s" begin="0.9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.7s" begin="0.9s" repeatCount="indefinite"/>
      </g></g>
      <g transform="translate(780 600)"><g>
        <path d="M0 0 q10 -12 20 -2 q8 10 -4 16 q-12 4 -14 -8 q0 -6 6 -6" fill="none" stroke="#ff8c3a" stroke-width="4" stroke-linecap="round"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;40 -40" dur="2.7s" begin="1.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.7s" begin="1.8s" repeatCount="indefinite"/>
      </g></g>
    </g>
    <g class="v-ok">
      <!-- дверь закрыта, сверху — доводчик -->
      <rect x="750" y="578" width="70" height="120" fill="#6fa8dc" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <rect x="758" y="596" width="54" height="40" rx="4" fill="#8fc0ea" stroke="#2b3a4a" stroke-width="2"/><rect x="758" y="646" width="54" height="42" rx="4" fill="#8fc0ea" stroke="#2b3a4a" stroke-width="2"/>
      <rect x="806" y="636" width="8" height="18" rx="3" fill="#ffd166" stroke="#2b3a4a" stroke-width="2"/>
      <rect x="788" y="580" width="26" height="9" rx="3" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M792 585 L772 590 L766 580" fill="none" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <rect x="728" y="556" width="114" height="13" rx="4" fill="#ff8c69" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <rect class="obj-hit" x="728" y="556" width="114" height="160" rx="12" fill="transparent"/>
  </g>
  
  <!-- ===== obj-roof: плоская крыша дома ===== -->
  <g id="obj-roof" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- пустая крыша: только вентиляция, антенна и снег -->
      <rect x="600" y="234" width="20" height="30" fill="#c2ccd6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="594" y="226" width="32" height="10" rx="3" fill="#9aa7b5" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <rect x="880" y="242" width="16" height="22" fill="#c2ccd6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="875" y="235" width="26" height="9" rx="3" fill="#9aa7b5" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M965 262 V198 M950 210 H980 M954 224 H976" stroke="#2b3a4a" stroke-width="4" stroke-linecap="round"/>
      <path d="M680 264 q20 -16 46 -4 q14 -10 30 4 Z M780 264 q14 -10 30 0 Z" fill="#ffffff" stroke="#cfe3f0" stroke-width="2"/>
    </g>
    <g class="v-ok">
      <!-- ряды солнечных панелей -->
      <g><path d="M578 238 H626 L620 216 H584 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M602 238 L602 216 M581 227 H623" stroke="#9cc7ff" stroke-width="2"/><path d="M646 238 H694 L688 216 H652 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M670 238 L670 216 M649 227 H691" stroke="#9cc7ff" stroke-width="2"/><path d="M714 238 H762 L756 216 H720 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M738 238 L738 216 M717 227 H759" stroke="#9cc7ff" stroke-width="2"/><path d="M782 238 H830 L824 216 H788 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M806 238 L806 216 M785 227 H827" stroke="#9cc7ff" stroke-width="2"/><path d="M850 238 H898 L892 216 H856 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M874 238 L874 216 M853 227 H895" stroke="#9cc7ff" stroke-width="2"/><path d="M918 238 H966 L960 216 H924 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M942 238 L942 216 M921 227 H963" stroke="#9cc7ff" stroke-width="2"/><path d="M986 238 H1034 L1028 216 H992 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M1010 238 L1010 216 M989 227 H1031" stroke="#9cc7ff" stroke-width="2"/></g>
      <g><path d="M552 263 H612 L604 233 H560 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M582 263 L582 233 M556 248 H608" stroke="#9cc7ff" stroke-width="2"/><path d="M560 256 l8 -10" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><path d="M620 263 H680 L672 233 H628 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M650 263 L650 233 M624 248 H676" stroke="#9cc7ff" stroke-width="2"/><path d="M628 256 l8 -10" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><path d="M688 263 H748 L740 233 H696 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M718 263 L718 233 M692 248 H744" stroke="#9cc7ff" stroke-width="2"/><path d="M696 256 l8 -10" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><path d="M756 263 H816 L808 233 H764 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M786 263 L786 233 M760 248 H812" stroke="#9cc7ff" stroke-width="2"/><path d="M764 256 l8 -10" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><path d="M824 263 H884 L876 233 H832 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M854 263 L854 233 M828 248 H880" stroke="#9cc7ff" stroke-width="2"/><path d="M832 256 l8 -10" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><path d="M892 263 H952 L944 233 H900 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M922 263 L922 233 M896 248 H948" stroke="#9cc7ff" stroke-width="2"/><path d="M900 256 l8 -10" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><path d="M960 263 H1020 L1012 233 H968 Z" fill="#3d6fb6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M990 263 L990 233 M964 248 H1016" stroke="#9cc7ff" stroke-width="2"/><path d="M968 256 l8 -10" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/></g>
    </g>
    <!-- всегда: парапет крыши -->
    <rect x="522" y="262" width="526" height="20" rx="4" fill="#a7b4c2" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <rect class="obj-hit" x="522" y="165" width="526" height="116" rx="12" fill="transparent"/>
  </g>
  
  <!-- ===== obj-street-lamps: два уличных фонаря на тротуаре ===== -->
  <g id="obj-street-lamps" class="obj" data-state="problem">
    <!-- всегда: столбы и плафоны -->
    <rect x="74" y="480" width="12" height="272" rx="5" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
  <rect x="65" y="742" width="30" height="20" rx="6" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M80 492 q0 -24 28 -24 h16" fill="none" stroke="#2b3a4a" stroke-width="11" stroke-linecap="round"/>
  <path d="M80 492 q0 -24 28 -24 h16" fill="none" stroke="#5a6b7d" stroke-width="5" stroke-linecap="round"/>
  <path d="M100 484 L110 464 H138 L148 484 Z" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <rect x="234" y="480" width="12" height="272" rx="5" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
  <rect x="225" y="742" width="30" height="20" rx="6" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M240 492 q0 -24 28 -24 h16" fill="none" stroke="#2b3a4a" stroke-width="11" stroke-linecap="round"/>
  <path d="M240 492 q0 -24 28 -24 h16" fill="none" stroke="#5a6b7d" stroke-width="5" stroke-linecap="round"/>
  <path d="M260 484 L270 464 H298 L308 484 Z" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <g class="v-problem">
      <!-- горят среди солнечного дня -->
      <circle cx="124" cy="496" r="62" fill="url(#ct-glow)"><animate attributeName="r" values="52;68;52" dur="1.8s" repeatCount="indefinite"/></circle>
      <path d="M90 500 l-14 6 M158 500 l14 6 M104 514 l-8 12 M144 514 l8 12 M124 520 v14" stroke="#ffb800" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="124" cy="487" rx="17" ry="8" fill="#fff3a0" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="284" cy="496" r="62" fill="url(#ct-glow)"><animate attributeName="r" values="52;68;52" dur="1.8s" repeatCount="indefinite"/></circle>
      <path d="M250 500 l-14 6 M318 500 l14 6 M264 514 l-8 12 M304 514 l8 12 M284 520 v14" stroke="#ffb800" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="284" cy="487" rx="17" ry="8" fill="#fff3a0" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    </g>
    <g class="v-ok">
      <!-- выключены -->
      <ellipse cx="124" cy="487" rx="17" ry="8" fill="#d5dde6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="284" cy="487" rx="17" ry="8" fill="#d5dde6" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    </g>
    <rect class="obj-hit" x="20" y="440" width="320" height="345" rx="12" fill="transparent"/>
  </g>
  
  <!-- ===== obj-old-lamp: отдельный фонарь у дома ===== -->
  <g id="obj-old-lamp" class="obj" data-state="problem">
    <!-- всегда: столб с изогнутым кронштейном -->
    <rect x="454" y="482" width="12" height="270" rx="5" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <rect x="445" y="742" width="30" height="20" rx="6" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M460 496 q0 -26 -26 -26 h-14" fill="none" stroke="#2b3a4a" stroke-width="11" stroke-linecap="round"/>
    <path d="M460 496 q0 -26 -26 -26 h-14" fill="none" stroke="#5a6b7d" stroke-width="5" stroke-linecap="round"/>
    <g class="v-problem">
      <!-- старая громоздкая лампа, горячее оранжевое свечение -->
      <circle cx="418" cy="498" r="66" fill="url(#ct-hot)"><animate attributeName="r" values="56;72;56" dur="1.4s" repeatCount="indefinite"/></circle>
      <path d="M386 490 Q386 450 418 446 Q450 450 450 490 Z" fill="#8a6d55" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M396 470 q22 -14 44 0" fill="none" stroke="#b08a6a" stroke-width="3"/>
      <ellipse cx="418" cy="496" rx="24" ry="14" fill="#ffb347" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <g fill="none" stroke="#ff7b2e" stroke-width="4" stroke-linecap="round">
        <path d="M404 440 q6 -6 0 -12 q-6 -6 0 -12"/><path d="M432 440 q6 -6 0 -12 q-6 -6 0 -12"/>
        <animateTransform attributeName="transform" type="translate" values="0 4;0 -8;0 4" dur="1.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- тонкий современный светодиодный светильник (днём выключен) -->
      <rect x="386" y="468" width="66" height="12" rx="6" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <rect x="392" y="480" width="54" height="6" rx="3" fill="#e3ecf5" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M400 483 h2 M410 483 h2 M420 483 h2 M430 483 h2 M440 483 h2" stroke="#9aa7b5" stroke-width="3" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="375" y="430" width="140" height="355" rx="12" fill="transparent"/>
  </g>
  
  <!-- ===== obj-garbage: контейнеры для отходов во дворе ===== -->
  <g id="obj-garbage" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- один переполненный контейнер, всё свалено вместе -->
      <path d="M1066 660 L1050 612 L1196 606 L1212 656 Z" fill="#5a7566" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M1112 642 l8 -30 h10 l4 30 Z" fill="#9fe0c8" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="1098" cy="648" rx="28" ry="22" fill="#3d4b5c" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M1094 628 l4 -8 l4 8" fill="none" stroke="#2b3a4a" stroke-width="3"/>
      <rect x="1140" y="618" width="34" height="26" rx="2" transform="rotate(-14 1157 631)" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="1170" cy="652" rx="30" ry="20" fill="#4a5a6b" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M1180 630 l18 -14 l6 6 l-16 14 Z" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M1066 660 H1212 L1202 736 H1076 Z" fill="#6d8a7a" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M1100 676 V720 M1139 676 V720 M1178 676 V720" stroke="#5a7566" stroke-width="4" stroke-linecap="round"/>
      <circle cx="1088" cy="738" r="7" fill="#2b3a4a"/><circle cx="1190" cy="738" r="7" fill="#2b3a4a"/>
      <!-- мусор рядом на земле -->
      <rect x="1050" y="722" width="22" height="16" rx="2" transform="rotate(12 1061 730)" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <rect x="1210" y="720" width="12" height="20" rx="3" transform="rotate(70 1216 730)" fill="#ff8c69" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <!-- мухи кружат -->
      <circle r="4" fill="#2b3a4a"><animateMotion path="M1120 590 q20 -14 30 0 q-10 14 -30 0" dur="1.6s" repeatCount="indefinite"/></circle>
      <circle r="4" fill="#2b3a4a"><animateMotion path="M1160 584 q20 -14 30 0 q-10 14 -30 0" dur="2.2s" repeatCount="indefinite"/></circle>
    </g>
    <g class="v-ok">
      <!-- раздельный сбор: 4 контейнера разной формы со значками -->
      <!-- бумага: прямоугольный, с щелью -->
      <rect x="1048" y="668" width="41" height="68" rx="5" fill="#6fa8dc" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="1046" y="660" width="45" height="10" rx="3" fill="#4f8cc4" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><rect x="1058" y="663" width="21" height="4" fill="#2b3a4a"/>
      <path d="M1059 684 h13 l6 6 v22 h-19 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><path d="M1062 696 h12 M1062 702 h12" stroke="#6fa8dc" stroke-width="2"/>
      <!-- пластик: купол сверху, значок бутылки -->
      <rect x="1094" y="672" width="41" height="64" rx="6" fill="#ffd166" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><path d="M1092 675 Q1114.5 646 1137 675 Z" fill="#f4b942" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="1114.5" cy="666" r="4" fill="#2b3a4a"/>
      <path d="M1111 682 h7 v5 q5 3 5 8 v17 q0 3 -3 3 h-11 q-3 0 -3 -3 v-17 q0 -5 5 -8 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
      <!-- металл: бочонок, значок банки -->
      <rect x="1140" y="666" width="41" height="70" rx="12" fill="#b9a6ff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><ellipse cx="1160.5" cy="668" rx="20" ry="6" fill="#9a85ee" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <rect x="1152" y="686" width="17" height="25" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/><path d="M1152 692 h17 M1152 705 h17" stroke="#2b3a4a" stroke-width="2"/>
      <!-- стекло: колокол, значок бокала -->
      <path d="M1186 736 V690 Q1186 656 1206.5 656 Q1227 656 1227 690 V736 Z" fill="#7ad9b5" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/><circle cx="1206.5" cy="670" r="5" fill="#2b3a4a"/>
      <path d="M1198 684 h17 q0 14 -8.5 16 v8 h6 v3 h-15 v-3 h6 v-8 q-8.5 -2 -8.5 -16 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
    </g>
    <rect class="obj-hit" x="1044" y="580" width="186" height="166" rx="12" fill="transparent"/>
  </g>
  
  <!-- ===== obj-sprinkler: поливалка на газоне парка ===== -->
  <g id="obj-sprinkler" class="obj" data-state="problem">
    <ellipse cx="1290" cy="708" rx="20" ry="7" fill="#6b7684" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <g class="v-problem">
      <!-- лужа на дорожке -->
      <ellipse cx="1392" cy="726" rx="42" ry="10" fill="#8fd3ff" stroke="#4aa8e8" stroke-width="3"/>
      <ellipse cx="1392" cy="726" rx="12" ry="3" fill="none" stroke="#ffffff" stroke-width="2"><animate attributeName="rx" values="8;34;8" dur="1.5s" repeatCount="indefinite"/><animate attributeName="ry" values="2;8;2" dur="1.5s" repeatCount="indefinite"/></ellipse>
      <!-- струи воды дугами в полдень -->
      <rect x="1283" y="680" width="14" height="26" rx="4" fill="#ffd166" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <g fill="none" stroke="#4aa8e8" stroke-width="5" stroke-linecap="round" stroke-dasharray="3 12">
        <path d="M1290 680 Q1335 590 1380 718"/><path d="M1290 680 Q1350 620 1410 724"/><path d="M1290 680 Q1258 610 1244 704"/>
        <animate attributeName="stroke-dashoffset" values="0;-30" dur="0.6s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- поливалка выключена и опущена -->
      <rect x="1282" y="696" width="16" height="11" rx="4" fill="#ffd166" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    </g>
    <rect class="obj-hit" x="1236" y="600" width="184" height="138" rx="12" fill="transparent"/>
  </g>
  
  <!-- ===== obj-heat-pipe: люк теплотрассы на дороге ===== -->
  <g id="obj-heat-pipe" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- растаявшая лужа, сдвинутая крышка люка, пар -->
      <ellipse cx="330" cy="848" rx="96" ry="26" fill="#8fd3ff" stroke="#4aa8e8" stroke-width="3"/>
      <ellipse cx="326" cy="840" rx="48" ry="14" fill="#2b3a4a"/>
      <ellipse cx="364" cy="852" rx="50" ry="15" fill="#7b8794" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <g transform="translate(316 830)"><g fill="#ffffff" stroke="#c9d6e2" stroke-width="2">
        <circle cx="0" cy="0" r="18"/><circle cx="16" cy="-10" r="16"/><circle cx="-14" cy="-8" r="14"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;-12 -110" dur="3s" begin="0s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.95;0" dur="3s" begin="0s" repeatCount="indefinite"/>
      </g></g>
      <g transform="translate(340 830)"><g fill="#ffffff" stroke="#c9d6e2" stroke-width="2">
        <circle cx="0" cy="0" r="18"/><circle cx="16" cy="-10" r="16"/><circle cx="-14" cy="-8" r="14"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;-12 -110" dur="3s" begin="1s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.95;0" dur="3s" begin="1s" repeatCount="indefinite"/>
      </g></g>
      <g transform="translate(304 830)"><g fill="#ffffff" stroke="#c9d6e2" stroke-width="2">
        <circle cx="0" cy="0" r="18"/><circle cx="16" cy="-10" r="16"/><circle cx="-14" cy="-8" r="14"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;-12 -110" dur="3s" begin="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.95;0" dur="3s" begin="2s" repeatCount="indefinite"/>
      </g></g>
    </g>
    <g class="v-ok">
      <!-- аккуратно закрытый люк -->
      <ellipse cx="330" cy="844" rx="56" ry="18" fill="#7b8794" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="330" cy="844" rx="40" ry="11" fill="none" stroke="#5b6675" stroke-width="3"/>
      <path d="M300 844 H360 M315 836 V852 M330 834 V854 M345 836 V852" stroke="#5b6675" stroke-width="2"/>
    </g>
    <rect class="obj-hit" x="230" y="790" width="200" height="110" rx="12" fill="transparent"/>
  </g>
</svg>`;
