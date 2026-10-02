/* Forgepath — hearts + FOCUS beads + pet tray (mock-aligned HUD) */
(function (global) {
  'use strict';

  const MAX_HEARTS = 5;
  const MAX_FOCUS_BEADS = 5;

  function hpToHearts(hp) {
    // 0–100 → 0–5 hearts (partial via CSS width on last)
    const filled = Math.max(0, Math.min(MAX_HEARTS, Math.ceil((hp / 100) * MAX_HEARTS)));
    const exact = Math.max(0, Math.min(MAX_HEARTS, (hp / 100) * MAX_HEARTS));
    return { filled, exact };
  }

  function focusToBeads(focus) {
    return Math.max(0, Math.min(MAX_FOCUS_BEADS, Math.round((focus / 100) * MAX_FOCUS_BEADS)));
  }

  function renderHearts(el, hp) {
    if (!el) return;
    const { exact } = hpToHearts(hp);
    el.innerHTML = '';
    el.setAttribute('aria-label', 'Hearts ' + Math.round(exact) + ' of ' + MAX_HEARTS);
    for (let i = 0; i < MAX_HEARTS; i++) {
      const h = document.createElement('span');
      h.className = 'heart';
      const frac = Math.max(0, Math.min(1, exact - i));
      if (frac >= 0.99) h.classList.add('full');
      else if (frac > 0.05) {
        h.classList.add('partial');
        h.style.setProperty('--fill', (frac * 100).toFixed(0) + '%');
      } else {
        h.classList.add('empty');
      }
      h.setAttribute('aria-hidden', 'true');
      el.appendChild(h);
    }
  }

  function renderFocusBeads(el, focus) {
    if (!el) return;
    const n = focusToBeads(focus);
    el.innerHTML = '';
    el.setAttribute('aria-label', 'Focus ' + n + ' of ' + MAX_FOCUS_BEADS);
    el.dataset.beads = String(n);
    for (let i = 0; i < MAX_FOCUS_BEADS; i++) {
      const b = document.createElement('span');
      b.className = 'focus-bead' + (i < n ? ' lit' : '');
      b.setAttribute('aria-hidden', 'true');
      el.appendChild(b);
    }
  }

  function renderPetTray(el, pets, opts) {
    if (!el) return;
    const limit = (opts && opts.limit) || 3;
    el.innerHTML = '';
    // Show equipped / first unlocked (max 3 like mocks), then locked slots
    const unlocked = pets.list.filter((p) => pets.isUnlocked(p.id) && p.party !== false);
    const show = unlocked.slice(0, limit);
    while (show.length < limit) show.push(null);
    for (const p of show) {
      const chip = document.createElement('div');
      chip.className = 'pet-slot' + (p ? ' filled' : ' empty');
      if (p) {
        chip.dataset.pet = p.id;
        chip.dataset.op = p.op;
        chip.title = p.name;
        chip.innerHTML =
          '<span class="pet-face" data-pet="' + p.id + '"></span>' +
          '<span class="pet-op">' + p.glyph + '</span>';
      } else {
        chip.innerHTML = '<span class="pet-face empty"></span>';
      }
      el.appendChild(chip);
    }
  }

  function syncAll(roots, hp, focus, pets) {
    const list = Array.isArray(roots) ? roots : [roots];
    for (const root of list) {
      if (!root) continue;
      renderHearts(root.querySelector('.hearts'), hp);
      renderFocusBeads(root.querySelector('.focus-beads'), focus);
      const tray = root.querySelector('.pet-tray');
      if (tray && pets) renderPetTray(tray, pets);
    }
  }

  global.ForgepathHud = {
    MAX_HEARTS,
    MAX_FOCUS_BEADS,
    renderHearts,
    renderFocusBeads,
    renderPetTray,
    syncAll,
    hpToHearts,
    focusToBeads,
  };
})(window);
