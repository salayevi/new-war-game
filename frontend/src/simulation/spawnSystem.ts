import { COMMAND_TO_CATEGORY, GAME_CONFIG, UNIT_CONFIG } from '../config/unitConfig';
import type { CommandType, Snapshot, Team, UnitState } from '../types/schema';

let unitId = 1;

function nextUnitId() {
  unitId += 1;
  return `u${unitId}`;
}

export function applyCommand(state: Snapshot, team: Team, command: CommandType): void {
  const actor = team === 'player' ? state.player : state.ai;
  actor.last_command = command;

  if (command === 'tech_up' && actor.gold >= 120) {
    actor.gold -= 120;
    actor.income += 2;
    return;
  }

  if (command === 'defend' || command === 'push' || command === 'all_in') {
    actor.command_mode = command;
    return;
  }

  const category = COMMAND_TO_CATEGORY[command];
  if (!category) return;
  const cfg = UNIT_CONFIG[category];
  if (actor.gold < cfg.cost) return;

  actor.gold -= cfg.cost;
  const spawnX = team === 'player' ? 80 : GAME_CONFIG.laneLength - 80;

  const unit: UnitState = {
    id: nextUnitId(),
    team,
    category,
    x: spawnX,
    hp: cfg.hp,
    max_hp: cfg.hp,
    cooldown: 0,
    target_id: null,
    state: 'moving',
    target_lock: 0,
  };

  state.units.push(unit);
}
