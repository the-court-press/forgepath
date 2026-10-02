# Forgepath

A wordless, map-first **math RPG**: walk a tiny overworld, touch an encounter node, and settle it in an **OPERATE!**-style tactile tile duel (four numbers, merge with **+ − × ÷** toward a target). Soft mythic + nature tone — cute grove spirits early; mythical animals later. Math brain = the magic.

**You** are the fighter (HP + Focus/MP). Pets only unlock & empower ops — they don’t take the hits. Guardians apply cosmetic pressure.

Playable demo (GitHub Pages):  
**https://julianlee314-hue.github.io/forgepath/**

## Forgepath vs `operate`

| | **operate** | **Forgepath** |
|---|-------------|---------------|
| Role | Arithmetic tile **lab / research box** | Ambitious **math RPG** product |
| Loop | Deal → solve → next puzzle | Overworld → encounter → duel → map |
| Framing | Solo practice table | Seed Grove region, pets, boss |
| Repo | [`operate`](https://github.com/julianlee314-hue/operate) | [`forgepath`](https://github.com/julianlee314-hue/forgepath) |

Puzzle **bank + merge engine** ideas are reused from `operate` (copied, not linked). Changing Forgepath will not break the operate repo.

## How to play (words-light)

1. **▶** on the title → **Seed Grove** map.
2. Move with **arrow keys / WASD**, **click**, or the on-screen **D-pad**.
3. Walk onto **◆** nodes (★ = boss) → tile duel.
4. Select **two tiles**, then a **pet-op** (or arm the op first). Merge until one tile equals the **target** ◎.
5. **YOU** take HP damage on fails / idle pressure; **Focus** charges from streaks/speed; guardian pressure is cosmetic.
6. Clear the mid-path node → unlock **Producto (×)**. Clear the Grove Warden → unlock **Quotia (÷)**.

### On-screen pad (Forgepath labeling)

Classic handheld *homage* layout — gray plastic chrome, chunky pixels. **Original** Forgepath branding only (no franchise logos, names, or marks).

| Control | Action |
|---------|--------|
| **D-pad** | Map movement |
| **A** | Interact / confirm (nearest node · win return) |
| **B** | Cancel / undo (map cancel · duel undo · flee) |
| **Start** | Pause / return to map (from duel) |
| **Select** | Pets — flash support tray / list unlocked ops |

Starter pets: **Summo (+)** and **Differentia (−)**.

## v0.1 contents

- Top-down **Seed Grove** (Workshop Isles / first region vibes)
- Keyboard + click + on-screen pad movement
- **4 seed** encounters + **1 mid** (Producto unlock) + **1 boss** (Grove Warden)
- Player HP bar (you take hits); pets as support op icons; cosmetic guardian pressure
- Focus meter · vanilla HTML/CSS/JS · GitHub Pages on `main`
- Original CSS art only — **no** Zelda / Pokémon / Capcom / Nintendo IP

## Stubs (later)

- Comics / cutscene panels (skipped for now)
- Full **Workshop Isles** multi-screen overworld
- Richer pet sprites / evolution
- Quotia questline beyond boss unlock
- Save slots, more regions, soundscape

## Stack

```
index.html
css/style.css
js/puzzles.js   # bank (from operate ideas)
js/engine.js    # merge engine (from operate)
js/audio.js     # optional Web Audio beeps
js/pets.js      # Summo / Differentia / Producto / Quotia
js/map.js       # Seed Grove canvas overworld
js/duel.js      # encounter tile duel UI
js/game.js      # screen flow + pad wiring
```

## Local

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## IP note

Forgepath is an **original** product. Early-Zelda *feel* (wordless, map-first), classroom “make the target” number play, and classic handheld control *layout* inspire the design — not affiliated with Nintendo, Pokémon, Capcom, or any other franchise. No official logos, marks, or character assets. Art and names here are original CSS/UI only.

## License

Prototype for personal / educational use. © Julius (julianlee314-hue).
