# Architecture Overview

## High-level
- **Frontend (React + Phaser):** Renders lane battle, HUD, command buttons, and chat UI.
- **Backend (FastAPI + WebSocket):** Owns deterministic-ish tick simulation, authority over unit state, economy, and win conditions.
- **Shared assets:** JSON schemas and unit stat config in `/shared` to keep protocol and balancing aligned.

## Runtime flow
1. Browser opens WebSocket `/ws/match`.
2. Server starts tick loop at fixed rate.
3. Player command messages mutate server state (`spawn`, `defend`, `push`, etc.).
4. Every AI decision interval, commander policy chooses a strategic command.
5. Server emits periodic state snapshots + AI chat explanations.
6. Frontend updates Phaser scene from latest server snapshot.

## Determinism approach
- Fixed tick rate and command application order.
- Combat resolved server-side using config-driven stats.
- Controlled randomness only via optional crit chance in config (easy to disable).

## Extension points
- Add new unit categories by extending `shared/config/units.json` + enum + render map.
- Add abilities as extra per-unit action handlers in simulation step.
- Add maps by externalizing lane geometry config.
- Replace heuristic commander with LLM planner through same command interface.
