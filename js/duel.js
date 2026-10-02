/* Forgepath — OPERATE!-style tile duel
   Player HP + Focus (hearts / beads); pets unlock ops only. */
(function (global) {
  'use strict';

  function createDuel(opts) {
    const game = OperateEngine.createGame();
    const usedKeys = new Set();

    const els = {
      board: document.getElementById('tile-board'),
      opBar: document.getElementById('op-bar'),
      target: document.getElementById('target-value'),
      toast: document.getElementById('duel-toast'),
      win: document.getElementById('win-panel'),
      winMsg: document.getElementById('win-msg'),
      winUnlock: document.getElementById('win-unlock'),
      playerHp: document.getElementById('player-hp'),
      playerHpMeter: document.getElementById('player-hp-meter'),
      guardianFace: document.getElementById('guardian-face'),
      guardianName: document.getElementById('guardian-name'),
      pressureFill: document.getElementById('guardian-pressure'),
      pressureMeter: document.getElementById('guardian-pressure-meter'),
      focusFill: document.getElementById('duel-focus-fill'),
      focusMeter: document.getElementById('duel-focus-meter'),
      duelHearts: document.getElementById('duel-hearts'),
      duelBeads: document.getElementById('duel-focus-beads'),
      duelTray: document.getElementById('duel-pet-tray'),
      stage: document.getElementById('duel-stage'),
      undo: document.getElementById('undo-btn'),
      reset: document.getElementById('reset-btn'),
      flee: document.getElementById('btn-flee'),
      ret: document.getElementById('btn-return'),
    };

    let encounter = null;
    let playerHp = 100;
    let pressure = 0;
    let focus = 0;
    let dealStarted = 0;
    let lastMergeAt = 0;
    let active = false;
    let pressureTimer = null;

    function toast(msg) {
      els.toast.textContent = msg || '';
    }

    function syncHud() {
      if (global.ForgepathHud) {
        ForgepathHud.renderHearts(els.duelHearts, playerHp);
        ForgepathHud.renderFocusBeads(els.duelBeads, focus);
        if (els.duelTray && opts.pets) ForgepathHud.renderPetTray(els.duelTray, opts.pets);
      }
      if (els.playerHp) els.playerHp.style.width = playerHp + '%';
      if (els.playerHpMeter) els.playerHpMeter.setAttribute('aria-valuenow', Math.round(playerHp));
      if (els.focusFill) els.focusFill.style.width = focus + '%';
      if (els.focusMeter) els.focusMeter.setAttribute('aria-valuenow', Math.round(focus));
    }

    function setFocus(v) {
      focus = Math.max(0, Math.min(100, v));
      syncHud();
      if (opts.onFocus) opts.onFocus(focus);
    }

    function setPlayerHp(v) {
      playerHp = Math.max(0, Math.min(100, v));
      syncHud();
      if (opts.onHp) opts.onHp(playerHp);
    }

    function setPressure(v) {
      pressure = Math.max(0, Math.min(100, v));
      if (els.pressureFill) els.pressureFill.style.width = pressure + '%';
      if (els.pressureMeter) {
        els.pressureMeter.setAttribute('aria-valuenow', Math.round(pressure));
      }
    }

    function pulseGuardian() {
      els.guardianFace.classList.remove('hurt');
      void els.guardianFace.offsetWidth;
      els.guardianFace.classList.add('hurt');
    }

    function damagePlayer(amt, reason) {
      if (!active || playerHp <= 0) return;
      setPlayerHp(playerHp - amt);
      pulseGuardian();
      if (reason) toast(reason);
      if (playerHp <= 0) onDefeat();
    }

    function pickPuzzle(band, allowedOps) {
      const all = (global.OPERATE_PUZZLES || []).filter((p) => {
        if (p.band !== band) return false;
        return (p.ops || []).every((op) => allowedOps.indexOf(op) >= 0);
      });
      let pool = all.filter((p) => !usedKeys.has(OperateEngine.puzzleKey(p)));
      if (!pool.length) pool = all;
      if (!pool.length) {
        const any = (global.OPERATE_PUZZLES || []).filter((p) =>
          (p.ops || []).every((op) => allowedOps.indexOf(op) >= 0)
        );
        pool = any.length ? any : (global.OPERATE_PUZZLES || []).slice(0, 20);
      }
      const p = pool[Math.floor(Math.random() * pool.length)];
      if (p) usedKeys.add(OperateEngine.puzzleKey(p));
      return Object.assign({}, p, { ops: allowedOps.slice() });
    }

    function renderOps(allowedOps) {
      els.opBar.innerHTML = '';
      const pets = opts.pets;
      for (const pet of pets.combatPets()) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'op-btn';
        btn.dataset.op = pet.op;
        btn.setAttribute('aria-label', pet.name + ' (support)');
        const unlocked = pets.isUnlocked(pet.id);
        btn.disabled = !unlocked;
        btn.innerHTML = '<span>' + pet.glyph + '</span><span class="op-pet">' + (unlocked ? pet.name.slice(0, 3) : '·') + '</span>';
        if (unlocked) {
          btn.addEventListener('click', () => {
            OperateAudio.unlock();
            const r = game.setOp(pet.op);
            if (r.ok && r.action === 'arm') OperateAudio.armOp();
            handleResult(r);
          });
        }
        els.opBar.appendChild(btn);
      }
      highlightArmed(null);
    }

    function highlightArmed(op) {
      els.opBar.querySelectorAll('.op-btn').forEach((b) => {
        b.classList.toggle('armed', b.dataset.op === op);
      });
    }

    function renderTiles(state) {
      els.board.innerHTML = '';
      for (const t of state.tiles) {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'tile' + (state.selected.indexOf(t.id) >= 0 ? ' selected' : '');
        el.textContent = OperateEngine.prettyNum(t.value);
        el.setAttribute('role', 'listitem');
        el.addEventListener('click', () => {
          OperateAudio.unlock();
          const r = game.toggleSelect(t.id);
          if (r.ok && r.action === 'select') OperateAudio.select();
          handleResult(r);
        });
        els.board.appendChild(el);
      }
      els.target.textContent = OperateEngine.prettyNum(state.target);
      highlightArmed(state.armedOp);
    }

    function handleResult(r) {
      if (!r) return;
      if (!r.ok) {
        if (r.reason === 'div0' || r.reason === 'op-not-allowed') {
          OperateAudio.error();
          damagePlayer(10, '…');
          setPressure(pressure + 12);
        }
        if (r.state) renderTiles(r.state);
        return;
      }
      if (r.action === 'merge') {
        OperateAudio.merge();
        setFocus(focus + 4);
        lastMergeAt = performance.now();
        setPressure(pressure + 10 + Math.floor(focus / 25));
        pulseGuardian();
      }
      if (r.state) renderTiles(r.state);
      if (r.win) onWin();
    }

    function onWin() {
      clearPressureTimer();
      OperateAudio.win();
      const elapsed = (performance.now() - dealStarted) / 1000;
      const bonus = elapsed < 20 ? 25 : elapsed < 45 ? 15 : 8;
      setFocus(focus + bonus);
      setPressure(100);

      let unlockMsg = '';
      if (encounter && encounter.unlock === 'producto') {
        const gained = opts.pets.unlock('producto');
        if (gained) unlockMsg = 'Producto  ×  unlocked';
      }
      if (encounter && encounter.unlock === 'quotia') {
        const gained = opts.pets.unlock('quotia');
        if (gained) unlockMsg = 'Quotia  ÷  unlocked';
      }

      els.winMsg.textContent = encounter && encounter.kind === 'boss' ? 'Warden falls!' : 'Clear!';
      if (unlockMsg) {
        els.winUnlock.hidden = false;
        els.winUnlock.textContent = unlockMsg;
      } else {
        els.winUnlock.hidden = true;
      }
      els.win.hidden = false;
      active = false;
      if (opts.onWin) opts.onWin(encounter);
    }

    function onDefeat() {
      clearPressureTimer();
      active = false;
      OperateAudio.error();
      toast('Focus slips…');
      setTimeout(() => {
        if (opts.onFlee) opts.onFlee(encounter);
      }, 700);
    }

    function clearPressureTimer() {
      if (pressureTimer) {
        clearInterval(pressureTimer);
        pressureTimer = null;
      }
    }

    function startPressureTimer() {
      clearPressureTimer();
      pressureTimer = setInterval(() => {
        if (!active) return;
        const idle = (performance.now() - lastMergeAt) / 1000;
        if (idle >= 12) {
          setPressure(pressure + 8);
          damagePlayer(6, '');
          lastMergeAt = performance.now();
        } else if (idle >= 6) {
          setPressure(pressure + 4);
          pulseGuardian();
        }
      }, 2000);
    }

    function begin(enc) {
      encounter = enc;
      active = true;
      setPlayerHp(typeof opts.getHp === 'function' ? opts.getHp() : 100);
      setPressure(0);
      els.win.hidden = true;
      if (els.stage) {
        els.stage.classList.toggle('is-boss', enc.kind === 'boss');
      }
      // CSS golem art stays; label updates
      els.guardianName.textContent = enc.label || 'Guardian';
      toast('');

      const allowed = opts.pets.allowedOps();
      let band = enc.band || 'seed';
      if (enc.kind === 'boss' && allowed.indexOf('*') >= 0) band = 'sprout';
      if (enc.kind === 'mid') band = 'seed';

      renderOps(allowed);
      syncHud();
      const puzzle = pickPuzzle(band, allowed);
      if (!puzzle) {
        toast('No puzzle');
        return;
      }
      const state = game.deal(puzzle);
      renderTiles(state);
      dealStarted = performance.now();
      lastMergeAt = dealStarted;
      OperateAudio.deal();
      startPressureTimer();
    }

    function end() {
      active = false;
      clearPressureTimer();
      els.win.hidden = true;
    }

    els.undo.addEventListener('click', () => {
      const r = game.undo();
      handleResult(r);
    });
    els.reset.addEventListener('click', () => {
      const r = game.reset();
      setFocus(focus - 5);
      handleResult(r);
      OperateAudio.deal();
    });
    els.flee.addEventListener('click', () => {
      clearPressureTimer();
      if (opts.onFlee) opts.onFlee(encounter);
    });
    els.ret.addEventListener('click', () => {
      clearPressureTimer();
      if (opts.onReturn) opts.onReturn(encounter);
    });

    function pressA() {
      if (!els.win.hidden) {
        els.ret.click();
        return true;
      }
      return false;
    }

    function pressB() {
      if (!els.win.hidden) return false;
      if (active) {
        els.undo.click();
        return true;
      }
      return false;
    }

    return {
      begin,
      end,
      setFocus,
      getFocus: () => focus,
      setPlayerHp,
      getPlayerHp: () => playerHp,
      isActive: () => active,
      pressA,
      pressB,
      syncHud,
    };
  }

  global.ForgepathDuel = { createDuel };
})(window);
