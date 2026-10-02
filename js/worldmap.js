/* ForgePath Prequel — Workshop Isles world map */
(function (global) {
  'use strict';

  const REGIONS = [
    { id: 'seed-grove', name: 'Seed Grove', icon: '🌱', mark: '✓', unlockAt: 0, hue: '#5aad6a' },
    { id: 'sprout-fields', name: 'Sprout Fields', icon: '🌻', mark: '+', unlockAt: 1, hue: '#7ec050' },
    { id: 'explorer-bridges', name: 'Explorer Bridges', icon: '🌉', mark: '÷', unlockAt: 2, hue: '#5a9ad4' },
    { id: 'adventurer-peaks', name: 'Adventurer Peaks', icon: '⛰', mark: 'Δ', unlockAt: 3, hue: '#8ec8e8' },
    { id: 'wizard-archives', name: 'Wizard Archives', icon: '📚', mark: '📖', unlockAt: 4, hue: '#9a70c8' },
    { id: 'alchemist-forge', name: 'Alchemist Forge', icon: '⚒', mark: '×', unlockAt: 5, hue: '#d07040' },
  ];

  function createWorldMap(root, opts) {
    let clearedCount = 0;
    let selected = 'seed-grove';

    function isUnlocked(r) {
      // Seed Grove always; next region unlocks when prior grove progress hits threshold
      // clearedCount = seed grove nodes cleared (0–6)
      if (r.id === 'seed-grove') return true;
      // After any clear → Sprout Fields tease; boss clear unlocks Bridges tease, etc.
      if (r.unlockAt === 1) return clearedCount >= 1;
      if (r.unlockAt === 2) return clearedCount >= 4; // mid+seeds
      if (r.unlockAt === 3) return clearedCount >= 6; // full grove
      return false; // later isles locked for this pass
    }

    function render() {
      root.innerHTML = '';
      root.classList.add('worldmap-root');

      const stage = document.createElement('div');
      stage.className = 'worldmap-stage';
      stage.style.backgroundImage = 'url(assets/bg/workshop-isles-map.jpg)';

      const nodes = document.createElement('div');
      nodes.className = 'worldmap-nodes';

      REGIONS.forEach((r, i) => {
        const unlocked = isUnlocked(r);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wm-node' + (unlocked ? ' unlocked' : ' locked') + (r.id === selected ? ' selected' : '');
        btn.dataset.region = r.id;
        btn.style.setProperty('--hue', r.hue);
        btn.style.setProperty('--i', String(i));
        btn.innerHTML =
          '<span class="wm-mark" style="background:' + r.hue + '">' +
          (unlocked ? (r.id === 'seed-grove' && clearedCount >= 6 ? '✓' : r.mark) : '🔒') +
          '</span>' +
          '<span class="wm-label">' + r.name + '</span>';
        btn.disabled = !unlocked;
        btn.title = unlocked ? r.name : 'Locked';
        btn.addEventListener('click', () => {
          if (!unlocked) return;
          selected = r.id;
          render();
          if (opts.onSelect) opts.onSelect(r);
        });
        nodes.appendChild(btn);
      });

      stage.appendChild(nodes);

      const scroll = document.createElement('div');
      scroll.className = 'worldmap-scroll';
      scroll.innerHTML = '<strong>Workshop Isles</strong><span>Knowledge Grows Here</span>';
      stage.appendChild(scroll);

      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'worldmap-back';
      back.textContent = '◀ Back';
      back.addEventListener('click', () => { if (opts.onBack) opts.onBack(); });
      stage.appendChild(back);

      root.appendChild(stage);
    }

    function setProgress(n) {
      clearedCount = n || 0;
      render();
    }

    function enterSelected() {
      const r = REGIONS.find((x) => x.id === selected);
      if (r && isUnlocked(r) && opts.onEnter) opts.onEnter(r);
    }

    render();
    return { render, setProgress, enterSelected, REGIONS };
  }

  global.ForgepathWorldMap = { createWorldMap, REGIONS };
})(window);
