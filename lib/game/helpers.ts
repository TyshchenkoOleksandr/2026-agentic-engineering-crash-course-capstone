import { SHOP_CATALOG } from "./shop";
import type {
  GetHelperClicksPerSecond,
  GetHelperRate,
  HelperId,
  SpeedUpId,
  TickHelpers,
} from "./types";

/** Interval of the single game tick in the page (design D16). */
export const HELPER_TICK_MS = 100;

/** Upper clamp of one tick's elapsed time: no catch-up bursts (design D3). */
export const MAX_TICK_MS = 1000;

/** Speed-up that doubles the rate of each helper type (design D14). */
export const SPEED_UP_OF: Readonly<Record<HelperId, SpeedUpId>> = Object.freeze({
  monkey: "speed-monkey",
  robot: "speed-robot",
  factory: "speed-factory",
});

export const getHelperRate: GetHelperRate = () => {
  throw new Error("not implemented");
};

export const getHelperClicksPerSecond: GetHelperClicksPerSecond = (state) =>
  SHOP_CATALOG.reduce(
    (total, item) =>
      item.kind === "helper" ? total + state.helpers[item.id] * item.clicksPerSecond : total,
    0,
  );

export const tickHelpers: TickHelpers = (state, carry, elapsedMs) => {
  // A throttled tab or a sleeping laptop loses time instead of earning a burst (design D3).
  const elapsed = Number.isFinite(elapsedMs) ? Math.min(Math.max(elapsedMs, 0), MAX_TICK_MS) : 0;
  // Milli-clicks keep the arithmetic integer, so ten 100 ms ticks make exactly one click.
  const milli = carry + getHelperClicksPerSecond(state) * elapsed;
  const whole = Math.floor(milli / 1000);
  if (whole === 0) {
    return { state, carry: milli };
  }
  return {
    // Helper clicks are worth exactly 1 each: click multipliers do not apply (design D2).
    state: { ...state, balance: state.balance + whole, totalClicks: state.totalClicks + whole },
    carry: milli % 1000,
  };
};
