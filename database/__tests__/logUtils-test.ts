import {
  calculateWeeklyVolumes,
  createDatasets,
  generateWeeksAndLabels,
} from "../logUtils";
import { Exercise } from "../types";

const oneLimbExercise: Exercise = {
  id: 1,
  dayId: 0,
  name: "Dumbbell Curl",
  isOneArm: true,
  weight: 25,
  increment: 2.5,
  orderNum: 1,
};

describe("logUtils", () => {
  it("calculates weekly one-limb volume from logged reps and weight", () => {
    const volumes = calculateWeeklyVolumes(
      [
        {
          createdAt: "2026-09-14 23:30:00",
          reps: 10,
          weight: 20,
          isLeft: true,
        },
        {
          createdAt: "2026-09-14 23:30:00",
          reps: 8,
          weight: 20,
          isLeft: false,
        },
      ],
      oneLimbExercise,
    );

    expect(volumes).toEqual({
      "2026-09-14": { l_volume: 200, r_volume: 160 },
    });
  });

  it("uses the previous Monday for a Sunday across a year boundary", () => {
    const result = generateWeeksAndLabels(new Date(2027, 0, 3, 12));

    expect(result.lastFiveWeeks).toEqual([
      "2026-11-30",
      "2026-12-07",
      "2026-12-14",
      "2026-12-21",
      "2026-12-28",
    ]);
    result.lastFiveWeeks.forEach((week) => {
      const [year, month, day] = week.split("-").map(Number);
      expect(new Date(year, month - 1, day).getDay()).toBe(1);
    });
  });

  it("hides missing weeks and breaks chart lines around gaps", () => {
    const progress = createDatasets(
      {
        "2026-09-07": { volume: 100 },
        "2026-09-21": { volume: 300 },
      },
      {
        lastFiveWeeks: ["2026-09-07", "2026-09-14", "2026-09-21"],
        labels: ["Sep W1 2026", "Sep W2 2026", "Sep W3 2026"],
      },
      { ...oneLimbExercise, isOneArm: false },
    );

    expect(progress.datasets[0].data).toEqual([
      { label: "Sep W1 2026", value: 100, hideDataPoint: false },
      { label: "Sep W2 2026", value: undefined, hideDataPoint: true },
      { label: "Sep W3 2026", value: 300, hideDataPoint: false },
    ]);
    expect(progress.datasets[0].lineSegments).toEqual([
      { startIndex: 0, endIndex: 1, color: "transparent" },
      { startIndex: 1, endIndex: 2, color: "transparent" },
    ]);
  });
});
