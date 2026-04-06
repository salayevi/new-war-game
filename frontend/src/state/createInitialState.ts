import { GAME_CONFIG } from '../config/unitConfig';
import type { Snapshot } from '../types/schema';

export function createInitialState(): Snapshot {
  return {
    match_id: 'local-match',
    tick: 0,
    lane_length: GAME_CONFIG.laneLength,
    player: { gold: GAME_CONFIG.startingGold, income: 0, command_mode: 'balanced', last_command: null },
    ai: { gold: GAME_CONFIG.startingGold, income: 0, command_mode: 'balanced', last_command: null },
    player_base: { hp: GAME_CONFIG.baseHp, max_hp: GAME_CONFIG.baseHp },
    ai_base: { hp: GAME_CONFIG.baseHp, max_hp: GAME_CONFIG.baseHp },
    units: [],
    winner: null,
  };
}
