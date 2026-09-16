import { getDatabase } from "./database";
import { Day } from "./types";

export async function setupDayTable() {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS day (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);
}

export async function getDays(): Promise<Day[]> {
  const db = await getDatabase();
  return (await db.getAllAsync("SELECT * FROM day ORDER BY id ASC;")) as Day[];
}
