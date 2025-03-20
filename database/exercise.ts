import { getDatabase } from './database';
import { Exercise } from './types';

export async function setupExerciseTable() {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercise (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dayId INTEGER NOT NULL,
      name TEXT NOT NULL,
      isOneArm INTEGER NOT NULL CHECK (isOneArm IN (0, 1)),
      weight REAL NOT NULL DEFAULT 0,
      increment REAL NOT NULL DEFAULT 0,      
      orderNum INTEGER NOT NULL CHECK (orderNum BETWEEN 1 AND 4),
      
      FOREIGN KEY (dayId) REFERENCES day(id) ON DELETE CASCADE
    );
  `);
}

export async function insertExercise(dayId: number, name: string, isOneArm: boolean, weight: number, increment: number, orderNum: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO exercise (dayId, name, isOneArm, weight, increment, orderNum) VALUES (?, ?, ?, ?, ?, ?)`,
    [dayId, name, isOneArm ? 1 : 0, weight, increment, orderNum]
  );
}

export async function getExercisesByDay(dayId: number): Promise<(Exercise | null)[]> {
  const db = await getDatabase();
  const exercises = await db.getAllAsync(
    `SELECT * FROM exercise WHERE dayId = ? ORDER BY orderNum ASC`,
    [dayId]
  ) as Exercise[];
  const orderedExercises: (Exercise | null)[] = [null, null, null, null];
  exercises.forEach(exercise => {
    orderedExercises[exercise.orderNum - 1] = exercise;
  });
  return orderedExercises;
}

export async function updateExercise(id: number, updates: Partial<Exercise>): Promise<void> {
  const db = await getDatabase();
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  if (fields.length === 0) return;
  await db.runAsync(`UPDATE exercise SET ${fields} WHERE id = ?`, [...values, id]);
}

export async function destroyExercise(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM exercise WHERE id = ?', 
    [id]
  );
}
