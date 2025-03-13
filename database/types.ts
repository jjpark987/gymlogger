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

export interface Log {
  id: number;
  exerciseId: number;
  weight: number;
  setNum: number;
  isLeft: boolean | null;
  reps: number;
  createdAt: string;
}
