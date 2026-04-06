import type { AIDecision, CommandType, Snapshot } from '../types/schema';

export function decideAI(state: Snapshot): AIDecision {
  const aiUnits = state.units.filter((u) => u.team === 'ai');
  const playerUnits = state.units.filter((u) => u.team === 'player');
  const aiWorkers = aiUnits.filter((u) => u.category === 'worker').length;

  let command: CommandType = 'spawn_melee';
  let reasoning = 'Balancing pressure and economy.';
  let mood: AIDecision['mood'] = 'confident';
  let target: string | undefined;

  if (state.ai.gold >= 120 && aiWorkers < 4) {
    command = 'spawn_worker';
    reasoning = 'Economy first. Extra workers fuel my next timing push.';
    mood = 'focused';
  } else if (state.ai_base.hp < state.player_base.hp * 0.55) {
    command = 'defend';
    reasoning = 'My base is under pressure, so I am stabilizing the front.';
    mood = 'calculated';
    target = 'home_front';
  } else {
    const frontlineDelta = aiUnits.length - playerUnits.length;
    if (state.ai.gold >= 260 && frontlineDelta > 2) {
      command = 'all_in';
      reasoning = 'I have momentum and reserves. I am committing to a decisive strike.';
      mood = 'aggressive';
      target = 'enemy_base';
    } else if (state.ai.gold >= 220 && playerUnits.some((u) => u.category === 'shielded')) {
      command = 'spawn_heavy';
      reasoning = 'Heavy units counter your shield wall more reliably.';
      mood = 'adapting';
    } else if (state.ai.gold >= 150 && state.ai.income < state.player.income) {
      command = 'tech_up';
      reasoning = 'I am behind on income. Tech now, pressure later.';
      mood = 'patient';
    } else if (state.ai.gold >= 140) {
      command = 'spawn_ranged';
      reasoning = 'Ranged support improves my trades.';
      mood = 'assertive';
    }
  }

  if (state.player_base.hp < state.ai_base.hp * 0.4) {
    reasoning = 'You are cornered. One synchronized wave ends this battle.';
    mood = 'taunting';
  }

  return {
    command,
    reasoning,
    mood,
    target,
    chatLine: buildChatLine(reasoning, mood),
  };
}

function buildChatLine(reasoning: string, mood: AIDecision['mood']) {
  const prefix = {
    focused: 'Stay sharp',
    calculated: 'Read this carefully',
    aggressive: 'Brace yourself',
    adapting: 'I learn quickly',
    patient: 'War rewards patience',
    assertive: 'Watch the lane',
    taunting: 'General to general',
    confident: 'I see the board',
  } as const;

  return `${prefix[mood]}: ${reasoning}`;
}
