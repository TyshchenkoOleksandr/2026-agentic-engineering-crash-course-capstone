import type {
  BuildEmbedUrl,
  GetActiveVideos,
  GetVideoEntry,
  Size,
  VideoEntry,
} from "./types";

/** Privacy-friendly embed host; the only provider of Stage 4 (design D6). */
export const VIDEO_EMBED_HOST = "https://www.youtube-nocookie.com";

/** 16:9 box every video decor is rendered and placed with (design D5). */
export const VIDEO_SIZE: Size = Object.freeze({ width: 192, height: 108 });

/** At most this many iframes exist at any time; the rest stay on their placeholder (design D5). */
export const MAX_ACTIVE_VIDEOS = 3;

/** A frame that does not fire `load` within this many ms falls back to `offline` (design D7). */
export const VIDEO_LOAD_TIMEOUT_MS = 5000;

/**
 * The ten video decor entries in catalog order (design D3). The `videoId` values are placeholders
 * of the right shape until the human pastes the real ids in; swapping a video means editing only
 * this array.
 */
export const VIDEO_DECOR: readonly VideoEntry[] = Object.freeze([
  { id: "video-runner", provider: "youtube-nocookie", videoId: "PLACEHLDR01" },
  { id: "video-parkour", provider: "youtube-nocookie", videoId: "PLACEHLDR02" },
  { id: "video-soap", provider: "youtube-nocookie", videoId: "PLACEHLDR03" },
  { id: "video-kinetic-sand", provider: "youtube-nocookie", videoId: "PLACEHLDR04" },
  { id: "video-slime", provider: "youtube-nocookie", videoId: "PLACEHLDR05" },
  { id: "video-hydraulic", provider: "youtube-nocookie", videoId: "PLACEHLDR06" },
  { id: "video-marble", provider: "youtube-nocookie", videoId: "PLACEHLDR07" },
  { id: "video-aquarium", provider: "youtube-nocookie", videoId: "PLACEHLDR08" },
  { id: "video-fireplace", provider: "youtube-nocookie", videoId: "PLACEHLDR09" },
  { id: "video-rain", provider: "youtube-nocookie", videoId: "PLACEHLDR10" },
] as const satisfies readonly VideoEntry[]);

export const getVideoEntry: GetVideoEntry = () => {
  throw new Error("not implemented");
};

export const buildEmbedUrl: BuildEmbedUrl = () => {
  throw new Error("not implemented");
};

export const getActiveVideos: GetActiveVideos = () => {
  throw new Error("not implemented");
};
