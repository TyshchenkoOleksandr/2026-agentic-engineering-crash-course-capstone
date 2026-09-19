import { getHelperClicksPerSecond } from "@/lib/game/helpers";
import { formatNumber } from "@/lib/i18n";
import type { GameState } from "@/lib/game/types";
import { usePreferences } from "./PreferencesProvider";

interface HelperZoneProps {
  readonly state: GameState | null;
}

/**
 * Fixed bottom-left zone (design D12). It is always rendered with its fixed size, even when empty,
 * so decor placement can reserve it. The monkey is purely visual: no button, clicks do nothing.
 */
export function HelperZone({ state }: HelperZoneProps) {
  const { t, language } = usePreferences();
  const monkeys = state?.helpers.monkey ?? 0;
  const rate = state ? getHelperClicksPerSecond(state) : 0;

  // Helpers sit at the right end of the zone: the bottom-left corner belongs to the Next.js
  // dev-tools overlay, which would otherwise swallow clicks meant for the page.
  return (
    <div
      data-testid="helpers"
      className="fixed bottom-4 left-4 z-10 flex h-24 w-72 items-end justify-end gap-3"
    >
      {monkeys > 0 && (
        <span
          data-testid="helper-monkey"
          role="img"
          aria-label={t("helper.monkey.label", {
            count: formatNumber(monkeys, language),
            rate: formatNumber(rate, language),
          })}
          className="helper-monkey flex items-center gap-1 text-3xl"
        >
          {/* Only the glyph animates: an animated root would never settle for a click. */}
          <span className="helper-monkey-press">🐒</span>
          <span data-testid="helper-monkey-count" className="text-sm font-semibold text-muted">
            ×{formatNumber(monkeys, language)}
          </span>
        </span>
      )}
    </div>
  );
}
