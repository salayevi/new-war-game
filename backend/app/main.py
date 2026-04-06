from __future__ import annotations

import asyncio
import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.ai.commander import AIDecision, decide, decision_to_chat
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
    latest_ai_decision: AIDecision | None = None

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
        nonlocal latest_ai_decision

        while True:
            step(state)

            if state.tick % AI_DECISION_PERIOD_TICKS == 0 and not state.winner:
                latest_ai_decision = decide(state.snapshot())
                apply_command(state, Team.AI, latest_ai_decision.command)

            if state.tick % AI_CHAT_PERIOD_TICKS == 0 and latest_ai_decision:
                msg = ChatMessage(
                    from_id="ai",
                    text=decision_to_chat(latest_ai_decision),
                    tick=state.tick,
                )
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
