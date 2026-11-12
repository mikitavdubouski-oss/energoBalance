/*
  voice.js — голос Советника.

  EB.voice.say('advisor.start.apartment', 'текст реплики');

  Порядок выбора:
  1. Если в config.js voiceFiles: true — пробуем файл assets/audio/voice/<id>.mp3
     (id — ключ реплики, см. docs/voice-lines.md). Если файла нет — переходим к п. 2.
     Реплики, которые ещё не записаны, перечислены в config.js → voiceNotRecorded: для них файл не запрашивается.
  2. Синтез речи браузера (speechSynthesis) с русским или белорусским голосом.
     Сначала ищем голос, установленный в системе (работает без интернета),
     потом — онлайн-голос браузера (например, «Google русский» в Chrome, нужен интернет).
  3. Если подходящего голоса нет — только текст в облачке (его показывает js/ui/advisor.js).

  ВАЖНО: голоса зависят от компьютера. В Windows русский голос ставится так:
  Параметры → Время и язык → Речь → Добавить голоса → Русский.
  Самый надёжный вариант для конкурса — записанные mp3 (п. 1): они звучат везде одинаково.

  EB.voice.status() — какой голос будет использован (для экрана настроек).
  Громкость — настройка «Голос» (0 — молчать).
*/

EB.voice = {
  _audio: null,
  _timer: null,

  supported: function () {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  },

  stop: function () {
    clearTimeout(EB.voice._timer);
    EB.voice._pending = null;
    if (EB.voice._audio) {
      EB.voice._audio.pause();
      EB.voice._audio = null;
    }
    if (EB.voice.supported()) window.speechSynthesis.cancel();
  },

  say: function (id, text) {
    var volume = EB.save.getSetting('voice');
    EB.voice.stop();
    if (volume <= 0) return;

    // Реплики из списка voiceNotRecorded (config.js) ещё не записаны — сразу синтез, без запроса файла
    var recorded = (EB.config.voiceNotRecorded || []).indexOf(id) < 0;
    if (EB.config.voiceFiles && recorded) {
      try {
        var lang = EB.i18n.getLang();
        var audio = new Audio('assets/audio/voice/' + (lang === 'ru' ? '' : lang + '/') + id + '.mp3');
        audio.volume = volume;
        audio.addEventListener('error', function () { EB.voice._speak(text, volume); });
        EB.voice._audio = audio;
        var p = audio.play();
        if (p && p.catch) p.catch(function () { EB.voice._speak(text, volume); });
        return;
      } catch (err) { /* переходим к синтезу */ }
    }
    EB.voice._speak(text, volume);
  },

  // Найти голос для текущего языка: сначала белорусский (для BE), потом русский;
  // среди подходящих — сначала установленный в системе (localService), потом онлайн.
  _pickVoice: function () {
    if (!EB.voice.supported()) return null;
    var voices = window.speechSynthesis.getVoices() || [];
    var want = EB.i18n.getLang() === 'be' ? ['be', 'ru'] : ['ru'];
    for (var i = 0; i < want.length; i++) {
      var matching = voices.filter(function (v) {
        return v.lang && v.lang.toLowerCase().replace('_', '-').indexOf(want[i]) === 0;
      });
      var local = matching.filter(function (v) { return v.localService; });
      if (local.length) return local[0];
      if (matching.length) return matching[0];
    }
    return null;
  },

  // Для настроек: 'files' | 'local' | 'online' | 'none' и имя голоса
  status: function () {
    if (EB.config.voiceFiles) return { kind: 'files', name: '' };
    var v = EB.voice._pickVoice();
    if (!v) return { kind: 'none', name: '' };
    return { kind: v.localService ? 'local' : 'online', name: v.name };
  },

  // Разбить текст на предложения: в Chrome длинная фраза онлайн-голосом обрывается через ~15 с
  _sentences: function (text) {
    return String(text).match(/[^.!?…]+[.!?…]*/g) || [text];
  },

  _speak: function (text, volume) {
    if (!EB.voice.supported()) return;
    var synth = window.speechSynthesis;
    // Список голосов в Chrome появляется не сразу — дождёмся его один раз
    if (!synth.getVoices().length) {
      EB.voice._pending = { text: text, volume: volume }; // скажем, когда голоса загрузятся
      return;
    }
    EB.voice._pending = null;
    var voice = EB.voice._pickVoice();
    if (!voice) return; // нет подходящего голоса — останется только текст

    // Ошибка Chrome: speak() сразу после cancel() иногда «теряется». Делаем короткую паузу.
    clearTimeout(EB.voice._timer);
    EB.voice._timer = setTimeout(function () {
      EB.voice._sentences(text).forEach(function (part) {
        part = part.trim();
        if (!part) return;
        try {
          var u = new SpeechSynthesisUtterance(part);
          u.voice = voice;
          u.lang = voice.lang;
          u.volume = volume;
          u.rate = EB.config.speechRate;
          u.onerror = function (e) {
            // 'interrupted' и 'canceled' — нормально (Советник заговорил снова)
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
              console.warn('Голос Советника: ошибка синтеза речи —', e.error, '(голос:', voice.name + ')');
            }
          };
          synth.speak(u);
        } catch (err) { /* только текст */ }
      });
    }, EB.config.speechDelayMs);
  }
};

// В некоторых браузерах список голосов загружается не сразу — «будим» его заранее
if (EB.voice.supported()) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', function () {
    var pending = EB.voice._pending;
    EB.voice._pending = null;
    if (pending) EB.voice._speak(pending.text, pending.volume);
    if (EB.events) EB.events.emit('voices:changed');
  });
}
