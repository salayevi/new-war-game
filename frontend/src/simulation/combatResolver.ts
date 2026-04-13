import { GAME_CONFIG, UNIT_CONFIG } from '../config/unitConfig';
import type { Snapshot, Team, UnitState } from '../types/schema';

function speedFor(unit: UnitState, mode: 'balanced' | 'defend' | 'push' | 'all_in'): number {
  const base = UNIT_CONFIG[unit.category].speed;
  if (mode === 'defend') return base * 0.8;
  if (mode === 'push') return base * 1.1;
  if (mode === 'all_in') return base * 1.25;
  return base;
}

function shouldHoldForEngagement(unit: UnitState, enemies: UnitState[]): boolean {
  if (UNIT_CONFIG[unit.category].range > 35 || enemies.length === 0) return false;
  const nearest = Math.min(...enemies.map((e) => Math.abs(e.x - unit.x)));
  return nearest <= 16;
}

function findTarget(unit: UnitState, enemies: UnitState[], byId: Map<string, UnitState>): UnitState | null {
  const attackRange = UNIT_CONFIG[unit.category].range;

  if (unit.target_id && (unit.target_lock ?? 0) > 0) {
    const locked = byId.get(unit.target_id);
    if (locked && Math.abs(locked.x - unit.x) <= attackRange * 1.3) {
      return locked;
    }
  }

  const inRange = enemies.filter((e) => Math.abs(e.x - unit.x) <= attackRange).sort((a, b) => Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x));
  if (inRange.length === 0) return null;

  unit.target_id = inRange[0].id;
  unit.target_lock = GAME_CONFIG.targetLockTicks;
  return inRange[0];
}

function resolveSeparation(units: UnitState[], team: Team): void {
  const lineup = units.filter((u) => u.team === team).sort((a, b) => a.x - b.x);
  if (lineup.length < 2) return;

  if (team === 'player') {
    for (let i = 1; i < lineup.length; i += 1) {
      const prev = lineup[i - 1];
      const current = lineup[i];
      if (current.x - prev.x < GAME_CONFIG.unitMinGap) current.x = prev.x + GAME_CONFIG.unitMinGap;
    }
  } else {
    for (let i = lineup.length - 2; i >= 0; i -= 1) {
      const next = lineup[i + 1];
      const current = lineup[i];
      if (next.x - current.x < GAME_CONFIG.unitMinGap) current.x = next.x - GAME_CONFIG.unitMinGap;
    }
  }
}

export function resolveCombatTick(state: Snapshot, dtSeconds: number): void {
  const byId = new Map(state.units.map((u) => [u.id, u]));
  const playerUnits = state.units.filter((u) => u.team === 'player');
  const aiUnits = state.units.filter((u) => u.team === 'ai');

  for (const unit of state.units) {
    const cfg = UNIT_CONFIG[unit.category];
    unit.cooldown = Math.max(0, unit.cooldown - dtSeconds);
    unit.target_lock = Math.max(0, (unit.target_lock ?? 0) - 1);

    const enemies = unit.team === 'player' ? aiUnits : playerUnits;
    const target = findTarget(unit, enemies, byId);
    if (target && unit.cooldown <= 0) {
      let damage = cfg.damage;
      if (target.category === 'shielded') damage *= 0.85;
      if (Math.random() < cfg.critChance) damage *= 1.25;
      target.hp -= damage;
      unit.cooldown = cfg.attackSpeed;
      unit.state = 'attacking';
      continue;
    }

    const enemyBaseX = unit.team === 'player' ? GAME_CONFIG.laneLength - 45 : 45;
    if (Math.abs(enemyBaseX - unit.x) <= GAME_CONFIG.baseAttackRange) {
      if (unit.cooldown <= 0) {
        if (unit.team === 'player') state.ai_base.hp -= cfg.baseDamage;
        else state.player_base.hp -= cfg.baseDamage;
        unit.cooldown = cfg.attackSpeed;
      }
      unit.state = 'attacking';
      unit.target_id = unit.team === 'player' ? 'base_ai' : 'base_player';
      continue;
    }

    if (shouldHoldForEngagement(unit, enemies)) {
      unit.state = 'attacking';
      continue;
    }

    const mode = unit.team === 'player' ? state.player.command_mode : state.ai.command_mode;
    const speed = speedFor(unit, mode);
    unit.x = unit.team === 'player' ? Math.min(GAME_CONFIG.laneLength - 40, unit.x + speed) : Math.max(40, unit.x - speed);
    unit.state = 'moving';
  }

  state.units = state.units.filter((u) => u.hp > 0);
  resolveSeparation(state.units, 'player');
  resolveSeparation(state.units, 'ai');

  if (state.ai_base.hp <= 0) state.winner = 'player';
  else if (state.player_base.hp <= 0) state.winner = 'ai';
}
