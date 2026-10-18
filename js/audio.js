/* Scoundrel – Chiptune-Sound per WebAudio (keine Audiodateien). */
const Sound = (() => {
  'use strict';
  let ctx = null, master = null, musicBus = null, noiseBuf = null;
  let sfxOn = true, musicOn = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
      musicBus = ctx.createGain();
      musicBus.gain.value = 0.5;
      musicBus.connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, { type = 'square', vol = 0.08, slide = 0, at = 0, bus = null } = {}) {
    const c = ensure(); if (!c) return;
    const t = c.currentTime + at;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus || master);
    o.start(t); o.stop(t + dur + 0.03);
  }

  function noise(dur, { vol = 0.12, at = 0, freq = 1200, type = 'lowpass', q = 0.8 } = {}) {
    const c = ensure(); if (!c) return;
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = c.currentTime + at;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = noiseBuf;
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + dur + 0.03);
  }

  const SFX = {
    click() { tone(880, 0.04, { vol: 0.04 }); },
    deal() { noise(0.05, { vol: 0.08, freq: 3500, type: 'highpass' }); tone(1320, 0.03, { vol: 0.02, at: 0.02 }); },
    equip() { tone(660, 0.06, { vol: 0.06 }); tone(990, 0.12, { vol: 0.06, at: 0.06 }); noise(0.04, { vol: 0.05, freq: 5000, type: 'highpass' }); },
    slash() { noise(0.12, { vol: 0.16, freq: 2200, type: 'bandpass', q: 1.5 }); tone(520, 0.12, { type: 'sawtooth', vol: 0.05, slide: 140 }); },
    block() { tone(1200, 0.05, { type: 'triangle', vol: 0.08 }); tone(1800, 0.09, { type: 'triangle', vol: 0.06, at: 0.05 }); },
    hit() { noise(0.22, { vol: 0.25, freq: 700 }); tone(200, 0.25, { vol: 0.09, slide: 50 }); },
    heal() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.1, { type: 'triangle', vol: 0.08, at: i * 0.07 })); },
    waste() { tone(330, 0.12, { type: 'triangle', vol: 0.07, slide: 160 }); tone(220, 0.18, { type: 'triangle', vol: 0.06, at: 0.1, slide: 110 }); },
    flee() { tone(700, 0.3, { vol: 0.05, slide: 120 }); noise(0.3, { vol: 0.06, freq: 900, type: 'bandpass' }); },
    deny() { tone(140, 0.08, { vol: 0.07 }); tone(120, 0.1, { vol: 0.07, at: 0.1 }); },
    death() { [392, 330, 262, 196, 131].forEach((f, i) => tone(f, 0.24, { vol: 0.08, at: i * 0.2 })); noise(0.6, { vol: 0.12, freq: 400, at: 0.1 }); },
    win() { [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, i === 6 ? 0.5 : 0.13, { vol: 0.07, at: i * 0.12 })); }
  };

  function play(name) {
    if (!sfxOn || !SFX[name]) return;
    try { SFX[name](); } catch (e) { /* Audio ist optional */ }
  }

  /* --- Hintergrundmusik: kleiner Sequenzer in a-Moll ----------------- */
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);
  const CHORDS = [
    { bass: 45, arp: [57, 60, 64, 69] },  // Am
    { bass: 41, arp: [53, 57, 60, 65] },  // F
    { bass: 43, arp: [55, 59, 62, 67] },  // G
    { bass: 40, arp: [52, 56, 59, 64] }   // E
  ];
  const ARP = [0, 1, 2, 3, 2, 1, 2, 1];
  const STEP = 60 / 92 / 2;             // Achtelnoten bei 92 BPM
  let step = 0, nextT = 0, timer = null;

  function schedule() {
    const c = ctx; if (!c) return;
    while (nextT < c.currentTime + 0.25) {
      const bar = Math.floor(step / 8) % 4, s = step % 8;
      const ch = CHORDS[bar];
      const at = nextT - c.currentTime;
      if (s % 4 === 0) tone(midi(ch.bass), STEP * 3.6, { type: 'triangle', vol: 0.12, at, bus: musicBus });
      if (s === 6) tone(midi(ch.bass + 7), STEP * 1.8, { type: 'triangle', vol: 0.08, at, bus: musicBus });
      const lead = ch.arp[ARP[s]] + (Math.floor(step / 32) % 2 ? 12 : 0);
      tone(midi(lead), STEP * 0.9, { type: 'square', vol: 0.022, at, bus: musicBus });
      step++; nextT += STEP;
    }
  }
  function startMusic() {
    const c = ensure(); if (!c || timer) return;
    step = 0; nextT = c.currentTime + 0.05;
    timer = setInterval(schedule, 60);
  }
  function stopMusic() { clearInterval(timer); timer = null; }

  return {
    play,
    init(prefs) { sfxOn = prefs.sfx !== false; musicOn = !!prefs.music; },
    unlock() { ensure(); if (musicOn) startMusic(); },
    get sfx() { return sfxOn; },
    get music() { return musicOn; },
    setSfx(v) { sfxOn = !!v; },
    setMusic(v) { musicOn = !!v; if (musicOn) startMusic(); else stopMusic(); }
  };
})();
