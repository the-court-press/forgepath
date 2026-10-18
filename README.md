# ForgePath Prequel

A wordless, map-first **math RPG**: walk a tiny overworld, touch an encounter node, and settle it in an **OPERATE!**-style tactile tile duel (four numbers, merge with **+ − × ÷** toward a target). Soft mythic + nature tone — cute grove spirits early; mythical animals later. Math brain = the magic.

**You** are the fighter (hearts + Focus beads). Pets only unlock & empower ops — they don’t take the hits. Guardians apply cosmetic pressure.

Playable demo (GitHub Pages):  
**https://the-court-press.github.io/forgepath/**

## ForgePath Prequel vs `operate`

| | **operate** | **ForgePath Prequel** |
|---|-------------|---------------|
| Role | Arithmetic tile **lab / research box** | Ambitious **math RPG** product |
| Loop | Deal → solve → next puzzle | Overworld → encounter → duel → map |
| Framing | Solo practice table | Seed Grove / Workshop Isles, pets, boss |
| Repo | [`operate`](https://github.com/the-court-press/operate) | [`forgepath`](https://github.com/the-court-press/forgepath) |

Puzzle **bank + merge engine** ideas are reused from `operate` (copied, not linked). Changing ForgePath Prequel will not break the operate repo.

## How to play (words-light)

1. **▶** on the title → **Seed Grove** map.
2. Move with **arrow keys / WASD**, **click**, or the on-screen **D-pad**.
3. Walk onto **◆** nodes (★ = boss) → tile duel.
4. Select **two tiles**, then a **pet-op** (or arm the op first). Merge until one tile equals the **target** ◎.
5. **Hearts** drop on fails / idle pressure; **FOCUS** beads charge from streaks/speed; guardian pressure is cosmetic.
6. Clear the mid-path node → unlock **Producto (×)**. Clear the Grove Warden → unlock **Quotia (÷)**.
7. **Select** → **My Familiars**. **Start** / 🗺 → **Workshop Isles** world map.

### On-screen pad (ForgePath Prequel labeling)

Classic handheld *homage* layout — gray plastic chrome, chunky pixels. **Original** ForgePath Prequel branding only (no franchise logos, names, or marks).

| Control | Action |
|---------|--------|
| **D-pad** | Map movement |
| **A** | Interact / confirm |
| **B** | Cancel / undo / close menu |
| **Start** | Workshop Isles map · flee duel |
| **Select** | My Familiars menu |

Starter pets: **Summo (+)** and **Differentia (−)**. Locked stubs: Potens / Radixa / Negato.

## v0.2 contents

- Hearts + FOCUS bead HUD (mock-aligned)
- Richer Seed Grove canvas (workshop, bridge, waterfall tiles) + concept BG wash
- Workshop Isles world-map screen (nodes unlock with grove progress)
- Boss duel arena (stone frame, target sign, golem art, concept BG)
- My Familiars menu (Select) — Summo/Differentia/Producto/Quotia + locked trio
- Concept targets in `art/reference/` (AI/concept — not claimed as hand-drawn production art)
- Original CSS/UI + compressed backgrounds — **no** Zelda / Pokémon / Capcom / Nintendo IP

## Stubs (later)

- Comics / cutscene panels
- Full multi-region overworlds beyond Seed Grove
- True sprite sheets sliced from production art
- Quotia questline beyond boss unlock
- Save slots, soundscape

## Stack

```
index.html
css/style.css
js/hud.js       # hearts / FOCUS / pet tray
js/puzzles.js   # bank (from operate ideas)
js/engine.js    # merge engine (from operate)
js/audio.js
js/pets.js      # familiars incl. locked stubs
js/map.js       # Seed Grove
js/worldmap.js  # Workshop Isles
js/duel.js
js/game.js
art/reference/  # north-star concept mocks
assets/bg/      # compressed backgrounds
```

## Local

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## IP note

ForgePath Prequel is an **original** product. Early-Zelda *feel* (wordless, map-first), classroom “make the target” number play, and classic handheld control *layout* inspire the design — not affiliated with Nintendo, Pokémon, Capcom, or any other franchise. No official logos, marks, or character assets.

Concept PNGs in `art/reference/` are **visual targets** (concept / AI-assisted), not final production drawings.

## License

Prototype for personal / educational use. © Julius (the-court-press).
