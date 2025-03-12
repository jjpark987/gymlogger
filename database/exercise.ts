import { getDatabase } from './index';

export async function setupExerciseTable() {
  await getDatabase().execAsync(`
    CREATE TABLE IF NOT EXISTS exercise (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      isOneArm INTEGER NOT NULL CHECK (isOneArm IN (0, 1))
    );
  `);
}

export async function insertExercise(name: string, isOneArm: boolean) {
  const result = await getDatabase().runAsync(
    `INSERT INTO exercise (name, isOneArm) VALUES (?, ?)`,
    [name, isOneArm ? 1 : 0]
  );
  return result.lastInsertRowId;
}

export async function getExercises() {
  return await getDatabase().getAllAsync('SELECT * FROM exercise');
}

export async function getExerciseById(id: number) {
  return await getDatabase().getFirstAsync('SELECT * FROM exercise WHERE id = ?', [id]);
}

export async function deleteExercise(id: number) {
  await getDatabase().runAsync('DELETE FROM exercise WHERE id = ?', [id]);
}
