import type {
  Achievement,
  AdvanceToastQueue,
  CreateToastQueue,
  EnqueueToasts,
  EvaluateAchievements,
  GetAchievement,
  GetAchievementProgress,
  GetAchievementStats,
  IsAchievementUnlocked,
} from "./types";

/** How long one achievement toast stays on screen (design D13). */
export const ACHIEVEMENT_TOAST_MS = 4000;

/** Pause between two toasts, so they never overlap (design D13). */
export const ACHIEVEMENT_TOAST_GAP_MS = 300;

/**
 * The 30 achievements in display order, which is also the canonical order of `trophies.unlocked`
 * (design D10). They are data, not closures: the predicate is always
 * `stats[metric] >= threshold`, so the catalog stays pure and exhaustively testable.
 */
export const ACHIEVEMENTS: readonly Achievement[] = Object.freeze([
  { id: "first-click", category: "clicks", metric: "totalClicks", threshold: 1 },
  { id: "clicks-100", category: "clicks", metric: "totalClicks", threshold: 100 },
  { id: "clicks-1000", category: "clicks", metric: "totalClicks", threshold: 1000 },
  { id: "clicks-10000", category: "clicks", metric: "totalClicks", threshold: 10000 },
  { id: "clicks-100000", category: "clicks", metric: "totalClicks", threshold: 100000 },
  { id: "balance-1000", category: "balance", metric: "balance", threshold: 1000 },
  { id: "balance-50000", category: "balance", metric: "balance", threshold: 50000 },
  { id: "first-purchase", category: "purchases", metric: "purchases", threshold: 1 },
  { id: "purchases-10", category: "purchases", metric: "purchases", threshold: 10 },
  { id: "purchases-25", category: "purchases", metric: "purchases", threshold: 25 },
  { id: "skins-3", category: "skins", metric: "skinsOwned", threshold: 3 },
  { id: "skins-all", category: "skins", metric: "skinsOwned", threshold: 5 },
  { id: "gold-equipped", category: "skins", metric: "goldEquipped", threshold: 1 },
  { id: "first-decor", category: "decor", metric: "decorOwned", threshold: 1 },
  { id: "decor-all", category: "decor", metric: "decorOwned", threshold: 3 },
  { id: "cat-nap", category: "decor", metric: "catOwned", threshold: 1 },
  { id: "first-video", category: "video", metric: "videosOwned", threshold: 1 },
  { id: "videos-all", category: "video", metric: "videosOwned", threshold: 10 },
  { id: "first-helper", category: "helpers", metric: "helpersTotal", threshold: 1 },
  { id: "helpers-10", category: "helpers", metric: "helpersTotal", threshold: 10 },
  { id: "factory-owner", category: "helpers", metric: "factories", threshold: 1 },
  { id: "first-crit", category: "crit", metric: "crits", threshold: 1 },
  { id: "crits-100", category: "crit", metric: "crits", threshold: 100 },
  { id: "combo-5", category: "combo", metric: "maxComboLevel", threshold: 5 },
  { id: "combo-max", category: "combo", metric: "maxComboLevel", threshold: 10 },
  { id: "first-golden", category: "golden", metric: "goldenCaught", threshold: 1 },
  { id: "golden-10", category: "golden", metric: "goldenCaught", threshold: 10 },
  { id: "reset-once", category: "reset", metric: "resets", threshold: 1 },
  { id: "achievements-10", category: "meta", metric: "achievementsUnlocked", threshold: 10 },
  { id: "achievements-all", category: "meta", metric: "achievementsUnlocked", threshold: 29 },
] as const satisfies readonly Achievement[]);

export const getAchievement: GetAchievement = () => {
  throw new Error("not implemented");
};

export const isAchievementUnlocked: IsAchievementUnlocked = () => {
  throw new Error("not implemented");
};

export const getAchievementProgress: GetAchievementProgress = () => {
  throw new Error("not implemented");
};

export const getAchievementStats: GetAchievementStats = () => {
  throw new Error("not implemented");
};

export const evaluateAchievements: EvaluateAchievements = () => {
  throw new Error("not implemented");
};

export const createToastQueue: CreateToastQueue = () => {
  throw new Error("not implemented");
};

export const enqueueToasts: EnqueueToasts = () => {
  throw new Error("not implemented");
};

export const advanceToastQueue: AdvanceToastQueue = () => {
  throw new Error("not implemented");
};
