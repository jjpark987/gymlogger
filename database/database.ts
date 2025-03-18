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

  const logs: { exerciseId: number; weight: number; setNum: number; isLeft: boolean | null; reps: number; createdAt: string }[] = [];

  const logData = {
    "2025-02-17": {
      bench: [10, 9, 8, 7],
      curlL: [10, 10, 8, 7],
      curlR: [10, 10, 9, 8]
    },
    "2025-02-24": {
      bench: [10, 9, 9, 7],
      curlL: [10, 10, 9, 7],
      curlR: [10, 9, 9, 8]
    },
    "2025-03-03": {
      bench: [10, 10, 9, 7],
      curlL: [10, 10, 9, 7],
      curlR: [10, 10, 9, 7]
    },
    "2025-03-10": null, // Skipped gym
    "2025-03-17": {
      bench: [10, 10, 10, 8],
      curlL: [10, 10, 10, 8],
      curlR: [10, 10, 10, 8]
    }
  };

  for (const [date, data] of Object.entries(logData)) {
    if (!data) continue;

    for (const { id, isOneArm, weight } of exercises) {
      if (isOneArm) {
        // Dumbbell Curl (One-arm exercise)
        for (let setNum = 1; setNum <= 4; setNum++) {
          logs.push({ exerciseId: id, weight, setNum, isLeft: true, reps: data.curlL[setNum - 1], createdAt: `${date} 00:00:00` });
          logs.push({ exerciseId: id, weight, setNum, isLeft: false, reps: data.curlR[setNum - 1], createdAt: `${date} 00:00:00` });
        }
      } else {
        // Bench Press (Two-arm exercise)
        for (let setNum = 1; setNum <= 4; setNum++) {
          logs.push({ exerciseId: id, weight, setNum, isLeft: null, reps: data.bench[setNum - 1], createdAt: `${date} 00:00:00` });
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

export async function getLogsForExercise2() {
  console.log('GETTING LOGS FOR EXERCISE 2')
  const db = await getDatabase();
  console.log(await db.getAllAsync(`SELECT * FROM log WHERE exerciseId = 2;`))
}
