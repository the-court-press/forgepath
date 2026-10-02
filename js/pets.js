/* Forgepath — op-pets / familiars */
(function (global) {
  'use strict';

  const PETS = [
    { id: 'summo',       op: '+', symbol: '+', name: 'Summo',       glyph: '+', hue: '#7ed99a', unlock: 'start',
      tagline: 'The Addition Familiar', blurb: 'Summo loves bringing things together.', party: true },
    { id: 'differentia', op: '-', symbol: '−', name: 'Differentia', glyph: '−', hue: '#7eb8e8', unlock: 'start',
      tagline: 'The Subtraction Familiar', blurb: 'Differentia finds what is left.', party: true },
    { id: 'producto',    op: '*', symbol: '×', name: 'Producto',    glyph: '×', hue: '#e8b86d', unlock: 'mid',
      tagline: 'The Multiplication Familiar', blurb: 'Producto stacks power in groups.', party: true },
    { id: 'quotia',      op: '/', symbol: '÷', name: 'Quotia',      glyph: '÷', hue: '#d4a0e8', unlock: 'boss',
      tagline: 'The Division Familiar', blurb: 'Quotia shares fairly among all.', party: true },
    // Locked stubs (concept targets) — not usable ops yet
    { id: 'potens',  op: '^', symbol: '^', name: 'Potens',  glyph: '^', hue: '#f0c060', unlock: 'locked',
      tagline: 'Exponents', blurb: 'Find a special place to befriend this familiar!', party: false, lockedHint: 'Find a special place to befriend this familiar!' },
    { id: 'radixa',  op: '√', symbol: '√', name: 'Radixa',  glyph: '√', hue: '#90d090', unlock: 'locked',
      tagline: 'Square Roots', blurb: 'Keep exploring to meet this familiar!', party: false, lockedHint: 'Keep exploring to meet this familiar!' },
    { id: 'negato',  op: '±', symbol: '−', name: 'Negato',  glyph: '−', hue: '#a090c0', unlock: 'locked',
      tagline: 'Negatives', blurb: 'A new friend awaits in a higher level!', party: false, lockedHint: 'A new friend awaits in a higher level!' },
  ];

  function createPetState() {
    const unlocked = new Set(['summo', 'differentia']);

    return {
      list: PETS,
      isUnlocked(id) { return unlocked.has(id); },
      unlock(id) {
        if (unlocked.has(id)) return false;
        const pet = PETS.find((p) => p.id === id);
        if (!pet || pet.unlock === 'locked') return false;
        unlocked.add(id);
        return true;
      },
      unlockByFlag(flag) {
        const gained = [];
        for (const p of PETS) {
          if (p.unlock === flag && !unlocked.has(p.id)) {
            unlocked.add(p.id);
            gained.push(p);
          }
        }
        return gained;
      },
      allowedOps() {
        return PETS.filter((p) => unlocked.has(p.id) && p.party !== false && '+-*/'.indexOf(p.op) >= 0)
          .map((p) => p.op);
      },
      petForOp(op) {
        return PETS.find((p) => p.op === op && p.party !== false) || null;
      },
      unlockedIds() { return [...unlocked]; },
      combatPets() {
        return PETS.filter((p) => p.party !== false);
      },
    };
  }

  function renderPetTray(el, pets) {
    if (global.ForgepathHud) {
      global.ForgepathHud.renderPetTray(el, pets);
      return;
    }
    if (!el) return;
    el.innerHTML = '';
    for (const p of pets.combatPets()) {
      const chip = document.createElement('div');
      chip.className = 'pet-slot' + (pets.isUnlocked(p.id) ? ' filled' : ' empty');
      chip.dataset.op = p.op;
      chip.dataset.pet = p.id;
      chip.title = pets.isUnlocked(p.id) ? p.name : '???';
      chip.innerHTML = pets.isUnlocked(p.id)
        ? '<span class="pet-face" data-pet="' + p.id + '"></span><span class="pet-op">' + p.glyph + '</span>'
        : '<span class="pet-face empty"></span>';
      el.appendChild(chip);
    }
  }

  function renderFamiliarsMenu(el, pets, selectedId) {
    if (!el) return;
    const unlockedRow = pets.list.filter((p) => p.party !== false);
    const lockedRow = pets.list.filter((p) => p.unlock === 'locked');
    const sel = selectedId || unlockedRow.find((p) => pets.isUnlocked(p.id))?.id || unlockedRow[0].id;
    const selected = pets.list.find((p) => p.id === sel) || unlockedRow[0];

    el.innerHTML = '';

    const shell = document.createElement('div');
    shell.className = 'fam-shell';

    // sidebar
    const side = document.createElement('aside');
    side.className = 'fam-side';
    side.innerHTML = [
      '<button type="button" class="fam-tab active" data-tab="familiars" title="Familiars">🐾</button>',
      '<button type="button" class="fam-tab" data-tab="items" title="Items" disabled>🎒</button>',
      '<button type="button" class="fam-tab" data-tab="map" title="Map" id="fam-tab-map">🗺</button>',
      '<button type="button" class="fam-tab" data-tab="progress" title="Progress" disabled>📊</button>',
      '<button type="button" class="fam-tab" data-tab="settings" title="Settings" disabled>⚙</button>',
    ].join('');
    shell.appendChild(side);

    const main = document.createElement('div');
    main.className = 'fam-main';
    main.innerHTML = '<h2 class="fam-title">My Familiars</h2>';

    const grid = document.createElement('div');
    grid.className = 'fam-grid';

    function card(p, locked) {
      const c = document.createElement('button');
      c.type = 'button';
      c.className = 'fam-card' + (locked || !pets.isUnlocked(p.id) ? ' locked' : '') + (p.id === sel ? ' selected' : '');
      c.dataset.pet = p.id;
      if (locked || !pets.isUnlocked(p.id)) {
        c.innerHTML =
          '<span class="fam-sil" data-pet="' + p.id + '"></span>' +
          '<span class="fam-lock">🔒</span>' +
          '<span class="fam-name">' + p.name + '</span>' +
          '<span class="fam-hint">' + (p.lockedHint || '???') + '</span>';
      } else {
        c.innerHTML =
          '<span class="fam-art" data-pet="' + p.id + '"></span>' +
          '<span class="fam-name">' + p.name + '</span>' +
          '<span class="fam-glyph" style="color:' + p.hue + '">' + p.glyph + '</span>';
      }
      return c;
    }

    const row1 = document.createElement('div');
    row1.className = 'fam-row';
    unlockedRow.forEach((p) => row1.appendChild(card(p, !pets.isUnlocked(p.id))));
    const row2 = document.createElement('div');
    row2.className = 'fam-row fam-row-locked';
    lockedRow.forEach((p) => row2.appendChild(card(p, true)));
    grid.appendChild(row1);
    grid.appendChild(row2);
    main.appendChild(grid);

    const detail = document.createElement('div');
    detail.className = 'fam-detail';
    const isLocked = selected.unlock === 'locked' || !pets.isUnlocked(selected.id);
    detail.innerHTML =
      '<div class="fam-portrait" data-pet="' + selected.id + '"></div>' +
      '<h3>' + selected.name + (isLocked ? '' : ': ' + selected.tagline) + '</h3>' +
      '<p class="fam-blurb">' + (isLocked ? (selected.lockedHint || '…') : selected.blurb) + '</p>' +
      (isLocked
        ? '<button type="button" class="fam-equip" disabled>Locked</button>'
        : '<button type="button" class="fam-equip equipped">Equipped</button>');
    main.appendChild(detail);

    const foot = document.createElement('div');
    foot.className = 'fam-foot';
    foot.innerHTML = '<span class="pad-hint b">B Close</span><span class="pad-hint a">A View</span>';
    main.appendChild(foot);

    shell.appendChild(main);
    el.appendChild(shell);

    return { selectedId: sel, shell };
  }

  global.ForgepathPets = { PETS, createPetState, renderPetTray, renderFamiliarsMenu };
})(window);
