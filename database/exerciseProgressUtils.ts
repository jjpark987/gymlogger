import { Exercise, LogResult, Progress, WeeklyVolumes, WeeksAndLabels } from './types';

export function calculateWeeklyVolumes(results: LogResult[], exercise: Exercise) {
  const weeklyVolumes: WeeklyVolumes = {};

  const validResults = results.filter(({ reps, weight }) => reps !== null && weight !== null) as { createdAt: string; reps: number; weight: number; isLeft: boolean }[];

  validResults.forEach(({ createdAt, reps, weight, isLeft }) => {
    const weekStart = new Date(createdAt);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyVolumes[weekKey]) {
      weeklyVolumes[weekKey] = exercise.isOneArm ? { l_volume: 0, r_volume: 0 } : { volume: 0 };
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

export function generateWeeksAndLabels(): WeeksAndLabels | null {
  const today = new Date();
  const latestExpectedWeek = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - today.getUTCDay() + 1));

  const lastFiveWeeks: string[] = [];
  const labels: string[] = [];
  
  for (let i = 4; i >= 0; i--) {
    const weekStart = new Date(latestExpectedWeek);
    weekStart.setDate(latestExpectedWeek.getDate() - i * 7);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    lastFiveWeeks.push(weekKey);
  
    const dayOfMonth = weekStart.getDate();
    const firstDateOfMonth = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
    const firstDayWeekDay = firstDateOfMonth.getDay() || 7;
  
    const weekNumber = Math.ceil((dayOfMonth + firstDayWeekDay - 1) / 7); 
    const monthAbbrev = weekStart.toLocaleString('en-US', { month: 'short' });
  
    labels.push(`${monthAbbrev} W${weekNumber} ${weekStart.getFullYear()}`);
  }

  return { lastFiveWeeks, labels };
}

export function createDatasets(weeklyVolumes: WeeklyVolumes, weeksAndLabels: WeeksAndLabels, exercise: Exercise): Progress {
  const datasets = exercise.isOneArm
    ? [
        {
          data: weeksAndLabels.lastFiveWeeks.map((week, index) => ({
            label: weeksAndLabels.labels[index],
            value: weeklyVolumes[week]?.l_volume,
            hideDataPoint: !(week in weeklyVolumes), 
          })),
          lineSegments: weeksAndLabels.lastFiveWeeks.reduce((segments, week, index, arr) => {
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
          data: weeksAndLabels.lastFiveWeeks.map((week, index) => ({
            label: weeksAndLabels.labels[index],
            value: weeklyVolumes[week]?.r_volume,
            hideDataPoint: !(week in weeklyVolumes),
          })),
          lineSegments: weeksAndLabels.lastFiveWeeks.reduce((segments, week, index, arr) => {
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
          data: weeksAndLabels.lastFiveWeeks.map((week, index) => ({
            label: weeksAndLabels.labels[index],
            value: weeklyVolumes[week]?.volume, 
            hideDataPoint: !(week in weeklyVolumes), 
          })),
          lineSegments: weeksAndLabels.lastFiveWeeks.reduce((segments, week, index, arr) => {
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
