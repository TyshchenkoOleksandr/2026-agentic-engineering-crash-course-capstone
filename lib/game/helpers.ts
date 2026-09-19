import type { GetHelperClicksPerSecond, TickHelpers } from "./types";

/** Interval of the single game tick in the page (design D16). */
export const HELPER_TICK_MS = 100;

/** Upper clamp of one tick's elapsed time: no catch-up bursts (design D3). */
export const MAX_TICK_MS = 1000;

export const getHelperClicksPerSecond: GetHelperClicksPerSecond = () => {
  throw new Error("not implemented");
};

export const tickHelpers: TickHelpers = () => {
  throw new Error("not implemented");
};
