/* Numera — screen flow + boot */
(function () {
  'use strict';

  const screens = {
    title: document.getElementById('screen-title'),
    map: document.getElementById('screen-map'),
    duel: document.getElementById('screen-duel'),
    clear: document.getElementById('screen-clear'),
  };

  function show(name) {
    Object.keys(screens).forEach((k) => {
      screens[k].classList.toggle('active', k === name);
    });
  }

  const pets = NumeraPets.createPetState();
  const petTray = document.getElementById('pet-tray');
  const mapFocusFill = document.getElementById('map-focus-fill');
  const mapToast = document.getElementById('map-toast');

  let map = null;
  let duel = null;
  let inEncounter = false;
  let focus = 0;

  function syncFocus(v) {
    focus = v;
    mapFocusFill.style.width = focus + '%';
  }

  function refreshPets() {
    NumeraPets.renderPetTray(petTray, pets);
  }

  function startMap() {
    show('map');
    refreshPets();
    const canvas = document.getElementById('world');
    if (map) map.stop();
    map = NumeraMap.createMap(canvas, {
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
      duel = NumeraDuel.createDuel({
        pets,
        onFocus: syncFocus,
        onWin(encounter) {
          if (map && encounter) map.markCleared(encounter.id);
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
    if (showClear || (map && map.allCleared())) {
      show('clear');
      return;
    }
    startMap();
  }

  document.getElementById('btn-start').addEventListener('click', () => {
    OperateAudio.unlock();
    OperateAudio.deal();
    inEncounter = false;
    startMap();
  });

  document.getElementById('btn-again').addEventListener('click', () => {
    startMap();
  });

  // Boot
  refreshPets();
  show('title');
})();
