import type {
  Language,
  LoadPreferences,
  ParseLanguage,
  ParseTheme,
  ResolveLanguage,
  ResolveTheme,
  SaveLanguage,
  SaveTheme,
  ToggleLanguage,
  ToggleTheme,
} from "./types";

export const THEME_KEY = "dopamine-clicker:theme";
export const LANGUAGE_KEY = "dopamine-clicker:lang";
export const DEFAULT_LANGUAGE: Language = "uk";

export const parseTheme: ParseTheme = () => {
  throw new Error("not implemented");
};

export const resolveTheme: ResolveTheme = () => {
  throw new Error("not implemented");
};

export const toggleTheme: ToggleTheme = () => {
  throw new Error("not implemented");
};

export const parseLanguage: ParseLanguage = () => {
  throw new Error("not implemented");
};

export const resolveLanguage: ResolveLanguage = () => {
  throw new Error("not implemented");
};

export const toggleLanguage: ToggleLanguage = () => {
  throw new Error("not implemented");
};

export const loadPreferences: LoadPreferences = () => {
  throw new Error("not implemented");
};

export const saveTheme: SaveTheme = () => {
  throw new Error("not implemented");
};

export const saveLanguage: SaveLanguage = () => {
  throw new Error("not implemented");
};
