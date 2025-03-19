import { debugGetAllExercises, debugGetAllLogs, getDatabase, resetDatabase, seedDatabase } from './database';
import { setupDayTable } from './day';
import { setupExerciseTable } from './exercise';
import { setupLogTable } from './log';
import { seedDays } from './seed';

export async function setupDatabase() {
  const db = await getDatabase();

  try {
    await setupDayTable();
    await setupExerciseTable();
    await setupLogTable();
    await seedDays();

    // await seedDatabase();
    // await debugGetAllExercises();
    // await debugGetAllLogs();
    // await getLogsForExercise(3);

    console.log('✅ SQLite database initialized');
    return db;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

export async function getLogsForExercise(exerciseId: number) {
  const db = await getDatabase();

  const results = await db.getAllAsync(
    `SELECT * FROM log WHERE exerciseId = ? ORDER BY createdAt ASC;`,
    [exerciseId]
  );
  console.log(results)
  return results;
}