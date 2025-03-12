import { getDatabase } from './index';

export async function setupDayTable() {
  await getDatabase().execAsync(`
    CREATE TABLE IF NOT EXISTS day (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);
}

export async function insertDay(name: string) {
  const result = await getDatabase().runAsync(
    `INSERT INTO day (name) VALUES (?) ON CONFLICT(name) DO NOTHING;`,
    [name]
  );
  return result.lastInsertRowId;
}

export async function getDays(): Promise<{ id: number; name: string }[]> {
  const result = await getDatabase().getAllAsync('SELECT * FROM day;');
  return result as { id: number; name: string }[];
}
