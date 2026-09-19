import { useT } from "./PreferencesProvider";

interface MainButtonProps {
  /** False until the saved state has been read from storage (design D7). */
  readonly enabled: boolean;
  readonly onClick: () => void;
}

export function MainButton({ enabled, onClick }: MainButtonProps) {
  const t = useT();

  return (
    <button
      type="button"
      data-testid="main-button"
      disabled={!enabled}
      onClick={onClick}
      className="main-button h-40 w-40 rounded-full bg-accent text-2xl font-bold text-accent-foreground shadow-lg disabled:opacity-60"
    >
      {t("mainButton.label")}
    </button>
  );
}
