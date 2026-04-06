import { useGameController } from './useGameController';

// Backward-compatible adapter: socket runtime removed in frontend-only mode.
export function useMatchSocket() {
  return useGameController();
}
