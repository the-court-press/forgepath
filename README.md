# Numera

**Working title — rename-ready.** A wordless, map-first math RPG: walk a tiny overworld, touch an encounter node, and settle it in an **OPERATE!**-style tactile tile duel (four numbers, merge with **+ − × ÷** toward a target).

Playable demo (GitHub Pages):  
**https://julianlee314-hue.github.io/numera/**

## Numera vs `operate`

| | **operate** | **Numera** |
|---|-------------|------------|
| Role | Arithmetic tile **lab / research box** | Ambitious **math RPG** product |
| Loop | Deal → solve → next puzzle | Overworld → encounter → duel → map |
| Framing | Solo practice table | Seed Grove region, pets, boss |
| Repo | [`operate`](https://github.com/julianlee314-hue/operate) | this repo |

Puzzle **bank + merge engine** ideas are reused from `operate` (copied, not linked). Changing Numera will not break the operate repo.

## Name alternatives (if we rename)

- **Arithra** · **Sumora** · **Operaria** · **Tilefall** · **Grove24**
- Keep “Numera” in the README title until a final pick; folder/repo can stay `numera`.

## How to play (words-light)

1. **▶** on the title → **Seed Grove** map.
2. Move with **arrow keys / WASD**, or **click** the ground / a glowing node.
3. Walk onto **◆** nodes (★ = boss) → tile duel.
4. Select **two tiles**, then a **pet-op** (or arm the op first). Merge until one tile equals the **target** ◎.
5. **Focus** charges from streaks/speed; guardian HP is **cosmetic** damage on merges/solve.
6. Clear the mid-path node → unlock **Producto (×)**. Clear the Grove Warden → unlock **Quotia (÷)**. Return to the map.

Starter pets: **Summo (+)** and **Differentia (−)**.

## v0.1 contents

- Top-down **Seed Grove** (Workshop Isles / first region vibes)
- Keyboard + click movement
- **4 seed** encounters + **1 mid** (Producto unlock) + **1 boss** (Grove Warden)
- Pet icons in the HUD; duel op-bar shows cute short labels
- Focus meter + cosmetic guardian HP
- Vanilla HTML/CSS/JS · GitHub Pages on `main`
- Original CSS art only — **no** Zelda / Pokémon / Capcom IP

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
js/game.js      # screen flow
```

## Local

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## IP note

Numera is an **original** product. Early-Zelda *feel* (wordless, map-first) and classroom “make the target” number play inspire the design — not affiliated with Nintendo, Pokémon, Capcom, or any other franchise. Art and names here are original CSS/UI only.

## License

Prototype for personal / educational use. © Julius (julianlee314-hue).
