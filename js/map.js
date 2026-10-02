/* Numera — Seed Grove overworld (canvas) */
(function (global) {
  'use strict';

  const TILE = 32;
  const COLS = 20;
  const ROWS = 12;

  // 0 grass, 1 path, 2 water, 3 bush, 4 rock
  const LAYOUT = [
    [3,3,0,0,0,0,2,2,2,0,0,0,0,0,3,3,0,0,0,3],
    [3,0,0,1,1,1,1,0,2,0,0,1,1,1,1,0,0,0,0,0],
    [0,0,1,1,0,0,1,0,2,2,0,1,0,0,1,1,1,0,0,0],
    [0,1,1,0,0,0,1,1,1,2,0,1,0,3,0,0,1,1,0,0],
    [0,1,0,0,3,0,0,0,1,1,1,1,0,0,0,0,0,1,1,0],
    [0,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,0],
    [0,0,1,1,1,1,0,3,0,0,0,0,0,0,1,1,1,1,1,0],
    [2,0,0,0,0,1,1,1,1,1,0,0,3,0,0,0,0,0,1,0],
    [2,2,0,0,0,0,0,0,0,1,1,1,1,1,0,0,4,0,1,0],
    [2,2,2,0,3,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0],
    [0,2,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,3,0,0,0,3],
  ];

  // Encounters: 4 seed nodes + mid unlock node + boss
  const NODES = [
    { id: 's1', x: 2, y: 3, kind: 'seed', label: 'Seedling', face: '🌱', hp: 100, band: 'seed', unlock: null },
    { id: 's2', x: 6, y: 1, kind: 'seed', label: 'Sproutlet', face: '🍀', hp: 100, band: 'seed', unlock: null },
    { id: 's3', x: 11, y: 2, kind: 'seed', label: 'Budkin', face: '🪴', hp: 100, band: 'seed', unlock: null },
    { id: 'mid', x: 8, y: 5, kind: 'mid', label: 'Thornling', face: '🌵', hp: 100, band: 'seed', unlock: 'producto' },
    { id: 's4', x: 14, y: 6, kind: 'seed', label: 'Leafkin', face: '🍃', hp: 100, band: 'seed', unlock: null },
    { id: 'boss', x: 16, y: 8, kind: 'boss', label: 'Grove Warden', face: '🌳', hp: 100, band: 'sprout', unlock: 'quotia' },
  ];

  const COLORS = {
    0: '#3a6b4e', // grass
    1: '#c4a574', // path
    2: '#3a7a9a', // water
    3: '#2a5538', // bush
    4: '#6a6a5a', // rock
  };

  function createMap(canvas, opts) {
    const ctx = canvas.getContext('2d');
    const W = COLS * TILE;
    const H = ROWS * TILE;
    canvas.width = W;
    canvas.height = H;

    const state = {
      px: 1.5,
      py: 5.5,
      target: null, // {x,y} click walk
      cleared: new Set(),
      facing: 1,
      bob: 0,
    };

    let last = performance.now();
    let keys = Object.create(null);
    let animId = 0;

    function tileAt(tx, ty) {
      if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return 4;
      return LAYOUT[ty][tx];
    }

    function walkable(tx, ty) {
      const t = tileAt(Math.floor(tx), Math.floor(ty));
      return t === 0 || t === 1;
    }

    function draw() {
      // ground
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const t = LAYOUT[y][x];
          ctx.fillStyle = COLORS[t];
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
          // subtle texture
          if (t === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.04)';
            if ((x + y) % 3 === 0) ctx.fillRect(x * TILE + 8, y * TILE + 10, 4, 4);
          }
          if (t === 2) {
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.fillRect(x * TILE, y * TILE + (Math.floor(state.bob / 8) % 2) * 2, TILE, 3);
          }
          if (t === 3) {
            ctx.fillStyle = '#4a8a5e';
            ctx.beginPath();
            ctx.ellipse(x * TILE + 16, y * TILE + 20, 10, 8, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          if (t === 4) {
            ctx.fillStyle = '#8a8a78';
            ctx.fillRect(x * TILE + 6, y * TILE + 10, 20, 14);
          }
        }
      }

      // soft vignette of region name area
      ctx.fillStyle = 'rgba(30,58,47,0.15)';
      ctx.fillRect(0, 0, W, H);

      // nodes
      for (const n of NODES) {
        const cx = n.x * TILE + TILE / 2;
        const cy = n.y * TILE + TILE / 2;
        const done = state.cleared.has(n.id);
        ctx.save();
        if (done) ctx.globalAlpha = 0.35;

        if (n.kind === 'boss') {
          ctx.fillStyle = '#c9a227';
          ctx.beginPath();
          star(ctx, cx, cy, 5, 12, 6);
          ctx.fill();
          ctx.strokeStyle = '#fff3c0';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          ctx.fillStyle = n.kind === 'mid' ? '#e8b86d' : '#78c090';
          ctx.beginPath();
          ctx.moveTo(cx, cy - 10);
          ctx.lineTo(cx + 9, cy);
          ctx.lineTo(cx, cy + 10);
          ctx.lineTo(cx - 9, cy);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // pulse ring if not cleared
        if (!done) {
          const pulse = 0.5 + 0.5 * Math.sin(state.bob / 12);
          ctx.strokeStyle = n.kind === 'boss'
            ? `rgba(201,162,39,${0.3 + pulse * 0.4})`
            : `rgba(120,192,144,${0.25 + pulse * 0.35})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 14 + pulse * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // player
      const px = state.px * TILE;
      const py = state.py * TILE + Math.sin(state.bob / 10) * 1.5;
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(px, py + 10, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // body
      ctx.fillStyle = '#f4e9c8';
      ctx.beginPath();
      ctx.arc(px, py - 2, 9, 0, Math.PI * 2);
      ctx.fill();
      // scarf / mark
      ctx.fillStyle = '#78c090';
      ctx.fillRect(px - 5, py + 4, 10, 5);
      // eye
      ctx.fillStyle = '#1e3a2f';
      ctx.beginPath();
      ctx.arc(px + state.facing * 3, py - 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    function star(c, x, y, spikes, outer, inner) {
      let rot = Math.PI / 2 * 3;
      const step = Math.PI / spikes;
      c.moveTo(x, y - outer);
      for (let i = 0; i < spikes; i++) {
        c.lineTo(x + Math.cos(rot) * outer, y + Math.sin(rot) * outer);
        rot += step;
        c.lineTo(x + Math.cos(rot) * inner, y + Math.sin(rot) * inner);
        rot += step;
      }
      c.lineTo(x, y - outer);
      c.closePath();
    }

    function tryMove(dx, dy) {
      const nx = state.px + dx;
      const ny = state.py + dy;
      // collision: check center + small radius
      const r = 0.28;
      if (
        walkable(nx - r, ny - r) &&
        walkable(nx + r, ny - r) &&
        walkable(nx - r, ny + r) &&
        walkable(nx + r, ny + r)
      ) {
        state.px = nx;
        state.py = ny;
        if (dx > 0.01) state.facing = 1;
        if (dx < -0.01) state.facing = -1;
        return true;
      }
      return false;
    }

    function checkEncounter() {
      for (const n of NODES) {
        if (state.cleared.has(n.id)) continue;
        const dx = state.px - (n.x + 0.5);
        const dy = state.py - (n.y + 0.5);
        if (dx * dx + dy * dy < 0.55 * 0.55) {
          return n;
        }
      }
      return null;
    }

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      state.bob += 1;

      let dx = 0, dy = 0;
      const speed = 3.2 * dt;
      if (keys.ArrowLeft || keys.a || keys.A) dx -= 1;
      if (keys.ArrowRight || keys.d || keys.D) dx += 1;
      if (keys.ArrowUp || keys.w || keys.W) dy -= 1;
      if (keys.ArrowDown || keys.s || keys.S) dy += 1;

      if (dx || dy) {
        state.target = null;
        const len = Math.hypot(dx, dy) || 1;
        tryMove((dx / len) * speed, (dy / len) * speed);
      } else if (state.target) {
        const tx = state.target.x - state.px;
        const ty = state.target.y - state.py;
        const dist = Math.hypot(tx, ty);
        if (dist < 0.08) {
          state.target = null;
        } else {
          const step = Math.min(speed, dist);
          tryMove((tx / dist) * step, (ty / dist) * step);
        }
      }

      draw();

      const enc = checkEncounter();
      if (enc && opts.onEncounter) {
        opts.onEncounter(enc);
        // nudge player back so we don't re-trigger instantly on return
        state.px -= 0.4 * Math.sign(state.px - (enc.x + 0.5) || 1);
        state.py -= 0.2;
        state.target = null;
      }

      animId = requestAnimationFrame(tick);
    }

    function canvasToWorld(e) {
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width / rect.width;
      const sy = canvas.height / rect.height;
      const cx = (e.clientX - rect.left) * sx;
      const cy = (e.clientY - rect.top) * sy;
      return { x: cx / TILE, y: cy / TILE };
    }

    function onPointer(e) {
      const w = canvasToWorld(e);
      // if clicking a node directly, walk toward it
      for (const n of NODES) {
        if (state.cleared.has(n.id)) continue;
        const dx = w.x - (n.x + 0.5);
        const dy = w.y - (n.y + 0.5);
        if (dx * dx + dy * dy < 0.7 * 0.7) {
          state.target = { x: n.x + 0.5, y: n.y + 0.5 };
          canvas.focus();
          return;
        }
      }
      if (walkable(w.x, w.y)) {
        state.target = { x: w.x, y: w.y };
      }
      canvas.focus();
    }

    function onKeyDown(e) {
      keys[e.key] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    }
    function onKeyUp(e) { keys[e.key] = false; }

    function start() {
      last = performance.now();
      canvas.addEventListener('pointerdown', onPointer);
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      animId = requestAnimationFrame(tick);
    }

    function stop() {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      keys = Object.create(null);
      state.target = null;
    }

    function markCleared(id) { state.cleared.add(id); }
    function isCleared(id) { return state.cleared.has(id); }
    function allCleared() {
      return NODES.every((n) => state.cleared.has(n.id));
    }
    function seedClearedCount() {
      return NODES.filter((n) => n.kind !== 'boss' && state.cleared.has(n.id)).length;
    }

    return {
      start, stop, markCleared, isCleared, allCleared, seedClearedCount,
      NODES, state,
    };
  }

  global.NumeraMap = { createMap, NODES, COLS, ROWS };
})(window);
