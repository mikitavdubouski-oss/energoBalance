/*
  office.js — уровень «Офис»: опенспейс в обеденный перерыв, кухонный уголок и стеклянная переговорная.

  Описание уровня. Логика — общая (js/core/game.js).
  Проблемы — js/data/hotspots.js (EB.data.hotspots.office):
  компьютеры у пустых столов, свет в пустой переговорной, закрытые жалюзи при горящей лампе,
  кондиционер при открытом окне, батарея за шкафом и электрообогреватель, принтер с горой черновиков,
  бумага и батарейки в общем мусоре, чайник на одну чашку, капающий кран, удлинитель с зарядками.
  Сцена — js/scenes/office.scene.js (EB.scenes.office), одна зона.
  Время, число проблем и подсказок — в js/core/config.js (EB.config.levels.office).
  Тексты: level.office, level.office.desc, level.office.task — в texts.ru.js и texts.be.js.
*/

EB.levels.office = {
  id: 'office',
  factTopic: 'electricity',
  zones: [
    { id: 'main', scene: 'office' }
  ]
};
