import { getDatabase } from "./database";
import { setupDayTable } from "./day";
import { setupExerciseTable } from "./exercise";
import { setupLogTable } from "./log";
import { seedDays } from "./seed";

export async function setupDatabase() {
  const db = await getDatabase();

  try {
    await setupDayTable();
    await setupExerciseTable();
    await setupLogTable();
    await seedDays();
    await db.runAsync(`
      DELETE FROM log
      WHERE NOT EXISTS (
        SELECT 1 FROM exercise WHERE exercise.id = log.exerciseId
      );
    `);

    console.log("SQLite database initialized");
    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
