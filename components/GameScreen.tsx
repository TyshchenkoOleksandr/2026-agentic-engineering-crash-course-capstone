"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { getClickModifiers, getClickValue } from "@/lib/game/click-value";
import { HELPER_TICK_MS } from "@/lib/game/helpers";
import { getButtonAppearance } from "@/lib/game/skins";
import { isShopVisible } from "@/lib/game/shop";
import { clickMainButton, isBalanceVisible } from "@/lib/game/state";
import type { DecorId, ShopItem, SkinId } from "@/lib/game/types";
import { BalanceCounter } from "./BalanceCounter";
import { chooseDecorPosition, DecorLayer } from "./DecorLayer";
import {
  buy,
  commitGame,
  getSavedStateSnapshot,
  getServerSavedState,
  resetGame,
  subscribeSavedState,
  tick,
  toggle,
} from "./game-store";
import { HelperZone } from "./HelperZone";
import { LanguageToggle } from "./LanguageToggle";
import { MainButton } from "./MainButton";
import { ResetProgress } from "./ResetProgress";
import { ShopBox } from "./ShopBox";
import { ThemeToggle } from "./ThemeToggle";

export function GameScreen() {
  // `null` until the saved game has been read in the browser: the button stays disabled, so a
  // click can never be overwritten by the load (design D7). Every write goes through game-store's
  // commitGame/resetGame, which persist and publish the new snapshot in one step.
  const state = useSyncExternalStore(subscribeSavedState, getSavedStateSnapshot, getServerSavedState);
  const loaded = state !== null;

  const handleClick = useCallback(() => {
    if (state) {
      commitGame(clickMainButton(state, getClickModifiers(state)));
    }
  }, [state]);

  const handleReset = useCallback(() => {
    resetGame();
  }, []);

  const handleBuy = useCallback((item: ShopItem) => {
    // Decor needs a free spot on the current screen, measured right before the purchase (D10).
    if (item.kind === "decor") {
      const placed = getSavedStateSnapshot()?.decor ?? [];
      buy(item.id, { decorPosition: chooseDecorPosition(item.id as DecorId, placed) });
      return;
    }
    buy(item.id);
  }, []);

  const handleToggle = useCallback((id: SkinId) => {
    toggle(id);
  }, []);

  // One interval drives every helper (design D16). It always reads the latest snapshot inside
  // `tick`, so it never closes over a stale state, and it only saves when a whole click lands.
  useEffect(() => {
    if (!loaded) {
      return;
    }
    let last = performance.now();
    const interval = window.setInterval(() => {
      const now = performance.now();
      const elapsed = now - last;
      last = now;
      tick(elapsed);
    }, HELPER_TICK_MS);
    return () => window.clearInterval(interval);
  }, [loaded]);

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-4 px-6">
      <div className="fixed right-4 top-4 z-20 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {state && isShopVisible(state) && (
        <ShopBox state={state} onBuy={handleBuy} onToggle={handleToggle} />
      )}

      <BalanceCounter
        balance={state?.balance ?? 0}
        visible={state !== null && isBalanceVisible(state)}
        loaded={loaded}
      />
      <MainButton
        enabled={loaded}
        onClick={handleClick}
        appearance={
          state ? getButtonAppearance(state) : { stack: [], material: "classic" }
        }
        clickValue={state ? getClickValue(getClickModifiers(state)) : 1}
      />
      <ResetProgress onConfirm={handleReset} />

      <DecorLayer decor={state?.decor ?? []} />
      <HelperZone state={state} />
    </main>
  );
}
