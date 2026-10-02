/* Numera — op-pets (Summo, Differentia, Producto, Quotia) */
(function (global) {
  'use strict';

  const PETS = [
    { id: 'summo', op: '+', symbol: '+', name: 'Summo', glyph: '+', hue: '#7ed99a', unlock: 'start' },
    { id: 'differentia', op: '-', symbol: '−', name: 'Differentia', glyph: '−', hue: '#7eb8e8', unlock: 'start' },
    { id: 'producto', op: '*', symbol: '×', name: 'Producto', glyph: '×', hue: '#e8b86d', unlock: 'mid' },
    { id: 'quotia', op: '/', symbol: '÷', name: 'Quotia', glyph: '÷', hue: '#d4a0e8', unlock: 'boss' },
  ];

  function createPetState() {
    const unlocked = new Set(['summo', 'differentia']);

    return {
      list: PETS,
      isUnlocked(id) { return unlocked.has(id); },
      unlock(id) {
        if (unlocked.has(id)) return false;
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
        return PETS.filter((p) => unlocked.has(p.id)).map((p) => p.op);
      },
      petForOp(op) {
        return PETS.find((p) => p.op === op) || null;
      },
      unlockedIds() { return [...unlocked]; },
    };
  }

  function renderPetTray(el, pets) {
    if (!el) return;
    el.innerHTML = '';
    for (const p of pets.list) {
      const chip = document.createElement('div');
      chip.className = 'pet-chip' + (pets.isUnlocked(p.id) ? ' unlocked' : '');
      chip.dataset.op = p.op;
      chip.dataset.pet = p.id;
      chip.title = pets.isUnlocked(p.id) ? p.name : '???';
      chip.innerHTML = `<span class="pet-glyph">${p.glyph}</span>`;
      el.appendChild(chip);
    }
  }

  global.NumeraPets = { PETS, createPetState, renderPetTray };
})(window);
