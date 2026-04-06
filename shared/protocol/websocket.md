# WebSocket Protocol (MVP)

Endpoint: `ws://<host>:8000/ws/match`

## Client -> Server

### Player command
```json
{
  "type": "player_command",
  "command": "spawn_melee"
}
```

Supported `command` values:
- `spawn_worker`
- `spawn_melee`
- `spawn_ranged`
- `spawn_shielded`
- `spawn_heavy`
- `defend`
- `push`
- `all_in`
- `tech_up`

### Player chat
```json
{
  "type": "player_chat",
  "text": "You won’t break my line."
}
```

## Server -> Client

### State update
```json
{
  "type": "state",
  "payload": { "tick": 120, "...": "see shared schema" }
}
```

### Chat update
```json
{
  "type": "chat",
  "payload": {
    "from_id": "ai",
    "text": "I'm shifting to a push stance.",
    "tick": 120
  }
}
```
