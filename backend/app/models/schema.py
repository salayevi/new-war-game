from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field


class Team(str, Enum):
    PLAYER = "player"
    AI = "ai"


class UnitCategory(str, Enum):
    WORKER = "worker"
    MELEE = "melee"
    RANGED = "ranged"
    SHIELDED = "shielded"
    HEAVY = "heavy"


class CommandType(str, Enum):
    SPAWN_WORKER = "spawn_worker"
    SPAWN_MELEE = "spawn_melee"
    SPAWN_RANGED = "spawn_ranged"
    SPAWN_SHIELDED = "spawn_shielded"
    SPAWN_HEAVY = "spawn_heavy"
    DEFEND = "defend"
    PUSH = "push"
    ALL_IN = "all_in"
    TECH_UP = "tech_up"


class UnitState(BaseModel):
    id: str
    team: Team
    category: UnitCategory
    x: float
    hp: float
    max_hp: float
    cooldown: float = 0.0
    target_id: str | None = None


class BaseState(BaseModel):
    hp: float
    max_hp: float


class PlayerState(BaseModel):
    gold: int
    income: int
    command_mode: str = "balanced"


class Snapshot(BaseModel):
    match_id: str
    tick: int
    lane_length: int = 1000
    player: PlayerState
    ai: PlayerState
    player_base: BaseState
    ai_base: BaseState
    units: list[UnitState]
    winner: Team | None = None


class ClientCommand(BaseModel):
    type: CommandType


class ChatMessage(BaseModel):
    from_id: str = Field(description="player|ai")
    text: str
    tick: int
