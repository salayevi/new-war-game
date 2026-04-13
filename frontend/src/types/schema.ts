export type Team = 'player' | 'ai';
export type UnitCategory = 'worker' | 'melee' | 'ranged' | 'shielded' | 'heavy';
export type CommandType =
  | 'spawn_worker'
  | 'spawn_melee'
  | 'spawn_ranged'
  | 'spawn_shielded'
  | 'spawn_heavy'
  | 'defend'
  | 'push'
  | 'all_in'
  | 'tech_up';

export interface UnitState {
  id: string;
  team: Team;
  category: UnitCategory;
  x: number;
  hp: number;
  max_hp: number;
  cooldown: number;
  target_id?: string | null;
  state?: 'moving' | 'attacking';
  target_lock?: number;
}

export interface SideState {
  gold: number;
  income: number;
  command_mode: 'balanced' | 'defend' | 'push' | 'all_in';
  last_command?: CommandType | null;
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

export interface AIDecision {
  command: CommandType;
  reasoning: string;
  chatLine: string;
  mood: 'focused' | 'calculated' | 'aggressive' | 'adapting' | 'patient' | 'assertive' | 'taunting' | 'confident';
  target?: string;
}
