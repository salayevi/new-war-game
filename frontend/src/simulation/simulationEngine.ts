import { GAME_CONFIG } from '../config/unitConfig';
import type { CommandType, Snapshot } from '../types/schema';
import { applyEconomyTick } from './economySystem';
import { applyCommand } from './spawnSystem';
import { resolveCombatTick } from './combatResolver';

export function stepSimulation(state: Snapshot): void {
  if (state.winner) return;

  state.tick += 1;
  applyEconomyTick(state);
  resolveCombatTick(state, 1 / GAME_CONFIG.tickRate);
}

export function runPlayerCommand(state: Snapshot, command: CommandType): void {
  applyCommand(state, 'player', command);
}

export function runAICommand(state: Snapshot, command: CommandType): void {
  applyCommand(state, 'ai', command);
}
