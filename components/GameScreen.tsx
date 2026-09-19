"use client";

import { useCallback, useSyncExternalStore } from "react";
import { NEUTRAL_CLICK_MODIFIERS } from "@/lib/game/click-value";
import { clickMainButton, isBalanceVisible } from "@/lib/game/state";
import { BalanceCounter } from "./BalanceCounter";
import {
  commitGame,
  getSavedStateSnapshot,
  getServerSavedState,
  resetGame,
  subscribeSavedState,
} from "./game-store";
import { LanguageToggle } from "./LanguageToggle";
import { MainButton } from "./MainButton";
import { ResetProgress } from "./ResetProgress";
import { ThemeToggle } from "./ThemeToggle";

export function GameScreen() {
  // `null` until the saved game has been read in the browser: the button stays disabled, so a
  // click can never be overwritten by the load (design D7). Every write goes through game-store's
  // commitGame/resetGame, which persist and publish the new snapshot in one step.
  const state = useSyncExternalStore(subscribeSavedState, getSavedStateSnapshot, getServerSavedState);
  const loaded = state !== null;

  const handleClick = useCallback(() => {
    if (state) {
      commitGame(clickMainButton(state, NEUTRAL_CLICK_MODIFIERS));
    }
  }, [state]);

  const handleReset = useCallback(() => {
    resetGame();
  }, []);

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-4 px-6">
      <div className="fixed right-4 top-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <BalanceCounter
        balance={state?.balance ?? 0}
        visible={state !== null && isBalanceVisible(state)}
        loaded={loaded}
      />
      <MainButton enabled={loaded} onClick={handleClick} />
      <ResetProgress onConfirm={handleReset} />
    </main>
  );
}
