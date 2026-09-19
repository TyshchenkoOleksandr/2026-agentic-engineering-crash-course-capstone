import type { ClickModifiers, GetClickValue } from "./types";

/** Modifiers used by Stage 1: every click is worth exactly 1. */
export const NEUTRAL_CLICK_MODIFIERS: ClickModifiers = Object.freeze({
  multiplier: 1,
  combo: 1,
  crit: false,
  goldenBonus: 1,
});

export const getClickValue: GetClickValue = () => {
  throw new Error("not implemented");
};
