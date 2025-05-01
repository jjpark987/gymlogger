import { getDatabase } from './database';
import { calculateWeeklyVolumes, createDatasets, generateWeeksAndLabels } from './logUtils';
import { DayLogIds, DayLogs, Exercise, LoggedDay, LoggedWeek, LogResult, Progress } from './types';

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

export async function insertDayLogs(dayLogs: DayLogs): Promise<void> {
  const db = await getDatabase();

  const insertQuery = `
    INSERT INTO log (exerciseId, weight, setNum, isLeft, reps, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const utcString = new Date().toISOString();

  const insertPromises = [];

  for (const exerciseId in dayLogs) {
    const log = dayLogs[exerciseId];
    const exercise: Exercise | null = await db.getFirstAsync(
      `SELECT * FROM exercise WHERE id = ?`,
      [Number(exerciseId)]
    );

    if (!exercise) continue;

    if (log.left.some(set => set === '') || log.right.some(set => set === '')) continue;

    const allSets = exercise.isOneArm
      ? [...log.left, ...log.right]
      : log.right;

    if (allSets.every(set => set === 10)) {
      const newWeight = exercise.weight + exercise.increment;

      await db.runAsync(
        `UPDATE exercise SET weight = ? WHERE id = ?`,
        [newWeight, exerciseId]
      );
    }

    for (let i = 0; i < 4; i++) {
      if (exercise.isOneArm) {
        if (log.left[i] !== undefined) {
          insertPromises.push(
            db.runAsync(insertQuery, [exerciseId, exercise.weight, i + 1, true, log.left[i] === '' ? null : log.left[i], utcString])
          );
        }
        if (log.right[i] !== undefined) {
          insertPromises.push(
            db.runAsync(insertQuery, [exerciseId, exercise.weight, i + 1, false, log.right[i] === '' ? null : log.right[i], utcString])
          );
        }
      } else {
        if (log.right[i] !== undefined) {
          insertPromises.push(
            db.runAsync(insertQuery, [exerciseId, exercise.weight, i + 1, null, log.right[i] === '' ? null : log.right[i], utcString])
          );
        }
      }
    }
  }

  await Promise.all(insertPromises);
}

export async function getLoggedWeeks(): Promise<LoggedWeek[] | null> {
  const db = await getDatabase();

  const results = await db.getAllAsync(
    `SELECT createdAt, reps, weight, isLeft, exerciseId FROM log ORDER BY createdAt DESC;`
  ) as LogResult[];

  if (!results.length) return null;

  const loggedWeeks: LoggedWeek[] = [];

  const validResults = results.filter(({ reps, weight }) => reps !== null && weight !== null);

  validResults.forEach(({ createdAt }) => {
    const utcDate = new Date(createdAt);

    const dayOfWeek = utcDate.getDay();
    const dayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const weekStart = new Date(utcDate);
    weekStart.setDate(utcDate.getDate() + dayOffset);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!loggedWeeks.some(week => week.startDate === weekKey)) {
      const monthAbbrev = weekStart.toLocaleString('en-US', { month: 'short' });
      const year = weekStart.getFullYear();

      const dayOfMonth = weekStart.getDate();
      const firstDateOfMonth = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);

      const firstMonday = new Date(firstDateOfMonth);
      const firstWeekday = firstDateOfMonth.getDay();
      const offsetToMonday = firstWeekday === 0 ? 1 : (firstWeekday === 1 ? 0 : 8 - firstWeekday);
      firstMonday.setDate(firstDateOfMonth.getDate() + offsetToMonday);
      
      const daysSinceFirstMonday = dayOfMonth - firstMonday.getDate();
      const weekNumber = daysSinceFirstMonday >= 0 ? Math.floor(daysSinceFirstMonday / 7) + 1 : 1;

      loggedWeeks.push({
        display: `${monthAbbrev} W${weekNumber} ${year}`,
        startDate: weekKey
      });
    }
  });

  return loggedWeeks;
}

export async function getLoggedDaysByWeek(startDate: string): Promise<(LoggedDay | null)[]> {
  const db = await getDatabase();

  const results = await db.getAllAsync(
    `SELECT DISTINCT date(createdAt) AS loggedDate
     FROM log
     WHERE date(createdAt) BETWEEN date(?, 'weekday 1') AND date(?, 'weekday 5')
     ORDER BY loggedDate ASC;`,
    [startDate, startDate]
  ) as { loggedDate: string }[];

  const daysArray: (LoggedDay | null)[] = [null, null, null, null, null];

  results.forEach(day => {
    const loggedDate = new Date(day.loggedDate);
    const dayOfWeek = loggedDate.getUTCDay();

    const index = dayOfWeek - 1;

    if (index >= 0 && index <= 4) {
      daysArray[index] = {
        display: loggedDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }),
        date: day.loggedDate
      };
    }
  });

  return daysArray;
}

export async function getLoggedExercisesByDate(date: string): Promise<(Exercise | null)[]> {
  const db = await getDatabase();

  const results = await db.getAllAsync(
    `SELECT DISTINCT e.*
    FROM log l
    JOIN exercise e ON l.exerciseId = e.id
    WHERE DATE(l.createdAt) = ?
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
    `SELECT id, setNum, isLeft, reps, weight, datetime(createdAt, 'localtime') as createdAt FROM log 
    WHERE exerciseId = ? AND date(datetime(createdAt, 'localtime')) = date(?)
    ORDER BY setNum ASC;`,
    [exercise.id, date]
  ) as { id: number; setNum: number; isLeft: boolean | null; reps: number; weight: number }[];

  const dayLog = {
    left: exercise.isOneArm ? Array(4).fill({ id: null, reps: 0 }) : [],
    right: Array(4).fill({ id: null, reps: 0 }),
    weight: results[0]?.weight
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

export async function getExerciseProgress(exercise: Exercise): Promise<Progress | null> {
  const db = await getDatabase();

  const results = await db.getAllAsync(
    `SELECT datetime(createdAt, 'localtime') as createdAt, reps, weight, isLeft FROM log
    WHERE exerciseId = ? AND strftime('%w', createdAt) BETWEEN '1' AND '5'
    ORDER BY createdAt ASC;`,
    [exercise.id]
  ) as LogResult[];

  if (!results.length) return null;

  const weeklyVolumes = calculateWeeklyVolumes(results, exercise);

  const weeksAndLabels = generateWeeksAndLabels();

  if (weeksAndLabels === null) return null;

  const datasets = createDatasets(weeklyVolumes, weeksAndLabels, exercise);

  return datasets;
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
