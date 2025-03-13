import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('gymLogger.db');
    // console.log('📂 SQLite database path:', FileSystem.documentDirectory + 'SQLite/gymLogger.db');
  }
  return db;
}

export async function resetDatabase() {
  const dbPath = FileSystem.documentDirectory + 'SQLite/gymLogger.db';
  try {
    await FileSystem.deleteAsync(dbPath, { idempotent: true });
    console.log('🗑️ Database deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting database:', error);
  }
}
