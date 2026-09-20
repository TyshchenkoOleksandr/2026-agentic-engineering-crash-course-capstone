import type {
  ClickModifiers,
  CreditClick,
  GetClickModifiers,
  GetClickMultiplier,
  GetClickValue,
} from "./types";

/** Modifiers used by Stage 1: every click is worth exactly 1. */
export const NEUTRAL_CLICK_MODIFIERS: ClickModifiers = Object.freeze({
  multiplier: 1,
  combo: 1,
  crit: false,
  goldenBonus: 1,
});

/** value = 1 × multiplier × combo × (crit ? 10 : 1) × goldenBonus (design D2). */
export const getClickValue: GetClickValue = (modifiers) =>
  1 * modifiers.multiplier * modifiers.combo * (modifiers.crit ? 10 : 1) * modifiers.goldenBonus;

/** Credits whole clicks and keeps the fractional remainder in memory (design D9). */
export const creditClick: CreditClick = () => {
  throw new Error("not implemented");
};

/** 3 with Triple click, else 2 with Double click, else 1 (specs/click-upgrades). */
export const getClickMultiplier: GetClickMultiplier = (state) => {
  if (state.upgrades.includes("triple-click")) {
    return 3;
  }
  return state.upgrades.includes("double-click") ? 2 : 1;
};

/** Stage 2 modifiers: multiplier from upgrades, everything else neutral. */
export const getClickModifiers: GetClickModifiers = (state) => ({
  ...NEUTRAL_CLICK_MODIFIERS,
  multiplier: getClickMultiplier(state),
});
