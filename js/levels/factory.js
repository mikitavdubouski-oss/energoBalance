/*
  factory.js — уровень «Завод»: производственный цех днём.

  Здесь только ОПИСАНИЕ уровня. Вся логика (выбор случайных проблем, клики, карточки,
  таймер, конец уровня) — общая, в js/core/game.js.
  - zones     — одна зона 'main' со сценой EB.scenes.factory (файл js/scenes/factory.scene.js);
  - factTopic — какие факты чаще показывать на экране загрузки уровня.
  Проблемы уровня — в js/data/hotspots.js (EB.data.hotspots.factory):
  утечка сжатого воздуха, компрессор в обед, пустой конвейер, грязные световые фонари,
  открытые ворота, тепло печи в трубу, голые горячие трубы, вода охлаждения в канализацию,
  металлолом и поддоны в общем мусоре, старый мотор вентилятора.
  Объекты «всё в порядке»: стенд «Техника безопасности» и огнетушитель.
  Время, число проблем и подсказок — в js/core/config.js (EB.config.levels.factory).
  Тексты: level.factory, level.factory.desc, level.factory.task — в texts.ru.js и texts.be.js.
*/

EB.levels.factory = {
  id: 'factory',
  factTopic: 'electricity',
  zones: [
    { id: 'main', scene: 'factory' }
  ]
};
