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

export interface DayLog {
  left: number[];
  right: number[];
}

export type DayLogs = { [exerciseId: number]: DayLog };
