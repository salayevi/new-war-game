from __future__ import annotations

from pydantic import BaseModel

from app.models.schema import CommandType, Snapshot


class AIDecision(BaseModel):
    command: CommandType
    reasoning: str
    tone: str
    target: str | None = None


def decide(state: Snapshot) -> AIDecision:
    ai = state.ai
    player = state.player
    ai_units = [u for u in state.units if u.team == "ai"]
    player_units = [u for u in state.units if u.team == "player"]
    ai_workers = sum(1 for u in ai_units if u.category == "worker")

    command = CommandType.SPAWN_MELEE
    reasoning = "Balancing pressure and economy."
    tone = "confident"
    target = None

    if ai.gold >= 120 and ai_workers < 4:
        command = CommandType.SPAWN_WORKER
        reasoning = "Economy first. Extra workers fuel my next timing push."
        tone = "focused"
    elif state.ai_base.hp < state.player_base.hp * 0.55:
        command = CommandType.DEFEND
        reasoning = "My base is under pressure; I need to stabilize the line."
        tone = "calculated"
        target = "home_front"
    else:
        frontline_delta = len(ai_units) - len(player_units)
        if ai.gold >= 260 and frontline_delta > 2:
            command = CommandType.ALL_IN
            reasoning = "I have the unit edge and banked gold; this is a kill window."
            tone = "aggressive"
            target = "enemy_base"
        elif ai.gold >= 220 and player_units and any(u.category == "shielded" for u in player_units):
            command = CommandType.SPAWN_HEAVY
            reasoning = "Heavy units crack shielded formations more reliably."
            tone = "adapting"
        elif ai.gold >= 150 and ai.income < player.income:
            command = CommandType.TECH_UP
            reasoning = "I am behind on income. Tech investment restores tempo."
            tone = "patient"
        elif ai.gold >= 140:
            command = CommandType.SPAWN_RANGED
            reasoning = "Ranged support improves trades from a safer distance."
            tone = "assertive"

    if state.player_base.hp < state.ai_base.hp * 0.4:
        reasoning = "You're cornered; one synchronized wave could finish this."
        tone = "taunting"

    return AIDecision(command=command, reasoning=reasoning, tone=tone, target=target)


def decision_to_chat(decision: AIDecision) -> str:
    prefix = {
        "focused": "Stay sharp",
        "calculated": "Read this carefully",
        "aggressive": "Brace yourself",
        "adapting": "I learn quickly",
        "patient": "War rewards patience",
        "assertive": "Watch the lane",
        "taunting": "General to general",
        "confident": "I see the board",
    }.get(decision.tone, "Command update")

    return f"{prefix}: {decision.reasoning}"
