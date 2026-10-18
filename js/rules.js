/* Scoundrel – Regelkern ohne DOM: Zufall, Kartenstapel, der Bauplan für den
   einfachen Dungeon und ein Löser, der beweist, dass ein Dungeon gewinnbar ist.
   Läuft im Browser (globales Rules) und in Node (module.exports). */
const Rules = (() => {
  'use strict';

  const MAX_HP = 20;
  const EASY = { sigma: 2, beamWidth: 20, minHp: 10 };

  function mulberry32(a) {
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const mk = (suit, rank) => ({ id: suit + rank, suit, rank, type: suit === 'D' ? 'weapon' : suit === 'H' ? 'potion' : 'monster' });

  function buildDeck() {
    const d = [];
    for (const s of ['C', 'S']) for (let r = 2; r <= 14; r++) d.push(mk(s, r));
    for (const s of ['D', 'H']) for (let r = 2; r <= 10; r++) d.push(mk(s, r));
    return d;
  }

  function shuffle(a, rnd) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const deal = seed => shuffle(buildDeck(), mulberry32(seed));

  // Gutmütige Reihenfolge: eine starke Waffe (8–10) im ersten Raum, Monster grob
  // absteigend (so bleibt die Waffe lange nutzbar), weitere Waffen erst dann, wenn
  // die Monster schwächer als sie sind, Tränke über den Dungeon verteilt.
  // sigma bestimmt, wie stark die Reihenfolge verwürfelt wird.
  function easyDeal(seed, sigma = EASY.sigma) {
    const rnd = mulberry32(seed);
    const gauss = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
    const deck = buildDeck();
    const strong = deck.filter(c => c.type === 'weapon' && c.rank >= 8);
    const opener = strong[Math.floor(rnd() * strong.length)];
    const pots = shuffle(deck.filter(c => c.type === 'potion'), rnd);
    const order = deck.filter(c => c !== opener).map(c => {
      let k;
      if (c.type === 'monster') k = c.rank + gauss() * sigma;
      else if (c.type === 'weapon') k = c.rank + 0.5 + gauss() * sigma;
      else k = 14 - (pots.indexOf(c) + 0.5) * 12 / pots.length + gauss() * sigma;
      return [k, c];
    }).sort((a, b) => b[0] - a[0]).map(x => x[1]);
    order.splice(Math.floor(rnd() * 3), 0, opener);
    return order;
  }

  /* ------------------------------------------------------------------ */
  /* Löser (Strahlsuche, raumweise): Für jeden Zustand werden alle        */
  /* Ausgänge eines Raums berechnet – fliehen oder jede Reihenfolge von   */
  /* bis zu 3 Karten mit Waffe oder Faust. Pro Stufe werden die besten    */
  /* `width` Zustände weiterverfolgt. Findet er einen Sieg, ist der        */
  /* Dungeon nachweislich gewinnbar; die Zugfolge ist der Beweis.         */
  /* Kartenindizes beziehen sich auf die Position im übergebenen Dungeon. */
  /* ------------------------------------------------------------------ */
  function solve(dungeon, width = EASY.beamWidth) {
    const T = dungeon.map(c => c.type === 'monster' ? 0 : c.type === 'weapon' ? 1 : 2);
    const Rk = dungeon.map(c => c.rank);

    function refill(s) {
      for (let i = 0; i < 4; i++) if (s.room[i] < 0 && s.dun.length) s.room[i] = s.dun.shift();
      s.played = 0; s.pot = false;
    }
    const copy = s => ({ dun: s.dun.slice(), room: s.room.slice(), hp: s.hp, w: s.w, last: s.last, pot: s.pot, played: s.played, av: s.av, moves: s.moves });

    function play(s, i, weapon) {
      const n = copy(s);
      const c = n.room[i];
      n.room[i] = -1;
      const t = T[c], r = Rk[c];
      if (t === 1) { n.w = r; n.last = 99; }
      else if (t === 2) { if (!n.pot) { n.hp = Math.min(MAX_HP, n.hp + r); n.pot = true; } }
      else if (weapon) { n.hp -= Math.max(0, r - n.w); n.last = r; }
      else n.hp -= r;
      n.played++;
      n.moves = s.moves.concat([[c, weapon ? 1 : 0]]);
      return n;
    }

    function outcomes(s) {
      const out = [];
      if (!s.av && s.room.every(x => x >= 0) && s.dun.length) {
        const n = copy(s);
        n.dun.push(...n.room);
        n.room = [-1, -1, -1, -1];
        n.av = true;
        n.moves = s.moves.concat([['flee']]);
        refill(n);
        n.fled = true;
        out.push(n);
      }
      (function step(cur) {
        cur.room.forEach((c, i) => {
          if (c < 0) return;
          const opts = T[c] === 0 && cur.w && Rk[c] <= cur.last ? [true, false] : [false];
          opts.forEach(wp => {
            const n = play(cur, i, wp);
            if (n.hp <= 0) return;
            const left = n.room.some(x => x >= 0);
            if (n.played >= 3 || !left) {
              n.av = false;
              if (!left && !n.dun.length) n.win = true;
              else refill(n);
              out.push(n);
            } else step(n);
          });
        });
      })(s);
      return out;
    }

    // Bewertung: Leben minus erwarteter Restschaden plus verbleibende Heilung.
    // Monster, die die aktuelle Waffe noch treffen darf, kosten nur den Überschuss.
    function score(s) {
      let cost = 0, heal = 0;
      const each = c => {
        if (c < 0) return;
        if (T[c] === 0) cost += s.w && Rk[c] <= s.last ? Math.max(0, Rk[c] - s.w) : Rk[c] * 0.7;
        else if (T[c] === 2) heal += Rk[c];
      };
      s.room.forEach(each);
      s.dun.forEach(each);
      return s.hp - cost + 0.5 * heal;
    }
    const key = s => `${s.hp},${s.w},${s.last},${+s.av}|${s.room.join('.')}|${s.dun.join('.')}`;

    const start = { dun: dungeon.map((_, i) => i), room: [-1, -1, -1, -1], hp: MAX_HP, w: 0, last: 99, pot: false, played: 0, av: false, moves: [] };
    refill(start);

    let level = [start];
    let best = null;
    for (let guard = 0; guard < 60 && level.length; guard++) {
      const seen = new Set();
      const next = [];
      const queue = level.slice();
      while (queue.length) {
        const s = queue.pop();
        for (const n of outcomes(s)) {
          if (n.win) { if (!best || n.hp > best.hp) best = n; continue; }
          if (n.fled) { n.fled = false; queue.push(n); continue; }   // Flucht bleibt auf derselben Stufe
          const k = key(n);
          if (!seen.has(k)) { seen.add(k); next.push(n); }
        }
      }
      next.sort((a, b) => score(b) - score(a));
      level = next.slice(0, width);
    }
    return best ? { won: true, hp: best.hp, moves: best.moves } : { won: false, hp: 0, moves: null };
  }

  // Sucht ab startSeed den nächsten einfachen Dungeon, den der Löser mit
  // mindestens EASY.minHp Leben gewinnt. Gibt zwischendurch die Kontrolle ab
  // (await), damit die Seite flüssig bleibt.
  // Etwa jeder zweite Kandidat besteht; die Suche endet daher praktisch sofort.
  async function findEasySeed(startSeed) {
    for (let k = 0; ; k++) {
      const seed = startSeed + k;
      const res = solve(easyDeal(seed));
      if (res.won && res.hp >= EASY.minHp) return { seed, hp: res.hp, tries: k + 1, moves: res.moves };
      await new Promise(r => setTimeout(r, 0));
    }
  }

  return { MAX_HP, EASY, mulberry32, mk, buildDeck, shuffle, deal, easyDeal, solve, findEasySeed };
})();

if (typeof module !== 'undefined') module.exports = Rules;
