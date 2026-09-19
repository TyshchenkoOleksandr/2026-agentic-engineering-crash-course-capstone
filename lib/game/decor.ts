import type { DecorRect, PlaceDecor, RectsOverlap } from "./types";

/** Distance kept from the viewport edges, in CSS px (design D9). */
export const DECOR_MARGIN = 16;

/** Free space kept around a decor item when testing overlap, in CSS px (design D9). */
export const DECOR_GAP = 16;

/** Random candidates tried before giving up with `null` (design D9). */
export const DECOR_MAX_ATTEMPTS = 50;

export const rectsOverlap: RectsOverlap = () => {
  throw new Error("not implemented");
};

export const placeDecor: PlaceDecor = () => {
  throw new Error("not implemented");
};

export const decorRect: DecorRect = () => {
  throw new Error("not implemented");
};
