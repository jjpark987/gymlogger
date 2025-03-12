import * as SQLite from 'expo-sqlite';
import { setupDayTable } from './day';
import { setupExerciseTable } from './exercise';
import { setupDayExerciseTable } from './day-exercise';
import { setupLogTable } from './log';
import { seedDays } from './seed';
import * as FileSystem from 'expo-file-system';


let db: SQLite.SQLiteDatabase | null = null;

export async function setupDatabase() {
  if (db) return db;

  try {
    db = await SQLite.openDatabaseAsync('gymLogger.db');
    // console.log('📂 SQLite database path:', FileSystem.documentDirectory + 'SQLite/gymLogger.db');

    await setupDayTable();
    // await setupExerciseTable();
    // await setupDayExerciseTable();
    // await setupLogTable();
    await seedDays();

    console.log('✅ SQLite database initialized');
    return db;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call setupDatabase() first.');
  }
  return db;
}
