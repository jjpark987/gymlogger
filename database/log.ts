import { getDatabase } from './database';
import { Log } from './types';

export async function setupLogTable() {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exerciseId INTEGER NOT NULL,
      weight REAL NOT NULL,
      setNum INTEGER NOT NULL CHECK (setNum BETWEEN 1 AND 4),
      isLeft INTEGER CHECK (isLeft IN (0, 1)),
      reps INTEGER NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (exerciseId) REFERENCES exercise(id) ON DELETE CASCADE
    );
  `);
}

export async function insertLog(exerciseId: number, weight: number, isLeft: boolean | null, setNum: number, reps: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO log (exerciseId, weight, isLeft, setNum, reps) VALUES (?, ?, ?, ?, ?)`,
    [exerciseId, weight, isLeft !== null ? (isLeft ? 1 : 0) : null, setNum, reps]
  );
}

export async function getLogsByExercise(exerciseId: number): Promise<Log[]> {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM log WHERE exerciseId = ?', 
    [exerciseId]
  ) as Log[];
}

export async function updateLog(id: number, weight: number, reps: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE log SET weight = ?, reps = ? WHERE id = ?`,
    [weight, reps, id]
  );
}

export async function deleteLog(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM log WHERE id = ?', 
    [id]
  );
}
