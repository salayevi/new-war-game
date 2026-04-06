# Lane RTS Rivalry (Frontend-Only Prototype)

This is a **single-runtime browser RTS prototype**. The game now runs entirely in the frontend (React + Phaser) with no backend process required for local play.

## Quick start (local)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Current architecture (frontend-only)

```text
frontend/src/
  ai/                 # local AI commander decisions
  chat/               # chat integration from AI decisions + player text
  config/             # tuneable unit + game constants
  components/         # React UI controls
  game/               # shared game-type exports
  hooks/              # useGameController (authoritative local loop)
  rendering/          # render helpers (colors/lanes)
  scenes/             # Phaser lane scene (render-only)
  simulation/         # economy/spawn/combat/engine
  state/              # initial state factory
  types/              # schema interfaces
```

## Runtime ownership

- **Authoritative state:** `useGameController` (local in-memory snapshot)
- **Simulation tick:** local interval loop (`tickRate`)
- **AI decisions:** local rule-based commander
- **AI chat:** derived from the same decision object used for gameplay commands
- **Phaser scene:** render-only, incremental sprite lifecycle (create/update/destroy)

## Controls

- Spawn: `spawn_worker`, `spawn_melee`, `spawn_ranged`, `spawn_shielded`, `spawn_heavy`
- Stances: `defend`, `push`, `all_in`, `tech_up`
- Chat with AI commander in the text box
- Restart button resets the local match

## Legacy backend status

The Python backend remains in `backend/` as a **legacy reference** and is currently **not required** for running this version.
A future server-authoritative mode can be reintroduced later if needed.
