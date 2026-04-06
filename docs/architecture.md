# Architecture Overview (Frontend-Only Mode)

## Goal
Local-play RTS prototype with no backend runtime dependency.

## Layers
- `hooks/useGameController.ts`: authoritative local game loop and action entrypoints.
- `simulation/*`: pure gameplay systems (economy, spawn, combat, per-tick stepping).
- `ai/commander.ts`: local rule-based AI that outputs one structured decision.
- `chat/chatSystem.ts`: chat lines generated from AI decisions and state context.
- `scenes/LaneScene.ts`: Phaser render-only scene.
- `components/*`: React UI controls and telemetry.

## Data flow
1. UI sends player commands to controller hook.
2. Controller mutates local authoritative snapshot via simulation modules.
3. Every AI interval, controller requests one AI decision.
4. Same AI decision drives both game command + chat line.
5. Scene renders latest snapshot via persistent sprite registry.

## Why this mode
- Fast local iteration (`npm run dev`).
- No backend process or WebSocket needed.
- Keeps separation of concerns clear for future optional backend mode.
