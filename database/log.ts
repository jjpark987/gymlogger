import { getDatabase } from './database';
import { Day, DayLogs, Exercise, Log } from './types';

export async function setupLogTable() {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exerciseId INTEGER NOT NULL,
      weight REAL NOT NULL,
      setNum INTEGER NOT NULL CHECK (setNum BETWEEN 1 AND 4),
      isLeft INTEGER CHECK (isLeft IN (0, 1)),
      reps INTEGER NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (exerciseId) REFERENCES exercise(id) ON DELETE CASCADE
    );
  `);
}

export async function insertDayLogs(dayLogs: DayLogs, exercises: (Exercise | null)[]) {
  const db = await getDatabase();
  const insertQuery = `
    INSERT INTO log (exerciseId, weight, setNum, isLeft, reps, createdAt)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `;

  const insertPromises = [];

  for (const exerciseId in dayLogs) {
    const log = dayLogs[exerciseId];
    const exercise = exercises.find(e => e && e.id === Number(exerciseId));

    if (!exercise) {
      console.warn(`Exercise with ID ${exerciseId} not found. Skipping.`);
      continue;
    }

    for (let i = 0; i < 4; i++) {
      if (exercise.isOneArm) {
        if (log.left[i] > 0) {
          insertPromises.push(
            db.runAsync(insertQuery, [exerciseId, exercise.weight, i + 1, true, log.left[i]])
          );
        }
        if (log.right[i] > 0) {
          insertPromises.push(
            db.runAsync(insertQuery, [exerciseId, exercise.weight, i + 1, false, log.right[i]])
          );
        }
      } else {
        insertPromises.push(
          db.runAsync(insertQuery, [exerciseId, exercise.weight, i + 1, null, log.right[i]])
        );
      }
    }
  }

  await Promise.all(insertPromises);
}

export async function getLoggedWeeks(): Promise<string[] | null> {
  const db = await getDatabase();

  const results = await db.getAllAsync(
    `SELECT DISTINCT strftime('%Y-%m-%d', date(createdAt, 'weekday 0', '-6 days')) AS week_start
     FROM log
     ORDER BY week_start DESC;`
  ) as { week_start: string }[];

  if (!results || results.length === 0) {
    console.log('No logged weeks found');
    return null;
  }

  return results.map(row => {
    const [year, month, day] = row.week_start.split('-');
    return `${month}-${day}-${year.slice(2)}`;
  });
}

export async function getLoggedDaysByWeek(week: string): Promise<(string | null)[]> {
  const db = await getDatabase();

  const [month, day, year] = week.split('-');
  const startDate = `20${year}-${month}-${day}`;

  const results = await db.getAllAsync(
    `SELECT DISTINCT strftime('%Y-%m-%d', createdAt) AS logged_day
     FROM log
     WHERE date(createdAt) BETWEEN date(?, '+0 days') AND date(?, '+4 days')
     ORDER BY logged_day ASC;`,
    [startDate, startDate]
  ) as { logged_day: string }[];

  if (!results || results.length === 0) {
    console.log(`No logged days found for week: ${week}`);
    return [null, null, null, null, null]; 
  }

  const daysArray: (string | null)[] = [null, null, null, null, null];

  results.forEach(row => {
    const loggedDate = new Date(row.logged_day);
    const dayOfWeek = loggedDate.getDay(); 

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dayName = loggedDate.toLocaleDateString('en-US', { weekday: 'long' });
      daysArray[dayOfWeek - 1] = dayName;
    }
  });

  return daysArray;
}

export async function getLoggedExercisesByDay(day: string): Promise<Exercise[]> {
  const db = await getDatabase();

  const exercises = await db.getAllAsync(
    `SELECT DISTINCT e.*
     FROM log l
     JOIN exercise e ON l.exerciseId = e.id
     WHERE date(l.createdAt) = date(?)
     ORDER BY e.name ASC;`,
    [day]
  ) as Exercise[];

  return exercises;
}

export async function getLogsByExercise(exerciseId: number): Promise<Log[] | null> {
  const db = await getDatabase();
  const logs = await db.getAllAsync(
    'SELECT * FROM log WHERE exerciseId = ?', 
    [exerciseId]
  ) as Log[];

  return logs.length > 0 ? logs : null;
}

export async function updateLog(id: number, weight: number, reps: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE log SET weight = ?, reps = ? WHERE id = ?`,
    [weight, reps, id]
  );
}

export async function deleteLog(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM log WHERE id = ?', 
    [id]
  );
}
