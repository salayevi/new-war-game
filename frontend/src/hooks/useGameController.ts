import { useCallback, useEffect, useRef, useState } from 'react';
import { decideAI } from '../ai/commander';
import { pushAIDecisionChat, pushPlayerChat } from '../chat/chatSystem';
import { GAME_CONFIG } from '../config/unitConfig';
import { createInitialState } from '../state/createInitialState';
import type { AIDecision, ChatMessage, CommandType, Snapshot } from '../types/schema';
import { runAICommand, runPlayerCommand, stepSimulation } from '../simulation/simulationEngine';

export function useGameController() {
  const stateRef = useRef<Snapshot>(createInitialState());
  const chatRef = useRef<ChatMessage[]>([]);
  const aiDecisionRef = useRef<AIDecision | null>(null);

  const [state, setState] = useState<Snapshot>(stateRef.current);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [aiStatus, setAIStatus] = useState<AIDecision | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = structuredClone(stateRef.current);
      stepSimulation(next);

      if (next.tick % GAME_CONFIG.aiDecisionTicks === 0 && !next.winner) {
        const decision = decideAI(next);
        aiDecisionRef.current = decision;
        setAIStatus(decision);
        runAICommand(next, decision.command);
      }

      if (next.tick % GAME_CONFIG.aiChatTicks === 0 && aiDecisionRef.current) {
        const nextChat = pushAIDecisionChat(chatRef.current, aiDecisionRef.current, next.tick, next);
        chatRef.current = nextChat;
        setChat(nextChat);
      }

      stateRef.current = next;
      setState(next);
    }, 1000 / GAME_CONFIG.tickRate);

    return () => window.clearInterval(timer);
  }, []);

  const sendCommand = useCallback((command: string) => {
    const typed = command as CommandType;
    const next = structuredClone(stateRef.current);
    runPlayerCommand(next, typed);
    stateRef.current = next;
    setState(next);
  }, []);

  const sendChat = useCallback((text: string) => {
    const nextChat = pushPlayerChat(chatRef.current, text, stateRef.current.tick);
    chatRef.current = nextChat;
    setChat(nextChat);
  }, []);

  const restart = useCallback(() => {
    const next = createInitialState();
    stateRef.current = next;
    chatRef.current = [];
    aiDecisionRef.current = null;
    setState(next);
    setChat([]);
    setAIStatus(null);
  }, []);

  return { state, chat, sendCommand, sendChat, restart, aiStatus };
}
