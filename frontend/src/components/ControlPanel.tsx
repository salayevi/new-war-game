import { useState } from 'react';

interface Props {
  sendCommand: (command: string) => void;
  sendChat: (text: string) => void;
}

const commands = [
  'spawn_worker',
  'spawn_melee',
  'spawn_ranged',
  'spawn_shielded',
  'spawn_heavy',
  'defend',
  'push',
  'all_in',
  'tech_up',
];

export function ControlPanel({ sendCommand, sendChat }: Props) {
  const [text, setText] = useState('');

  return (
    <div style={{ color: 'white', fontFamily: 'sans-serif', display: 'grid', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {commands.map((c) => (
          <button key={c} onClick={() => sendCommand(c)}>
            {c}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          sendChat(text.trim());
          setText('');
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Chat with rival AI commander" />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
