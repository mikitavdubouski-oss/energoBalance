/*
  audio.js — звуковые эффекты и фоновая музыка. Всё синтезируется кодом через Web Audio API,
  поэтому звуковые файлы не нужны.

  Как пользоваться:
    EB.audio.play('click');      // эффекты: click, switch, water, correct, error, coin, win, hint, pop
    EB.audio.startMusic();       // фоновая мелодия (зациклена)
    EB.audio.stopMusic();

  Ограничение браузеров: звук можно включить только после первого действия игрока
  (клик, касание, клавиша). Поэтому EB.audio.unlock() вызывается при первом действии —
  до этого play() просто молчит.

  Громкость берётся из настроек (EB.save): sfx — эффекты, music — музыка.

  Как заменить звук файлом: положи файл в assets/audio/ и пропиши путь в
  EB.config.audioFiles, например click: 'assets/audio/click.mp3'. Логику менять не нужно.
*/

EB.audio = {
  ctx: null,
  sfxGain: null,
  musicGain: null,
  _musicTimer: null,
  _musicStep: 0,
  _nextNoteTime: 0,
  _files: {},

  // Создать аудио-контекст после первого действия пользователя
  unlock: function () {
    if (EB.audio.ctx) {
      if (EB.audio.ctx.state === 'suspended') EB.audio.ctx.resume();
      return;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return; // очень старый браузер — играем без звука
    try {
      EB.audio.ctx = new AC();
      EB.audio.sfxGain = EB.audio.ctx.createGain();
      EB.audio.musicGain = EB.audio.ctx.createGain();
      EB.audio.sfxGain.connect(EB.audio.ctx.destination);
      EB.audio.musicGain.connect(EB.audio.ctx.destination);
      EB.audio.applyVolumes();
      EB.audio.startMusic();
    } catch (err) {
      EB.audio.ctx = null;
    }
  },

  applyVolumes: function () {
    if (!EB.audio.ctx) return;
    EB.audio.sfxGain.gain.value = EB.save.getSetting('sfx');
    // Музыка всегда тише эффектов, чтобы не мешать
    EB.audio.musicGain.gain.value = EB.save.getSetting('music') * 0.35;
    if (EB.audio._musicEl) EB.audio._musicEl.volume = EB.save.getSetting('music') * 0.5;
    Object.keys(EB.audio._files).forEach(function (name) {
      EB.audio._files[name].volume = EB.save.getSetting('sfx');
    });
  },

  // ---------- Эффекты ----------
  play: function (name) {
    // Сначала — файл, если он прописан в config.audioFiles
    var file = EB.config.audioFiles[name];
    if (file) {
      try {
        var a = EB.audio._files[name] || (EB.audio._files[name] = new Audio(file));
        a.volume = EB.save.getSetting('sfx');
        a.currentTime = 0;
        var p = a.play();
        if (p && p.catch) p.catch(function () {});
      } catch (err) { /* без звука */ }
      return;
    }
    if (!EB.audio.ctx || EB.save.getSetting('sfx') <= 0) return;
    var synth = EB.audio.sounds[name];
    if (synth) {
      try { synth(EB.audio.ctx.currentTime); } catch (err) { /* без звука */ }
    }
  },

  // Один «пик»: тон заданной частоты, формы волны и длительности
  tone: function (freq, start, duration, type, volume, slideTo) {
    var ctx = EB.audio.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume || 0.3, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(EB.audio.sfxGain);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  },

  // Короткий шум (для воды и щелчков)
  noise: function (start, duration, volume, filterFreq) {
    var ctx = EB.audio.ctx;
    var length = Math.floor(ctx.sampleRate * duration);
    var buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    var ch = buffer.getChannelData(0);
    for (var i = 0; i < length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / length);
    var src = ctx.createBufferSource();
    src.buffer = buffer;
    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq || 1500;
    var gain = ctx.createGain();
    gain.gain.value = volume || 0.3;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(EB.audio.sfxGain);
    src.start(start);
  },

  // Описание каждого эффекта: t — время начала
  sounds: {
    click: function (t) { EB.audio.tone(660, t, 0.06, 'triangle', 0.2); },
    pop: function (t) { EB.audio.tone(400, t, 0.12, 'sine', 0.25, 900); },
    'switch': function (t) {
      EB.audio.noise(t, 0.03, 0.4, 3000);
      EB.audio.tone(1200, t, 0.03, 'square', 0.08);
    },
    water: function (t) {
      for (var i = 0; i < 3; i++) EB.audio.tone(900 + i * 250, t + i * 0.09, 0.08, 'sine', 0.2, 1600 + i * 300);
    },
    correct: function (t) {
      EB.audio.tone(523, t, 0.12, 'triangle', 0.3);
      EB.audio.tone(784, t + 0.1, 0.2, 'triangle', 0.3);
    },
    error: function (t) {
      EB.audio.tone(330, t, 0.15, 'sawtooth', 0.12);
      EB.audio.tone(247, t + 0.13, 0.25, 'sawtooth', 0.12);
    },
    coin: function (t) {
      EB.audio.tone(988, t, 0.08, 'square', 0.12);
      EB.audio.tone(1319, t + 0.07, 0.25, 'square', 0.12);
    },
    hint: function (t) {
      EB.audio.tone(880, t, 0.15, 'sine', 0.2);
      EB.audio.tone(1175, t + 0.12, 0.2, 'sine', 0.2);
    },
    win: function (t) {
      [523, 659, 784, 1047].forEach(function (f, i) { EB.audio.tone(f, t + i * 0.12, 0.3, 'triangle', 0.3); });
    }
  },

  // ---------- Фоновая музыка ----------
  // Простая позитивная мелодия на пентатонике (без «фальшивых» нот) + бас.
  // Ноты — номера ступеней гаммы, -1 — пауза.
  MELODY: [0, 2, 4, 2, 5, 4, 2, -1, 0, 2, 4, 5, 7, 5, 4, -1, 4, 5, 7, 5, 4, 2, 0, -1, 2, 4, 2, 0, 1, 2, 0, -1],
  BASS:   [0, 0, 3, 3, 4, 4, 0, 0],
  SCALE:  [0, 2, 4, 7, 9, 12, 14, 16], // мажорная пентатоника в полутонах

  _freq: function (step, base) {
    return base * Math.pow(2, EB.audio.SCALE[step] / 12);
  },

  startMusic: function () {
    // Если указан файл музыки — играем его по кругу вместо синтезированной мелодии
    if (EB.config.musicFile) {
      if (!EB.audio._musicEl) {
        EB.audio._musicEl = new Audio(EB.config.musicFile);
        EB.audio._musicEl.loop = true;
      }
      EB.audio._musicEl.volume = EB.save.getSetting('music') * 0.5;
      var p = EB.audio._musicEl.play();
      if (p && p.catch) p.catch(function () {});
      return;
    }
    if (!EB.audio.ctx || EB.audio._musicTimer) return;
    EB.audio._musicStep = 0;
    EB.audio._nextNoteTime = EB.audio.ctx.currentTime + 0.1;
    // Планировщик: каждые 100 мс заранее ставим ноты на ближайшие 0.3 с
    EB.audio._musicTimer = setInterval(EB.audio._scheduleMusic, 100);
  },

  stopMusic: function () {
    if (EB.audio._musicEl) EB.audio._musicEl.pause();
    clearInterval(EB.audio._musicTimer);
    EB.audio._musicTimer = null;
  },

  _scheduleMusic: function () {
    var ctx = EB.audio.ctx;
    if (!ctx || EB.save.getSetting('music') <= 0) {
      if (ctx) EB.audio._nextNoteTime = ctx.currentTime + 0.1;
      return;
    }
    var beat = 60 / EB.config.musicTempo / 2; // восьмые ноты
    while (EB.audio._nextNoteTime < ctx.currentTime + 0.3) {
      var i = EB.audio._musicStep;
      var t = EB.audio._nextNoteTime;
      var note = EB.audio.MELODY[i % EB.audio.MELODY.length];
      if (note >= 0) EB.audio._musicNote(EB.audio._freq(note, 392), t, beat * 0.9, 'triangle', 0.18);
      if (i % 4 === 0) {
        var bass = EB.audio.BASS[(i / 4) % EB.audio.BASS.length];
        EB.audio._musicNote(EB.audio._freq(bass, 98), t, beat * 3.5, 'sine', 0.25);
      }
      EB.audio._musicStep++;
      EB.audio._nextNoteTime += beat;
    }
  },

  _musicNote: function (freq, start, duration, type, volume) {
    var ctx = EB.audio.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(EB.audio.musicGain);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }
};

// Первое действие игрока «разблокирует» звук
['pointerdown', 'keydown'].forEach(function (type) {
  window.addEventListener(type, function () { EB.audio.unlock(); }, { capture: true });
});

// Музыка затихает, когда вкладка скрыта
document.addEventListener('visibilitychange', function () {
  if (EB.audio._musicEl) {
    if (document.hidden) EB.audio._musicEl.pause(); else EB.audio.startMusic();
  }
  if (!EB.audio.ctx) return;
  if (document.hidden) EB.audio.ctx.suspend(); else EB.audio.ctx.resume();
});

EB.events.on('settings:changed', function () { EB.audio.applyVolumes(); });
