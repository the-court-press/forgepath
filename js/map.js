/* ForgePath Prequel — Seed Grove overworld (richer canvas + concept BG) */
(function (global) {
  'use strict';

  const TILE = 32;
  const COLS = 20;
  const ROWS = 12;

  // 0 grass, 1 path, 2 water, 3 bush, 4 rock, 5 workshop, 6 bridge, 7 flower, 8 cliff
  const LAYOUT = [
    [8,8,3,0,0,0,2,2,2,0,0,7,0,0,3,3,0,8,8,8],
    [8,3,0,1,1,1,1,0,2,0,0,1,1,1,1,0,0,0,8,8],
    [3,0,1,1,0,5,5,0,2,2,0,1,0,0,1,1,1,0,0,8],
    [0,1,1,0,5,5,5,1,1,2,0,1,0,3,0,0,1,1,0,0],
    [0,1,0,0,3,0,1,0,1,1,1,1,0,0,7,0,0,1,1,0],
    [0,1,1,0,0,0,1,0,0,0,0,1,1,1,1,0,0,0,1,0],
    [7,0,1,1,1,1,6,6,0,0,0,0,0,0,1,1,1,1,1,7],
    [2,0,0,0,0,1,1,1,1,1,0,0,3,0,0,0,0,0,1,0],
    [2,2,0,7,0,0,0,0,0,1,1,1,1,1,0,0,4,0,1,0],
    [2,2,2,0,3,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0],
    [0,2,0,0,0,0,0,3,0,0,7,0,0,0,0,0,0,0,0,3],
    [0,0,0,7,0,0,0,0,0,3,3,0,0,0,0,3,0,7,0,3],
  ];

  const NODES = [
    { id: 's1', x: 2, y: 3, kind: 'seed', label: 'Seedling', face: '🌱', hp: 100, band: 'seed', unlock: null },
    { id: 's2', x: 6, y: 1, kind: 'seed', label: 'Sproutlet', face: '🍀', hp: 100, band: 'seed', unlock: null },
    { id: 's3', x: 11, y: 2, kind: 'seed', label: 'Budkin', face: '🪴', hp: 100, band: 'seed', unlock: null },
    { id: 'mid', x: 8, y: 5, kind: 'mid', label: 'Thornling', face: '🌵', hp: 100, band: 'seed', unlock: 'producto' },
    { id: 's4', x: 14, y: 6, kind: 'seed', label: 'Leafkin', face: '🍃', hp: 100, band: 'seed', unlock: null },
    { id: 'boss', x: 16, y: 8, kind: 'boss', label: 'Grove Warden', face: '🗿', hp: 100, band: 'sprout', unlock: 'quotia' },
  ];

  function createMap(canvas, opts) {
    const ctx = canvas.getContext('2d');
    const W = COLS * TILE;
    const H = ROWS * TILE;
    canvas.width = W;
    canvas.height = H;

    const bg = new Image();
    bg.src = 'assets/bg/seed-grove-overworld.jpg';
    let bgReady = false;
    bg.onload = () => { bgReady = true; };

    const state = {
      px: 1.5,
      py: 5.5,
      target: null,
      cleared: new Set(),
      facing: 1,
      bob: 0,
      pets: (opts && opts.getPets) ? opts.getPets() : ['summo', 'differentia'],
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
      return t === 0 || t === 1 || t === 6 || t === 7;
    }

    function drawTree(x, y) {
      ctx.fillStyle = '#3a6a40';
      ctx.beginPath();
      ctx.ellipse(x, y, 14, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2a5030';
      ctx.fillRect(x - 3, y + 6, 6, 10);
      ctx.fillStyle = '#5a9a58';
      ctx.beginPath();
      ctx.ellipse(x - 4, y - 4, 8, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawWorkshop(tx, ty) {
      const x = tx * TILE;
      const y = ty * TILE;
      // stone base
      ctx.fillStyle = '#8a8a7a';
      ctx.fillRect(x + 4, y + 8, TILE * 2 - 8, TILE * 2 - 4);
      // roof
      ctx.fillStyle = '#2a6a68';
      ctx.beginPath();
      ctx.moveTo(x, y + 10);
      ctx.lineTo(x + TILE, y - 4);
      ctx.lineTo(x + TILE * 2, y + 10);
      ctx.closePath();
      ctx.fill();
      // door glow
      ctx.fillStyle = '#f0c060';
      ctx.fillRect(x + TILE - 6, y + TILE + 4, 12, 16);
      // chimney smoke
      ctx.fillStyle = 'rgba(200,200,200,0.35)';
      const sy = y - 8 - (state.bob % 20) * 0.4;
      ctx.beginPath();
      ctx.ellipse(x + TILE * 1.5, sy, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // banner
      ctx.fillStyle = '#c4a060';
      ctx.fillRect(x + TILE - 10, y + 12, 20, 10);
      ctx.fillStyle = '#3a3a3a';
      ctx.font = '8px monospace';
      ctx.fillText('⚒', x + TILE - 5, y + 20);
    }

    function drawHero(px, py) {
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(px, py + 12, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // tunic body
      ctx.fillStyle = '#3a9a58';
      ctx.fillRect(px - 6, py - 2, 12, 14);
      // head
      ctx.fillStyle = '#f0d0a8';
      ctx.beginPath();
      ctx.arc(px, py - 6, 6, 0, Math.PI * 2);
      ctx.fill();
      // hat
      ctx.fillStyle = '#2a7a48';
      ctx.beginPath();
      ctx.moveTo(px - 7, py - 8);
      ctx.lineTo(px, py - 16);
      ctx.lineTo(px + 7, py - 8);
      ctx.closePath();
      ctx.fill();
      // backpack
      ctx.fillStyle = '#8a5a30';
      ctx.fillRect(px - state.facing * 8 - 2, py, 6, 8);
      // eye
      ctx.fillStyle = '#1e3a2f';
      ctx.fillRect(px + state.facing * 2, py - 7, 2, 2);
    }

    function drawPetFollower(id, px, py, idx) {
      const ox = -14 - idx * 12;
      const oy = 4 + Math.sin((state.bob + idx * 8) / 8) * 2;
      const x = px + ox * state.facing;
      const y = py + oy;
      const colors = {
        summo: '#f0f0f4',
        differentia: '#5a9ad4',
        producto: '#e8b84a',
        quotia: '#e0d8f0',
      };
      ctx.fillStyle = colors[id] || '#ccc';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e3a2f';
      ctx.font = 'bold 8px sans-serif';
      const g = { summo: '+', differentia: '−', producto: '×', quotia: '÷' }[id] || '';
      ctx.fillText(g, x - 3, y + 3);
    }

    function draw() {
      // concept BG (dimmed) under procedural tiles
      if (bgReady) {
        ctx.globalAlpha = 0.45;
        ctx.drawImage(bg, 0, 0, W, H);
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(30,58,47,0.35)';
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.fillStyle = '#1a3028';
        ctx.fillRect(0, 0, W, H);
      }

      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const t = LAYOUT[y][x];
          const px = x * TILE;
          const py = y * TILE;
          if (t === 0 || t === 7) {
            ctx.fillStyle = ((x + y) % 2 === 0) ? 'rgba(58,120,78,0.75)' : 'rgba(48,110,68,0.75)';
            ctx.fillRect(px, py, TILE, TILE);
            if (t === 7) {
              ctx.fillStyle = '#f4f4f0';
              ctx.beginPath();
              ctx.arc(px + 10, py + 18, 3, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#e8a040';
              ctx.beginPath();
              ctx.arc(px + 22, py + 14, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (t === 1) {
            ctx.fillStyle = 'rgba(196,165,116,0.85)';
            ctx.fillRect(px, py, TILE, TILE);
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(px + 4, py + 4, 4, 4);
          } else if (t === 2) {
            ctx.fillStyle = 'rgba(50,130,170,0.8)';
            ctx.fillRect(px, py, TILE, TILE);
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.fillRect(px, py + (Math.floor(state.bob / 10) % 3) * 2, TILE, 2);
          } else if (t === 3) {
            ctx.fillStyle = 'rgba(40,90,55,0.7)';
            ctx.fillRect(px, py, TILE, TILE);
            drawTree(px + 16, py + 14);
          } else if (t === 4) {
            ctx.fillStyle = '#6a6a5a';
            ctx.fillRect(px + 4, py + 8, 24, 18);
            ctx.fillStyle = '#8a8a78';
            ctx.fillRect(px + 8, py + 6, 16, 10);
          } else if (t === 5) {
            // drawn as workshop block once at top-left of cluster
            if (LAYOUT[y][x - 1] !== 5 && LAYOUT[y - 1] && LAYOUT[y - 1][x] !== 5) {
              drawWorkshop(x, y);
            }
          } else if (t === 6) {
            ctx.fillStyle = 'rgba(140,100,60,0.9)';
            ctx.fillRect(px, py + 10, TILE, 12);
            ctx.fillStyle = '#5a4030';
            ctx.fillRect(px + 2, py + 8, 4, 16);
            ctx.fillRect(px + 26, py + 8, 4, 16);
          } else if (t === 8) {
            ctx.fillStyle = 'rgba(90,100,90,0.85)';
            ctx.fillRect(px, py, TILE, TILE);
            ctx.fillStyle = 'rgba(60,70,60,0.5)';
            ctx.fillRect(px, py + 20, TILE, 12);
          }
        }
      }

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
          // mini golem hint
          ctx.fillStyle = '#7a7a70';
          ctx.fillRect(cx - 6, cy - 18, 12, 10);
        } else {
          ctx.fillStyle = n.kind === 'mid' ? '#e8b86d' : '#78c090';
          ctx.beginPath();
          ctx.moveTo(cx, cy - 10);
          ctx.lineTo(cx + 9, cy);
          ctx.lineTo(cx, cy + 10);
          ctx.lineTo(cx - 9, cy);
          ctx.closePath();
          ctx.fill();
        }
        if (!done) {
          const pulse = 0.5 + 0.5 * Math.sin(state.bob / 12);
          ctx.strokeStyle = n.kind === 'boss'
            ? 'rgba(201,162,39,' + (0.3 + pulse * 0.4) + ')'
            : 'rgba(120,192,144,' + (0.25 + pulse * 0.35) + ')';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 14 + pulse * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // hero + followers
      const hx = state.px * TILE;
      const hy = state.py * TILE + Math.sin(state.bob / 10) * 1.5;
      const petList = state.pets || [];
      petList.slice(0, 3).forEach((id, i) => drawPetFollower(id, hx, hy, i));
      drawHero(hx, hy);

      // parchment minimap (bottom-right)
      const mx = W - 78;
      const my = H - 62;
      ctx.fillStyle = '#e8d8b0';
      ctx.strokeStyle = '#8a7040';
      ctx.lineWidth = 2;
      roundRect(ctx, mx, my, 70, 54, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#5a9ad4';
      ctx.fillRect(mx + 6, my + 8, 58, 36);
      ctx.fillStyle = '#4a9a58';
      ctx.beginPath();
      ctx.ellipse(mx + 22, my + 26, 12, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e3a2f';
      ctx.beginPath();
      ctx.arc(mx + 20, my + 24, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a5a20';
      ctx.font = '7px sans-serif';
      ctx.fillText('N', mx + 58, my + 14);
    }

    function roundRect(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
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
        if (dx * dx + dy * dy < 0.55 * 0.55) return n;
      }
      return null;
    }

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      state.bob += 1;
      if (opts && opts.getPets) state.pets = opts.getPets();

      let dx = 0, dy = 0;
      const speed = 3.2 * dt;
      if (keys.ArrowLeft || keys.a || keys.A || keys.PadLeft) dx -= 1;
      if (keys.ArrowRight || keys.d || keys.D || keys.PadRight) dx += 1;
      if (keys.ArrowUp || keys.w || keys.W || keys.PadUp) dy -= 1;
      if (keys.ArrowDown || keys.s || keys.S || keys.PadDown) dy += 1;

      if (dx || dy) {
        state.target = null;
        const len = Math.hypot(dx, dy) || 1;
        tryMove((dx / len) * speed, (dy / len) * speed);
      } else if (state.target) {
        const tx = state.target.x - state.px;
        const ty = state.target.y - state.py;
        const dist = Math.hypot(tx, ty);
        if (dist < 0.08) state.target = null;
        else {
          const step = Math.min(speed, dist);
          tryMove((tx / dist) * step, (ty / dist) * step);
        }
      }

      draw();

      const enc = checkEncounter();
      if (enc && opts.onEncounter) {
        opts.onEncounter(enc);
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
      return {
        x: ((e.clientX - rect.left) * sx) / TILE,
        y: ((e.clientY - rect.top) * sy) / TILE,
      };
    }

    function onPointer(e) {
      const w = canvasToWorld(e);
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
      if (walkable(w.x, w.y)) state.target = { x: w.x, y: w.y };
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
    function allCleared() { return NODES.every((n) => state.cleared.has(n.id)); }
    function clearedCount() { return NODES.filter((n) => state.cleared.has(n.id)).length; }

    function setPad(dir, down) {
      const map = { up: 'PadUp', down: 'PadDown', left: 'PadLeft', right: 'PadRight' };
      const k = map[dir];
      if (!k) return;
      if (down) keys[k] = true;
      else delete keys[k];
    }

    function interactNearest() {
      let best = null, bestD = Infinity;
      for (const n of NODES) {
        if (state.cleared.has(n.id)) continue;
        const dx = state.px - (n.x + 0.5);
        const dy = state.py - (n.y + 0.5);
        const d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = n; }
      }
      if (best) {
        state.target = { x: best.x + 0.5, y: best.y + 0.5 };
        return true;
      }
      return false;
    }

    function cancelMove() {
      state.target = null;
      keys = Object.create(null);
    }

    return {
      start, stop, markCleared, isCleared, allCleared, clearedCount,
      setPad, interactNearest, cancelMove,
      NODES, state,
    };
  }

  global.ForgepathMap = { createMap, NODES, COLS, ROWS };
})(window);
