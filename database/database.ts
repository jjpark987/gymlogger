import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!db) db = await SQLite.openDatabaseAsync("gymLogger.db");
  return db;
}

export async function resetDatabase() {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS log;
    DROP TABLE IF EXISTS exercise;
    DROP TABLE IF EXISTS day;
    DROP TABLE IF EXISTS app_settings;
    DELETE FROM sqlite_sequence WHERE name IN ('log', 'exercise', 'day');
    PRAGMA foreign_keys = ON;
  `);

  console.log("🗑️ Database tables reset successfully");
}

export async function debugSeedDatabase() {
  const db = await getDatabase();

  const seeded = (await db.getAllAsync(
    `SELECT COUNT(*) as count FROM log;`,
  )) as { count: number }[];
  if (seeded[0]?.count > 0) {
    console.log("✅ Database already seeded. Skipping.");
    return;
  }

  await db.execAsync(`
    INSERT INTO exercise (dayId, name, isOneArm, weight, increment, orderNum) 
    VALUES 
    (0, 'Bench Press', 0, 100, 5, 1), 
    (0, 'Dumbbell Curl', 1, 25, 2.5, 2);
  `);

  const exercises = (await db.getAllAsync(
    `SELECT id, isOneArm, weight, increment FROM exercise WHERE dayId = 0 ORDER BY orderNum LIMIT 2;`,
  )) as { id: number; isOneArm: boolean; weight: number; increment: number }[];

  if (exercises.length < 2) {
    console.error("❌ Failed to insert exercises.");
    return;
  }

  const logs: {
    exerciseId: number;
    weight: number;
    setNum: number;
    isLeft: boolean | null;
    reps: number;
    createdAt: string;
  }[] = [];

  const logData = {
    "2025-02-17": {
      bench: [10, 9, 8],
      curlL: [10, 10, 8],
      curlR: [10, 10, 9],
    },
    "2025-02-24": {
      bench: [10, 9, 9],
      curlL: [10, 10, 9],
      curlR: [10, 9, 9],
    },
    "2025-03-03": {
      bench: [10, 10, 9],
      curlL: [10, 10, 9],
      curlR: [10, 10, 9],
    },
    // '2025-03-10': null,
    "2025-03-17": {
      bench: [10, 10, 10],
      curlL: [10, 10, 10],
      curlR: [10, 10, 10],
    },
  };

  for (const [date, data] of Object.entries(logData)) {
    if (!data) continue;

    const localTime = new Date(`${date}T06:00:00-07:00`);
    const utcString = localTime.toISOString();

    for (const { id, isOneArm, weight } of exercises) {
      if (isOneArm) {
        for (let setNum = 1; setNum <= 3; setNum++) {
          logs.push({
            exerciseId: id,
            weight,
            setNum,
            isLeft: true,
            reps: data.curlL[setNum - 1],
            createdAt: utcString,
          });
          logs.push({
            exerciseId: id,
            weight,
            setNum,
            isLeft: false,
            reps: data.curlR[setNum - 1],
            createdAt: utcString,
          });
        }
      } else {
        for (let setNum = 1; setNum <= 3; setNum++) {
          logs.push({
            exerciseId: id,
            weight,
            setNum,
            isLeft: null,
            reps: data.bench[setNum - 1],
            createdAt: utcString,
          });
        }
      }
    }
  }

  const values = logs
    .map(
      ({ exerciseId, weight, setNum, isLeft, reps, createdAt }) =>
        `(${exerciseId}, ${weight}, ${setNum}, ${
          isLeft !== null ? isLeft : "NULL"
        }, ${reps}, '${createdAt}')`,
    )
    .join(",");

  await db.execAsync(`
    INSERT INTO log (exerciseId, weight, setNum, isLeft, reps, createdAt) 
    VALUES ${values};
  `);

  console.log("✅ Database seeded with exercises and logs.");
}

export async function debugGetAllExercises() {
  const db = await getDatabase();
  const results = await db.getAllAsync(`SELECT * FROM exercise;`);
  console.log("📋 Seeded Exercises:", results);
}

export async function debugGetAllLogs() {
  const db = await getDatabase();

  const results = await db.getAllAsync(
    `SELECT * FROM log ORDER BY createdAt DESC;`,
  );

  console.log("📋 Seeded Logs:", results);
}

export async function debugGetAllLogsByExercise(exerciseId: number) {
  const db = await getDatabase();
  const results = await db.getAllAsync(
    `SELECT * FROM log WHERE exerciseId = ? ORDER BY createdAt DESC;`,
    [exerciseId],
  );
  console.log(`📋 Logs for Exercise ID ${exerciseId}:`, results);
}

// Settings storage (key-value) for app-level preferences like restDaysMask
export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_settings WHERE key = ?;`,
    [key],
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  const existing = await db.getFirstAsync<{ key: string }>(
    `SELECT key FROM app_settings WHERE key = ?;`,
    [key],
  );
  if (existing) {
    await db.runAsync(`UPDATE app_settings SET value = ? WHERE key = ?;`, [
      value,
      key,
    ]);
  } else {
    await db.runAsync(`INSERT INTO app_settings (key, value) VALUES (?, ?);`, [
      key,
      value,
    ]);
  }
}
