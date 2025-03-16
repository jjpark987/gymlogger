import { getDatabase } from './database';
import { ChartData, DayLogIds, DayLogs, Exercise, LoggedDay, LoggedWeek } from './types';

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

export async function getLoggedWeeks(): Promise<LoggedWeek[] | null> {
  const db = await getDatabase();

  const results = await db.getAllAsync(
    `SELECT DISTINCT strftime('%Y-%m-%d', date(createdAt, 'weekday 0', '-6 days')) AS week_start
     FROM log
     ORDER BY week_start DESC;`
  ) as { week_start: string }[];

  if (!results || results.length === 0) return null;

  return results.map(row => {
    const date = new Date(row.week_start);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const weekNumber = Math.ceil(date.getDate() / 7);

    return {
      display: `${month} W${weekNumber} ${year}`,
      startDate: row.week_start
    };
  });
}

export async function getLoggedDaysByWeek(startDate: string): Promise<(LoggedDay | null)[]> {
  const db = await getDatabase();

  const results = await db.getAllAsync(
    `SELECT DISTINCT substr(createdAt, 1, 10) AS logged_day
     FROM log
     WHERE DATE(createdAt) BETWEEN DATE(?) AND DATE(?, '+4 days')
     ORDER BY logged_day ASC;`,
    [startDate, startDate]
  ) as { logged_day: string }[];

  const daysArray: (LoggedDay | null)[] = [null, null, null, null, null];

  results.forEach(row => {
    const loggedDate = new Date(row.logged_day);
    const dayOfWeek = loggedDate.getDay(); 

    const index = dayOfWeek - 1;

    if (index >= 0 && index <= 4) {
      daysArray[index] = {
        display: loggedDate.toLocaleDateString('en-US', { weekday: 'long' }),
        date: row.logged_day
      };
    }
  });

  return daysArray;
}
export async function getLoggedExercisesByDay(date: string): Promise<(Exercise | null)[]> {
  const db = await getDatabase();

  const results = await db.getAllAsync(
    `SELECT DISTINCT e.*
     FROM log l
     JOIN exercise e ON l.exerciseId = e.id
     WHERE date(l.createdAt) = date(?)
     ORDER BY e.orderNum ASC;`,
    [date]
  ) as Exercise[];

  const exercisesArray: (Exercise | null)[] = [null, null, null, null];

  results.forEach((exercise) => {
    const position = exercise.orderNum - 1; 
    if (position >= 0 && position < 4) {
      exercisesArray[position] = exercise;
    }
  });

  return exercisesArray;
}

export async function getLogsByExercise(date: string, exercise: Exercise): Promise<DayLogIds> {
  const db = await getDatabase();

  const results = await db.getAllAsync(
    `SELECT id, setNum, isLeft, reps FROM log 
     WHERE exerciseId = ? AND date(createdAt) = date(?)
     ORDER BY setNum ASC;`,
    [exercise.id, date]
  ) as { id: number; setNum: number; isLeft: boolean | null; reps: number }[];

  const dayLog = {
    left: exercise.isOneArm ? Array(4).fill({ id: null, reps: 0 }) : [],
    right: Array(4).fill({ id: null, reps: 0 })
  };

  results.forEach(log => {
    if (log.setNum >= 1 && log.setNum <= 4) {
      if (exercise.isOneArm) {
        if (log.isLeft) {
          dayLog.left[log.setNum - 1] = { id: log.id, reps: log.reps };
        } else {
          dayLog.right[log.setNum - 1] = { id: log.id, reps: log.reps };
        }
      } else {
        dayLog.right[log.setNum - 1] = { id: log.id, reps: log.reps };
      }
    }
  });

  return dayLog;
}

export async function getExerciseProgress(exercise: Exercise): Promise<ChartData | null> {
  const db = await getDatabase();

  const results = await db.getAllAsync(
    `SELECT createdAt, reps, weight 
     FROM log 
     WHERE exerciseId = ? 
     ORDER BY createdAt DESC;`,
    [exercise.id]
  ) as { createdAt: string; reps: number; weight: number }[];
  console.log(results)
  if (!results.length) return null;
  return null
 

  // const labels = results.map(row =>
  //   new Date(row.week_start).toLocaleString('en-US', { month: 'short' })
  // );
  // const datasets = [{ label: exercise.name, data: results.map(row => Math.min(row.total_reps, 10)), color: () => '#FF5733' }];

  // return { labels, datasets };
}

export async function updateLogs(dayLog: DayLogIds): Promise<void> {
  const db = await getDatabase();

  const updateQuery = `
    UPDATE log
    SET reps = ?
    WHERE id = ?;
  `;

  const updatePromises: Promise<any>[] = [];

  dayLog.left.forEach(log => {
    if (log.id !== null) {
      updatePromises.push(db.runAsync(updateQuery, [log.reps, log.id]));
    }
  });

  dayLog.right.forEach(log => {
    if (log.id !== null) {
      updatePromises.push(db.runAsync(updateQuery, [log.reps, log.id]));
    }
  });

  await Promise.all(updatePromises);
}

export async function destroyLogs(dayLog: DayLogIds): Promise<void> {
  const db = await getDatabase();

  const deleteQuery = `
    DELETE FROM log
    WHERE id = ?;
  `;

  const deletePromises: Promise<any>[] = [];

  dayLog.left.forEach(log => {
    if (log.id !== null) {
      deletePromises.push(db.runAsync(deleteQuery, [log.id]));
    }
  });

  dayLog.right.forEach(log => {
    if (log.id !== null) {
      deletePromises.push(db.runAsync(deleteQuery, [log.id]));
    }
  });

  await Promise.all(deletePromises);
}










export async function debugGetAllLogs() {
  const db = await getDatabase();

  const results = await db.getAllAsync(
    `SELECT * FROM log ORDER BY createdAt DESC;`
  );

  console.log("📋 Seeded Logs:", results);
}
