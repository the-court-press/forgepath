/* Numera — OPERATE!-style tile duel screen */
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
      guardianHp: document.getElementById('guardian-hp'),
      guardianFace: document.getElementById('guardian-face'),
      guardianName: document.getElementById('guardian-name'),
      focusFill: document.getElementById('duel-focus-fill'),
      focusMeter: document.getElementById('duel-focus-meter'),
      undo: document.getElementById('undo-btn'),
      reset: document.getElementById('reset-btn'),
      flee: document.getElementById('btn-flee'),
      ret: document.getElementById('btn-return'),
    };

    let encounter = null;
    let hp = 100;
    let focus = 0;
    let dealStarted = 0;
    let active = false;

    function toast(msg) {
      els.toast.textContent = msg || '';
    }

    function setFocus(v) {
      focus = Math.max(0, Math.min(100, v));
      els.focusFill.style.width = focus + '%';
      els.focusMeter.setAttribute('aria-valuenow', Math.round(focus));
      if (opts.onFocus) opts.onFocus(focus);
    }

    function setHp(v) {
      hp = Math.max(0, Math.min(100, v));
      els.guardianHp.style.width = hp + '%';
    }

    function pickPuzzle(band, allowedOps) {
      const all = (global.OPERATE_PUZZLES || []).filter((p) => {
        if (p.band !== band) return false;
        // puzzle ops must be subset of allowed
        return (p.ops || []).every((op) => allowedOps.indexOf(op) >= 0);
      });
      // prefer puzzles that use only allowed ops; if band seed with only +/- many exist
      let pool = all.filter((p) => !usedKeys.has(OperateEngine.puzzleKey(p)));
      if (!pool.length) pool = all;
      if (!pool.length) {
        // fallback: any seed with ops ⊆ allowed
        const any = (global.OPERATE_PUZZLES || []).filter((p) =>
          (p.ops || []).every((op) => allowedOps.indexOf(op) >= 0)
        );
        pool = any.length ? any : (global.OPERATE_PUZZLES || []).slice(0, 20);
      }
      const p = pool[Math.floor(Math.random() * pool.length)];
      if (p) usedKeys.add(OperateEngine.puzzleKey(p));
      // clamp puzzle ops to currently unlocked pets
      return Object.assign({}, p, { ops: allowedOps.slice() });
    }

    function renderOps(allowedOps) {
      els.opBar.innerHTML = '';
      const pets = opts.pets;
      for (const pet of pets.list) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'op-btn';
        btn.dataset.op = pet.op;
        btn.setAttribute('aria-label', pet.name);
        const unlocked = pets.isUnlocked(pet.id);
        btn.disabled = !unlocked;
        btn.innerHTML = `<span>${pet.glyph}</span><span class="op-pet">${unlocked ? pet.name.slice(0, 3) : '·'}</span>`;
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
          toast(r.reason === 'div0' ? '…' : '');
        }
        if (r.state) renderTiles(r.state);
        return;
      }
      if (r.action === 'merge') {
        OperateAudio.merge();
        // small focus tick per merge
        setFocus(focus + 4);
        // cosmetic chip
        damageGuardian(8 + Math.floor(focus / 20));
      }
      if (r.state) renderTiles(r.state);
      if (r.win) onWin();
    }

    function damageGuardian(amt) {
      setHp(hp - amt);
      els.guardianFace.classList.remove('hurt');
      void els.guardianFace.offsetWidth;
      els.guardianFace.classList.add('hurt');
    }

    function onWin() {
      OperateAudio.win();
      const elapsed = (performance.now() - dealStarted) / 1000;
      // Focus charge from speed
      const bonus = elapsed < 20 ? 25 : elapsed < 45 ? 15 : 8;
      setFocus(focus + bonus);
      setHp(0);

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

    function begin(enc) {
      encounter = enc;
      active = true;
      hp = 100;
      setHp(100);
      els.win.hidden = true;
      els.guardianFace.textContent = enc.face || '🌿';
      els.guardianName.textContent = enc.label || 'Guardian';
      toast('');

      const allowed = opts.pets.allowedOps();
      // Boss uses sprout band if × unlocked, else seed
      let band = enc.band || 'seed';
      if (enc.kind === 'boss' && allowed.indexOf('*') >= 0) band = 'sprout';
      if (enc.kind === 'mid') band = 'seed';

      renderOps(allowed);
      const puzzle = pickPuzzle(band, allowed);
      if (!puzzle) {
        toast('No puzzle');
        return;
      }
      // For early seed with only +−, ensure we use seed puzzles
      const state = game.deal(puzzle);
      // Override ops on the live puzzle to allowed
      renderTiles(state);
      dealStarted = performance.now();
      OperateAudio.deal();
    }

    function end() {
      active = false;
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
      if (opts.onFlee) opts.onFlee(encounter);
    });
    els.ret.addEventListener('click', () => {
      if (opts.onReturn) opts.onReturn(encounter);
    });

    return {
      begin,
      end,
      setFocus,
      getFocus: () => focus,
      isActive: () => active,
    };
  }

  global.NumeraDuel = { createDuel };
})(window);
