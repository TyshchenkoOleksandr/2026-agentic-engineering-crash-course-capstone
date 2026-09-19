import { getClickValue } from "./click-value";
import type { ClickMainButton, CreateInitialState, IsBalanceVisible } from "./types";

export const createInitialState: CreateInitialState = () => ({ balance: 0, totalClicks: 0 });

/** One press: balance grows by the click value, totalClicks always by 1 (design D3). */
export const clickMainButton: ClickMainButton = (state, modifiers) => ({
  balance: state.balance + getClickValue(modifiers),
  totalClicks: state.totalClicks + 1,
});

/** The counter appears only after the first press, then stays (even at balance 0). */
export const isBalanceVisible: IsBalanceVisible = (state) => state.totalClicks > 0;
