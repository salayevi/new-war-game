export type Team = 'player' | 'ai';
export type UnitCategory = 'worker' | 'melee' | 'ranged' | 'shielded' | 'heavy';

export interface UnitState {
  id: string;
  team: Team;
  category: UnitCategory;
  x: number;
  hp: number;
  max_hp: number;
  cooldown: number;
}

export interface SideState {
  gold: number;
  income: number;
  command_mode: string;
}

export interface BaseState {
  hp: number;
  max_hp: number;
}

export interface Snapshot {
  match_id: string;
  tick: number;
  lane_length: number;
  player: SideState;
  ai: SideState;
  player_base: BaseState;
  ai_base: BaseState;
  units: UnitState[];
  winner: Team | null;
}

export interface ChatMessage {
  from_id: 'player' | 'ai';
  text: string;
  tick: number;
}
