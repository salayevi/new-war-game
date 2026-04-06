from __future__ import annotations

from app.models.schema import CommandType, Snapshot


def choose_command(state: Snapshot) -> CommandType:
    ai = state.ai
    player = state.player
    ai_units = [u for u in state.units if u.team == "ai"]
    player_units = [u for u in state.units if u.team == "player"]
    ai_workers = sum(1 for u in ai_units if u.category == "worker")

    if ai.gold >= 120 and ai_workers < 4:
        return CommandType.SPAWN_WORKER

    if state.ai_base.hp < state.player_base.hp * 0.55:
        return CommandType.DEFEND

    frontline_delta = len(ai_units) - len(player_units)
    if ai.gold >= 260 and frontline_delta > 2:
        return CommandType.ALL_IN

    if ai.gold >= 220 and player_units and any(u.category == "shielded" for u in player_units):
        return CommandType.SPAWN_HEAVY

    if ai.gold >= 150 and ai.income < player.income:
        return CommandType.TECH_UP

    if ai.gold >= 140:
        return CommandType.SPAWN_RANGED

    return CommandType.SPAWN_MELEE


def explain_intent(command: CommandType, state: Snapshot) -> str:
    messages = {
        CommandType.SPAWN_WORKER: "I'm expanding my economy. Keep up if you can.",
        CommandType.SPAWN_MELEE: "Frontline pressure incoming.",
        CommandType.SPAWN_RANGED: "I'm bringing precision support.",
        CommandType.SPAWN_SHIELDED: "You will not break this wall.",
        CommandType.SPAWN_HEAVY: "Heavy armor rolling out. Adapt now.",
        CommandType.DEFEND: "I see your push. I'm tightening defenses.",
        CommandType.PUSH: "Formation advance. Let's test your line.",
        CommandType.ALL_IN: "Decisive strike. Survive this if you can.",
        CommandType.TECH_UP: "Investing in command logistics. Long game wins wars.",
    }

    if state.player_base.hp < state.ai_base.hp * 0.4:
        return "You're cornered. One clean wave ends this battle."

    return messages.get(command, "Adjusting strategy.")
