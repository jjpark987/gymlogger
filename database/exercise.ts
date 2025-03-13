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
      orderNum INTEGER NOT NULL CHECK (orderNum BETWEEN 1 AND 4),
      
      FOREIGN KEY (dayId) REFERENCES day(id) ON DELETE CASCADE
    );
  `);
}

export async function insertExercise(dayId: number, name: string, isOneArm: boolean, weight: number, orderNum: number): Promise<void> {
  const db = await getDatabase();

  try {
    console.log("📌 Running SQL INSERT command...");
    console.log(`SQL: INSERT INTO exercise (dayId, name, isOneArm, weight, orderNum) VALUES (${dayId}, '${name}', ${isOneArm ? 1 : 0}, ${weight}, ${orderNum})`);

    await db.runAsync(
      `INSERT INTO exercise (dayId, name, isOneArm, weight, orderNum) VALUES (?, ?, ?, ?, ?)`,
      [dayId, name, isOneArm ? 1 : 0, weight, orderNum]
    );

    console.log("✅ Exercise inserted successfully!");
  } catch (error) {
    console.error("❌ Database insertion failed:", error);
  }
}

export async function getExercisesByDay(dayId: number): Promise<(Exercise | null)[]> {
  const db = await getDatabase();

  try {
    const exercises = await db.getAllAsync(
      `SELECT * FROM exercise WHERE dayId = ? ORDER BY orderNum ASC`,
      [dayId]
    ) as Exercise[];

    console.log('📋 Query result:', exercises);

    const orderedExercises: (Exercise | null)[] = [null, null, null, null];
    exercises.forEach(exercise => {
      orderedExercises[exercise.orderNum - 1] = exercise;
    });

    console.log('✅ Returning ordered exercises:', orderedExercises);
    return orderedExercises;
  } catch (error) {
    console.error('❌ Database query failed:', error);
    return [null, null, null, null];
  }
}

export async function getExerciseById(id: number): Promise<Exercise | null> {
  const db = await getDatabase();
  return await db.getFirstAsync(`SELECT * FROM exercise WHERE id = ?`, [id]) as Exercise | null;
}

export async function deleteExercise(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM exercise WHERE id = ?', 
    [id]
  );
}
