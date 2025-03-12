import { getDatabase } from './index';

export async function setupDayExerciseTable() {
  await getDatabase().execAsync(`
      CREATE TABLE IF NOT EXISTS day_exercise (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dayId INTEGER NOT NULL,
        exerciseId INTEGER NOT NULL,
        FOREIGN KEY (dayId) REFERENCES day(id) ON DELETE CASCADE,
        FOREIGN KEY (exerciseId) REFERENCES exercise(id) ON DELETE CASCADE
      );
    `);
}

export async function assignExerciseToDay(dayId: number, exerciseId: number) {
  await getDatabase().runAsync(
    `INSERT INTO day_exercise (dayId, exerciseId) VALUES (?, ?);`,
    [dayId, exerciseId]
  );
}

export async function getExercisesForDay(dayId: number) {
  return await getDatabase().getAllAsync(
    `SELECT e.* FROM exercise e 
       JOIN day_exercise de ON e.id = de.exerciseId
       WHERE de.dayId = ?`,
    [dayId]
  );
}
