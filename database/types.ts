export interface Day {
  id: number;
  name: string;
}

export interface Exercise {
  id: number;
  name: string;
  isOneArm: boolean;
}

export interface Log {
  id: number;
  exerciseId: number;
  weight: number;
  isLeft: boolean | null;
  setNum: number;
  reps: number;
  createdAt: string;
  updatedAt: string;
}
