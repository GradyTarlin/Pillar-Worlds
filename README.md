# Pillar Worlds — Character Creation

A production-ready React (TypeScript) web app for creating Level 1 characters in the Pillar Worlds science fiction tabletop RPG.

## Quick Start

```bash
npm install
npm start
```

Then open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Output is in the `dist/` directory.

## Features

- **Derived skills only** — CHA, INS, PRW, STL, STR, WIS are calculated from Body, Mind, Spirit, and Zodiac
- **15 bloodlines** — Draconic, Blessed, Cursed, Titanborn, and Cosmic types with full feature text
- **Backstory stages** — Birth, Youth, and Coming of Age with 24 fragments
- **Undori rule** — HP includes STR bonus for the Undori bloodline
- **Character sheet** — Read-only summary with all selections and backstory grants

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Local state only (no backend)
