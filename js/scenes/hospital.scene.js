/*
  hospital.scene.js — SVG-сцена больницы в разрезе: крыша, два этажа и подвал.

  Что в файле: одна строка EB.scenes.hospital с векторной картинкой (SVG) уровня «Больница».
  Размер холста 1600×900 (viewBox), сцена сама подстраивается под экран.
  Зимний солнечный день. Второй этаж: палата (пациент читает книгу), лифт, ординаторская,
  процедурный кабинет. Первый этаж: холл с регистратурой и входом, коридор, прачечная.
  Внизу — подвал с трубами горячей воды и тепловым пунктом. На крыше — место для солнечных коллекторов.

  Как устроен каждый интерактивный объект:
    <g id="obj-ИМЯ" class="obj" data-state="problem">
      ...части, видимые всегда...
      <g class="v-problem">…как выглядит проблема…</g>
      <g class="v-ok">…как выглядит после исправления…</g>
      <rect class="obj-hit" …/>   ← прозрачная зона клика, всегда ПОСЛЕДНЯЯ
    </g>
  Движок меняет data-state ("problem" / "ok"), а CSS прячет ненужный вариант.
  Анимации (SMIL) — в .v-problem; спокойная «кардиограмма» монитора и огонёк холодильника — всегда.

  Объекты сцены (проблема / после исправления):
    obj-hosp-roof         — плоская крыша: пустые места под солнцем / три солнечных коллектора и бак
    obj-hosp-window       — окно палаты: нараспашку, снег и холод внутрь, тепло батареи уходит / закрыто
    obj-hosp-lift         — лифт: пустая кабина ездит вверх-вниз / стоит внизу, кнопка вызова
    obj-hosp-office-light — ординаторская: пусто, а все лампы горят / лампы выключены, датчик присутствия
    obj-hosp-tap          — раковина в процедурной: капает горячая вода, пар / кран исправен
    obj-hosp-med-waste    — отходы в процедурной: шприц и перчатка в общем ведре, знак «!» /
                            жёлтый контейнер для медицинских отходов
    obj-hosp-door         — вход в холл: дверь подпёрта клином, холод внутрь / закрыта, доводчик
    obj-hosp-bins         — урна в холле: одна переполненная / три урны для раздельного сбора (значки)
    obj-hosp-lamps        — коридор: старые трубчатые лампы мигают / тонкие светодиодные панели
    obj-hosp-laundry      — прачечная: в барабане одна вещь, рядом полная корзина / барабан полный, корзина пуста
    obj-hosp-pipes        — подвал: голые трубы горячей воды, волны тепла / трубы в теплоизоляции
  Объекты «всё в порядке» (проблем у них нет — клик показывает «здесь всё в порядке»):
    obj-hosp-monitor      — медицинский монитор у кровати работает круглосуточно
    obj-hosp-med-fridge   — холодильник для лекарств работает круглосуточно

  Как менять:
    • координаты — в единицах viewBox (x: 0…1600 слева направо, y: 0…900 сверху вниз);
    • контур — цвет #2b3a4a, толщина 3–4;
    • id градиентов, узоров и обрезок начинаются с "hp-", чтобы не пересечься с другими сценами;
    • зоны клика (obj-hit) не должны перекрываться между объектами;
    • в строке нельзя использовать обратную кавычку и знак доллара с фигурной скобкой;
    • текстовых элементов SVG в сцене нет — игра двуязычная, все подписи в texts.*.js.
*/
EB.scenes = EB.scenes || {};
EB.scenes.hospital = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" class="scene-svg">
  <defs>
    <linearGradient id="hp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86cdfb"/><stop offset="1" stop-color="#e2f4ff"/></linearGradient>
    <linearGradient id="hp-out" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9dcff"/><stop offset="1" stop-color="#e8f6ff"/></linearGradient>
    <radialGradient id="hp-glow"><stop offset="0" stop-color="#fff6b0" stop-opacity="0.95"/><stop offset="0.5" stop-color="#ffe066" stop-opacity="0.45"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>
    <radialGradient id="hp-sun"><stop offset="0" stop-color="#fff7c2"/><stop offset="1" stop-color="#ffd166"/></radialGradient>
    <linearGradient id="hp-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a0" stop-opacity="0.75"/><stop offset="1" stop-color="#fff3a0" stop-opacity="0"/></linearGradient>
    <linearGradient id="hp-led" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.8"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
    <linearGradient id="hp-solar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f74bd"/><stop offset="1" stop-color="#25508f"/></linearGradient>
    <pattern id="hp-tiles" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="#d5eff7"/><path d="M28 0 V28 M0 28 H28" stroke="#a7d2df" stroke-width="2"/></pattern>
    <pattern id="hp-tiles2" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="#e2ebfb"/><path d="M28 0 V28 M0 28 H28" stroke="#b9c9e6" stroke-width="2"/></pattern>
    <clipPath id="hp-clip-win"><rect x="188" y="241" width="124" height="134"/></clipPath>
    <clipPath id="hp-clip-door"><rect x="174" y="554" width="94" height="164"/></clipPath>
  </defs>

  <!-- ===== ФОН (не интерактивный) ===== -->
  <g id="hp-bg" pointer-events="none">
    <!-- небо -->
    <rect x="0" y="0" width="1600" height="760" fill="url(#hp-sky)"/>
    <!-- солнце -->
    <path d="M1592 90 L1612 90 M1584 121 L1601 131 M1561 144 L1571 161 M1530 152 L1530 172 M1499 144 L1489 161 M1476 121 L1459 131 M1468 90 L1448 90 M1476 59 L1459 49 M1499 36 L1489 19 M1530 28 L1530 8 M1561 36 L1571 19 M1584 59 L1601 49" stroke="#ffb800" stroke-width="6" stroke-linecap="round"/>
    <circle cx="1530" cy="90" r="48" fill="url(#hp-sun)" stroke="#2b3a4a" stroke-width="4"/>
    <!-- облака -->
    <g transform="translate(650 78)" fill="#ffffff" stroke="#c9dceb" stroke-width="3"><ellipse cx="0" cy="0" rx="60" ry="24"/><circle cx="-22" cy="-14" r="24"/><circle cx="16" cy="-22" r="30"/></g>
    <g transform="translate(1110 44) scale(0.7)" fill="#ffffff" stroke="#c9dceb" stroke-width="3"><ellipse cx="0" cy="0" rx="60" ry="24"/><circle cx="-22" cy="-14" r="24"/><circle cx="16" cy="-22" r="30"/></g>
    <g transform="translate(66 70) scale(0.6)" fill="#ffffff" stroke="#c9dceb" stroke-width="3"><ellipse cx="0" cy="0" rx="60" ry="24"/><circle cx="-22" cy="-14" r="24"/><circle cx="16" cy="-22" r="30"/></g>
    <!-- дальние заснеженные холмы -->
    <path d="M0 740 Q120 640 260 690 T560 680 T1100 690 T1600 650 V760 H0 Z" fill="#e8f2f9" stroke="#c9dceb" stroke-width="3"/>
    <!-- земля в разрезе -->
    <rect x="0" y="752" width="1600" height="148" fill="#b98b5f"/>
    <g fill="#a3784e"><ellipse cx="40" cy="800" rx="14" ry="6"/><ellipse cx="96" cy="850" rx="10" ry="5"/><ellipse cx="1510" cy="810" rx="14" ry="6"/><ellipse cx="1565" cy="862" rx="10" ry="5"/><ellipse cx="60" cy="884" rx="8" ry="4"/><ellipse cx="1530" cy="886" rx="8" ry="4"/></g>
    <!-- снег на земле -->
    <path d="M0 738 H1600 V756 H0 Z" fill="#f7fbff" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
    <!-- ёлки по краям -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="58" y="704" width="16" height="36" fill="#8a5a3c"/>
      <path d="M66 560 L104 628 H28 Z" fill="#4caf7d"/>
      <path d="M66 600 L114 676 H18 Z" fill="#4caf7d"/>
      <path d="M66 640 L122 712 H10 Z" fill="#4caf7d"/>
      <path d="M66 560 L80 585 Q66 592 52 585 Z M66 600 L84 628 Q66 636 48 628 Z" fill="#ffffff" stroke-width="2"/>
      <rect x="1527" y="704" width="16" height="36" fill="#8a5a3c"/>
      <path d="M1535 570 L1571 634 H1499 Z" fill="#3fa070"/>
      <path d="M1535 606 L1581 680 H1489 Z" fill="#3fa070"/>
      <path d="M1535 644 L1590 712 H1480 Z" fill="#3fa070"/>
      <path d="M1535 570 L1548 594 Q1535 600 1522 594 Z M1535 606 L1552 634 Q1535 641 1518 634 Z" fill="#ffffff" stroke-width="2"/>
    </g>
    <!-- сугробы у ёлок -->
    <ellipse cx="66" cy="740" rx="56" ry="8" fill="#ffffff" stroke="#c9dceb" stroke-width="2"/>
    <ellipse cx="1535" cy="740" rx="52" ry="8" fill="#ffffff" stroke="#c9dceb" stroke-width="2"/>
  </g>

  <!-- ===== ЗДАНИЕ БОЛЬНИЦЫ (не интерактивное) ===== -->
  <g id="hp-building" pointer-events="none">
    <!-- каркас здания: стены и перекрытия -->
    <rect x="130" y="196" width="1340" height="692" fill="#cfd8e2" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <!-- вывеска на крыше: белый плюс в сердце и «буквы» полосками -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="214" y="164" width="10" height="24" fill="#8fa1b3"/>
      <rect x="378" y="164" width="10" height="24" fill="#8fa1b3"/>
      <rect x="172" y="98" width="258" height="70" rx="16" fill="#2bb5a8" stroke-width="4"/>
      <path d="M220 152 C190 132 186 112 200 106 C210 102 218 108 220 114 C222 108 230 102 240 106 C254 112 250 132 220 152 Z" fill="#ffffff"/>
      <path d="M214 118 h12 v8 h8 v10 h-8 v8 h-12 v-8 h-8 v-10 h8 Z" fill="#3fa070" stroke-width="2"/>
    </g>
    <g fill="#ffffff"><rect x="262" y="114" width="146" height="12" rx="6"/><rect x="262" y="138" width="104" height="12" rx="6"/></g>
    <!-- вентиляционный короб на крыше -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="560" y="150" width="76" height="36" rx="4" fill="#b8c4d0"/>
      <path d="M572 160 h52 M572 168 h52 M572 176 h52" stroke-width="2"/>
      <rect x="676" y="160" width="40" height="26" rx="4" fill="#b8c4d0"/>
    </g>
    <!-- плита крыши и снег на краях -->
    <rect x="116" y="184" width="1368" height="20" rx="4" fill="#8fa1b3" stroke="#2b3a4a" stroke-width="4"/>
    <path d="M118 186 q30 -10 60 -2 q20 -6 40 2 Z M1440 186 q20 -9 42 0 Z" fill="#ffffff" stroke="#c9dceb" stroke-width="2"/>

    <!-- комнаты второго этажа -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="142" y="210" width="486" height="258" fill="#e1f5ea"/>
      <rect x="772" y="210" width="336" height="258" fill="#e9edfc"/>
      <rect x="1122" y="210" width="336" height="258" fill="#effafd"/>
    </g>
    <rect x="1123" y="336" width="334" height="114" fill="url(#hp-tiles)"/>
    <!-- полы второго этажа -->
    <g stroke="#2b3a4a" stroke-width="3">
      <rect x="142" y="448" width="486" height="20" fill="#e8c89a"/>
      <rect x="772" y="448" width="336" height="20" fill="#d9b88a"/>
      <rect x="1122" y="448" width="336" height="20" fill="#bcdbe6"/>
    </g>
    <!-- комнаты первого этажа -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="142" y="488" width="486" height="250" fill="#fff1d6"/>
      <rect x="772" y="488" width="336" height="250" fill="#f3eaff"/>
      <rect x="1122" y="488" width="336" height="250" fill="#f4f8ff"/>
    </g>
    <rect x="1123" y="620" width="334" height="98" fill="url(#hp-tiles2)"/>
    <!-- полы первого этажа -->
    <g stroke="#2b3a4a" stroke-width="3">
      <rect x="142" y="718" width="486" height="20" fill="#d6c3a5"/>
      <rect x="772" y="718" width="336" height="20" fill="#cdb7e0"/>
      <rect x="1122" y="718" width="336" height="20" fill="#c3d2ea"/>
    </g>
    <!-- подвал -->
    <rect x="142" y="760" width="1316" height="118" fill="#d8d0c4" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="142" y="862" width="1316" height="16" fill="#b9ae9f" stroke="#2b3a4a" stroke-width="3"/>
    <!-- шахта лифта на оба этажа -->
    <rect x="642" y="210" width="116" height="528" fill="#c3cfdb" stroke="#2b3a4a" stroke-width="3"/>
    <path d="M642 466 H758 M642 488 H758" stroke="#9aa9b8" stroke-width="3" stroke-dasharray="8 6"/>

    <!-- ПАЛАТА: картина над кроватью -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="470" y="236" width="96" height="64" rx="4" fill="#fff8e6"/>
      <path d="M476 292 L500 266 L520 284 L536 270 L560 292 Z" fill="#7cc77a" stroke-width="2"/>
      <circle cx="544" cy="252" r="7" fill="#ffd166" stroke-width="2"/>
    </g>
    <!-- ПАЛАТА: кровать и пациент, который читает книгу -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="606" y="350" width="14" height="96" rx="5" fill="#8fb3d9"/>
      <rect x="438" y="392" width="12" height="54" rx="4" fill="#8fb3d9"/>
      <rect x="446" y="408" width="164" height="18" rx="6" fill="#ffffff"/>
      <rect x="442" y="424" width="174" height="12" rx="4" fill="#8fb3d9"/>
      <rect x="450" y="434" width="8" height="14" fill="#6b7b8c"/>
      <rect x="598" y="434" width="8" height="14" fill="#6b7b8c"/>
      <ellipse cx="588" cy="378" rx="22" ry="30" fill="#ffffff"/>
      <!-- пижама -->
      <rect x="546" y="364" width="42" height="48" rx="14" fill="#8ec5ff"/>
      <path d="M556 366 v44 M568 364 v48 M580 366 v44" stroke="#5f9fe0" stroke-width="2"/>
      <!-- голова -->
      <circle cx="566" cy="344" r="21" fill="#f6c9a4"/>
      <path d="M545 342 q2 -24 22 -24 q20 0 21 22 q-10 -10 -22 -8 q-12 2 -21 10 Z" fill="#6b4a2e"/>
      <circle cx="555" cy="347" r="2.5" fill="#2b3a4a" stroke="none"/>
      <path d="M551 356 q5 4 10 0" fill="none" stroke-width="2.5" stroke-linecap="round"/>
      <!-- одеяло -->
      <path d="M452 400 Q500 390 556 398 Q566 404 562 414 H452 Z" fill="#ffd166"/>
      <g fill="#ffb347" stroke="none"><circle cx="476" cy="404" r="3"/><circle cx="500" cy="402" r="3"/><circle cx="524" cy="404" r="3"/><circle cx="546" cy="405" r="3"/></g>
      <!-- книга в руках -->
      <path d="M516 368 L532 374 L532 398 L516 392 Z" fill="#ffffff"/>
      <path d="M532 374 L548 368 L548 392 L532 398 Z" fill="#ffffff"/>
      <path d="M512 366 L516 368 L516 392 L512 390 Z" fill="#ff8c69"/>
      <path d="M520 378 l8 3 M520 385 l8 3 M536 381 l8 -3 M536 388 l8 -3" stroke-width="1.5"/>
      <circle cx="548" cy="384" r="6" fill="#f6c9a4"/>
    </g>

    <!-- ОРДИНАТОРСКАЯ: окно, часы, стол, пустое кресло, вешалка с халатом -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="1000" y="250" width="88" height="90" rx="4" fill="#ffffff"/>
      <rect x="1007" y="257" width="74" height="76" fill="url(#hp-out)"/>
      <path d="M1044 257 V333 M1007 295 H1081" stroke-width="3"/>
      <circle cx="850" cy="262" r="20" fill="#ffffff"/>
      <path d="M850 262 V250 M850 262 L859 267" stroke-linecap="round"/>
      <rect x="800" y="384" width="160" height="14" rx="3" fill="#c58b5a"/>
      <rect x="808" y="398" width="10" height="50" fill="#a8744a"/>
      <rect x="900" y="398" width="52" height="46" rx="3" fill="#c58b5a"/>
      <path d="M906 420 h40" stroke-width="2"/>
      <rect x="820" y="334" width="62" height="42" rx="5" fill="#3d4b5c"/>
      <rect x="846" y="376" width="10" height="8" fill="#8a99a8"/>
      <rect x="892" y="372" width="44" height="12" rx="2" fill="#ffffff"/>
      <path d="M896 376 h34 M896 380 h28" stroke-width="1.5"/>
      <rect x="958" y="404" width="48" height="10" rx="4" fill="#5aa9e6"/>
      <rect x="996" y="356" width="14" height="54" rx="6" fill="#5aa9e6"/>
      <rect x="978" y="414" width="6" height="22" fill="#6b7b8c"/>
      <path d="M960 444 L981 436 L1002 444" fill="none" stroke-linecap="round"/>
      <circle cx="960" cy="446" r="3" fill="#2b3a4a"/><circle cx="1002" cy="446" r="3" fill="#2b3a4a"/>
      <rect x="1062" y="352" width="6" height="94" fill="#8a5a3c"/>
      <path d="M1050 446 h30" stroke-linecap="round"/>
      <path d="M1065 356 l-16 10 l-4 50 h40 l-4 -50 Z" fill="#ffffff"/>
      <path d="M1065 358 v58" stroke-width="2"/>
    </g>

    <!-- ПРОЦЕДУРНАЯ: зеркало и шкафчик с лекарствами -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="1152" y="252" width="56" height="44" rx="10" fill="#d9f1ff"/>
      <path d="M1162 264 l12 -6 M1162 276 l22 -12" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <rect x="1372" y="236" width="80" height="62" rx="4" fill="#ffffff"/>
      <path d="M1412 236 V298 M1372 267 H1452" stroke-width="2"/>
      <g stroke-width="2"><rect x="1380" y="246" width="10" height="16" rx="2" fill="#ffd166"/><rect x="1394" y="250" width="10" height="12" rx="2" fill="#8ec5ff"/><rect x="1420" y="248" width="12" height="14" rx="2" fill="#a7e08f"/><rect x="1380" y="276" width="24" height="16" rx="2" fill="#ffb3c1"/><rect x="1420" y="278" width="10" height="14" rx="2" fill="#ffffff"/><rect x="1434" y="274" width="10" height="18" rx="2" fill="#ffd166"/></g>
    </g>

    <!-- ХОЛЛ: табличка «информация», регистратура и сотрудница в белом халате -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <circle cx="408" cy="526" r="20" fill="#2bb5a8"/>
      <circle cx="408" cy="516" r="3.5" fill="#ffffff" stroke="none"/>
      <rect x="404" y="523" width="8" height="15" rx="3" fill="#ffffff" stroke="none"/>
      <!-- сотрудница -->
      <rect x="386" y="604" width="46" height="40" rx="14" fill="#ffffff"/>
      <path d="M409 606 v34" stroke-width="2"/>
      <rect x="414" y="614" width="12" height="8" rx="2" fill="#8ec5ff" stroke-width="2"/>
      <circle cx="409" cy="584" r="20" fill="#e8b48f"/>
      <path d="M389 584 q0 -24 20 -24 q20 0 20 24 q-6 -12 -20 -12 q-14 0 -20 12 Z" fill="#2f2f3a"/>
      <circle cx="409" cy="560" r="8" fill="#2f2f3a"/>
      <circle cx="402" cy="587" r="2.5" fill="#2b3a4a" stroke="none"/><circle cx="416" cy="587" r="2.5" fill="#2b3a4a" stroke="none"/>
      <path d="M403 596 q6 5 12 0" fill="none" stroke-width="2.5" stroke-linecap="round"/>
      <!-- монитор на стойке (вид сзади) -->
      <rect x="444" y="598" width="40" height="30" rx="4" fill="#8a99a8"/>
      <!-- стойка регистратуры -->
      <rect x="318" y="626" width="176" height="14" rx="4" fill="#ffffff"/>
      <rect x="326" y="638" width="160" height="80" rx="4" fill="#6fc3b2" stroke-width="4"/>
      <path d="M340 660 h132 M340 690 h132" stroke="#4fa898" stroke-width="3"/>
      <!-- цветок в горшке на стойке -->
      <path d="M338 604 h22 l-4 22 h-14 Z" fill="#ff8c69"/>
      <path d="M349 604 q-12 -16 -4 -28 q10 6 4 28 q6 -18 16 -16 q2 12 -16 16" fill="#7cc77a" stroke-width="2"/>
    </g>

    <!-- КОРИДОР: поручень, скамейка, подросток с цветами, дверь кабинета, растение -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <path d="M776 650 H1000" stroke="#b39ddb" stroke-width="6" stroke-linecap="round"/>
      <rect x="1012" y="604" width="78" height="114" rx="3" fill="#ffffff"/>
      <rect x="1030" y="616" width="42" height="30" rx="3" fill="#d9f1ff" stroke-width="2"/>
      <rect x="1074" y="664" width="10" height="5" rx="2" fill="#8a99a8" stroke-width="2"/>
      <path d="M786 694 h28 l-4 24 h-20 Z" fill="#ffb35c"/>
      <path d="M800 694 q-16 -26 -6 -46 q14 16 6 46 q4 -30 22 -36 q4 20 -22 36" fill="#4caf7d" stroke-width="2"/>
      <!-- скамейка -->
      <rect x="840" y="688" width="148" height="10" rx="4" fill="#c58b5a"/>
      <rect x="848" y="698" width="8" height="20" fill="#a8744a"/>
      <rect x="972" y="698" width="8" height="20" fill="#a8744a"/>
      <!-- пакет с апельсинами -->
      <rect x="852" y="662" width="30" height="26" rx="3" fill="#e8c89a"/>
      <circle cx="860" cy="660" r="7" fill="#ffa53a" stroke-width="2"/><circle cx="874" cy="658" r="7" fill="#ffa53a" stroke-width="2"/>
      <!-- подросток-посетитель -->
      <rect x="904" y="686" width="13" height="30" rx="4" fill="#3d5a80"/>
      <rect x="920" y="686" width="13" height="30" rx="4" fill="#3d5a80"/>
      <ellipse cx="908" cy="719" rx="10" ry="5" fill="#ffffff"/><ellipse cx="928" cy="719" rx="10" ry="5" fill="#ffffff"/>
      <rect x="898" y="640" width="40" height="50" rx="14" fill="#ff8c69"/>
      <circle cx="918" cy="620" r="20" fill="#f1c19a"/>
      <path d="M898 618 q0 -22 20 -22 q20 0 20 22 q-4 -8 -12 -10 q-4 6 -14 4 q-8 -2 -14 6 Z" fill="#c0612b"/>
      <circle cx="911" cy="623" r="2.5" fill="#2b3a4a" stroke="none"/><circle cx="925" cy="623" r="2.5" fill="#2b3a4a" stroke="none"/>
      <path d="M911 632 q7 5 14 0" fill="none" stroke-width="2.5" stroke-linecap="round"/>
      <!-- букет -->
      <path d="M944 668 L952 640 M944 668 L962 646 M944 668 L940 642" fill="none" stroke="#3fa070" stroke-width="3"/>
      <circle cx="952" cy="636" r="7" fill="#ffd166" stroke-width="2"/><circle cx="964" cy="642" r="7" fill="#ff8fa3" stroke-width="2"/><circle cx="939" cy="638" r="7" fill="#b39ddb" stroke-width="2"/>
      <circle cx="942" cy="668" r="6" fill="#f1c19a"/>
    </g>

    <!-- ПРАЧЕЧНАЯ: полка с моющим средством и стеллаж с чистым бельём -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="1146" y="540" width="140" height="8" rx="2" fill="#c58b5a"/>
      <rect x="1158" y="514" width="20" height="26" rx="4" fill="#5aa9e6"/>
      <rect x="1186" y="520" width="18" height="20" rx="4" fill="#ffd166"/>
      <rect x="1248" y="516" width="22" height="24" rx="4" fill="#a7e08f"/>
      <rect x="1414" y="540" width="40" height="178" fill="#e0c39d"/>
      <path d="M1414 586 h40 M1414 632 h40 M1414 676 h40" stroke-width="3"/>
      <g stroke-width="2"><rect x="1418" y="566" width="32" height="18" rx="3" fill="#ffffff"/><rect x="1418" y="612" width="32" height="18" rx="3" fill="#bfe7ff"/><rect x="1418" y="656" width="32" height="18" rx="3" fill="#ffffff"/><rect x="1418" y="700" width="32" height="16" rx="3" fill="#ffd9e0"/></g>
    </g>

    <!-- ПОДВАЛ: тепловой пункт, ящики, ведро со шваброй -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="900" y="796" width="40" height="12" fill="#b0bcc8"/>
      <rect x="900" y="836" width="40" height="12" fill="#b0bcc8"/>
      <rect x="938" y="772" width="112" height="92" rx="22" fill="#f0a868" stroke-width="4"/>
      <circle cx="994" cy="804" r="15" fill="#ffffff"/>
      <path d="M994 804 L1002 796" stroke-linecap="round"/>
      <rect x="966" y="830" width="56" height="10" rx="4" fill="#d98c4a"/>
      <rect x="1100" y="810" width="70" height="52" rx="3" fill="#d9a066"/>
      <rect x="1176" y="822" width="56" height="40" rx="3" fill="#e2b07a"/>
      <rect x="1112" y="770" width="52" height="40" rx="3" fill="#e2b07a"/>
      <path d="M1100 830 h70 M1135 810 v20 M1176 838 h56" stroke-width="2"/>
      <path d="M1300 830 h50 l-6 32 h-38 Z" fill="#5aa9e6"/>
      <path d="M1338 830 L1366 772" stroke="#a8744a" stroke-width="5" stroke-linecap="round"/>
      <rect x="1390" y="784" width="56" height="78" rx="4" fill="#c3cfdb"/>
      <path d="M1390 810 h56 M1390 836 h56" stroke-width="2"/>
    </g>
  </g>

  <!-- ===== obj-hosp-roof: крыша — место для солнечных коллекторов ===== -->
  <g id="obj-hosp-roof" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- пустые места под солнцем: пунктирные рамки и лучи, которые падают зря -->
      <g fill="none" stroke="#2b3a4a" stroke-width="3" stroke-dasharray="10 8" stroke-linejoin="round">
        <path d="M868 180 L1012 180 L992 124 L888 124 Z"/>
        <path d="M1050 180 L1194 180 L1174 124 L1070 124 Z"/>
        <path d="M1232 180 L1376 180 L1356 124 L1252 124 Z"/>
      </g>
      <g stroke="#ffb800" stroke-width="5" stroke-linecap="round">
        <path d="M980 100 L940 150"><animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite"/></path>
        <path d="M1160 100 L1120 150"><animate attributeName="opacity" values="0.2;1;0.2" dur="2s" begin="0.6s" repeatCount="indefinite"/></path>
        <path d="M1340 100 L1300 150"><animate attributeName="opacity" values="0.2;1;0.2" dur="2s" begin="1.2s" repeatCount="indefinite"/></path>
      </g>
      <g fill="#ffd166" stroke="#2b3a4a" stroke-width="2">
        <path d="M940 160 l4 -9 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 Z"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/></path>
        <path d="M1120 160 l4 -9 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 Z"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.6s" repeatCount="indefinite"/></path>
        <path d="M1300 160 l4 -9 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 Z"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.2s" repeatCount="indefinite"/></path>
      </g>
    </g>
    <g class="v-ok">
      <!-- три солнечных коллектора (трубки греют воду) и бак горячей воды -->
      <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <path d="M880 184 L888 152 M996 184 L992 152 M1062 184 L1070 152 M1178 184 L1174 152 M1244 184 L1252 152 M1360 184 L1356 152" stroke="#6b7b8c" stroke-width="5"/>
        <path d="M868 180 L1012 180 L992 124 L888 124 Z" fill="url(#hp-solar)"/>
        <path d="M1050 180 L1194 180 L1174 124 L1070 124 Z" fill="url(#hp-solar)"/>
        <path d="M1232 180 L1376 180 L1356 124 L1252 124 Z" fill="url(#hp-solar)"/>
        <g stroke="#cfe6ff" stroke-width="3" stroke-linecap="round">
          <path d="M890 176 L898 128 M910 176 L916 128 M930 176 L934 128 M950 176 L952 128 M970 176 L970 128 M990 176 L988 128"/>
          <path d="M1072 176 L1080 128 M1092 176 L1098 128 M1112 176 L1116 128 M1132 176 L1134 128 M1152 176 L1152 128 M1172 176 L1170 128"/>
          <path d="M1254 176 L1262 128 M1274 176 L1280 128 M1294 176 L1298 128 M1314 176 L1316 128 M1334 176 L1334 128 M1354 176 L1352 128"/>
        </g>
        <rect x="886" y="118" width="108" height="8" rx="3" fill="#b0bcc8"/>
        <rect x="1068" y="118" width="108" height="8" rx="3" fill="#b0bcc8"/>
        <rect x="1250" y="118" width="108" height="8" rx="3" fill="#b0bcc8"/>
        <path d="M994 122 H1068 M1176 122 H1250 M1358 122 H1398" fill="none" stroke="#ff8c3a" stroke-width="5"/>
        <rect x="1390" y="120" width="54" height="62" rx="16" fill="#e9eef3"/>
        <path d="M1402 140 q6 -8 12 0 q6 8 12 0" fill="none" stroke="#ff8c3a" stroke-width="3" stroke-linecap="round"/>
        <path d="M1402 156 q6 -8 12 0 q6 8 12 0" fill="none" stroke="#ff8c3a" stroke-width="3" stroke-linecap="round"/>
      </g>
    </g>
    <rect class="obj-hit" x="820" y="80" width="630" height="106" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-hosp-window: окно в палате ===== -->
  <g id="obj-hosp-window" class="obj" data-state="problem">
    <!-- всегда: карниз, рама, вид на зимнюю улицу, подоконник, батарея -->
    <rect x="166" y="222" width="168" height="10" rx="5" fill="#ffb3c1" stroke="#2b3a4a" stroke-width="3"/>
    <rect x="180" y="233" width="140" height="150" rx="6" fill="#ffffff" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <g clip-path="url(#hp-clip-win)">
      <rect x="188" y="241" width="124" height="134" fill="url(#hp-out)"/>
      <path d="M188 352 Q230 336 270 348 T312 342 V375 H188 Z" fill="#ffffff" stroke="#c9dceb" stroke-width="2"/>
      <path d="M282 278 L300 314 H264 Z M282 298 L304 340 H260 Z" fill="#4caf7d" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
      <rect x="278" y="340" width="8" height="12" fill="#8a5a3c"/>
    </g>
    <rect x="172" y="380" width="156" height="10" rx="3" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="192" y="398" width="116" height="42" rx="6" fill="#f4f6f8"/>
      <path d="M207 402 v34 M222 402 v34 M237 402 v34 M252 402 v34 M267 402 v34 M282 402 v34 M297 402 v34" stroke-width="2"/>
      <path d="M200 440 v8 M300 440 v8" stroke-width="4"/>
    </g>
    <g class="v-problem">
      <!-- створки распахнуты внутрь, с улицы летит снег и холод -->
      <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <path d="M188 241 L158 252 L158 368 L188 375 Z" fill="#d6efff"/>
        <path d="M312 241 L342 252 L342 368 L312 375 Z" fill="#d6efff"/>
        <path d="M173 248 V372 M327 248 V372" stroke-width="2"/>
      </g>
      <g clip-path="url(#hp-clip-win)" fill="#ffffff" stroke="#9cc3e0" stroke-width="1.5">
        <g><circle cx="204" cy="240" r="4"/><circle cx="246" cy="226" r="3.5"/><circle cx="296" cy="236" r="4"/><circle cx="226" cy="200" r="3"/><circle cx="270" cy="190" r="4"/>
          <animateTransform attributeName="transform" type="translate" values="0 0;10 120" dur="3s" repeatCount="indefinite"/></g>
        <g><circle cx="216" cy="290" r="3.5"/><circle cx="262" cy="280" r="4"/><circle cx="302" cy="300" r="3"/><circle cx="196" cy="320" r="3"/>
          <animateTransform attributeName="transform" type="translate" values="0 -60;10 60" dur="3s" repeatCount="indefinite"/></g>
      </g>
      <!-- холодный воздух заходит в палату -->
      <g fill="none" stroke="#3b8fd9" stroke-width="4" stroke-linecap="round">
        <g><path d="M230 292 q12 -10 24 0 q12 10 24 0"/>
          <animateTransform attributeName="transform" type="translate" values="0 0;90 20" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite"/></g>
        <g><path d="M220 330 q12 -10 24 0 q12 10 24 0"/>
          <animateTransform attributeName="transform" type="translate" values="0 0;90 20" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="1.2s" repeatCount="indefinite"/></g>
      </g>
      <!-- тепло от батареи уходит прямо в окно -->
      <g fill="none" stroke="#ff8c3a" stroke-width="4" stroke-linecap="round">
        <g><path d="M216 392 q-6 -10 0 -20 q6 -10 0 -20"/>
          <animateTransform attributeName="transform" type="translate" values="0 0;-4 -70" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/></g>
        <g><path d="M252 392 q-6 -10 0 -20 q6 -10 0 -20"/>
          <animateTransform attributeName="transform" type="translate" values="0 0;-4 -70" dur="2s" begin="0.7s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.7s" repeatCount="indefinite"/></g>
        <g><path d="M288 392 q-6 -10 0 -20 q6 -10 0 -20"/>
          <animateTransform attributeName="transform" type="translate" values="0 0;-4 -70" dur="2s" begin="1.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.4s" repeatCount="indefinite"/></g>
      </g>
    </g>
    <g class="v-ok">
      <!-- окно закрыто: две створки с ручкой -->
      <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <rect x="188" y="241" width="61" height="134" fill="#d6efff" fill-opacity="0.35"/>
        <rect x="251" y="241" width="61" height="134" fill="#d6efff" fill-opacity="0.35"/>
        <rect x="240" y="298" width="6" height="20" rx="2" fill="#e9eef3" stroke-width="2"/>
        <path d="M198 256 l16 -10 M198 274 l30 -20 M262 256 l16 -10" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      </g>
    </g>
    <rect class="obj-hit" x="150" y="218" width="182" height="234" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-hosp-monitor: медицинский монитор у кровати (всё в порядке) ===== -->
  <g id="obj-hosp-monitor" class="obj" data-state="ok">
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="381" y="334" width="7" height="108" fill="#9aa9b8" stroke-width="2"/>
      <path d="M356 442 H412" stroke-width="5" stroke-linecap="round"/>
      <circle cx="358" cy="446" r="5" fill="#3d4b5c"/><circle cx="410" cy="446" r="5" fill="#3d4b5c"/>
      <rect x="344" y="276" width="80" height="62" rx="9" fill="#dfe6ee"/>
      <rect x="351" y="283" width="66" height="46" rx="5" fill="#1f3b4d"/>
      <path d="M424 318 Q440 330 444 380" fill="none" stroke="#6b7b8c" stroke-width="3"/>
    </g>
    <!-- спокойная кардиограмма бежит по экрану -->
    <path d="M354 312 h12 l4 -10 l5 20 l5 -16 l3 6 h30" fill="none" stroke="#7ef0b0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="40 40">
      <animate attributeName="stroke-dashoffset" values="80;0" dur="1.6s" repeatCount="indefinite"/>
    </path>
    <path d="M404 290 c-3 -4 -9 -1 -6 4 l6 6 l6 -6 c3 -5 -3 -8 -6 -4 Z" fill="#ff8fa3"/>
    <circle cx="360" cy="292" r="3.5" fill="#7ef0b0"/>
    <rect class="obj-hit" x="338" y="268" width="94" height="184" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-hosp-lift: лифт ===== -->
  <g id="obj-hosp-lift" class="obj" data-state="problem">
    <!-- всегда: направляющие, трос, лебёдка наверху -->
    <path d="M654 236 V734 M746 236 V734" stroke="#8a99a8" stroke-width="4"/>
    <path d="M700 234 V734" stroke="#6b7b8c" stroke-width="2"/>
    <rect x="668" y="214" width="64" height="22" rx="5" fill="#9aa9b8" stroke="#2b3a4a" stroke-width="3"/>
    <circle cx="700" cy="225" r="7" fill="#e9eef3" stroke="#2b3a4a" stroke-width="2"/>
    <g class="v-problem">
      <!-- стрелки «вверх» и «вниз» мигают по очереди -->
      <path d="M672 268 l10 -14 l10 14 Z" fill="#ffd166" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"><animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite"/></path>
      <path d="M708 254 l10 14 l10 -14 Z" fill="#ffd166" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"><animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite"/></path>
      <!-- пустая освещённая кабина ездит вверх-вниз -->
      <g>
        <rect x="658" y="340" width="84" height="112" rx="6" fill="#ffe8a3" stroke="#2b3a4a" stroke-width="3"/>
        <rect x="668" y="352" width="64" height="92" rx="3" fill="#fff6d6" stroke="#2b3a4a" stroke-width="2"/>
        <circle cx="700" cy="358" r="14" fill="url(#hp-glow)"/>
        <rect x="690" y="352" width="20" height="5" rx="2" fill="#fff3a0" stroke="#2b3a4a" stroke-width="1.5"/>
        <path d="M672 404 H728" stroke="#b0bcc8" stroke-width="3" stroke-linecap="round"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 270;0 270;0 0" keyTimes="0;0.15;0.5;0.65;1" dur="6s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- кабина стоит внизу с закрытыми дверями, ждёт вызова -->
      <rect x="658" y="610" width="84" height="112" rx="6" fill="#dfe6ee" stroke="#2b3a4a" stroke-width="3"/>
      <rect x="666" y="618" width="33" height="100" rx="2" fill="#c3cfdb" stroke="#2b3a4a" stroke-width="2"/>
      <rect x="701" y="618" width="33" height="100" rx="2" fill="#c3cfdb" stroke="#2b3a4a" stroke-width="2"/>
      <!-- кнопка вызова на этажах -->
      <circle cx="700" cy="590" r="10" fill="#7ed957" stroke="#2b3a4a" stroke-width="3"/>
      <circle cx="700" cy="590" r="4" fill="#ffffff"/>
      <circle cx="700" cy="436" r="10" fill="#7ed957" stroke="#2b3a4a" stroke-width="3"/>
      <circle cx="700" cy="436" r="4" fill="#ffffff"/>
    </g>
    <rect class="obj-hit" x="645" y="214" width="110" height="522" rx="10" fill="transparent"/>
  </g>

  <!-- ===== obj-hosp-office-light: свет в пустой ординаторской ===== -->
  <g id="obj-hosp-office-light" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- никого нет, а все три лампы горят -->
      <g fill="url(#hp-beam)" opacity="0.8">
        <path d="M812 224 H868 L910 446 H770 Z"/>
        <path d="M912 224 H968 L1010 446 H870 Z"/>
        <path d="M1012 224 H1068 L1108 446 H970 Z"/>
      </g>
      <g fill="url(#hp-glow)"><circle cx="840" cy="226" r="40"/><circle cx="940" cy="226" r="40"/><circle cx="1040" cy="226" r="40"/></g>
      <g fill="#fff3a0" stroke="#2b3a4a" stroke-width="3">
        <rect x="810" y="212" width="60" height="14" rx="5"/><rect x="910" y="212" width="60" height="14" rx="5"/><rect x="1010" y="212" width="60" height="14" rx="5"/>
      </g>
      <g stroke="#ffb800" stroke-width="3" stroke-linecap="round">
        <path d="M800 236 l-10 8 M880 236 l10 8 M900 236 l-10 8 M980 236 l10 8 M1000 236 l-10 8 M1080 236 l10 8"/>
        <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- лампы выключены, на потолке датчик присутствия -->
      <g fill="#c9d3de" stroke="#2b3a4a" stroke-width="3">
        <rect x="810" y="212" width="60" height="14" rx="5"/><rect x="910" y="212" width="60" height="14" rx="5"/><rect x="1010" y="212" width="60" height="14" rx="5"/>
      </g>
      <path d="M878 212 a12 12 0 0 0 24 0 Z" fill="#ffffff" stroke="#2b3a4a" stroke-width="3"/>
      <circle cx="890" cy="218" r="3" fill="#7ed957"/>
      <path d="M876 232 q14 10 28 0 M870 242 q20 14 40 0" fill="none" stroke="#3b8fd9" stroke-width="3" stroke-linecap="round"/>
    </g>
    <rect class="obj-hit" x="780" y="214" width="320" height="246" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-hosp-tap: раковина и кран горячей воды в процедурной ===== -->
  <g id="obj-hosp-tap" class="obj" data-state="problem">
    <g stroke="#2b3a4a" stroke-linejoin="round">
      <rect x="1168" y="386" width="24" height="62" fill="#ffffff" stroke-width="3"/>
      <path d="M1130 352 H1230 Q1230 390 1180 390 Q1130 390 1130 352 Z" fill="#ffffff" stroke-width="3"/>
      <path d="M1140 356 H1220" stroke="#d6e3ee" stroke-width="3"/>
      <rect x="1176" y="322" width="10" height="32" fill="#c7d2dc" stroke-width="3"/>
      <path d="M1186 326 H1158 Q1150 326 1150 334 V342" fill="none" stroke-width="10" stroke-linecap="round"/>
      <path d="M1186 326 H1158 Q1150 326 1150 334 V342" fill="none" stroke="#c7d2dc" stroke-width="5" stroke-linecap="round"/>
      <!-- красный вентиль — горячая вода (с язычком пламени), синий — холодная (со снежинкой) -->
      <circle cx="1166" cy="314" r="8" fill="#ff6b5a" stroke-width="3"/>
      <path d="M1166 318 q-4 -4 0 -9 q4 5 0 9" fill="#ffd166" stroke="none"/>
      <circle cx="1198" cy="314" r="8" fill="#5aa9e6" stroke-width="3"/>
      <path d="M1198 309 v10 M1193 314 h10" stroke="#ffffff" stroke-width="2"/>
    </g>
    <g class="v-problem">
      <!-- капли горячей воды и пар над раковиной -->
      <ellipse cx="1150" cy="372" rx="14" ry="4" fill="#a6d8ff" stroke="#2b3a4a" stroke-width="2"/>
      <g fill="#5aa9e6" stroke="#2b3a4a" stroke-width="2">
        <path d="M1150 344 q-5 8 0 11 q5 -3 0 -11 Z"><animateTransform attributeName="transform" type="translate" values="0 0;0 22" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0" dur="1s" repeatCount="indefinite"/></path>
        <path d="M1150 344 q-5 8 0 11 q5 -3 0 -11 Z"><animateTransform attributeName="transform" type="translate" values="0 0;0 22" dur="1s" begin="0.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0" dur="1s" begin="0.5s" repeatCount="indefinite"/></path>
      </g>
      <circle cx="1150" cy="372" r="4" fill="none" stroke="#3b8fd9" stroke-width="2"><animate attributeName="r" values="3;14" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1s" repeatCount="indefinite"/></circle>
      <g fill="none" stroke="#9aa9b8" stroke-width="3" stroke-linecap="round">
        <g><path d="M1176 360 q-6 -8 0 -16 q6 -8 0 -16"/><animateTransform attributeName="transform" type="translate" values="0 0;4 -30" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0.9;0" dur="2.2s" repeatCount="indefinite"/></g>
        <g><path d="M1200 362 q-6 -8 0 -16 q6 -8 0 -16"/><animateTransform attributeName="transform" type="translate" values="0 0;4 -30" dur="2.2s" begin="1.1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0.9;0" dur="2.2s" begin="1.1s" repeatCount="indefinite"/></g>
      </g>
    </g>
    <g class="v-ok">
      <!-- кран исправен: сухо и блестит -->
      <path d="M1136 334 l3 -7 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 Z" fill="#fff6b0" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
    </g>
    <rect class="obj-hit" x="1125" y="288" width="112" height="172" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-hosp-med-fridge: холодильник для лекарств (всё в порядке) ===== -->
  <g id="obj-hosp-med-fridge" class="obj" data-state="ok">
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="1252" y="286" width="92" height="162" rx="8" fill="#f4f8fb"/>
      <rect x="1258" y="292" width="80" height="16" rx="4" fill="#3d4b5c" stroke-width="2"/>
      <rect x="1260" y="314" width="76" height="126" rx="4" fill="#d9f1ff"/>
      <path d="M1262 346 H1334 M1262 378 H1334 M1262 410 H1334" stroke-width="2"/>
      <g stroke-width="1.5">
        <rect x="1266" y="324" width="12" height="20" rx="2" fill="#ffffff"/><rect x="1282" y="328" width="12" height="16" rx="2" fill="#ffd166"/><rect x="1298" y="324" width="12" height="20" rx="2" fill="#ffffff"/><rect x="1314" y="330" width="14" height="14" rx="2" fill="#8ec5ff"/>
        <rect x="1266" y="358" width="24" height="18" rx="2" fill="#ffb3c1"/><rect x="1294" y="360" width="12" height="16" rx="2" fill="#a7e08f"/><rect x="1310" y="356" width="18" height="20" rx="2" fill="#ffffff"/>
        <rect x="1266" y="390" width="14" height="18" rx="2" fill="#ffffff"/><rect x="1284" y="394" width="22" height="14" rx="2" fill="#ffd166"/><rect x="1310" y="390" width="14" height="18" rx="2" fill="#8ec5ff"/>
        <rect x="1266" y="420" width="62" height="16" rx="2" fill="#e9eef3"/>
      </g>
      <rect x="1328" y="354" width="5" height="44" rx="2" fill="#9aa9b8" stroke-width="2"/>
      <path d="M1320 295 v10 M1315 300 h10 M1316 296 l8 8 M1324 296 l-8 8" stroke="#ffffff" stroke-width="1.5"/>
    </g>
    <!-- зелёный огонёк «работает» спокойно мерцает -->
    <circle cx="1268" cy="300" r="4" fill="#7ed957"><animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite"/></circle>
    <rect class="obj-hit" x="1245" y="278" width="106" height="182" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-hosp-med-waste: медицинские отходы в процедурной ===== -->
  <g id="obj-hosp-med-waste" class="obj" data-state="problem">
    <!-- всегда: обычное ведро с педалью, в нём бумага -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <path d="M1406 394 H1454 L1450 446 H1410 Z" fill="#9aa9b8"/>
      <path d="M1414 412 h32" stroke-width="2"/>
      <rect x="1404" y="444" width="16" height="4" rx="2" fill="#6b7b8c" stroke-width="2"/>
      <circle cx="1418" cy="392" r="7" fill="#ffffff" stroke-width="2"/>
    </g>
    <g class="v-problem">
      <!-- шприц и перчатка в общем ведре, крышка открыта, мигает знак «!» -->
      <path d="M1404 392 L1414 360 L1420 362 L1412 394 Z" fill="#b0bcc8" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
      <g transform="rotate(-35 1440 382)" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round">
        <rect x="1428" y="376" width="28" height="10" rx="2" fill="#ffffff"/>
        <rect x="1418" y="378" width="10" height="6" fill="#ff8c69"/>
        <path d="M1456 381 H1470" stroke-width="2"/>
      </g>
      <path d="M1432 396 q-2 -14 4 -16 q2 -8 6 -2 q4 -6 6 2 q6 2 2 16 Z" fill="#a6e3e9" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
      <g>
        <path d="M1376 380 L1392 352 L1408 380 Z" fill="#ffd166" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
        <path d="M1392 362 v8" stroke="#2b3a4a" stroke-width="3" stroke-linecap="round"/>
        <circle cx="1392" cy="375" r="2" fill="#2b3a4a"/>
        <animate attributeName="opacity" values="1;0.35;1" dur="1.2s" repeatCount="indefinite"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- отдельный жёлтый контейнер для медицинских отходов (значок шприца) -->
      <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <path d="M1362 404 L1366 392 H1396 L1400 404 Z" fill="#f2b705"/>
        <rect x="1362" y="404" width="38" height="44" rx="3" fill="#ffd23f"/>
        <g transform="rotate(-30 1381 426)" stroke-width="2">
          <rect x="1372" y="422" width="18" height="8" rx="2" fill="#ffffff"/>
          <rect x="1366" y="424" width="6" height="4" fill="#2b3a4a"/>
          <path d="M1390 426 H1398"/>
        </g>
      </g>
    </g>
    <rect class="obj-hit" x="1358" y="338" width="100" height="122" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-hosp-door: входная дверь в холле ===== -->
  <g id="obj-hosp-door" class="obj" data-state="problem">
    <!-- всегда: проём, коврик -->
    <rect x="166" y="546" width="110" height="176" fill="#ffffff" stroke="#2b3a4a" stroke-width="4" stroke-linejoin="round"/>
    <rect x="164" y="716" width="114" height="8" rx="3" fill="#7a8cff" stroke="#2b3a4a" stroke-width="2"/>
    <g class="v-problem">
      <!-- дверь открыта настежь и подпёрта клином: видна заснеженная улица -->
      <g clip-path="url(#hp-clip-door)">
        <rect x="174" y="554" width="94" height="164" fill="url(#hp-out)"/>
        <path d="M174 690 Q210 676 240 686 T268 682 V718 H174 Z" fill="#ffffff" stroke="#c9dceb" stroke-width="2"/>
        <path d="M206 620 L226 660 H186 Z M206 640 L230 686 H182 Z" fill="#4caf7d" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
        <g fill="#ffffff" stroke="#9cc3e0" stroke-width="1.5">
          <g><circle cx="188" cy="560" r="4"/><circle cx="238" cy="548" r="3.5"/><circle cx="258" cy="572" r="3"/><circle cx="214" cy="530" r="3.5"/>
            <animateTransform attributeName="transform" type="translate" values="0 0;8 150" dur="3.4s" repeatCount="indefinite"/></g>
        </g>
      </g>
      <path d="M272 550 L302 562 L302 728 L272 720 Z" fill="#8fc0ea" stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M280 566 L294 572 L294 712 L280 708 Z" fill="#d6efff" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
      <path d="M288 716 L308 728 H288 Z" fill="#ffb35c" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
      <!-- холод заходит, тепло уходит -->
      <g fill="none" stroke="#3b8fd9" stroke-width="4" stroke-linecap="round">
        <g><path d="M200 640 q10 -10 20 0 q10 10 20 0"/>
          <animateTransform attributeName="transform" type="translate" values="0 0;110 20" dur="2.6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;0" dur="2.6s" repeatCount="indefinite"/></g>
        <g><path d="M196 690 q10 -10 20 0 q10 10 20 0"/>
          <animateTransform attributeName="transform" type="translate" values="0 0;110 6" dur="2.6s" begin="1.3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;0" dur="2.6s" begin="1.3s" repeatCount="indefinite"/></g>
      </g>
      <g fill="none" stroke="#ff8c3a" stroke-width="4" stroke-linecap="round">
        <g><path d="M300 600 q-10 -10 -20 0 q-10 10 -20 0"/>
          <animateTransform attributeName="transform" type="translate" values="0 0;-90 -10" dur="2.6s" begin="0.6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;0" dur="2.6s" begin="0.6s" repeatCount="indefinite"/></g>
      </g>
    </g>
    <g class="v-ok">
      <!-- две стеклянные створки закрыты, сверху доводчик -->
      <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <rect x="174" y="554" width="46" height="164" fill="#8fc0ea"/>
        <rect x="222" y="554" width="46" height="164" fill="#8fc0ea"/>
        <rect x="181" y="564" width="32" height="120" rx="3" fill="#d6efff" stroke-width="2"/>
        <rect x="229" y="564" width="32" height="120" rx="3" fill="#d6efff" stroke-width="2"/>
        <rect x="212" y="620" width="5" height="26" rx="2" fill="#e9eef3" stroke-width="2"/>
        <rect x="225" y="620" width="5" height="26" rx="2" fill="#e9eef3" stroke-width="2"/>
        <rect x="236" y="532" width="34" height="10" rx="3" fill="#6b7b8c"/>
        <path d="M240 542 L254 556" stroke-width="4" stroke-linecap="round"/>
      </g>
    </g>
    <rect class="obj-hit" x="150" y="500" width="160" height="236" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-hosp-bins: урны в холле ===== -->
  <g id="obj-hosp-bins" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- одна переполненная урна: бумага, бутылка, банка — всё вместе -->
      <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <rect x="548" y="640" width="18" height="30" rx="4" transform="rotate(-20 557 655)" fill="#a6e3e9"/>
        <rect x="574" y="642" width="16" height="22" rx="3" fill="#c7d2dc"/>
        <path d="M534 656 q10 -18 24 -8 q10 -14 22 0 q14 -10 22 6 Z" fill="#ffffff"/>
        <path d="M596 652 l14 -12 l6 6 l-14 12 Z" fill="#7ad9b5"/>
        <path d="M528 656 H614 L606 718 H536 Z" fill="#8a99a8" stroke-width="4"/>
        <path d="M546 674 V706 M571 674 V706 M596 674 V706" stroke-width="2"/>
        <circle cx="530" cy="714" r="7" fill="#ffffff"/>
        <rect x="608" y="702" width="16" height="12" rx="3" fill="#c7d2dc" transform="rotate(20 616 708)"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- три урны для раздельного сбора: бумага (лист), пластик (бутылка), стекло (банка) -->
      <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <path d="M522 662 H554 L551 718 H525 Z" fill="#5aa9e6"/>
        <path d="M557 662 H589 L586 718 H560 Z" fill="#ffd166"/>
        <path d="M592 662 H624 L621 718 H595 Z" fill="#4caf7d"/>
        <rect x="519" y="654" width="38" height="10" rx="3" fill="#3b8fd9"/>
        <rect x="554" y="654" width="38" height="10" rx="3" fill="#f2b705"/>
        <rect x="589" y="654" width="38" height="10" rx="3" fill="#3fa070"/>
      </g>
      <g fill="#ffffff" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round">
        <rect x="530" y="676" width="16" height="22" rx="1"/>
        <path d="M570 674 h6 v4 l3 4 v18 h-12 v-18 l3 -4 Z"/>
        <path d="M601 680 h14 v-4 h-14 Z M600 680 h16 v18 q0 3 -3 3 h-10 q-3 0 -3 -3 Z"/>
      </g>
      <path d="M533 682 h10 M533 688 h10 M533 694 h6" stroke="#2b3a4a" stroke-width="1.5"/>
    </g>
    <rect class="obj-hit" x="512" y="600" width="116" height="136" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-hosp-lamps: освещение коридора ===== -->
  <g id="obj-hosp-lamps" class="obj" data-state="problem">
    <g class="v-problem">
      <!-- старые трубчатые лампы: тусклые, мигают, концы почернели -->
      <g fill="url(#hp-beam)">
        <path d="M796 512 H864 L884 600 H776 Z"><animate attributeName="opacity" values="1;0.15;1;1;0.1;1" dur="1.3s" repeatCount="indefinite"/></path>
        <path d="M906 512 H974 L994 600 H886 Z"/>
        <path d="M1016 512 H1084 L1100 600 H996 Z"><animate attributeName="opacity" values="1;1;0.1;1;0.3;1" dur="1.7s" repeatCount="indefinite"/></path>
      </g>
      <g fill="url(#hp-glow)" opacity="0.8"><ellipse cx="830" cy="510" rx="50" ry="22"/><ellipse cx="940" cy="510" rx="50" ry="22"/><ellipse cx="1050" cy="510" rx="50" ry="22"/>
        <animate attributeName="opacity" values="0.8;0.3;0.8;0.8;0.2;0.8" dur="1.3s" repeatCount="indefinite"/></g>
      <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <rect x="790" y="492" width="80" height="12" rx="3" fill="#e9eef3"/>
        <rect x="900" y="492" width="80" height="12" rx="3" fill="#e9eef3"/>
        <rect x="1010" y="492" width="80" height="12" rx="3" fill="#e9eef3"/>
        <g fill="#f6e7a6" stroke-width="2">
          <rect x="794" y="504" width="72" height="7" rx="3"/><rect x="904" y="504" width="72" height="7" rx="3"/><rect x="1014" y="504" width="72" height="7" rx="3"/>
        </g>
        <g fill="#5a4a32" stroke="none">
          <rect x="795" y="505" width="8" height="5"/><rect x="857" y="505" width="8" height="5"/><rect x="905" y="505" width="8" height="5"/><rect x="967" y="505" width="8" height="5"/><rect x="1015" y="505" width="8" height="5"/><rect x="1077" y="505" width="8" height="5"/>
        </g>
      </g>
      <!-- «жужжание» -->
      <path d="M872 526 l6 -6 l4 6 l6 -6 M1092 526 l6 -6 l4 6" fill="none" stroke="#ff8c3a" stroke-width="3" stroke-linecap="round"><animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite"/></path>
    </g>
    <g class="v-ok">
      <!-- тонкие светодиодные панели: ровный белый свет -->
      <g fill="url(#hp-led)" opacity="0.7">
        <path d="M796 502 H864 L884 600 H776 Z"/><path d="M906 502 H974 L994 600 H886 Z"/><path d="M1016 502 H1084 L1100 600 H996 Z"/>
      </g>
      <g fill="#ffffff" stroke="#2b3a4a" stroke-width="3">
        <rect x="790" y="492" width="80" height="9" rx="3"/><rect x="900" y="492" width="80" height="9" rx="3"/><rect x="1010" y="492" width="80" height="9" rx="3"/>
      </g>
      <path d="M800 497 h60 M910 497 h60 M1020 497 h60" stroke="#bfe7ff" stroke-width="2"/>
    </g>
    <rect class="obj-hit" x="778" y="490" width="324" height="110" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-hosp-laundry: стиральная машина в прачечной ===== -->
  <g id="obj-hosp-laundry" class="obj" data-state="problem">
    <!-- всегда: машина и корзина для белья -->
    <g stroke="#2b3a4a" stroke-linejoin="round">
      <rect x="1145" y="588" width="140" height="130" rx="10" fill="#f4f8fb" stroke-width="4"/>
      <rect x="1153" y="596" width="124" height="20" rx="4" fill="#dfe6ee" stroke-width="2"/>
      <circle cx="1258" cy="606" r="7" fill="#ffffff" stroke-width="2"/>
      <circle cx="1215" cy="670" r="40" fill="#c3cfdb" stroke-width="4"/>
      <circle cx="1215" cy="670" r="31" fill="#d9f1ff" stroke-width="3"/>
      <rect x="1152" y="716" width="16" height="6" fill="#6b7b8c" stroke-width="2"/><rect x="1262" y="716" width="16" height="6" fill="#6b7b8c" stroke-width="2"/>
      <path d="M1306 676 H1396 L1388 718 H1314 Z" fill="#e2c49a" stroke-width="3"/>
      <path d="M1318 690 H1386 M1320 704 H1384" stroke="#c9a676" stroke-width="3"/>
    </g>
    <g class="v-problem">
      <!-- в барабане одна вещь и вода, а рядом — полная корзина -->
      <path d="M1186 684 Q1200 676 1215 684 T1244 684 A31 31 0 0 1 1186 684 Z" fill="#7cc4ff" opacity="0.8"/>
      <g>
        <path d="M1204 650 q8 -6 16 0 l-2 12 q-6 4 -12 0 Z" fill="#ff8fa3" stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round"/>
        <animateTransform attributeName="transform" type="rotate" values="0 1215 670;360 1215 670" dur="2s" repeatCount="indefinite"/>
      </g>
      <g fill="#ffd166" stroke="#2b3a4a" stroke-width="2">
        <circle cx="1163" cy="606" r="4"><animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/></circle>
        <circle cx="1176" cy="606" r="4"><animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite"/></circle>
      </g>
      <g stroke="#2b3a4a" stroke-width="2.5" stroke-linejoin="round">
        <path d="M1310 678 q4 -26 26 -24 q10 -16 28 -6 q20 -4 26 16 q4 8 -2 14 Z" fill="#8ec5ff"/>
        <path d="M1322 660 q14 -8 26 2 l-6 14 h-18 Z" fill="#ffffff"/>
        <path d="M1352 652 q16 -6 26 6 l-4 16 h-18 Z" fill="#ffd9e0"/>
        <path d="M1338 640 q8 -10 20 -4 l-2 10 Z" fill="#a7e08f"/>
      </g>
    </g>
    <g class="v-ok">
      <!-- барабан загружен полностью, корзина пустая -->
      <g stroke="#2b3a4a" stroke-width="2" stroke-linejoin="round">
        <path d="M1188 664 q10 -16 26 -10 l-4 18 Z" fill="#ff8fa3"/>
        <path d="M1214 652 q18 -4 24 12 l-16 8 Z" fill="#ffffff"/>
        <path d="M1188 676 q14 -8 28 0 l-6 18 q-14 0 -22 -18 Z" fill="#a7e08f"/>
        <path d="M1216 676 q14 -6 28 0 q-4 16 -20 18 Z" fill="#8ec5ff"/>
        <path d="M1206 666 q8 -4 16 0 l-4 10 h-8 Z" fill="#ffd166"/>
      </g>
      <circle cx="1163" cy="606" r="4" fill="#7ed957" stroke="#2b3a4a" stroke-width="2"/>
    </g>
    <rect class="obj-hit" x="1130" y="560" width="276" height="176" rx="12" fill="transparent"/>
  </g>

  <!-- ===== obj-hosp-pipes: трубы горячей воды в подвале ===== -->
  <g id="obj-hosp-pipes" class="obj" data-state="problem">
    <!-- всегда: стояки вверх и опоры -->
    <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
      <rect x="182" y="760" width="14" height="40" fill="#b0bcc8"/>
      <rect x="214" y="760" width="14" height="80" fill="#b0bcc8"/>
      <rect x="322" y="806" width="10" height="56" fill="#8a99a8"/>
      <rect x="542" y="806" width="10" height="56" fill="#8a99a8"/>
      <rect x="762" y="806" width="10" height="56" fill="#8a99a8"/>
    </g>
    <g class="v-problem">
      <!-- голые трубы: тепло уходит в подвал волнами -->
      <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <rect x="176" y="792" width="728" height="16" rx="8" fill="#d98c5f"/>
        <rect x="208" y="832" width="696" height="16" rx="8" fill="#c99a78"/>
        <path d="M300 792 v16 M500 792 v16 M700 792 v16 M400 832 v16 M600 832 v16 M800 832 v16" stroke-width="2"/>
      </g>
      <g fill="none" stroke="#ff8c3a" stroke-width="4" stroke-linecap="round">
        <g><path d="M260 786 q-6 -8 0 -14 q6 -6 0 -12"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -20" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"/></g>
        <g><path d="M420 786 q-6 -8 0 -14 q6 -6 0 -12"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -20" dur="1.8s" begin="0.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="0.6s" repeatCount="indefinite"/></g>
        <g><path d="M600 786 q-6 -8 0 -14 q6 -6 0 -12"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -20" dur="1.8s" begin="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="1.2s" repeatCount="indefinite"/></g>
        <g><path d="M820 786 q-6 -8 0 -14 q6 -6 0 -12"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -20" dur="1.8s" begin="0.3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="0.3s" repeatCount="indefinite"/></g>
        <g><path d="M340 826 q-6 -6 0 -10 q6 -4 0 -8"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -10" dur="1.8s" begin="0.9s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="0.9s" repeatCount="indefinite"/></g>
        <g><path d="M700 826 q-6 -6 0 -10 q6 -4 0 -8"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -10" dur="1.8s" begin="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="1.5s" repeatCount="indefinite"/></g>
      </g>
    </g>
    <g class="v-ok">
      <!-- трубы в толстой теплоизоляции с хомутами -->
      <g stroke="#2b3a4a" stroke-width="3" stroke-linejoin="round">
        <rect x="174" y="786" width="732" height="28" rx="14" fill="#e9eef3"/>
        <rect x="206" y="826" width="700" height="28" rx="14" fill="#e9eef3"/>
      </g>
      <g fill="#9aa9b8" stroke="#2b3a4a" stroke-width="1.5">
        <rect x="270" y="786" width="7" height="28"/><rect x="420" y="786" width="7" height="28"/><rect x="570" y="786" width="7" height="28"/><rect x="720" y="786" width="7" height="28"/><rect x="860" y="786" width="7" height="28"/>
        <rect x="340" y="826" width="7" height="28"/><rect x="490" y="826" width="7" height="28"/><rect x="640" y="826" width="7" height="28"/><rect x="790" y="826" width="7" height="28"/>
      </g>
    </g>
    <rect class="obj-hit" x="150" y="764" width="752" height="112" rx="12" fill="transparent"/>
  </g>
</svg>`;
