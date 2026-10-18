/* Scoundrel – Pixel-Art.
   Sprites, Glyphen und Kartenrenderer. Alles wird zur Laufzeit auf Canvas
   gezeichnet (1 Spielpixel = 1 Canvaspixel) und per CSS mit
   image-rendering: pixelated ganzzahlig hochskaliert. */
const PX = (() => {
  'use strict';

  const CW = 34, CH = 46;           // Kartengröße in Spielpixeln
  const OUT = '#120a14';            // Umrissfarbe aller Sprites

  const BASE = {
    k: '#1b1120', w: '#f2ead2', l: '#ffffff', e: '#ff3b30', y: '#f2c03a', Y: '#a87a22',
    r: '#d4303f', R: '#8e1c2a', s: '#b4c2d0', d: '#76869a', D: '#4e5a6a',
    n: '#9a6a3a', N: '#6a4424', c: '#c89a5a', u: '#4a90e0', U: '#2a5aa8',
    v: '#a060f0', V: '#4a2a7a', p: '#e89aa8', h: '#ffb0b8', f: '#c8c0d0', g: '#a8b0bc'
  };

  // Spiegelt halbe Zeilen (letzte Spalte = Mittelachse) zu symmetrischen Sprites.
  const M = rows => rows.map(r => r + [...r.slice(0, -1)].reverse().join(''));

  /* ------------------------------------------------------------------ */
  /* Monster (Kreuz & Pik). pal = Kreuz-Variante, alt = Pik-Variante.     */
  /* ------------------------------------------------------------------ */
  const MONSTERS = {
    2: {
      name: 'Ratte',
      rows: [
        '..........aa....',
        '.........appa...',
        '.....aaaaaapaa..',
        '...aacccaaaaaa..',
        '..accaaaaaaaeaa.',
        '.aaaaaaaaaaaaaap',
        '.abaaaaaaaaaab..',
        'pbbbbaaaaabbb...',
        'p.bbbbbbbbbb....',
        '.p..k.k..k.k....',
        '..pp............'
      ],
      pal: { a: '#9a8a78', b: '#6b5d50', c: '#c4b6a4', p: '#e89aa8' },
      alt: { a: '#6e6876', b: '#47424e', c: '#938d9c' }
    },
    3: {
      name: 'Fledermaus', float: true,
      rows: M([
        'a.......',
        'aa....a.',
        'aba...aa',
        'abba.aea',
        'abbbaaaa',
        'ab.bbawa',
        'a...bbaa',
        '.....b.a'
      ]),
      pal: { a: '#7a6496', b: '#4a3a62', e: '#ffd23f' },
      alt: { a: '#8a6a4e', b: '#5a4232', e: '#ff4a3a' }
    },
    4: {
      name: 'Schleim',
      rows: [
        '......aaa......',
        '....aaaaaaa....',
        '...acaaaaaaa...',
        '..accaaaaaaaa..',
        '..acalaaalaaa..',
        '.aaaakaaakaaaa.',
        '.aaaaaaaaaaaaa.',
        '.aaaaakkkaaaaa.',
        'aabaaaaaaaaabaa',
        'abbbbbbbbbbbbba',
        '.bb.bbbbbbb.bb.'
      ],
      pal: { a: '#6fd66a', b: '#3a9a4e', c: '#d8ffd0' },
      alt: { a: '#6aa8ff', b: '#3a5ec8', c: '#d8ecff' }
    },
    5: {
      name: 'Spinne',
      rows: M([
        '......aa',
        '....aaaa',
        '.kk.aaca',
        'k..kaarr',
        'k...aaar',
        '.kk.kaar',
        'k..k.aaa',
        'k...kbbb',
        '..kk.bee',
        '.k..k.bb',
        '.k....w.'
      ]),
      pal: { a: '#8a7450', b: '#5e4e36', c: '#b8a07a', r: '#e04848', e: '#ff5040' },
      alt: { a: '#6a4a8e', b: '#46306a', c: '#9a7ac0' }
    },
    6: {
      name: 'Goblin',
      rows: M([
        '.....aaa',
        '....aaaa',
        'a..aaaaa',
        'aa.aaaaa',
        '.aaabbaa',
        '..aaykaa',
        '...aaaab',
        '...akwkw',
        '....akkk',
        '.....aaa',
        '...nnnnn',
        '..nnNnnn',
        '.nnnNnnn'
      ]),
      pal: { a: '#7cc04a', b: '#4e8a2e', y: '#ffd23f', n: '#7a5030', N: '#4e3018' },
      alt: { a: '#d0743a', b: '#9a4a22', n: '#4e5a6a', N: '#333a46' }
    },
    7: {
      name: 'Skelett',
      rows: M([
        '.....www',
        '....wwww',
        '...wwwww',
        '...wkkww',
        '...wkeww',
        '...wwwwk',
        '....wwww',
        '....wkwk',
        '.....www',
        '.......g',
        '..wwwwwg',
        '.......g',
        '...wwwwg',
        '.......g',
        '....wwwg'
      ]),
      pal: { w: '#efe6cf', g: '#b9ae96' },
      alt: { e: '#4ad0ff' }
    },
    8: {
      name: 'Zombie',
      rows: [
        '...NNN.NNNN....',
        '...NNNNNNNNN...',
        '...aaaaaaaaa...',
        '...aaaaaaaaa...',
        '...alkaaakka...',
        '...aaaaaakka...',
        '...aaaabaaaa...',
        '...aakkkkkaa...',
        '...aakrwrkaa...',
        '....aaaaaaa....',
        '..cc.aaaaa.cc..',
        '.ccccccccccccc.',
        '.cdccccdcccdcc.'
      ],
      pal: { a: '#9ab47a', b: '#6e8a56', N: '#3a2a2a', c: '#5a6a8a', d: '#3a4a66', r: '#8a1e2a' },
      alt: { a: '#a8b0c0', b: '#7a8298', c: '#8a5a4a', d: '#5e3a30' }
    },
    9: {
      name: 'Ork',
      rows: M([
        '....dddd',
        '...dsddd',
        '...DDDDD',
        '..aaaaaa',
        '..akkaaa',
        '..aaeaaa',
        '..aaaabb',
        '..aawkkk',
        '..aawaaa',
        '...aaaaa',
        '.nnnnnnn',
        'nnNnnnnn'
      ]),
      pal: { a: '#7a9a4a', b: '#56722e', d: '#8796a6', s: '#c9d4de', D: '#55606e', n: '#7a4a2a', N: '#4a2a18' },
      alt: { a: '#7a8a9a', b: '#56626e', n: '#5a2a2a', N: '#3a1818' }
    },
    10: {
      name: 'Geist', float: true,
      rows: M([
        '.....aaa',
        '....acaa',
        '...aaaaa',
        '...aaaaa',
        '..aakkaa',
        '..aakkaa',
        '..aaaaaa',
        '.aaaaaak',
        '..aaaaak',
        '..aaaaaa',
        '..aaaaaa',
        '..abaaba',
        '..b..b.b'
      ]),
      pal: { a: '#dff2e6', b: '#9ad0b4', c: '#ffffff', k: '#24203a' },
      alt: { a: '#e2e8ff', b: '#9faee0' }
    },
    11: {
      name: 'Dunkelritter',
      rows: M([
        '......rr',
        '.......r',
        '.....ddd',
        '....dsdd',
        '...ddsdd',
        '...dkkkk',
        '...dkekk',
        '...ddddD',
        '...dDdDd',
        '....dddd',
        'DDDDdddd',
        'DsDDDddd',
        'DDD.Dddd'
      ]),
      pal: { d: '#5e6676', D: '#3c4252', s: '#a4aebe', k: '#0e0a12', e: '#7aff6a', r: '#3ab05a' },
      alt: { e: '#ff3030', r: '#c02a3a' }
    },
    12: {
      name: 'Hexe',
      rows: [
        '..........h....',
        '.........hh....',
        '........hhh....',
        '.......hhh.....',
        '......hhhh.....',
        '.....hhhhhh....',
        '....yyyyyyy....',
        '..hhhhhhhhhhh..',
        '..ffaaaaaaaff..',
        '..ffakaaakaff..',
        '..ffaaabaaaff..',
        '..ffaaabbaaff..',
        '..ffaakkkaaff..',
        '..f..aaaaa..f..',
        '.vvvvvvvvvvvvv.',
        'vvvVvvvvvvvVvvv'
      ],
      pal: { a: '#9ad06a', b: '#6aa04a', h: '#3e2a5a', y: '#c89a30', f: '#c8c0d0', v: '#3a1e50', V: '#24123a' },
      alt: { a: '#dccbd8', b: '#a898b0', h: '#22202e', f: '#e04a3a', v: '#2e1a2e', V: '#1e101e' }
    },
    13: {
      name: 'Lichkönig',
      rows: M([
        '...y.y.y',
        '...yyyyy',
        '...yuyyr',
        '...wwwww',
        '...wkkww',
        '...wkvww',
        '...wwwwk',
        '....wkwk',
        '.VV..www',
        '.VVVVVVV',
        'VVvVVVVy',
        'VVvVVVVV'
      ]),
      pal: { w: '#e8e0cc', V: '#2e4a3a', v: '#7aff9a', u: '#40a0ff', r: '#e03040' },
      alt: { V: '#3a1e5a', v: '#c070ff' }
    },
    14: {
      name: 'Drache',
      rows: M([
        'w.......',
        'ww......',
        '.ww.aaaa',
        '..waaaaa',
        '..aaccaa',
        '.aayykaa',
        '.aaaaaaa',
        '..aaaaaa',
        '..baaaaa',
        '...aakaa',
        '...wbbbb',
        '...w.kkk',
        '....aaaa'
      ]),
      pal: { a: '#4aa04a', b: '#2e6a30', c: '#8ae07a', y: '#ffd23f', w: '#efe0c0' },
      alt: { a: '#d03a2a', b: '#8e2218', c: '#ff8a5a' }
    }
  };

  /* ------------------------------------------------------------------ */
  /* Waffen (Karo)                                                       */
  /* ------------------------------------------------------------------ */
  const WEAPONS = {
    2: {
      name: 'Knüppel',
      rows: M([
        '......nn',
        '.....nnn',
        '.....gnc',
        '.....Nnc',
        '.....gnc',
        '......Nn',
        '......Nn',
        '.......n',
        '.......n',
        '.......n',
        '.......N',
        '.......N'
      ]),
      pal: { n: '#9a6a3a', N: '#6a4424', c: '#c89a5a', g: '#a8b0bc' }
    },
    3: {
      name: 'Dolch',
      rows: M([
        '.......l',
        '......sl',
        '......sl',
        '......sl',
        '......sl',
        '......sl',
        '.....yyy',
        '.......n',
        '.......n',
        '......yy'
      ])
    },
    4: {
      name: 'Kurzschwert',
      rows: M([
        '.......l',
        '......sl',
        '......sl',
        '......sl',
        '......sl',
        '......sl',
        '......sl',
        '......sl',
        '....yyyy',
        '.......n',
        '.......n',
        '.......n',
        '......yy'
      ]),
      pal: { s: '#d6a866', l: '#f8e0a0', y: '#8a6a3a' }
    },
    5: {
      name: 'Doppelaxt',
      rows: M([
        '.......s',
        'l......n',
        'ls.....n',
        'lsd...dn',
        'lsdddddn',
        'lsd...dn',
        'ls.....n',
        'l......n',
        '.......n',
        '.......n',
        '.......n',
        '.......n',
        '.......n',
        '.......N',
        '.......N'
      ]),
      pal: { l: '#eef4fa' }
    },
    6: {
      name: 'Streitkolben',
      rows: M([
        '.......l',
        '....dddd',
        '...ldsss',
        '...dssll',
        '.lddssll',
        '...dssss',
        '...ldddd',
        '.....ddd',
        '.......n',
        '.......n',
        '.......n',
        '.......n',
        '.......n',
        '.......n',
        '......dd'
      ]),
      pal: { l: '#f0f4f8', n: '#7a4a2a' }
    },
    7: {
      name: 'Speer',
      rows: M([
        '.......l',
        '......sl',
        '......sl',
        '.....dsl',
        '.....dsl',
        '.....dsl',
        '......sl',
        '......sl',
        '......yy',
        '......rn',
        '.....r.n',
        '.....r.n',
        '.......n',
        '.......n',
        '.......n',
        '.......n',
        '.......n',
        '.......n',
        '.......n',
        '.......N'
      ])
    },
    8: {
      name: 'Langschwert',
      rows: M([
        '.......l',
        '......sl',
        '.....dsl',
        '.....dsl',
        '.....dsl',
        '.....dsl',
        '.....dsl',
        '.....dsl',
        '.....dsl',
        '.....dsl',
        '.....dsl',
        '.....dsl',
        '...yyyyy',
        '...Y...n',
        '.......n',
        '.......n',
        '.......n',
        '......yr'
      ])
    },
    9: {
      name: 'Kriegshammer',
      rows: M([
        '.......s',
        '.......s',
        '..dddddd',
        '..dsssss',
        '..dsllll',
        '..dsssss',
        '..dddddd',
        '......yy',
        '.......n',
        '.......n',
        '.......n',
        '.......n',
        '.......n',
        '.......n',
        '.......n',
        '......yy'
      ]),
      pal: { d: '#4e5666', s: '#8a96a8', l: '#c8d2de' }
    },
    10: {
      name: 'Runenklinge',
      rows: M([
        '.......c',
        '......uc',
        '.....Uuc',
        '.....Uuc',
        '.....Uul',
        '.....Uuc',
        '.....Uuc',
        '.....Uul',
        '.....Uuc',
        '.....Uuc',
        '.....Uul',
        '.....Uuc',
        '..vvyyyy',
        '..v...yn',
        '.......n',
        '.......n',
        '.......n',
        '......yc'
      ]),
      pal: { U: '#2a58b0', u: '#5aa8ff', c: '#b8ffff', l: '#ffffff', v: '#a060f0', n: '#5a3820' }
    }
  };

  /* ------------------------------------------------------------------ */
  /* Heiltränke (Herz)                                                   */
  /* ------------------------------------------------------------------ */
  const POT_PAL = { g: '#cfeefc', r: '#e2323f', R: '#9e1c2a', h: '#ffa8b0', n: '#a8784a', w: '#f4ecd6', y: '#e8b64a' };
  const POT_S = M([
    '......nn',
    '......gg',
    '.....ggg',
    '....grrr',
    '...grhrr',
    '...grrrr',
    '...gRrrr',
    '....gRRR',
    '.....ggg'
  ]);
  const POT_M = M([
    '......nn',
    '......nn',
    '......gg',
    '......gg',
    '.....ggg',
    '...ggggg',
    '..grrrrr',
    '.grhrrrr',
    '.grrrrrr',
    '.grrrrrr',
    '.gRrrrrr',
    '..gRRRRR',
    '...ggggg'
  ]);
  const POT_L = M([
    '......nn',
    '.....yyy',
    '......gg',
    '.....ggg',
    '...ggggg',
    '..grrrrr',
    '..grwwww',
    '..grwwrw',
    '..grwwrr',
    '..grwwwr',
    '..grwwww',
    '..grrrrr',
    '..gRRRRR',
    '...ggggg'
  ]);
  const POTIONS = [
    { max: 4, name: 'Kleiner Heiltrank', rows: POT_S },
    { max: 7, name: 'Heiltrank', rows: POT_M },
    { max: 9, name: 'Großer Heiltrank', rows: POT_L },
    { max: 10, name: 'Elixier', rows: POT_L, pal: { r: '#f04a8a', R: '#a82a60', y: '#fff07a', n: '#e8b64a' } }
  ];

  /* ------------------------------------------------------------------ */
  /* Glyphen, Farbsymbole, UI-Icons                                      */
  /* ------------------------------------------------------------------ */
  const GLYPH = {
    0: ['###', '#.#', '#.#', '#.#', '###'],
    1: ['.#.', '##.', '.#.', '.#.', '###'],
    2: ['###', '..#', '###', '#..', '###'],
    3: ['###', '..#', '.##', '..#', '###'],
    4: ['#.#', '#.#', '###', '..#', '..#'],
    5: ['###', '#..', '###', '..#', '###'],
    6: ['###', '#..', '###', '#.#', '###'],
    7: ['###', '..#', '..#', '.#.', '.#.'],
    8: ['###', '#.#', '###', '#.#', '###'],
    9: ['###', '#.#', '###', '..#', '###'],
    B: ['##.', '#.#', '##.', '#.#', '##.'],
    D: ['##.', '#.#', '#.#', '#.#', '##.'],
    K: ['#.#', '#.#', '##.', '#.#', '#.#'],
    A: ['.#.', '#.#', '###', '#.#', '#.#']
  };
  const SUIT_ICON = {
    H: ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'],
    D: ['...#...', '..###..', '.#####.', '#######', '.#####.', '..###..', '...#...'],
    C: ['..###..', '..###..', '##.#.##', '#######', '##.#.##', '...#...', '..###..'],
    S: ['...#...', '..###..', '.#####.', '#######', '#######', '##.#.##', '..###..']
  };
  const TYPE_ICON = {
    monster: ['.###.', '#.#.#', '#####', '.###.', '.#.#.'],
    weapon: ['....#', '...#.', '#.#..', '.#...', '#.#..'],
    potion: ['.#.#.', '#####', '#####', '.###.', '..#..']
  };

  const ICONS = {
    heart: {
      rows: ['.rrr.rrr.', 'rrhrrrrrr', 'rhrrrrrrr', 'rrrrrrrrr', '.rrrrrrR.', '..rrrrR..', '...rRR...', '....R....'],
      pal: { r: '#e0394e', R: '#9e1c2a', h: '#ffb0b8' }
    },
    heartEmpty: {
      rows: ['.rrr.rrr.', 'rrrrrrrrr', 'rrrrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....'],
      pal: { r: '#3a2a3a' }
    },
    sword: {
      rows: ['......ll', '.....lsl', '....lsl.', '.y.lsl..', '..yyl...', '..ny....', '.n..y...', 'n.......'],
      pal: { l: '#eef4fa', s: '#9aaabb', y: '#e8b64a', n: '#9a6a3a' }
    },
    fist: {
      rows: ['.aaaa..', 'akakaka', 'aaaaaaa', 'kbbbaaa', 'abbbaaa', '.aaaaa.', '..aaa..'],
      pal: { a: '#e8b48a', b: '#c8906a', k: '#6a3a2a' }
    },
    skull: {
      rows: M(['..www', '.wwww', 'wwwww', 'wkkww', 'wkkww', 'wwwwk', '.wwww', '.wkwk', '..www']),
      pal: { w: '#efe6cf' }
    },
    door: {
      rows: ['.nnnnn.', 'nNNNNNn', 'nNnnnNn', 'nNnnnNn', 'nNnnyNn', 'nNnnnNn', 'nNnnnNn', 'nNNNNNn'],
      pal: { n: '#9a6a3a', N: '#5a3820', y: '#f2c03a' }
    },
    speaker: {
      rows: ['...w.....', '..ww..w..', 'wwww...w.', 'wwww.w.w.', 'wwww.w.w.', 'wwww...w.', '..ww..w..', '...w.....'],
      pal: { w: '#efe2c4' }
    },
    note: {
      rows: ['...wwwww', '...wwwww', '...w...w', '...w...w', '...w...w', '.www.www', 'www.www.'],
      pal: { w: '#efe2c4' }
    },
    menu: {
      rows: ['wwwwwww', '.......', 'wwwwwww', '.......', 'wwwwwww'],
      pal: { w: '#efe2c4' }
    }
  };

  // Fackel als Sprite-Sheet mit 3 Frames (je 7×14)
  const TORCH_FRAMES = [
    ['...y...', '..yy...', '..yoy..', '.yooy..', '.yorry.', '.yorry.', '..yry..'],
    ['....y..', '...yy..', '..yoy..', '..yooy.', '.yrroy.', '.yrroy.', '..yry..'],
    ['...y...', '...yy..', '..yoy..', '.yooy..', '.yorroy', '.yorry.', '..yry..']
  ];
  const TORCH_STICK = ['.ddddd.', '..ndn..', '...n...', '...n...', '...n...', '...n...', '...N...'];
  const TORCH_PAL = { y: '#ffe066', o: '#ff9a2a', r: '#e0402a', d: '#6a6a7a', n: '#7a4a2a', N: '#4a2a18' };

  /* ------------------------------------------------------------------ */
  /* Zeichenwerkzeuge                                                    */
  /* ------------------------------------------------------------------ */
  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return [c, x];
  }
  function px(ctx, x, y, col) { ctx.fillStyle = col; ctx.fillRect(x, y, 1, 1); }
  function mask(ctx, rows, ox, oy, col) {
    ctx.fillStyle = col;
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') ctx.fillRect(ox + x, oy + y, 1, 1); });
  }
  function text(ctx, str, ox, oy, col) {
    [...str].forEach((ch, i) => mask(ctx, GLYPH[ch], ox + i * 4, oy, col));
    return str.length * 4 - 1;
  }

  function sprite(rows, pal) {
    return { rows, pal: Object.assign({}, BASE, pal), w: Math.max(...rows.map(r => r.length)), h: rows.length };
  }

  // Zeichnet ein Sprite mit automatischem 1-px-Umriss (k-Pixel erzeugen keinen Umriss).
  function drawSprite(ctx, sp, ox, oy) {
    const { rows, pal, w, h } = sp;
    const at = (x, y) => (y < 0 || y >= h || x < 0) ? '.' : (rows[y][x] || '.');
    const solid = ch => ch !== '.';
    ctx.fillStyle = OUT;
    for (let y = -1; y <= h; y++) {
      for (let x = -1; x <= w; x++) {
        if (solid(at(x, y))) continue;
        const nb = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)];
        if (nb.some(c => solid(c) && c !== 'k')) ctx.fillRect(ox + x, oy + y, 1, 1);
      }
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const ch = at(x, y);
        if (solid(ch)) px(ctx, ox + x, oy + y, pal[ch] || '#ff00ff');
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Karten                                                              */
  /* ------------------------------------------------------------------ */
  const RANK_LABEL = { 11: 'B', 12: 'D', 13: 'K', 14: 'A' };
  const RANK_NAME = { 11: 'Bube', 12: 'Dame', 13: 'König', 14: 'Ass' };
  const SUIT_NAME = { C: 'Kreuz', S: 'Pik', D: 'Karo', H: 'Herz' };

  function defOf(card) {
    if (card.type === 'monster') return MONSTERS[card.rank];
    if (card.type === 'weapon') return WEAPONS[card.rank];
    return POTIONS.find(p => card.rank <= p.max);
  }

  function spriteOf(card) {
    const d = defOf(card);
    if (card.type === 'potion') return sprite(d.rows, Object.assign({}, POT_PAL, d.pal));
    const pal = Object.assign({}, d.pal, card.suit === 'S' ? d.alt : null);
    return sprite(d.rows, pal);
  }

  const SCENES = {
    C: { wall: ['#3a5444', '#46624f'], mortar: '#304538', floor: '#283a2f', edge: '#5a7c64' },
    S: { wall: ['#433f5c', '#514c6c'], mortar: '#36324c', floor: '#2c2842', edge: '#6a6590' },
    D: { glow: ['#323d4e', '#465670'] },
    H: { glow: ['#44222b', '#63323f'] }
  };

  function scene(ctx, card, x0, y0, w, h) {
    const sc = SCENES[card.suit];
    if (card.type === 'monster') {
      const floorTop = h - 6;
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
          let col;
          if (j > floorTop) col = (i + j) % 5 === 0 ? sc.mortar : sc.floor;
          else if (j === floorTop) col = sc.edge;
          else {
            const row = Math.floor(j / 5), by = j % 5, bx = (i + (row % 2) * 4) % 8;
            if (by === 4 || bx === 7) col = sc.mortar;
            else {
              const dx = (i - w / 2) / w, dy = (j - h * 0.4) / h;
              const t = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) * 2.1);
              col = t * 16 > BAYER[j & 3][i & 3] ? sc.wall[1] : sc.wall[0];
            }
          }
          px(ctx, x0 + i, y0 + j, col);
        }
      }
    } else {
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
          const dx = (i - w / 2) / w, dy = (j - h / 2) / h;
          const t = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) * 1.9);
          px(ctx, x0 + i, y0 + j, t * 16 > BAYER[j & 3][i & 3] ? sc.glow[1] : sc.glow[0]);
        }
      }
      // ein paar funkelnde Pixel
      const sparkle = card.type === 'weapon' ? '#8fb4d8' : '#ff8a9a';
      [[3, 4], [w - 5, 7], [5, h - 6], [w - 4, h - 4]].forEach(([i, j]) => px(ctx, x0 + i, y0 + j, sparkle));
    }
  }

  function frame(ctx, fill, hi, lo) {
    ctx.fillStyle = OUT;
    ctx.fillRect(1, 0, CW - 2, 1); ctx.fillRect(1, CH - 1, CW - 2, 1);
    ctx.fillRect(0, 1, 1, CH - 2); ctx.fillRect(CW - 1, 1, 1, CH - 2);
    ctx.fillStyle = fill; ctx.fillRect(1, 1, CW - 2, CH - 2);
    ctx.fillStyle = hi; ctx.fillRect(2, 1, CW - 4, 1); ctx.fillRect(1, 2, 1, CH - 4);
    ctx.fillStyle = lo; ctx.fillRect(2, CH - 2, CW - 4, 1); ctx.fillRect(CW - 2, 2, 1, CH - 4);
    ctx.fillStyle = OUT;
    [[1, 1], [CW - 2, 1], [1, CH - 2], [CW - 2, CH - 2]].forEach(([a, b]) => ctx.fillRect(a, b, 1, 1));
  }

  function drawFace(card) {
    const [cv, ctx] = canvas(CW, CH);
    frame(ctx, '#eadbb6', '#fff4d6', '#bca57a');
    const red = card.suit === 'H' || card.suit === 'D';
    const ink = red ? '#b8263a' : '#24172a';
    text(ctx, RANK_LABEL[card.rank] || String(card.rank), 3, 3, ink);
    mask(ctx, SUIT_ICON[card.suit], 24, card.suit === 'H' ? 3 : 2, ink);

    // Bildfenster (Elite-Karten mit Goldrahmen)
    const elite = card.rank >= 11 || card.rank === 10 && card.type !== 'monster';
    ctx.fillStyle = elite ? '#c8962e' : '#3b2a24';
    ctx.fillRect(3, 10, 28, 1); ctx.fillRect(3, 37, 28, 1);
    ctx.fillRect(3, 10, 1, 28); ctx.fillRect(30, 10, 1, 28);
    scene(ctx, card, 4, 11, 26, 26);

    const sp = spriteOf(card);
    const d = defOf(card);
    const ox = 4 + Math.floor((26 - sp.w) / 2);
    const grounded = card.type === 'monster' && !d.float;
    const oy = grounded ? 11 + 26 - 3 - sp.h : 11 + Math.floor((26 - sp.h) / 2);
    drawSprite(ctx, sp, ox, oy);

    // Fußzeile: Typ-Symbol und Zahlenwert
    mask(ctx, TYPE_ICON[card.type], 3, 39, ink);
    const v = String(card.rank);
    text(ctx, v, 31 - (v.length * 4 - 1), 39, ink);
    return cv;
  }

  function drawBack() {
    const [cv, ctx] = canvas(CW, CH);
    frame(ctx, '#5a1a26', '#7a2a36', '#3a0e18');
    for (let y = 4; y < CH - 4; y++) {
      for (let x = 4; x < CW - 4; x++) {
        if ((x + y) % 6 === 0 || (x - y + 60) % 6 === 0) px(ctx, x, y, '#6e2432');
      }
    }
    ctx.fillStyle = '#c8962e';
    ctx.fillRect(3, 3, CW - 6, 1); ctx.fillRect(3, CH - 4, CW - 6, 1);
    ctx.fillRect(3, 3, 1, CH - 6); ctx.fillRect(CW - 4, 3, 1, CH - 6);
    // Rautenplakette mit Totenkopf
    const cx = 17, cy = 23;
    for (let y = -9; y <= 9; y++) {
      for (let x = -9; x <= 9; x++) {
        const d = Math.abs(x) + Math.abs(y);
        if (d <= 9) px(ctx, cx + x - 1, cy + y, d === 9 ? '#c8962e' : '#3a0e18');
      }
    }
    const skull = sprite(ICONS.skull.rows, { w: '#e0b048', k: '#3a0e18' });
    drawSprite(ctx, skull, cx - 5, cy - 4);
    return cv;
  }

  function drawSlot() {
    const [cv, ctx] = canvas(CW, CH);
    const col = '#3b3146';
    for (let x = 2; x < CW - 2; x += 2) { px(ctx, x, 0, col); px(ctx, x, CH - 1, col); }
    for (let y = 2; y < CH - 2; y += 2) { px(ctx, 0, y, col); px(ctx, CW - 1, y, col); }
    ctx.fillStyle = 'rgba(20,14,26,0.55)';
    ctx.fillRect(1, 1, CW - 2, CH - 2);
    return cv;
  }

  function drawTile() {
    const [cv, ctx] = canvas(16, 16);
    let seed = 7;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const row = Math.floor(y / 8), by = y % 8, bx = (x + (row % 2) * 8) % 16;
        let col = '#17111d';
        if (by === 7 || bx === 15) col = '#0f0b13';
        else if (by === 0) col = '#1d1625';
        else if (rnd() < 0.08) col = '#1a1421';
        px(ctx, x, y, col);
      }
    }
    return cv;
  }

  function drawIcon(name) {
    const ic = ICONS[name];
    const sp = sprite(ic.rows, ic.pal);
    const [cv, ctx] = canvas(sp.w + 2, sp.h + 2);
    drawSprite(ctx, sp, 1, 1);
    return cv;
  }

  function drawTorchSheet() {
    const fw = 9, fh = 16;
    const [cv, ctx] = canvas(fw * 3, fh);
    TORCH_FRAMES.forEach((f, i) => {
      drawSprite(ctx, sprite(f, TORCH_PAL), i * fw + 1, 1);
      drawSprite(ctx, sprite(TORCH_STICK, TORCH_PAL), i * fw + 1, 8);
    });
    return cv;
  }

  /* ------------------------------------------------------------------ */
  const cache = new Map();
  const url = (key, fn) => {
    if (!cache.has(key)) cache.set(key, fn().toDataURL());
    return cache.get(key);
  };

  function info(card) {
    const d = defOf(card);
    const kind = card.type === 'monster' ? 'Monster' : card.type === 'weapon' ? 'Waffe' : 'Heiltrank';
    const rank = RANK_NAME[card.rank] || String(card.rank);
    return { name: d.name, kind, rank, suit: SUIT_NAME[card.suit], label: RANK_LABEL[card.rank] || String(card.rank) };
  }

  return {
    CW, CH,
    card: c => url('c' + c.suit + c.rank, () => drawFace(c)),
    back: () => url('back', drawBack),
    slot: () => url('slot', drawSlot),
    tile: () => url('tile', drawTile),
    torch: () => url('torch', drawTorchSheet),
    icon: name => url('i' + name, () => drawIcon(name)),
    iconSize: name => { const r = ICONS[name].rows; return [Math.max(...r.map(x => x.length)) + 2, r.length + 2]; },
    info
  };
})();
