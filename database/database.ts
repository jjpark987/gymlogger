import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("gymLogger.db");
    await db.execAsync("PRAGMA foreign_keys = ON;");
  }
  return db;
}

export async function resetDatabase() {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS log;
    DROP TABLE IF EXISTS exercise;
    DROP TABLE IF EXISTS day;
    DROP TABLE IF EXISTS app_settings;
    DELETE FROM sqlite_sequence WHERE name IN ('log', 'exercise', 'day');
    PRAGMA foreign_keys = ON;
  `);

  console.log("Database tables reset successfully");
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_settings WHERE key = ?;`,
    [key],
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  const existing = await db.getFirstAsync<{ key: string }>(
    `SELECT key FROM app_settings WHERE key = ?;`,
    [key],
  );
  if (existing) {
    await db.runAsync(`UPDATE app_settings SET value = ? WHERE key = ?;`, [
      value,
      key,
    ]);
  } else {
    await db.runAsync(`INSERT INTO app_settings (key, value) VALUES (?, ?);`, [
      key,
      value,
    ]);
  }
}
