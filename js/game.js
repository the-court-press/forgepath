/* Forgepath — screen flow + pad + familiars + world map */
(function () {
  'use strict';

  const screens = {
    title: document.getElementById('screen-title'),
    map: document.getElementById('screen-map'),
    world: document.getElementById('screen-world'),
    duel: document.getElementById('screen-duel'),
    familiars: document.getElementById('screen-familiars'),
    clear: document.getElementById('screen-clear'),
  };

  const gamePad = document.getElementById('game-pad');
  let currentScreen = 'title';
  let returnScreen = 'map';

  function show(name) {
    currentScreen = name;
    Object.keys(screens).forEach((k) => {
      screens[k].classList.toggle('active', k === name);
    });
    if (gamePad) {
      gamePad.hidden = !(name === 'map' || name === 'duel' || name === 'world' || name === 'familiars');
    }
  }

  const pets = ForgepathPets.createPetState();
  const mapToast = document.getElementById('map-toast');

  let map = null;
  let duel = null;
  let worldMap = null;
  let inEncounter = false;
  let focus = 0;
  let playerHp = 100;
  let famSelected = 'summo';

  function hudRoots() {
    return [
      document.getElementById('map-hud'),
      document.getElementById('world-hud'),
      document.getElementById('fam-hud'),
      document.getElementById('duel-hud'),
    ];
  }

  function syncHud() {
    ForgepathHud.syncAll(hudRoots(), playerHp, focus, pets);
  }

  function syncFocus(v) {
    focus = v;
    syncHud();
  }

  function syncHp(v) {
    playerHp = v;
    syncHud();
  }

  function partyPetIds() {
    return pets.combatPets().filter((p) => pets.isUnlocked(p.id)).map((p) => p.id).slice(0, 3);
  }

  function openFamiliars() {
    returnScreen = currentScreen === 'familiars' ? returnScreen : currentScreen;
    if (returnScreen === 'duel') returnScreen = 'map';
    show('familiars');
    const mount = document.getElementById('familiars-mount');
    ForgepathPets.renderFamiliarsMenu(mount, pets, famSelected);
    syncHud();
    mount.querySelectorAll('.fam-card').forEach((card) => {
      card.addEventListener('click', () => {
        famSelected = card.dataset.pet;
        openFamiliars();
      });
    });
    const mapTab = mount.querySelector('#fam-tab-map');
    if (mapTab) {
      mapTab.disabled = false;
      mapTab.addEventListener('click', () => openWorldMap());
    }
  }

  function closeFamiliars() {
    if (returnScreen === 'world') openWorldMap();
    else startMap();
  }

  function openWorldMap() {
    returnScreen = 'map';
    show('world');
    const mount = document.getElementById('worldmap-mount');
    if (!worldMap) {
      worldMap = ForgepathWorldMap.createWorldMap(mount, {
        onBack() { startMap(); },
        onSelect(r) {
          if (r.id === 'seed-grove') startMap();
          else if (mapToast) {
            /* soft toast via region pill */
          }
        },
        onEnter(r) {
          if (r.id === 'seed-grove') startMap();
        },
      });
    } else {
      worldMap.render();
    }
    const n = map ? map.clearedCount() : 0;
    worldMap.setProgress(n);
    syncHud();
  }

  function startMap() {
    show('map');
    syncHud();
    const canvas = document.getElementById('world');
    if (map) map.stop();
    map = ForgepathMap.createMap(canvas, {
      getPets: partyPetIds,
      onEncounter(enc) {
        if (inEncounter) return;
        inEncounter = true;
        map.stop();
        enterDuel(enc);
      },
    });
    map.start();
    canvas.focus();
    if (mapToast) mapToast.textContent = '';
  }

  function enterDuel(enc) {
    show('duel');
    if (!duel) {
      duel = ForgepathDuel.createDuel({
        pets,
        onFocus: syncFocus,
        onHp: syncHp,
        getHp: () => playerHp,
        onWin(encounter) {
          if (map && encounter) map.markCleared(encounter.id);
          syncHp(Math.min(100, playerHp + 15));
          syncHud();
        },
        onFlee() {
          leaveDuel(false);
        },
        onReturn(encounter) {
          const wasBoss = encounter && encounter.kind === 'boss';
          leaveDuel(wasBoss && map && map.isCleared(encounter.id));
        },
      });
    }
    duel.setFocus(focus);
    duel.begin(enc);
    syncHud();
  }

  function leaveDuel(showClear) {
    inEncounter = false;
    if (duel) duel.end();
    if (playerHp <= 0) syncHp(40);
    if (showClear || (map && map.allCleared())) {
      show('clear');
      return;
    }
    startMap();
  }

  function bindPadHold(el, onDown, onUp) {
    if (!el) return;
    const down = (e) => {
      e.preventDefault();
      el.classList.add('is-down');
      onDown();
    };
    const up = () => {
      el.classList.remove('is-down');
      if (onUp) onUp();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointerleave', up);
    el.addEventListener('pointercancel', up);
  }

  document.querySelectorAll('.dpad-btn[data-dir]').forEach((btn) => {
    const dir = btn.dataset.dir;
    bindPadHold(btn, () => {
      if (map && currentScreen === 'map') map.setPad(dir, true);
    }, () => {
      if (map) map.setPad(dir, false);
    });
  });

  const padA = document.getElementById('pad-a');
  const padB = document.getElementById('pad-b');
  const padStart = document.getElementById('pad-start');
  const padSelect = document.getElementById('pad-select');

  if (padA) {
    padA.addEventListener('click', (e) => {
      e.preventDefault();
      OperateAudio.unlock();
      if (currentScreen === 'map' && map) map.interactNearest();
      else if (currentScreen === 'duel' && duel) duel.pressA();
      else if (currentScreen === 'world' && worldMap) worldMap.enterSelected();
      else if (currentScreen === 'familiars') { /* view already selected */ }
      else if (currentScreen === 'title') document.getElementById('btn-start').click();
      else if (currentScreen === 'clear') document.getElementById('btn-again').click();
    });
  }

  if (padB) {
    padB.addEventListener('click', (e) => {
      e.preventDefault();
      OperateAudio.unlock();
      if (currentScreen === 'familiars') closeFamiliars();
      else if (currentScreen === 'world') startMap();
      else if (currentScreen === 'duel' && duel) {
        if (!duel.pressB()) document.getElementById('btn-flee').click();
      } else if (currentScreen === 'map' && map) {
        map.cancelMove();
      }
    });
  }

  // Start → Workshop Isles world map (from grove) / flee duel
  if (padStart) {
    padStart.addEventListener('click', (e) => {
      e.preventDefault();
      OperateAudio.unlock();
      if (currentScreen === 'duel') document.getElementById('btn-flee').click();
      else if (currentScreen === 'map' || currentScreen === 'familiars') openWorldMap();
      else if (currentScreen === 'world') startMap();
      else if (currentScreen === 'title') document.getElementById('btn-start').click();
    });
  }

  // Select → My Familiars
  if (padSelect) {
    padSelect.addEventListener('click', (e) => {
      e.preventDefault();
      OperateAudio.unlock();
      if (currentScreen === 'familiars') closeFamiliars();
      else if (currentScreen === 'duel') {
        // flash tray only in duel (don't leave fight mid-puzzle)
        if (duel) duel.syncHud();
        const tray = document.getElementById('duel-pet-tray');
        if (tray) {
          tray.classList.add('pets-flash');
          setTimeout(() => tray.classList.remove('pets-flash'), 900);
        }
      } else {
        openFamiliars();
      }
    });
  }

  document.getElementById('btn-start').addEventListener('click', () => {
    OperateAudio.unlock();
    OperateAudio.deal();
    inEncounter = false;
    syncHp(100);
    startMap();
  });

  document.getElementById('btn-again').addEventListener('click', () => {
    startMap();
  });

  const btnWorld = document.getElementById('btn-world-map');
  if (btnWorld) btnWorld.addEventListener('click', () => openWorldMap());

  syncHud();
  show('title');
})();
