import type { PlacedVideo, Size } from "./types";

/**
 * Moves later placed videos off earlier ones (design D23). Stub until the green phase.
 */
export function separatePlacedVideos(
  _videos: readonly PlacedVideo[],
  _viewport: Size,
): readonly PlacedVideo[] {
  throw new Error("not implemented");
}
