import { createContext, useContext, useState, ReactNode } from 'react';
import { Day } from '@/database/types';

const DayContext = createContext<{ dayOfWeek: Day }>({ dayOfWeek: { id: 0, name: '' } });

export function DayProvider({ children }: { children: ReactNode }) {
  const days: Day[] = [
    { id: 0, name: 'Monday' },
    { id: 1, name: 'Tuesday' },
    { id: 2, name: 'Wednesday' },
    { id: 3, name: 'Thursday' },
    { id: 4, name: 'Friday' },
    { id: 5, name: 'Saturday' },
    { id: 6, name: 'Sunday' },
  ];

  const today = (new Date().getDay() + 6) % 7; 

  const [dayOfWeek] = useState<Day>(days[today]);

  return <DayContext.Provider value={{ dayOfWeek }}>{children}</DayContext.Provider>;
}

export function useDay() {
  return useContext(DayContext);
}
