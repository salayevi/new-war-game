from __future__ import annotations

from dataclasses import dataclass, field
from itertools import count
from random import random

from app.core.config import (
    BASE_ATTACK_RANGE,
    BASE_HP,
    LANE_LENGTH,
    STARTING_GOLD,
    TARGET_LOCK_TICKS,
    TICK_SECONDS,
    UNIT_MIN_GAP,
    UNITS,
    WORKER_BASE_INCOME,
    WORKER_INCOME_START_TICK,
    WORKER_INCOME_TICKS,
)
from app.models.schema import BaseState, CommandType, PlayerState, Snapshot, Team, UnitCategory, UnitState


UNIT_ID_GEN = count(1)


@dataclass
class RuntimeState:
    tick: int = 0
    player: PlayerState = field(default_factory=lambda: PlayerState(gold=STARTING_GOLD, income=0))
    ai: PlayerState = field(default_factory=lambda: PlayerState(gold=STARTING_GOLD, income=0))
    player_base: BaseState = field(default_factory=lambda: BaseState(hp=BASE_HP, max_hp=BASE_HP))
    ai_base: BaseState = field(default_factory=lambda: BaseState(hp=BASE_HP, max_hp=BASE_HP))
    units: list[UnitState] = field(default_factory=list)
    winner: Team | None = None

    def snapshot(self) -> Snapshot:
        return Snapshot(
            match_id="demo-match",
            tick=self.tick,
            lane_length=LANE_LENGTH,
            player=self.player,
            ai=self.ai,
            player_base=self.player_base,
            ai_base=self.ai_base,
            units=self.units,
            winner=self.winner,
        )


def _price(command: CommandType) -> int:
    mapping = {
        CommandType.SPAWN_WORKER: UNITS["worker"]["cost"],
        CommandType.SPAWN_MELEE: UNITS["melee"]["cost"],
        CommandType.SPAWN_RANGED: UNITS["ranged"]["cost"],
        CommandType.SPAWN_SHIELDED: UNITS["shielded"]["cost"],
        CommandType.SPAWN_HEAVY: UNITS["heavy"]["cost"],
    }
    return mapping.get(command, 0)


def _category(command: CommandType) -> UnitCategory | None:
    mapping = {
        CommandType.SPAWN_WORKER: UnitCategory.WORKER,
        CommandType.SPAWN_MELEE: UnitCategory.MELEE,
        CommandType.SPAWN_RANGED: UnitCategory.RANGED,
        CommandType.SPAWN_SHIELDED: UnitCategory.SHIELDED,
        CommandType.SPAWN_HEAVY: UnitCategory.HEAVY,
    }
    return mapping.get(command)


def apply_command(state: RuntimeState, team: Team, command: CommandType) -> None:
    actor = state.player if team == Team.PLAYER else state.ai
    actor.last_command = command.value

    if command == CommandType.TECH_UP and actor.gold >= 120:
        actor.gold -= 120
        actor.income += 2
        return

    if command == CommandType.DEFEND:
        actor.command_mode = "defend"
        return

    if command == CommandType.PUSH:
        actor.command_mode = "push"
        return

    if command == CommandType.ALL_IN:
        actor.command_mode = "all_in"
        return

    unit_kind = _category(command)
    if not unit_kind:
        return
    price = _price(command)
    if actor.gold < price:
        return

    actor.gold -= price
    spawn_x = 80 if team == Team.PLAYER else LANE_LENGTH - 80
    unit_cfg = UNITS[unit_kind.value]

    state.units.append(
        UnitState(
            id=f"u{next(UNIT_ID_GEN)}",
            team=team,
            category=unit_kind,
            x=float(spawn_x),
            hp=float(unit_cfg["hp"]),
            max_hp=float(unit_cfg["hp"]),
            cooldown=0,
            state="moving",
        )
    )


def _find_target(unit: UnitState, enemies: list[UnitState], by_id: dict[str, UnitState]) -> UnitState | None:
    attack_range = UNITS[unit.category.value]["range"]

    if unit.target_id and unit.target_lock > 0:
        locked = by_id.get(unit.target_id)
        if locked and abs(locked.x - unit.x) <= attack_range * 1.3:
            return locked

    in_range = [e for e in enemies if abs(e.x - unit.x) <= attack_range]
    if not in_range:
        return None

    in_range.sort(key=lambda e: abs(e.x - unit.x))
    unit.target_id = in_range[0].id
    unit.target_lock = TARGET_LOCK_TICKS
    return in_range[0]


def _speed_for(unit: UnitState, mode: str) -> float:
    base_speed = UNITS[unit.category.value]["speed"]
    if mode == "defend":
        return base_speed * 0.8
    if mode == "push":
        return base_speed * 1.1
    if mode == "all_in":
        return base_speed * 1.25
    return base_speed


def _should_hold_for_engagement(unit: UnitState, enemies: list[UnitState]) -> bool:
    if UNITS[unit.category.value]["range"] > 35:
        return False
    if not enemies:
        return False
    nearest = min(abs(e.x - unit.x) for e in enemies)
    return nearest <= 16


def _resolve_separation(units: list[UnitState], team: Team) -> None:
    lineup = sorted((u for u in units if u.team == team), key=lambda u: u.x)
    if len(lineup) < 2:
        return

    if team == Team.PLAYER:
        for i in range(1, len(lineup)):
            prev = lineup[i - 1]
            current = lineup[i]
            if current.x - prev.x < UNIT_MIN_GAP:
                current.x = prev.x + UNIT_MIN_GAP
    else:
        for i in range(len(lineup) - 2, -1, -1):
            nxt = lineup[i + 1]
            current = lineup[i]
            if nxt.x - current.x < UNIT_MIN_GAP:
                current.x = nxt.x - UNIT_MIN_GAP


def _worker_income(units: list[UnitState], team: Team) -> int:
    workers = sum(1 for unit in units if unit.team == team and unit.category == UnitCategory.WORKER)
    if workers == 0:
        return 0
    return int(WORKER_BASE_INCOME * workers + 0.6 * max(workers - 2, 0))


def step(state: RuntimeState) -> None:
    if state.winner:
        return

    state.tick += 1

    for side in (state.player, state.ai):
        side.gold += max(1, side.income)

    if state.tick >= WORKER_INCOME_START_TICK and state.tick % WORKER_INCOME_TICKS == 0:
        state.player.gold += _worker_income(state.units, Team.PLAYER)
        state.ai.gold += _worker_income(state.units, Team.AI)

    by_id = {u.id: u for u in state.units}
    player_units = [u for u in state.units if u.team == Team.PLAYER]
    ai_units = [u for u in state.units if u.team == Team.AI]

    for unit in state.units:
        cfg = UNITS[unit.category.value]
        unit.cooldown = max(0.0, unit.cooldown - TICK_SECONDS)
        unit.target_lock = max(0, unit.target_lock - 1)
        enemies = ai_units if unit.team == Team.PLAYER else player_units
        target = _find_target(unit, enemies, by_id)

        if target and unit.cooldown <= 0:
            dmg = cfg["damage"]
            if target.category == UnitCategory.SHIELDED:
                dmg *= 0.85
            if random() < cfg.get("crit_chance", 0):
                dmg *= 1.25
            target.hp -= dmg
            unit.cooldown = float(cfg["attack_speed"])
            unit.state = "attacking"
            continue

        enemy_base_x = LANE_LENGTH - 45 if unit.team == Team.PLAYER else 45
        if abs(enemy_base_x - unit.x) <= BASE_ATTACK_RANGE:
            if unit.cooldown <= 0:
                base = state.ai_base if unit.team == Team.PLAYER else state.player_base
                base.hp -= cfg["base_damage"]
                unit.cooldown = float(cfg["attack_speed"])
            unit.state = "attacking"
            unit.target_id = "base_ai" if unit.team == Team.PLAYER else "base_player"
            continue

        if _should_hold_for_engagement(unit, enemies):
            unit.state = "attacking"
            continue

        mode = state.player.command_mode if unit.team == Team.PLAYER else state.ai.command_mode
        speed = _speed_for(unit, mode)
        if unit.team == Team.PLAYER:
            unit.x = min(LANE_LENGTH - 40, unit.x + speed)
        else:
            unit.x = max(40, unit.x - speed)
        unit.state = "moving"

    state.units = [u for u in state.units if u.hp > 0]
    _resolve_separation(state.units, Team.PLAYER)
    _resolve_separation(state.units, Team.AI)

    if state.ai_base.hp <= 0:
        state.winner = Team.PLAYER
    elif state.player_base.hp <= 0:
        state.winner = Team.AI
