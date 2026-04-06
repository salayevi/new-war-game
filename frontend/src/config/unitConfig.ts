import type { CommandType, UnitCategory } from '../types/schema';

export interface UnitConfig {
  cost: number;
  hp: number;
  damage: number;
  baseDamage: number;
  attackSpeed: number;
  range: number;
  speed: number;
  critChance: number;
}

export const UNIT_CONFIG: Record<UnitCategory, UnitConfig> = {
  worker: { cost: 80, hp: 70, damage: 6, baseDamage: 4, attackSpeed: 1.1, range: 20, speed: 1.4, critChance: 0 },
  melee: { cost: 110, hp: 160, damage: 20, baseDamage: 10, attackSpeed: 0.9, range: 24, speed: 1.1, critChance: 0.05 },
  ranged: { cost: 140, hp: 110, damage: 24, baseDamage: 10, attackSpeed: 1.1, range: 150, speed: 0.9, critChance: 0.1 },
  shielded: { cost: 150, hp: 240, damage: 14, baseDamage: 8, attackSpeed: 1.2, range: 22, speed: 0.8, critChance: 0 },
  heavy: { cost: 220, hp: 320, damage: 38, baseDamage: 18, attackSpeed: 1.4, range: 28, speed: 0.7, critChance: 0.12 },
};

export const COMMAND_TO_CATEGORY: Partial<Record<CommandType, UnitCategory>> = {
  spawn_worker: 'worker',
  spawn_melee: 'melee',
  spawn_ranged: 'ranged',
  spawn_shielded: 'shielded',
  spawn_heavy: 'heavy',
};

export const GAME_CONFIG = {
  tickRate: 10,
  laneLength: 1000,
  baseHp: 2500,
  startingGold: 300,
  aiDecisionTicks: 20,
  aiChatTicks: 30,
  workerIncomeTicks: 12,
  workerIncomeStartTick: 24,
  workerBaseIncome: 5,
  unitMinGap: 10,
  targetLockTicks: 8,
  baseAttackRange: 50,
};
