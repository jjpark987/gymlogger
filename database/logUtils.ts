import {
  Exercise,
  LogResult,
  Progress,
  WeeklyVolumes,
  WeeksAndLabels,
} from "./types";

export function calculateWeeklyVolumes(
  results: LogResult[],
  exercise: Exercise,
) {
  const weeklyVolumes: WeeklyVolumes = {};

  const validResults = results.filter(
    ({ reps, weight }) => reps !== null && weight !== null,
  ) as { createdAt: string; reps: number; weight: number; isLeft: boolean }[];

  validResults.forEach(({ createdAt, reps, weight, isLeft }) => {
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

    if (!weeklyVolumes[weekKey]) {
      weeklyVolumes[weekKey] = exercise.isOneArm
        ? { l_volume: 0, r_volume: 0 }
        : { volume: 0 };
    }

    if (exercise.isOneArm) {
      if (isLeft) {
        weeklyVolumes[weekKey].l_volume! += reps * weight;
      } else {
        weeklyVolumes[weekKey].r_volume! += reps * weight;
      }
    } else {
      weeklyVolumes[weekKey].volume! += reps * weight;
    }
  });

  return weeklyVolumes;
}

export function generateWeeksAndLabels(today = new Date()): WeeksAndLabels {
  const dayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay();
  const latestExpectedWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + dayOffset,
  );

  const lastFiveWeeks: string[] = [];
  const labels: string[] = [];

  for (let i = 4; i >= 0; i--) {
    const weekStart = new Date(latestExpectedWeek);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekKey = [
      weekStart.getFullYear(),
      String(weekStart.getMonth() + 1).padStart(2, "0"),
      String(weekStart.getDate()).padStart(2, "0"),
    ].join("-");

    lastFiveWeeks.push(weekKey);

    const dayOfMonth = weekStart.getDate();
    const firstDateOfMonth = new Date(
      weekStart.getFullYear(),
      weekStart.getMonth(),
      1,
    );
    const firstWeekday = firstDateOfMonth.getDay();
    const offsetToMonday =
      firstWeekday === 0 ? 1 : firstWeekday === 1 ? 0 : 8 - firstWeekday;
    const firstMonday = 1 + offsetToMonday;
    const weekNumber =
      dayOfMonth >= firstMonday
        ? Math.floor((dayOfMonth - firstMonday) / 7) + 1
        : 1;
    const monthAbbrev = weekStart.toLocaleString("en-US", { month: "short" });

    labels.push(`${monthAbbrev} W${weekNumber} ${weekStart.getFullYear()}`);
  }

  return { lastFiveWeeks, labels };
}

export function createDatasets(
  weeklyVolumes: WeeklyVolumes,
  weeksAndLabels: WeeksAndLabels,
  exercise: Exercise,
): Progress {
  const datasets = exercise.isOneArm
    ? [
        {
          data: weeksAndLabels.lastFiveWeeks.map((week, index) => ({
            label: weeksAndLabels.labels[index],
            value: weeklyVolumes[week]?.l_volume,
            hideDataPoint: !(week in weeklyVolumes),
          })),
          lineSegments: weeksAndLabels.lastFiveWeeks.reduce(
            (segments, week, index, arr) => {
              if (index > 0 && !(week in weeklyVolumes)) {
                segments.push({
                  startIndex: index - 1,
                  endIndex: index,
                  color: "transparent",
                });
              }
              if (index < arr.length - 1 && !(week in weeklyVolumes)) {
                segments.push({
                  startIndex: index,
                  endIndex: index + 1,
                  color: "transparent",
                });
              }
              return segments;
            },
            [] as { startIndex: number; endIndex: number; color: string }[],
          ),
        },
        {
          data: weeksAndLabels.lastFiveWeeks.map((week, index) => ({
            label: weeksAndLabels.labels[index],
            value: weeklyVolumes[week]?.r_volume,
            hideDataPoint: !(week in weeklyVolumes),
          })),
          lineSegments: weeksAndLabels.lastFiveWeeks.reduce(
            (segments, week, index, arr) => {
              if (index > 0 && !(week in weeklyVolumes)) {
                segments.push({
                  startIndex: index - 1,
                  endIndex: index,
                  color: "transparent",
                });
              }
              if (index < arr.length - 1 && !(week in weeklyVolumes)) {
                segments.push({
                  startIndex: index,
                  endIndex: index + 1,
                  color: "transparent",
                });
              }
              return segments;
            },
            [] as { startIndex: number; endIndex: number; color: string }[],
          ),
        },
      ]
    : [
        {
          data: weeksAndLabels.lastFiveWeeks.map((week, index) => ({
            label: weeksAndLabels.labels[index],
            value: weeklyVolumes[week]?.volume,
            hideDataPoint: !(week in weeklyVolumes),
          })),
          lineSegments: weeksAndLabels.lastFiveWeeks.reduce(
            (segments, week, index, arr) => {
              if (index > 0 && !(week in weeklyVolumes)) {
                segments.push({
                  startIndex: index - 1,
                  endIndex: index,
                  color: "transparent",
                });
              }
              if (index < arr.length - 1 && !(week in weeklyVolumes)) {
                segments.push({
                  startIndex: index,
                  endIndex: index + 1,
                  color: "transparent",
                });
              }
              return segments;
            },
            [] as { startIndex: number; endIndex: number; color: string }[],
          ),
        },
      ];

  return { datasets };
}
