import { useEffect, useState } from "react";
import { decorRect, placeDecor } from "@/lib/game/decor";
import { getShopItem } from "@/lib/game/shop";
import type { DecorId, DecorItem, DecorPosition, PlacedDecor, Rect, Size } from "@/lib/game/types";
import { usePreferences } from "./PreferencesProvider";
import type { TranslationKey } from "@/lib/i18n";

interface DecorLayerProps {
  readonly decor: readonly PlacedDecor[];
}

/** Elements a decor item must not cover; measured at purchase time (design D10). */
// `balance-area` is the fixed-height counter wrapper, not only the number span inside it.
const RESERVED_TEST_IDS = ["main-button", "balance-area", "shop", "helpers", "reset"];

function sizeOf(id: DecorId): Size {
  return (getShopItem(id) as DecorItem).size;
}

function rectOf(element: Element): Rect {
  const box = element.getBoundingClientRect();
  return { left: box.left, top: box.top, width: box.width, height: box.height };
}

/**
 * Reserved areas for a new decor item: the fixed UI plus every decor already on screen. The shop
 * is reserved with its maximum height (60 vh), so later reveals cannot grow into a decor (D10).
 */
function reservedRects(placed: readonly PlacedDecor[], viewport: Size): Rect[] {
  const rects: Rect[] = [];
  for (const testId of RESERVED_TEST_IDS) {
    const element = document.querySelector(`[data-testid="${testId}"]`);
    if (element) {
      const rect = rectOf(element);
      rects.push(testId === "shop" ? { ...rect, height: 0.6 * viewport.height } : rect);
    }
  }
  // The top-right switcher container has no test id of its own; both toggles are measured.
  for (const testId of ["lang-toggle", "theme-toggle"]) {
    const element = document.querySelector(`[data-testid="${testId}"]`);
    if (element) {
      rects.push(rectOf(element));
    }
  }
  for (const entry of placed) {
    const element = document.querySelector(`[data-testid="decor-${entry.id}"]`);
    if (entry.position) {
      rects.push(decorRect(entry.position, sizeOf(entry.id), viewport));
    } else if (element) {
      rects.push(rectOf(element));
    }
  }
  return rects;
}

/** Picks the saved position of a decor item at purchase time; `null` means the fallback dock. */
export function chooseDecorPosition(
  id: DecorId,
  placed: readonly PlacedDecor[],
): DecorPosition | null {
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  return placeDecor({
    viewport,
    size: sizeOf(id),
    reserved: reservedRects(placed, viewport),
    random: Math.random,
  });
}

/** Pure CSS art; every part animates only transform / opacity (design D17). */
function DecorArt({ id }: { readonly id: DecorId }) {
  switch (id) {
    case "sleeping-cat":
      return (
        <>
          <span className="cat-body" />
          <span className="cat-head" />
          <span className="cat-ear" />
          <span className="cat-tail" />
        </>
      );
    case "lava-lamp":
      return (
        <>
          <span className="lamp-glass" />
          <span className="lamp-blob lamp-blob-a" />
          <span className="lamp-blob lamp-blob-b" />
          <span className="lamp-blob lamp-blob-c" />
        </>
      );
    case "hydraulic-press":
      return (
        <>
          <span className="press-frame" />
          <span className="press-ram" />
          <span className="press-belt" />
          <span className="press-object" />
        </>
      );
  }
}

/** Re-renders on resize so `decorRect` can clamp the saved fraction into the new viewport (D9). */
function useViewport(): Size | null {
  const [viewport, setViewport] = useState<Size | null>(null);

  useEffect(() => {
    const read = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  return viewport;
}

/**
 * Items without a saved position go into a dock at the right edge, vertically centered and
 * stacked in catalog order with an 8 px gap (design D9).
 */
function fallbackDockRects(decor: readonly PlacedDecor[], viewport: Size): Map<DecorId, Rect> {
  const docked = decor.filter((entry) => entry.position === null);
  const height =
    docked.reduce((total, entry) => total + sizeOf(entry.id).height, 0) +
    8 * Math.max(docked.length - 1, 0);

  const rects = new Map<DecorId, Rect>();
  let top = viewport.height / 2 - height / 2;
  for (const entry of docked) {
    const size = sizeOf(entry.id);
    rects.set(entry.id, { left: viewport.width - 16 - size.width, top, ...size });
    top += size.height + 8;
  }
  return rects;
}

export function DecorLayer({ decor }: DecorLayerProps) {
  const { t } = usePreferences();
  const viewport = useViewport();

  if (decor.length === 0 || viewport === null) {
    return null;
  }

  const dockRects = fallbackDockRects(decor, viewport);

  return (
    <>
      {decor.map((entry) => {
        const size = sizeOf(entry.id);
        const rect = entry.position
          ? decorRect(entry.position, size, viewport)
          : (dockRects.get(entry.id) as Rect);
        return (
          <div
            key={entry.id}
            data-testid={`decor-${entry.id}`}
            role="img"
            aria-label={t(`item.${entry.id}.name` as TranslationKey)}
            style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
            className={`decor decor-${entry.id} pointer-events-none fixed z-0`}
          >
            <DecorArt id={entry.id} />
          </div>
        );
      })}
    </>
  );
}
