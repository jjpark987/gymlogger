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

export async function seedDatabase() {
  const db = await getDatabase();

  const seeded = await db.getAllAsync(`SELECT COUNT(*) as count FROM log;`) as { count: number }[];
  if (seeded[0]?.count > 0) {
    console.log("✅ Database already seeded. Skipping.");
    return;
  }

  // Insert exercises for Monday (ID = 0)
  await db.execAsync(`
    INSERT INTO exercise (dayId, name, isOneArm, weight, orderNum) 
    VALUES 
    (0, 'Bench Press', 0, 100, 1), 
    (0, 'Dumbbell Curl', 1, 25, 2);
  `);

  // Get inserted exercise IDs
  const exercises = await db.getAllAsync(
    `SELECT id, isOneArm, weight FROM exercise WHERE dayId = 0 ORDER BY orderNum LIMIT 2;`
  ) as { id: number; isOneArm: boolean; weight: number }[];

  if (exercises.length < 2) {
    console.error("❌ Failed to insert exercises.");
    return;
  }

  const now = new Date();
  const logs: { exerciseId: number; weight: number; setNum: number; isLeft: boolean | null; reps: number; createdAt: string }[] = [];

  for (let week = 0; week < 5; week++) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - week * 7); // Start from a past Monday

    for (let dayOffset = 0; dayOffset < 5; dayOffset++) { // Monday to Friday
      const workoutDate = new Date(weekStart);
      workoutDate.setDate(weekStart.getDate() + dayOffset);
      workoutDate.setHours(12, 0, 0, 0); // Normalize time to noon

      const formattedDate = workoutDate.toISOString().split('T')[0] + " 00:00:00"; // Force proper format

      for (const { id, isOneArm, weight } of exercises) {
        for (let setNum = 1; setNum <= 4; setNum++) {
          if (isOneArm) {
            // One-arm exercise → Insert for both left and right arms
            logs.push({ exerciseId: id, weight, setNum, isLeft: true, reps: Math.floor(Math.random() * 5) + 6, createdAt: formattedDate });
            logs.push({ exerciseId: id, weight, setNum, isLeft: false, reps: Math.floor(Math.random() * 5) + 6, createdAt: formattedDate });
          } else {
            // Regular exercise
            logs.push({ exerciseId: id, weight, setNum, isLeft: null, reps: Math.floor(Math.random() * 5) + 6, createdAt: formattedDate });
          }
        }
      }
    }
  }

  // Insert logs
  const values = logs.map(({ exerciseId, weight, setNum, isLeft, reps, createdAt }) => 
    `(${exerciseId}, ${weight}, ${setNum}, ${isLeft !== null ? isLeft : 'NULL'}, ${reps}, '${createdAt}')`
  ).join(',');

  await db.execAsync(`
    INSERT INTO log (exerciseId, weight, setNum, isLeft, reps, createdAt) 
    VALUES ${values};
  `);

  console.log("✅ Database seeded with exercises and logs.");
}


export async function debugGetExercises() {
  const db = await getDatabase();
  const results = await db.getAllAsync(`SELECT * FROM exercise;`);
  console.log("📋 Seeded Exercises:", results);
}