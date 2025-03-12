import { getDatabase } from './index';

export async function setupLogTable() {
  await getDatabase().execAsync(`
    CREATE TABLE IF NOT EXISTS log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exerciseId INTEGER NOT NULL,
      weight REAL NOT NULL,
      isLeft INTEGER CHECK (isLeft IN (0, 1)),  -- NULL if two-handed
      setNum INTEGER NOT NULL CHECK (setNum BETWEEN 1 AND 4),
      reps INTEGER NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exerciseId) REFERENCES exercise(id) ON DELETE CASCADE
    );
  `);
}

export async function insertLog(
  exerciseId: number,
  weight: number,
  isLeft: boolean | null,
  setNum: number,
  reps: number
) {
  const result = await getDatabase().runAsync(
    `INSERT INTO log (exerciseId, weight, isLeft, setNum, reps) VALUES (?, ?, ?, ?, ?)`,
    [exerciseId, weight, isLeft !== null ? (isLeft ? 1 : 0) : null, setNum, reps]
  );
  return result.lastInsertRowId;
}

export async function getLogsByExercise(exerciseId: number) {
  return await getDatabase().getAllAsync('SELECT * FROM log WHERE exerciseId = ?', [exerciseId]);
}

export async function updateLog(id: number, weight: number, reps: number) {
  await getDatabase().runAsync(
    `UPDATE log SET weight = ?, reps = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [weight, reps, id]
  );
}

export async function deleteLog(id: number) {
  await getDatabase().runAsync('DELETE FROM log WHERE id = ?', [id]);
}
