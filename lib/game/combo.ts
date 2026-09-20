import type {
  CreateComboState,
  GetComboLevel,
  GetComboMultiplier,
  RegisterComboClick,
} from "./types";

/** A press at most this long after the previous one is "fast" and builds the combo (design D7). */
export const COMBO_WINDOW_MS = 500;

/** One combo level is worth +0.1 on the multiplier (design D7). */
export const COMBO_STEP = 0.1;

/** Highest combo level; multiplier cap 1 + 10 × 0.1 = 2 (design D7). */
export const COMBO_MAX_LEVEL = 10;

/** After the window, one level is lost per started 250 ms of pause (design D7). */
export const COMBO_DECAY_MS = 250;

export const createComboState: CreateComboState = () => {
  throw new Error("not implemented");
};

export const getComboLevel: GetComboLevel = () => {
  throw new Error("not implemented");
};

export const getComboMultiplier: GetComboMultiplier = () => {
  throw new Error("not implemented");
};

export const registerComboClick: RegisterComboClick = () => {
  throw new Error("not implemented");
};
