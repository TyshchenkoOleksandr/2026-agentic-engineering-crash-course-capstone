import { describe, expect, it } from "vitest";
import {
  clearGame,
  CURRENT_SAVE_VERSION,
  loadGame,
  migrateSave,
  MIGRATIONS,
  parseSave,
  SAVE_BACKUP_KEY,
  SAVE_KEY,
  saveGame,
  serializeGame,
  validateGameState,
} from "./save";
import type { KeyValueStorage, MigrationTable, ParseSaveOptions } from "./types";

// ---------------------------------------------------------------------------
// Fakes
// ---------------------------------------------------------------------------

interface FakeStorage extends KeyValueStorage {
  readonly data: Map<string, string>;
  readonly writtenKeys: string[];
}

function createMemoryStorage(initial: Record<string, string> = {}): FakeStorage {
  const data = new Map<string, string>(Object.entries(initial));
  const writtenKeys: string[] = [];
  return {
    data,
    writtenKeys,
    getItem: (key) => (data.has(key) ? (data.get(key) as string) : null),
    setItem: (key, value) => {
      writtenKeys.push(key);
      data.set(key, String(value));
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

function createThrowingStorage(
  overrides: Partial<KeyValueStorage> = {},
): KeyValueStorage {
  return {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    ...overrides,
  };
}

const FRESH = { balance: 0, totalClicks: 0 };
const addBonus: MigrationTable = {
  1: (s) => ({ ...(s as Record<string, unknown>), bonus: 0 }),
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe("game-persistence: constants", () => {
  it("storage keys and current version", () => {
    expect(SAVE_KEY).toBe("dopamine-clicker:save");
    expect(SAVE_BACKUP_KEY).toBe("dopamine-clicker:save:bad");
    expect(CURRENT_SAVE_VERSION).toBe(1);
  });

  it("built-in migration table is empty in Stage 1", () => {
    expect(Object.keys(MIGRATIONS)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Versioned save format
// ---------------------------------------------------------------------------

describe("game-persistence: Versioned save format", () => {
  it("Serialize state", () => {
    expect(JSON.parse(serializeGame({ balance: 12, totalClicks: 30 }))).toEqual({
      version: 1,
      state: { balance: 12, totalClicks: 30 },
    });
  });

  it("Save writes to the save key", () => {
    const storage = createMemoryStorage();
    expect(saveGame(storage, { balance: 5, totalClicks: 5 })).toBe(true);
    expect(JSON.parse(storage.getItem("dopamine-clicker:save") as string)).toEqual({
      version: 1,
      state: { balance: 5, totalClicks: 5 },
    });
    expect([...storage.data.keys()]).toEqual(["dopamine-clicker:save"]);
    expect(new Set(storage.writtenKeys)).toEqual(new Set(["dopamine-clicker:save"]));
  });

  it("Save survives a storage write error", () => {
    const storage = createThrowingStorage({
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    let result: boolean | undefined;
    expect(() => {
      result = saveGame(storage, { balance: 1, totalClicks: 1 });
    }).not.toThrow();
    expect(result).toBe(false);
  });

  it("Round trip", () => {
    const storage = createMemoryStorage();
    saveGame(storage, { balance: 1234, totalClicks: 2000 });
    expect(loadGame(storage)).toEqual({
      state: { balance: 1234, totalClicks: 2000 },
      status: "loaded",
    });
  });
});

// ---------------------------------------------------------------------------
// State validation
// ---------------------------------------------------------------------------

describe("game-persistence: State validation", () => {
  it("Valid state accepted", () => {
    expect(validateGameState({ balance: 0, totalClicks: 0 })).toEqual({
      balance: 0,
      totalClicks: 0,
    });
  });

  it("Extra fields dropped", () => {
    const result = validateGameState({ balance: 2, totalClicks: 3, extra: "x" });
    expect(result).toStrictEqual({ balance: 2, totalClicks: 3 });
    expect(result).not.toHaveProperty("extra");
  });

  it.each([
    ["null", null],
    ["42", 42],
    ['"text"', "text"],
    ["[]", []],
    ["{}", {}],
    ["{ balance: 1 }", { balance: 1 }],
    ["{ totalClicks: 1 }", { totalClicks: 1 }],
    ["negative balance", { balance: -1, totalClicks: 0 }],
    ["negative totalClicks", { balance: 0, totalClicks: -1 }],
    ["fractional balance", { balance: 1.5, totalClicks: 2 }],
    ["string balance", { balance: "5", totalClicks: 5 }],
    ["NaN balance", { balance: NaN, totalClicks: 0 }],
    ["Infinity balance", { balance: Infinity, totalClicks: 0 }],
    ["unsafe integer totalClicks", { balance: 0, totalClicks: 9007199254740992 }],
  ])("Invalid states rejected: %s", (_label, value) => {
    expect(validateGameState(value)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Loading with fallback
// ---------------------------------------------------------------------------

describe("game-persistence: Loading with fallback", () => {
  it("Nothing stored", () => {
    expect(loadGame(createMemoryStorage())).toEqual({ state: FRESH, status: "fresh" });
  });

  it("Storage read throws", () => {
    const storage = createThrowingStorage({
      getItem: () => {
        throw new Error("SecurityError");
      },
    });
    let result: unknown;
    expect(() => {
      result = loadGame(storage);
    }).not.toThrow();
    expect(result).toEqual({ state: FRESH, status: "fresh" });
  });

  it.each([
    "{not json",
    "",
    "null",
    "42",
    "[]",
    "{}",
    '{"version":1}',
    '{"state":{"balance":1,"totalClicks":1}}',
    '{"version":"1","state":{"balance":1,"totalClicks":1}}',
    '{"version":1,"state":{"balance":-5,"totalClicks":1}}',
  ])("Corrupted raw values: %j", (raw) => {
    expect(parseSave(raw)).toEqual({ state: FRESH, status: "corrupted" });
  });

  it("Null raw value is fresh, not corrupted", () => {
    expect(parseSave(null)).toEqual({ state: FRESH, status: "fresh" });
  });

  it("Future version falls back", () => {
    expect(parseSave('{"version":2,"state":{"balance":10,"totalClicks":10}}')).toEqual({
      state: FRESH,
      status: "corrupted",
    });
  });

  it("Version 0 falls back", () => {
    expect(parseSave('{"version":0,"state":{"balance":10,"totalClicks":10}}')).toEqual({
      state: FRESH,
      status: "corrupted",
    });
  });

  it("Loading does not read or change theme and language keys", () => {
    const storage = createMemoryStorage({
      "dopamine-clicker:save": "{not json",
      "dopamine-clicker:theme": "dark",
      "dopamine-clicker:lang": "en",
    });
    loadGame(storage);
    expect(storage.getItem("dopamine-clicker:theme")).toBe("dark");
    expect(storage.getItem("dopamine-clicker:lang")).toBe("en");
  });
});

// ---------------------------------------------------------------------------
// Corrupted-save backup
// ---------------------------------------------------------------------------

describe("game-persistence: Corrupted-save backup", () => {
  it("Invalid JSON is backed up", () => {
    const storage = createMemoryStorage({ "dopamine-clicker:save": "{not json" });
    expect(loadGame(storage)).toEqual({ state: FRESH, status: "corrupted" });
    expect(storage.getItem("dopamine-clicker:save:bad")).toBe("{not json");
    expect(storage.getItem("dopamine-clicker:save")).toBe("{not json");
  });

  it("Failed validation is backed up", () => {
    const raw = '{"version":1,"state":{"balance":-5,"totalClicks":1}}';
    const storage = createMemoryStorage({ "dopamine-clicker:save": raw });
    expect(loadGame(storage).status).toBe("corrupted");
    expect(storage.getItem("dopamine-clicker:save:bad")).toBe(raw);
  });

  it("Future version is backed up", () => {
    const raw = '{"version":2,"state":{"balance":10,"totalClicks":10}}';
    const storage = createMemoryStorage({ "dopamine-clicker:save": raw });
    expect(loadGame(storage).status).toBe("corrupted");
    expect(storage.getItem("dopamine-clicker:save:bad")).toBe(raw);
  });

  it("Failed migration is backed up", () => {
    const raw = '{"version":1,"state":{"balance":8,"totalClicks":9}}';
    const storage = createMemoryStorage({ "dopamine-clicker:save": raw });
    const options: ParseSaveOptions = {
      migrations: {
        1: () => {
          throw new Error("boom");
        },
      },
      targetVersion: 2,
    };
    expect(loadGame(storage, options)).toEqual({ state: FRESH, status: "corrupted" });
    expect(storage.getItem("dopamine-clicker:save:bad")).toBe(raw);
  });

  it("New backup overwrites the previous one", () => {
    const storage = createMemoryStorage({
      "dopamine-clicker:save:bad": "old",
      "dopamine-clicker:save": "[]",
    });
    loadGame(storage);
    expect(storage.getItem("dopamine-clicker:save:bad")).toBe("[]");
  });

  it("No backup for fresh, loaded or migrated", () => {
    const raw = '{"version":1,"state":{"balance":3,"totalClicks":3}}';
    const a = createMemoryStorage();
    const b = createMemoryStorage({ "dopamine-clicker:save": raw });
    const c = createMemoryStorage({ "dopamine-clicker:save": raw });
    expect(loadGame(a).status).toBe("fresh");
    expect(loadGame(b).status).toBe("loaded");
    expect(loadGame(c, { migrations: addBonus, targetVersion: 2 }).status).toBe("migrated");
    expect(a.getItem("dopamine-clicker:save:bad")).toBeNull();
    expect(b.getItem("dopamine-clicker:save:bad")).toBeNull();
    expect(c.getItem("dopamine-clicker:save:bad")).toBeNull();
  });

  it("Existing backup untouched by a valid load", () => {
    const storage = createMemoryStorage({
      "dopamine-clicker:save:bad": "old",
      "dopamine-clicker:save": '{"version":1,"state":{"balance":3,"totalClicks":3}}',
    });
    expect(loadGame(storage).status).toBe("loaded");
    expect(storage.getItem("dopamine-clicker:save:bad")).toBe("old");
  });

  it("Backup write failure does not throw", () => {
    const storage = createThrowingStorage({
      getItem: (key) => (key === "dopamine-clicker:save" ? "{not json" : null),
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    let result: unknown;
    expect(() => {
      result = loadGame(storage);
    }).not.toThrow();
    expect(result).toEqual({ state: FRESH, status: "corrupted" });
  });

  it("Parsing a raw string never writes storage", () => {
    expect(parseSave("{not json")).toEqual({ state: FRESH, status: "corrupted" });
  });
});

// ---------------------------------------------------------------------------
// Migration hook
// ---------------------------------------------------------------------------

describe("game-persistence: Migration hook", () => {
  it("Same version passes through unchanged", () => {
    expect(migrateSave({ version: 1, state: { balance: 3, totalClicks: 4 } }, {}, 1)).toEqual({
      version: 1,
      state: { balance: 3, totalClicks: 4 },
    });
  });

  it("One step", () => {
    expect(
      migrateSave({ version: 1, state: { balance: 3, totalClicks: 4 } }, addBonus, 2),
    ).toEqual({ version: 2, state: { balance: 3, totalClicks: 4, bonus: 0 } });
  });

  it("Chained steps run in order", () => {
    const table: MigrationTable = {
      1: (s) => ({ ...(s as Record<string, unknown>), log: ["1to2"] }),
      2: (s) => {
        const prev = s as Record<string, unknown> & { log: string[] };
        return { ...prev, log: [...prev.log, "2to3"] };
      },
    };
    expect(migrateSave({ version: 1, state: { balance: 0, totalClicks: 0 } }, table, 3)).toEqual(
      { version: 3, state: { balance: 0, totalClicks: 0, log: ["1to2", "2to3"] } },
    );
  });

  it("Missing step fails", () => {
    const table: MigrationTable = { 1: (s) => s };
    expect(
      migrateSave({ version: 1, state: { balance: 0, totalClicks: 0 } }, table, 3),
    ).toBeNull();
  });

  it("Throwing step fails", () => {
    const table: MigrationTable = {
      1: () => {
        throw new Error("boom");
      },
    };
    let result: unknown = "unset";
    expect(() => {
      result = migrateSave({ version: 1, state: { balance: 0, totalClicks: 0 } }, table, 2);
    }).not.toThrow();
    expect(result).toBeNull();
  });

  it("Newer than target fails", () => {
    expect(migrateSave({ version: 3, state: { balance: 0, totalClicks: 0 } }, {}, 2)).toBeNull();
  });

  it("Migrated load reports status migrated", () => {
    expect(
      parseSave('{"version":1,"state":{"balance":8,"totalClicks":9}}', {
        migrations: addBonus,
        targetVersion: 2,
      }),
    ).toEqual({ state: { balance: 8, totalClicks: 9 }, status: "migrated" });
  });

  it("Migrated state that fails validation is corrupted", () => {
    expect(
      parseSave('{"version":1,"state":{"balance":8,"totalClicks":9}}', {
        migrations: { 1: () => ({ balance: -1, totalClicks: 0 }) },
        targetVersion: 2,
      }),
    ).toEqual({ state: FRESH, status: "corrupted" });
  });
});

// ---------------------------------------------------------------------------
// Reset progress
// ---------------------------------------------------------------------------

describe("game-persistence: Reset progress with confirmation", () => {
  it("Clear removes only the save key", () => {
    const storage = createMemoryStorage({
      "dopamine-clicker:save": '{"version":1,"state":{"balance":5,"totalClicks":5}}',
      "dopamine-clicker:save:bad": "{not json",
      "dopamine-clicker:theme": "dark",
      "dopamine-clicker:lang": "en",
    });
    clearGame(storage);
    expect(storage.getItem("dopamine-clicker:save")).toBeNull();
    expect(storage.getItem("dopamine-clicker:save:bad")).toBe("{not json");
    expect(storage.getItem("dopamine-clicker:theme")).toBe("dark");
    expect(storage.getItem("dopamine-clicker:lang")).toBe("en");
  });

  it("Clear survives a storage error", () => {
    const storage = createThrowingStorage({
      removeItem: () => {
        throw new Error("SecurityError");
      },
    });
    expect(() => clearGame(storage)).not.toThrow();
  });
});
