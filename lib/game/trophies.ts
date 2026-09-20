import type {
  ClearTrophies,
  CreateInitialTrophies,
  CurrentTrophiesVersion,
  LoadTrophies,
  ParseTrophies,
  SaveTrophies,
  SerializeTrophies,
  TrophiesBackupKey,
  TrophiesKey,
  ValidateTrophies,
} from "./types";

// The trophy file is deliberately independent of the game save (design D12): this module must not
// import from `save.ts`, and no game module may import from here.

export const TROPHIES_KEY: TrophiesKey = "dopamine-clicker:trophies";
export const TROPHIES_BACKUP_KEY: TrophiesBackupKey = "dopamine-clicker:trophies:bad";
export const CURRENT_TROPHIES_VERSION: CurrentTrophiesVersion = 1;

export const createInitialTrophies: CreateInitialTrophies = () => {
  throw new Error("not implemented");
};

export const serializeTrophies: SerializeTrophies = () => {
  throw new Error("not implemented");
};

export const validateTrophies: ValidateTrophies = () => {
  throw new Error("not implemented");
};

export const parseTrophies: ParseTrophies = () => {
  throw new Error("not implemented");
};

export const loadTrophies: LoadTrophies = () => {
  throw new Error("not implemented");
};

export const saveTrophies: SaveTrophies = () => {
  throw new Error("not implemented");
};

export const clearTrophies: ClearTrophies = () => {
  throw new Error("not implemented");
};
