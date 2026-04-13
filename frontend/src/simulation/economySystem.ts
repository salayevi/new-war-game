import { GAME_CONFIG } from '../config/unitConfig';
import type { Snapshot, Team } from '../types/schema';

function workerIncome(state: Snapshot, team: Team): number {
  const workers = state.units.filter((u) => u.team === team && u.category === 'worker').length;
  if (workers === 0) return 0;
  return Math.floor(GAME_CONFIG.workerBaseIncome * workers + 0.6 * Math.max(workers - 2, 0));
}

export function applyEconomyTick(state: Snapshot): void {
  state.player.gold += Math.max(1, state.player.income);
  state.ai.gold += Math.max(1, state.ai.income);

  if (state.tick >= GAME_CONFIG.workerIncomeStartTick && state.tick % GAME_CONFIG.workerIncomeTicks === 0) {
    state.player.gold += workerIncome(state, 'player');
    state.ai.gold += workerIncome(state, 'ai');
  }
}
