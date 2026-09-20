import type {
  CatchGolden,
  CreateGoldenState,
  GetGoldenBonus,
  RollGoldenInterval,
  Size,
  TickGolden,
} from "./types";

/** Shortest / longest random pause between two golden buttons (design D8). */
export const GOLDEN_MIN_INTERVAL_MS = 30000;
export const GOLDEN_MAX_INTERVAL_MS = 90000;

/** How long one golden button stays on screen (design D8). */
export const GOLDEN_LIFETIME_MS = 5000;

/** Click value multiplier while the bonus runs, and how long it runs (design D8). */
export const GOLDEN_BONUS = 7;
export const GOLDEN_BONUS_MS = 30000;

/** On-screen size of the golden button in CSS px (design D8). */
export const GOLDEN_SIZE: Size = Object.freeze({ width: 64, height: 64 });

export const rollGoldenInterval: RollGoldenInterval = () => {
  throw new Error("not implemented");
};

export const createGoldenState: CreateGoldenState = () => {
  throw new Error("not implemented");
};

export const tickGolden: TickGolden = () => {
  throw new Error("not implemented");
};

export const catchGolden: CatchGolden = () => {
  throw new Error("not implemented");
};

export const getGoldenBonus: GetGoldenBonus = () => {
  throw new Error("not implemented");
};
