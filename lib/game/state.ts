import { getClickValue } from "./click-value";
import type { ClickMainButton, CreateInitialState, IsBalanceVisible } from "./types";

export const createInitialState: CreateInitialState = () => ({
  balance: 0,
  totalClicks: 0,
  ownedSkins: [],
  enabledSkins: [],
  material: "classic",
  decor: [],
  upgrades: [],
  helpers: { monkey: 0, robot: 0, factory: 0 },
  levels: { crit: 0, "speed-monkey": 0, "speed-robot": 0, "speed-factory": 0 },
});

/** One press: balance grows by the click value, totalClicks always by 1 (design D3). */
export const clickMainButton: ClickMainButton = (state, modifiers) => ({
  ...state,
  balance: state.balance + getClickValue(modifiers),
  totalClicks: state.totalClicks + 1,
});

/** The counter appears only after the first press, then stays (even at balance 0). */
export const isBalanceVisible: IsBalanceVisible = (state) => state.totalClicks > 0;
