import { getSetting, setSetting } from "@/database/database";
import { Day } from "@/database/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

const days: Day[] = [
  { id: 0, name: "Monday" },
  { id: 1, name: "Tuesday" },
  { id: 2, name: "Wednesday" },
  { id: 3, name: "Thursday" },
  { id: 4, name: "Friday" },
  { id: 5, name: "Saturday" },
  { id: 6, name: "Sunday" },
];

function getToday(): Day {
  return days[(new Date().getDay() + 6) % 7];
}

interface DayContextValue {
  dayOfWeek: Day;
  restDaysMask: number;
  isWeekdayRest: (weekdayIndex: number) => boolean;
  toggleWeekdayRest: (weekdayIndex: number) => Promise<void>;
  isDateRest: (date: Date) => boolean;
  restSettingsReady: boolean;
  restDaySaving: boolean;
}

const DayContext = createContext<DayContextValue>({
  dayOfWeek: { id: 0, name: "" },
  restDaysMask: 0,
  isWeekdayRest: () => false,
  toggleWeekdayRest: async () => {},
  isDateRest: () => false,
  restSettingsReady: false,
  restDaySaving: false,
});

export function DayProvider({ children }: { children: ReactNode }) {
  const [dayOfWeek, setDayOfWeek] = useState<Day>(getToday);
  const [restDaysMask, setRestDaysMask] = useState<number>(0);
  const [restSettingsReady, setRestSettingsReady] = useState(false);
  const [restDaySaving, setRestDaySaving] = useState(false);
  const restDaySavingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getSetting("restDaysMask");
      const initial = stored !== null ? parseInt(stored, 10) : 0;
      if (!cancelled) {
        setRestDaysMask(Number.isFinite(initial) && initial >= 0 ? initial : 0);
        setRestSettingsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setDayOfWeek(getToday());
      }
    });

    return () => subscription.remove();
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
    if (
      weekdayIndex < 0 ||
      weekdayIndex > 4 ||
      !restSettingsReady ||
      restDaySavingRef.current
    ) {
      return;
    }

    const next = restDaysMask ^ (1 << weekdayIndex);
    restDaySavingRef.current = true;
    setRestDaySaving(true);
    try {
      await setSetting("restDaysMask", String(next));
      setRestDaysMask(next);
    } finally {
      restDaySavingRef.current = false;
      setRestDaySaving(false);
    }
  }

  return (
    <DayContext.Provider
      value={{
        dayOfWeek,
        restDaysMask,
        isWeekdayRest,
        toggleWeekdayRest,
        isDateRest,
        restSettingsReady,
        restDaySaving,
      }}
    >
      {children}
    </DayContext.Provider>
  );
}

export function useDay() {
  return useContext(DayContext);
}
