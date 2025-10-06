import { getSetting, setSetting } from "@/database/database";
import { Day } from "@/database/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface DayContextValue {
  dayOfWeek: Day;
  restDaysMask: number;
  isWeekdayRest: (weekdayIndex: number) => boolean;
  toggleWeekdayRest: (weekdayIndex: number) => Promise<void>;
  isDateRest: (date: Date) => boolean;
}

const DayContext = createContext<DayContextValue>({
  dayOfWeek: { id: 0, name: "" },
  restDaysMask: 0,
  isWeekdayRest: () => false,
  toggleWeekdayRest: async () => {},
  isDateRest: () => false,
});

export function DayProvider({ children }: { children: ReactNode }) {
  const days: Day[] = [
    { id: 0, name: "Monday" },
    { id: 1, name: "Tuesday" },
    { id: 2, name: "Wednesday" },
    { id: 3, name: "Thursday" },
    { id: 4, name: "Friday" },
    { id: 5, name: "Saturday" },
    { id: 6, name: "Sunday" },
  ];

  const today = (new Date().getDay() + 6) % 7;
  const [dayOfWeek] = useState<Day>(days[today]);
  const [restDaysMask, setRestDaysMask] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getSetting("restDaysMask");
      const initial = stored !== null ? parseInt(stored, 10) : 0;
      if (!cancelled) {
        setRestDaysMask(Number.isFinite(initial) && initial >= 0 ? initial : 0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function isWeekdayRest(weekdayIndex: number): boolean {
    if (weekdayIndex < 0 || weekdayIndex > 4) return false;
    return ((restDaysMask >>> weekdayIndex) & 1) === 1;
  }

  function isDateRest(date: Date): boolean {
    const jsIdx = date.getDay();
    const appIdx = (jsIdx + 6) % 7;
    if (appIdx >= 5) return true;
    return isWeekdayRest(appIdx);
  }

  async function toggleWeekdayRest(weekdayIndex: number): Promise<void> {
    if (weekdayIndex < 0 || weekdayIndex > 4) return;
    setRestDaysMask((prev) => {
      const next = prev ^ (1 << weekdayIndex);
      setSetting("restDaysMask", String(next));
      return next;
    });
  }

  return (
    <DayContext.Provider
      value={{
        dayOfWeek,
        restDaysMask,
        isWeekdayRest,
        toggleWeekdayRest,
        isDateRest,
      }}
    >
      {children}
    </DayContext.Provider>
  );
}

export function useDay() {
  return useContext(DayContext);
}
