import type {
  ClearGame,
  CurrentSaveVersion,
  LoadGame,
  MigrateSave,
  MigrationTable,
  ParseSave,
  SaveBackupKey,
  SaveGame,
  SaveKey,
  SerializeGame,
  ValidateGameState,
} from "./types";

export const SAVE_KEY: SaveKey = "dopamine-clicker:save";
export const SAVE_BACKUP_KEY: SaveBackupKey = "dopamine-clicker:save:bad";
export const CURRENT_SAVE_VERSION: CurrentSaveVersion = 1;
/** Built-in migration table, keyed by source version. Empty in Stage 1. */
export const MIGRATIONS: MigrationTable = Object.freeze({});

export const serializeGame: SerializeGame = () => {
  throw new Error("not implemented");
};

export const validateGameState: ValidateGameState = () => {
  throw new Error("not implemented");
};

export const migrateSave: MigrateSave = () => {
  throw new Error("not implemented");
};

export const parseSave: ParseSave = () => {
  throw new Error("not implemented");
};

export const loadGame: LoadGame = () => {
  throw new Error("not implemented");
};

export const saveGame: SaveGame = () => {
  throw new Error("not implemented");
};

export const clearGame: ClearGame = () => {
  throw new Error("not implemented");
};
