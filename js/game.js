/* Forgepath — screen flow + boot + on-screen pad */
(function () {
  'use strict';

  const screens = {
    title: document.getElementById('screen-title'),
    map: document.getElementById('screen-map'),
    duel: document.getElementById('screen-duel'),
    clear: document.getElementById('screen-clear'),
  };

  const gamePad = document.getElementById('game-pad');
  let currentScreen = 'title';

  function show(name) {
    currentScreen = name;
    Object.keys(screens).forEach((k) => {
      screens[k].classList.toggle('active', k === name);
    });
    // Pad on map + duel; hide on title/clear
    if (gamePad) gamePad.hidden = !(name === 'map' || name === 'duel');
  }

  const pets = ForgepathPets.createPetState();
  const petTray = document.getElementById('pet-tray');
  const mapFocusFill = document.getElementById('map-focus-fill');
  const mapHpFill = document.getElementById('map-hp-fill');
  const mapToast = document.getElementById('map-toast');

  let map = null;
  let duel = null;
  let inEncounter = false;
  let focus = 0;
  let playerHp = 100;
  let petsHighlight = false;

  function syncFocus(v) {
    focus = v;
    mapFocusFill.style.width = focus + '%';
  }

  function syncHp(v) {
    playerHp = v;
    if (mapHpFill) mapHpFill.style.width = playerHp + '%';
  }

  function refreshPets() {
    ForgepathPets.renderPetTray(petTray, pets);
  }

  function flashPets() {
    // Select: focus support pets tray
    petsHighlight = true;
    if (petTray) {
      petTray.classList.add('pets-flash');
      setTimeout(() => petTray.classList.remove('pets-flash'), 900);
    }
    const unlocked = pets.list.filter((p) => pets.isUnlocked(p.id)).map((p) => p.name);
    if (mapToast && currentScreen === 'map') {
      mapToast.textContent = unlocked.length ? unlocked.join(' · ') : '…';
      setTimeout(() => { if (mapToast.textContent === unlocked.join(' · ')) mapToast.textContent = ''; }, 1600);
    }
    const duelToast = document.getElementById('duel-toast');
    if (duelToast && currentScreen === 'duel') {
      duelToast.textContent = unlocked.length ? unlocked.join(' · ') : '…';
      setTimeout(() => { if (duelToast.textContent === unlocked.join(' · ')) duelToast.textContent = ''; }, 1600);
    }
  }

  function startMap() {
    show('map');
    refreshPets();
    syncHp(playerHp);
    const canvas = document.getElementById('world');
    if (map) map.stop();
    map = ForgepathMap.createMap(canvas, {
      onEncounter(enc) {
        if (inEncounter) return;
        inEncounter = true;
        map.stop();
        enterDuel(enc);
      },
    });
    map.start();
    canvas.focus();
    mapToast.textContent = '';
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
          refreshPets();
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

  /* —— Pad wiring —— */
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
      if (currentScreen === 'map' && map) {
        map.interactNearest();
      } else if (currentScreen === 'duel' && duel) {
        duel.pressA();
      } else if (currentScreen === 'title') {
        document.getElementById('btn-start').click();
      } else if (currentScreen === 'clear') {
        document.getElementById('btn-again').click();
      }
    });
  }

  if (padB) {
    padB.addEventListener('click', (e) => {
      e.preventDefault();
      OperateAudio.unlock();
      if (currentScreen === 'duel' && duel) {
        if (!duel.pressB()) {
          // already undid or inactive — flee
          document.getElementById('btn-flee').click();
        }
      } else if (currentScreen === 'map' && map) {
        map.cancelMove();
      }
    });
  }

  // Start = pause / return to map (from duel) or soft pause toast on map
  if (padStart) {
    padStart.addEventListener('click', (e) => {
      e.preventDefault();
      OperateAudio.unlock();
      if (currentScreen === 'duel') {
        document.getElementById('btn-flee').click();
      } else if (currentScreen === 'map') {
        mapToast.textContent = '…';
        setTimeout(() => { if (mapToast.textContent === '…') mapToast.textContent = ''; }, 800);
      } else if (currentScreen === 'title') {
        document.getElementById('btn-start').click();
      }
    });
  }

  // Select = pets (show / flash support tray)
  if (padSelect) {
    padSelect.addEventListener('click', (e) => {
      e.preventDefault();
      OperateAudio.unlock();
      flashPets();
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

  // Boot
  refreshPets();
  syncHp(100);
  show('title');
})();
