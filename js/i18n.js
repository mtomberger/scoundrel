/* Scoundrel – Übersetzungen (Deutsch / Englisch).
   Standard ist die Browsersprache: Deutsch, wenn sie mit „de“ beginnt, sonst Englisch.
   Einträge sind Texte oder Funktionen, die Parameter (p) einsetzen. */
const I18N = (() => {
  'use strict';

  const dateDe = k => { const s = String(k); return `${s.slice(6, 8)}.${s.slice(4, 6)}.${s.slice(0, 4)}`; };
  const dateEn = k => {
    const s = String(k);
    const d = new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const STR = {
    de: {
      'aria.sfx': 'Soundeffekte', 'title.sfx': 'Soundeffekte (M)',
      'aria.music': 'Musik', 'title.music': 'Musik',
      'aria.rules': 'Spielregeln',
      'aria.menu': 'Menü', 'title.menu': 'Menü (Esc)',
      'aria.lang': 'Sprache',
      'aria.langSwitch': 'Sprache: Deutsch – zu Englisch wechseln',
      'aria.table': 'Spieltisch',
      'aria.pips': 'Karten in diesem Raum genommen',
      'aria.log': 'Spielverlauf',
      'aria.choice': 'Kampf',
      'aria.hp': 'Leben',

      'pile.dungeon': 'Dungeon',
      'pile.discard': 'Ablage',
      'hp.word': 'Leben',
      flee: 'Fliehen',
      cancel: 'Abbrechen',

      tagline: 'Ein Dungeon aus 44 Spielkarten. Du hast 20 Leben.',
      't.continue': 'Weiterspielen',
      't.new': 'Neues Spiel',
      't.easy': 'Einfacher Dungeon',
      't.easyHint': 'Gutmütig gemischt und garantiert schaffbar',
      't.daily': 'Tagesdungeon',
      building: 'Dungeon wird gebaut …',
      't.rules': 'Spielregeln',
      credit: 'Nach dem Solitär-Kartenspiel <i>Scoundrel</i> von Zach Gage &amp; Kurt Bieg (2011).',

      'rules.h': 'Spielregeln',
      close: 'Schließen',
      'rules.body': `
        <p class="lead">Du betrittst einen Dungeon aus 44 Karten. Kämpfe dich mit 20 Lebenspunkten durch, bis keine Karte mehr übrig ist.</p>
        <h3>Die Karten</h3>
        <ul class="kinds">
          <li><img alt="" data-card="C6"><div><b>Monster</b> – alle 26 Kreuz- und Pikkarten. Ihr Schaden entspricht dem Wert: 2–10, Bube 11, Dame 12, König 13, Ass 14.</div></li>
          <li><img alt="" data-card="D5"><div><b>Waffen</b> – die 9 Karokarten (2–10). Eine Waffe zieht so viel vom Monsterschaden ab, wie sie wert ist.</div></li>
          <li><img alt="" data-card="H7"><div><b>Heiltränke</b> – die 9 Herzkarten (2–10). Sie heilen ihren Wert, aber nie über 20.</div></li>
        </ul>
        <p class="small">Rote Bildkarten, rote Asse und Joker sind aussortiert.</p>
        <h3>Ein Raum</h3>
        <p>Es liegen immer 4 Karten offen: das ist der Raum. Du kannst <b>fliehen</b> – dann wandern alle 4 Karten unter den Dungeon. Zweimal hintereinander fliehen geht nicht.</p>
        <p>Bleibst du, nimmst du <b>3 der 4 Karten</b> nacheinander. Die vierte bleibt liegen und gehört zum nächsten Raum.</p>
        <h3>Waffen</h3>
        <p>Eine genommene Waffe musst du anlegen. Deine alte Waffe und alle Monster darauf kommen auf die Ablage.</p>
        <h3>Heiltränke</h3>
        <p>Pro Raum wirkt nur ein Trank. Nimmst du einen zweiten, verfällt er ohne Wirkung.</p>
        <h3>Kampf</h3>
        <p><b>Mit bloßen Fäusten</b> verlierst du den vollen Monsterwert an Leben.</p>
        <p><b>Mit der Waffe</b> verlierst du nur Monster minus Waffe (mindestens 0). Das Monster kommt auf die Waffe. Danach kann die Waffe nur noch Monster schlagen, die <b>kleiner oder gleich</b> dem zuletzt damit erschlagenen sind.</p>
        <p class="example">Beispiel: Deine 5er-Waffe hat eine Dame (12) erschlagen. Gegen eine 6 darfst du sie benutzen. Hat sie danach die 6 erschlagen, musst du einen Buben (11) mit Fäusten bekämpfen – die Waffe bleibt aber für Monster bis 6 erhalten.</p>
        <h3>Wertung</h3>
        <p><b>Durchgekommen:</b> Deine Punkte sind deine restlichen Leben. Hast du 20 Leben und war deine letzte Karte ein Heiltrank, zählt dessen Wert dazu (maximal 30).</p>
        <p><b>Gestorben:</b> Die Werte aller verbliebenen Monster (Dungeon und offene Raumkarten) werden abgezogen – das Ergebnis ist negativ.</p>
        <h3>Spielmodi</h3>
        <p><b>Neues Spiel:</b> zufällig gemischt. Nicht jeder dieser Dungeons ist zu gewinnen.</p>
        <p><b>Einfacher Dungeon:</b> gutmütig gemischt – eine starke Waffe gleich im ersten Raum, die Monster grob von stark nach schwach. Bevor du ihn betrittst, rechnet ein Löser einen Weg zum Sieg mit mindestens 10 Leben Reserve durch. Er ist also sicher schaffbar.</p>
        <p><b>Tagesdungeon:</b> zufällig gemischt, aber am selben Tag für alle gleich.</p>
        <h3>Steuerung</h3>
        <p>Karte anklicken oder antippen. Tastatur: <kbd>1</kbd>–<kbd>4</kbd> Karte wählen, <kbd>F</kbd> fliehen, im Kampf <kbd>W</kbd> Waffe oder <kbd>F</kbd> Faust, <kbd>M</kbd> Ton, <kbd>Esc</kbd> Menü.</p>`,

      'pause.h': 'Pause',
      'p.resume': 'Weiter',
      'p.restart': 'Dungeon neu starten',
      'p.menu': 'Hauptmenü',

      'end.scoreLabel': 'Punkte',
      'end.best': 'Neuer Bestwert!',
      'e.same': 'Gleicher Dungeon',
      'e.menu': 'Hauptmenü',
      'e.againDaily': 'Tagesdungeon nochmal',
      'e.againFree': 'Neuer Dungeon',
      'e.againEasy': 'Neuer einfacher Dungeon',
      'end.won': 'Dungeon bezwungen!',
      'end.lost': 'Du bist gefallen.',
      'calc.won': p => `${p.n} Leben übrig`,
      'calc.bonus': p => ` + ${p.n} (letzter Trank)`,
      'calc.lost': p => `${p.count} Monster übrig, zusammen ${p.sum}`,
      'st.rooms': 'Räume',
      'st.slainW': 'Mit Waffe erschlagen',
      'st.slainF': 'Mit Fäusten besiegt',
      'st.dmg': 'Schaden erlitten',
      'st.healed': 'Geheilt',
      'st.wasted': p => ` (${p.n} ${p.n === 1 ? 'Trank' : 'Tränke'} verfallen)`,
      'st.fled': 'Geflohen',
      'st.left': 'Karten übrig',
      'st.time': 'Zeit',

      'mode.daily': p => `Tagesdungeon · ${dateDe(p.day)}`,
      'mode.free': p => `Freies Spiel · Seed ${p.seed}`,
      'mode.easy': p => `Einfacher Dungeon · Seed ${p.seed}`,
      'rec.best': p => `Bestwert ${p.n}`,
      'rec.easy': p => `Einfach ${p.n}`,
      'rec.runs': p => `${p.wins} von ${p.runs} Läufen überlebt`,
      'rec.daily': p => `Heute im Tagesdungeon: ${p.n}`,
      'rec.none': 'Noch kein Lauf gespielt.',

      room: p => `Raum ${p.n}`,
      'potion.ready': 'Trank bereit',
      'potion.used': 'Trank genutzt',
      'hint.fled': 'Du bist gerade erst geflohen.',
      'hint.entered': 'Du hast den Raum betreten.',
      'hint.empty': 'Kein Ausweg mehr – der Dungeon ist leer.',
      'hint.flee': 'Alle 4 Karten wandern unter den Dungeon.',

      'fx.equip': p => `${p.n} anlegen`,
      'fx.wasted': 'verfällt',
      'fx.heal': p => `+${p.n} Leben`,

      'aria.card': p => `Karte ${p.i}: ${p.name} (${p.suit} ${p.rank}). ${p.what}.`,
      'aria.empty': p => `Platz ${p.i}: leer`,
      'aria.weapon': p => `Waffe Stärke ${p.n}, anlegen`,
      'aria.potion': p => `Heiltrank, heilt ${p.n}`,
      'aria.potionWasted': p => `Heiltrank ${p.n}, verfällt`,
      'aria.monster': p => `Monster ${p.n}, ${p.n} Schaden`,
      'aria.monsterBoth': p => `Monster ${p.n}, mit Waffe ${p.w} Schaden, mit Fäusten ${p.n}`,

      'w.none': 'Keine Waffe',
      'w.noneHint': 'Monster kämpfst du mit bloßen Fäusten.',
      'w.name': p => `${p.name} · Stärke ${p.n}`,
      'w.alt': p => `${p.name}, Stärke ${p.n}`,
      'w.limit': p => `Nur noch gegen Monster bis ${p.n}`,
      'w.fresh': 'Noch unbenutzt – schlägt jedes Monster.',

      'f.wasted': 'verfällt',
      'f.parry': 'Pariert!',

      'ch.weapon': 'Waffe',
      'ch.fist': 'Faust',
      'ch.dmg': p => `-${p.n} Leben`,
      'ch.noDmg': 'kein Schaden',
      'ch.lethal': 'tödlich',
      'ch.noteLimit': p => `Danach trifft die Waffe nur noch Monster bis ${p.n}.`,
      'ch.noteKeep': p => `Die Waffe bleibt für Monster bis ${p.n} nutzbar.`,
      'ch.noteBlocked': p => `Deine Waffe trifft nur Monster bis ${p.n}.`,
      'ch.noWeapon': 'Du hast keine Waffe.',

      'log.start': 'Du steigst hinab in den Dungeon. Viel Glück, Schurke.',
      'log.startDaily': p => `Tagesdungeon vom ${dateDe(p.day)}. Alle spielen heute dieselbe Kartenfolge.`,
      'log.startEasy': 'Ein einfacher Dungeon: Er ist garantiert schaffbar. Viel Glück, Schurke.',
      'log.equip': p => `${p.w} angelegt – Stärke ${p.n}.`,
      'log.wasted': p => `${p.c} verfällt – nur ein Trank pro Raum.`,
      'log.heal': p => `${p.c} getrunken: +${p.n} Leben.`,
      'log.healFull': p => `${p.c} getrunken – du warst schon bei vollen Kräften.`,
      'log.slay': p => `${p.m} mit ${p.w} erschlagen: -${p.n} Leben.`,
      'log.slayClean': p => `${p.m} mit ${p.w} erschlagen – kein Schaden.`,
      'log.fist': p => `${p.m} mit bloßen Fäusten besiegt: -${p.n} Leben.`,
      'log.flee': 'Geflohen! Die vier Karten liegen jetzt unter dem Dungeon.',
      'log.win': 'Der Dungeon ist leer. Du hast überlebt!',
      'log.death': 'Du bist im Dungeon gefallen.'
    },

    en: {
      'aria.sfx': 'Sound effects', 'title.sfx': 'Sound effects (M)',
      'aria.music': 'Music', 'title.music': 'Music',
      'aria.rules': 'How to play',
      'aria.menu': 'Menu', 'title.menu': 'Menu (Esc)',
      'aria.lang': 'Language',
      'aria.langSwitch': 'Language: English – switch to German',
      'aria.table': 'Game table',
      'aria.pips': 'Cards taken in this room',
      'aria.log': 'Game log',
      'aria.choice': 'Fight',
      'aria.hp': 'Health',

      'pile.dungeon': 'Dungeon',
      'pile.discard': 'Discard',
      'hp.word': 'Health',
      flee: 'Flee',
      cancel: 'Cancel',

      tagline: 'A dungeon of 44 playing cards. You have 20 health.',
      't.continue': 'Continue',
      't.new': 'New game',
      't.easy': 'Easy dungeon',
      't.easyHint': 'Kindly shuffled and guaranteed to be beatable',
      't.daily': 'Daily dungeon',
      building: 'Building dungeon …',
      't.rules': 'How to play',
      credit: 'Based on the solitaire card game <i>Scoundrel</i> by Zach Gage &amp; Kurt Bieg (2011).',

      'rules.h': 'How to play',
      close: 'Close',
      'rules.body': `
        <p class="lead">You enter a dungeon of 44 cards. Fight your way through with 20 health until no card is left.</p>
        <h3>The cards</h3>
        <ul class="kinds">
          <li><img alt="" data-card="C6"><div><b>Monsters</b> – all 26 clubs and spades. Their damage equals their value: 2–10, Jack 11, Queen 12, King 13, Ace 14.</div></li>
          <li><img alt="" data-card="D5"><div><b>Weapons</b> – the 9 diamonds (2–10). A weapon reduces a monster's damage by its own value.</div></li>
          <li><img alt="" data-card="H7"><div><b>Health potions</b> – the 9 hearts (2–10). They heal their value, but never above 20.</div></li>
        </ul>
        <p class="small">Red face cards, red aces and jokers are removed.</p>
        <h3>A room</h3>
        <p>There are always 4 cards face up: that is the room. You may <b>flee</b> – all 4 cards then go to the bottom of the dungeon. You cannot flee twice in a row.</p>
        <p>If you stay, you take <b>3 of the 4 cards</b>, one at a time. The fourth card stays and becomes part of the next room.</p>
        <h3>Weapons</h3>
        <p>A weapon you take must be equipped. Your old weapon and every monster on it go to the discard pile.</p>
        <h3>Health potions</h3>
        <p>Only one potion works per room. If you take a second one, it is wasted.</p>
        <h3>Combat</h3>
        <p><b>Barehanded</b> you lose the monster's full value in health.</p>
        <p><b>With your weapon</b> you only lose the monster's value minus the weapon's (at least 0). The monster is placed on the weapon. From then on the weapon can only hit monsters <b>less than or equal</b> to the last monster it slew.</p>
        <p class="example">Example: your 5 weapon has slain a Queen (12). You may use it against a 6. Once it has slain the 6, you must fight a Jack (11) barehanded – but the weapon stays usable against monsters up to 6.</p>
        <h3>Scoring</h3>
        <p><b>Survived:</b> your score is your remaining health. If you have 20 health and your last card was a potion, its value is added (30 at most).</p>
        <p><b>Died:</b> the values of all remaining monsters (dungeon and open room cards) are subtracted – the result is negative.</p>
        <h3>Game modes</h3>
        <p><b>New game:</b> shuffled at random. Not every one of these dungeons can be won.</p>
        <p><b>Easy dungeon:</b> shuffled kindly – a strong weapon in the very first room and the monsters roughly from strong to weak. Before you enter, a solver works out a winning line with at least 10 health to spare, so it can definitely be beaten.</p>
        <p><b>Daily dungeon:</b> shuffled at random, but the same for everyone on the same day.</p>
        <h3>Controls</h3>
        <p>Click or tap a card. Keyboard: <kbd>1</kbd>–<kbd>4</kbd> pick a card, <kbd>F</kbd> flee, in a fight <kbd>W</kbd> weapon or <kbd>F</kbd> fists, <kbd>M</kbd> sound, <kbd>Esc</kbd> menu.</p>`,

      'pause.h': 'Paused',
      'p.resume': 'Resume',
      'p.restart': 'Restart dungeon',
      'p.menu': 'Main menu',

      'end.scoreLabel': 'Score',
      'end.best': 'New best!',
      'e.same': 'Same dungeon',
      'e.menu': 'Main menu',
      'e.againDaily': 'Replay daily dungeon',
      'e.againFree': 'New dungeon',
      'e.againEasy': 'New easy dungeon',
      'end.won': 'Dungeon cleared!',
      'end.lost': 'You have fallen.',
      'calc.won': p => `${p.n} health left`,
      'calc.bonus': p => ` + ${p.n} (last potion)`,
      'calc.lost': p => `${p.count} ${p.count === 1 ? 'monster' : 'monsters'} left, totalling ${p.sum}`,
      'st.rooms': 'Rooms',
      'st.slainW': 'Slain with weapon',
      'st.slainF': 'Beaten barehanded',
      'st.dmg': 'Damage taken',
      'st.healed': 'Healed',
      'st.wasted': p => ` (${p.n} ${p.n === 1 ? 'potion' : 'potions'} wasted)`,
      'st.fled': 'Fled',
      'st.left': 'Cards left',
      'st.time': 'Time',

      'mode.daily': p => `Daily dungeon · ${dateEn(p.day)}`,
      'mode.free': p => `Free play · seed ${p.seed}`,
      'mode.easy': p => `Easy dungeon · seed ${p.seed}`,
      'rec.best': p => `Best score ${p.n}`,
      'rec.easy': p => `Easy ${p.n}`,
      'rec.runs': p => `${p.wins} of ${p.runs} ${p.runs === 1 ? 'run' : 'runs'} survived`,
      'rec.daily': p => `Today's daily dungeon: ${p.n}`,
      'rec.none': 'No runs played yet.',

      room: p => `Room ${p.n}`,
      'potion.ready': 'Potion ready',
      'potion.used': 'Potion used',
      'hint.fled': 'You just fled.',
      'hint.entered': 'You have entered the room.',
      'hint.empty': 'No way out – the dungeon is empty.',
      'hint.flee': 'All 4 cards go to the bottom of the dungeon.',

      'fx.equip': p => `equip ${p.n}`,
      'fx.wasted': 'wasted',
      'fx.heal': p => `+${p.n} health`,

      'aria.card': p => `Card ${p.i}: ${p.name} (${p.rank} of ${p.suit}). ${p.what}.`,
      'aria.empty': p => `Slot ${p.i}: empty`,
      'aria.weapon': p => `Weapon, strength ${p.n}, equip`,
      'aria.potion': p => `Health potion, heals ${p.n}`,
      'aria.potionWasted': p => `Health potion ${p.n}, wasted`,
      'aria.monster': p => `Monster ${p.n}, ${p.n} damage`,
      'aria.monsterBoth': p => `Monster ${p.n}, ${p.w} damage with weapon, ${p.n} barehanded`,

      'w.none': 'No weapon',
      'w.noneHint': 'You fight monsters barehanded.',
      'w.name': p => `${p.name} · strength ${p.n}`,
      'w.alt': p => `${p.name}, strength ${p.n}`,
      'w.limit': p => `Only against monsters up to ${p.n}`,
      'w.fresh': 'Unused – can hit any monster.',

      'f.wasted': 'wasted',
      'f.parry': 'Blocked!',

      'ch.weapon': 'Weapon',
      'ch.fist': 'Fists',
      'ch.dmg': p => `-${p.n} health`,
      'ch.noDmg': 'no damage',
      'ch.lethal': 'lethal',
      'ch.noteLimit': p => `Afterwards the weapon only hits monsters up to ${p.n}.`,
      'ch.noteKeep': p => `The weapon stays usable against monsters up to ${p.n}.`,
      'ch.noteBlocked': p => `Your weapon only hits monsters up to ${p.n}.`,
      'ch.noWeapon': 'You have no weapon.',

      'log.start': 'You descend into the dungeon. Good luck, scoundrel.',
      'log.startDaily': p => `Daily dungeon for ${dateEn(p.day)}. Everyone plays the same cards today.`,
      'log.startEasy': 'An easy dungeon: it can definitely be beaten. Good luck, scoundrel.',
      'log.equip': p => `Equipped ${p.w} – strength ${p.n}.`,
      'log.wasted': p => `${p.c} wasted – only one potion per room.`,
      'log.heal': p => `Drank ${p.c}: +${p.n} health.`,
      'log.healFull': p => `Drank ${p.c} – you were already at full health.`,
      'log.slay': p => `${p.m} slain with ${p.w}: -${p.n} health.`,
      'log.slayClean': p => `${p.m} slain with ${p.w} – no damage.`,
      'log.fist': p => `${p.m} beaten barehanded: -${p.n} health.`,
      'log.flee': 'You fled! The four cards are now at the bottom of the dungeon.',
      'log.win': 'The dungeon is empty. You survived!',
      'log.death': 'You fell in the dungeon.'
    }
  };

  let lang = 'en';

  function detect() {
    const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    return String(list[0] || 'en').toLowerCase().startsWith('de') ? 'de' : 'en';
  }

  function t(key, p = {}) {
    const v = key in STR[lang] ? STR[lang][key] : STR.en[key];
    if (v === undefined) return key;
    return typeof v === 'function' ? v(p) : v;
  }

  function apply(root = document) {
    document.documentElement.lang = lang;
    root.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
    root.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
    root.querySelectorAll('[data-i18n-title]').forEach(e => { e.title = t(e.dataset.i18nTitle); });
  }

  return {
    t, apply, detect,
    langs: Object.keys(STR),
    get lang() { return lang; },
    set(l) { lang = STR[l] ? l : 'en'; }
  };
})();
