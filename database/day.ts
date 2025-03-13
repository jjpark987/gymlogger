import { getDatabase } from './database';
import { Day } from './types';

export async function setupDayTable() {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS day (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);
}

export async function insertDay(name: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO day (name) VALUES (?) ON CONFLICT(name) DO NOTHING;`,
    [name]
  );
}

export async function getDays(): Promise<Day[]> {
  const db = await getDatabase();
  return await db.getAllAsync('SELECT * FROM day;') as Day[];
}
