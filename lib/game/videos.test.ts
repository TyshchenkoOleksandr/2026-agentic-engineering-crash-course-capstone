import { describe, expect, it } from "vitest";
import {
  buildEmbedUrl,
  getActiveVideos,
  getVideoEntry,
  MAX_ACTIVE_VIDEOS,
  VIDEO_DECOR,
  VIDEO_EMBED_HOST,
  VIDEO_LOAD_TIMEOUT_MS,
  VIDEO_SIZE,
} from "./videos";
import type { PlacedVideo, VideoDecorId, VideoEntry } from "./types";

// ---------------------------------------------------------------------------
// Helpers (notation from openspec/changes/add-content-v3/design.md)
// ---------------------------------------------------------------------------

const CATALOG_IDS: readonly VideoDecorId[] = [
  "video-runner",
  "video-parkour",
  "video-soap",
  "video-kinetic-sand",
  "video-slime",
  "video-hydraulic",
  "video-marble",
  "video-aquarium",
  "video-fireplace",
  "video-rain",
];

const EXPECTED_ENTRIES: readonly VideoEntry[] = CATALOG_IDS.map((id, index) => ({
  id,
  provider: "youtube-nocookie",
  videoId: `PLACEHLDR${String(index + 1).padStart(2, "0")}`,
}));

function placed(id: VideoDecorId, x: number | null, y = 0.5): PlacedVideo {
  return { id, position: x === null ? null : { x, y } };
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

// ---------------------------------------------------------------------------
// Video catalog module
// ---------------------------------------------------------------------------

describe("video-decor: Video catalog module", () => {
  it("Catalog ids, order and constants", () => {
    expect(VIDEO_DECOR.map((v) => v.id)).toEqual(CATALOG_IDS);
    expect(VIDEO_SIZE).toStrictEqual({ width: 192, height: 108 });
    expect(MAX_ACTIVE_VIDEOS).toBe(3);
    expect(VIDEO_LOAD_TIMEOUT_MS).toBe(5000);
    expect(VIDEO_EMBED_HOST).toBe("https://www.youtube-nocookie.com");
  });

  it("Catalog entries", () => {
    expect(VIDEO_DECOR).toEqual(EXPECTED_ENTRIES);
    expect(getVideoEntry("video-runner")).toEqual({
      id: "video-runner",
      provider: "youtube-nocookie",
      videoId: "PLACEHLDR01",
    });
    expect(getVideoEntry("video-rain")).toEqual({
      id: "video-rain",
      provider: "youtube-nocookie",
      videoId: "PLACEHLDR10",
    });
    for (const entry of VIDEO_DECOR) {
      expect(getVideoEntry(entry.id)).toEqual(entry);
    }

    const videoIds = VIDEO_DECOR.map((v) => v.videoId);
    expect(new Set(videoIds).size).toBe(VIDEO_DECOR.length);
    for (const entry of VIDEO_DECOR) {
      expect(typeof entry.videoId).toBe("string");
      expect(entry.videoId.length).toBeGreaterThan(0);
      expect(entry.provider).toBe("youtube-nocookie");
    }
  });
});

// ---------------------------------------------------------------------------
// Embed URL
// ---------------------------------------------------------------------------

describe("video-decor: Embed URL", () => {
  it("Default parameters", () => {
    expect(buildEmbedUrl(getVideoEntry("video-runner"))).toBe(
      "https://www.youtube-nocookie.com/embed/PLACEHLDR01?autoplay=1&mute=1&loop=1" +
        "&playlist=PLACEHLDR01&controls=0&modestbranding=1&playsinline=1&rel=0" +
        "&disablekb=1&iv_load_policy=3",
    );
  });

  it("Start offset", () => {
    const withStart = buildEmbedUrl({
      id: "video-soap",
      provider: "youtube-nocookie",
      videoId: "PLACEHLDR03",
      startSeconds: 90,
    });
    expect(withStart.endsWith("&iv_load_policy=3&start=90")).toBe(true);
    expect(
      withStart.startsWith("https://www.youtube-nocookie.com/embed/PLACEHLDR03?autoplay=1&mute=1"),
    ).toBe(true);

    for (const startSeconds of [0, -5, 1.5]) {
      const url = buildEmbedUrl({
        id: "video-soap",
        provider: "youtube-nocookie",
        videoId: "PLACEHLDR03",
        startSeconds,
      });
      expect(url).not.toContain("start=");
    }
  });

  it("Every catalog entry builds a same-host URL", () => {
    const urls = VIDEO_DECOR.map((entry) => buildEmbedUrl(entry));
    urls.forEach((url, index) => {
      expect(url.startsWith("https://www.youtube-nocookie.com/embed/")).toBe(true);
      expect(url).toContain("mute=1");
      expect(url).toContain("loop=1");
      expect(url).toContain(`playlist=${VIDEO_DECOR[index].videoId}`);
    });
    expect(new Set(urls).size).toBe(urls.length);
  });
});

// ---------------------------------------------------------------------------
// At most three active videos
// ---------------------------------------------------------------------------

describe("video-decor: At most three active videos", () => {
  it("Fewer than the cap", () => {
    const input = [placed("video-runner", 0.1, 0.1), placed("video-soap", 0.2, 0.2)];
    expect(getActiveVideos(input).map((v) => v.id)).toEqual(["video-runner", "video-soap"]);
  });

  it("The cap holds", () => {
    const input = [
      placed("video-runner", 0.1),
      placed("video-parkour", 0.2),
      placed("video-soap", 0.3),
      placed("video-slime", 0.4),
      placed("video-rain", 0.5),
    ];
    expect(getActiveVideos(input).map((v) => v.id)).toEqual([
      "video-runner",
      "video-parkour",
      "video-soap",
    ]);
  });

  it("Docked videos never take a slot", () => {
    const input = [
      placed("video-runner", null),
      placed("video-parkour", 0.3, 0.3),
      placed("video-soap", null),
      placed("video-slime", 0.4, 0.4),
    ];
    expect(getActiveVideos(input).map((v) => v.id)).toEqual(["video-parkour", "video-slime"]);
  });

  it("Empty input", () => {
    expect(getActiveVideos([])).toEqual([]);
  });

  it("Does not mutate its input", () => {
    const input = deepFreeze([placed("video-runner", 0.1), placed("video-parkour", null)]);
    let result: readonly PlacedVideo[] | undefined;
    expect(() => {
      result = getActiveVideos(input);
    }).not.toThrow();
    expect(result?.map((v) => v.id)).toEqual(["video-runner"]);
    expect(input).toEqual([placed("video-runner", 0.1), placed("video-parkour", null)]);
  });
});
