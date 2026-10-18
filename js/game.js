/* Scoundrel – Spiellogik, Darstellung und Animationen.
   Regeln nach „Scoundrel“ v1.0 von Zach Gage & Kurt Bieg (2011). */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const MAX_HP = 20;
  const { CW, CH } = PX;
  const motionOK = !matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Speicher (nur Komfort, darf fehlen) ---------------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('scoundrel.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('scoundrel.' + k, JSON.stringify(v)); } catch (e) { /* ignorieren */ } },
    del(k) { try { localStorage.removeItem('scoundrel.' + k); } catch (e) { /* ignorieren */ } }
  };

  /* ---------------- Karten (Regelkern in js/rules.js) ---------------- */
  const { mk } = Rules;
  const todayKey = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
  const randomSeed = () => 100000 + Math.floor(Math.random() * 899999);

  /* ---------------- Zustand ---------------- */
  let S = null;          // aktueller Lauf (reines JSON, speicherbar)
  let busy = false;      // während Animationen keine Eingaben
  let choiceSlot = -1;

  function newRun(mode, seed) {
    const day = todayKey();
    if (mode === 'daily') seed = day * 7 + 13;
    S = {
      mode, seed, day,
      dungeon: mode === 'easy' ? Rules.easyDeal(seed) : Rules.deal(seed),
      room: [null, null, null, null],
      discard: 0,
      hp: MAX_HP, weapon: null, slain: [],
      potionUsed: false, played: 0, avoidedLast: false,
      roomNo: 0, last: null, over: false, won: false, score: 0,
      log: [],
      stats: { slainW: 0, slainF: 0, dmg: 0, healed: 0, wasted: 0, fled: 0, start: Date.now(), end: 0 }
    };
  }

  const roomCards = () => S.room.filter(Boolean);
  const lastSlain = () => S.slain[S.slain.length - 1];
  const weaponUsable = m => !!S.weapon && (!S.slain.length || m.rank <= lastSlain().rank);
  const weaponDamage = m => Math.max(0, m.rank - S.weapon.rank);
  const canFlee = () => !S.over && S.played === 0 && !S.avoidedLast && roomCards().length === 4 && S.dungeon.length > 0;
  const name = c => PX.info(c).name;
  const t = I18N.t;
  const modeText = () => S.mode === 'daily' ? t('mode.daily', { day: S.day })
    : t(S.mode === 'easy' ? 'mode.easy' : 'mode.free', { seed: S.seed });

  /* ---------------- Sprache: gespeicherte Wahl, sonst Browsersprache ---------------- */
  I18N.set(store.get('lang', null) || I18N.detect());
  PX.setLang(I18N.lang);
  I18N.apply();

  /* ---------------- DOM ---------------- */
  const el = {
    table: $('#table'), room: $('#room'), log: $('#log'),
    deckImg: $('#deck-img'), discardImg: $('#discard-img'),
    pileDungeon: $('#pile-dungeon'), pileDiscard: $('#pile-discard'),
    dungeonCount: $('#dungeon-count'), discardCount: $('#discard-count'),
    roomNo: $('#room-no'), pips: $$('#pips i'), potionFlag: $('#potion-flag'),
    hp: $('#hp'), hpVal: $('#hp-val'), hpBar: $('#hp-bar'), hpHeart: $('#hp-heart'),
    wStack: $('#weapon-stack'), wName: $('#weapon-name'), wLimit: $('#weapon-limit'),
    flee: $('#btn-flee'), fleeHint: $('#flee-hint'),
    choice: $('#choice'), chTitle: $('#choice-title'), chWeapon: $('#ch-weapon'), chFist: $('#ch-fist'), chNote: $('#choice-note'),
    flash: $('#flash')
  };

  const ico = (n, cls = 'ico') => `<img class="${cls}" src="${PX.icon(n)}" alt="">`;

  // Raum-Slots einmalig anlegen
  const slots = [0, 1, 2, 3].map(i => {
    const wrap = document.createElement('div');
    wrap.className = 'slot';
    wrap.innerHTML = `
      <button class="card" type="button"><img alt=""><span class="key" aria-hidden="true">${i + 1}</span></button>
      <div class="slot-label"><span class="slot-name"></span><span class="slot-fx"></span></div>`;
    el.room.appendChild(wrap);
    const btn = $('.card', wrap);
    btn.addEventListener('click', () => onCard(i));
    return { wrap, btn, img: $('img', btn), name: $('.slot-name', wrap), fx: $('.slot-fx', wrap) };
  });

  for (let i = 0; i < MAX_HP; i++) el.hpBar.appendChild(document.createElement('i'));
  function fillImages() {
    $$('img[data-icon]').forEach(img => {
      const [w, h] = PX.iconSize(img.dataset.icon);
      img.src = PX.icon(img.dataset.icon);
      img.width = w * 2; img.height = h * 2;
    });
    $$('img[data-card]').forEach(img => {
      const s = img.dataset.card[0], r = +img.dataset.card.slice(1);
      img.src = PX.card(mk(s, r));
    });
  }
  fillImages();

  /* ---------------- Skalierung auf ganzzahliges Pixelraster ---------------- */
  function fit() {
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const avail = vw - 32;
    const wideW = 64 + 154 + 64 + 16;           // Spalten + Abstände in Spielpixeln
    const sWide = Math.floor(Math.min(avail / wideW, (vh - 250) / (CH * 2 + 14)));
    const sNarrow = Math.floor(Math.min(avail / (4 * CW + 3 * 2), (vh - 330) / (CH * 2 + 24)));
    const narrow = sNarrow > sWide || avail < 560;
    const s = Math.max(2, Math.min(6, narrow ? sNarrow : sWide));
    const root = document.documentElement.style;
    root.setProperty('--s', s);
    root.setProperty('--ps', narrow ? Math.max(1, Math.floor(s / 2)) : s);
    document.body.classList.toggle('narrow', narrow);
    if (S) renderWeapon();
  }

  /* ---------------- Darstellung ---------------- */
  function render(pending = new Set()) {
    renderRoom(pending);
    renderPiles();
    renderStatus();
    renderHP();
    renderWeapon();
    renderLog();
  }

  function effectHTML(c) {
    if (c.type === 'weapon') {
      return `<span class="fx fx-w">${ico('sword')} ${t('fx.equip', { n: c.rank })}</span>`;
    }
    if (c.type === 'potion') {
      if (S.potionUsed) return `<span class="fx fx-bad">${t('fx.wasted')}</span>`;
      const gain = Math.min(MAX_HP, S.hp + c.rank) - S.hp;
      return `<span class="fx fx-heal">${t('fx.heal', { n: gain })}</span>`;
    }
    const fist = c.rank, lethalF = fist >= S.hp;
    const fistHTML = `<span class="fx ${lethalF ? 'fx-lethal' : 'fx-dmg'}">${ico('fist')}-${fist}</span>`;
    if (weaponUsable(c)) {
      const w = weaponDamage(c), lethalW = w >= S.hp && w > 0;
      return `<span class="fx ${lethalW ? 'fx-lethal' : 'fx-w'}">${ico('sword')}${w ? '-' + w : '0'}</span> ${fistHTML}`;
    }
    return fistHTML;
  }

  function ariaFor(c, i) {
    const inf = PX.info(c);
    let what;
    if (c.type === 'weapon') what = t('aria.weapon', { n: c.rank });
    else if (c.type === 'potion') what = S.potionUsed ? t('aria.potionWasted', { n: c.rank }) : t('aria.potion', { n: Math.min(MAX_HP, S.hp + c.rank) - S.hp });
    else what = weaponUsable(c) ? t('aria.monsterBoth', { n: c.rank, w: weaponDamage(c) }) : t('aria.monster', { n: c.rank });
    return t('aria.card', { i: i + 1, name: inf.name, suit: inf.suit, rank: inf.rank, what });
  }

  function renderRoom(pending) {
    S.room.forEach((c, i) => {
      const sl = slots[i];
      sl.wrap.classList.toggle('pending', pending.has(i));
      if (!c) {
        sl.wrap.classList.add('empty');
        sl.img.src = PX.slot();
        sl.name.textContent = '';
        sl.fx.innerHTML = '';
        sl.btn.setAttribute('aria-label', t('aria.empty', { i: i + 1 }));
        sl.btn.disabled = true;
        return;
      }
      sl.wrap.classList.remove('empty');
      sl.btn.disabled = S.over;
      sl.img.src = PX.card(c);
      sl.name.textContent = name(c);
      sl.fx.innerHTML = effectHTML(c);
      sl.btn.setAttribute('aria-label', ariaFor(c, i));
    });
  }

  function renderPiles() {
    const n = S.dungeon.length;
    el.dungeonCount.textContent = n;
    el.discardCount.textContent = S.discard;
    el.deckImg.src = n ? PX.back() : PX.slot();
    el.discardImg.src = S.discard ? PX.back() : PX.slot();
    el.pileDungeon.dataset.layers = Math.min(3, Math.ceil(n / 12));
    el.pileDiscard.dataset.layers = Math.min(3, Math.ceil(S.discard / 12));
  }

  function renderStatus() {
    el.roomNo.textContent = t('room', { n: S.roomNo });
    el.pips.forEach((p, i) => p.classList.toggle('on', i < S.played));
    el.potionFlag.textContent = t(S.potionUsed ? 'potion.used' : 'potion.ready');
    el.potionFlag.classList.toggle('used', S.potionUsed);
    const ok = canFlee() && !busy;
    el.flee.disabled = !ok;
    let hint;
    if (S.over) hint = '';
    else if (S.avoidedLast && S.played === 0) hint = t('hint.fled');
    else if (S.played > 0) hint = t('hint.entered');
    else if (!S.dungeon.length) hint = t('hint.empty');
    else hint = t('hint.flee');
    el.fleeHint.textContent = hint;
  }

  let shownHP = MAX_HP;
  function renderHP() {
    const hp = Math.max(0, S.hp);
    el.hpVal.textContent = hp;
    el.hpHeart.src = PX.icon(hp > 0 ? 'heart' : 'heartEmpty');
    el.hpBar.setAttribute('aria-valuenow', hp);
    [...el.hpBar.children].forEach((seg, i) => {
      const on = i < hp;
      const lost = !on && i < shownHP;
      const gained = on && i >= shownHP;
      seg.className = on ? 'on' : '';
      if (lost && motionOK) { seg.classList.add('lost'); }
      if (gained && motionOK) { seg.classList.add('gain'); }
    });
    el.hp.classList.toggle('low', hp > 0 && hp <= 5);
    shownHP = hp;
  }

  function stackOffset(n) {
    const s = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--s'), 10) || 4;
    const widthGp = el.wStack.clientWidth / s;
    if (!n) return 12;
    return Math.max(3, Math.min(12, Math.floor((widthGp - CW) / n)));
  }

  function renderWeapon(extra = 0) {
    el.wStack.innerHTML = '';
    const w = S.weapon;
    if (!w) {
      const ph = document.createElement('img');
      ph.className = 'wcard placeholder'; ph.src = PX.slot(); ph.alt = '';
      el.wStack.appendChild(ph);
      el.wName.textContent = t('w.none');
      el.wLimit.textContent = t('w.noneHint');
      return;
    }
    const off = stackOffset(S.slain.length + extra);
    const img = document.createElement('img');
    img.className = 'wcard'; img.src = PX.card(w); img.alt = t('w.alt', { name: name(w), n: w.rank });
    el.wStack.appendChild(img);
    S.slain.forEach((m, i) => {
      const s = document.createElement('img');
      s.className = 'wcard slain'; s.src = PX.card(m); s.alt = `${name(m)} ${m.rank}`;
      s.style.left = `calc(var(--p) * ${off * (i + 1)})`;
      el.wStack.appendChild(s);
    });
    el.wName.textContent = t('w.name', { name: name(w), n: w.rank });
    el.wLimit.textContent = S.slain.length ? t('w.limit', { n: lastSlain().rank }) : t('w.fresh');
  }

  // Verlaufseinträge werden als [Schlüssel, Parameter] gespeichert, damit ein
  // Sprachwechsel auch ältere Zeilen übersetzt. Karten werden erst beim Anzeigen benannt.
  function logText(entry) {
    if (typeof entry === 'string') return entry;
    const [key, p] = entry;
    const q = {};
    Object.entries(p || {}).forEach(([k, v]) => { q[k] = v && typeof v === 'object' && v.suit ? name(v) : v; });
    return t(key, q);
  }

  function renderLog() {
    el.log.innerHTML = S.log.slice(0, 3).map((e, i) => `<p class="${i ? '' : 'new'}">${logText(e)}</p>`).join('');
  }

  function log(key, p) { S.log.unshift([key, p || {}]); S.log.length = Math.min(S.log.length, 12); }

  /* ---------------- Effekte ---------------- */
  const wait = ms => new Promise(r => setTimeout(r, motionOK ? ms : 0));
  const rect = e => e.getBoundingClientRect();

  function fly(from, to, src, { dur = 300, scale = 1, fade = false } = {}) {
    if (!motionOK) return Promise.resolve();
    return new Promise(res => {
      const f = new Image();
      f.src = src; f.alt = ''; f.className = 'flyer';
      f.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px`;
      document.body.appendChild(f);
      const sx = to.width / from.width * scale, sy = to.height / from.height * scale;
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);
      const a = f.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})`, opacity: fade ? 0 : 1 }
      ], { duration: dur, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
      let over = false;
      const done = () => { if (over) return; over = true; f.remove(); res(); };
      a.onfinish = done; a.oncancel = done;
      setTimeout(done, dur + 250);   // falls Animationen im Hintergrund pausieren
    });
  }

  function floatText(r, txt, cls) {
    const d = document.createElement('div');
    d.className = 'floater ' + cls;
    d.textContent = txt;
    d.style.left = (r.left + r.width / 2) + 'px';
    d.style.top = (r.top + r.height * 0.35) + 'px';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1100);
  }

  function burst(r, colors, n = 12) {
    if (!motionOK) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < n; i++) {
      const b = document.createElement('i');
      b.className = 'spark';
      const ang = Math.PI * 2 * i / n + Math.random() * 0.5;
      const dist = 30 + Math.random() * 50;
      b.style.left = cx + 'px'; b.style.top = cy + 'px';
      b.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      b.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      b.style.background = colors[i % colors.length];
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 700);
    }
  }

  function shake(strength = 1) {
    if (!motionOK) return;
    const p = 4 * strength;
    el.table.animate([
      { transform: 'translate(0,0)' }, { transform: `translate(${-p}px,${p / 2}px)` },
      { transform: `translate(${p}px,${-p / 2}px)` }, { transform: `translate(${-p / 2}px,${-p / 2}px)` },
      { transform: 'translate(0,0)' }
    ], { duration: 260, easing: 'steps(5)' });
  }

  function flash(kind) {
    el.flash.className = 'flash ' + kind;
    if (!motionOK) return;
    el.flash.animate([{ opacity: kind === 'heal' ? 0.28 : 0.42 }, { opacity: 0 }], { duration: 320, easing: 'steps(6)' });
  }

  function bump(node) {
    if (!motionOK) return;
    node.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 240, easing: 'steps(4)' });
  }

  /* ---------------- Spielablauf ---------------- */
  async function startRoom() {
    S.played = 0;
    S.potionUsed = false;
    S.roomNo++;
    const dealt = [];
    for (let i = 0; i < 4; i++) {
      if (!S.room[i] && S.dungeon.length) { S.room[i] = S.dungeon.shift(); dealt.push(i); }
    }
    const pending = new Set(dealt);
    render(pending);
    const from = rect(el.deckImg);
    await Promise.all(dealt.map((i, k) => wait(k * 90).then(async () => {
      Sound.play('deal');
      await fly(from, rect(slots[i].btn), PX.back(), { dur: 260 });
      slots[i].wrap.classList.remove('pending');
      if (motionOK) slots[i].btn.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 140, easing: 'steps(3)' });
    })));
  }

  async function choose(i, how) {
    const c = S.room[i];
    if (!c || busy || S.over) return;
    busy = true;
    closeChoice();
    const from = rect(slots[i].btn);
    S.room[i] = null;
    renderRoom(new Set());
    renderStatus();

    if (c.type === 'weapon') await equip(c, from);
    else if (c.type === 'potion') await drink(c, from);
    else await fight(c, how === 'weapon' && weaponUsable(c), from);

    S.last = c;
    S.played++;
    if (S.hp <= 0) { busy = false; return finish(false); }

    if (S.played >= 3 || !roomCards().length) {
      S.avoidedLast = false;
      if (!S.dungeon.length && !roomCards().length) { busy = false; return finish(true); }
      render();
      await wait(220);
      await startRoom();
    }
    busy = false;
    render();
    save();
  }

  async function equip(c, from) {
    const target = rect(el.wStack);
    const wBox = { left: target.left, top: target.top, width: CW * pxSize(), height: CH * pxSize() };
    const jobs = [];
    if (S.weapon) {
      const old = [S.weapon, ...S.slain];
      const dBox = rect(el.discardImg);
      $$('img', el.wStack).forEach((img, k) => jobs.push(wait(k * 40).then(() => fly(rect(img), dBox, img.src, { dur: 280 }))));
      S.discard += old.length;
      S.weapon = null; S.slain = [];
      renderWeapon();
    }
    jobs.push(fly(from, wBox, PX.card(c), { dur: 320 }));
    await Promise.all(jobs);
    S.weapon = c;
    renderWeapon(); renderPiles();
    Sound.play('equip');
    burst(wBox, ['#eef4fa', '#f2c03a', '#8fb4d8'], 10);
    log('log.equip', { w: c, n: c.rank });
  }

  async function drink(c, from) {
    const hb = rect(el.hpHeart);
    await fly(from, hb, PX.card(c), { dur: 300, scale: 0.6, fade: true });
    S.discard++;
    if (S.potionUsed) {
      S.stats.wasted++;
      Sound.play('waste');
      floatText(hb, t('f.wasted'), 'f-muted');
      log('log.wasted', { c });
    } else {
      const gain = Math.min(MAX_HP, S.hp + c.rank) - S.hp;
      S.hp += gain;
      S.potionUsed = true;
      S.stats.healed += gain;
      Sound.play('heal');
      flash('heal');
      floatText(hb, `+${gain}`, 'f-heal');
      burst(hb, ['#62d68c', '#d8ffd0', '#ffffff'], 12);
      bump(el.hpHeart);
      log(gain ? 'log.heal' : 'log.healFull', { c, n: gain });
    }
    renderHP(); renderPiles(); renderStatus();
  }

  async function fight(m, withWeapon, from) {
    if (withWeapon) {
      const dmg = weaponDamage(m);
      const s = pxSize();
      const base = rect(el.wStack);
      const off = stackOffset(S.slain.length + 1);
      const to = { left: base.left + off * (S.slain.length + 1) * s, top: base.top, width: CW * s, height: CH * s };
      await fly(from, to, PX.card(m), { dur: 300 });
      S.slain.push(m);
      S.hp -= dmg;
      S.stats.dmg += dmg;
      S.stats.slainW++;
      renderWeapon();
      Sound.play(dmg ? 'slash' : 'block');
      burst(to, ['#ffffff', '#b4c2d0', '#e0394e'], 10);
      if (dmg) { hurt(dmg); log('log.slay', { m, w: S.weapon, n: dmg }); }
      else { floatText(to, t('f.parry'), 'f-steel'); log('log.slayClean', { m, w: S.weapon }); }
    } else {
      const dmg = m.rank;
      const hb = rect(el.hpHeart);
      await fly(from, hb, PX.card(m), { dur: 260, scale: 0.7 });
      fly(hb, rect(el.discardImg), PX.card(m), { dur: 240, scale: 0.5, fade: true });
      S.discard++;
      S.hp -= dmg;
      S.stats.dmg += dmg;
      S.stats.slainF++;
      Sound.play('hit');
      hurt(dmg);
      log('log.fist', { m, n: dmg });
    }
    renderHP(); renderPiles(); renderStatus();
  }

  function hurt(dmg) {
    const hb = rect(el.hpHeart);
    floatText(hb, `-${dmg}`, 'f-dmg');
    flash('dmg');
    shake(dmg >= 8 ? 2 : 1);
    burst(hb, ['#e0394e', '#8e1c2a', '#ffb0b8'], 8);
  }

  async function flee() {
    if (busy || !S || !canFlee()) { if (S && !S.over && !busy) Sound.play('deny'); return; }
    busy = true;
    closeChoice();
    Sound.play('flee');
    const deck = rect(el.pileDungeon);
    const cards = S.room.slice();
    await Promise.all(cards.map((c, i) => wait(i * 50).then(() => fly(rect(slots[i].btn), deck, PX.card(c), { dur: 260, scale: 0.9 }))));
    S.room = [null, null, null, null];
    S.dungeon.push(...cards);
    S.avoidedLast = true;
    S.stats.fled++;
    log('log.flee');
    await startRoom();
    busy = false;
    render();
    save();
  }

  function finish(won) {
    S.over = true;
    S.won = won;
    S.stats.end = Date.now();
    if (won) {
      S.score = S.hp;
      S.calc = { hp: S.hp, bonus: 0 };
      if (S.hp === MAX_HP && S.last && S.last.type === 'potion') {
        S.score += S.last.rank;
        S.calc.bonus = S.last.rank;
      }
      log('log.win');
    } else {
      S.hp = 0;
      const rest = [...S.dungeon, ...roomCards()].filter(c => c.type === 'monster');
      const sum = rest.reduce((a, c) => a + c.rank, 0);
      S.score = -sum;
      S.calc = { count: rest.length, sum };
      log('log.death');
    }

    // Rekorde
    const rec = store.get('records', { best: null, runs: 0, wins: 0, daily: {} });
    rec.runs++;
    if (won) rec.wins++;
    let isBest = false;
    if (S.mode === 'daily') {
      const k = String(S.day);
      if (rec.daily[k] == null || S.score > rec.daily[k]) { rec.daily[k] = S.score; isBest = true; }
    }
    // Der einfache Dungeon führt eine eigene Bestenliste, damit er den normalen Bestwert nicht verfälscht.
    const bestKey = S.mode === 'easy' ? 'bestEasy' : 'best';
    if (rec[bestKey] == null || S.score > rec[bestKey]) { rec[bestKey] = S.score; isBest = true; }
    store.set('records', rec);
    store.del('run');
    S.isBest = isBest;

    render();
    Sound.play(won ? 'win' : 'death');
    if (!won) { flash('dmg'); shake(2); }
    setTimeout(showEnd, won ? 700 : 1000);
  }

  function save() { if (S && !S.over) store.set('run', S); }
  const pxSize = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--s'), 10) || 4;

  /* ---------------- Eingaben ---------------- */
  function onCard(i) {
    if (busy || !S || S.over) return;
    const c = S.room[i];
    if (!c) return;
    Sound.play('click');
    if (c.type === 'monster' && (weaponUsable(c) || c.rank >= S.hp)) return openChoice(i);
    choose(i, 'fist');
  }

  function openChoice(i) {
    const c = S.room[i];
    choiceSlot = i;
    const usable = weaponUsable(c);
    const lethalTag = ` · ${t('ch.lethal')}`;
    el.chTitle.textContent = `${name(c)} · ${c.rank}`;
    if (usable) {
      const w = weaponDamage(c);
      el.chWeapon.hidden = false;
      el.chWeapon.innerHTML = `${ico('sword')}<span>${t('ch.weapon')} <small>[W]</small><b>${w ? t('ch.dmg', { n: w }) : t('ch.noDmg')}${w >= S.hp && w ? lethalTag : ''}</b></span>`;
      el.chNote.textContent = !S.slain.length || c.rank < lastSlain().rank
        ? t('ch.noteLimit', { n: c.rank })
        : t('ch.noteKeep', { n: c.rank });
    } else {
      el.chWeapon.hidden = true;
      el.chNote.textContent = S.weapon ? t('ch.noteBlocked', { n: lastSlain().rank }) : t('ch.noWeapon');
    }
    const lethal = c.rank >= S.hp;
    el.chFist.innerHTML = `${ico('fist')}<span>${t('ch.fist')} <small>[F]</small><b>${t('ch.dmg', { n: c.rank })}${lethal ? lethalTag : ''}</b></span>`;
    el.chFist.classList.toggle('lethal', lethal);
    el.choice.hidden = false;

    // über der Karte platzieren, im Fenster halten
    const r = rect(slots[i].btn);
    const cw = el.choice.offsetWidth, chh = el.choice.offsetHeight;
    let left = r.left + r.width / 2 - cw / 2;
    left = Math.max(8, Math.min(window.innerWidth - cw - 8, left));
    let top = r.top - chh - 10;
    if (top < 8) top = r.bottom + 10;
    el.choice.style.left = left + 'px';
    el.choice.style.top = top + 'px';
    slots.forEach((s, k) => s.wrap.classList.toggle('picked', k === i));
    (usable ? el.chWeapon : el.chFist).focus({ preventScroll: true });
  }

  function closeChoice() {
    if (el.choice.hidden) return;
    el.choice.hidden = true;
    slots.forEach(s => s.wrap.classList.remove('picked'));
    const i = choiceSlot;
    choiceSlot = -1;
    if (i >= 0 && !busy) slots[i].btn.focus({ preventScroll: true });
  }

  el.chWeapon.addEventListener('click', () => { const i = choiceSlot; if (i >= 0) choose(i, 'weapon'); });
  el.chFist.addEventListener('click', () => { const i = choiceSlot; if (i >= 0) choose(i, 'fist'); });
  $('#ch-cancel').addEventListener('click', closeChoice);
  document.addEventListener('pointerdown', e => {
    if (!el.choice.hidden && !el.choice.contains(e.target) && !e.target.closest('.card')) closeChoice();
  });
  el.flee.addEventListener('click', flee);

  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    const open = openOverlay();
    if (open) {
      if (k === 'escape') { e.preventDefault(); closeOverlay(open); }
      return;
    }
    if (!el.choice.hidden) {
      if (k === 'w' && !el.chWeapon.hidden) { e.preventDefault(); el.chWeapon.click(); }
      else if (k === 'f' || k === 'b') { e.preventDefault(); el.chFist.click(); }
      else if (k === 'escape') { e.preventDefault(); closeChoice(); }
      return;
    }
    if (!S || S.over) return;
    if (['1', '2', '3', '4'].includes(k)) { e.preventDefault(); onCard(+k - 1); }
    else if (k === 'f') { e.preventDefault(); flee(); }
    else if (k === 'escape' || k === 'p') { e.preventDefault(); openPause(); }
    else if (k === 'm') { e.preventDefault(); toggleSfx(); }
  });

  /* ---------------- Overlays ---------------- */
  const OV = { title: $('#ov-title'), rules: $('#ov-rules'), pause: $('#ov-pause'), end: $('#ov-end') };
  let rulesReturn = null;

  function openOverlay() {
    return ['rules', 'pause', 'end', 'title'].map(k => OV[k]).find(o => !o.hidden) || null;
  }
  function show(o) {
    o.hidden = false;
    const f = $('button:not([hidden])', o);
    if (f) f.focus({ preventScroll: true });
  }
  function closeOverlay(o) {
    if (o === OV.title || o === OV.end) return;
    o.hidden = true;
    if (o === OV.rules && rulesReturn) { const r = rulesReturn; rulesReturn = null; show(r); }
  }
  $$('[data-close]').forEach(b => b.addEventListener('click', () => closeOverlay(b.closest('.overlay'))));
  Object.values(OV).forEach(o => o.addEventListener('pointerdown', e => {
    if (e.target === o) closeOverlay(o);
  }));

  function openRules(from) {
    if (from) { from.hidden = true; rulesReturn = from; }
    show(OV.rules);
    $('#rules-body').scrollTop = 0;
  }

  function openPause() {
    if (!S || S.over || busy) return;
    closeChoice();
    $('#pause-mode').textContent = modeText();
    show(OV.pause);
  }

  function recordsText() {
    const rec = store.get('records', { best: null, runs: 0, wins: 0, daily: {} });
    const parts = [];
    if (rec.best != null) parts.push(t('rec.best', { n: rec.best }));
    if (rec.bestEasy != null) parts.push(t('rec.easy', { n: rec.bestEasy }));
    if (rec.runs) parts.push(t('rec.runs', { wins: rec.wins, runs: rec.runs }));
    const d = rec.daily[String(todayKey())];
    if (d != null) parts.push(t('rec.daily', { n: d }));
    return parts.join(' · ') || t('rec.none');
  }

  function showTitle() {
    Object.values(OV).forEach(o => { o.hidden = true; });
    const saved = store.get('run', null);
    $('#t-continue').hidden = !(saved && !saved.over && Array.isArray(saved.dungeon));
    $('#t-records').textContent = recordsText();
    show(OV.title);
  }

  function calcText(c) {
    if (!c || typeof c === 'string') return c || '';
    if (c.hp != null) return t('calc.won', { n: c.hp }) + (c.bonus ? t('calc.bonus', { n: c.bonus }) : '');
    return t('calc.lost', { count: c.count, sum: c.sum });
  }

  function fillEnd() {
    const won = S.won;
    $('#end-h').textContent = t(won ? 'end.won' : 'end.lost');
    OV.end.classList.toggle('won', won);
    $('#end-mode').textContent = modeText();
    $('#end-score').textContent = String(S.score);
    $('#end-calc').textContent = calcText(S.calc);
    $('#end-best').hidden = !S.isBest;
    const secs = Math.round((S.stats.end - S.stats.start) / 1000);
    const time = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    const st = S.stats;
    const rows = [
      ['st.rooms', S.roomNo],
      ['st.slainW', st.slainW],
      ['st.slainF', st.slainF],
      ['st.dmg', st.dmg],
      ['st.healed', st.healed + (st.wasted ? t('st.wasted', { n: st.wasted }) : '')],
      ['st.fled', st.fled],
      ['st.left', S.dungeon.length + roomCards().length],
      ['st.time', time]
    ];
    $('#end-stats').innerHTML = rows.map(([k, v]) => `<div><dt>${t(k)}</dt><dd>${v}</dd></div>`).join('');
    $('#e-same').hidden = S.mode === 'daily';
    $('#e-again').textContent = t({ daily: 'e.againDaily', easy: 'e.againEasy' }[S.mode] || 'e.againFree');
  }

  function showEnd() {
    fillEnd();
    show(OV.end);
  }

  async function begin(mode, seed) {
    Object.values(OV).forEach(o => { o.hidden = true; });
    Sound.unlock();
    newRun(mode, seed);
    shownHP = MAX_HP;
    busy = true;
    log({ daily: 'log.startDaily', easy: 'log.startEasy' }[mode] || 'log.start', { day: S.day });
    render();
    await wait(150);
    await startRoom();
    busy = false;
    render();
    save();
  }

  function resume(run) {
    if (!run || !Array.isArray(run.dungeon)) { showTitle(); return; }
    Object.values(OV).forEach(o => { o.hidden = true; });
    S = run;
    busy = false;
    shownHP = Math.max(0, S.hp);
    render();
    if (S.over) showEnd();
  }

  // Einfacher Dungeon: erst einen Seed suchen, dessen Dungeon der Löser mit Reserve gewinnt.
  let building = false;
  async function startEasy(btn) {
    if (building) return;
    building = true;
    Sound.unlock();
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = t('building');
    const found = await Rules.findEasySeed(randomSeed());
    btn.disabled = false;
    btn.textContent = label;
    building = false;
    begin('easy', found.seed);
  }

  $('#t-new').addEventListener('click', () => begin('free', randomSeed()));
  $('#t-easy').addEventListener('click', e => startEasy(e.currentTarget));
  $('#t-daily').addEventListener('click', () => begin('daily'));
  $('#t-continue').addEventListener('click', () => { Sound.unlock(); resume(store.get('run', null)); });
  $('#t-rules').addEventListener('click', () => openRules(OV.title));
  $('#p-rules').addEventListener('click', () => openRules(OV.pause));
  $('#p-restart').addEventListener('click', () => begin(S.mode, S.seed));
  $('#p-menu').addEventListener('click', () => { save(); showTitle(); });
  $('#e-again').addEventListener('click', e => {
    if (S.mode === 'easy') startEasy(e.currentTarget);
    else begin(S.mode, S.mode === 'daily' ? undefined : randomSeed());
  });
  $('#e-same').addEventListener('click', () => begin(S.mode, S.seed));
  $('#e-menu').addEventListener('click', showTitle);
  $('#btn-help').addEventListener('click', () => { closeChoice(); openRules(null); });
  $('#btn-pause').addEventListener('click', openPause);

  /* ---------------- Ton ---------------- */
  const prefs = store.get('prefs', { sfx: true, music: false });
  Sound.init(prefs);
  const sfxBtn = $('#btn-sfx'), musicBtn = $('#btn-music');
  function syncSound() {
    sfxBtn.setAttribute('aria-pressed', String(Sound.sfx));
    musicBtn.setAttribute('aria-pressed', String(Sound.music));
    store.set('prefs', { sfx: Sound.sfx, music: Sound.music });
  }
  function toggleSfx() { Sound.setSfx(!Sound.sfx); Sound.unlock(); Sound.play('click'); syncSound(); }
  sfxBtn.addEventListener('click', toggleSfx);
  musicBtn.addEventListener('click', () => { Sound.unlock(); Sound.setMusic(!Sound.music); syncSound(); });
  syncSound();
  document.addEventListener('pointerdown', () => Sound.unlock(), { once: true });

  /* ---------------- Sprache umschalten ---------------- */
  let backdrop = null;   // Platzhalter-Tisch hinter dem Titelbild
  const langBtn = $('#btn-lang');
  function syncLang() {
    langBtn.textContent = I18N.lang.toUpperCase();
    $$('.lang-opt').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === I18N.lang)));
  }
  function setLang(l) {
    if (l === I18N.lang) return;
    I18N.set(l);
    PX.setLang(l);
    store.set('lang', l);
    I18N.apply();
    fillImages();
    syncLang();
    closeChoice();
    const view = S || backdrop;
    if (view && !busy) { const keep = S; S = view; render(); S = keep; }
    if (!OV.title.hidden) $('#t-records').textContent = recordsText();
    if (S && !OV.pause.hidden) $('#pause-mode').textContent = modeText();
    if (S && !OV.end.hidden) fillEnd();
  }
  langBtn.addEventListener('click', () => { Sound.play('click'); setLang(I18N.lang === 'de' ? 'en' : 'de'); });
  $$('.lang-opt').forEach(b => b.addEventListener('click', () => { Sound.play('click'); setLang(b.dataset.lang); }));
  syncLang();

  /* ---------------- Titelbild ---------------- */
  const fan = $('#title-fan');
  [mk('S', 14), mk('D', 10), mk('H', 9), mk('C', 6)].forEach((c, i) => {
    const img = new Image();
    img.src = PX.card(c); img.alt = '';
    img.style.setProperty('--i', i);
    fan.appendChild(img);
  });
  $$('.torch').forEach(t => { t.style.backgroundImage = `url(${PX.torch()})`; });

  /* ---------------- Start ---------------- */
  document.documentElement.style.setProperty('--tile', `url(${PX.tile()})`);
  document.documentElement.style.setProperty('--back', `url(${PX.back()})`);
  window.addEventListener('resize', fit);
  fit();

  // Platzhalterzustand hinter dem Titelbild, damit der Tisch nicht leer wirkt
  function boot(data) {
    if (data && data.S && Array.isArray(data.S.dungeon)) { resume(data.S); return; }
    newRun('free', randomSeed());
    for (let i = 0; i < 4; i++) S.room[i] = S.dungeon.shift();
    S.roomNo = 1;
    render();
    backdrop = S;
    S = null;
    showTitle();
  }

  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(() => ({ S: S && !busy ? S : null }));
  if (hot && hot.ready) hot.ready(boot);
  else boot((hot && hot.data) || {});
})();
