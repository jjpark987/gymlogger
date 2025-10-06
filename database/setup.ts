import {
  // debugGetAllExercises,
  // debugGetAllLogs,
  // debugGetAllLogsByExercise,
  // debugSeedDatabase,
  getDatabase,
} from "./database";
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

    // await debugSeedDatabase();
    // await debugGetAllExercises();
    // await debugGetAllLogs();
    // await debugGetAllLogsByExercise(3);

    console.log("✅ SQLite database initialized");
    return db;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}
