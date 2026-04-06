from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
UNITS_CONFIG_PATH = ROOT / "shared" / "config" / "units.json"


with UNITS_CONFIG_PATH.open("r", encoding="utf-8") as fh:
    UNITS = json.load(fh)

TICK_RATE = 10
STATE_BROADCAST_EVERY = 2
AI_DECISION_PERIOD_TICKS = 20
AI_CHAT_PERIOD_TICKS = 30
WORKER_INCOME_TICKS = 10
LANE_LENGTH = 1000
BASE_HP = 2500
STARTING_GOLD = 300
