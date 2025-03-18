import { debugGetExercises, getDatabase, getLogsForExercise2, seedDatabase } from './database';
import { setupDayTable } from './day';
import { setupExerciseTable } from './exercise';
import { debugGetAllLogs, setupLogTable } from './log';
import { seedDays } from './seed';

export async function setupDatabase() {
  const db = await getDatabase();

  try {
    await setupDayTable();
    await setupExerciseTable();
    await setupLogTable();
    await seedDays();

    // await seedDatabase();
    // await debugGetAllLogs();
    // await debugGetExercises();
    // await getLogsForExercise2();

    console.log('✅ SQLite database initialized');
    return db;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}
