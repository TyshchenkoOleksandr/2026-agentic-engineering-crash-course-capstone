import { createInitialState } from "./state";
import type {
  ClearGame,
  CurrentSaveVersion,
  KeyValueStorage,
  LoadGame,
  LoadStatus,
  MigrateSave,
  MigrationTable,
  ParseSave,
  SaveBackupKey,
  SaveGame,
  SaveKey,
  SerializeGame,
  UnknownSaveFile,
  ValidateGameState,
} from "./types";

export const SAVE_KEY: SaveKey = "dopamine-clicker:save";
export const SAVE_BACKUP_KEY: SaveBackupKey = "dopamine-clicker:save:bad";
export const CURRENT_SAVE_VERSION: CurrentSaveVersion = 1;
/** Built-in migration table, keyed by source version. Empty in Stage 1. */
export const MIGRATIONS: MigrationTable = Object.freeze({});

export const serializeGame: SerializeGame = (state) =>
  JSON.stringify({
    version: CURRENT_SAVE_VERSION,
    state: { balance: state.balance, totalClicks: state.totalClicks },
  });

/** Non-negative safe integer — rejects NaN, Infinity, fractions and non-numbers. */
function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export const validateGameState: ValidateGameState = (value) => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const { balance, totalClicks } = value as Record<string, unknown>;
  if (!isCount(balance) || !isCount(totalClicks)) {
    return null;
  }
  return { balance, totalClicks };
};

export const migrateSave: MigrateSave = (file, migrations, targetVersion) => {
  if (file.version > targetVersion) {
    return null;
  }
  let version = file.version;
  let state = file.state;
  while (version < targetVersion) {
    const migration = migrations[version];
    if (!migration) {
      return null;
    }
    try {
      state = migration(state);
    } catch {
      return null;
    }
    version += 1;
  }
  return { version, state };
};

function fresh(status: LoadStatus) {
  return { state: createInitialState(), status };
}

/** Envelope shape check: `{ version: <integer>, state: <anything> }`. */
function toEnvelope(parsed: unknown): UnknownSaveFile | null {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }
  const record = parsed as Record<string, unknown>;
  if (!Number.isInteger(record.version) || !("state" in record)) {
    return null;
  }
  return { version: record.version as number, state: record.state };
}

export const parseSave: ParseSave = (raw, options) => {
  if (raw === null) {
    return fresh("fresh");
  }
  const migrations = options?.migrations ?? MIGRATIONS;
  const targetVersion = options?.targetVersion ?? CURRENT_SAVE_VERSION;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fresh("corrupted");
  }

  const envelope = toEnvelope(parsed);
  if (envelope === null) {
    return fresh("corrupted");
  }

  const migrated = migrateSave(envelope, migrations, targetVersion);
  if (migrated === null) {
    return fresh("corrupted");
  }

  const state = validateGameState(migrated.state);
  if (state === null) {
    return fresh("corrupted");
  }

  return { state, status: envelope.version === targetVersion ? "loaded" : "migrated" };
};

export const loadGame: LoadGame = (storage, options) => {
  let raw: string | null = null;
  try {
    raw = storage.getItem(SAVE_KEY);
  } catch {
    return fresh("fresh");
  }

  const result = parseSave(raw, options);
  if (result.status === "corrupted" && raw !== null) {
    backupCorruptedSave(storage, raw);
  }
  return result;
};

/** Keeps the last corrupted raw value for manual recovery; a failed write is ignored (D4). */
function backupCorruptedSave(storage: KeyValueStorage, raw: string): void {
  try {
    storage.setItem(SAVE_BACKUP_KEY, raw);
  } catch {
    // Storage full or unavailable — the backup is best effort.
  }
}

export const saveGame: SaveGame = (storage, state) => {
  try {
    storage.setItem(SAVE_KEY, serializeGame(state));
    return true;
  } catch {
    return false;
  }
};

export const clearGame: ClearGame = (storage) => {
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    // Reset must never throw; the in-memory state is reset either way.
  }
};
