/*
  namespace.js — создаёт общее «пространство имён» игры: объект window.EB.

  Зачем: мы не используем ES-модули (они не работают при открытии через file://),
  поэтому все файлы складывают свои части в один общий объект EB.
  Например: EB.config, EB.state, EB.screens, EB.levels.apartment.

  Как менять: этот файл подключается ПЕРВЫМ. Новые разделы можно добавить
  в список ниже, чтобы другие файлы могли сразу в них писать.
*/

window.EB = window.EB || {};

// Разделы, в которые складывают данные и модули остальные файлы
EB.texts = EB.texts || {};       // тексты интерфейса по языкам: EB.texts.ru, EB.texts.be
EB.data = EB.data || {};         // факты, проблемы (hotspots) и прочие данные
EB.ui = EB.ui || {};             // меню, HUD, пауза, подсказки, модальные окна
EB.levels = EB.levels || {};     // уровни: apartment, school, city
EB.minigames = EB.minigames || {}; // мини-игры: thermostat, sorting, solar
