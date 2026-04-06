from __future__ import annotations

import asyncio
import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.ai.commander import choose_command, explain_intent
from app.core.config import AI_CHAT_PERIOD_TICKS, AI_DECISION_PERIOD_TICKS, STATE_BROADCAST_EVERY, TICK_RATE
from app.core.simulation import RuntimeState, apply_command, step
from app.models.schema import ChatMessage, ClientCommand, Team

app = FastAPI(title="Lane RTS Server")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.websocket("/ws/match")
async def match_socket(ws: WebSocket) -> None:
    await ws.accept()
    state = RuntimeState()

    async def recv_loop() -> None:
        while True:
            payload = await ws.receive_text()
            data = json.loads(payload)
            if data.get("type") == "player_command":
                command = ClientCommand(type=data["command"])
                apply_command(state, Team.PLAYER, command.type)
            elif data.get("type") == "player_chat":
                echo = ChatMessage(from_id="player", text=data.get("text", ""), tick=state.tick)
                await ws.send_text(json.dumps({"type": "chat", "payload": echo.model_dump()}))

    async def tick_loop() -> None:
        while True:
            step(state)

            if state.tick % AI_DECISION_PERIOD_TICKS == 0 and not state.winner:
                ai_action = choose_command(state.snapshot())
                apply_command(state, Team.AI, ai_action)

            if state.tick % AI_CHAT_PERIOD_TICKS == 0:
                cmd = choose_command(state.snapshot())
                msg = ChatMessage(from_id="ai", text=explain_intent(cmd, state.snapshot()), tick=state.tick)
                await ws.send_text(json.dumps({"type": "chat", "payload": msg.model_dump()}))

            if state.tick % STATE_BROADCAST_EVERY == 0:
                await ws.send_text(json.dumps({"type": "state", "payload": state.snapshot().model_dump(mode="json")}))

            await asyncio.sleep(1 / TICK_RATE)

    receiver = asyncio.create_task(recv_loop())
    ticker = asyncio.create_task(tick_loop())

    try:
        await asyncio.gather(receiver, ticker)
    except WebSocketDisconnect:
        receiver.cancel()
        ticker.cancel()
