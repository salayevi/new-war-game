# Lane RTS Rivalry (MVP)

An original 2D side-view lane-based RTS prototype with server-authoritative combat, real-time human vs AI battle, and live rival-commander chat.

## 1) Project folder structure

```text
new-war-game/
  backend/
    app/
      ai/commander.py
      core/config.py
      core/simulation.py
      models/schema.py
      main.py
    requirements.txt
  frontend/
    src/
      components/ControlPanel.tsx
      game/LaneScene.ts
      hooks/useMatchSocket.ts
      types/schema.ts
      App.tsx
      main.tsx
    index.html
    package.json
    tsconfig.json
    vite.config.ts
  shared/
    config/units.json
    protocol/websocket.md
    schemas/game_state.schema.json
  docs/
    architecture.md
```

## 2) MVP implementation summary

- Real-time WebSocket session with server tick loop.
- Server-authoritative economy, movement, combat, and base victory.
- Unit categories: worker, melee, ranged, shielded, heavy.
- AI commander selects strategic actions (`defend`, `push`, `all_in`, `tech_up`, spawns).
- AI chat layer emits tactical personality lines periodically.
- Frontend renders units as simple geometric placeholders (circles + health bars).

## 3) Setup instructions

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## 4) WebSocket protocol spec

See `shared/protocol/websocket.md`.

## 5) Unit config schema

See `shared/config/units.json` for editable stat table and `shared/schemas/game_state.schema.json` for state payload schema.

## 6) AI decision interface

`backend/app/ai/commander.py`
- `choose_command(snapshot) -> CommandType`
- `explain_intent(command, snapshot) -> str`

Both consume structured snapshot data and return either strategic command tokens or natural-language explanations.

## 7) Chat integration layer

- Player sends chat via WebSocket `{type: "player_chat", text: "..."}`.
- Server mirrors player message and injects AI chat lines every chat interval.
- Frontend displays rolling chat transcript in HUD.

## 8) Placeholder art approach

MVP uses simple shapes to avoid proprietary assets:
- Bases: colored rectangles
- Units: category-colored circles
- HP bars: tiny rectangles above units
- Background: flat color lane

This keeps iteration fast while preserving readability for balance tests.

## 9) Step-by-step local run

1. Start backend server on `:8000`.
2. Start frontend Vite app on `:5173`.
3. Open browser tab.
4. Spawn economy and combat units.
5. Use command-mode buttons to set macro posture.
6. Watch AI react and taunt in chat.
7. Win by reducing enemy base HP to zero.

## 10) Phase 2 backlog

- Multi-lane maps and fog-of-war.
- Deterministic replay logging and re-sim validation.
- Ability system (active skills + cooldown UI).
- Better pathing and formation spacing.
- Auth + matchmaking + persistent profiles.
- LLM-backed commander with memory and configurable persona.
- Spectator mode and balance telemetry dashboard.

## MVP task breakdown

1. Define shared schema + protocol documents.
2. Build server tick simulation and command handlers.
3. Add AI strategy policy and chat personality output.
4. Build React command/chat HUD and WebSocket hook.
5. Integrate Phaser lane rendering from snapshots.
6. Wire run scripts and docs for local execution.
