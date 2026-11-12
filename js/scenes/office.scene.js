/*
  office.scene.js — SVG-сцена офиса: опенспейс в обеденный перерыв, кухонный уголок слева,
  стеклянная переговорная справа, большие окна с солнцем.

  Что в файле: одна строка EB.scenes.office с векторной картинкой (SVG) уровня «Офис».
  Размер холста 1600×900 (viewBox), сцена сама подстраивается под экран.

  Как устроен каждый интерактивный объект:
    <g id="obj-ИМЯ" class="obj" data-state="problem">
      ...части, видимые всегда...
      <g class="v-problem">…как выглядит проблема…</g>
      <g class="v-ok">…как выглядит после исправления…</g>
      <rect class="obj-hit" …/>   ← прозрачная зона клика, всегда ПОСЛЕДНЯЯ
    </g>
  Движок меняет data-state ("problem" / "ok"), а CSS прячет ненужный вариант.
  Анимации (SMIL) есть только внутри .v-problem.

  Объекты сцены (проблема / после исправления):
    obj-office-tap         — кран на кухне: капает, лужица в раковине / закрыт, капель нет
    obj-office-coffee      — кофемашина и чайник: чайник полный до краёв, пар / воды на одну чашку
    obj-office-blinds      — левое окно и лампа над ним: жалюзи закрыты, лампа горит днём /
                             жалюзи подняты, лампа выключена, на потолке датчик освещённости
    obj-office-ac          — кондиционер над правым окном: дует, а створка окна распахнута /
                             окно закрыто, кондиционер в спокойном режиме (значок-листик)
    obj-office-pcs         — два рабочих места: на пустых столах мониторы с заставками /
                             мониторы спят (значок луны)
    obj-office-heater      — батарея под средним окном: загорожена шкафом, под столом гудит
                             электрообогреватель / батарея свободна, обогревателя нет
    obj-office-printer     — принтер: выплёвывает листы, на полу гора односторонних черновиков /
                             аккуратная стопка, на экране значок двусторонней печати
    obj-office-paper-bin   — мусорное ведро: забито бумагой вперемешку с объедками /
                             рядом синий контейнер для макулатуры
    obj-office-cartridges  — урна у принтера: в ней батарейки и картридж / зелёный короб для приёма
    obj-office-chargers    — удлинитель на полу: четыре зарядки без телефонов мигают /
                             зарядки вынуты, удлинитель выключен кнопкой
    obj-office-meeting-light — лампы в пустой переговорной: горят, конусы света /
                             выключены, на потолке датчик присутствия
    obj-office-plant       — растение в кадке (всегда в порядке)
    obj-office-board       — доска с заметками в переговорной (всегда в порядке)
  В фоне (не кликаются): кулер с водой и сотрудник с чашкой, часы показывают обед,
  среднее окно с солнцем, диванчик, стеклянная стенка переговорной.

  Как менять:
    • координаты — в единицах viewBox (x: 0…1600 слева направо, y: 0…900 сверху вниз);
      стена — до y = 700, дальше пол; кухня x 0–250, опенспейс x 250–1180, переговорная x 1180–1600;
    • контур — цвет #2b3a4a, толщина 3–4;
    • id градиентов начинаются с "of-", чтобы не пересечься с другими сценами;
    • зоны клика (obj-hit) не должны перекрываться между объектами;
    • в строке нельзя использовать обратную кавычку и знак доллара с фигурной скобкой;
    • текстовых элементов SVG в сцене нет — игра двуязычная, все подписи в texts.*.js.
*/
EB.scenes = EB.scenes || {};
EB.scenes.office = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" class="scene-svg">
  <defs>
    <linearGradient id="of-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8fb"/><stop offset="1" stop-color="#d9f2ff"/></linearGradient>
    <radialGradient id="of-glow"><stop offset="0" stop-color="#fff6b0" stop-opacity="0.95"/><stop offset="0.5" stop-color="#ffe066" stop-opacity="0.45"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>
    <radialGradient id="of-hot"><stop offset="0" stop-color="#ffd27a" stop-opacity="0.9"/><stop offset="0.5" stop-color="#ff9a3c" stop-opacity="0.45"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient>
    <radialGradient id="of-sun"><stop offset="0" stop-color="#fff7c2"/><stop offset="1" stop-color="#ffd166"/></radialGradient>
    <linearGradient id="of-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b7dff"/><stop offset="1" stop-color="#4fd1c5"/></linearGradient>
    <linearGradient id="of-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a0" stop-opacity="0.75"/><stop offset="1" stop-color="#fff3a0" stop-opacity="0"/></linearGradient>
  </defs>

  <!-- ===== ФОН (не интерактивный) ===== -->
  <g id="of-bg" pointer-events="none">
    <!-- стены: опенспейс и переговорная -->
    <rect x="0" y="0" width="1600" height="700" fill="#fdf3e1"/>
    <rect x="1180" y="34" width="420" height="666" fill="#e4effa"/>
    <!-- потолок -->
    <rect x="0" y="0" width="1600" height="34" fill="#efe4d4"/>
    <path d="M0 34 H1600" stroke="#2b3a4a" stroke-width="3"/>
    <!-- пол: ковровая плитка -->
    <rect x="0" y="700" width="1600" height="200" fill="#c7d2e0"/>
    <path d="M0 765 H1600 M0 835 H1600 M100 700 V900 M260 700 V900 M420 700 V900 M580 700 V900 M740 700 V900 M900 700 V900 M1060 700 V900 M1220 700 V900 M1380 700 V900 M1540 700 V900" stroke="#b6c2d2" stroke-width="2"/>
    <rect x="0" y="690" width="1180" height="10" fill="#e8dcc8"/>
    <path d="M0 700 H1600" stroke="#2b3a4a" stroke-width="4"/>

    <!-- кухонный уголок: плитка-фартук, шкафчики, столешница -->
    <rect x="0" y="370" width="250" height="98" fill="#dff3ee"/>
    <path d="M0 395 H250 M0 420 H250 M0 445 H250 M25 370 V468 M50 370 V468 M75 370 V468 M100 370 V468 M125 370 V468 M150 370 V468 M175 370 V468 M200 370 V468 M225 370 V468" stroke="#c2e3da" stroke-width="2"/>
    <rect x="12" y="120" width="226" height="110" rx="8" fill="#8fd3c4" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M125 124 V226" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="108" y="190" width="7" height="24" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="135" y="190" width="7" height="24" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="0" y="484" width="250" height="216" fill="#8fd3c4" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M84 488 V700 M168 488 V700" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="66" y="510" width="7" height="26" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="95" y="510" width="7" height="26" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="179" y="510" width="7" height="26" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="-4" y="466" width="258" height="20" rx="4" fill="#f2c98a" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <!-- часы: стрелки показывают час дня — обеденный перерыв -->
    <circle cx="125" cy="78" r="28" fill="#ffffff" stroke="#2b3a4a" stroke-width="4"/>
    <path d="M125 56 V60 M125 96 V100 M103 78 H107 M143 78 H147" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round"/>
    <path d="M125 78 L131 66 M125 78 V58" stroke="#2b3a4a" stroke-width="4" stroke-linecap="round"/>
    <circle cx="125" cy="78" r="3" fill="#ff8c69"/>

    <!-- кулер с водой -->
    <rect x="270" y="478" width="40" height="62" rx="14" fill="#a9defa" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M276 500 q14 -6 28 0" fill="none" stroke="#e6f6ff" stroke-width="4" stroke-linecap="round"/>
    <rect x="262" y="540" width="56" height="160" rx="6" fill="#ffffff" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <rect x="270" y="575" width="40" height="34" rx="4" fill="#e3e9f0" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="276" y="572" width="8" height="10" rx="2" fill="#7a8cff" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="296" y="572" width="8" height="10" rx="2" fill="#ff8c69" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="270" y="609" width="40" height="6" rx="2" fill="#b3bcc6" stroke="#2b3a4a" stroke-width="2"/>

    <!-- сотрудник наливает воду у кулера -->
    <rect x="331" y="628" width="14" height="70" rx="5" fill="#3d4f7a" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="349" y="628" width="14" height="70" rx="5" fill="#3d4f7a" stroke="#2b3a4a" stroke-width="3"/>
    <ellipse cx="334" cy="700" rx="13" ry="6" fill="#2b3a4a"/>
    <ellipse cx="358" cy="700" rx="13" ry="6" fill="#2b3a4a"/>
    <rect x="324" y="548" width="46" height="90" rx="16" fill="#ffb35c" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M340 552 l7 12 l7 -12" fill="#ffffff" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M334 566 L314 596" stroke="#2b3a4a" stroke-width="17" stroke-linecap="round"/>
    <path d="M334 566 L314 596" stroke="#ffb35c" stroke-width="11" stroke-linecap="round"/>
    <circle cx="312" cy="598" r="7" fill="#f6c9a3" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M296 594 h16 l-2 20 h-12 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <rect x="341" y="538" width="12" height="14" fill="#f6c9a3" stroke="#2b3a4a" stroke-width="3"/>
    <circle cx="347" cy="520" r="22" fill="#f6c9a3" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M325 517 q2 -24 24 -24 q20 0 20 22 q-8 -10 -22 -8 q-12 2 -22 10 Z" fill="#6b4a2f" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="336" cy="523" r="2.6" fill="#2b3a4a"/>
    <path d="M331 532 q5 4 10 1" fill="none" stroke="#2b3a4a" stroke-width="2.5" stroke-linecap="round"/>

    <!-- окно 2 (среднее): солнце -->
    <rect x="670" y="120" width="210" height="275" rx="4" fill="url(#of-sky)"/>
    <path d="M869 190 L861 190 M856 212 L850 207 M825 226 L825 218 M794 212 L800 207 M781 190 L789 190 M794 168 L800 173 M825 154 L825 162 M856 168 L850 173" stroke="#ffb800" stroke-width="5" stroke-linecap="round"/>
    <circle cx="825" cy="190" r="26" fill="url(#of-sun)" stroke="#2b3a4a" stroke-width="3"/>
    <g fill="#ffffff" stroke="#c9dceb" stroke-width="2"><ellipse cx="720" cy="170" rx="30" ry="12"/><circle cx="710" cy="162" r="12"/><circle cx="728" cy="158" r="15"/></g>
    <rect x="680" y="320" width="46" height="71" fill="#b9cde0"/><rect x="732" y="296" width="40" height="95" fill="#a6bdd4"/><rect x="820" y="330" width="52" height="61" fill="#b9cde0"/>
    <path d="M690 334 h8 M708 334 h8 M690 352 h8 M708 352 h8 M742 312 h8 M756 312 h8 M742 332 h8 M756 332 h8 M742 352 h8 M756 352 h8 M832 346 h8 M852 346 h8 M832 364 h8 M852 364 h8" stroke="#e6f6ff" stroke-width="6"/>
    <rect x="670" y="120" width="210" height="275" rx="4" fill="none" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="678" y="128" width="93" height="259" rx="3" fill="none" stroke="#2b3a4a" stroke-width="10"/><rect x="678" y="128" width="93" height="259" rx="3" fill="none" stroke="#ffffff" stroke-width="5"/>
    <rect x="779" y="128" width="93" height="259" rx="3" fill="none" stroke="#2b3a4a" stroke-width="10"/><rect x="779" y="128" width="93" height="259" rx="3" fill="none" stroke="#ffffff" stroke-width="5"/>
    <rect x="660" y="393" width="230" height="12" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <!-- лампа над средним окном: выключена (так и должно быть днём) -->
    <path d="M775 34 V70" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M745 98 L755 70 H795 L805 98 Z" fill="#7ad1c1" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="775" cy="104" r="8" fill="#e6ebf0" stroke="#2b3a4a" stroke-width="3"/>

    <!-- картина над принтером -->
    <rect x="1000" y="428" width="76" height="56" rx="4" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1008 476 L1028 448 L1042 466 L1052 456 L1068 476 Z" fill="#86cf73" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="1060" cy="442" r="6" fill="#ffd166"/>

    <!-- переговорная: экран на стене (выключен), стол и стулья -->
    <rect x="1210" y="270" width="150" height="90" rx="6" fill="#33404f" stroke="#2b3a4a" stroke-width="4"/>
    <path d="M1226 286 L1250 286 M1226 296 L1240 296" stroke="#4b5b6e" stroke-width="4" stroke-linecap="round"/>
    <g fill="#7ad1c1" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="1240" y="466" width="46" height="62" rx="12"/><rect x="1316" y="466" width="46" height="62" rx="12"/>
      <rect x="1392" y="466" width="46" height="62" rx="12"/><rect x="1468" y="466" width="46" height="62" rx="12"/>
    </g>
    <rect x="1215" y="520" width="340" height="20" rx="8" fill="#f2c98a" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="1236" y="540" width="14" height="160" fill="#c99b6d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1520" y="540" width="14" height="160" fill="#c99b6d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1290" y="508" width="40" height="12" rx="2" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
    <path d="M1440 520 v-14 h14 v14" fill="#ff8c69" stroke="#2b3a4a" stroke-width="2"/>

    <!-- коврик и диванчик для отдыха -->
    <ellipse cx="300" cy="820" rx="118" ry="40" fill="#ffd9a8" stroke="#2b3a4a" stroke-width="3"/>
    <ellipse cx="300" cy="820" rx="88" ry="26" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="14 10"/>
    <rect x="1220" y="742" width="270" height="70" rx="24" fill="#7a8cff" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="1200" y="776" width="310" height="70" rx="22" fill="#8f9dff" stroke="#2b3a4a" stroke-width="4"/>
    <path d="M1355 782 V842" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1215" y="846" width="14" height="22" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1481" y="846" width="14" height="22" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="1250" y="752" width="44" height="36" rx="10" fill="#ffd166" stroke="#2b3a4a" stroke-width="3"/>
  </g>

  <!-- ===== obj-office-tap: кран над раковиной на кухне ===== -->
  <g id="obj-office-tap" class="obj" data-state="problem">
    <!-- раковина в столешнице и кран -->
    <rect x="28" y="466" width="96" height="10" rx="3" fill="#b9c6d3" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="70" y="452" width="16" height="16" rx="3" fill="#c3ccd6" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M78 454 V412 q0 -14 14 -14 q14 0 14 14 V424" fill="none" stroke="#2b3a4a" stroke-width="13" stroke-linecap="round"/>
    <path d="M78 454 V412 q0 -14 14 -14 q14 0 14 14 V424" fill="none" stroke="#d5dde6" stroke-width="7" stroke-linecap="round"/>
    <g class="v-problem">
      <!-- ручка повёрнута не до конца, из крана капает -->
      <path d="M78 440 L56 430" stroke="#2b3a4a" stroke-width="9" stroke-linecap="round"/>
      <path d="M78 440 L56 430" stroke="#ff8c69" stroke-width="4" stroke-linecap="round"/>
      <path d="M106 432 q-5 8 0 12 q5 -4 0 -12 Z" fill="#5ab8f0" stroke="#2b3a4a" stroke-width="2">
        <animateTransform attributeName="transform" type="translate" values="0 0;0 30" dur="0.9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;1;0" dur="0.9s" repeatCount="indefinite"/>
      </path>
      <path d="M106 432 q-5 8 0 12 q5 -4 0 -12 Z" fill="#5ab8f0" stroke="#2b3a4a" stroke-width="2">
        <animateTransform attributeName="transform" type="translate" values="0 0;0 30" dur="0.9s" begin="0.45s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;1;0" dur="0.9s" begin="0.45s" repeatCount="indefinite"/>
      </path>
      <!-- брызги в раковине -->
      <ellipse cx="106" cy="470" rx="12" ry="3" fill="none" stroke="#5ab8f0" stroke-width="3">
        <animate attributeName="rx" values="4;14" dur="0.9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0" dur="0.9s" repeatCount="indefinite"/>
      </ellipse>
    </g>
    <g class="v-ok">
      <!-- ручка закрыта, кран сухой -->
      <path d="M78 440 L58 440" stroke="#2b3a4a" stroke-width="9" stroke-linecap="round"/>
      <path d="M78 440 L58 440" stroke="#7ad1c1" stroke-width="4" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="15" y="380" width="122" height="120" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-office-coffee: кофемашина и чайник ===== -->
  <g id="obj-office-coffee" class="obj" data-state="problem">
    <!-- кофемашина с чашкой -->
    <rect x="142" y="384" width="56" height="84" rx="8" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <rect x="150" y="394" width="40" height="14" rx="3" fill="#33404f" stroke="#2b3a4a" stroke-width="2"/>
    <circle cx="158" cy="401" r="3" fill="#7ad1c1"/>
    <rect x="160" y="414" width="20" height="10" rx="2" fill="#33404f" stroke="#2b3a4a" stroke-width="2"/>
    <path d="M160 448 h20 l-2 16 h-16 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M180 452 q6 2 0 8" fill="none" stroke="#2b3a4a" stroke-width="2.5"/>
    <!-- электрочайник с окошком уровня воды -->
    <path d="M208 466 L212 420 q14 -8 28 0 L244 466 Z" fill="#ff8c69" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M243 428 q12 6 2 26" fill="none" stroke="#2b3a4a" stroke-width="5" stroke-linecap="round"/>
    <path d="M210 424 l-8 -6" stroke="#2b3a4a" stroke-width="5" stroke-linecap="round"/>
    <rect x="221" y="428" width="10" height="34" rx="4" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
    <g class="v-problem">
      <!-- вода до самого верха, валит пар — а нужна одна чашка -->
      <rect x="222.5" y="429.5" width="7" height="31" rx="3" fill="#5ab8f0"/>
      <g fill="#ffffff" stroke="#c9dceb" stroke-width="2">
        <circle cx="200" cy="404" r="9"><animate attributeName="cy" values="404;370" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="208" cy="398" r="12"><animate attributeName="cy" values="398;360" dur="2s" begin="0.7s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0" dur="2s" begin="0.7s" repeatCount="indefinite"/></circle>
        <circle cx="196" cy="392" r="8"><animate attributeName="cy" values="392;356" dur="2s" begin="1.3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0" dur="2s" begin="1.3s" repeatCount="indefinite"/></circle>
      </g>
    </g>
    <g class="v-ok">
      <!-- воды налито ровно на одну чашку -->
      <rect x="222.5" y="451" width="7" height="9.5" rx="3" fill="#5ab8f0"/>
      <path d="M233 452 h10" stroke="#2b3a4a" stroke-width="2"/>
    </g>
    <rect class="obj-hit" x="140" y="340" width="112" height="160" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-office-blinds: левое окно с жалюзи и лампа над ним ===== -->
  <g id="obj-office-blinds" class="obj" data-state="problem">
    <!-- окно: небо и дома за стеклом -->
    <rect x="410" y="120" width="210" height="275" rx="4" fill="url(#of-sky)"/>
    <g fill="#ffffff" stroke="#c9dceb" stroke-width="2"><ellipse cx="560" cy="180" rx="34" ry="13"/><circle cx="548" cy="171" r="13"/><circle cx="570" cy="166" r="16"/></g>
    <rect x="420" y="318" width="50" height="73" fill="#b9cde0"/><rect x="476" y="292" width="42" height="99" fill="#a6bdd4"/><rect x="560" y="326" width="52" height="65" fill="#b9cde0"/>
    <path d="M430 334 h8 M450 334 h8 M430 354 h8 M450 354 h8 M486 310 h8 M500 310 h8 M486 330 h8 M500 330 h8 M486 350 h8 M500 350 h8 M572 342 h8 M592 342 h8 M572 362 h8 M592 362 h8" stroke="#e6f6ff" stroke-width="6"/>
    <rect x="410" y="120" width="210" height="275" rx="4" fill="none" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="418" y="128" width="93" height="259" rx="3" fill="none" stroke="#2b3a4a" stroke-width="10"/><rect x="418" y="128" width="93" height="259" rx="3" fill="none" stroke="#ffffff" stroke-width="5"/>
    <rect x="519" y="128" width="93" height="259" rx="3" fill="none" stroke="#2b3a4a" stroke-width="10"/><rect x="519" y="128" width="93" height="259" rx="3" fill="none" stroke="#ffffff" stroke-width="5"/>
    <rect x="400" y="393" width="230" height="12" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <!-- подвесная лампа -->
    <path d="M515 34 V70" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M485 98 L495 70 H535 L545 98 Z" fill="#7ad1c1" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <g class="v-problem">
      <!-- жалюзи опущены и закрыты: солнца не видно -->
      <rect x="412" y="122" width="206" height="12" rx="3" fill="#9aa6b4" stroke="#2b3a4a" stroke-width="3"/>
      <g fill="#cfd6df" stroke="#9aa6b4" stroke-width="1.5">
        <rect x="416" y="136" width="198" height="12"/><rect x="416" y="150" width="198" height="12"/><rect x="416" y="164" width="198" height="12"/>
        <rect x="416" y="178" width="198" height="12"/><rect x="416" y="192" width="198" height="12"/><rect x="416" y="206" width="198" height="12"/>
        <rect x="416" y="220" width="198" height="12"/><rect x="416" y="234" width="198" height="12"/><rect x="416" y="248" width="198" height="12"/>
        <rect x="416" y="262" width="198" height="12"/><rect x="416" y="276" width="198" height="12"/><rect x="416" y="290" width="198" height="12"/>
        <rect x="416" y="304" width="198" height="12"/><rect x="416" y="318" width="198" height="12"/><rect x="416" y="332" width="198" height="12"/>
        <rect x="416" y="346" width="198" height="12"/><rect x="416" y="360" width="198" height="12"/><rect x="416" y="374" width="198" height="12"/>
      </g>
      <rect x="414" y="384" width="202" height="7" rx="2" fill="#9aa6b4" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M602 134 V300" stroke="#5a6b7d" stroke-width="2"/><circle cx="602" cy="304" r="4" fill="#5a6b7d"/>
      <!-- полоски солнечного света пробиваются по краю жалюзи -->
      <path d="M414 160 h10 M414 214 h10 M414 268 h10 M606 188 h10 M606 242 h10 M606 296 h10" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/>
      <!-- лампа горит днём -->
      <circle cx="515" cy="112" r="64" fill="url(#of-glow)">
        <animate attributeName="opacity" values="0.75;1;0.75" dur="1.6s" repeatCount="indefinite"/>
      </circle>
      <circle cx="515" cy="104" r="9" fill="#fff3a0" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M515 122 V138 M492 116 L482 128 M538 116 L548 128" stroke="#ffb800" stroke-width="4" stroke-linecap="round">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/>
      </path>
    </g>
    <g class="v-ok">
      <!-- жалюзи подняты: в окне солнечный день -->
      <rect x="412" y="122" width="206" height="22" rx="3" fill="#cfd6df" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M414 130 H616 M414 137 H616" stroke="#9aa6b4" stroke-width="2"/>
      <path d="M602 144 V200" stroke="#5a6b7d" stroke-width="2"/><circle cx="602" cy="204" r="4" fill="#5a6b7d"/>
      <!-- лампа выключена; на потолке датчик освещённости (значок солнца) -->
      <circle cx="515" cy="104" r="8" fill="#e6ebf0" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M576 34 a16 14 0 0 0 32 0 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="592" cy="40" r="4" fill="#ffcf3a" stroke="#2b3a4a" stroke-width="1.5"/>
      <path d="M592 52 v6 M582 49 l-4 5 M602 49 l4 5" stroke="#ffb800" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="395" y="36" width="240" height="372" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-office-ac: кондиционер над правым окном ===== -->
  <g id="obj-office-ac" class="obj" data-state="problem">
    <!-- окно: небо и верхушки деревьев -->
    <rect x="930" y="120" width="210" height="275" rx="4" fill="url(#of-sky)"/>
    <g fill="#ffffff" stroke="#c9dceb" stroke-width="2"><ellipse cx="985" cy="196" rx="28" ry="11"/><circle cx="976" cy="188" r="11"/><circle cx="994" cy="185" r="13"/></g>
    <g fill="#6fd07a" stroke="#2b3a4a" stroke-width="3"><circle cx="965" cy="372" r="30"/><circle cx="1010" cy="360" r="34"/><circle cx="1100" cy="372" r="30"/></g>
    <rect x="930" y="120" width="210" height="275" rx="4" fill="none" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="938" y="128" width="93" height="259" rx="3" fill="none" stroke="#2b3a4a" stroke-width="10"/><rect x="938" y="128" width="93" height="259" rx="3" fill="none" stroke="#ffffff" stroke-width="5"/>
    <rect x="920" y="393" width="230" height="12" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <!-- корпус кондиционера -->
    <rect x="955" y="46" width="160" height="54" rx="14" fill="#ffffff" stroke="#2b3a4a" stroke-width="4"/>
    <path d="M968 64 H1070" stroke="#d5dde6" stroke-width="4" stroke-linecap="round"/>
    <g class="v-problem">
      <!-- правая створка окна распахнута настежь -->
      <path d="M1132 128 L1172 112 L1172 404 L1132 387 Z" fill="#d9f2ff" fill-opacity="0.8" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M1136 136 L1168 124 L1168 396 L1136 380 Z" fill="none" stroke="#ffffff" stroke-width="4"/>
      <path d="M1145 170 L1160 300" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
      <!-- заслонка открыта, кондиционер дует на полную -->
      <path d="M968 100 L1102 100 L1094 112 L976 112 Z" fill="#e3e9f0" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="1098" cy="66" r="6" fill="#ff8c69" stroke="#2b3a4a" stroke-width="2"><animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/></circle>
      <!-- потоки воздуха летят прямо в открытое окно -->
      <g fill="none" stroke="#5ab8f0" stroke-width="5" stroke-linecap="round">
        <path d="M990 122 q20 30 50 30 t60 34 t50 30">
          <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="-10 -10;20 20" dur="1.8s" repeatCount="indefinite"/>
        </path>
        <path d="M1020 124 q20 30 50 34 t50 40 t40 30">
          <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="0.6s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="-10 -10;20 20" dur="1.8s" begin="0.6s" repeatCount="indefinite"/>
        </path>
        <path d="M970 128 q10 40 50 56 t70 56 t70 30">
          <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="1.2s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="-10 -10;20 20" dur="1.8s" begin="1.2s" repeatCount="indefinite"/>
        </path>
      </g>
      <!-- стрелка: воздух уходит на улицу -->
      <path d="M1060 290 h48 m-14 -12 l14 12 l-14 12" fill="none" stroke="#2b3a4a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <animateTransform attributeName="transform" type="translate" values="0 0;14 0;0 0" dur="1s" repeatCount="indefinite"/>
      </path>
    </g>
    <g class="v-ok">
      <!-- окно закрыто -->
      <rect x="1039" y="128" width="93" height="259" rx="3" fill="none" stroke="#2b3a4a" stroke-width="10"/><rect x="1039" y="128" width="93" height="259" rx="3" fill="none" stroke="#ffffff" stroke-width="5"/>
      <rect x="1044" y="244" width="8" height="26" rx="3" fill="#e6ebf0" stroke="#2b3a4a" stroke-width="2"/>
      <!-- заслонка прикрыта, спокойный режим: значок-листик -->
      <path d="M970 100 H1100" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M1092 72 q0 -14 14 -14 q0 14 -14 14 Z" fill="#7ad17f" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
      <path d="M1010 112 q10 8 20 0 M1050 112 q10 8 20 0" fill="none" stroke="#a9defa" stroke-width="4" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="915" y="36" width="262" height="372" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-office-pcs: два рабочих места без людей ===== -->
  <g id="obj-office-pcs" class="obj" data-state="problem">
    <!-- стол -->
    <rect x="412" y="572" width="10" height="128" fill="#c99b6d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="686" y="572" width="10" height="128" fill="#c99b6d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="404" y="556" width="300" height="16" rx="4" fill="#f2c98a" stroke="#2b3a4a" stroke-width="4"/>
    <!-- мониторы -->
    <rect x="430" y="466" width="110" height="74" rx="6" fill="#3a4656" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="478" y="540" width="14" height="12" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="462" y="550" width="46" height="6" rx="2" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="572" y="466" width="110" height="74" rx="6" fill="#3a4656" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="620" y="540" width="14" height="12" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="604" y="550" width="46" height="6" rx="2" fill="#5a6b7d" stroke="#2b3a4a" stroke-width="3"/>
    <!-- кружка и мышка -->
    <path d="M546 536 h16 v20 h-16 Z" fill="#ffd166" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="664" cy="552" rx="8" ry="4" fill="#e3e8ee" stroke="#2b3a4a" stroke-width="2"/>
    <!-- системные блоки под столом -->
    <rect x="428" y="598" width="34" height="100" rx="4" fill="#dfe5ec" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="644" y="598" width="34" height="100" rx="4" fill="#dfe5ec" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M436 640 h18 M436 648 h18 M652 640 h18 M652 648 h18" stroke="#b3bcc6" stroke-width="3"/>
    <!-- пустые кресла: сотрудники ушли на обед -->
    <g fill="#7a8cff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="481" y="584" width="48" height="46" rx="12"/><rect x="475" y="628" width="60" height="14" rx="7"/>
      <rect x="576" y="584" width="48" height="46" rx="12"/><rect x="570" y="628" width="60" height="14" rx="7"/>
    </g>
    <g stroke="#2b3a4a" stroke-width="3">
      <rect x="501" y="642" width="8" height="40" fill="#5a6b7d"/><rect x="596" y="642" width="8" height="40" fill="#5a6b7d"/>
      <path d="M477 690 H533 M572 690 H628" stroke-width="7" stroke-linecap="round"/>
    </g>
    <g fill="#2b3a4a"><circle cx="477" cy="700" r="5"/><circle cx="533" cy="700" r="5"/><circle cx="572" cy="700" r="5"/><circle cx="628" cy="700" r="5"/></g>
    <g class="v-problem">
      <!-- яркие заставки крутятся на пустых экранах -->
      <rect x="437" y="473" width="96" height="60" rx="3" fill="url(#of-screen)"/>
      <rect x="579" y="473" width="96" height="60" rx="3" fill="url(#of-screen)"/>
      <path d="M0 -10 L2.9 -4 L9.5 -3.1 L4.7 1.5 L5.9 8.1 L0 5 L-5.9 8.1 L-4.7 1.5 L-9.5 -3.1 L-2.9 -4 Z" fill="#ffd166" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round">
        <animateTransform attributeName="transform" type="translate" values="460 490;510 512;490 486;450 516;460 490" dur="4s" repeatCount="indefinite"/>
      </path>
      <circle r="9" fill="#ff8c69" stroke="#2b3a4a" stroke-width="2">
        <animateTransform attributeName="transform" type="translate" values="650 515;600 488;630 520;595 510;650 515" dur="3.5s" repeatCount="indefinite"/>
      </circle>
      <!-- лампочки питания горят -->
      <circle cx="445" cy="612" r="5" fill="#7dff9a" stroke="#2b3a4a" stroke-width="2"><animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite"/></circle>
      <circle cx="661" cy="612" r="5" fill="#7dff9a" stroke="#2b3a4a" stroke-width="2"><animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite"/></circle>
    </g>
    <g class="v-ok">
      <!-- экраны тёмные, на них значок луны: компьютеры спят -->
      <rect x="437" y="473" width="96" height="60" rx="3" fill="#1f2a38"/>
      <rect x="579" y="473" width="96" height="60" rx="3" fill="#1f2a38"/>
      <path d="M489 491 a13 13 0 1 0 0 24 a10 10 0 0 1 0 -24 Z" fill="#ffd166"/>
      <path d="M631 491 a13 13 0 1 0 0 24 a10 10 0 0 1 0 -24 Z" fill="#ffd166"/>
      <circle cx="445" cy="612" r="4" fill="#ffb35c" stroke="#2b3a4a" stroke-width="2"/>
      <circle cx="661" cy="612" r="4" fill="#ffb35c" stroke="#2b3a4a" stroke-width="2"/>
    </g>
    <rect class="obj-hit" x="404" y="412" width="300" height="300" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-office-heater: батарея под средним окном и обогреватель ===== -->
  <g id="obj-office-heater" class="obj" data-state="problem">
    <!-- батарея отопления -->
    <rect x="728" y="418" width="144" height="54" rx="6" fill="#f4f6f8" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M746 422 V468 M764 422 V468 M782 422 V468 M800 422 V468 M818 422 V468 M836 422 V468 M854 422 V468" stroke="#b3bcc6" stroke-width="3"/>
    <rect x="740" y="472" width="8" height="20" fill="#d5dde6" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="852" y="472" width="8" height="20" fill="#d5dde6" stroke="#2b3a4a" stroke-width="2"/>
    <!-- розетка на стене -->
    <rect x="884" y="580" width="22" height="22" rx="4" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <g class="v-problem">
      <!-- тепло батареи заперто за шкафом -->
      <path d="M760 412 q-4 -6 0 -12 M800 412 q-4 -6 0 -12 M840 412 q-4 -6 0 -12" fill="none" stroke="#ff8c69" stroke-width="3" stroke-linecap="round">
        <animate attributeName="opacity" values="0.2;0.9;0.2" dur="1.6s" repeatCount="indefinite"/>
      </path>
      <!-- шкаф с папками стоит вплотную к батарее -->
      <rect x="718" y="440" width="146" height="260" rx="4" fill="#c99b6d" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M718 528 H864 M718 614 H864" stroke="#2b3a4a" stroke-width="3"/>
      <g stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round">
        <rect x="730" y="462" width="16" height="64" fill="#7a8cff"/><rect x="748" y="462" width="16" height="64" fill="#ff8c69"/><rect x="766" y="462" width="16" height="64" fill="#7ad1c1"/>
        <rect x="784" y="470" width="16" height="56" fill="#ffd166"/><rect x="730" y="550" width="16" height="62" fill="#ffd166"/><rect x="748" y="550" width="16" height="62" fill="#7a8cff"/>
        <rect x="810" y="560" width="40" height="52" fill="#ffffff"/>
      </g>
      <!-- значок: батарея перекрыта -->
      <circle cx="830" cy="490" r="18" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
      <path d="M818 478 L842 502" stroke="#ff8c69" stroke-width="5" stroke-linecap="round"/>
      <path d="M820 488 v10 M826 486 v14 M832 486 v14 M838 488 v10" stroke="#2b3a4a" stroke-width="2.5" stroke-linecap="round"/>
      <!-- электрообогреватель на полу раскалён -->
      <path d="M895 602 q-2 20 -10 30" fill="none" stroke="#2b3a4a" stroke-width="3"/>
      <rect x="866" y="626" width="46" height="72" rx="10" fill="#ff8c69" stroke="#2b3a4a" stroke-width="4"/>
      <rect x="873" y="640" width="32" height="40" rx="4" fill="#33404f" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M877 648 H901 M877 656 H901 M877 664 H901 M877 672 H901" stroke="#ffb347" stroke-width="3">
        <animate attributeName="stroke" values="#ffb347;#ff7a2a;#ffb347" dur="0.8s" repeatCount="indefinite"/>
      </path>
      <ellipse cx="889" cy="660" rx="38" ry="30" fill="url(#of-hot)"><animate attributeName="opacity" values="0.6;1;0.6" dur="0.8s" repeatCount="indefinite"/></ellipse>
      <g fill="none" stroke="#ff7a2a" stroke-width="3.5" stroke-linecap="round">
        <path d="M878 618 q-5 -8 0 -16 q5 -8 0 -16"><animateTransform attributeName="transform" type="translate" values="0 6;0 -10" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite"/></path>
        <path d="M898 618 q-5 -8 0 -16 q5 -8 0 -16"><animateTransform attributeName="transform" type="translate" values="0 6;0 -10" dur="1.2s" begin="0.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="1.2s" begin="0.6s" repeatCount="indefinite"/></path>
      </g>
    </g>
    <g class="v-ok">
      <!-- батарея свободна, тепло идёт в комнату -->
      <path d="M760 412 q-6 -10 0 -20 q6 -10 0 -20 M800 412 q-6 -10 0 -20 q6 -10 0 -20 M840 412 q-6 -10 0 -20 q6 -10 0 -20" fill="none" stroke="#ff9a3c" stroke-width="3.5" stroke-linecap="round"/>
      <!-- шкаф отодвинут, вместо него низкая тумба, обогревателя нет -->
      <rect x="770" y="612" width="104" height="88" rx="4" fill="#c99b6d" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M770 656 H874" stroke="#2b3a4a" stroke-width="3"/>
      <rect x="812" y="628" width="20" height="6" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
      <rect x="812" y="672" width="20" height="6" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M790 612 v-26 h10 v26 M804 612 v-34 h10 v34" fill="#7a8cff" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round"/>
    </g>
    <rect class="obj-hit" x="712" y="412" width="200" height="300" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-office-printer: принтер на тумбе ===== -->
  <g id="obj-office-printer" class="obj" data-state="problem">
    <rect x="932" y="610" width="150" height="90" rx="6" fill="#b8c4d2" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M932 655 H1082" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="997" y="628" width="20" height="6" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="997" y="672" width="20" height="6" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="2"/>
    <rect x="945" y="546" width="126" height="64" rx="10" fill="#eef2f6" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="945" y="530" width="126" height="20" rx="6" fill="#d5dde6" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M958 584 H1022" stroke="#2b3a4a" stroke-width="4" stroke-linecap="round"/>
    <rect x="1034" y="558" width="28" height="18" rx="3" fill="#2b3a4a"/>
    <g class="v-problem">
      <!-- на экране значок «одна сторона листа», листы вылетают один за другим -->
      <rect x="1043" y="561" width="10" height="12" rx="1" fill="#ffffff"/>
      <path d="M1045 565 h6 M1045 569 h6" stroke="#2b3a4a" stroke-width="1.5"/>
      <path d="M962 586 h56 l6 30 h-56 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round">
        <animateTransform attributeName="transform" type="translate" values="0 -10;0 6" dur="0.9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;1" dur="0.9s" repeatCount="indefinite"/>
      </path>
      <path d="M1000 540 l30 -24 l18 22 l-30 24 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round">
        <animateTransform attributeName="transform" type="translate" values="0 10;24 -18" dur="1.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0" dur="1.4s" repeatCount="indefinite"/>
      </path>
      <!-- гора односторонних черновиков на полу -->
      <g fill="#ffffff" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round">
        <rect x="1088" y="686" width="64" height="14"/><rect x="1090" y="672" width="62" height="14"/><rect x="1086" y="658" width="64" height="14"/>
        <rect x="1092" y="644" width="60" height="14"/><rect x="1088" y="630" width="62" height="14"/><rect x="1094" y="616" width="56" height="14"/>
        <path d="M1096 616 l4 -20 h44 l4 20 Z"/>
      </g>
      <path d="M1106 604 h28 M1104 610 h32" stroke="#9aa6b4" stroke-width="2.5"/>
      <circle cx="1166" cy="690" r="10" fill="#ffffff" stroke="#2b3a4a" stroke-width="2.5"/>
      <path d="M1160 686 l6 4 l5 -6" fill="none" stroke="#9aa6b4" stroke-width="2"/>
    </g>
    <g class="v-ok">
      <!-- на экране значок двусторонней печати: два листа и круговая стрелка -->
      <rect x="1038" y="560" width="9" height="12" rx="1" fill="#ffffff"/>
      <rect x="1049" y="562" width="9" height="12" rx="1" fill="#7ad1c1"/>
      <path d="M1040 576 q8 4 16 0" fill="none" stroke="#ffd166" stroke-width="1.8"/>
      <!-- аккуратная стопка распечаток -->
      <g fill="#ffffff" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round">
        <rect x="1092" y="686" width="56" height="14"/><rect x="1094" y="676" width="52" height="10"/>
      </g>
      <path d="M1100 681 h36" stroke="#9aa6b4" stroke-width="2"/>
    </g>
    <rect class="obj-hit" x="920" y="412" width="258" height="300" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-office-meeting-light: лампы в пустой переговорной ===== -->
  <g id="obj-office-meeting-light" class="obj" data-state="problem">
    <path d="M1290 34 V84 M1470 34 V84" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1245 84 H1335 L1323 106 H1257 Z" fill="#e7edf3" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M1425 84 H1515 L1503 106 H1437 Z" fill="#e7edf3" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <g class="v-problem">
      <!-- в пустой комнате горят все лампы -->
      <path d="M1257 106 H1323 L1380 520 H1200 Z" fill="url(#of-cone)"><animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite"/></path>
      <path d="M1437 106 H1503 L1560 520 H1380 Z" fill="url(#of-cone)"><animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite"/></path>
      <rect x="1259" y="104" width="62" height="7" rx="3" fill="#fff3a0" stroke="#2b3a4a" stroke-width="2"/>
      <rect x="1439" y="104" width="62" height="7" rx="3" fill="#fff3a0" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M1290 120 V136 M1262 116 L1250 128 M1318 116 L1330 128 M1470 120 V136 M1442 116 L1430 128 M1498 116 L1510 128" stroke="#ffb800" stroke-width="4" stroke-linecap="round">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/>
      </path>
    </g>
    <g class="v-ok">
      <!-- лампы выключены; на потолке датчик присутствия с «волнами» -->
      <rect x="1259" y="104" width="62" height="7" rx="3" fill="#cfd6df" stroke="#2b3a4a" stroke-width="2"/>
      <rect x="1439" y="104" width="62" height="7" rx="3" fill="#cfd6df" stroke="#2b3a4a" stroke-width="2"/>
      <path d="M1364 34 a16 16 0 0 0 32 0 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="1380" cy="42" r="4" fill="#7ad1c1" stroke="#2b3a4a" stroke-width="1.5"/>
      <path d="M1368 60 q12 10 24 0 M1362 70 q18 14 36 0" fill="none" stroke="#7a8cff" stroke-width="3" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="1185" y="36" width="410" height="200" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-office-board: доска с заметками в переговорной (всегда в порядке) ===== -->
  <g id="obj-office-board" class="obj" data-state="problem">
    <rect x="1405" y="262" width="175" height="120" rx="6" fill="#ffffff" stroke="#2b3a4a" stroke-width="4"/>
    <rect x="1415" y="382" width="155" height="8" rx="3" fill="#b3bcc6" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M1420 360 L1450 330 L1474 344 L1506 300" fill="none" stroke="#7a8cff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M1420 290 h40 M1420 302 h28" stroke="#9aa6b4" stroke-width="3" stroke-linecap="round"/>
    <rect x="1520" y="276" width="26" height="26" fill="#ffd166" stroke="#2b3a4a" stroke-width="2" transform="rotate(-6 1533 289)"/>
    <rect x="1544" y="312" width="26" height="26" fill="#ff9fc0" stroke="#2b3a4a" stroke-width="2" transform="rotate(5 1557 325)"/>
    <rect x="1518" y="342" width="26" height="26" fill="#9be8c5" stroke="#2b3a4a" stroke-width="2"/>
    <!-- нарисованная лампочка-идея -->
    <circle cx="1480" cy="296" r="9" fill="none" stroke="#ff9a3c" stroke-width="3"/>
    <path d="M1476 306 v6 h8 v-6" fill="none" stroke="#ff9a3c" stroke-width="3"/>
    <rect x="1440" y="384" width="18" height="5" rx="2" fill="#ff8c69"/>
    <rect class="obj-hit" x="1395" y="250" width="195" height="150" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-office-plant: большое растение в кадке (всегда в порядке) ===== -->
  <g id="obj-office-plant" class="obj" data-state="problem">
    <g fill="#5cbf6a" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <path d="M90 800 C60 770 30 760 30 730 C55 728 80 750 90 800 Z"/>
      <path d="M90 800 C80 750 70 720 92 696 C112 720 104 760 90 800 Z" fill="#6fd07a"/>
      <path d="M90 800 C110 760 140 744 156 750 C150 780 120 790 90 800 Z"/>
      <path d="M90 800 C70 790 40 800 32 786 C50 770 76 780 90 800 Z" fill="#6fd07a"/>
      <path d="M90 800 C100 776 128 720 146 716 C150 740 120 776 90 800 Z" fill="#6fd07a"/>
    </g>
    <path d="M92 704 V790 M44 736 L88 796 M150 752 L92 798" stroke="#3f9c4f" stroke-width="2.5"/>
    <path d="M48 798 H132 L122 880 H58 Z" fill="#ff8c69" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <rect x="42" y="792" width="96" height="16" rx="5" fill="#ffb35c" stroke="#2b3a4a" stroke-width="4"/>
    <rect class="obj-hit" x="22" y="690" width="140" height="196" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-office-chargers: удлинитель на полу с зарядками ===== -->
  <g id="obj-office-chargers" class="obj" data-state="problem">
    <!-- провод удлинителя тянется к розетке под столом -->
    <path d="M615 812 q30 0 40 -40 q6 -30 30 -52" fill="none" stroke="#2b3a4a" stroke-width="5" stroke-linecap="round"/>
    <rect x="452" y="798" width="166" height="28" rx="10" fill="#ffffff" stroke="#2b3a4a" stroke-width="4"/>
    <g fill="#d5dde6" stroke="#2b3a4a" stroke-width="2"><circle cx="496" cy="812" r="7"/><circle cx="526" cy="812" r="7"/><circle cx="556" cy="812" r="7"/><circle cx="586" cy="812" r="7"/></g>
    <rect x="460" y="804" width="20" height="16" rx="4" fill="#e3e9f0" stroke="#2b3a4a" stroke-width="2.5"/>
    <g class="v-problem">
      <!-- кнопка включена и светится -->
      <rect x="463" y="806" width="14" height="12" rx="3" fill="#ffb35c"/>
      <path d="M470 808 v8" stroke="#2b3a4a" stroke-width="2.5" stroke-linecap="round"/>
      <!-- четыре зарядки без телефонов: провода болтаются, огоньки мигают -->
      <g fill="#ffffff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <rect x="484" y="776" width="24" height="30" rx="5"/><rect x="514" y="776" width="24" height="30" rx="5" fill="#33404f"/>
        <rect x="544" y="776" width="24" height="30" rx="5"/><rect x="574" y="776" width="24" height="30" rx="5" fill="#33404f"/>
      </g>
      <g fill="none" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round">
        <path d="M496 776 q-6 -20 -24 -18 q-20 4 -14 22 q4 14 -10 22"/>
        <path d="M526 776 q4 -30 -10 -34 q-14 -2 -12 -14"/>
        <path d="M556 776 q10 -26 28 -24 q12 2 8 -16"/>
        <path d="M586 776 q16 -14 32 -6 q14 8 26 -6"/>
      </g>
      <g fill="#ffffff" stroke="#2b3a4a" stroke-width="2"><rect x="442" y="798" width="8" height="12" rx="2"/><rect x="500" y="723" width="8" height="12" rx="2"/><rect x="588" y="731" width="8" height="12" rx="2"/><rect x="640" y="760" width="8" height="12" rx="2"/></g>
      <g fill="#7dff9a" stroke="#2b3a4a" stroke-width="1.5">
        <circle cx="496" cy="798" r="3.5"><animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/></circle>
        <circle cx="526" cy="798" r="3.5"><animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite"/></circle>
        <circle cx="556" cy="798" r="3.5"><animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/></circle>
        <circle cx="586" cy="798" r="3.5"><animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite"/></circle>
      </g>
      <!-- молния: ток тратится впустую -->
      <path d="M622 760 l-10 18 h10 l-8 18 l20 -24 h-10 l8 -12 Z" fill="#ffd166" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round">
        <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite"/>
      </path>
    </g>
    <g class="v-ok">
      <!-- зарядки вынуты, удлинитель выключен кнопкой -->
      <rect x="463" y="806" width="14" height="12" rx="3" fill="#9aa6b4"/>
      <circle cx="470" cy="812" r="3.5" fill="none" stroke="#2b3a4a" stroke-width="2"/>
    </g>
    <rect class="obj-hit" x="430" y="716" width="230" height="134" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-office-paper-bin: мусорное ведро у столов ===== -->
  <g id="obj-office-paper-bin" class="obj" data-state="problem">
    <path d="M728 776 H824 L814 880 H738 Z" fill="#9aa6b4" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M752 792 L756 866 M776 792 V866 M800 792 L796 866" stroke="#7d8a99" stroke-width="3"/>
    <rect x="722" y="768" width="108" height="12" rx="5" fill="#b3bcc6" stroke="#2b3a4a" stroke-width="4"/>
    <g class="v-problem">
      <!-- ведро переполнено: бумага вперемешку с объедками -->
      <g fill="#ffffff" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round">
        <path d="M738 768 l10 -36 l30 6 l-8 30 Z"/>
        <path d="M790 768 l-6 -42 l32 -2 l4 44 Z"/>
        <circle cx="770" cy="752" r="14"/><circle cx="806" cy="756" r="12"/><circle cx="748" cy="756" r="11"/>
      </g>
      <path d="M764 748 l8 6 l-2 6 M800 752 l8 4 M744 754 l6 4" fill="none" stroke="#9aa6b4" stroke-width="2"/>
      <path d="M756 742 h14 M792 738 h18 M794 746 h14" stroke="#9aa6b4" stroke-width="2"/>
      <!-- банановая кожура и стаканчик -->
      <path d="M780 742 q-6 -16 6 -24 q2 12 10 18 q-8 0 -16 6 Z" fill="#ffd166" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M820 760 l4 -20 h14 l-2 20 Z" fill="#ff8c69" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- листы и комки бумаги на полу -->
      <circle cx="842" cy="872" r="11" fill="#ffffff" stroke="#2b3a4a" stroke-width="2.5"/>
      <path d="M700 878 l40 -10 l8 14 l-40 8 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="870" cy="850" r="9" fill="#ffffff" stroke="#2b3a4a" stroke-width="2.5"/>
    </g>
    <g class="v-ok">
      <!-- в ведре только кожура, а бумага — в синем контейнере для макулатуры -->
      <path d="M770 768 q-4 -12 4 -18 q2 10 8 14 q-6 0 -12 4 Z" fill="#ffd166" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="840" y="760" width="66" height="120" rx="6" fill="#5ab8f0" stroke="#2b3a4a" stroke-width="4"/>
      <g fill="#ffffff" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round">
        <path d="M850 760 l4 -20 h22 l-2 20 Z"/><path d="M872 760 l6 -14 h20 l-4 14 Z"/>
      </g>
      <!-- значок: лист бумаги и круговые стрелки переработки -->
      <path d="M860 790 h18 l8 8 v26 h-26 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M865 804 h16 M865 812 h16" stroke="#9aa6b4" stroke-width="2.5"/>
      <path d="M856 846 a17 17 0 0 1 32 -4 M890 852 a17 17 0 0 1 -32 4" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <path d="M884 836 l5 7 l-8 2 M861 862 l-5 -7 l8 -2" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <rect class="obj-hit" x="696" y="716" width="220" height="176" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-office-cartridges: урна у принтера ===== -->
  <g id="obj-office-cartridges" class="obj" data-state="problem">
    <path d="M958 790 H1022 L1016 880 H964 Z" fill="#9aa6b4" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <rect x="954" y="782" width="72" height="11" rx="5" fill="#b3bcc6" stroke="#2b3a4a" stroke-width="4"/>
    <g class="v-problem">
      <!-- в обычную урну выбросили батарейки и старый картридж -->
      <rect x="968" y="738" width="40" height="46" rx="5" fill="#33404f" stroke="#2b3a4a" stroke-width="3" transform="rotate(-14 988 761)"/>
      <rect x="976" y="752" width="22" height="8" rx="2" fill="#ff8c69" transform="rotate(-14 988 761)"/>
      <g stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round">
        <rect x="1004" y="760" width="14" height="28" rx="3" fill="#ffd166" transform="rotate(18 1011 774)"/>
        <rect x="1007" y="757" width="8" height="5" fill="#b3bcc6" transform="rotate(18 1011 774)"/>
        <rect x="956" y="762" width="14" height="28" rx="3" fill="#7ad1c1" transform="rotate(-24 963 776)"/>
        <rect x="959" y="759" width="8" height="5" fill="#b3bcc6" transform="rotate(-24 963 776)"/>
      </g>
      <!-- ещё одна батарейка летит в урну -->
      <g>
        <rect x="1040" y="730" width="14" height="28" rx="3" fill="#ff8c69" stroke="#2b3a4a" stroke-width="2.5"/>
        <rect x="1043" y="726" width="8" height="5" fill="#b3bcc6" stroke="#2b3a4a" stroke-width="2"/>
        <animateTransform attributeName="transform" type="translate" values="30 -10;0 0;-20 30" dur="1.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite"/>
      </g>
      <!-- значок-предупреждение -->
      <path d="M1090 812 l24 42 h-48 Z" fill="#ffd166" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M1090 828 v12" stroke="#2b3a4a" stroke-width="4" stroke-linecap="round"/><circle cx="1090" cy="847" r="2.5" fill="#2b3a4a"/>
    </g>
    <g class="v-ok">
      <!-- зелёный короб для приёма батареек и картриджей -->
      <rect x="1036" y="770" width="80" height="110" rx="6" fill="#6fd07a" stroke="#2b3a4a" stroke-width="4"/>
      <rect x="1050" y="780" width="52" height="8" rx="3" fill="#2b3a4a"/>
      <rect x="1062" y="802" width="28" height="50" rx="5" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
      <rect x="1070" y="796" width="12" height="7" fill="#ffffff" stroke="#2b3a4a" stroke-width="2.5"/>
      <path d="M1070 818 h12 M1076 812 v12 M1070 840 h12" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round"/>
      <path d="M1048 868 h56" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="940" y="716" width="190" height="176" rx="12" fill="transparent"/>
  </g>

  <!-- ===== Стеклянная стенка переговорной (поверх всего, не кликается) ===== -->
  <g pointer-events="none">
    <rect x="1182" y="36" width="418" height="662" fill="#bfe3ff" fill-opacity="0.14"/>
    <path d="M1250 60 L1190 180 M1290 60 L1200 240 M1560 300 L1500 420 M1592 320 L1520 470" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.55"/>
    <rect x="1182" y="430" width="418" height="18" fill="#ffffff" fill-opacity="0.55"/>
    <path d="M1182 36 V700" stroke="#2b3a4a" stroke-width="10"/>
    <path d="M1182 36 V700" stroke="#b3bcc6" stroke-width="5"/>
    <path d="M1392 240 V700" stroke="#2b3a4a" stroke-width="8"/>
    <path d="M1392 240 V700" stroke="#b3bcc6" stroke-width="3"/>
    <path d="M1182 694 H1600" stroke="#2b3a4a" stroke-width="8"/>
    <path d="M1182 694 H1600" stroke="#b3bcc6" stroke-width="3"/>
  </g>
</svg>`;
