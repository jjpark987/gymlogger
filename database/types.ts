export interface Day {
  id: number;
  name: string;
}

export interface Exercise {
  id: number;
  dayId: number;
  name: string;
  isOneArm: boolean;
  weight: number;
  orderNum: number;
}

export interface NewExercise {
  name: string;
  isOneArm: boolean;
  weight: number;
}

export interface Log {
  id: number;
  exerciseId: number;
  weight: number;
  setNum: number;
  isLeft: boolean | null;
  reps: number;
  createdAt: string;
}

export interface LoggedWeek {
  display: string;
  startDate: string;
}

export interface LoggedDay {
  display: string;
  date: string;
}

export interface DayLog {
  left: number[];
  right: number[];
}

export type DayLogs = { [exerciseId: number]: DayLog };

export interface DayLogIds {
  left: { id: number | null; reps: number }[];
  right: { id: number | null; reps: number }[];
}

export type DayLogsIds = { [exerciseId: number]: DayLogIds };


interface ExerciseProgress {
  data: number[];
  color: () => string;
}

interface OneArmExerciseProgress {
  left: ExerciseProgress;
  right: ExerciseProgress;
}

export interface ChartData {
  labels: string[];
  datasets: ExerciseProgress[] | OneArmExerciseProgress[];
}
