# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Dev server at 127.0.0.1
pnpm build        # Type-check (tsc -b) then Vite production build
pnpm test         # Run all tests (vitest run, jsdom environment)
pnpm exec vitest run src/lib/romaji.test.ts  # Run a single test file
```

Package manager is **pnpm** (>=10.16.0). Node >=20.19.0.

## Architecture

React 19 + Vite + TypeScript (strict mode). No state library — all state lives in `App.tsx` via `useState`. No router — single-page typing game.

### Data flow

1. **Keymap loading**: User imports ZMK `.keymap` + layout `.json`, or the bundled default keymap is used (`src/lib/defaultKeymap.ts` loads from `src/assets/default-keymap/`).
2. **Keymap parsing** (`src/lib/keymapParser.ts`): Parses ZMK keymap syntax into `ParsedKeymap` (layers + key bindings + layout positions). Understands ZMK behaviors: `&kp`, `&lt`, `&mt`, `&mo`, `&to`, `&trans`, `&none`.
3. **Practice session** (`src/lib/practice.ts`): Selects a `PracticeItem` (Japanese kana or symbol drills). Generates a `target` romaji string the user must type.
4. **Input engine** (`src/lib/inputEngine.ts`): `applyKey()` is the core function — takes a keypress and session, returns `accepted | rejected | completed`. Immutable — returns a new session object.
5. **Romaji engine** (`src/lib/romaji.ts`): Converts hiragana/katakana to romaji tokens with multiple accepted spellings (e.g., し → "shi" or "si"). Validates typed input against token sequences.
6. **Hint resolver** (`src/lib/hintResolver.ts`): Given a target character, finds which physical key(s) to press, including layer-switching paths (e.g., hold LT key then press target).
7. **RPG adventure** (`src/App.tsx`): HP/XP/level/ailment state layered on top of the typing session. Miss = HP damage, correct = XP gain, combo cures ailments, level-up at XP thresholds.

### Key types (`src/types.ts`)

- `ParsedKeymap` = layout + layers + warnings
- `PracticeSession` = current typing state (target, typed, streak, mistakes)
- `AdventureState` = RPG overlay (hp, xp, level, ailment)
- `ResolvedHint` = which key to press, on which layer, via which layer-switch key

### UI components

- `App.tsx` — Root. Manages all state, handles keyboard input via hidden `<input>`.
- `Rill.tsx` — Mascot character drawn entirely in CSS (no images). Mood-driven: idle/hit/miss/complete.
- `GameHud.tsx` — RPG status bar: HP/XP bars, level, combo, ailment badges.
- `PromptLane.tsx` — Shows the target text and romaji progress track.
- `NextKeyCoach.tsx` — Shows which key to press next with mini keyboard map.
- `GameDrawer.tsx` — Side panel with full keyboard view, mistake list, keymap import.

### Styling

All styles in `src/styles.css`. Pixel-art / 8-bit RPG theme. Two Google Fonts loaded in `index.html`: `Press Start 2P` (pixel labels) and `DotGothic16` (Japanese text). CSS custom properties define the dark color palette.

### State persistence

`src/lib/storage.ts` saves the parsed keymap and user settings (mode, base layer) to `localStorage`.

## Japanese input handling

The romaji system is central. `japaneseToRomajiTokens()` converts kana strings into tokens where each token has multiple valid romaji spellings. The input engine uses backtracking (`matchTokens`) to validate partial input against these token sequences. Special handling for っ (double consonant), digraphs (しゃ→sha), and ん (ambiguous n/nn).
