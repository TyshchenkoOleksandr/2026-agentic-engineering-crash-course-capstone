import type { ClickModifiers, GetClickValue } from "./types";

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
