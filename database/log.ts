import { getDatabase } from './database';
import { DayLogIds, DayLogs, Exercise, LoggedDay, LoggedWeek, Progress, WeeklyVolumes } from './types';

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
    `SELECT DISTINCT strftime('%Y-%m-%d', date(createdAt, 'weekday 1')) AS weekStartDate
    FROM log
    ORDER BY weekStartDate DESC`
  ) as { weekStartDate: string }[];

  if (!results.length) return null;

  const loggedWeeks: LoggedWeek[] = results.map(week => {
    const weekStartDate = new Date(week.weekStartDate);

    const dayOfMonth = weekStartDate.getDate();
    const firstDateOfMonth = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), 1);
    const firstDayWeekDay = firstDateOfMonth.getDay() || 7; 

    const weekNumber = Math.ceil((dayOfMonth + firstDayWeekDay - 1) / 7);
    const monthAbbrev = weekStartDate.toLocaleString('en-US', { month: 'short' });
    
    return {
      display: `${monthAbbrev} W${weekNumber} ${weekStartDate.getFullYear()}`,
      startDate: week.weekStartDate
    };
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

export async function getExerciseProgress(exercise: Exercise): Promise<Progress | null> {
  const db = await getDatabase();

  const results = await db.getAllAsync(
    `SELECT createdAt, reps, weight, isLeft FROM log
     WHERE exerciseId = ? 
       AND strftime('%w', createdAt) BETWEEN '1' AND '5'
     ORDER BY createdAt ASC;`,
    [exercise.id]
  ) as { createdAt: string; reps: number; weight: number; isLeft: boolean }[];

  if (!results.length) return null;

  const weeklyVolumes: WeeklyVolumes = {};

  results.forEach(({ createdAt, reps, weight, isLeft }) => {
    const weekStart = new Date(createdAt);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyVolumes[weekKey]) {
      weeklyVolumes[weekKey] = exercise.isOneArm ? { l_volume: 0, r_volume: 0 } : { volume: 0 };
    }

    if (exercise.isOneArm) {
      if (isLeft) {
        weeklyVolumes[weekKey]!.l_volume! += reps * weight;
      } else {
        weeklyVolumes[weekKey]!.r_volume! += reps * weight;
      }
    } else {
      weeklyVolumes[weekKey]!.volume! += reps * weight;
    }
  });

  const weeks = Object.keys(weeklyVolumes).sort();
  const lastValidWeek = weeks.length > 0 ? weeks[weeks.length - 1] : null; 

  if (!lastValidWeek) return null;

  const lastFiveWeeks: string[] = [];

  const today = new Date();
  const latestExpectedWeek = new Date(today);
  latestExpectedWeek.setDate(today.getDate() - today.getDay() + 1);

  for (let i = 4; i >= 0; i--) {
    const week = new Date(latestExpectedWeek);
    week.setDate(latestExpectedWeek.getDate() - i * 7);
    lastFiveWeeks.push(week.toISOString().split('T')[0]);
  }

  const labels = lastFiveWeeks.map((week, index) => {
    const referenceDate = week !== null ? new Date(week) : (lastFiveWeeks[index - 1] ? new Date(lastFiveWeeks[index - 1]!) : new Date());    
    referenceDate.setDate(referenceDate.getDate() + 7); 
  
    const month = referenceDate.toLocaleString('en-US', { month: 'short' });
    const year = referenceDate.getFullYear();
  
    const firstMonday = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    while (firstMonday.getDay() !== 1) {
      firstMonday.setDate(firstMonday.getDate() + 1);
    }
  
    const weekNumber = Math.ceil((referenceDate.getDate() - firstMonday.getDate() + 1) / 7) + 1;
  
    return `${month} W${weekNumber} ${year}`;
  });

  const datasets = exercise.isOneArm
    ? [
        {
          data: lastFiveWeeks.map((week, index) => ({
            label: labels[index],
            value: weeklyVolumes[week]?.l_volume,
            hideDataPoint: !(week in weeklyVolumes), 
          })),
          lineSegments: lastFiveWeeks.reduce((segments, week, index, arr) => {
            if (index > 0 && !(week in weeklyVolumes)) {
              segments.push({ startIndex: index - 1, endIndex: index, color: 'transparent' });
            }
            if (index < arr.length - 1 && !(week in weeklyVolumes)) {
              segments.push({ startIndex: index, endIndex: index + 1, color: 'transparent' });
            }
            return segments;
          }, [] as { startIndex: number; endIndex: number; color: string }[])
        },
        {
          data: lastFiveWeeks.map((week, index) => ({
            label: labels[index],
            value: weeklyVolumes[week]?.r_volume,
            hideDataPoint: !(week in weeklyVolumes),
          })),
          lineSegments: lastFiveWeeks.reduce((segments, week, index, arr) => {
            if (index > 0 && !(week in weeklyVolumes)) {
              segments.push({ startIndex: index - 1, endIndex: index, color: 'transparent' });
            }
            if (index < arr.length - 1 && !(week in weeklyVolumes)) {
              segments.push({ startIndex: index, endIndex: index + 1, color: 'transparent' });
            }
            return segments;
          }, [] as { startIndex: number; endIndex: number; color: string }[])
        }
      ]
    : [
        {
          data: lastFiveWeeks.map((week, index) => ({
            label: labels[index],
            value: weeklyVolumes[week]?.volume, 
            hideDataPoint: !(week in weeklyVolumes), 
          })),
          lineSegments: lastFiveWeeks.reduce((segments, week, index, arr) => {
            if (index > 0 && !(week in weeklyVolumes)) {
              segments.push({ startIndex: index - 1, endIndex: index, color: 'transparent' });
            }
            if (index < arr.length - 1 && !(week in weeklyVolumes)) {
              segments.push({ startIndex: index, endIndex: index + 1, color: 'transparent' });
            }
            return segments;
          }, [] as { startIndex: number; endIndex: number; color: string }[])
        }
      ];

  return { datasets };
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

  console.log('📋 Seeded Logs:', results);
}
