import Phaser from 'phaser';
import { useEffect, useMemo, useRef } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { LaneScene } from './game/LaneScene';
import { useMatchSocket } from './hooks/useMatchSocket';

export default function App() {
  const { state, chat, sendCommand, sendChat } = useMatchSocket();
  const mountRef = useRef<HTMLDivElement>(null);

  const scene = useMemo(() => new LaneScene(), []);

  useEffect(() => {
    if (!mountRef.current) return;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 1000,
      height: 480,
      parent: mountRef.current,
      scene: [scene],
      backgroundColor: '#111827',
    });

    return () => {
      game.destroy(true);
    };
  }, [scene]);

  useEffect(() => {
    if (state) {
      scene.setSnapshot(state);
    }
  }, [state, scene]);

  return (
    <div style={{ background: '#0b1020', minHeight: '100vh', padding: '8px' }}>
      <div ref={mountRef} />
      <ControlPanel sendCommand={sendCommand} sendChat={sendChat} />
      <div style={{ color: '#ddd', fontFamily: 'monospace', marginTop: '8px' }}>
        <h3>Rival Comms</h3>
        {chat.slice(-6).map((line, i) => (
          <div key={`${line.tick}-${i}`}>
            [{line.from_id}] t{line.tick}: {line.text}
          </div>
        ))}
        {state && (
          <div>
            Tick {state.tick} | Gold {state.player.gold} vs {state.ai.gold} | Bases {Math.round(state.player_base.hp)} / {Math.round(state.ai_base.hp)}
          </div>
        )}
      </div>
    </div>
  );
}
