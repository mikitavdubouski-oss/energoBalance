/*
  apartment.js — уровень 1 «Квартира».

  Здесь только ОПИСАНИЕ уровня. Вся логика (выбор случайных проблем, клики, карточки,
  таймер, конец уровня) — общая, в js/core/game.js.
  - zones     — зоны уровня и их SVG-сцены (EB.scenes.*, файлы js/scenes/*.scene.js);
  - factTopic — какие факты чаще показывать на экране загрузки уровня.
  Проблемы уровня — в js/data/hotspots.js (EB.data.hotspots.apartment).
  Время, число проблем и подсказок — в js/core/config.js (EB.config.levels.apartment).
  Тексты: level.apartment, level.apartment.desc, level.apartment.task — в texts.ru.js.

  Мини-игра «Термостат» подключена к проблеме «radiator-hot» (батарея) — поле minigame в hotspots.js.
*/

EB.levels.apartment = {
  id: 'apartment',
  factTopic: 'electricity',
  zones: [
    { id: 'main', scene: 'apartment' }
  ]
};
