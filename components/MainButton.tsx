import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import type { ButtonAppearance } from "@/lib/game/types";
import { usePreferences } from "./PreferencesProvider";

interface MainButtonProps {
  /** False until the saved state has been read from storage (design D7). */
  readonly enabled: boolean;
  readonly onClick: () => void;
  /** Enabled stack skins and the material slot (design D17). */
  readonly appearance: ButtonAppearance;
  /** Value of the next click, shown by the floating +N skin. */
  readonly clickValue: number;
}

interface FloatingNumber {
  readonly id: number;
  readonly value: number;
  readonly x: number;
  readonly y: number;
}

/** Lifetime of a floating +N, matching the `float-up` keyframes (design D17). */
const FLOAT_MS = 800;

/** Restarts a CSS animation that keeps its class between events (design D17). */
function retrigger(element: HTMLElement | null): void {
  if (!element) {
    return;
  }
  element.style.animation = "none";
  void element.offsetWidth;
  element.style.animation = "";
}

/**
 * Where a floating +N starts: the pointer for mouse / touch clicks, the button center for
 * keyboard-triggered clicks (`detail === 0`, whose clientX / clientY are 0).
 */
export function floatingOrigin(event: MouseEvent<HTMLElement>): { x: number; y: number } {
  if (event.detail === 0) {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }
  return { x: event.clientX, y: event.clientY };
}

export function MainButton({ enabled, onClick, appearance, clickValue }: MainButtonProps) {
  const { t, motion } = usePreferences();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const capRef = useRef<HTMLSpanElement>(null);
  const nextFloatingId = useRef(0);
  const [floating, setFloating] = useState<readonly FloatingNumber[]>([]);
  const timers = useRef(new Set<number>());

  // Pending floating-number removals must not fire after unmount.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) {
        window.clearTimeout(timer);
      }
      pending.clear();
    };
  }, []);

  const stack = appearance.stack;
  const hasSquish = stack.includes("squish");
  const hasCap = stack.includes("jumping-cap");
  const showsFloating = stack.includes("floating-number") && motion === "full";

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick();
      retrigger(buttonRef.current);
      retrigger(capRef.current);

      if (showsFloating) {
        const id = nextFloatingId.current;
        nextFloatingId.current += 1;
        const spawned = { id, value: clickValue, ...floatingOrigin(event) };
        setFloating((current) => [...current, spawned]);
        const timer = window.setTimeout(() => {
          timers.current.delete(timer);
          setFloating((current) => current.filter((item) => item.id !== id));
        }, FLOAT_MS);
        timers.current.add(timer);
      }
    },
    [clickValue, onClick, showsFloating],
  );

  return (
    // The wrapper only hosts the overlays; the button keeps the layout box Stage 1 gave it.
    <div className="relative flex items-center justify-center">
      <button
        ref={buttonRef}
        type="button"
        data-testid="main-button"
        data-skins={stack.join(" ")}
        data-material={appearance.material}
        disabled={!enabled}
        onClick={handleClick}
        className={`main-button h-40 w-40 rounded-full bg-accent text-2xl font-bold text-accent-foreground shadow-lg disabled:opacity-60${
          hasSquish ? " skin-squish" : ""
        }${stack.includes("soft-shadow") ? " skin-soft-shadow" : ""}`}
      >
        {t("mainButton.label")}
      </button>

      {hasCap && (
        <span
          ref={capRef}
          data-testid="jumping-cap"
          aria-hidden="true"
          className="skin-jumping-cap pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 text-3xl"
        >
          🧢
        </span>
      )}

      {floating.map((item) => (
        <span
          key={item.id}
          data-testid="floating-number"
          aria-hidden="true"
          style={{ left: item.x, top: item.y }}
          className="floating-number pointer-events-none fixed z-30 text-xl font-bold text-accent"
        >
          +{item.value}
        </span>
      ))}
    </div>
  );
}
