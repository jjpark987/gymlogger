import { getDatabase } from "./database";
import {
  calculateWeeklyVolumes,
  createDatasets,
  generateWeeksAndLabels,
} from "./logUtils";
import {
  DayLogIds,
  DayLogs,
  Exercise,
  LoggedDay,
  LoggedWeek,
  LogResult,
  Progress,
} from "./types";

export async function setupLogTable() {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exerciseId INTEGER NOT NULL,
      weight REAL NOT NULL,
      setNum INTEGER NOT NULL CHECK (setNum BETWEEN 1 AND 3),
      isLeft INTEGER CHECK (isLeft IN (0, 1)),
      reps INTEGER NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (exerciseId) REFERENCES exercise(id) ON DELETE CASCADE
    );
  `);
}

export async function insertDayLogs(dayLogs: DayLogs): Promise<void> {
  const db = await getDatabase();
  const utcString = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (transaction) => {
    for (const exerciseId in dayLogs) {
      const log = dayLogs[exerciseId];
      const exercise = await transaction.getFirstAsync<Exercise>(
        `SELECT * FROM exercise WHERE id = ?`,
        [Number(exerciseId)],
      );

      if (!exercise) {
        throw new Error(`Exercise ${exerciseId} no longer exists.`);
      }

      const allSets = exercise.isOneArm
        ? [...log.left, ...log.right]
        : log.right;

      if (allSets.length !== (exercise.isOneArm ? 6 : 3)) {
        throw new Error(`Exercise ${exercise.name} is incomplete.`);
      }

      if (allSets.some((set) => set === "")) {
        throw new Error(`Exercise ${exercise.name} is incomplete.`);
      }

      if (allSets.every((set) => set === 10)) {
        await transaction.runAsync(
          `UPDATE exercise SET weight = ? WHERE id = ?`,
          [exercise.weight + exercise.increment, exercise.id],
        );
      }

      for (let i = 0; i < 3; i++) {
        if (exercise.isOneArm) {
          await transaction.runAsync(
            `INSERT INTO log (exerciseId, weight, setNum, isLeft, reps, createdAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [exercise.id, exercise.weight, i + 1, 1, log.left[i], utcString],
          );
          await transaction.runAsync(
            `INSERT INTO log (exerciseId, weight, setNum, isLeft, reps, createdAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [exercise.id, exercise.weight, i + 1, 0, log.right[i], utcString],
          );
        } else {
          await transaction.runAsync(
            `INSERT INTO log (exerciseId, weight, setNum, isLeft, reps, createdAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              exercise.id,
              exercise.weight,
              i + 1,
              null,
              log.right[i],
              utcString,
            ],
          );
        }
      }
    }
  });
}

export async function getLoggedWeeks(): Promise<LoggedWeek[] | null> {
  const db = await getDatabase();

  const results = (await db.getAllAsync(
    `SELECT datetime(createdAt, 'localtime') AS createdAt,
            reps,
            weight,
            isLeft,
            exerciseId
     FROM log
     ORDER BY createdAt DESC;`,
  )) as LogResult[];

  if (!results.length) return null;

  const loggedWeeks: LoggedWeek[] = [];

  const validResults = results.filter(
    ({ reps, weight }) => reps !== null && weight !== null,
  );

  validResults.forEach(({ createdAt }) => {
    const [year, month, day] = createdAt.slice(0, 10).split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayOfWeek = localDate.getDay();
    const dayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(year, month - 1, day + dayOffset);
    const weekKey = [
      weekStart.getFullYear(),
      String(weekStart.getMonth() + 1).padStart(2, "0"),
      String(weekStart.getDate()).padStart(2, "0"),
    ].join("-");

    if (!loggedWeeks.some((week) => week.startDate === weekKey)) {
      const monthAbbrev = weekStart.toLocaleString("en-US", { month: "short" });
      const year = weekStart.getFullYear();

      const dayOfMonth = weekStart.getDate();
      const firstDateOfMonth = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        1,
      );

      const firstMonday = new Date(firstDateOfMonth);
      const firstWeekday = firstDateOfMonth.getDay();
      const offsetToMonday =
        firstWeekday === 0 ? 1 : firstWeekday === 1 ? 0 : 8 - firstWeekday;
      firstMonday.setDate(firstDateOfMonth.getDate() + offsetToMonday);

      const daysSinceFirstMonday = dayOfMonth - firstMonday.getDate();
      const weekNumber =
        daysSinceFirstMonday >= 0
          ? Math.floor(daysSinceFirstMonday / 7) + 1
          : 1;

      loggedWeeks.push({
        display: `${monthAbbrev} W${weekNumber} ${year}`,
        startDate: weekKey,
      });
    }
  });

  return loggedWeeks;
}

export async function getLoggedDaysByWeek(
  startDate: string,
): Promise<(LoggedDay | null)[]> {
  const db = await getDatabase();

  const results = (await db.getAllAsync(
    `SELECT DISTINCT date(datetime(createdAt, 'localtime')) AS loggedDate
     FROM log
     WHERE date(datetime(createdAt, 'localtime')) BETWEEN date(?) AND date(?, '+4 days')
     ORDER BY loggedDate ASC;`,
    [startDate, startDate],
  )) as { loggedDate: string }[];

  const daysArray: (LoggedDay | null)[] = [null, null, null, null, null];

  results.forEach((day) => {
    const [year, month, date] = day.loggedDate.split("-").map(Number);
    const loggedDate = new Date(year, month - 1, date);
    const dayOfWeek = loggedDate.getDay();

    const index = dayOfWeek - 1;

    if (index >= 0 && index <= 4) {
      daysArray[index] = {
        display: loggedDate.toLocaleDateString("en-US", {
          weekday: "long",
        }),
        date: day.loggedDate,
      };
    }
  });

  return daysArray;
}

export async function getLoggedExercisesByDate(
  date: string,
): Promise<(Exercise | null)[]> {
  const db = await getDatabase();

  const results = (await db.getAllAsync(
    `SELECT DISTINCT e.*
    FROM log l
    JOIN exercise e ON l.exerciseId = e.id
    WHERE date(datetime(l.createdAt, 'localtime')) = date(?)
    ORDER BY e.orderNum ASC;`,
    [date],
  )) as Exercise[];

  const exercisesArray: (Exercise | null)[] = [null, null, null, null, null];

  results.forEach((exercise) => {
    const position = exercise.orderNum - 1;
    if (position >= 0 && position < 5) {
      exercisesArray[position] = exercise;
    }
  });

  return exercisesArray;
}

export async function getLogsByExercise(
  date: string,
  exercise: Exercise,
): Promise<DayLogIds> {
  const db = await getDatabase();

  const results = (await db.getAllAsync(
    `SELECT id, setNum, isLeft, reps, weight FROM log
    WHERE exerciseId = ? AND date(datetime(createdAt, 'localtime')) = date(?)
    ORDER BY setNum ASC;`,
    [exercise.id, date],
  )) as {
    id: number;
    setNum: number;
    isLeft: boolean | null;
    reps: number;
    weight: number;
  }[];

  const dayLog = {
    left: exercise.isOneArm ? Array(3).fill({ id: null, reps: 0 }) : [],
    right: Array(3).fill({ id: null, reps: 0 }),
    weight: results[0]?.weight,
  };

  results.forEach((log) => {
    if (log.setNum >= 1 && log.setNum <= 3) {
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

export async function getExerciseProgress(
  exercise: Exercise,
): Promise<Progress | null> {
  const db = await getDatabase();

  const results = (await db.getAllAsync(
    `SELECT datetime(createdAt, 'localtime') as createdAt, reps, weight, isLeft FROM log
    WHERE exerciseId = ?
      AND strftime('%w', datetime(createdAt, 'localtime')) BETWEEN '1' AND '5'
    ORDER BY createdAt ASC;`,
    [exercise.id],
  )) as LogResult[];

  if (!results.length) return null;

  const weeklyVolumes = calculateWeeklyVolumes(results, exercise);

  const weeksAndLabels = generateWeeksAndLabels();

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

  dayLog.left.forEach((log) => {
    if (log.id !== null) {
      updatePromises.push(db.runAsync(updateQuery, [log.reps, log.id]));
    }
  });

  dayLog.right.forEach((log) => {
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

  dayLog.left.forEach((log) => {
    if (log.id !== null) {
      deletePromises.push(db.runAsync(deleteQuery, [log.id]));
    }
  });

  dayLog.right.forEach((log) => {
    if (log.id !== null) {
      deletePromises.push(db.runAsync(deleteQuery, [log.id]));
    }
  });

  await Promise.all(deletePromises);
}
