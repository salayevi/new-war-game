import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage, Snapshot } from '../types/schema';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws/match';

export function useMatchSocket() {
  const [state, setState] = useState<Snapshot | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'state') {
        setState(msg.payload as Snapshot);
      }
      if (msg.type === 'chat') {
        setChat((prev) => [...prev.slice(-10), msg.payload as ChatMessage]);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendCommand = useMemo(
    () => (command: string) => wsRef.current?.send(JSON.stringify({ type: 'player_command', command })),
    []
  );

  const sendChat = useMemo(
    () => (text: string) => wsRef.current?.send(JSON.stringify({ type: 'player_chat', text })),
    []
  );

  return { state, chat, sendCommand, sendChat };
}
