import type { AIDecision, ChatMessage, Snapshot } from '../types/schema';

export function pushPlayerChat(chat: ChatMessage[], text: string, tick: number): ChatMessage[] {
  return [...chat.slice(-14), { from_id: 'player', text, tick }];
}

export function pushAIDecisionChat(chat: ChatMessage[], decision: AIDecision, tick: number, state: Snapshot): ChatMessage[] {
  let line = decision.chatLine;

  if (state.ai_base.hp < state.player_base.hp * 0.45) {
    line = 'Hold your line all you want, I am reorganizing for defense.';
  } else if (state.player_base.hp < state.ai_base.hp * 0.45) {
    line = 'Your base is cracking. I can feel your command structure collapsing.';
  }

  return [...chat.slice(-14), { from_id: 'ai', text: line, tick }];
}
