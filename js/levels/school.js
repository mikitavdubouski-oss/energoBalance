/*
  school.js — уровень 2 «Колледж»: три зоны (класс, коридор, столовая) с переключением вкладками.

  Внутреннее имя уровня осталось school (на него завязаны сохранения, тексты и файлы озвучки),
  на экране он называется «Колледж» (ключ level.school в texts.*.js).
  Описание уровня по образцу квартиры. Логика — общая (js/core/game.js).
  Сложность выше: проблем больше, а времени меньше (EB.config.levels.school),
  часть проблем «скрытая» — видна только при внимательном осмотре (projector, corridor-window, vending).
  Проблемы — js/data/hotspots.js (EB.data.hotspots.school), у каждой поле zone.
  Мини-игра «Сортировка» подключена к проблеме «waste-bins» в столовой.
  Названия зон — ключи zone.class, zone.corridor, zone.canteen в texts.ru.js.
*/

EB.levels.school = {
  id: 'school',
  factTopic: 'heat',
  zones: [
    { id: 'class', scene: 'schoolClass' },
    { id: 'corridor', scene: 'schoolCorridor' },
    { id: 'canteen', scene: 'schoolCanteen' }
  ]
};
