import { clearGame, loadGame, saveGame } from "@/lib/game/save";
import { createInitialState } from "@/lib/game/state";
import type { GameState } from "@/lib/game/types";

// The saved game seen as an external store (mirrors components/preferences-store.ts): React reads
// it through useSyncExternalStore instead of copying it into local state. `null` until the browser
// snapshot is taken, which is exactly the "not loaded yet" state the main button stays disabled for
// (design D7). Every write (click, reset) goes through commitGame/resetGame below so the snapshot
// and localStorage never drift apart, even across a remount.

const listeners = new Set<() => void>();
let snapshot: GameState | null = null;

export function subscribeSavedState(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getSavedStateSnapshot(): GameState | null {
  snapshot ??= loadGame(window.localStorage).state;
  return snapshot;
}

/** Used for SSR and the hydration render: storage is unknown there. */
export function getServerSavedState(): GameState | null {
  return null;
}

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

/** Persists `next` and publishes it as the new snapshot. */
export function commitGame(next: GameState): void {
  saveGame(window.localStorage, next);
  snapshot = next;
  emit();
}

/** Wipes the save and publishes a fresh initial state as the new snapshot. */
export function resetGame(): void {
  clearGame(window.localStorage);
  snapshot = createInitialState();
  emit();
}
